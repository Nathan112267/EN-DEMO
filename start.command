#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  echo "Frontend dependencies not found. Installing first..."
  npm install
fi

if [ ! -x ".venv/bin/python" ]; then
  echo "Python virtualenv is missing."
  echo "Run these once:"
  echo "  cd \"$ROOT_DIR\""
  echo "  python3 -m venv .venv"
  echo "  source .venv/bin/activate"
  echo "  pip install -r backend/requirements.txt"
  echo "  pip install -r backend/requirements-vsr.txt"
  exit 1
fi

if ! .venv/bin/python -c "import fastapi, uvicorn" >/dev/null 2>&1; then
  echo "Backend base dependencies are missing."
  echo "Run these once:"
  echo "  cd \"$ROOT_DIR\""
  echo "  source .venv/bin/activate"
  echo "  pip install -r backend/requirements.txt"
  exit 1
fi

BACKEND_PID=""

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
    pkill -P "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

if lsof -nP -iTCP:8000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Backend already running at http://127.0.0.1:8000"
else
  echo "Starting backend at http://127.0.0.1:8000 ..."
  .venv/bin/python -m uvicorn backend.app:app --reload --port 8000 >/tmp/lipsight-backend.log 2>&1 &
  BACKEND_PID=$!
  sleep 2

  if ! kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    echo "Backend failed to start."
    echo "Check the log at: /tmp/lipsight-backend.log"
    exit 1
  fi

  echo "Backend log: /tmp/lipsight-backend.log"
fi

echo "Starting frontend at http://127.0.0.1:5173 ..."
echo "Open http://127.0.0.1:5173 in your browser."
echo "Dataset collection page: http://127.0.0.1:5173/data-collection/"
echo "If the page still shows old code, hard refresh once."
echo

npm run dev
