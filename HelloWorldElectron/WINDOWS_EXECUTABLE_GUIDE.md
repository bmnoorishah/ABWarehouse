# ABWarehouse - Windows Executable Guide

## Overview
This guide explains how to create Windows executables for the ABWarehouse Electron application.

## Prerequisites

### 1. Install Node.js and npm
- Download and install Node.js from https://nodejs.org/ (LTS version recommended)
- This will also install npm (Node Package Manager)

### 2. Install Dependencies
```bash
cd /path/to/ABWarehouse/HelloWorldElectron
npm install
```

## Building Windows Executables

### Option 1: Quick Build (Recommended)
Run the provided batch file:
```bash
# On Windows Command Prompt or PowerShell
build-windows.bat
```

### Option 2: Manual Build Commands

#### Build All Windows Formats
```bash
npm run build-win-all
```

#### Build Specific Formats
```bash
# NSIS Installer (.exe installer)
npm run build-win-installer

# Portable Executable (.exe portable)
npm run build-win-portable

# ZIP Archive
npm run build-win-zip
```

## Output Files

After building, you'll find the Windows executables in the `dist/` folder:

### 1. NSIS Installer
- **File**: `ABWarehouse Setup 1.0.0.exe`
- **Type**: Installation package
- **Use**: Distribute to end users for full installation
- **Features**: 
  - Desktop shortcut creation
  - Start menu entry
  - Add/Remove Programs entry
  - Automatic updates support

### 2. Portable Executable
- **File**: `ABWarehouse 1.0.0.exe`
- **Type**: Standalone executable
- **Use**: Run without installation
- **Features**: 
  - No installation required
  - Can run from USB drive
  - Perfect for testing

### 3. ZIP Archive
- **File**: `ABWarehouse-1.0.0-win.zip`
- **Type**: Compressed application folder
- **Use**: Manual deployment
- **Features**: 
  - Contains all application files
  - Extract and run

## Distribution Options

### For End Users
1. **Recommended**: Use the NSIS installer (`ABWarehouse Setup 1.0.0.exe`)
2. **Alternative**: Provide the portable version for users who prefer no installation

### For Testing/Development
- Use the portable executable for quick testing
- Use the ZIP version for manual deployment scenarios

## System Requirements

### Minimum Requirements
- **OS**: Windows 7 SP1 or later
- **Architecture**: 64-bit (x64) or 32-bit (ia32)
- **RAM**: 2 GB minimum, 4 GB recommended
- **Storage**: 200 MB free space

### Recommended Requirements  
- **OS**: Windows 10 or Windows 11
- **Architecture**: 64-bit (x64)
- **RAM**: 8 GB or more
- **Storage**: 500 MB free space

## Security Considerations

### Code Signing (Production)
For production distribution, you should:
1. Obtain a code signing certificate
2. Update package.json with certificate details
3. Enable code signing in the build process

Example configuration:
```json
"win": {
  "certificateFile": "path/to/certificate.p12",
  "certificatePassword": "certificate-password",
  "verifyUpdateCodeSignature": true
}
```

### Windows Defender
- Unsigned executables may trigger Windows Defender warnings
- Users may need to click "More info" → "Run anyway"
- Code signing resolves this issue

## Troubleshooting

### Build Errors

#### Missing Dependencies
```bash
npm install --force
npm run postinstall
```

#### Node.js Version Issues
- Use Node.js LTS version (18.x or 20.x)
- Update npm: `npm install -g npm@latest`

#### Windows Build Tools (if needed)
```bash
npm install -g windows-build-tools
```

### Runtime Issues

#### Application Won't Start
1. Check Windows version compatibility
2. Ensure all Visual C++ redistributables are installed
3. Run as administrator if needed

#### Port Conflicts
- Default port: 3001
- Change in main.js if needed
- Ensure port is not blocked by firewall

## Customization

### Application Icon
1. Replace `build/icon.ico` with your custom icon
2. Rebuild the application
3. Recommended size: 256x256 pixels

### Application Name and Details
Update in `package.json`:
```json
{
  "name": "your-app-name",
  "productName": "Your App Display Name",
  "description": "Your app description",
  "author": "Your Name",
  "build": {
    "appId": "com.yourcompany.yourapp"
  }
}
```

## Deployment Checklist

- [ ] All dependencies installed
- [ ] Application tested in development mode
- [ ] Custom icon added (optional)
- [ ] Package.json updated with correct details
- [ ] Windows executable built successfully
- [ ] Executable tested on target Windows version
- [ ] Installation process verified
- [ ] Application functionality confirmed
- [ ] Distribution files prepared

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Electron Builder documentation: https://www.electron.build/
3. Check Node.js and npm versions
4. Ensure all dependencies are properly installed

## Version History

- **v1.0.0**: Initial Windows executable release
  - NSIS installer support
  - Portable executable
  - ZIP distribution
  - Windows 7+ compatibility