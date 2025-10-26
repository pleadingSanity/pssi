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
