from __future__ import annotations

from pathlib import Path
from time import perf_counter

from .base import EngineStatus, InferenceResult


class DemoEngine:
    name = "demo"

    def status(self) -> EngineStatus:
        return EngineStatus(
            name=self.name,
            ready=True,
            summary="演示模式已启用，后端接口可用，但未接入真实唇语模型。",
            details={
                "mode": "demo",
                "next_step": "配置 external_vsr 引擎后即可切到真实模型推理。",
            },
        )

    def infer(self, video_path: Path, request_meta: dict[str, object]) -> InferenceResult:
        started = perf_counter()
        clip_bytes = video_path.stat().st_size if video_path.exists() else 0
        chunk_index = request_meta.get("chunk_index")
        transcript = f"演示模式片段 {chunk_index if chunk_index is not None else '-'}，大小 {clip_bytes // 1024} KB。"
        return InferenceResult(
            transcript=transcript,
            engine=self.name,
            latency_ms=int((perf_counter() - started) * 1000),
            confidence=None,
            details={
                "mode": "demo",
                "advice": "把 LIPREAD_ENGINE 切到 external_vsr，并配置 CMLR 模型路径后即可接入真实识别。",
            },
        )
