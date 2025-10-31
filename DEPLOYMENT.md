# PSSI Deployment Guide

## Windows Deployment

### Prerequisites
- Node.js 20+
- pnpm 8+
- Your OpenAI API key

### Build for Windows

1. **Install dependencies:**
```bash
pnpm install
```

2. **Build the app:**
```bash
pnpm run package:win
```

This creates installers in the `release/` directory:
- `PSSI-0.1.0-x64-setup.exe` - 64-bit installer
- `PSSI-0.1.0-ia32-setup.exe` - 32-bit installer
- `PSSI-0.1.0-x64.exe` - Portable version (no install needed)

### Installation

**Option 1: Installer (Recommended)**
1. Download `PSSI-0.1.0-x64-setup.exe`
2. Run the installer
3. Choose installation directory
4. Create `.env` file in installation directory with your OpenAI key
5. Launch PSSI from Start Menu or Desktop

**Option 2: Portable**
1. Download `PSSI-0.1.0-x64.exe`
2. Create folder (e.g., `C:\PSSI`)
3. Place portable exe and create `.env` file:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Run the exe

---

## Android Deployment (Capacitor)

PSSI can be deployed to Android using Capacitor. Here's how:

### Prerequisites
- Android Studio
- Java JDK 11+
- Gradle

### Setup Capacitor for Android

1. **Install Capacitor:**
```bash
pnpm add @capacitor/core @capacitor/cli @capacitor/android
```

2. **Initialize Capacitor:**
```bash
npx cap init PSSI com.pleadingsanity.pssi --web-dir=dist/renderer
```

3. **Add Android platform:**
```bash
npx cap add android
```

4. **Build the web app:**
```bash
pnpm run build:renderer
```

5. **Sync to Android:**
```bash
npx cap sync android
```

6. **Open in Android Studio:**
```bash
npx cap open android
```

7. **Build APK in Android Studio:**
   - Click Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK will be in `android/app/build/outputs/apk/`

### Deploy to Device

**Option 1: Direct Install**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Option 2: Upload to Google Play Console**
- Build signed release APK/AAB
- Upload to Google Play Console
- Follow Google's review process

---

## Quick Deploy Summary

### Windows (Today - Ready Now!)
```bash
# 1. Install & Build
pnpm install
pnpm run package:win

# 2. Installer is in: release/PSSI-0.1.0-x64-setup.exe
# 3. Share this file - users just run it!
```

### Android (Additional Setup Required)
```bash
# 1. Install Capacitor
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize & build
npx cap init PSSI com.pleadingsanity.pssi --web-dir=dist/renderer
npx cap add android
pnpm run build:renderer
npx cap sync android

# 3. Open Android Studio and build APK
npx cap open android
```

---

## Configuration

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=sk-your-key-here
PORT=3000
NODE_ENV=production
```

---

## Features Available

✅ **AI Chat** - OpenAI-powered conversations
✅ **Task Automation** - AI analyzes and automates tasks
✅ **System Optimization** - AI suggests system improvements
✅ **System Stats** - Real-time monitoring
✅ **Repo Healing** - Git repository management

---

## Cosmic Branding

Colors:
- Cyan: `#00fff0`
- Magenta: `#ff00ff`
- Abyss: `#0b0b1a`

Mission: "Sanity is Signal. Love is Infrastructure. Rise From Madness."

---

## Support

For issues: https://github.com/pleadingSanity/pssi/issues
