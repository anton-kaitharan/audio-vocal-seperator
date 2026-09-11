@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

set TORCH_HOME=%CD%\models
set XDG_CACHE_HOME=%CD%\models
set HF_HOME=%CD%\models
set HF_HUB_DISABLE_SYMLINKS_WARNING=1

if exist demucs_ext\Scripts\activate.bat (
    call demucs_ext\Scripts\activate.bat
)

echo ===================================================
echo     AuraVocal - Karaoke Vocal Separator Studio
echo ===================================================
echo  Starting Web Dashboard at: http://localhost:5000
echo ===================================================

start http://localhost:5000
python server.py
pause
