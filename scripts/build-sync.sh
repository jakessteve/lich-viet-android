#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$(dirname "$SCRIPT_DIR")/lich-viet"
ANDROID_DIR="$SCRIPT_DIR"

echo "🔨 Building web assets..."
cd "$WEB_DIR" && npm run build

echo "📱 Syncing to Android..."
cd "$ANDROID_DIR" && npx cap sync android

echo "🧹 Removing pre-compressed .gz and .br files from Android assets..."
COMPRESSED_COUNT=$(find /home/heocop/Projects/lich-viet-android/android/app/src/main/assets/public -type f \( -name "*.gz" -o -name "*.br" \) | wc -l)
find /home/heocop/Projects/lich-viet-android/android/app/src/main/assets/public -type f \( -name "*.gz" -o -name "*.br" \) -delete
echo "   Removed ${COMPRESSED_COUNT} compressed files"

echo "✅ Done! Build the APK with:"
echo "   cd $ANDROID_DIR/android && ./gradlew assembleDebug"
echo "   APK will be at: $ANDROID_DIR/android/app/build/outputs/apk/debug/app-debug.apk"