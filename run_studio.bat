@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

set TORCH_HOME=%CD%\models
set XDG_CACHE_HOME=%CD%\models
set HF_HOME=%CD%\models
set HF_HUB_DISABLE_SYMLINKS_WARNING=1

echo ===================================================
echo     AuraVocal Studio - AI Vocal Separator
echo ===================================================
echo 1. Starting Backend API server on http://localhost:5000 ...
start "AuraVocal Backend API" cmd /k "python server.py"

timeout /t 2 >nul

echo 2. Starting Demucs AI Queue Watcher ...
start "AuraVocal AI Watcher" cmd /k "python watch.py"

timeout /t 1 >nul

echo 3. Starting Next.js Studio Frontend on http://localhost:3000 ...
cd frontend
start "AuraVocal Studio UI" cmd /k "npm run dev"

timeout /t 3 >nul

echo 4. Opening AuraVocal Studio in browser...
start http://localhost:3000/studio

echo ===================================================
echo   AuraVocal Studio is running!
echo   Frontend: http://localhost:3000/studio
echo   Backend:  http://localhost:5000
echo ===================================================
pause
