# PSSI Setup Script for Windows
# Run this script to set up the development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PSSI v0.1.0 Setup for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
    
    # Check if it's Node 20 or higher
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 20) {
        Write-Host "⚠ Warning: Node.js 20 or higher is recommended. Current version: $nodeVersion" -ForegroundColor Red
        Write-Host "Please download from: https://nodejs.org/" -ForegroundColor Yellow
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            exit 1
        }
    }
} catch {
    Write-Host "✗ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please download and install Node.js 20+ from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if pnpm is installed
Write-Host ""
Write-Host "Checking pnpm installation..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm is installed: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pnpm is not installed" -ForegroundColor Red
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ pnpm installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install pnpm" -ForegroundColor Red
        exit 1
    }
}

# Check if Python is installed
Write-Host ""
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Python is not installed (optional for full functionality)" -ForegroundColor Yellow
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies with pnpm..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create necessary directories if they don't exist
Write-Host ""
Write-Host "Ensuring directory structure..." -ForegroundColor Yellow
$dirs = @(
    "dist",
    "dist/electron",
    "dist/renderer", 
    "dist/server"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created directory: $dir" -ForegroundColor Green
    }
}

# Build the project
Write-Host ""
Write-Host "Building the project..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Build had some issues, but setup is complete" -ForegroundColor Yellow
}

# Final message
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor White
Write-Host "  pnpm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "To build for production:" -ForegroundColor White
Write-Host "  pnpm run build" -ForegroundColor Yellow
Write-Host ""
Write-Host "To run tests:" -ForegroundColor White
Write-Host "  pnpm test" -ForegroundColor Yellow
Write-Host ""
