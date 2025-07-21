#!/bin/bash

# Build and sign a release APK
# Usage: ./build-release-apk.sh

set -e

echo "🚀 Building and signing release APK..."

# Make sure we're in the project root
PROJECT_ROOT=$(pwd)
echo "Working from: $PROJECT_ROOT"

# Build frontend first
echo "📦 Building frontend..."
cd frontend
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Navigate to Android folder and build
echo "🏗️ Building Android APK..."
cd android
./gradlew assembleRelease

# Move APK to project root
echo "📋 Copying APK to project root..."
cp app/build/outputs/apk/release/app-release.apk "$PROJECT_ROOT/PrintSoftERP-release.apk"

echo "✅ Release APK built and signed successfully!"
echo "📦 APK Location: $PROJECT_ROOT/PrintSoftERP-release.apk"
