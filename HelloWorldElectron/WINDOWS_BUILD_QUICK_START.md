# Windows Executable Quick Start

## 🚀 Quick Build (Choose One Method)

### Method 1: Batch Script (Windows Only)
```batch
build-windows.bat
```

### Method 2: PowerShell Script (Windows Only)  
```powershell
.\build-windows.ps1
```

### Method 3: Cross-Platform Script
```bash
npm run build-script
```

### Method 4: Direct npm Commands
```bash
# Install dependencies
npm install

# Build Windows executable (all formats)
npm run build-win-all

# OR build specific format
npm run build-win-installer  # NSIS installer
npm run build-win-portable   # Portable .exe
npm run build-win-zip       # ZIP package
```

## 📁 Output Files

After building, check the `dist/` folder for:

- **ABWarehouse Setup 1.0.0.exe** - Full installer (recommended for end users)
- **ABWarehouse 1.0.0.exe** - Portable executable (no installation needed)
- **ABWarehouse-1.0.0-win.zip** - ZIP package (manual deployment)

## 🔧 Requirements

- Windows 7 SP1 or later
- Node.js 18.x or 20.x LTS
- 2 GB RAM minimum
- 200 MB free disk space

## ❓ Need Help?

See `WINDOWS_EXECUTABLE_GUIDE.md` for detailed instructions and troubleshooting.

---

**Ready to distribute your Windows application! 🎉**