#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "Dependencies not found. Installing first..."
  npm install
fi

echo "Starting voice order demo..."
echo "Open http://localhost:5173/voice-order-demo/ in your browser."
echo

npm run voice-demo
