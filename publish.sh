#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Current directory is not a git repository: $ROOT_DIR"
  exit 1
fi

REMOTE_NAME="${GIT_REMOTE_NAME:-origin}"
CURRENT_BRANCH="$(git branch --show-current)"
TARGET_BRANCH="${GIT_TARGET_BRANCH:-$CURRENT_BRANCH}"
COMMIT_MESSAGE="${1:-update}"

if [ -z "$CURRENT_BRANCH" ]; then
  echo "Could not determine the current git branch."
  exit 1
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  echo "Git remote '$REMOTE_NAME' is not configured."
  exit 1
fi

if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi

echo "Publishing from: $ROOT_DIR"
echo "Remote: $REMOTE_NAME"
echo "Branch: $TARGET_BRANCH"
echo "Commit: $COMMIT_MESSAGE"

git add .

if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git commit -m "$COMMIT_MESSAGE"
git push "$REMOTE_NAME" "$TARGET_BRANCH"

echo "Publish complete."
