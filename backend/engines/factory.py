from __future__ import annotations

import os
from pathlib import Path

from .demo import DemoEngine
from .external_vsr import ExternalVSREngine
from .fixed_command import FixedCommandEngine
from backend.fixed_command_classifier import should_activate_fixed_command_model


def create_engine():
    selected = os.getenv("LIPREAD_ENGINE", "").strip().lower()
    project_root = Path(__file__).resolve().parents[2]
    default_fixed_model = project_root / "captures" / "lip-command-dataset" / "fixed_command_model.json"

    if not selected and should_activate_fixed_command_model(default_fixed_model):
        return FixedCommandEngine()
    if not selected:
        selected = "external_vsr"

    if selected in {"fixed_command", "command_classifier", "fixed"}:
        return FixedCommandEngine()
    if selected in {"external_vsr", "vsr", "cmlr"}:
        return ExternalVSREngine()
    if selected in {"demo", "stub"}:
        return DemoEngine()
    return ExternalVSREngine()
