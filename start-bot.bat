@echo off
title Binance Grid Trading Bot
color 0B

echo ============================================
echo    BINANCE GRID TRADING BOT
echo ============================================
echo.
echo Starting bot server...
echo.
echo Bot will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the bot
echo.
echo ============================================
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [WARNING] Dependencies not installed!
    echo Running setup first...
    echo.
    call setup.bat
)

:: Start the development server
call npm run dev

pause
