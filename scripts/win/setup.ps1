# PSSI Windows Setup Script
# Run with: Set-ExecutionPolicy Bypass -Scope Process -Force; .\scripts\win\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PSSI v0.1 - Windows Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "Some installations may require elevated privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Check for Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = $null
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    Write-Host "📥 Please install Node.js LTS from: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "   Download and run the Windows installer" -ForegroundColor Gray
}

# Check for Python
Write-Host "`nChecking Python..." -ForegroundColor Yellow
$pythonVersion = $null
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    Write-Host "📥 Please install Python 3.11 from: https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host "   Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Gray
}

# Check for pnpm
Write-Host "`nChecking pnpm..." -ForegroundColor Yellow
$pnpmVersion = $null
try {
    $pnpmVersion = pnpm --version 2>$null
    if ($pnpmVersion) {
        Write-Host "✅ pnpm found: $pnpmVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ pnpm not found" -ForegroundColor Red
    if ($nodeVersion) {
        Write-Host "📦 Installing pnpm via npm..." -ForegroundColor Cyan
        npm install -g pnpm
        $pnpmVersion = pnpm --version 2>$null
        if ($pnpmVersion) {
            Write-Host "✅ pnpm installed: $pnpmVersion" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Install Node.js first, then run: npm install -g pnpm" -ForegroundColor Yellow
    }
}

# Create .env.local if it doesn't exist
Write-Host "`nSetting up environment file..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Copy-Item ".ENV.example" ".env.local" -ErrorAction SilentlyContinue
    Write-Host "✅ Created .env.local from .ENV.example" -ForegroundColor Green
    Write-Host "📝 Please edit .env.local with your API keys and webhook URLs" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️  .env.local already exists" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allGood = $nodeVersion -and $pythonVersion -and $pnpmVersion

if ($allGood) {
    Write-Host "✅ All prerequisites installed!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Edit .env.local with your credentials" -ForegroundColor White
    Write-Host "  2. Run: pnpm install" -ForegroundColor White
    Write-Host "  3. Run: pnpm dev" -ForegroundColor White
} else {
    Write-Host "⚠️  Some prerequisites are missing" -ForegroundColor Yellow
    Write-Host "`nPlease install the missing items and run this script again" -ForegroundColor Cyan
}

Write-Host ""
# PSSI Setup Script for Windows
# Run this script to set up the development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PSSI v0.1 Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check for pnpm
Write-Host "Checking pnpm installation..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install pnpm!" -ForegroundColor Red
        exit 1
    }
    $pnpmVersion = pnpm --version
}
Write-Host "pnpm version: $pnpmVersion" -ForegroundColor Green

# Check for Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Python is not installed!" -ForegroundColor Yellow
    Write-Host "Python tasks will not work until Python 3.8+ is installed." -ForegroundColor Yellow
} else {
    Write-Host "Python version: $pythonVersion" -ForegroundColor Green
    
    # Install Python dependencies
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    python -m pip install -r python/requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Failed to install Python dependencies" -ForegroundColor Yellow
    }
}

# Install Node.js dependencies
Write-Host ""
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  pnpm dev              - Start development server" -ForegroundColor White
Write-Host "  pnpm electron:dev     - Start Electron app in dev mode" -ForegroundColor White
Write-Host "  pnpm build            - Build for production" -ForegroundColor White
Write-Host "  pnpm server:dev       - Start API server in dev mode" -ForegroundColor White
Write-Host "  pnpm lint             - Run linter" -ForegroundColor White
Write-Host ""
