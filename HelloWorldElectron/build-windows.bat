@echo off
echo.
echo ====================================
echo    ABWarehouse Build Distribution
echo ====================================
echo.
echo Building Windows executable...
echo.

npm run build-win

echo.
echo ====================================
echo    Build Complete!
echo ====================================
echo.
echo Windows executable created:
dir /b dist\*.exe 2>nul
echo.
echo Installation file location:
echo %cd%\dist\
echo.
echo Ready for distribution!
echo.
pause