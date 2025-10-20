# ABWarehouse Role-Based Access Control

## Overview
ABWarehouse implements a comprehensive role-based access control (RBAC) system that provides different users with access to specific warehouse management functions based on their role within the organization.

## Roles and Permissions

### 1. Warehouse Operator
**User Example:** `demo@example.com` (password: demo123)
**Description:** Front-line warehouse workers responsible for day-to-day operations.

**Accessible Tiles:**
- 📥 **Inbox** - View incoming messages and notifications
- ⬇️ **Inbound** - Manage incoming shipments and deliveries
- ⬆️ **Outbound** - Handle outgoing shipments and orders
- 🔄 **Replenishment** - Monitor and manage inventory replenishment
- 📋 **Physical Inventory** - Conduct physical inventory counts
- 🔀 **Internal Movements** - Track internal warehouse movements

### 2. Supervisor/Admin
**User Example:** `admin` (password: admin123)
**Description:** Management level with full system access.

**Accessible Tiles:** All tiles including:
- All Warehouse Operator tiles
- 🗃️ **Master Data** - Manage master data and configurations
- ⚙️ **Configuration** - System configuration and settings
- 📊 **Warehouse Monitor** - Monitor warehouse operations and metrics
- 👥 **User Management** - Manage user accounts and permissions
- 📈 **Reports** - Generate and view analytical reports
- 🏢 **Vendor Master** - Manage vendor information and contracts
- 📦 **PIR** - Purchase Invoice Receipt processing
- 💰 **Pricing Conditions** - Manage pricing rules and conditions
- ↩️ **Supplier Return** - Handle supplier returns and claims

### 3. Consultant
**User Example:** `test@company.com` (password: test123)
**Description:** External consultants with access to configuration and monitoring tools.

**Accessible Tiles:**
- ⚙️ **Configuration** - System configuration and settings
- 📊 **Warehouse Monitor** - Monitor warehouse operations and metrics
- 🗃️ **Master Data** - Manage master data and configurations

### 4. Procurement/Finance
**User Example:** `user@demo.com` (password: user123)
**Description:** Financial and procurement personnel handling vendor and pricing operations.

**Accessible Tiles:**
- 🏢 **Vendor Master** - Manage vendor information and contracts
- 📦 **PIR** - Purchase Invoice Receipt processing
- 💰 **Pricing Conditions** - Manage pricing rules and conditions
- ↩️ **Supplier Return** - Handle supplier returns and claims

## Demo Users

The application includes 5 demo users for testing different roles:

| Username | Password | Role | 2FA | Description |
|----------|----------|------|-----|-------------|
| `admin` | `admin123` | Supervisor/Admin | No | Full system access |
| `demo@example.com` | `demo123` | Warehouse Operator | Yes | Standard warehouse worker |
| `guest` | `guest123` | Warehouse Operator | No | Guest warehouse access |
| `user@demo.com` | `user123` | Procurement/Finance | No | Finance department user |
| `test@company.com` | `test123` | Consultant | Yes | External consultant |

## Technical Implementation

### Role Manager (`roleManager.js`)
- Centralized role and permission management
- Tile configuration with icons and color schemes
- Permission checking utilities

### User Authentication (`auth.js`)
- Enhanced user objects with role information
- Role-based authentication flow
- Session management with role persistence

### Dynamic UI Rendering (`renderer.js`)
- Role-based tile rendering
- Permission-driven UI updates
- Internationalization support

### Multilingual Support
All tile names and descriptions are fully translated in:
- **English** - Primary language
- **French** - Comprehensive French translations
- **Irish (Gaeilge)** - Complete Irish translations

## Color Coding System

Each tile type uses a distinctive color scheme for better visual organization:
- **Blue**: System monitoring and analytics
- **Green**: Inbound operations
- **Orange**: Outbound operations
- **Purple**: Inventory management
- **Teal**: Physical operations
- **Gray**: Master data and configuration

## Usage Instructions

1. **Login**: Use any of the demo accounts to test different role access levels
2. **Role Display**: The user's role is prominently displayed at the top of the dashboard
3. **Tile Access**: Only tiles relevant to the user's role are displayed
4. **Language Switching**: Use the language dropdown to test internationalization
5. **Tile Interaction**: Click any tile to see a preview of the module functionality

## Security Features

- Role-based access control prevents unauthorized access to functions
- Permission checking at both frontend and data levels
- Session management with role persistence
- Clear role identification and user feedback

This RBAC system ensures that each user type can efficiently access only the tools they need for their specific job responsibilities while maintaining system security and usability.