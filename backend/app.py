from __future__ import annotations

import asyncio
import json
import mimetypes
import os
import tempfile
from dataclasses import asdict
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from backend.dataset_store import DatasetStore
from backend.fixed_command_classifier import (
    default_fixed_command_model_path,
    should_activate_fixed_command_model,
    train_fixed_command_classifier,
)
from backend.engines.base import EngineConfigurationError
from backend.engines.factory import create_engine

app = FastAPI(
    title="Lip Reading Backend",
    description="Chunked video inference service for the webcam lip-reading prototype.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dataset_store = DatasetStore(
    Path(
        os.getenv(
            "LIPREAD_DATASET_DIR",
            Path(__file__).resolve().parent.parent / "captures" / "lip-command-dataset",
        )
    )
)
engine = create_engine()
engine_signature = ""


def _suffix_for_upload(upload: UploadFile) -> str:
    filename_suffix = Path(upload.filename or "").suffix
    content_suffix = mimetypes.guess_extension(upload.content_type or "")
    if filename_suffix and content_suffix and filename_suffix != content_suffix:
        return content_suffix
    if filename_suffix:
        return filename_suffix
    return content_suffix or ".webm"


def _serialize_status() -> dict[str, Any]:
    status = engine.status()
    payload = asdict(status)
    payload["engine"] = payload.pop("name")
    return payload


def _parse_landmarks_json(landmarks_json: Optional[str]) -> Optional[list[Any]]:
    if not landmarks_json:
        return None

    try:
        parsed = json.loads(landmarks_json)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=422,
            detail={
                "message": f"浏览器 landmarks JSON 解析失败: {exc}",
            },
        ) from exc

    if not isinstance(parsed, list):
        raise HTTPException(
            status_code=422,
            detail={
                "message": "浏览器 landmarks 必须是数组。",
            },
        )

    return parsed


def _desired_engine_signature() -> str:
    selected = os.getenv("LIPREAD_ENGINE", "").strip().lower()
    if selected:
        return selected

    fixed_model_path = default_fixed_command_model_path(dataset_store.root_dir)
    return "fixed_command" if should_activate_fixed_command_model(fixed_model_path) else "external_vsr"


def _maybe_refresh_engine() -> None:
    global engine_signature
    desired_signature = _desired_engine_signature()
    if desired_signature != engine_signature:
        _reload_engine()


def _reload_engine() -> None:
    global engine, engine_signature
    engine = create_engine()
    engine_signature = _desired_engine_signature()


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "lip-reading-backend",
        "health": "/api/health",
        "infer": "/api/infer",
    }


@app.get("/api/health")
def health() -> dict[str, Any]:
    _maybe_refresh_engine()
    return {
        "ok": True,
        **_serialize_status(),
    }


@app.get("/api/dataset/status")
def dataset_status() -> dict[str, Any]:
    return {
        "ok": True,
        **dataset_store.status(),
    }


@app.get("/api/dataset/manifest")
def dataset_manifest() -> dict[str, Any]:
    return {
        "ok": True,
        **dataset_store.export_manifest(),
    }


@app.post("/api/dataset/train-fixed-commands")
async def train_fixed_commands() -> dict[str, Any]:
    try:
        artifact = await asyncio.to_thread(
            train_fixed_command_classifier,
            dataset_store.root_dir,
            model_path=default_fixed_command_model_path(dataset_store.root_dir),
        )
    except EngineConfigurationError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "message": str(exc),
                "status": _serialize_status(),
            },
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "message": str(exc),
            },
        ) from exc

    _reload_engine()
    metrics = artifact.get("metrics", {})
    best_k = metrics.get("best_k")
    best_metrics = metrics.get("by_k", {}).get(str(best_k), {})

    return {
        "ok": True,
        "artifact": {
            "model_path": artifact.get("model_path"),
            "trained_samples": artifact.get("trained_samples"),
            "failed_samples": artifact.get("failed_samples"),
            "phrases": artifact.get("phrases"),
            "best_k": best_k,
            "best_accuracy": metrics.get("best_accuracy"),
            "best_metrics": best_metrics,
            "auto_activated": should_activate_fixed_command_model(
                default_fixed_command_model_path(dataset_store.root_dir)
            ),
        },
        "engine_status": _serialize_status(),
    }


@app.post("/api/infer")
async def infer(
    video: UploadFile = File(...),
    chunk_index: Optional[int] = Form(default=None),
    client_started_at: Optional[str] = Form(default=None),
    client_capture_fps: Optional[float] = Form(default=None),
    client_video_width: Optional[int] = Form(default=None),
    client_video_height: Optional[int] = Form(default=None),
    tracker_mode: Optional[str] = Form(default=None),
    landmarks_json: Optional[str] = Form(default=None),
) -> dict[str, Any]:
    _maybe_refresh_engine()
    status = _serialize_status()
    if not status["ready"]:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "后端模型还没准备好。",
                "status": status,
            },
        )

    suffix = _suffix_for_upload(video)
    tmp_dir = Path(os.getenv("LIPREAD_TMP_DIR", tempfile.gettempdir())) / "lipsight_chunks"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    fd, raw_path = tempfile.mkstemp(prefix="chunk-", suffix=suffix, dir=tmp_dir)
    os.close(fd)
    temp_path = Path(raw_path)

    try:
        with temp_path.open("wb") as handle:
            while True:
                chunk = await video.read(1024 * 1024)
                if not chunk:
                    break
                handle.write(chunk)

        landmarks = _parse_landmarks_json(landmarks_json)

        result = await asyncio.to_thread(
            engine.infer,
            temp_path,
            {
                "chunk_index": chunk_index,
                "client_started_at": client_started_at,
                "client_capture_fps": client_capture_fps,
                "client_video_width": client_video_width,
                "client_video_height": client_video_height,
                "tracker_mode": tracker_mode,
                "content_type": video.content_type,
                "filename": video.filename,
                "landmarks": landmarks,
            },
        )

        return {
            "ok": True,
            **asdict(result),
        }
    except EngineConfigurationError as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "message": str(exc),
                "status": status,
            },
        ) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "message": str(exc),
            },
        ) from exc
    finally:
        await video.close()
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)


@app.post("/api/dataset/samples")
async def create_dataset_sample(
    video: UploadFile = File(...),
    phrase_id: str = Form(...),
    phrase_text: str = Form(...),
    speaker_id: str = Form(default="speaker-01"),
    duration_ms: Optional[int] = Form(default=None),
    tracked_samples: Optional[int] = Form(default=None),
    client_capture_fps: Optional[float] = Form(default=None),
    client_video_width: Optional[int] = Form(default=None),
    client_video_height: Optional[int] = Form(default=None),
    tracker_mode: Optional[str] = Form(default=None),
    landmarks_json: Optional[str] = Form(default=None),
) -> dict[str, Any]:
    suffix = _suffix_for_upload(video)
    tmp_dir = Path(os.getenv("LIPREAD_TMP_DIR", tempfile.gettempdir())) / "lipsight_dataset_uploads"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    fd, raw_path = tempfile.mkstemp(prefix="sample-", suffix=suffix, dir=tmp_dir)
    os.close(fd)
    temp_path = Path(raw_path)

    try:
        with temp_path.open("wb") as handle:
            while True:
                chunk = await video.read(1024 * 1024)
                if not chunk:
                    break
                handle.write(chunk)

        landmarks = _parse_landmarks_json(landmarks_json)
        sample = dataset_store.save_sample(
            temp_video_path=temp_path,
            original_suffix=suffix,
            phrase_id=phrase_id,
            phrase_text=phrase_text,
            speaker_id=speaker_id,
            duration_ms=duration_ms,
            tracked_samples=tracked_samples,
            landmarks=landmarks,
            metadata={
                "content_type": video.content_type,
                "filename": video.filename,
                "client_capture_fps": client_capture_fps,
                "client_video_width": client_video_width,
                "client_video_height": client_video_height,
                "tracker_mode": tracker_mode,
            },
        )
        status = dataset_store.status()

        return {
            "ok": True,
            "sample": sample,
            "dataset": status,
        }
    finally:
        await video.close()
        temp_path.unlink(missing_ok=True)


@app.delete("/api/dataset/samples/{sample_id}")
def delete_dataset_sample(sample_id: str) -> dict[str, Any]:
    try:
        deleted = dataset_store.delete_sample(sample_id)
    except KeyError as exc:
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"未找到样本 {sample_id}",
            },
        ) from exc

    return {
        "ok": True,
        "deleted": deleted,
        "dataset": dataset_store.status(),
    }
