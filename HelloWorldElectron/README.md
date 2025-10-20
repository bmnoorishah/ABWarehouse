# ABWarehouse Desktop Application

A professional warehouse management system built with Electron, featuring comprehensive role-based access control and multilingual support.

## 🏢 Features

### Core Functionality
- 🏭 **Complete Warehouse Management System** - 15 integrated modules for comprehensive warehouse operations
- 👥 **Role-Based Access Control (RBAC)** - 4 distinct user roles with granular permissions
- 🌍 **Multilingual Support** - English and French languages
- �️ **Cross-Platform** - Runs on Windows, macOS, and Linux
- 🔐 **Authentication System** - Secure login with demo accounts for testing
- 📱 **Responsive Design** - Modern UI that adapts to different screen sizes

### Warehouse Modules
1. **Inbox** - Message and notification center
2. **Inbound** - Incoming shipment management
3. **Outbound** - Outgoing shipment processing
4. **Replenishment** - Stock replenishment operations
5. **Physical Inventory** - Inventory counting and auditing
6. **Internal Movements** - Internal stock transfers
7. **Master Data** - Core data management
8. **Configuration** - System configuration settings
9. **Warehouse Monitor** - Real-time warehouse monitoring
10. **User Management** - User account administration
11. **Reports** - Comprehensive reporting system
12. **Vendor Master** - Vendor information management
13. **PIR (Purchase Information Record)** - Purchase data management
14. **Pricing Conditions** - Pricing and contract management
15. **Supplier Return** - Return merchandise processing

### User Roles
- **👷 Warehouse Operator** - Basic operations (6 modules)
- **👨‍💼 Supervisor Admin** - Full system access (all 15 modules)
- **🧑‍💻 Consultant** - Configuration access (3 modules)
- **💰 Procurement Finance** - Financial operations (4 modules)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or later)
- npm (included with Node.js)

### Installation & Setup
```bash
# Clone the repository
git clone [your-repo-url]
cd ABWarehouse

# Install dependencies
npm install

# Run the application
npm start
```

### Building for Production
```bash
# Build Windows executable
npm run build-win

# Build for macOS
npm run build-mac

# Build for Linux
npm run build-linux
```

## 🎮 Demo Accounts

The application includes 5 pre-configured demo accounts for testing different roles:

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| admin | admin123 | Supervisor Admin | All 15 modules |
| demo@example.com | demo123 | Warehouse Operator | 6 basic modules |
| guest | guest123 | Consultant | 3 config modules |
| user@demo.com | user123 | Procurement Finance | 4 financial modules |
| test@company.com | test123 | Warehouse Operator | 6 basic modules |

## 📁 Project Structure
```
ABWarehouse/
├── main.js              # Main Electron process
├── index.html           # Application dashboard UI
├── auth.js              # Authentication system
├── roleManager.js       # RBAC system implementation
├── i18n.js              # Internationalization engine
├── renderer.js          # Frontend logic and tile rendering
├── login.css            # Authentication and dashboard styling
├── styles.css           # Base application styling
├── package.json         # Project configuration
├── translations/        # Language files
│   ├── en.json         # English translations
│   └── fr.json         # French translations
├── docs/               # Documentation files
│   ├── USER_GUIDE.md   # Comprehensive user guide
│   ├── LOGIN_FEATURES.md
│   ├── RBAC_DOCUMENTATION.md
│   └── WINDOWS_INSTALLATION.md
├── styles.css           # Base application styling
├── package.json         # Project configuration
├── translations/        # Language files
│   ├── en.json         # English translations
│   └── fr.json         # French translations
├── dist/               # Build outputs (gitignored)
└── docs/               # Documentation files
└── build-windows.bat   # Windows build script
```

## 🛠️ Development

### Available Scripts
```bash
npm start             # Run in development mode
npm run build-win     # Build Windows executable (.exe)
npm run build-mac     # Build for macOS (.dmg)
npm run build-linux   # Build for Linux (.AppImage)
```

### Language Support
Switch between languages using the language selector in the top navigation:
- 🇬🇧 **English** (en)
- 🇫🇷 **French** (fr) 


### Role-Based Access
Each role has specific permissions:

**👷 Warehouse Operator**
- Inbox, Inbound, Outbound, Replenishment, Physical Inventory, Internal Movements

**👨‍💼 Supervisor Admin**
- Full access to all 15 warehouse modules

**🧑‍💻 Consultant**
- Master Data, Configuration, Warehouse Monitor

**💰 Procurement Finance**
- Vendor Master, PIR, Pricing Conditions, Supplier Return

## 📦 Building for Distribution

### Windows
```bash
npm run build-win
# Creates: dist/ABWarehouse Setup 1.0.0.exe (~76MB)
```

### Multi-Platform
The electron-builder configuration supports Windows, macOS, and Linux builds.

## 🔧 Configuration

### Adding New Warehouse Modules
1. Update `roleManager.js` - Add new tile definitions
2. Modify `renderer.js` - Add tile rendering logic
3. Update `translations/*.json` - Add multilingual labels

### Customizing Roles
Edit the `roles` object in `roleManager.js` to modify permissions for each user role.

### Adding Languages
1. Create new translation file in `translations/[locale].json`
2. Update `i18n.js` to include the new locale
3. Add language option to the UI selector

## 🧪 Testing

Use the demo accounts to test different role permissions:
- Login with different demo accounts
- Verify role-based tile visibility
- Test language switching functionality
- Confirm responsive design on different screen sizes

## 📋 Technical Architecture

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Electron main process (Node.js)
- **Authentication**: Mock authentication system with role mapping
- **Internationalization**: JSON-based translation system
- **UI Framework**: Custom CSS with responsive grid layout
- **Build System**: electron-builder for cross-platform packaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-module`)
3. Commit your changes (`git commit -m 'Add new warehouse module'`)
4. Push to the branch (`git push origin feature/new-module`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the documentation files in the project
- Review the demo account functionality
- Examine the role-based access control system

---

**ABWarehouse** - Professional Warehouse Management System with Role-Based Access Control

## Troubleshooting

### Common Issues

1. **"electron command not found"**
   ```bash
   npm install
   ```

2. **Build fails with permission errors**
   - On Windows: Run as Administrator
   - On macOS/Linux: Check file permissions

3. **App won't start**
   - Check Node.js version: `node --version`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

4. **Build for different platform fails**
   - Install platform-specific dependencies
   - Use appropriate build environment

### Development Tips

1. **Enable DevTools**: Set `NODE_ENV=development` or modify `main.js`
2. **Hot reload**: Use `electron-reload` package for development
3. **Debugging**: Use Chrome DevTools (Ctrl/Cmd + Shift + I)

## 📚 Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - Comprehensive user guide with navigation, features, and role descriptions
- **[LOGIN_FEATURES.md](LOGIN_FEATURES.md)** - Authentication system documentation
- **[RBAC_DOCUMENTATION.md](RBAC_DOCUMENTATION.md)** - Role-based access control details
- **[WINDOWS_INSTALLATION.md](WINDOWS_INSTALLATION.md)** - Windows deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-module`)
3. Commit your changes (`git commit -m 'Add new warehouse module'`)
4. Push to the branch (`git push origin feature/new-module`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the **[User Guide](USER_GUIDE.md)** for detailed usage instructions
- Review the documentation files in the project
- Examine the role-based access control system
- Test with the provided demo accounts

## 📖 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**ABWarehouse** - Professional Warehouse Management System with Role-Based Access Control