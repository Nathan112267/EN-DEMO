from __future__ import annotations

import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from backend.engines.base import EngineConfigurationError
from backend.engines.external_vsr import ExternalVSREngine


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def default_fixed_command_model_path(dataset_root: Path) -> Path:
    override = os.getenv("LIPREAD_FIXED_COMMAND_MODEL")
    if override:
        return Path(override).expanduser().resolve()
    return (dataset_root / "fixed_command_model.json").resolve()


def _normalize_text(text: str) -> str:
    return re.sub(r"[，。！？、,.!?:：；;\"'“”‘’（）()【】\-[\]\s]", "", text or "").strip()


def _levenshtein_distance(a: str, b: str) -> int:
    rows = len(a) + 1
    cols = len(b) + 1
    table = [[0] * cols for _ in range(rows)]

    for row in range(rows):
        table[row][0] = row
    for col in range(cols):
        table[0][col] = col

    for row in range(1, rows):
        for col in range(1, cols):
            substitution_cost = 0 if a[row - 1] == b[col - 1] else 1
            table[row][col] = min(
                table[row - 1][col] + 1,
                table[row][col - 1] + 1,
                table[row - 1][col - 1] + substitution_cost,
            )

    return table[-1][-1]


def _character_overlap_score(a: str, b: str) -> float:
    counts: dict[str, int] = {}
    for character in a:
        counts[character] = counts.get(character, 0) + 1

    overlap = 0
    for character in b:
        count = counts.get(character, 0)
        if count > 0:
            overlap += 1
            counts[character] = count - 1

    return overlap / max(len(a), len(b), 1)


def _bigram_score(a: str, b: str) -> float:
    if len(a) <= 1 or len(b) <= 1:
        return 1.0 if a == b and a else 0.0

    grams_a = {a[index : index + 2] for index in range(len(a) - 1)}
    grams_b = {b[index : index + 2] for index in range(len(b) - 1)}
    if not grams_a or not grams_b:
        return 0.0

    intersection = len(grams_a & grams_b)
    union = len(grams_a | grams_b)
    return intersection / max(union, 1)


def transcript_similarity(left: str, right: str) -> float:
    normalized_left = _normalize_text(left)
    normalized_right = _normalize_text(right)
    if not normalized_left or not normalized_right:
        return 0.0

    max_length = max(len(normalized_left), len(normalized_right), 1)
    edit_score = 1.0 - _levenshtein_distance(normalized_left, normalized_right) / max_length
    overlap_score = _character_overlap_score(normalized_left, normalized_right)
    bigram_score = _bigram_score(normalized_left, normalized_right)
    contains_bonus = (
        0.08
        if normalized_left in normalized_right or normalized_right in normalized_left
        else 0.0
    )

    score = (
        edit_score * 0.42
        + overlap_score * 0.24
        + bigram_score * 0.26
        + contains_bonus
    )
    return max(0.0, min(1.0, score))


def _phrase_lookup(examples: list[dict[str, Any]]) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for example in examples:
        phrase_id = str(example["phrase_id"])
        if phrase_id not in lookup:
            lookup[phrase_id] = str(example["phrase_text"])
    return lookup


def predict_phrase(
    transcript: str,
    examples: list[dict[str, Any]],
    *,
    k: int = 5,
) -> dict[str, Any]:
    if not examples:
        raise ValueError("examples must not be empty")

    scored_examples: list[dict[str, Any]] = []
    for example in examples:
        similarity = transcript_similarity(transcript, str(example["raw_transcript"]))
        scored_examples.append(
            {
                "sample_id": example["sample_id"],
                "phrase_id": example["phrase_id"],
                "phrase_text": example["phrase_text"],
                "raw_transcript": example["raw_transcript"],
                "similarity": similarity,
            }
        )

    scored_examples.sort(key=lambda item: item["similarity"], reverse=True)
    top_examples = scored_examples[: max(1, k)]

    votes: dict[str, float] = defaultdict(float)
    for index, example in enumerate(top_examples):
        votes[str(example["phrase_id"])] += example["similarity"] * (1.0 / (1.0 + index * 0.18))

    ranked_votes = sorted(votes.items(), key=lambda item: item[1], reverse=True)
    phrase_lookup = _phrase_lookup(examples)
    best_phrase_id, best_vote = ranked_votes[0]
    total_vote = sum(votes.values()) or 1.0

    return {
        "phrase_id": best_phrase_id,
        "phrase_text": phrase_lookup.get(best_phrase_id, best_phrase_id),
        "confidence": best_vote / total_vote,
        "top_phrase_scores": [
            {
                "phrase_id": phrase_id,
                "phrase_text": phrase_lookup.get(phrase_id, phrase_id),
                "score": score,
            }
            for phrase_id, score in ranked_votes
        ],
        "matched_examples": top_examples[:3],
    }


def _evaluate_examples(
    examples: list[dict[str, Any]],
    *,
    k_values: tuple[int, ...] = (1, 3, 5, 7),
) -> dict[str, Any]:
    metrics_by_k: dict[str, Any] = {}

    for k in k_values:
        total = len(examples)
        correct = 0
        per_phrase_total: Counter[str] = Counter()
        per_phrase_correct: Counter[str] = Counter()
        confusion: dict[str, Counter[str]] = defaultdict(Counter)

        for index, example in enumerate(examples):
            others = examples[:index] + examples[index + 1 :]
            if not others:
                continue

            prediction = predict_phrase(str(example["raw_transcript"]), others, k=k)
            expected_phrase_id = str(example["phrase_id"])
            predicted_phrase_id = str(prediction["phrase_id"])

            per_phrase_total[expected_phrase_id] += 1
            confusion[expected_phrase_id][predicted_phrase_id] += 1
            if expected_phrase_id == predicted_phrase_id:
                correct += 1
                per_phrase_correct[expected_phrase_id] += 1

        metrics_by_k[str(k)] = {
            "accuracy": correct / max(total, 1),
            "correct": correct,
            "total": total,
            "per_phrase_accuracy": {
                phrase_id: per_phrase_correct[phrase_id] / max(count, 1)
                for phrase_id, count in sorted(per_phrase_total.items())
            },
            "confusion": {
                phrase_id: dict(sorted(targets.items()))
                for phrase_id, targets in sorted(confusion.items())
            },
        }

    best_k = max(
        (int(key) for key in metrics_by_k.keys()),
        key=lambda key: (
            metrics_by_k[str(key)]["accuracy"],
            -key,
        ),
    )

    return {
        "by_k": metrics_by_k,
        "best_k": best_k,
        "best_accuracy": metrics_by_k[str(best_k)]["accuracy"],
    }


def _load_existing_cache(model_path: Path) -> dict[str, dict[str, Any]]:
    if not model_path.exists():
        return {}

    try:
        payload = json.loads(model_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}

    examples = payload.get("examples", [])
    return {
        str(example["sample_id"]): example
        for example in examples
        if example.get("sample_id") and example.get("raw_transcript")
    }


def load_fixed_command_artifact(model_path: Path) -> dict[str, Any]:
    return json.loads(model_path.read_text(encoding="utf-8"))


def should_activate_fixed_command_model(
    model_path: Path,
    *,
    min_accuracy: Optional[float] = None,
) -> bool:
    model_path = model_path.expanduser().resolve()
    if not model_path.exists():
        return False

    if min_accuracy is None:
        min_accuracy = float(os.getenv("LIPREAD_FIXED_COMMAND_MIN_ACCURACY", "0.55"))

    artifact = load_fixed_command_artifact(model_path)
    best_accuracy = float(artifact.get("metrics", {}).get("best_accuracy") or 0.0)
    return best_accuracy >= min_accuracy


def train_fixed_command_classifier(
    dataset_root: Path,
    *,
    model_path: Optional[Path] = None,
) -> dict[str, Any]:
    dataset_root = dataset_root.expanduser().resolve()
    manifest_path = dataset_root / "manifest.json"
    if not manifest_path.exists():
        raise FileNotFoundError(f"未找到数据集 manifest: {manifest_path}")

    model_path = (model_path or default_fixed_command_model_path(dataset_root)).expanduser().resolve()
    model_path.parent.mkdir(parents=True, exist_ok=True)

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    samples = manifest.get("samples", [])
    if not samples:
        raise RuntimeError("数据集为空，至少先录几条样本。")

    existing_cache = _load_existing_cache(model_path)
    engine = ExternalVSREngine()
    engine_status = engine.status()
    if not engine_status.ready:
        raise EngineConfigurationError("; ".join(engine_status.details.get("blockers", [])))

    examples: list[dict[str, Any]] = []
    failed_samples: list[dict[str, str]] = []

    for sample in samples:
        sample_id = str(sample["sample_id"])
        cached = existing_cache.get(sample_id)
        if cached:
            examples.append(cached)
            continue

        video_path = (dataset_root / str(sample["video_path"])).resolve()
        landmarks_path = dataset_root / str(sample["landmarks_path"])
        if not video_path.exists() or not landmarks_path.exists():
            failed_samples.append(
                {
                    "sample_id": sample_id,
                    "phrase_id": str(sample["phrase_id"]),
                    "error": "缺少视频或 landmarks 文件。",
                }
            )
            continue

        landmarks = json.loads(landmarks_path.read_text(encoding="utf-8"))

        try:
            result = engine.infer(
                video_path,
                {
                    "landmarks": landmarks,
                    "tracker_mode": sample.get("metadata", {}).get("tracker_mode"),
                    "client_capture_fps": sample.get("metadata", {}).get("client_capture_fps"),
                    "client_video_width": sample.get("metadata", {}).get("client_video_width"),
                    "client_video_height": sample.get("metadata", {}).get("client_video_height"),
                },
            )
        except Exception as exc:
            failed_samples.append(
                {
                    "sample_id": sample_id,
                    "phrase_id": str(sample["phrase_id"]),
                    "error": str(exc).splitlines()[0],
                }
            )
            continue

        examples.append(
            {
                "sample_id": sample_id,
                "phrase_id": str(sample["phrase_id"]),
                "phrase_text": str(sample["phrase_text"]),
                "speaker_id": str(sample.get("speaker_id") or "speaker-01"),
                "raw_transcript": result.transcript,
                "video_path": str(sample["video_path"]),
            }
        )

    if not examples:
        raise RuntimeError("没有可用于训练的样本，外部 VSR 在当前数据集上全部失败。")

    metrics = _evaluate_examples(examples)
    phrase_counts = Counter(str(example["phrase_id"]) for example in examples)
    phrase_lookup = _phrase_lookup(examples)

    artifact = {
        "model_type": "fixed_command_transcript_knn",
        "created_at": _now_iso(),
        "dataset_root": str(dataset_root),
        "manifest_path": str(manifest_path),
        "model_path": str(model_path),
        "total_dataset_samples": len(samples),
        "trained_samples": len(examples),
        "failed_samples": failed_samples,
        "phrases": [
            {
                "phrase_id": phrase_id,
                "phrase_text": phrase_lookup.get(phrase_id, phrase_id),
                "count": phrase_counts.get(phrase_id, 0),
            }
            for phrase_id in sorted(phrase_lookup.keys())
        ],
        "metrics": metrics,
        "examples": examples,
        "base_engine": "external_vsr",
    }

    model_path.write_text(json.dumps(artifact, ensure_ascii=False, indent=2), encoding="utf-8")
    return artifact
