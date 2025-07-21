#!/bin/bash

# BuildScript for PrintSoft ERP Android APK
echo "🚀 Building PrintSoft ERP Android APK..."

# Step 1: Build web assets with production config
echo "📦 Building web assets for production..."

# Set production environment variable for the build
export VITE_API_BASE_URL="https://printsoft-erp-backend.onrender.com"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

# Step 2: Copy web assets to Android
echo "📱 Copying web assets to Android..."
npx cap copy android

if [ $? -ne 0 ]; then
    echo "❌ Copy failed!"
    exit 1
fi

# Step 3: Build Android APK
echo "🔨 Building Android APK..."
cd android

# Build debug APK by default, or release if specified
BUILD_TYPE=${1:-debug}

if [ "$BUILD_TYPE" = "release" ]; then
    ./gradlew assembleRelease
    APK_PATH="./app/build/outputs/apk/release/app-release-unsigned.apk"
    OUTPUT_NAME="PrintSoftERP-release.apk"
else
    ./gradlew assembleDebug
    APK_PATH="./app/build/outputs/apk/debug/app-debug.apk"
    OUTPUT_NAME="PrintSoftERP-debug.apk"
fi

if [ $? -ne 0 ]; then
    echo "❌ Android build failed!"
    exit 1
fi

# Step 4: Copy APK to root directory
if [ -f "$APK_PATH" ]; then
    cp "$APK_PATH" "../$OUTPUT_NAME"
    echo "✅ APK built successfully!"
    echo "📍 Location: $(pwd)/../$OUTPUT_NAME"
    echo "📊 Size: $(ls -lh "../$OUTPUT_NAME" | awk '{print $5}')"
else
    echo "❌ APK file not found at $APK_PATH"
    exit 1
fi

cd ..
echo "🎉 Build complete!"
