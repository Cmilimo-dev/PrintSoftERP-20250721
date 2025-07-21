#!/bin/bash

# Update Mobile APK for Production
# Usage: ./scripts/update-mobile-production.sh https://your-backend-url.onrender.com

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backend-url>"
    echo "Example: $0 https://printsoft-erp-backend-abc123.onrender.com"
    exit 1
fi

BACKEND_URL=$1

echo "🚀 Updating mobile APK for production deployment..."
echo "Backend URL: $BACKEND_URL"

# Update frontend environment for mobile
echo "VITE_API_BASE_URL=$BACKEND_URL" > frontend/.env.production

echo "📦 Building frontend for mobile..."
cd frontend
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync android

echo "🏗️  Building Android APK..."
npx cap build android

echo "📲 Generating release APK..."
cd android
./gradlew assembleRelease

echo "✅ Mobile APK updated successfully!"
echo "📱 APK Location: frontend/android/app/build/outputs/apk/release/app-release.apk"

# Copy APK to easily accessible location
cp app/build/outputs/apk/release/app-release.apk ../../PrintSoftERP-production.apk

echo "🎉 Production APK ready: PrintSoftERP-production.apk"
