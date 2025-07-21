# PrintSoft ERP - Android APK Build Guide

This guide explains how to build an Android APK from the PrintSoft ERP React web application using Capacitor.

## 🚀 Quick Start

### Build Debug APK
```bash
npm run build:apk
```

### Build Release APK
```bash
npm run build:apk:release
```

## 📋 Prerequisites

1. **Node.js & npm** - For building the React app
2. **Java 21** - Required by Capacitor 7.x
3. **Android SDK** - For building the APK
4. **Android Studio** (optional) - For advanced development

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build:apk` | Build debug APK |
| `npm run build:apk:release` | Build release APK |
| `npm run android:dev` | Run on Android device/emulator |
| `npm run cap:copy` | Copy web assets to Android |
| `npm run cap:sync` | Sync web assets and update native plugins |

## 🔧 Manual Build Process

If you prefer to build manually:

1. **Build Web Assets**
   ```bash
   npm run build
   ```

2. **Copy to Android**
   ```bash
   npx cap copy android
   ```

3. **Build APK**
   ```bash
   cd android
   ./gradlew assembleDebug
   # or for release
   ./gradlew assembleRelease
   ```

4. **Find APK**
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 📱 Installation

### Debug APK
The debug APK can be installed directly on any Android device with "Unknown Sources" enabled:

1. Transfer `PrintSoftERP-debug.apk` to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Tap the APK file to install

### Release APK (for Production)
For production distribution:

1. Sign the APK with your keystore
2. Upload to Google Play Store
3. Or distribute via your preferred method

## 🛠️ Development

### Testing on Device
```bash
npm run android:dev
```
This will build and run the app on a connected Android device or emulator.

### Updating Web Assets
After making changes to the React app:
```bash
npm run cap:copy
```
Or use the full build process:
```bash
npm run build:apk
```

## 📱 App Information

- **App Name**: PrintSoft ERP
- **Package ID**: com.printsoft.erp
- **Capacitor Version**: 7.4.2
- **Min Android Version**: API 23 (Android 6.0)
- **Target Android Version**: API 35 (Android 15)

## 🔍 Troubleshooting

### Java Version Issues
Ensure Java 21 is installed and set correctly:
```bash
java --version  # Should show version 21
```

### Build Failures
1. Clean and rebuild:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

2. Check Android SDK path:
   ```bash
   echo $ANDROID_HOME
   # or
   echo $ANDROID_SDK_ROOT
   ```

3. Update Capacitor:
   ```bash
   npx cap sync android
   ```

## 📄 Files Generated

- `PrintSoftERP-debug.apk` - Debug version (4.5MB)
- `android/` - Native Android project
- `capacitor.config.ts` - Capacitor configuration
- `build-apk.sh` - Build script

## 🔒 Security Notes

- Debug APKs are for development/testing only
- For production, always use signed release APKs
- Consider enabling ProGuard for release builds
- Test thoroughly on different Android versions and devices

---

🎉 Your PrintSoft ERP app is now ready for Android!
