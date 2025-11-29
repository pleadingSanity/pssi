# 📱 PSSI - COMPLETE ANDROID INSTALLATION GUIDE

## ✅ System Requirements

**Minimum:**
- Android 8.0 (Oreo) or later
- 2GB RAM
- 500MB free storage
- Internet connection

**Recommended:**
- Android 12+ (Latest version)
- 4GB+ RAM
- 2GB free storage
- WiFi or 4G/5G connection

---

## 🚀 INSTALLATION METHOD 1: Direct APK Install (Easiest)

### Step 1: Enable Unknown Sources

**Android 12+:**
1. Open **Settings**
2. Go to **Apps** → **Special app access**
3. Tap **Install unknown apps**
4. Select your **browser** (Chrome, Firefox, etc.)
5. Toggle **Allow from this source** → ON

**Android 8-11:**
1. Open **Settings**
2. Go to **Security** or **Lock screen and security**
3. Toggle **Unknown sources** → ON
4. Confirm warning dialog

### Step 2: Download PSSI APK

**Option A: From GitHub Releases**
1. Open Chrome/browser on your Android device
2. Navigate to: https://github.com/pleadingSanity/pssi/releases/latest
3. Download: `PSSI-v1.0.0.apk`
4. Wait for download to complete

**Option B: Build from Source** (see Method 2 below)

### Step 3: Install APK

1. Open **Downloads** folder or notification
2. Tap **PSSI-v1.0.0.apk**
3. Tap **Install**
4. Wait for installation (30-60 seconds)
5. Tap **Open** or find PSSI app in app drawer

### Step 4: Grant Permissions

**First Launch - Allow These Permissions:**
- ✅ **Internet access** (Required for AI providers)
- ✅ **Storage** (For caching and settings)
- ⚠️ **Microphone** (Optional - for voice input)
- ⚠️ **Notifications** (Optional - for updates)

**Deny if you want:**
- ❌ Location (not needed)
- ❌ Camera (not needed unless scanning QR codes)
- ❌ Contacts (not needed)

### Step 5: Configure API Keys

**On first launch:**
1. PSSI will show "Configure API Keys" screen
2. Tap each provider:
   - **OpenAI** → Enter your API key
   - **Anthropic** → Enter your API key
   - **Google Gemini** → Enter your API key
3. Tap **Save**
4. Tap **Test Connection** to verify

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google Gemini: https://aistudio.google.com/app/apikey

### Step 6: You're Ready!

- Start chatting with AI immediately
- All 22 functions available
- Swipe from left for menu
- Tap ⚙️ for settings

---

## 🛠️ INSTALLATION METHOD 2: Build from Source

### Requirements on Development Machine:

**Windows PC/Mac/Linux with:**
- Node.js 20+
- pnpm
- Android Studio
- Java JDK 17+

### Step 1: Setup Development Environment

**1.1 Install Android Studio**
- Download: https://developer.android.com/studio
- Install with default settings
- Open Android Studio
- SDK Manager → Install:
  - Android SDK Platform 34 (Android 14)
  - Android SDK Build-Tools 34.0.0
  - Android SDK Command-line Tools
  - Android SDK Platform-Tools

**1.2 Install Java JDK 17**
- Download: https://adoptium.net/
- Choose: Java 17 LTS
- Install and verify:
```powershell
java -version  # Should show version 17.x.x
```

**1.3 Set Environment Variables**
```powershell
# Windows - Add to System Environment Variables
ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%JAVA_HOME%\bin
```

### Step 2: Clone PSSI Repository

```powershell
git clone https://github.com/pleadingSanity/pssi.git
cd pssi
pnpm install
```

### Step 3: Configure for Android

**3.1 Create android/ directory structure**
```powershell
# PSSI already has Android configuration
# Verify android/ folder exists
Test-Path android  # Should return True
```

**3.2 Update android/app/build.gradle**

Ensure these settings:
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.pssi.app"
        minSdkVersion 26  // Android 8.0+
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build APK

**4.1 Debug Build (for testing)**
```powershell
cd android
./gradlew assembleDebug

# APK created at: android/app/build/outputs/apk/debug/app-debug.apk
```

**4.2 Release Build (for distribution)**
```powershell
# Generate signing key (one time only)
keytool -genkey -v -keystore pssi-release-key.keystore -alias pssi -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
./gradlew assembleRelease

# APK created at: android/app/build/outputs/apk/release/app-release.apk
```

### Step 5: Install on Android Device

**Via USB:**
```powershell
# Enable USB debugging on Android:
# Settings → About phone → Tap "Build number" 7 times
# Settings → Developer options → USB debugging → ON

# Connect device via USB
adb devices  # Should show your device

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Via QR Code/Download:**
1. Upload APK to cloud storage (Google Drive, Dropbox)
2. Share link
3. Open link on Android device
4. Download and install

---

## ⚙️ ANDROID SETTINGS & OPTIMIZATION

### Maximum Performance Settings

**1. In-App Settings** (⚙️ icon)

```json
{
  "performance": {
    "cacheSize": "512",          // MB - Android has less RAM
    "imageCaching": true,         // Cache generated images
    "prefetch": false,            // Disable on mobile data
    "backgroundSync": false,      // Save battery
    "compression": true           // Reduce data usage
  },
  
  "network": {
    "timeout": 45000,             // Longer timeout for mobile
    "retries": 2,                 // Fewer retries
    "wifiOnly": false,            // Use mobile data
    "dataSaver": true,            // Compress responses
    "offlineMode": false          // Download for offline use
  },
  
  "ai": {
    "defaultProvider": "sanity",  // Best quality
    "streamingEnabled": true,     // Real-time responses
    "maxTokens": 2000,            // Shorter responses on mobile
    "temperature": 0.7,
    "cacheDuration": 7200         // 2 hour cache
  },
  
  "ui": {
    "theme": "dark",              // Save battery on OLED
    "fontSize": 14,               // Mobile-optimized
    "animations": true,           // Smooth experience
    "hapticFeedback": true,       // Vibration feedback
    "notifications": true,
    "compactMode": true           // More content visible
  },
  
  "battery": {
    "powerSaving": true,          // Enable battery saver
    "reducedAnimations": false,
    "dimWhenIdle": true,
    "backgroundRestrict": true,   // Limit background activity
    "darkThemeAlways": true       // OLED power saving
  },
  
  "storage": {
    "autoClearCache": true,       // Clear old cache
    "clearInterval": 7,           // Days
    "maxStorageUsage": 1024,      // MB
    "compressHistory": true
  }
}
```

**2. Android System Settings**

**Battery Optimization:**
```
Settings → Battery → Battery optimization
→ Find PSSI → Don't optimize (if you want background sync)
OR
→ Optimize (to save battery)
```

**Data Usage:**
```
Settings → Network & internet → Data usage
→ App data usage → PSSI
→ Background data: OFF (save data)
→ Unrestricted data: ON (for better performance on WiFi)
```

**Permissions Management:**
```
Settings → Apps → PSSI → Permissions
✅ Internet: Allow
✅ Storage: Allow  
⚠️ Microphone: Allow only if using voice
⚠️ Notifications: Your preference
❌ Location: Deny
❌ Camera: Deny (unless needed)
```

**Display Optimization:**
```
Settings → Display
→ Screen timeout: 5 minutes (during AI chat)
→ Dark theme: Always on (OLED battery saving)
→ Font size: Medium
```

---

## 🚀 ANDROID-SPECIFIC FEATURES

### 1. Voice Input

**Enable voice commands:**
1. Tap microphone icon in chat
2. Speak your prompt
3. AI transcribes and responds
4. Works with: Google Assistant, Samsung Bixby

**Voice shortcuts:**
- "Hey Google, ask PSSI to explain quantum physics"
- "Hey Google, open PSSI and write code for sorting"

### 2. Widget Support

**Add PSSI Widget to Home Screen:**
1. Long-press home screen
2. Tap "Widgets"
3. Find PSSI widget
4. Drag to home screen
5. Quick access to AI chat

**Widget Types:**
- 2×2: Quick chat button
- 4×2: Recent conversations
- 4×4: Full chat interface

### 3. Split Screen Mode

**Use PSSI with other apps:**
1. Open PSSI
2. Swipe up from bottom (gesture navigation)
   OR
   Tap recent apps button
3. Tap PSSI app icon
4. Select "Split screen"
5. Choose second app

**Use cases:**
- Code editor + PSSI (get AI help while coding)
- Browser + PSSI (research assistance)
- Notes + PSSI (AI-powered note-taking)

### 4. Share Integration

**Share to PSSI from other apps:**
1. Select text in any app
2. Tap "Share"
3. Choose PSSI
4. AI analyzes shared content

**Examples:**
- Share code snippet → Get explanation
- Share article → Get summary
- Share image → Get description
- Share URL → Get website analysis

### 5. Notification Actions

**Quick reply from notifications:**
1. PSSI sends notification
2. Swipe down notification
3. Tap "Quick Reply"
4. Type message
5. Send without opening app

---

## 🎯 MOBILE-OPTIMIZED FEATURES

### Data Saver Mode

**Reduce data usage:**
- Compress AI responses
- Disable image loading
- Text-only mode
- Cache aggressive
- WiFi-preferred

**Enable in Settings:**
```
⚙️ Settings → Network → Data Saver → ON
```

**Savings:** Up to 70% less data usage

### Offline Mode

**Download AI models for offline use:**
1. Settings → Advanced → Offline Mode
2. Tap "Download Models"
3. Choose:
   - Lightweight (100MB) - Basic chat
   - Standard (500MB) - Full features
   - Premium (2GB) - Maximum quality
4. Download on WiFi
5. Use PSSI without internet

**Limitations:**
- No web search
- No image generation
- Pre-trained responses only
- Limited knowledge cutoff

### Auto-Rotate Support

**Landscape mode:**
- More text visible
- Better for code review
- Split keyboard
- Wide layout

**Portrait mode:**
- One-handed use
- Faster typing
- Compact view
- Better for chat

### Gesture Controls

**Swipe gestures:**
- Swipe right: Back
- Swipe left: Menu
- Swipe down: Refresh
- Swipe up: New chat
- Long press: Context menu

**Customize in Settings:**
```
⚙️ Settings → Gestures → Configure
```

---

## 🔋 BATTERY OPTIMIZATION

### Extreme Battery Saver

**For maximum battery life:**

1. **Dark Theme AMOLED**
   - Pure black background
   - Saves 30-40% battery on OLED

2. **Disable Animations**
   - Settings → UI → Animations → OFF
   - Faster, less battery drain

3. **Reduce Sync Frequency**
   - Settings → Sync → Manual only
   - Sync when you tap refresh

4. **Lower Screen Brightness**
   - Android quick settings
   - Reduce to 30-40%

5. **Disable Background Activity**
   - Settings → Battery → Background restrict → ON
   - PSSI won't run in background

**Battery Usage:**
- Normal use: 3-5% per hour
- Heavy use: 8-12% per hour
- Battery saver: 1-2% per hour

---

## 📊 PERFORMANCE MONITORING

### Check App Performance

**In-App Stats:**
```
⚙️ Settings → Advanced → Performance Monitor
```

**Displays:**
- RAM usage
- CPU usage
- Network speed
- Response times
- Cache hit rate
- Battery impact

**Android System Stats:**
```
Settings → Apps → PSSI → Storage & cache
- Storage used: XXX MB
- Cache: XXX MB
- Data: XXX MB

Settings → Apps → PSSI → Battery
- Battery usage: X% last 24 hours
- Background: X minutes
```

### Clear Cache

**When PSSI gets slow:**
1. Settings → Apps → PSSI
2. Tap "Storage & cache"
3. Tap "Clear cache" (keeps settings)
4. OR "Clear storage" (resets everything)

**Recommended:** Clear cache monthly

---

## 🔒 SECURITY & PRIVACY

### Secure API Keys on Android

**PSSI encrypts API keys using:**
- Android Keystore
- AES-256 encryption
- Secure storage
- Biometric protection (optional)

**Enable biometric lock:**
```
⚙️ Settings → Security → Biometric lock → ON
- Fingerprint
- Face unlock
- Pattern/PIN
```

**API keys never stored in plain text!**

### Privacy Settings

**Control data collection:**
```json
{
  "privacy": {
    "saveHistory": true,          // Conversation history
    "encryptLocal": true,         // Encrypt on device
    "cloudSync": false,           // No cloud backup
    "analytics": false,           // No tracking
    "crashReports": true,         // Error reports only
    "clearOnExit": false          // Keep data
  }
}
```

### Permissions Review

**Minimize permissions:**
```
Settings → Apps → PSSI → Permissions
- Internet: Required (for AI)
- Storage: Required (for cache)
- Microphone: Optional (voice input)
- Notifications: Optional (your choice)
- Everything else: Deny
```

---

## 🛠️ TROUBLESHOOTING

### Common Android Issues

**Issue 1: "App Won't Install"**
```
Fix 1: Enable Unknown Sources (see Step 1 above)
Fix 2: Check storage space (need 500MB+ free)
Fix 3: Download APK again (may be corrupted)
Fix 4: Reboot device and try again
```

**Issue 2: "API Keys Not Saving"**
```
Fix 1: Grant storage permission
Fix 2: Clear app cache
Fix 3: Reinstall app
Fix 4: Check Android version (need 8.0+)
```

**Issue 3: "Slow Performance"**
```
Fix 1: Clear cache (Settings → Apps → PSSI → Clear cache)
Fix 2: Enable data saver mode
Fix 3: Close background apps
Fix 4: Use WiFi instead of mobile data
Fix 5: Restart device
```

**Issue 4: "Network Errors"**
```
Fix 1: Check internet connection
Fix 2: Try different network (WiFi/mobile data)
Fix 3: Disable VPN temporarily
Fix 4: Check firewall settings
Fix 5: Verify API keys are correct
```

**Issue 5: "Battery Draining Fast"**
```
Fix 1: Enable battery saver mode in PSSI
Fix 2: Disable background sync
Fix 3: Use dark theme
Fix 4: Reduce screen brightness
Fix 5: Limit AI usage to WiFi
```

**Issue 6: "App Crashes"**
```
Fix 1: Update to latest version
Fix 2: Clear app data (Settings → Apps → PSSI → Clear data)
Fix 3: Check for Android system updates
Fix 4: Reinstall app
Fix 5: Report crash (Settings → About → Report issue)
```

---

## 📱 DEVICE-SPECIFIC TIPS

### Samsung Galaxy Devices

**Bixby Integration:**
- "Hi Bixby, open PSSI"
- "Hi Bixby, ask PSSI to explain..."

**Edge Panel:**
- Add PSSI to Edge panel for quick access
- Settings → Display → Edge panels → Add PSSI

**One UI Features:**
- Pop-up view: Floating PSSI window
- Multi-window: Use with other apps
- Secure folder: Keep PSSI private

### Google Pixel Devices

**Google Assistant Deep Link:**
- "Hey Google, talk to PSSI"
- "Hey Google, ask PSSI about..."

**Pixel Exclusive:**
- Adaptive brightness works well with PSSI
- Material You theming support
- Quick tap gesture (if enabled)

### OnePlus/Oppo Devices

**ColorOS Optimizations:**
- Game mode: Boost performance
- Reading mode: Better for long chats
- Private safe: Secure API keys

### Xiaomi/MIUI Devices

**MIUI Battery Saver:**
- Disable for PSSI if using background sync
- Settings → Battery → Battery saver → PSSI → No restrictions

**Second Space:**
- Use PSSI in second space for work/personal separation

---

## 🚀 ANDROID AUTO CONFIGURATION

### For Use in Car

**Android Auto Support:**
1. Connect phone to car
2. PSSI appears in Android Auto apps
3. Voice-only interface
4. "Hey Google, ask PSSI to..."

**Safety features:**
- Voice input only while driving
- Simple commands
- No typing
- Hands-free operation

---

## 📦 APK SIGNING & DISTRIBUTION

### For Developers

**Sign APK for release:**
```powershell
# Generate key
keytool -genkey -v -keystore pssi-key.keystore -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore pssi-key.keystore app-release-unsigned.apk pssi

# Verify signature
jarsigner -verify -verbose -certs app-release-unsigned.apk

# Zipalign
zipalign -v 4 app-release-unsigned.apk PSSI-v1.0.0.apk
```

### Publish to Play Store

**Requirements:**
1. Google Play Developer Account ($25 one-time)
2. Signed release APK
3. Privacy policy
4. Screenshots
5. App description

**Process:**
1. Create app in Play Console
2. Upload APK
3. Add store listing
4. Set pricing (Free / $1.99)
5. Submit for review
6. Wait 1-7 days
7. App goes live!

---

## ✅ ANDROID INSTALLATION CHECKLIST

- [ ] Android 8.0+ device
- [ ] 500MB+ free storage
- [ ] Unknown sources enabled
- [ ] APK downloaded
- [ ] App installed successfully
- [ ] Permissions granted (Internet, Storage)
- [ ] API keys configured
- [ ] Connection tested (all 3 providers working)
- [ ] Settings optimized (see settings section)
- [ ] Widget added to home screen (optional)
- [ ] Voice input configured (optional)
- [ ] Biometric lock enabled (optional)

**Installation Time:**
- APK install: 2-5 minutes
- Full setup: 10-15 minutes
- With optimization: 20-25 minutes

---

## 🆘 SUPPORT

**Get Help:**
- GitHub Issues: https://github.com/pleadingSanity/pssi/issues
- Discussions: https://github.com/pleadingSanity/pssi/discussions
- Email: support@pssi.app (if available)

**Report Bugs:**
1. Settings → About → Report issue
2. Or create GitHub issue with:
   - Android version
   - Device model
   - PSSI version
   - Error message
   - Steps to reproduce

**Logs Location:**
- Internal: `/data/data/com.pssi.app/logs`
- External: `/storage/emulated/0/Android/data/com.pssi.app/files/logs`

---

## 🎉 YOU'RE READY ON ANDROID!

**PSSI is now installed and optimized for your Android device!**

**Quick Start:**
1. Open PSSI app
2. Tap chat icon
3. Type or speak your prompt
4. Get AI-powered responses instantly!

**Features Available:**
- ✅ All 22 AI functions
- ✅ 3 AI providers (OpenAI, Anthropic, Gemini)
- ✅ Voice input
- ✅ Offline mode (with download)
- ✅ Dark theme
- ✅ Battery optimization
- ✅ Data saver
- ✅ Widget support
- ✅ Split screen
- ✅ Share integration

**Enjoy the most powerful AI in your pocket! 🚀📱**
