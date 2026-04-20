from __future__ import annotations

import configparser
import os
import pickle
import subprocess
import sys
import tempfile
from pathlib import Path
from time import perf_counter
from typing import Any, Optional

from .base import EngineConfigurationError, EngineStatus, InferenceResult


def _expand_path(raw_value: Optional[str]) -> Optional[Path]:
    if not raw_value:
        return None
    return Path(raw_value).expanduser().resolve()


class ExternalVSREngine:
    name = "external_vsr"

    def __init__(self) -> None:
        project_root = Path(__file__).resolve().parents[2]
        default_python = project_root / ".venv" / "bin" / "python"
        self.repo_dir = _expand_path(
            os.getenv(
                "LIPREAD_REPO_DIR",
                str(project_root / "backend" / "vendor" / "Visual_Speech_Recognition_for_Multiple_Languages"),
            )
        )
        default_config = None
        if self.repo_dir:
            default_config = self.repo_dir / "configs" / "CMLR_V_WER8.0.ini"
        self.config_path = _expand_path(os.getenv("LIPREAD_CONFIG")) or default_config
        self.detector = os.getenv("LIPREAD_DETECTOR", "mediapipe")
        self.gpu_idx = int(os.getenv("LIPREAD_GPU_IDX", "-1"))
        self.timeout_seconds = int(os.getenv("LIPREAD_TIMEOUT_SECONDS", "240"))
        self.python_bin = os.getenv(
            "LIPREAD_PYTHON_BIN",
            str(default_python if default_python.exists() else (Path(sys.executable) if sys.executable else Path("python3"))),
        )

    def _infer_script_path(self) -> Optional[Path]:
        if not self.repo_dir:
            return None
        return self.repo_dir / "infer.py"

    def _resolve_repo_relative(self, raw_path: str) -> Path:
        path = Path(raw_path)
        if path.is_absolute():
            return path
        if not self.repo_dir:
            return path
        return self.repo_dir / path

    def _config_asset_report(self) -> tuple[dict[str, str], list[str]]:
        details: dict[str, str] = {}
        missing: list[str] = []

        if not self.config_path or not self.config_path.exists():
            missing.append("缺少 LIPREAD_CONFIG，或配置文件路径不存在。")
            return details, missing

        parser = configparser.ConfigParser()
        parser.read(self.config_path)
        for key in ("model_path", "model_conf", "rnnlm", "rnnlm_conf"):
            raw_value = parser.get("model", key, fallback="")
            details[key] = raw_value
            if raw_value and not self._resolve_repo_relative(raw_value).exists():
                missing.append(f"模型资产不存在: {raw_value}")

        return details, missing

    def _count_video_frames(self, video_path: Path) -> int:
        try:
            import torchvision

            frames = torchvision.io.read_video(str(video_path), pts_unit="sec")[0]
            if hasattr(frames, "shape") and len(frames.shape) >= 1:
                frame_count = int(frames.shape[0])
                if frame_count > 0:
                    return frame_count
        except Exception:
            pass

        import cv2

        capture = cv2.VideoCapture(str(video_path))
        try:
            frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
            if frame_count > 0:
                return frame_count

            frame_count = 0
            while True:
                ok, _frame = capture.read()
                if not ok:
                    break
                frame_count += 1
            return frame_count
        finally:
            capture.release()

    def _normalize_landmarks(self, raw_landmarks: list[Any]) -> list[Optional[list[list[float]]]]:
        normalized: list[Optional[list[list[float]]]] = []
        for frame in raw_landmarks:
            if frame is None:
                normalized.append(None)
                continue
            if not isinstance(frame, list) or len(frame) < 4:
                normalized.append(None)
                continue

            points: list[list[float]] = []
            valid = True
            for point in frame[:4]:
                if (
                    not isinstance(point, list)
                    or len(point) < 2
                    or point[0] is None
                    or point[1] is None
                ):
                    valid = False
                    break
                points.append([float(point[0]), float(point[1])])

            normalized.append(points if valid else None)
        return normalized

    def _fill_missing_landmarks(
        self,
        raw_landmarks: list[Optional[list[list[float]]]],
    ) -> list[Any]:
        import numpy as np

        sequence: list[Any] = [
            np.array(frame, dtype=np.float32) if frame is not None else None for frame in raw_landmarks
        ]
        valid_indices = [idx for idx, frame in enumerate(sequence) if frame is not None]
        if not valid_indices:
            return []

        first_valid = valid_indices[0]
        last_valid = valid_indices[-1]
        for idx in range(first_valid):
            sequence[idx] = sequence[first_valid].copy()
        for idx in range(last_valid + 1, len(sequence)):
            sequence[idx] = sequence[last_valid].copy()

        for start_idx, stop_idx in zip(valid_indices, valid_indices[1:]):
            if stop_idx - start_idx <= 1:
                continue
            start_frame = sequence[start_idx]
            stop_frame = sequence[stop_idx]
            assert start_frame is not None
            assert stop_frame is not None
            gap = stop_idx - start_idx
            for offset in range(1, gap):
                ratio = offset / float(gap)
                sequence[start_idx + offset] = start_frame + ratio * (stop_frame - start_frame)

        return sequence

    def _resample_landmarks(self, filled_landmarks: list[Any], target_frames: int) -> list[Any]:
        import numpy as np

        if not filled_landmarks:
            return []

        if target_frames <= 0 or len(filled_landmarks) == target_frames:
            return [frame.astype(np.float32) for frame in filled_landmarks]

        source_positions = np.linspace(0.0, 1.0, num=len(filled_landmarks), endpoint=True)
        target_positions = np.linspace(0.0, 1.0, num=target_frames, endpoint=True)
        stacked = np.stack(filled_landmarks)
        resampled: list[Any] = []

        for target_position in target_positions:
            frame = np.empty((4, 2), dtype=np.float32)
            for point_index in range(4):
                for axis_index in range(2):
                    frame[point_index, axis_index] = np.interp(
                        target_position,
                        source_positions,
                        stacked[:, point_index, axis_index],
                    )
            resampled.append(frame)

        return resampled

    def _prepare_landmarks_file(
        self,
        video_path: Path,
        request_meta: dict[str, Any],
    ) -> tuple[Optional[Path], dict[str, Any]]:
        raw_landmarks = request_meta.get("landmarks")
        if not raw_landmarks:
            return None, {
                "input_mode": "server_detector",
            }

        normalized = self._normalize_landmarks(raw_landmarks)
        filled_landmarks = self._fill_missing_landmarks(normalized)
        if not filled_landmarks:
            raise RuntimeError("浏览器没有采到可用的人脸关键点，请正对镜头并让嘴部保持清晰。")

        target_frames = self._count_video_frames(video_path)
        aligned_landmarks = self._resample_landmarks(filled_landmarks, target_frames)
        if not aligned_landmarks:
            raise RuntimeError("浏览器 landmarks 无法对齐到视频帧。")

        tmp_dir = Path(os.getenv("LIPREAD_TMP_DIR", tempfile.gettempdir())) / "lipsight_chunks"
        tmp_dir.mkdir(parents=True, exist_ok=True)

        fd, raw_path = tempfile.mkstemp(prefix="chunk-", suffix=".pkl", dir=tmp_dir)
        os.close(fd)
        output_path = Path(raw_path)
        with output_path.open("wb") as handle:
            pickle.dump(aligned_landmarks, handle)

        usable_landmarks = sum(1 for item in normalized if item is not None)
        return output_path, {
            "input_mode": "browser_landmarks",
            "browser_landmark_samples": len(normalized),
            "usable_landmark_samples": usable_landmarks,
            "aligned_landmark_frames": len(aligned_landmarks),
            "video_frames": target_frames,
            "tracker_mode": request_meta.get("tracker_mode"),
            "client_capture_fps": request_meta.get("client_capture_fps"),
            "client_video_width": request_meta.get("client_video_width"),
            "client_video_height": request_meta.get("client_video_height"),
        }

    def status(self) -> EngineStatus:
        details: dict[str, Any] = {
            "repo_dir": str(self.repo_dir) if self.repo_dir else None,
            "config_path": str(self.config_path) if self.config_path else None,
            "detector": self.detector,
            "gpu_idx": self.gpu_idx,
            "python_bin": self.python_bin,
            "supports_browser_landmarks": True,
        }
        blockers: list[str] = []

        if not self.repo_dir or not self.repo_dir.exists():
            blockers.append("开源仓库目录不存在，请先克隆 Visual_Speech_Recognition_for_Multiple_Languages。")

        infer_script = self._infer_script_path()
        if not infer_script or not infer_script.exists():
            blockers.append("infer.py 不存在，仓库目录看起来还没有准备好。")

        config_details, config_blockers = self._config_asset_report()
        details["config_assets"] = config_details
        blockers.extend(config_blockers)

        ready = not blockers
        summary = (
            "真实 VSR 引擎已配置，可以接收视频片段做推理。"
            if ready
            else "真实 VSR 引擎还没准备好，网页可以先连摄像头，但推理会返回配置提示。"
        )
        details["blockers"] = blockers

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

        assert self.repo_dir is not None
        assert self.config_path is not None

        landmarks_path, landmark_details = self._prepare_landmarks_file(video_path, request_meta)

        command = [
            self.python_bin,
            "infer.py",
            f"config_filename={self.config_path}",
            f"data_filename={video_path}",
            f"detector={self.detector}",
            f"gpu_idx={self.gpu_idx}",
        ]
        if landmarks_path is not None:
            command.append(f"landmarks_filename={landmarks_path}")

        try:
            started = perf_counter()
            completed = subprocess.run(
                command,
                cwd=self.repo_dir,
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds,
                check=False,
            )
            latency_ms = int((perf_counter() - started) * 1000)

            combined_output = "\n".join(part for part in (completed.stdout, completed.stderr) if part).strip()
            transcript = ""
            for line in reversed(combined_output.splitlines()):
                if line.lower().startswith("hyp:"):
                    transcript = line.split(":", 1)[1].strip()
                    break

            if completed.returncode != 0:
                raise RuntimeError(
                    "VSR 推理进程退出失败。\n"
                    f"command={' '.join(command)}\n"
                    f"stdout={completed.stdout.strip()}\n"
                    f"stderr={completed.stderr.strip()}"
                )

            if not transcript:
                raise RuntimeError("模型进程运行成功，但没有解析到 hyp 输出。")

            return InferenceResult(
                transcript=transcript,
                engine=self.name,
                latency_ms=latency_ms,
                confidence=None,
                details={
                    "chunk_index": request_meta.get("chunk_index"),
                    "detector": self.detector,
                    "stdout_tail": completed.stdout.strip().splitlines()[-5:],
                    **landmark_details,
                },
            )
        finally:
            if landmarks_path is not None:
                landmarks_path.unlink(missing_ok=True)
