# ABWarehouse Desktop Application

A professional warehouse management system built with Electron, featuring comprehensive role-based access control, multilingual support, and complete company code management microservice.

## 🏢 Features

### Core Functionality
- 🏭 **Complete Warehouse Management System** - 15 integrated modules for comprehensive warehouse operations
- 👥 **Role-Based Access Control (RBAC)** - 4 distinct user roles with granular permissions
- 🌍 **Multilingual Support** - English and French languages
- 🖥️ **Cross-Platform** - Runs on Windows, macOS, and Linux
- 🔐 **Authentication System** - Secure login with demo accounts for testing
- 📱 **Responsive Design** - Modern UI that adapts to different screen sizes
- 🚀 **Company Code Microservice** - Complete Node.js REST API for company code management

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
- npm (comes with Node.js)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bmnoorishah/ABWarehouse.git
   cd ABWarehouse
   ```

2. **Install Electron dependencies**
   ```bash
   cd HelloWorldElectron
   npm install
   ```

3. **Install microservice dependencies**
   ```bash
   cd ../company-code-service
   npm install
   ```

## 🖥️ Electron Application

### Features
- Cross-platform desktop application
- Professional warehouse management interface
- Complete company code management with forms and navigation
- Role-based access control system
- Multilingual support (English/French)
- Interactive dashboard with modern UI

### Running the Application

1. **Start the Company Code Microservice**
   ```bash
   cd company-code-service
   npm start
   ```

2. **Start the Electron App**
   ```bash
   cd HelloWorldElectron
   npm start
   ```

### Building for Distribution

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build-win     # Windows
npm run build-mac     # macOS
npm run build-linux   # Linux

# Build for all platforms
npm run dist
```

### File Structure
```
ABWarehouse/
├── HelloWorldElectron/           # Electron desktop application
│   ├── main.js                  # Main Electron process
│   ├── index.html               # UI markup with company code management
│   ├── styles.css               # Styling and responsive design
│   ├── renderer.js              # Renderer process logic
│   ├── company-code-management.js # Company code management functionality
│   ├── common-navigation.js     # Navigation system
│   ├── auth.js                  # Authentication system
│   ├── roleManager.js           # Role-based access control
│   ├── i18n.js                  # Internationalization
│   ├── translations/            # Language files (en.json, fr.json)
│   └── package.json             # Electron dependencies and build config
├── company-code-service/         # Node.js microservice
│   ├── server.js                # Express server entry point
│   ├── models/CompanyCode.js    # Data model and validation
│   ├── controllers/             # API controllers
│   ├── routes/                  # API routes
│   ├── database/                # Database configuration
│   ├── config/swagger.js        # Swagger documentation config
│   └── package.json             # Microservice dependencies
├── build.sh                     # Unix build script
├── build.bat                    # Windows build script
└── README.md                    # Documentation
```

## 🔧 Company Code Microservice

### Features
- **REST API** with full CRUD operations
- **Swagger Documentation** at `http://localhost:3001/api-docs`
- **SQLite Database** with in-memory storage
- **Data Validation** using Joi schemas
- **CORS Support** for cross-origin requests
- **Health Check** endpoint for monitoring

### API Endpoints
- `GET /api/company-codes` - List all company codes
- `POST /api/company-codes` - Create new company code
- `GET /api/company-codes/:id` - Get specific company code
- `PUT /api/company-codes/:id` - Update company code
- `DELETE /api/company-codes/:id` - Delete company code
- `GET /api/company-codes/options` - Get dropdown options
- `GET /api/company-codes/stats` - Get statistics
- `GET /health` - Health check

### Data Model
- Company Code (4 chars, required, unique)
- Company Name (132 chars, required)
- City, Country, Currency, Language (required)
- Address fields (optional)
- Tax information (optional)
- Timestamps (auto-generated)



## 🛠️ Build Scripts

### Automated Build Script (Unix/macOS/Linux)
```bash
# Make executable (first time only)
chmod +x build.sh

# Build for current platform
./build.sh

# Build for specific platform
./build.sh win
./build.sh mac
./build.sh linux

# Build for all platforms
./build.sh all

# Check dependencies
./build.sh --check

# Show help
./build.sh --help
```

### Windows Build Script
```cmd
# Build for current platform
build.bat

# Build for specific platform
build.bat win
build.bat mac
build.bat linux

# Build for all platforms
build.bat all
```

## 📦 Distribution

### Electron Distribution
After building, find the packaged applications in:
- `HelloWorldElectron/dist/` directory
- Platform-specific installers (.exe for Windows, .dmg for macOS, .AppImage for Linux)

## 🔧 Customization

### Electron Customization
- **UI**: Edit `index.html` and `styles.css`
- **Functionality**: Modify `renderer.js`
- **App behavior**: Update `main.js`
- **Build settings**: Configure `package.json`

## 🚨 Troubleshooting

### Common Issues

#### Common Issues
- **Node.js not found**: Install Node.js from [nodejs.org](https://nodejs.org/)
- **Build fails**: Run `npm install` to ensure dependencies are installed
- **Permission denied**: On Unix systems, make scripts executable with `chmod +x`
- **Electron not found**: Run `npm install` in the HelloWorldElectron directory

### Platform Requirements Summary

| Platform | Support | Installer Format |
|----------|---------|------------------|
| Windows | ✅ | .exe (NSIS) |
| macOS | ✅ | .dmg |
| Linux | ✅ | .AppImage |

## 📄 License

MIT License - see individual project files for details.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Node.js Download](https://nodejs.org/)
- [Electron Builder Documentation](https://www.electron.build/)

---

**Happy Coding! 🎉**
=======
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
- [Express.js Documentation](https://expressjs.com/)
- [Swagger Documentation](https://swagger.io/docs/)

---

**ABWarehouse** - Professional Warehouse Management System with Role-Based Access Control and Company Code Management Microservice
