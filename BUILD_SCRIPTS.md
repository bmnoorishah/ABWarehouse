# Build Scripts for Hello World Electron Application

This directory contains build scripts for the Electron desktop application.

## Prerequisites
- Node.js (v16 or later)
- npm (comes with Node.js)

## Available Scripts

### Development
```bash
cd HelloWorldElectron
npm install
npm start
```

### Production Builds
```bash
# Build for current platform
npm run build

# Build for Windows
npm run build-win

# Build for macOS
npm run build-mac

# Build for Linux
npm run build-linux

# Build for all platforms
npm run dist
```

## Automated Build Scripts

### Unix/macOS/Linux (build.sh)
```bash
# Make executable (first time only)
chmod +x build.sh

# Build for current platform
./build.sh

# Build for specific platforms
./build.sh win
./build.sh mac
./build.sh linux
./build.sh all

# Check dependencies
./build.sh --check
```

### Windows (build.bat)
```cmd
# Build for current platform
build.bat

# Build for specific platforms
build.bat win
build.bat mac
build.bat linux
build.bat all
```

## Output Directories
Built applications will be available in:
- `HelloWorldElectron/dist/` - Distribution packages
- Platform-specific installers:
  - Windows: `.exe` (NSIS installer)
  - macOS: `.dmg` (Disk Image)
  - Linux: `.AppImage` (Portable application)