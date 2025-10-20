// Enhanced renderer with authentication and i18n support
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize common navigation system
    await initializeCommonNavigation();
    
    // Initialize favorites tree for dashboard
    if (typeof FavoritesTree !== 'undefined') {
        window.favoritesTree = new FavoritesTree();
        console.log('✅ Favorites tree initialized on page load');
    }
    
    // Initialize platform information for dashboard
    updatePlatformInformation();
    
    // Setup action button handlers
    setupActionButtons();
    
    // Initialize any additional features
    initializeFeatures();
    
    // Setup i18n event listeners
    setupI18nEventListeners();
});

// Initialize common navigation system
async function initializeCommonNavigation() {
    if (window.commonNavigation) {
        const loaded = await window.commonNavigation.loadNavigation();
        if (loaded) {
            // Add a small delay to ensure DOM is fully ready
            setTimeout(() => {
                // Insert navigation into all page placeholders
                insertNavigationIntoPages();
                
                // Force update back button visibility after initialization
                if (window.commonNavigation) {
                    window.commonNavigation.updateBackButtonVisibility();
                }
                
                console.log('Common navigation system initialized');
            }, 200);
        } else {
            console.error('Failed to load common navigation');
        }
    }
}

// Insert navigation into all page placeholders
function insertNavigationIntoPages() {
    const navHTML = document.getElementById('common-navigation');
    if (!navHTML) return;
    
    const pages = [
        { placeholder: 'dashboard-navigation-placeholder', pageId: 'dashboard' },
        { placeholder: 'org-navigation-placeholder', pageId: 'organizational-structure' },
        { placeholder: 'cc-navigation-placeholder', pageId: 'create-company-code' }
    ];
    
    pages.forEach(page => {
        const placeholder = document.getElementById(page.placeholder);
        if (placeholder && placeholder.children.length === 0) { // Only add if not already present
            // Clone the navigation for each page
            const navClone = navHTML.cloneNode(true);
            navClone.id = `${page.pageId}-navigation`;
            navClone.style.display = 'block'; // Ensure the clone is visible
            placeholder.appendChild(navClone);
            
            // Reinitialize events for the cloned navigation
            if (window.commonNavigation) {
                window.commonNavigation.reinitializeEventsForClone(navClone);
            }
            
            console.log(`Navigation inserted into ${page.pageId} page`);
        }
    });
}

// Listen for language changes
function setupI18nEventListeners() {
    window.addEventListener('languageChanged', (event) => {
        console.log('Language changed to:', event.detail.language);
        
        // Update dynamic content that may not be handled by data-i18n attributes
        updateDynamicContent(event.detail.language);
        
        // Update welcome message with user's name if logged in
        updatePersonalizedContent();
    });
}

function updateDynamicContent(language) {
    // Update any dynamic content that needs special handling
    const platformElement = document.getElementById('platform-info');
    if (platformElement && typeof process !== 'undefined') {
        // Platform name doesn't need translation as it's a proper noun
        platformElement.textContent = getPlatformName(process.platform);
    }
    
    // Update demo user names if needed (some should remain as usernames)
    updateDemoUserContent();
}

function updateDemoUserContent() {
    // Keep demo emails and usernames as they are (they shouldn't be translated)
    // But update the descriptive text through the existing i18n system
}

function updatePersonalizedContent() {
    // Update welcome message with current user's name if available
    const welcomeMessage = document.getElementById('welcome-message');
    const currentUser = window.authManager?.getCurrentUser();
    
    if (welcomeMessage && currentUser && window.i18n) {
        const welcomeText = window.i18n.translate('dashboard.welcomeBackUser', { 
            name: currentUser.displayName || currentUser.username 
        });
        welcomeMessage.textContent = welcomeText;
    }
    
    // Update role information and warehouse tiles
    updateRoleAndTiles();
}

function updateRoleAndTiles() {
    console.log('updateRoleAndTiles called');
    const currentUser = window.authManager?.getCurrentUser();
    console.log('Current user:', currentUser);
    console.log('RoleManager available:', !!window.roleManager);
    
    if (!currentUser || !window.roleManager) {
        console.log('Missing currentUser or roleManager');
        return;
    }
    
    // Render warehouse tiles based on user role
    renderWarehouseTiles(currentUser.role);
}

// Make function globally available
window.updateRoleAndTiles = updateRoleAndTiles;

function renderWarehouseTiles(userRole) {
    console.log('renderWarehouseTiles called with role:', userRole);
    const managementTilesContainer = document.getElementById('management-tiles');
    const operationalTilesContainer = document.getElementById('operational-tiles');
    
    console.log('Management tiles container found:', !!managementTilesContainer);
    console.log('Operational tiles container found:', !!operationalTilesContainer);
    console.log('RoleManager available:', !!window.roleManager);
    console.log('i18n available:', !!window.i18n);
    
    if (!managementTilesContainer || !operationalTilesContainer) {
        console.log('Missing tiles containers');
        return;
    }

    if (!window.roleManager) {
        console.log('Missing roleManager');
        managementTilesContainer.innerHTML = '<div class="no-tiles-message">Loading...</div>';
        operationalTilesContainer.innerHTML = '<div class="no-tiles-message">Loading...</div>';
        return;
    }

    // Clear existing tiles
    managementTilesContainer.innerHTML = '';
    operationalTilesContainer.innerHTML = '';
    
    // Get tiles available for this role
    const availableTiles = window.roleManager.getAvailableTiles(userRole);
    console.log('Available tiles for role:', availableTiles);
    
    if (!availableTiles || availableTiles.length === 0) {
        managementTilesContainer.innerHTML = '<div class="no-tiles-message">No modules available for your role.</div>';
        return;
    }
    
    // Define tile categories
    const managementTileIds = ['inbox', 'warehouse_monitor', 'reports', 'master_data', 'configuration'];
    const operationalTileIds = ['inbound', 'outbound', 'replenishment', 'physical_inventory', 'internal_movements', 'return_process'];
    
    // Separate tiles into categories
    const managementTiles = availableTiles.filter(tile => managementTileIds.includes(tile.id));
    const operationalTiles = availableTiles.filter(tile => operationalTileIds.includes(tile.id));
    
    // Render management tiles (left-aligned 3x2)
    managementTiles.forEach(tile => {
        const tileElement = createTileElement(tile);
        managementTilesContainer.appendChild(tileElement);
    });
    
    // Render operational tiles (right-aligned 3x2)
    operationalTiles.forEach(tile => {
        const tileElement = createTileElement(tile);
        operationalTilesContainer.appendChild(tileElement);
    });
    
    // Update i18n content for newly created tiles
    if (window.i18n) {
        window.i18n.updatePageTranslations();
    }
    
}

function createTileElement(tile) {
    const tileDiv = document.createElement('div');
    tileDiv.className = `warehouse-tile ${tile.colorClass}`;
    tileDiv.setAttribute('data-tile-id', tile.id);
    
    tileDiv.innerHTML = `
        <div class="tile-header">
            <div class="tile-icon">${tile.icon}</div>
            <div class="tile-content">
                <h3 data-i18n="tiles.${tile.id}.title"></h3>
                <p data-i18n="tiles.${tile.id}.description"></p>
            </div>
        </div>
    `;
    
    // Add click handler
    tileDiv.addEventListener('click', () => {
        handleTileClick(tile.id);
    });
    
    return tileDiv;
}

function getTileTitle(tileId) {
    // Fallback titles if translations aren't loaded yet
    const fallbackTitles = {
        'inbox': 'Inbox',
        'inbound': 'Inbound',
        'outbound': 'Outbound',
        'replenishment': 'Replenishment',
        'physical_inventory': 'Physical Inventory',
        'internal_movements': 'Internal Movements',
        'return_process': 'Return Process',
        'master_data': 'Master Data',
        'configuration': 'Configuration',
        'warehouse_monitor': 'Warehouse Monitor',
        'reports': 'Reports'
    };
    
    return window.i18n ? window.i18n.translate(`tiles.${tileId}.title`) : fallbackTitles[tileId] || tileId;
}

function getTileDescription(tileId) {
    // Fallback descriptions if translations aren't loaded yet
    const fallbackDescriptions = {
        'inbox': 'View incoming messages and notifications',
        'inbound': 'Manage incoming shipments and deliveries',
        'outbound': 'Handle outgoing shipments and orders',
        'replenishment': 'Monitor and manage inventory replenishment',
        'physical_inventory': 'Conduct physical inventory counts',
        'internal_movements': 'Track internal warehouse movements',
        'return_process': 'Handle product returns and return processing',
        'master_data': 'Manage master data and configurations',
        'configuration': 'System configuration and settings',
        'warehouse_monitor': 'Monitor warehouse operations',
        'reports': 'Generate and view reports'
    };
    
    return window.i18n ? window.i18n.translate(`tiles.${tileId}.description`) : fallbackDescriptions[tileId] || 'Warehouse management function';
}

function handleTileClick(tileId) {
    // Handle configuration tile specially - navigate to organizational structure page
    if (tileId === 'configuration') {
        showOrganizationalStructurePage();
        return;
    }
    
    // For other tiles, show the existing alert
    const tileName = getTileTitle(tileId);
    
    if (window.i18n) {
        const message = window.i18n.translate('tiles.clickMessage', { tileName });
        alert(message);
    } else {
        alert(`Opening ${tileName}...`);
    }
    
    console.log(`Tile clicked: ${tileId}`);
}

function updatePlatformInformation() {
    // Update platform info in dashboard if elements exist
    const platformElement = document.getElementById('platform-info');
    if (platformElement && typeof process !== 'undefined') {
        platformElement.textContent = getPlatformName(process.platform);
    }
    
    // Update version info if elements exist (for debugging or about page)
    const electronVersion = document.getElementById('electron-version');
    const nodeVersion = document.getElementById('node-version');
    const chromeVersion = document.getElementById('chrome-version');
    
    if (electronVersion && typeof process !== 'undefined') {
        electronVersion.textContent = process.versions.electron;
    }
    
    if (nodeVersion && typeof process !== 'undefined') {
        nodeVersion.textContent = process.versions.node;
    }
    
    if (chromeVersion && typeof process !== 'undefined') {
        chromeVersion.textContent = process.versions.chrome;
    }
}

function getPlatformName(platform) {
    switch (platform) {
        case 'darwin': return 'macOS';
        case 'win32': return 'Windows';
        case 'linux': return 'Linux';
        default: return platform || 'Unknown';
    }
}

function setupActionButtons() {
    // Setup dashboard action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            handleActionButtonClick(buttonText);
        });
    });
    
    // Setup configuration buttons to navigate to organizational structure
    const configButtons = document.querySelectorAll('.config-btn');
    configButtons.forEach(button => {
        button.addEventListener('click', () => {
            const config = button.getAttribute('data-config');
            handleConfigButtonClick(config);
        });
    });
}

function handleConfigButtonClick(config) {
    // All config buttons navigate to organizational structure page
    showOrganizationalStructurePage();
}

function handleActionButtonClick(action) {
    // Handle various action button clicks
    switch (action) {
        case '⚙️ Settings':
            showNotification('Settings panel would open here', 'info');
            break;
        case '📧 Messages':
            showNotification('Messages panel would open here', 'info');
            break;
        case '📊 Reports':
            showNotification('Reports panel would open here', 'info');
            break;
        case '👥 Team':
            showNotification('Team panel would open here', 'info');
            break;
        default:
            showNotification(`${action} clicked`, 'info');
    }
}

function initializeFeatures() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + L to focus login field
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            const emailField = document.getElementById('email-username');
            if (emailField && emailField.offsetParent !== null) {
                e.preventDefault();
                emailField.focus();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Add window blur/focus handlers for security
    window.addEventListener('blur', () => {
        // Could implement auto-lock functionality here
        console.log('Window lost focus');
    });
    
    window.addEventListener('focus', () => {
        console.log('Window gained focus');
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Utility functions for the application
const AppUtils = {
    // Format timestamp for display
    formatTime: (date = new Date()) => {
        return date.toLocaleTimeString();
    },
    
    // Format date for display
    formatDate: (date = new Date()) => {
        return date.toLocaleDateString();
    },
    
    // Generate user initials
    generateInitials: (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },
    
    // Validate email format
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Make utils available globally
window.AppUtils = AppUtils;

// Organizational Structure Page Functions
function showOrganizationalStructurePage() {
    // Use the common navigation system to properly track navigation history
    if (window.commonNavigation) {
        window.commonNavigation.navigateToPage('organizational-structure');
    } else {
        // Fallback: direct DOM manipulation if navigation system not available
        const dashboardPage = document.getElementById('dashboard-page');
        const orgStructurePage = document.getElementById('organizational-structure-page');
        
        if (dashboardPage && orgStructurePage) {
            dashboardPage.style.display = 'none';
            orgStructurePage.style.display = 'block';
        }
        
        console.log('Navigated to Organizational Structure page (fallback)');
    }
    
    // Set up organizational structure page-specific functionality
    setupOrganizationalStructureActions();
    
    // Update translations for the new page
    if (window.i18n) {
        window.i18n.updatePageTranslations();
    }
}

function setupOrganizationalStructureActions() {
    // Set up tree child click handlers
    const treeChildren = document.querySelectorAll('.tree-child');
    
    treeChildren.forEach(child => {
        child.addEventListener('click', () => {
            const action = child.getAttribute('data-action');
            const label = child.querySelector('.tree-label').textContent;
            
            // Handle specific actions
            switch(action) {
                case 'create-company':
                    showCreateCompanyCodePage();
                    break;
                case 'manage-company':
                    showCompanyCodeManagementPage();
                    break;
                case 'create-plant':
                    showPlaceholderForm('Create Plant', 'Enter plant details and configuration');
                    break;
                case 'create-division':
                    showPlaceholderForm('Create Division', 'Define division structure and properties');
                    break;
                case 'create-sales-org':
                    showPlaceholderForm('Create Sales Organization', 'Configure sales organization parameters');
                    break;
                case 'maintain-storage-location':
                    showPlaceholderForm('Maintain Storage Location', 'Manage storage location configurations');
                    break;
                case 'maintain-purchasing-org':
                    showPlaceholderForm('Maintain Purchasing Organization', 'Configure purchasing organization settings');
                    break;
                case 'create-warehouse-number':
                    showPlaceholderForm('Create Warehouse Number', 'Set up warehouse number and properties');
                    break;
                case 'create-shipping-point':
                    showPlaceholderForm('Create Shipping Point', 'Configure shipping point details');
                    break;
                case 'assign-plant-company':
                    showPlaceholderForm('Assign Plant To Company', 'Link plants to company codes');
                    break;
                case 'assign-sales-org-company':
                    showPlaceholderForm('Assign Sales Organization To Company', 'Connect sales organizations with companies');
                    break;
                case 'assign-division-sales-org':
                    showPlaceholderForm('Assign Division To Sales Organization', 'Map divisions to sales organizations');
                    break;
                case 'assign-purchasing-org-company':
                    showPlaceholderForm('Assign Purchasing Organization To Company', 'Link purchasing organizations to companies');
                    break;
                case 'assign-purchasing-org-plant':
                    showPlaceholderForm('Assign Purchasing Organization To Plant', 'Connect purchasing organizations with plants');
                    break;
                case 'assign-warehouse-plant-storage':
                    showPlaceholderForm('Assign Warehouse Number To Plant And Storage Location', 'Map warehouse numbers to plants and storage locations');
                    break;
                case 'assign-shipping-point-plant-storage':
                    showPlaceholderForm('Assign Shipping Point To Plant And Storage Location', 'Link shipping points to plants and storage locations');
                    break;
                case 'define-shipping-conditions':
                    showPlaceholderForm('Define Shipping Conditions', 'Configure shipping conditions and terms');
                    break;
                case 'assign-shipping-points-plant-conditions':
                    showPlaceholderForm('Assign Shipping Points To Plant And Shipping Conditions', 'Map shipping points to plants and conditions');
                    break;
                default:
                    console.log(`Action not implemented: ${action}`);
                    showPlaceholderForm(label, 'This functionality will be implemented in a future version.');
            }
            
            // Visual feedback - highlight selected item
            treeChildren.forEach(tc => tc.classList.remove('selected'));
            child.classList.add('selected');
        });
    });
    
    // Set up tree subsection toggle (for collapsing/expanding)
    const subsectionHeaders = document.querySelectorAll('.tree-subsection-header');
    
    subsectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const subsection = header.closest('.tree-subsection-node');
            const children = subsection.querySelector('.tree-children');
            
            if (children) {
                const isExpanded = children.style.display !== 'none';
                children.style.display = isExpanded ? 'none' : 'block';
                
                // Update visual indicator (could add arrow rotation here)
                header.classList.toggle('collapsed', isExpanded);
            }
        });
    });
}

// Helper function to show placeholder forms for actions not yet implemented
function showPlaceholderForm(title, description) {
    // Update content area with placeholder form
    const contentArea = document.querySelector('.org-content-area');
    
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="form-placeholder">
                <div class="form-placeholder-header">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
                <div class="form-placeholder-content">
                    <div class="placeholder-form">
                        <div class="form-group">
                            <label>Configuration details will be available here</label>
                            <div class="placeholder-field">
                                <span>⚙️ Form fields for ${title.toLowerCase()}</span>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button class="btn-secondary" onclick="resetContentArea()">Back to Overview</button>
                            <button class="btn-primary" disabled>Save Configuration</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Helper function to reset content area to default placeholder
function resetContentArea() {
    const contentArea = document.querySelector('.org-content-area');
    
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="content-placeholder">
                <div class="placeholder-icon">📋</div>
                <h3 data-i18n="orgStructure.selectActionPlaceholder">Select an action from the tree menu</h3>
                <p data-i18n="orgStructure.selectActionDescription">Choose from the organizational structure options on the left to manage your company hierarchy.</p>
            </div>
        `;
        
        // Update translations for the reset content
        if (window.i18n) {
            window.i18n.updatePageTranslations();
        }
        
        // Remove selected state from all tree children
        const treeChildren = document.querySelectorAll('.tree-child');
        treeChildren.forEach(tc => tc.classList.remove('selected'));
    }
}

function showDashboardPage() {
    // Use the common navigation system to properly handle dashboard navigation
    if (window.commonNavigation) {
        // Use navigateToPageWithoutHistory for dashboard since it's the home page
        window.commonNavigation.navigateToPageWithoutHistory('dashboard');
    } else {
        // Fallback: direct DOM manipulation if navigation system not available
        const dashboardPage = document.getElementById('dashboard-page');
        const orgStructurePage = document.getElementById('organizational-structure-page');
        const createCompanyPage = document.getElementById('create-company-code-page');
        
        if (dashboardPage) {
            // Hide other pages
            if (orgStructurePage) orgStructurePage.style.display = 'none';
            if (createCompanyPage) createCompanyPage.style.display = 'none';
            
            // Show dashboard
            dashboardPage.style.display = 'block';
        }
        
        console.log('Navigated back to Dashboard page (fallback)');
    }
    
    // Initialize favorites tree if not already done
    if (typeof FavoritesTree !== 'undefined' && !window.favoritesTree) {
        window.favoritesTree = new FavoritesTree();
        console.log('✅ Favorites tree initialized');
    }
}

// Fallback search functionality if NavigationManager is not available
function setupBasicSearchFunctionality() {
    // Note: Basic search functionality removed as navigation bar was removed from organizational structure page
    console.log('Basic search functionality not available - navigation removed from organizational structure page');
}

// Create Company Code Page Functions
function showCreateCompanyCodePage() {
    // Use the common navigation system to properly track navigation history
    if (window.commonNavigation) {
        window.commonNavigation.navigateToPage('create-company-code');
    } else {
        // Fallback: direct DOM manipulation if navigation system not available
        const orgStructurePage = document.getElementById('organizational-structure-page');
        const createCompanyPage = document.getElementById('create-company-code-page');
        
        if (orgStructurePage && createCompanyPage) {
            orgStructurePage.style.display = 'none';
            createCompanyPage.style.display = 'block';
        }
        
        console.log('Navigated to Create Company Code page (fallback)');
    }
    
    // Load dropdown data from API
    loadCreateFormDropdowns();
}

async function loadCreateFormDropdowns() {
    try {
        // Fetch dropdown options from microservice
        const response = await fetch('http://localhost:3001/api/company-codes/options');
        if (!response.ok) {
            console.warn('Could not load dropdown options, using defaults');
            return;
        }
        
        const result = await response.json();
        const dropdownOptions = result.data;
        
        // Populate country dropdown
        const countrySelect = document.getElementById('country');
        if (countrySelect && dropdownOptions.countries) {
            countrySelect.innerHTML = '<option value="">Select Country...</option>';
            dropdownOptions.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = `${country.name} (${country.code})`;
                countrySelect.appendChild(option);
            });
        }
        
        // Populate currency dropdown
        const currencySelect = document.getElementById('currency');
        if (currencySelect && dropdownOptions.currencies) {
            currencySelect.innerHTML = '<option value="">Select Currency...</option>';
            dropdownOptions.currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                currencySelect.appendChild(option);
            });
        }
        
        // Populate language dropdown
        const languageSelect = document.getElementById('language');
        if (languageSelect && dropdownOptions.languages) {
            languageSelect.innerHTML = '<option value="">Select Language...</option>';
            dropdownOptions.languages.forEach(language => {
                const option = document.createElement('option');
                option.value = language.code;
                option.textContent = `${language.name} (${language.code})`;
                languageSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading dropdown options:', error);
        // Add some default options as fallback
        addDefaultDropdownOptions();
    }
}

function addDefaultDropdownOptions() {
    // Add some common countries as fallback
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        const commonCountries = [
            { code: 'US', name: 'United States' },
            { code: 'GB', name: 'United Kingdom' },
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'IN', name: 'India' },
            { code: 'CA', name: 'Canada' },
            { code: 'AU', name: 'Australia' }
        ];
        
        countrySelect.innerHTML = '<option value="">Select Country...</option>';
        commonCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = `${country.name} (${country.code})`;
            countrySelect.appendChild(option);
        });
    }
    
    // Add common currencies as fallback
    const currencySelect = document.getElementById('currency');
    if (currencySelect) {
        const commonCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD'];
        
        currencySelect.innerHTML = '<option value="">Select Currency...</option>';
        commonCurrencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = currency;
            currencySelect.appendChild(option);
        });
    }
    
    // Add common languages as fallback
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        const commonLanguages = [
            { code: 'en', name: 'English' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
            { code: 'es', name: 'Spanish' },
            { code: 'it', name: 'Italian' },
            { code: 'ja', name: 'Japanese' },
            { code: 'zh', name: 'Chinese' }
        ];
        
        languageSelect.innerHTML = '<option value="">Select Language...</option>';
        commonLanguages.forEach(language => {
            const option = document.createElement('option');
            option.value = language.code;
            option.textContent = `${language.name} (${language.code})`;
            languageSelect.appendChild(option);
        });
    }
    loadDropdownData();
    
    // Set up form handling
    setupCompanyCodeForm();
    
    // Update translations for the new page
    if (window.i18n) {
        window.i18n.updatePageTranslations();
    }
}

// API Countries Integration
async function loadDropdownData() {
    try {
        // Show loading indicators
        showLoadingIndicators();
        
        // Fetch countries data from API
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,currencies,languages,capital');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const countries = await response.json();
        
        // Process and populate dropdowns
        await populateCountryDropdown(countries);
        await populateCurrencyDropdown(countries);
        await populateLanguageDropdown(countries);
        
        // Hide loading indicators
        hideLoadingIndicators();
        
    } catch (error) {
        console.error('Error loading dropdown data:', error);
        hideLoadingIndicators();
        showErrorMessage('errorLoadingData');
        
        // Fallback: Add some basic options
        addFallbackOptions();
    }
}

function showLoadingIndicators() {
    const countrySelect = document.getElementById('country');
    const currencySelect = document.getElementById('currency');
    const languageSelect = document.getElementById('language');
    
    if (countrySelect) {
        countrySelect.classList.add('loading');
        countrySelect.innerHTML = '<option value="">Loading countries...</option>';
    }
    
    if (currencySelect) {
        currencySelect.classList.add('loading');
        currencySelect.innerHTML = '<option value="">Loading currencies...</option>';
    }
    
    if (languageSelect) {
        languageSelect.classList.add('loading');
        languageSelect.innerHTML = '<option value="">Loading languages...</option>';
    }
}

function hideLoadingIndicators() {
    const selects = ['country', 'currency', 'language'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.classList.remove('loading');
        }
    });
}

async function populateCountryDropdown(countries) {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) return;
    
    // Clear loading option
    countrySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = window.i18n ? window.i18n.translate('createCompanyCode.selectCountry') : 'Select Country...';
    countrySelect.appendChild(defaultOption);
    
    // Sort countries by name
    const sortedCountries = countries.sort((a, b) => {
        const nameA = a.name?.common || '';
        const nameB = b.name?.common || '';
        return nameA.localeCompare(nameB);
    });
    
    // Add country options
    sortedCountries.forEach(country => {
        if (country.name?.common && country.cca2) {
            const option = document.createElement('option');
            option.value = country.cca2; // ISO 2-letter code
            option.textContent = `${country.name.common} (${country.cca2})`;
            option.setAttribute('data-capital', country.capital?.[0] || '');
            countrySelect.appendChild(option);
        }
    });
}

async function populateCurrencyDropdown(countries) {
    const currencySelect = document.getElementById('currency');
    if (!currencySelect) return;
    
    // Clear loading option
    currencySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = window.i18n ? window.i18n.translate('createCompanyCode.selectCurrency') : 'Select Currency...';
    currencySelect.appendChild(defaultOption);
    
    // Collect all unique currencies
    const currencies = new Set();
    countries.forEach(country => {
        if (country.currencies) {
            Object.keys(country.currencies).forEach(currencyCode => {
                const currency = country.currencies[currencyCode];
                if (currency.name) {
                    currencies.add(`${currencyCode}|${currency.name}|${currency.symbol || ''}`);
                }
            });
        }
    });
    
    // Convert to array and sort
    const sortedCurrencies = Array.from(currencies).sort((a, b) => {
        const nameA = a.split('|')[1];
        const nameB = b.split('|')[1];
        return nameA.localeCompare(nameB);
    });
    
    // Add currency options
    sortedCurrencies.forEach(currencyData => {
        const [code, name, symbol] = currencyData.split('|');
        const option = document.createElement('option');
        option.value = code; // ISO 3-letter code
        option.textContent = `${name} (${code})${symbol ? ' - ' + symbol : ''}`;
        currencySelect.appendChild(option);
    });
}

async function populateLanguageDropdown(countries) {
    const languageSelect = document.getElementById('language');
    if (!languageSelect) return;
    
    // Clear loading option
    languageSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = window.i18n ? window.i18n.translate('createCompanyCode.selectLanguage') : 'Select Language...';
    languageSelect.appendChild(defaultOption);
    
    // Collect all unique languages
    const languages = new Set();
    countries.forEach(country => {
        if (country.languages) {
            Object.entries(country.languages).forEach(([code, name]) => {
                languages.add(`${code}|${name}`);
            });
        }
    });
    
    // Convert to array and sort
    const sortedLanguages = Array.from(languages).sort((a, b) => {
        const nameA = a.split('|')[1];
        const nameB = b.split('|')[1];
        return nameA.localeCompare(nameB);
    });
    
    // Add language options
    sortedLanguages.forEach(languageData => {
        const [code, name] = languageData.split('|');
        const option = document.createElement('option');
        option.value = code; // ISO 2-letter code
        option.textContent = `${name} (${code})`;
        languageSelect.appendChild(option);
    });
}

function addFallbackOptions() {
    // Add some basic fallback countries
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.innerHTML = `
            <option value="">Select Country...</option>
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="DE">Germany (DE)</option>
            <option value="FR">France (FR)</option>
            <option value="IE">Ireland (IE)</option>
            <option value="CA">Canada (CA)</option>
            <option value="AU">Australia (AU)</option>
        `;
    }
    
    // Add some basic fallback currencies
    const currencySelect = document.getElementById('currency');
    if (currencySelect) {
        currencySelect.innerHTML = `
            <option value="">Select Currency...</option>
            <option value="USD">US Dollar (USD) - $</option>
            <option value="EUR">Euro (EUR) - €</option>
            <option value="GBP">British Pound (GBP) - £</option>
            <option value="CAD">Canadian Dollar (CAD) - $</option>
            <option value="AUD">Australian Dollar (AUD) - $</option>
        `;
    }
    
    // Add some basic fallback languages
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.innerHTML = `
            <option value="">Select Language...</option>
            <option value="en">English (en)</option>
            <option value="fr">French (fr)</option>
            <option value="de">German (de)</option>
            <option value="es">Spanish (es)</option>
            <option value="ga">Irish (ga)</option>
        `;
    }
}

function showErrorMessage(messageKey) {
    const message = window.i18n ? window.i18n.translate(`createCompanyCode.${messageKey}`) : 'Error loading data. Please try again.';
    // You could show this in a more sophisticated way, for now just console
    console.error(message);
}

// Form Validation and Submission
function setupCompanyCodeForm() {
    const form = document.getElementById('company-code-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    
    if (!form) return;
    
    // Set up cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                showCompanyCodeManagementPage();
            }
        });
    }
    
    // Set up form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmission();
    });
    
    // Set up real-time validation
    setupRealtimeValidation();
}

function setupRealtimeValidation() {
    const inputs = document.querySelectorAll('#company-code-form input, #company-code-form select');
    
    inputs.forEach(input => {
        // Validate on blur (when user leaves field)
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        // Clear validation on focus (when user starts typing again)
        input.addEventListener('focus', () => {
            clearFieldValidation(input);
        });
        
        // For text inputs, validate length as user types
        if (input.type === 'text' && input.maxLength) {
            input.addEventListener('input', () => {
                validateFieldLength(input);
            });
        }
    });
}

function validateField(input) {
    const fieldContainer = input.closest('.form-field');
    if (!fieldContainer) return;
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (input.required && !input.value.trim()) {
        isValid = false;
        errorMessage = window.i18n ? window.i18n.translate('createCompanyCode.validationRequired') : 'This field is required';
    }
    
    // Check field-specific validation
    if (isValid && input.value.trim()) {
        const validation = validateFieldSpecific(input);
        isValid = validation.isValid;
        errorMessage = validation.message;
    }
    
    // Apply validation styling
    if (!isValid) {
        showFieldError(fieldContainer, errorMessage);
    } else if (input.value.trim()) {
        showFieldSuccess(fieldContainer);
    } else {
        clearFieldValidation(input);
    }
    
    return isValid;
}

function validateFieldSpecific(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    
    switch (fieldName) {
        case 'companyCode':
            if (value.length !== 4) {
                return {
                    isValid: false,
                    message: window.i18n ? window.i18n.translate('createCompanyCode.validationInvalidFormat') : 'Company code must be exactly 4 characters'
                };
            }
            if (!/^[A-Z0-9]{4}$/.test(value.toUpperCase())) {
                return {
                    isValid: false,
                    message: 'Company code must contain only letters and numbers'
                };
            }
            break;
            
        case 'houseNumber':
            if (!/^\d+$/.test(value)) {
                return {
                    isValid: false,
                    message: 'House number must be numeric only'
                };
            }
            break;
            
        case 'companyName':
        case 'city':
        case 'vatRegistration':
        case 'inputTaxCode':
        case 'outputTaxCode':
        case 'addressLine1':
        case 'addressLine2':
        case 'addressLine3':
        case 'region':
        case 'district':
        case 'county':
        case 'state':
        case 'postCode':
            if (value.length > 132) {
                return {
                    isValid: false,
                    message: window.i18n ? window.i18n.translate('createCompanyCode.validationTooLong') : 'Value exceeds maximum length (132 characters)'
                };
            }
            break;
    }
    
    return { isValid: true, message: '' };
}

function validateFieldLength(input) {
    const fieldContainer = input.closest('.form-field');
    if (!fieldContainer) return;
    
    const maxLength = parseInt(input.getAttribute('maxlength'));
    const currentLength = input.value.length;
    
    if (maxLength && currentLength > maxLength * 0.9) {
        // Show warning when approaching limit
        const remaining = maxLength - currentLength;
        if (remaining <= 0) {
            showFieldError(fieldContainer, `Maximum length exceeded (${maxLength} characters)`);
        } else {
            showFieldWarning(fieldContainer, `${remaining} characters remaining`);
        }
    }
}

function showFieldError(fieldContainer, message) {
    clearFieldMessages(fieldContainer);
    fieldContainer.classList.remove('success');
    fieldContainer.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    fieldContainer.appendChild(errorDiv);
}

function showFieldSuccess(fieldContainer) {
    clearFieldMessages(fieldContainer);
    fieldContainer.classList.remove('error');
    fieldContainer.classList.add('success');
}

function showFieldWarning(fieldContainer, message) {
    // Clear existing messages but keep validation state
    const existingMessages = fieldContainer.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach(msg => msg.remove());
    
    const warningDiv = document.createElement('div');
    warningDiv.className = 'error-message';
    warningDiv.style.color = '#f39c12'; // Orange for warning
    warningDiv.textContent = message;
    fieldContainer.appendChild(warningDiv);
}

function clearFieldValidation(input) {
    const fieldContainer = input.closest('.form-field');
    if (!fieldContainer) return;
    
    fieldContainer.classList.remove('error', 'success');
    clearFieldMessages(fieldContainer);
}

function clearFieldMessages(fieldContainer) {
    const messages = fieldContainer.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
}

function handleFormSubmission() {
    const form = document.getElementById('company-code-form');
    const saveBtn = document.getElementById('save-btn');
    
    if (!form || !saveBtn) return;
    
    // Disable submit button to prevent double submission
    saveBtn.disabled = true;
    saveBtn.textContent = window.i18n ? window.i18n.translate('createCompanyCode.saving') : 'Saving...';
    
    // Validate all fields
    const inputs = form.querySelectorAll('input, select');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        // Re-enable submit button
        saveBtn.disabled = false;
        saveBtn.textContent = window.i18n ? window.i18n.translate('createCompanyCode.save') : 'Save Company Code';
        
        // Scroll to first error
        const firstError = form.querySelector('.form-field.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Collect form data
    const formData = new FormData(form);
    const companyCodeData = {};
    
    for (let [key, value] of formData.entries()) {
        companyCodeData[key] = value;
    }
    
    // Convert data types for API compatibility
    cleanFormDataForAPI(companyCodeData);
    
    // Call the actual microservice API
    submitToMicroservice(companyCodeData, saveBtn);
}

function cleanFormDataForAPI(data) {
    // Convert houseNumber to number or null
    if (data.houseNumber !== undefined) {
        if (data.houseNumber === '' || data.houseNumber === null) {
            data.houseNumber = null;
        } else {
            const num = parseInt(data.houseNumber, 10);
            data.houseNumber = isNaN(num) ? null : num;
        }
    }
    
    // Convert empty strings to null for optional fields
    const optionalFields = [
        'vatRegistrationNumber', 'inputTaxCode', 'outputTaxCode',
        'addressLine1', 'addressLine2', 'addressLine3',
        'region', 'district', 'county', 'state', 'postCode'
    ];
    
    optionalFields.forEach(field => {
        if (data[field] === '') {
            data[field] = null;
        }
    });
    
    return data;
}

async function submitToMicroservice(companyCodeData, saveBtn) {
    try {
        // Check if microservice is available
        const healthResponse = await fetch('http://localhost:3001/health');
        if (!healthResponse.ok) {
            throw new Error('Company Code microservice is not running. Please start it at http://localhost:3001');
        }

        console.log('Submitting company code data:', companyCodeData);

        // Submit to microservice
        const response = await fetch('http://localhost:3001/api/company-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(companyCodeData)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            console.error('Response body:', result);
            
            // Handle specific validation errors
            if (result.errors && Array.isArray(result.errors)) {
                const errorMessages = result.errors.map(err => `${err.field}: ${err.message}`).join('\n');
                throw new Error(`Validation errors:\n${errorMessages}`);
            }
            
            throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        console.log('Company Code created successfully:', result.data);
        
        // Show success message
        showSuccessToast(window.i18n ? window.i18n.translate('createCompanyCode.successSaved') : 'Company code saved successfully!');
        
        // Navigate to company code management page instead of organizational structure
        showCompanyCodeManagementPage();
        
    } catch (error) {
        console.error('Error saving company code:', error);
        
        if (error.message.includes('microservice is not running')) {
            showErrorToast('Company Code service is not available. Please contact administrator.');
        } else if (error.message.includes('already exists')) {
            showErrorToast('Company code already exists. Please use a different code.');
        } else {
            showErrorToast('Error saving company code. Please try again.');
        }
    } finally {
        // Re-enable submit button
        saveBtn.disabled = false;
        saveBtn.textContent = window.i18n ? window.i18n.translate('createCompanyCode.save') : 'Save Company Code';
    }
}

function showSuccessToast(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: '#4CAF50',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: '10000',
        fontSize: '14px',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

function showErrorToast(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: '#f44336',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: '10000',
        fontSize: '14px',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    document.body.appendChild(toast);
    
    // Remove after 5 seconds (longer for error messages)
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// Company Code Management Page
function showCompanyCodeManagementPage() {
    // Use the common navigation system to properly track navigation history
    if (window.commonNavigation) {
        window.commonNavigation.navigateToPage('company-code-management');
    } else {
        // Fallback: direct DOM manipulation if navigation system not available
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.style.display = 'none');
        
        const managementPage = document.getElementById('company-code-management-page');
        if (managementPage) {
            managementPage.style.display = 'block';
        }
        
        console.log('Navigated to Company Code Management page (fallback)');
    }
    
    // Initialize the company code management functionality
    if (typeof setupCompanyCodeManagement === 'function') {
        setupCompanyCodeManagement();
    }
    
    // Update translations for the new page
    if (window.i18n) {
        window.i18n.updatePageTranslations();
    }
}