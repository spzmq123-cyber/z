@echo off
title Opening Browser...
color 0E

echo ============================================
echo    Opening Bot in Browser...
echo ============================================
echo.
echo Please wait while the server starts...
echo.

:: Wait 3 seconds for server to start
timeout /t 3 /nobreak >nul

:: Open browser
start http://localhost:5173

echo.
echo Browser opened!
echo.
echo If browser doesn't open, manually go to:
echo http://localhost:5173
echo.
pause
