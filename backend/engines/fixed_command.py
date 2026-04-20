from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

from backend.fixed_command_classifier import (
    default_fixed_command_model_path,
    load_fixed_command_artifact,
    predict_phrase,
)

from .base import EngineConfigurationError, EngineStatus, InferenceResult
from .external_vsr import ExternalVSREngine


class FixedCommandEngine:
    name = "fixed_command"

    def __init__(self) -> None:
        self.base_engine = ExternalVSREngine()
        self.dataset_root = (Path(__file__).resolve().parents[2] / "captures" / "lip-command-dataset").resolve()
        self.model_path = default_fixed_command_model_path(self.dataset_root)
        self._artifact_cache: Optional[dict[str, Any]] = None
        self._artifact_mtime_ns: Optional[int] = None

    def _load_artifact(self) -> Optional[dict[str, Any]]:
        if not self.model_path.exists():
            self._artifact_cache = None
            self._artifact_mtime_ns = None
            return None

        stat = self.model_path.stat()
        if (
            self._artifact_cache is not None
            and self._artifact_mtime_ns == stat.st_mtime_ns
        ):
            return self._artifact_cache

        artifact = load_fixed_command_artifact(self.model_path)
        self._artifact_cache = artifact
        self._artifact_mtime_ns = stat.st_mtime_ns
        return artifact

    def status(self) -> EngineStatus:
        base_status = self.base_engine.status()
        artifact = self._load_artifact()

        blockers: list[str] = []
        if not self.model_path.exists():
            blockers.append("固定句模型还没训练，请先运行数据集训练。")
        if not base_status.ready:
            blockers.extend(base_status.details.get("blockers", []))

        ready = artifact is not None and base_status.ready
        summary = (
            "固定句引擎已就绪，会先跑中文 VSR，再把原始输出纠正到 7 句命令里。"
            if ready
            else "固定句引擎尚未就绪，需要先训练 fixed command model。"
        )

        details: dict[str, Any] = {
            "model_path": str(self.model_path),
            "base_engine": base_status.name,
            "base_ready": base_status.ready,
            "blockers": blockers,
        }
        if artifact is not None:
            details.update(
                {
                    "trained_samples": artifact.get("trained_samples"),
                    "best_k": artifact.get("metrics", {}).get("best_k"),
                    "best_accuracy": artifact.get("metrics", {}).get("best_accuracy"),
                }
            )

        return EngineStatus(
            name=self.name,
            ready=ready,
            summary=summary,
            details=details,
        )

    def infer(self, video_path: Path, request_meta: dict[str, Any]) -> InferenceResult:
        status = self.status()
        if not status.ready:
            raise EngineConfigurationError("; ".join(status.details.get("blockers", [])))

        artifact = self._load_artifact()
        assert artifact is not None

        base_result = self.base_engine.infer(video_path, request_meta)
        prediction = predict_phrase(
            base_result.transcript,
            artifact.get("examples", []),
            k=int(artifact.get("metrics", {}).get("best_k") or 5),
        )

        return InferenceResult(
            transcript=base_result.transcript,
            engine=self.name,
            latency_ms=base_result.latency_ms,
            confidence=float(prediction["confidence"]),
            details={
                **base_result.details,
                "base_engine": base_result.engine,
                "corrected_transcript": prediction["phrase_text"],
                "corrected_phrase_id": prediction["phrase_id"],
                "correction_confidence": prediction["confidence"],
                "top_phrase_scores": prediction["top_phrase_scores"],
                "matched_training_transcripts": prediction["matched_examples"],
                "model_path": str(self.model_path),
                "trained_samples": artifact.get("trained_samples"),
            },
        )
