# 🪟 PSSI - COMPLETE WINDOWS INSTALLATION GUIDE

## ✅ System Requirements

**Minimum:**
- Windows 10 (Version 1903 or later) / Windows 11
- 4GB RAM
- 2GB free disk space
- Internet connection

**Recommended:**
- Windows 11 (Latest version)
- 8GB+ RAM
- 5GB free disk space
- High-speed internet

---

## 📦 INSTALLATION METHOD 1: Desktop App (Electron)

### Step 1: Download & Install Prerequisites

**1.1 Install Node.js 20+ LTS**
- Download: https://nodejs.org/en/download/
- Choose: "Windows Installer (.msi)" - 64-bit
- Run installer with default settings
- Verify installation:
```powershell
node --version  # Should show v20.x.x or higher
npm --version   # Should show 10.x.x or higher
```

**1.2 Install pnpm (Fast Package Manager)**
```powershell
# Open PowerShell as Administrator
iwr https://get.pnpm.io/install.ps1 -useb | iex

# Restart PowerShell, then verify:
pnpm --version  # Should show 10.x.x or higher
```

**1.3 Install Git**
- Download: https://git-scm.com/download/win
- Run installer with default settings
- Verify:
```powershell
git --version  # Should show git version 2.x.x
```

### Step 2: Clone & Setup PSSI

**2.1 Clone Repository**
```powershell
# Navigate to where you want PSSI installed
cd C:\Users\YourUsername\Documents

# Clone the repository
git clone https://github.com/pleadingSanity/pssi.git
cd pssi
```

**2.2 Install Dependencies**
```powershell
# Install all required packages (takes 2-5 minutes)
pnpm install

# Should complete with no errors
```

**2.3 Configure API Keys**

Create `.env` file in the root directory:
```powershell
# Create .env file
notepad .env
```

Add your API keys (get them from AI providers):
```env
# OpenAI (Required)
VITE_OPENAI_API_KEY=sk-proj-...your-key-here...

# Anthropic Claude (Required)
VITE_ANTHROPIC_API_KEY=sk-ant-...your-key-here...

# Google Gemini (Required)
VITE_GEMINI_API_KEY=AIza...your-key-here...

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_...your-key-here...
STRIPE_WEBHOOK_SECRET=whsec_...your-key-here...
```

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google Gemini: https://aistudio.google.com/app/apikey

Save and close.

### Step 3: Build & Run Desktop App

**3.1 Build the Application**
```powershell
# Build the Electron desktop app
pnpm run electron:build

# This creates the .exe installer in dist/ folder
```

**3.2 Install the App**
```powershell
# Navigate to dist folder
cd dist

# Run the installer (name varies by version)
./PSSI-Setup-1.0.0.exe
```

**3.3 Launch PSSI**
- App will be installed to: `C:\Users\YourUsername\AppData\Local\Programs\pssi`
- Desktop shortcut will be created
- Start menu entry will be added
- Double-click to launch!

### Step 4: First-Time Setup

**4.1 Verify Installation**
1. Launch PSSI
2. Check status bar (bottom): Should show "🟢 All Systems Operational"
3. Test AI chat: Ask "Hello, are you working?"

**4.2 Configure Settings** (see Settings section below)

---

## 🌐 INSTALLATION METHOD 2: Web App (Browser)

### Option A: Use Live Deployment

**Easiest Method - No Installation Required:**
1. Open browser: Chrome, Edge, Firefox, or Safari
2. Navigate to: https://pssi.netlify.app
3. Bookmark for easy access
4. Works instantly!

**Features:**
- ✅ All 22 AI functions
- ✅ Real-time updates
- ✅ No installation needed
- ✅ Works on any device
- ❌ Requires internet connection

### Option B: Run Local Web Server

**For offline use or development:**

```powershell
# In PSSI directory
cd C:\Users\YourUsername\Documents\pssi

# Start local web server
pnpm run dev

# Server starts at: http://localhost:5173
# Open in browser
```

**Development Mode Features:**
- ✅ Hot reload (instant updates)
- ✅ Full debugging tools
- ✅ Offline capable
- ✅ Maximum performance

---

## 🚀 QUICK START GUIDE

### Method 1: Express Install (5 Minutes)

```powershell
# 1. Install prerequisites
winget install -e --id OpenJS.NodeJS.LTS
winget install -e --id Git.Git

# 2. Install pnpm
iwr https://get.pnpm.io/install.ps1 -useb | iex

# 3. Clone and setup (restart PowerShell first)
git clone https://github.com/pleadingSanity/pssi.git
cd pssi
pnpm install

# 4. Add API keys to .env file
notepad .env
# Paste your keys, save, close

# 5. Run in browser
pnpm run dev
# Opens at http://localhost:5173
```

### Method 2: Use Live Web App (30 Seconds)

```
1. Open browser
2. Go to: https://pssi.netlify.app
3. Start using immediately!
```

---

## ⚙️ MAXIMUM SETTINGS & OPTIMIZATION

### Performance Settings

**1. Memory Optimization**
```powershell
# Create/edit pssi.config.json
notepad pssi.config.json
```

```json
{
  "performance": {
    "maxMemory": "4096",        // MB - Increase for better performance
    "cacheSize": "1024",         // MB - Cache AI responses
    "workers": 4,                // CPU cores to use
    "gpuAcceleration": true,     // Use GPU if available
    "prefetchEnabled": true      // Preload common queries
  }
}
```

**2. Network Optimization**
```json
{
  "network": {
    "timeout": 30000,            // Request timeout (ms)
    "retries": 3,                // Auto-retry failed requests
    "maxConcurrent": 5,          // Parallel requests
    "compression": true,         // Compress responses
    "http2": true                // Use HTTP/2 protocol
  }
}
```

**3. AI Provider Settings**
```json
{
  "ai": {
    "defaultProvider": "sanity",  // "sanity", "openai", "anthropic", "gemini"
    "fallbackEnabled": true,      // Auto-switch if provider fails
    "loadBalancing": true,        // Distribute load across providers
    "cacheDuration": 3600,        // Cache responses (seconds)
    "maxTokens": 4000,            // Max response length
    "temperature": 0.7,           // Creativity (0-1)
    "streamingEnabled": true      // Real-time streaming responses
  }
}
```

**4. UI/UX Settings**
```json
{
  "ui": {
    "theme": "dark",              // "dark", "light", "auto"
    "fontSize": 16,               // Base font size
    "animations": true,           // Smooth animations
    "soundEffects": false,        // Audio feedback
    "notifications": true,        // Desktop notifications
    "compactMode": false,         // Dense layout
    "colorScheme": "purple"       // "purple", "blue", "green", "red"
  }
}
```

**5. Privacy & Security**
```json
{
  "privacy": {
    "saveHistory": true,          // Save conversation history
    "encryptLocal": true,         // Encrypt local data
    "analytics": false,           // Usage analytics
    "crashReports": true,         // Error reporting
    "clearOnExit": false          // Clear data on close
  }
}
```

**6. Advanced Features**
```json
{
  "advanced": {
    "developerMode": false,       // Show debug info
    "experimentalFeatures": true, // Beta features
    "autoUpdate": true,           // Auto-install updates
    "offlineMode": false,         // Work without internet
    "customPrompts": true,        // User-defined prompts
    "macros": true,               // Keyboard shortcuts
    "voiceInput": false           // Speech recognition
  }
}
```

### Complete pssi.config.json Example

```json
{
  "version": "1.0.0",
  "performance": {
    "maxMemory": "4096",
    "cacheSize": "1024",
    "workers": 4,
    "gpuAcceleration": true,
    "prefetchEnabled": true
  },
  "network": {
    "timeout": 30000,
    "retries": 3,
    "maxConcurrent": 5,
    "compression": true,
    "http2": true
  },
  "ai": {
    "defaultProvider": "sanity",
    "fallbackEnabled": true,
    "loadBalancing": true,
    "cacheDuration": 3600,
    "maxTokens": 4000,
    "temperature": 0.7,
    "streamingEnabled": true,
    "providers": {
      "openai": {
        "enabled": true,
        "models": ["gpt-4o", "gpt-4o-mini"],
        "priority": 1
      },
      "anthropic": {
        "enabled": true,
        "models": ["claude-3-5-sonnet-20241022"],
        "priority": 2
      },
      "gemini": {
        "enabled": true,
        "models": ["gemini-2.0-flash-exp"],
        "priority": 3
      }
    }
  },
  "ui": {
    "theme": "dark",
    "fontSize": 16,
    "animations": true,
    "soundEffects": false,
    "notifications": true,
    "compactMode": false,
    "colorScheme": "purple"
  },
  "privacy": {
    "saveHistory": true,
    "encryptLocal": true,
    "analytics": false,
    "crashReports": true,
    "clearOnExit": false
  },
  "advanced": {
    "developerMode": false,
    "experimentalFeatures": true,
    "autoUpdate": true,
    "offlineMode": false,
    "customPrompts": true,
    "macros": true,
    "voiceInput": false
  },
  "keyboard": {
    "sendMessage": "Ctrl+Enter",
    "newChat": "Ctrl+N",
    "clearChat": "Ctrl+L",
    "settings": "Ctrl+,",
    "search": "Ctrl+F",
    "voiceInput": "Ctrl+Shift+V"
  }
}
```

---

## 🔧 TROUBLESHOOTING

### Common Issues & Fixes

**Issue 1: "API Key Not Found"**
```powershell
# Check .env file exists
Test-Path .env  # Should return True

# Verify API keys are set
Get-Content .env

# Fix: Add missing keys
notepad .env
```

**Issue 2: "Port 5173 Already in Use"**
```powershell
# Find process using port
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <process_id> /F

# Or use different port
pnpm run dev --port 5174
```

**Issue 3: "pnpm Not Recognized"**
```powershell
# Reinstall pnpm globally
npm install -g pnpm

# Or use npx
npx pnpm install
```

**Issue 4: "Git Clone Failed"**
```powershell
# Use HTTPS instead of SSH
git clone https://github.com/pleadingSanity/pssi.git

# Or download ZIP
# https://github.com/pleadingSanity/pssi/archive/refs/heads/main.zip
```

**Issue 5: "Build Failed - Out of Memory"**
```powershell
# Increase Node.js memory limit
$env:NODE_OPTIONS="--max-old-space-size=4096"
pnpm run build
```

**Issue 6: "Electron App Won't Start"**
```powershell
# Clear cache and rebuild
pnpm run clean
pnpm install
pnpm run electron:build
```

**Issue 7: "AI Responses Slow"**
- Check internet speed (need 10+ Mbps)
- Enable response caching in settings
- Use GPT-4o Mini instead of GPT-4o
- Enable load balancing across providers

**Issue 8: "Quota Exceeded Error"**
- Check OpenAI usage: https://platform.openai.com/usage
- Switch to Anthropic or Gemini
- Wait for quota reset (monthly)
- Upgrade API plan

---

## 🚀 PERFORMANCE OPTIMIZATION

### Windows-Specific Tweaks

**1. Disable Windows Defender Real-Time Scanning for PSSI Folder**
```powershell
# Run as Administrator
Add-MpPreference -ExclusionPath "C:\Users\YourUsername\Documents\pssi"
```

**2. Set High Performance Power Plan**
```powershell
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
```

**3. Disable Unnecessary Startup Programs**
```powershell
# Open Task Manager (Ctrl+Shift+Esc)
# Startup tab → Disable unused apps
```

**4. Increase Virtual Memory**
```
Control Panel → System → Advanced → Performance Settings
→ Advanced → Virtual Memory → Change
- Uncheck "Automatically manage"
- Custom size: Initial 4096 MB, Maximum 8192 MB
```

**5. Use SSD for PSSI Installation**
- Install PSSI on SSD (C:\ drive usually)
- Move cache to SSD
- Faster load times, better performance

---

## 📱 WINDOWS 11 SPECIFIC FEATURES

### Enable Hardware Acceleration

**1. GPU Settings**
```
Settings → System → Display → Graphics Settings
→ Add PSSI.exe → Options → High Performance
```

**2. Windows Terminal Integration**
```powershell
# Install Windows Terminal
winget install Microsoft.WindowsTerminal

# Set as default terminal
Settings → Default Terminal → Windows Terminal
```

**3. Virtual Desktop Support**
- PSSI supports Windows 11 virtual desktops
- Pin PSSI to all desktops for quick access
- Shortcut: Win+Tab → Right-click PSSI → "Show on all desktops"

---

## 🔒 SECURITY BEST PRACTICES

**1. Protect API Keys**
```powershell
# Never commit .env file to Git
echo ".env" >> .gitignore

# Use environment variables instead
[System.Environment]::SetEnvironmentVariable('VITE_OPENAI_API_KEY', 'your-key', 'User')
```

**2. Enable Windows Firewall Rules**
```powershell
# Allow PSSI through firewall
New-NetFirewallRule -DisplayName "PSSI" -Direction Inbound -Program "C:\...\PSSI.exe" -Action Allow
```

**3. Keep Software Updated**
```powershell
# Update Node.js
winget upgrade OpenJS.NodeJS.LTS

# Update PSSI
cd pssi
git pull origin main
pnpm install
pnpm run build
```

---

## 📊 MONITORING & MAINTENANCE

### Performance Monitoring

**1. Check Resource Usage**
```powershell
# CPU and Memory usage
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object ProcessName, CPU, WorkingSet
```

**2. Clear Cache**
```powershell
# Clear Node.js cache
pnpm cache clean

# Clear browser cache (Ctrl+Shift+Del in browser)
```

**3. Update Dependencies**
```powershell
# Check for outdated packages
pnpm outdated

# Update all packages
pnpm update
```

---

## 🎓 ADVANCED USAGE

### Custom Scripts

Create `custom-launch.ps1`:
```powershell
# Custom PSSI launcher with optimizations
$env:NODE_ENV = "production"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Start PSSI
cd C:\Users\YourUsername\Documents\pssi
pnpm run dev

# Optional: Open browser automatically
Start-Process "http://localhost:5173"
```

### Batch Operations

Create `pssi-batch.ps1` for bulk tasks:
```powershell
# Process multiple prompts
$prompts = @(
    "Explain quantum computing",
    "Write a Python function for sorting",
    "Create a React component"
)

foreach ($prompt in $prompts) {
    # Call PSSI API
    $response = Invoke-RestMethod -Uri "http://localhost:5173/api/ai-chat" `
        -Method POST `
        -Body (@{prompt=$prompt} | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "Prompt: $prompt"
    Write-Host "Response: $($response.content)"
    Write-Host "---"
}
```

---

## 🆘 SUPPORT & RESOURCES

**Documentation:**
- Main README: https://github.com/pleadingSanity/pssi/blob/main/README.md
- API Docs: https://github.com/pleadingSanity/pssi/blob/main/API_DOCS.md
- Settings Guide: This file!

**Community:**
- GitHub Issues: https://github.com/pleadingSanity/pssi/issues
- Discussions: https://github.com/pleadingSanity/pssi/discussions

**Get Help:**
1. Check troubleshooting section above
2. Search existing GitHub issues
3. Create new issue with:
   - Windows version
   - Error message
   - Steps to reproduce
   - Logs from console

**Logs Location:**
- Electron logs: `%APPDATA%\pssi\logs`
- Node.js logs: `pssi\logs`
- Browser console: F12 → Console tab

---

## ✅ INSTALLATION CHECKLIST

- [ ] Node.js 20+ installed
- [ ] pnpm installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] API keys added to `.env` file
- [ ] App built (`pnpm run build` or `pnpm run electron:build`)
- [ ] App launches successfully
- [ ] AI providers verified (all 3 working)
- [ ] Settings configured (pssi.config.json)
- [ ] Performance optimized (see optimization section)
- [ ] Firewall rules set (if needed)
- [ ] Shortcuts created (desktop, start menu)

**Installation Time:**
- Express: 5-10 minutes
- Full setup: 15-20 minutes
- With optimization: 25-30 minutes

---

## 🚀 YOU'RE READY!

**PSSI is now installed and optimized for Windows!**

**Quick Commands:**
```powershell
# Start web version
pnpm run dev

# Build desktop app
pnpm run electron:build

# Run tests
pnpm test

# Update PSSI
git pull && pnpm install && pnpm run build
```

**Enjoy the most powerful AI system ever built! 💜🤖**
