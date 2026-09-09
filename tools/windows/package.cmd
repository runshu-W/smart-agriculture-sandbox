@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0package.ps1"
set "RESULT=%ERRORLEVEL%"
echo.
pause
exit /b %RESULT%
