# PSSI Deploy Hook Script
# Triggered by deploy webhooks

param(
    [string]$Event = "push"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PSSI Deploy Hook" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Event: $Event" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""

# Pull latest changes
Write-Host "Pulling latest changes..." -ForegroundColor Yellow
git pull
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to pull changes!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Build application
Write-Host "Building application..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
