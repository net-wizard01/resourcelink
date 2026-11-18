Write-Host "?? Cleaning up old processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 4

Write-Host "??? Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path "frontend\.next") {
    Remove-Item -Recurse -Force "frontend\.next"
}

Write-Host "?? Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "?? Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd\frontend'; npm run dev"

Write-Host "? Both servers are starting in new windows!" -ForegroundColor Cyan
