@echo off
setlocal enabledelayedexpansion
title Mannco.store Enhancer
color 0A

REM Check and create .env if needed
call bat-scripts\copy_env.bat

:menu
cls
echo ===================================================
echo   Mannco.store Enhancer - Development Tools
echo ===================================================
echo.
echo   [1] Start Chrome development
echo   [2] Start Firefox development
echo   [3] Build production version
echo   [4] Install extension (after building)
echo   [5] Update version number
echo   [6] Kill development processes
echo.
echo   [0] Exit
echo.
echo ===================================================
choice /C 0123456 /N /M "Select an option:"

if errorlevel 7 goto option6
if errorlevel 6 goto option5
if errorlevel 5 goto option4
if errorlevel 4 goto option3
if errorlevel 3 goto option2
if errorlevel 2 goto option1
if errorlevel 1 goto end

:option1
echo.
echo Starting Chrome development...
call bat-scripts\set_global_env.bat "CLI_CEB_DEV=true" "CLI_CEB_FIREFOX=false"
if %errorlevel% equ 0 (
    echo Running pnpm dev - this might take a moment...
    echo.
    echo NOTE: Do not close this window while developing.
    echo Press Ctrl+C to stop the development server when done.
    echo.
    cmd /k pnpm dev
) else (
    echo ERROR: Failed to set environment variables.
    pause
)
goto menu

:option2
echo.
echo Starting Firefox development...
call bat-scripts\set_global_env.bat "CLI_CEB_DEV=true" "CLI_CEB_FIREFOX=true"
if %errorlevel% equ 0 (
    echo Running pnpm dev:firefox - this might take a moment...
    echo.
    echo NOTE: Do not close this window while developing.
    echo Press Ctrl+C to stop the development server when done.
    echo.
    cmd /k pnpm dev:firefox
) else (
    echo ERROR: Failed to set environment variables.
    pause
)
goto menu

:option3
echo.
echo Building production version...
call bat-scripts\set_global_env.bat "CLI_CEB_DEV=false" "CLI_CEB_FIREFOX=false"
if %errorlevel% equ 0 (
    echo Running pnpm build...
    call pnpm build
    if %errorlevel% equ 0 (
        echo.
        echo Build completed successfully! Extension is in the dist folder.
    ) else (
        echo.
        echo ERROR: Build failed with exit code %errorlevel%
    )
) else (
    echo ERROR: Failed to set environment variables.
)
pause
goto menu

:option4
echo.
echo Installing extension...
if not exist "dist\manifest.json" (
    echo ERROR: Extension not built. Please build first.
    pause
    goto menu
)

echo.
echo Choose browser to install:
echo 1 - Chrome/Brave
echo 2 - Firefox
echo.
choice /C 12 /M "Choose browser"

if %errorlevel% equ 1 (
    echo.
    echo To install in Chrome/Brave:
    echo 1. Open chrome://extensions in your browser
    echo 2. Enable "Developer mode" (top right)
    echo 3. Click "Load unpacked"
    echo 4. Select the 'dist' folder
    echo.
    choice /C YN /M "Open Chrome extensions page now?"
    if !errorlevel! equ 1 (
        start chrome://extensions
    )
) else (
    echo.
    echo To install in Firefox:
    echo 1. Open about:debugging#/runtime/this-firefox in your browser
    echo 2. Click "Load Temporary Extension..."
    echo 3. Navigate to the 'dist' folder and select manifest.json
    echo.
    choice /C YN /M "Open Firefox debugging page now?"
    if !errorlevel! equ 1 (
        start firefox about:debugging#/runtime/this-firefox
    )
)
pause
goto menu

:option5
echo.
set /p "version=Enter version number (format 0.0.0): "
call bat-scripts\update_version.bat "%version%"
pause
goto menu

:option6
echo.
echo Killing development processes...
call bat-scripts\kill-dev.bat
pause
goto menu

:end
exit /b 0
