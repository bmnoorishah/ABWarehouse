@echo off
title ABWarehouse - Safe Installation Helper

echo.
echo ============================================
echo    ABWarehouse Safe Installation Helper
echo ============================================
echo.
echo This script will help you install ABWarehouse
echo safely, bypassing Windows security warnings.
echo.

pause

echo.
echo Checking Windows version...
ver

echo.
echo Creating ABWarehouse folder...
if not exist "C:\ABWarehouse" (
    mkdir "C:\ABWarehouse"
    echo ✓ Created C:\ABWarehouse\
) else (
    echo ✓ C:\ABWarehouse\ already exists
)

echo.
echo ============================================
echo    Installation Instructions
echo ============================================
echo.
echo 1. Copy ABWarehouse files to C:\ABWarehouse\
echo 2. If using ZIP: Extract contents to the folder
echo 3. Right-click ABWarehouse.exe → "Run as administrator"
echo 4. When Windows shows security warning:
echo    - Click "More info"
echo    - Click "Run anyway"
echo.

echo 5. Add Windows Defender exclusion (optional):
echo.
echo    Windows Security → Virus ^& threat protection
echo    → Manage settings → Add exclusion → Folder
echo    → Select C:\ABWarehouse\
echo.

echo ============================================
echo    Troubleshooting
echo ============================================
echo.
echo If antivirus blocks the file:
echo - Disable real-time protection temporarily
echo - Add C:\ABWarehouse\ to exclusions
echo - Use the ZIP version instead of EXE
echo.

echo If "Windows protected your PC" appears:
echo - This is normal for unsigned applications
echo - Click "More info" then "Run anyway"
echo - ABWarehouse is completely safe
echo.

echo ============================================
echo    Ready to Install
echo ============================================
echo.
echo 1. Download ABWarehouse-1.0.0-win.zip (recommended)
echo 2. Extract to C:\ABWarehouse\
echo 3. Run ABWarehouse.exe
echo 4. Allow through Windows warnings
echo.

echo Installation folder ready: C:\ABWarehouse\
echo.

echo Opening installation folder...
if exist "C:\ABWarehouse" (
    explorer "C:\ABWarehouse"
) else (
    echo Could not open folder. Please navigate to C:\ABWarehouse\ manually.
)

echo.
echo Copy your ABWarehouse files to this folder, then run ABWarehouse.exe
echo.
pause