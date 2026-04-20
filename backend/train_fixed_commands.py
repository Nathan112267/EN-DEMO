from __future__ import annotations

from pathlib import Path

from backend.fixed_command_classifier import (
    default_fixed_command_model_path,
    train_fixed_command_classifier,
)


def main() -> None:
    dataset_root = (Path(__file__).resolve().parent.parent / "captures" / "lip-command-dataset").resolve()
    model_path = default_fixed_command_model_path(dataset_root)
    artifact = train_fixed_command_classifier(dataset_root, model_path=model_path)
    print(f"model_path={artifact['model_path']}")
    print(f"trained_samples={artifact['trained_samples']}")
    print(f"failed_samples={len(artifact['failed_samples'])}")
    print(f"best_k={artifact['metrics']['best_k']}")
    print(f"best_accuracy={artifact['metrics']['best_accuracy']:.3f}")


if __name__ == "__main__":
    main()
