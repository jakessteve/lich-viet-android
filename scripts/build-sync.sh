#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Building web bundle..."
cd "$PROJECT_DIR"
npm run build:web

echo "Syncing Capacitor Android assets..."
npm run cap:sync

echo "Done. You can build the debug APK with:"
echo "  cd android && ./gradlew assembleDebug"
