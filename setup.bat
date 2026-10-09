@echo off
title Binance Grid Bot - Setup
color 0A

echo ============================================
echo    BINANCE GRID TRADING BOT - SETUP
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org
    echo.
    echo After installing, restart this script.
    echo.
    pause
    exit /b
)

echo [OK] Node.js found:
node --version
echo.

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is NOT installed!
    echo Please reinstall Node.js from https://nodejs.org
    pause
    exit /b
)

echo [OK] npm found:
npm --version
echo.

echo ============================================
echo    Installing dependencies...
echo ============================================
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo Try running CMD as Administrator.
    pause
    exit /b
)

echo.
echo ============================================
echo    Installation Complete!
echo ============================================
echo.
echo Now run: start-bot.bat
echo.
pause
