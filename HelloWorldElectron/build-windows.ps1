# ABWarehouse Windows Build Script (PowerShell)
# Run this script to build Windows executables for ABWarehouse

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   ABWarehouse Windows Build Script" -ForegroundColor Cyan  
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Check if Node.js is installed
if (-not (Test-Command "node")) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
if (-not (Test-Command "npm")) {
    Write-Host "ERROR: npm is not available" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js version: $(node --version)" -ForegroundColor Green
Write-Host "✓ npm version: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Building Windows executables..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Cyan
Write-Host ""

# Build all Windows formats
npm run build-win-all
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "   Build Complete Successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check what files were created
if (Test-Path "dist") {
    Write-Host "Created files in dist folder:" -ForegroundColor Cyan
    
    $exeFiles = Get-ChildItem "dist\*.exe" -ErrorAction SilentlyContinue
    $zipFiles = Get-ChildItem "dist\*.zip" -ErrorAction SilentlyContinue
    
    foreach ($file in $exeFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  📦 $($file.Name) - $sizeMB MB" -ForegroundColor White
    }
    
    foreach ($file in $zipFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  📁 $($file.Name) - $sizeMB MB" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Full path: $(Get-Location)\dist\" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "WARNING: dist folder not found" -ForegroundColor Yellow
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Distribution files are ready!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installation Options:" -ForegroundColor Yellow
Write-Host "  1. 🏢 ABWarehouse Setup *.exe - Full installer with shortcuts" -ForegroundColor White
Write-Host "  2. 🚀 ABWarehouse *.exe - Portable executable (no install)" -ForegroundColor White  
Write-Host "  3. 📁 ABWarehouse-*-win.zip - Manual deployment package" -ForegroundColor White
Write-Host ""
Write-Host "Choose the appropriate file for your distribution needs." -ForegroundColor Green
Write-Host ""

# Open dist folder in Windows Explorer
if (Test-Path "dist") {
    $openFolder = Read-Host "Open dist folder in Explorer? (y/n)"
    if ($openFolder -eq 'y' -or $openFolder -eq 'Y') {
        Start-Process "explorer.exe" -ArgumentList "dist"
    }
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")