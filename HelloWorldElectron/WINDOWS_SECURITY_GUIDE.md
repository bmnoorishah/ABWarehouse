# 🛡️ Windows Security Warning - How to Download and Run ABWarehouse Safely

## ⚠️ **"Windows protected your PC" Warning?**

If you see this warning, don't worry! This is normal for unsigned applications. Here's why and how to fix it:

## 🔍 **Why This Happens**

- ABWarehouse is a legitimate application but not yet digitally signed
- Windows SmartScreen blocks unknown applications by default
- This is a security feature, not an actual virus detection

## 🚀 **How to Download and Run Safely**

### **Method 1: Browser Download Issues**

If your browser blocks the download:

1. **Chrome**: 
   - Click the download arrow in bottom-left
   - Click "Keep" → "Keep anyway"

2. **Edge**: 
   - Click "..." → "Keep"
   - Click "Show more" → "Keep anyway"

3. **Firefox**: 
   - Click the download arrow
   - Click "Allow this download"

### **Method 2: Windows SmartScreen Bypass**

When you see "Windows protected your PC":

1. **Click "More info"**
2. **Click "Run anyway"**
3. The application will start normally

### **Method 3: Alternative Download Formats**

Try the ZIP version instead of the executable:

1. **Download**: `ABWarehouse-1.0.0-win.zip` (less likely to be flagged)
2. **Extract** the ZIP file to a folder
3. **Run** `ABWarehouse.exe` from the extracted folder

## 🛡️ **Is ABWarehouse Safe?**

**YES!** ABWarehouse is completely safe because:

- ✅ **Open source**: You can review all code
- ✅ **No network dependencies**: Runs locally on your machine
- ✅ **No data collection**: Your data stays on your computer
- ✅ **Electron-based**: Built with trusted technology used by VS Code, Discord, Slack
- ✅ **Local server only**: Uses localhost:3001 (not accessible from internet)

## 🔐 **For IT Administrators**

### **Whitelist the Application**

**Windows Defender**:
1. Open Windows Security
2. Go to "Virus & threat protection"
3. Add exclusion for ABWarehouse folder/executable

**Corporate Antivirus**:
- Add ABWarehouse.exe to trusted applications
- Whitelist the application signature if needed

### **Registry/Group Policy**
```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\System]
"EnableSmartScreen"=dword:00000000
```

## 📋 **Step-by-Step Installation Guide**

### **Option A: Using the Installer (Recommended)**

1. **Download** `ABWarehouse Setup 1.0.0.exe`
2. **Right-click** → "Properties" → "Digital Signatures" (will show unsigned)
3. **Double-click** to run
4. **Click "More info"** when Windows warning appears
5. **Click "Run anyway"**
6. **Follow installation wizard**
7. **Launch from Start Menu** or Desktop shortcut

### **Option B: Using Portable Version**

1. **Download** `ABWarehouse 1.0.0.exe`
2. **Create a folder** like `C:\ABWarehouse\`
3. **Move the exe file** to this folder
4. **Right-click** → "Run as administrator" (first time only)
5. **Click "More info"** → "Run anyway"
6. **Application starts immediately**

### **Option C: Using ZIP Package**

1. **Download** `ABWarehouse-1.0.0-win.zip`
2. **Extract** to `C:\ABWarehouse\`
3. **Navigate** to the extracted folder
4. **Double-click** `ABWarehouse.exe`
5. **Allow through Windows warnings**

## 🏢 **For Enterprise Deployment**

Create a deployment script:

```batch
@echo off
echo Installing ABWarehouse...

REM Download and extract
curl -L -o ABWarehouse.zip "https://your-domain.com/ABWarehouse-1.0.0-win.zip"
powershell Expand-Archive ABWarehouse.zip -DestinationPath "C:\Program Files\ABWarehouse"

REM Create shortcut
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('C:\Users\Public\Desktop\ABWarehouse.lnk'); $Shortcut.TargetPath = 'C:\Program Files\ABWarehouse\ABWarehouse.exe'; $Shortcut.Save()"

echo Installation complete!
pause
```

## 🆘 **Still Having Issues?**

### **Contact IT Support**
If you're in a corporate environment:
1. Forward this document to your IT team
2. Ask them to whitelist ABWarehouse
3. Request elevation privileges if needed

### **Alternative Solutions**
1. **Use the web version** (if available)
2. **Run on a personal device** for testing
3. **Contact administrator** for enterprise deployment

## 📞 **Support Information**

- **Application**: ABWarehouse v1.0.0
- **Technology**: Electron + Node.js
- **Port**: localhost:3001 (local only)
- **Data**: Stored locally in application folder
- **Internet**: Not required (offline capable)

---

**Remember: This warning is about the application being "unknown" to Windows, not about it being malicious. ABWarehouse is completely safe to use!** 🛡️