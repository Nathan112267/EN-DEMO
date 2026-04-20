from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional, Protocol


@dataclass
class EngineStatus:
    name: str
    ready: bool
    summary: str
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class InferenceResult:
    transcript: str
    engine: str
    latency_ms: int
    confidence: Optional[float] = None
    details: dict[str, Any] = field(default_factory=dict)


class EngineConfigurationError(RuntimeError):
    """Raised when an inference engine is not configured or missing assets."""


class LipReadingEngine(Protocol):
    name: str

    def status(self) -> EngineStatus:
        ...

    def infer(self, video_path: Path, request_meta: dict[str, Any]) -> InferenceResult:
        ...
