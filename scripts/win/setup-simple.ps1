# PSSI Setup Script - Simplified Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PSSI v0.1 Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check execution policy
Write-Host "Checking PowerShell execution policy..." -ForegroundColor Yellow
$policy = Get-ExecutionPolicy -Scope CurrentUser
Write-Host "Current policy: $policy" -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed!" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "Checking pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    $pnpmVersion = pnpm --version
    Write-Host "Installed pnpm version: $pnpmVersion" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Error installing dependencies" -ForegroundColor Red
    exit 1
}

# Verify critical dependencies
Write-Host ""
Write-Host "Verifying critical dependencies..." -ForegroundColor Yellow
$deps = @("react", "express", "electron", "vite")
foreach ($dep in $deps) {
    if (Test-Path "node_modules\$dep") {
        Write-Host "  ✓ $dep" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $dep missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
