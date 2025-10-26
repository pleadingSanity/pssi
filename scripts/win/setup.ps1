# PSSI Windows Setup Script
# This script installs dependencies and sets up the development environment

Write-Host "PSSI v0.1 Setup" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Some operations may fail." -ForegroundColor Yellow
    Write-Host ""
}

# Check Node.js version
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 20) {
            Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
        } else {
            Write-Host "✗ Node.js $nodeVersion is too old. Version 20+ required." -ForegroundColor Red
            Write-Host "  Please install Node.js 20 from https://nodejs.org/" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    Write-Host "  Please install Node.js 20 from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check Python version
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python (\d+)\.(\d+)") {
        $majorVersion = [int]$matches[1]
        $minorVersion = [int]$matches[2]
        if ($majorVersion -eq 3 -and $minorVersion -ge 11) {
            Write-Host "✓ Python $pythonVersion detected" -ForegroundColor Green
        } else {
            Write-Host "✗ Python $pythonVersion is too old. Version 3.11+ required." -ForegroundColor Red
            Write-Host "  Please install Python 3.11+ from https://www.python.org/" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "✗ Python not found" -ForegroundColor Red
    Write-Host "  Please install Python 3.11+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# Install pnpm
Write-Host "Installing pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version 2>&1
    Write-Host "✓ pnpm $pnpmVersion already installed" -ForegroundColor Green
} catch {
    npm install -g pnpm
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ pnpm installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install pnpm" -ForegroundColor Red
        exit 1
    }
}

# Create .env.local from .ENV.example
Write-Host "Setting up environment..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local already exists (skipping)" -ForegroundColor Green
} else {
    if (Test-Path ".ENV.example") {
        Copy-Item ".ENV.example" ".env.local"
        Write-Host "✓ Created .env.local from .ENV.example" -ForegroundColor Green
    } else {
        Write-Host "⚠ .ENV.example not found (skipping)" -ForegroundColor Yellow
    }
}

# Install Node dependencies
Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Node dependencies" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r python/tasks/requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env.local with your API keys and tokens"
Write-Host "  2. Run 'pnpm dev' to start the development server"
Write-Host "  3. Run 'pnpm test' to run tests"
Write-Host ""
