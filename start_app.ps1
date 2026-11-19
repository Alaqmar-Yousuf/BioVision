Write-Host "========================================================" -ForegroundColor Green
Write-Host "       Starting BioVision (Next.js 15 + FastAPI)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Write-Host "`n[1/2] Starting Python FastAPI ML Engine on port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Next.js 15 Frontend on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host "`nBioVision services launched!" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "ML Engine: http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green
