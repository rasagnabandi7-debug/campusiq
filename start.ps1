Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " CampusIQ — AI-Powered Student Success Platform" -ForegroundColor White
Write-Host " Predict Early. Intervene Smartly. Empower Every Student." -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Launching CampusIQ Server on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:8000"
node server/index.js
