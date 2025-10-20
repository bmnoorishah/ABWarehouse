// Role-based Access Control for ABWarehouse
class RoleManager {
    constructor() {
        this.roles = {
            'warehouse_operator': {
                name: 'Warehouse Operator',
                permissions: [
                    'inbox',
                    'inbound',
                    'outbound', 
                    'replenishment',
                    'physical_inventory',
                    'internal_movements'
                ]
            },
            'supervisor_admin': {
                name: 'Supervisor/Admin',
                permissions: [
                    'inbox',
                    'inbound',
                    'outbound',
                    'replenishment', 
                    'physical_inventory',
                    'internal_movements',
                    'return_process',
                    'master_data',
                    'configuration',
                    'warehouse_monitor',
                    'reports'
                ]
            },
            'consultant': {
                name: 'Consultant',
                permissions: [
                    'configuration',
                    'warehouse_monitor',
                    'master_data'
                ]
            },
            'procurement': {
                name: 'Procurement/Finance',
                permissions: [
                ]
            }
        };
        
        this.tiles = {
            'inbox': {
                icon: '📥',
                colorClass: 'tile-blue'
            },
            'inbound': {
                icon: '⬇️',
                colorClass: 'tile-green'
            },
            'outbound': {
                icon: '⬆️',
                colorClass: 'tile-orange'
            },
            'replenishment': {
                icon: '🔄',
                colorClass: 'tile-purple'
            },
            'physical_inventory': {
                icon: '📋',
                colorClass: 'tile-teal'
            },
            'internal_movements': {
                icon: '🔀',
                colorClass: 'tile-indigo'
            },
            'return_process': {
                icon: '↩️',
                colorClass: 'tile-orange'
            },
            'master_data': {
                icon: '🗃️',
                colorClass: 'tile-gray'
            },
            'configuration': {
                icon: '⚙️',
                colorClass: 'tile-red'
            },
            'warehouse_monitor': {
                icon: '📊',
                colorClass: 'tile-blue'
            },
            'reports': {
                icon: '📈',
                colorClass: 'tile-yellow'
            }
        };
    }

    getUserPermissions(userRole) {
        return this.roles[userRole]?.permissions || [];
    }

    hasPermission(userRole, permission) {
        const permissions = this.getUserPermissions(userRole);
        return permissions.includes(permission);
    }

    getAvailableTiles(userRole) {
        const permissions = this.getUserPermissions(userRole);
        return permissions.map(permission => ({
            id: permission,
            ...this.tiles[permission]
        }));
    }

    getRoleName(roleKey) {
        return this.roles[roleKey]?.name || roleKey;
    }

    getAllRoles() {
        return Object.keys(this.roles).map(key => ({
            key,
            name: this.roles[key].name
        }));
    }
}

// Global instance
window.roleManager = new RoleManager();