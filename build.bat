@echo off
REM Build script for Hello World Electron application (Windows)
REM Usage: build.bat [platform]

setlocal enabledelayedexpansion

set PROJECT_ROOT=%~dp0
set ELECTRON_DIR=%PROJECT_ROOT%HelloWorldElectron

echo [INFO] Hello World Electron Build Script
echo [INFO] ==================================

REM Check dependencies
echo [INFO] Checking dependencies...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] Node.js not found. Please install Node.js to build Electron app.
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [INFO] Node.js found: %%i
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] npm not found. Please install npm to build Electron app.
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo [INFO] npm found: %%i
)

REM Parse arguments
set PLATFORM=%1

if "%PLATFORM%"=="--help" goto :show_help
if "%PLATFORM%"=="-h" goto :show_help

if "%PLATFORM%"=="all" goto :build_all

goto :build_electron

:build_electron
echo [INFO] Building Electron application...
cd "%ELECTRON_DIR%"

if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    npm install
)

if "%PLATFORM%"=="win" (
    echo [INFO] Building for Windows...
    npm run build-win
) else if "%PLATFORM%"=="mac" (
    echo [INFO] Building for macOS...
    npm run build-mac
) else if "%PLATFORM%"=="linux" (
    echo [INFO] Building for Linux...
    npm run build-linux
) else (
    echo [INFO] Building for current platform...
    npm run build
)

echo [INFO] Electron build completed!
cd "%PROJECT_ROOT%"
goto :end

:build_all
echo [INFO] Building for all platforms...
call :build_electron win
call :build_electron mac
call :build_electron linux
goto :end

:show_help
echo Hello World Electron Build Script
echo.
echo Usage: %0 [PLATFORM]
echo.
echo PLATFORM:
echo   win         Windows
echo   mac         macOS
echo   linux       Linux
echo   all         All platforms
echo   (default)   Current platform
echo.
echo Examples:
echo   %0              # Build for current platform
echo   %0 win          # Build for Windows
echo   %0 all          # Build for all platforms
goto :end

:end
echo [INFO] Build process completed!
pause