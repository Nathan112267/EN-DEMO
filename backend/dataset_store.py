from __future__ import annotations

import json
import shutil
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class DatasetStore:
    def __init__(self, root_dir: Path) -> None:
        self.root_dir = root_dir
        self.samples_dir = self.root_dir / "samples"
        self.manifest_path = self.root_dir / "manifest.json"
        self._lock = threading.Lock()
        self._ensure_layout()

    def _ensure_layout(self) -> None:
        self.samples_dir.mkdir(parents=True, exist_ok=True)
        if not self.manifest_path.exists():
            with self.manifest_path.open("w", encoding="utf-8") as handle:
                json.dump(
                    {
                        "version": 1,
                        "updated_at": _now_iso(),
                        "samples": [],
                    },
                    handle,
                    ensure_ascii=False,
                    indent=2,
                )

    def _read_manifest(self) -> dict[str, Any]:
        self._ensure_layout()
        with self.manifest_path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def _write_manifest(self, payload: dict[str, Any]) -> None:
        self._ensure_layout()
        with self.manifest_path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)

    def status(self) -> dict[str, Any]:
        with self._lock:
            manifest = self._read_manifest()
            samples = manifest.get("samples", [])
            counts: dict[str, int] = {}
            for sample in samples:
                phrase_id = str(sample.get("phrase_id") or "unknown")
                counts[phrase_id] = counts.get(phrase_id, 0) + 1

            recent_samples = sorted(
                samples,
                key=lambda item: str(item.get("created_at") or ""),
                reverse=True,
            )[:16]

            return {
                "root_dir": str(self.root_dir),
                "manifest_path": str(self.manifest_path),
                "total_samples": len(samples),
                "counts": counts,
                "recent_samples": recent_samples,
                "updated_at": manifest.get("updated_at"),
            }

    def export_manifest(self) -> dict[str, Any]:
        with self._lock:
            manifest = self._read_manifest()
            return {
                **manifest,
                "root_dir": str(self.root_dir),
                "manifest_path": str(self.manifest_path),
            }

    def save_sample(
        self,
        *,
        temp_video_path: Path,
        original_suffix: str,
        phrase_id: str,
        phrase_text: str,
        speaker_id: str,
        duration_ms: Optional[int],
        tracked_samples: Optional[int],
        landmarks: Optional[list[Any]],
        metadata: dict[str, Any],
    ) -> dict[str, Any]:
        sample_id = uuid4().hex[:12]
        created_at = _now_iso()
        safe_phrase_id = phrase_id.strip() or "unassigned"
        phrase_dir = self.samples_dir / safe_phrase_id
        phrase_dir.mkdir(parents=True, exist_ok=True)

        suffix = original_suffix if original_suffix.startswith(".") else f".{original_suffix}"
        video_filename = f"{sample_id}{suffix or '.webm'}"
        landmarks_filename = f"{sample_id}.landmarks.json"

        video_path = phrase_dir / video_filename
        landmarks_path = phrase_dir / landmarks_filename

        shutil.copy2(temp_video_path, video_path)
        if landmarks:
            with landmarks_path.open("w", encoding="utf-8") as handle:
                json.dump(landmarks, handle, ensure_ascii=False)

        sample = {
            "sample_id": sample_id,
            "phrase_id": safe_phrase_id,
            "phrase_text": phrase_text,
            "speaker_id": speaker_id.strip() or "speaker-01",
            "duration_ms": duration_ms,
            "tracked_samples": tracked_samples,
            "created_at": created_at,
            "video_path": str(video_path.relative_to(self.root_dir)),
            "landmarks_path": str(landmarks_path.relative_to(self.root_dir)) if landmarks else None,
            "metadata": metadata,
        }

        with self._lock:
            manifest = self._read_manifest()
            samples = manifest.setdefault("samples", [])
            samples.append(sample)
            manifest["updated_at"] = _now_iso()
            self._write_manifest(manifest)

        return sample

    def delete_sample(self, sample_id: str) -> dict[str, Any]:
        with self._lock:
            manifest = self._read_manifest()
            samples = manifest.get("samples", [])
            target = next((sample for sample in samples if sample.get("sample_id") == sample_id), None)
            if not target:
                raise KeyError(sample_id)

            samples = [sample for sample in samples if sample.get("sample_id") != sample_id]
            manifest["samples"] = samples
            manifest["updated_at"] = _now_iso()
            self._write_manifest(manifest)

        video_path = self.root_dir / str(target.get("video_path") or "")
        landmarks_path = self.root_dir / str(target.get("landmarks_path") or "")

        video_path.unlink(missing_ok=True)
        if target.get("landmarks_path"):
            landmarks_path.unlink(missing_ok=True)

        return target
