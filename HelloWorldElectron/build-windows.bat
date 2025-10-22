@echo off
setlocal

echo.
echo ==========================================
echo    ABWarehouse Windows Build Script
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    goto :error
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    goto :error
)

echo Node.js and npm are available
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        goto :error
    )
    echo.
)

echo Building Windows executables...
echo This may take several minutes...
echo.

REM Build all Windows formats
npm run build-win-all
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    goto :error
)

echo.
echo ==========================================
echo    Build Complete Successfully!
echo ==========================================
echo.

REM Check what files were created
if exist "dist" (
    echo Created files in dist folder:
    dir /b dist\*.exe 2>nul
    dir /b dist\*.zip 2>nul
    echo.
    echo Full path: %cd%\dist\
    echo.
    
    REM Show file sizes
    echo File details:
    for %%f in (dist\*.exe dist\*.zip) do (
        if exist "%%f" (
            echo   %%~nxf - %%~zf bytes
        )
    )
    echo.
) else (
    echo WARNING: dist folder not found
)

echo ==========================================
echo Distribution files are ready!
echo ==========================================
echo.
echo Installation Options:
echo   1. ABWarehouse Setup *.exe - Full installer
echo   2. ABWarehouse *.exe - Portable executable  
echo   3. ABWarehouse-*-win.zip - Manual deployment
echo.
echo Choose the appropriate file for your distribution needs.
echo.
goto :end

:error
echo.
echo ==========================================
echo    Build Failed!
echo ==========================================
echo.
echo Please check the error messages above and:
echo   1. Ensure Node.js is installed
echo   2. Run 'npm install' to install dependencies
echo   3. Check for any error messages
echo   4. Try running the build command manually
echo.

:end
pause