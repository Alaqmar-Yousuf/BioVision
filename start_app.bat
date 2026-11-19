@echo off
echo ========================================================
echo        Starting BioVision (Next.js 15 + FastAPI)
echo ========================================================

echo [1/2] Starting Python FastAPI ML Engine on port 8000...
start "BioVision FastAPI Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Next.js 15 Frontend on port 3000...
start "BioVision Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo App running!
echo Frontend: http://localhost:3000
echo ML Engine: http://localhost:8000/docs
echo ========================================================
