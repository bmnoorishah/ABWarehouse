// Common Navigation Manager
class CommonNavigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.navigationContainer = null;
        this.navigationHistory = []; // Track navigation history for back button
        
        // Listen for language changes from i18n system
        window.addEventListener('languageChanged', (e) => {
            const newLang = e.detail.language;
            console.log('Language changed event received:', newLang);
            this.updateLanguageDisplay(newLang);
            this.updateLanguageDisplayForClone(newLang);
        });
        this.pageConfigs = {
            'dashboard': {
                title: 'dashboard.title',
                showBack: false,
                showHome: false
            },
            'organizational-structure': {
                title: 'organizationalStructure.title',
                showBack: true,
                showHome: true,
                backAction: () => this.navigateToPage('dashboard')
            },
            'create-company-code': {
                title: 'createCompanyCode.title',
                showBack: true,
                showHome: true,
                backAction: () => this.navigateToPage('organizational-structure')
            }
        };
    }

    async loadNavigation() {
        try {
            // Load the common navigation HTML
            const response = await fetch('./common-navigation.html');
            const navigationHTML = await response.text();
            
            // Create a container for navigation if it doesn't exist
            let navContainer = document.getElementById('common-navigation-container');
            if (!navContainer) {
                navContainer = document.createElement('div');
                navContainer.id = 'common-navigation-container';
                document.body.insertBefore(navContainer, document.body.firstChild);
            }
            
            navContainer.innerHTML = navigationHTML;
            this.navigationContainer = document.getElementById('common-navigation');
            
            // Hide the original navigation container since we'll clone it to pages
            if (this.navigationContainer) {
                this.navigationContainer.style.display = 'none';
            }
            
            // Don't initialize events on hidden original navigation
            // Events will be initialized when navigation is cloned to pages
            
            return true;
        } catch (error) {
            console.error('Failed to load common navigation:', error);
            return false;
        }
    }

    initializeEvents() {
        // Home button
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                if (typeof showDashboardPage === 'function') {
                    showDashboardPage();
                } else {
                    this.navigateToPage('dashboard');
                }
            });
        }

        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.goBack();
            });
        }

        // Search functionality
        this.initializeSearch();

        // User menu
        this.initializeUserMenu();

        // Language switcher
        this.initializeLanguageSwitcher();

        // New screen button
        const newScreenBtn = document.getElementById('new-screen-btn');
        if (newScreenBtn) {
            newScreenBtn.addEventListener('click', () => {
                this.openNewSession();
            });
        }

        // Close session button
        const closeBtn = document.getElementById('close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeCurrentSession();
            });
        }

        // Global click handler to close all dropdowns
        document.addEventListener('click', (e) => {
            // Check if click is outside any dropdown container and not on navigation buttons
            if (!e.target.closest('.nav-language-switcher') && 
                !e.target.closest('.nav-user-menu') &&
                !e.target.closest('.nav-btn') &&
                !e.target.closest('.nav-btn-unified') &&
                !e.target.closest('.nav-btn-home') &&
                !e.target.closest('.nav-btn-back') &&
                !e.target.closest('.nav-btn-new-session') &&
                !e.target.closest('.nav-btn-close-session')) {
                this.closeAllDropdowns();
            }
        });
    }

    initializeSearch() {
        const searchInput = document.getElementById('nav-search-input');
        const searchClearBtn = document.getElementById('search-clear-btn');
        const searchFilterBtn = document.getElementById('search-filter-btn');
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (searchInput) {
            // Enhanced real-time search with debouncing
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // Show/hide clear button
                if (searchClearBtn) {
                    searchClearBtn.style.display = query.length > 0 ? 'flex' : 'none';
                }
                
                // Clear previous timeout
                clearTimeout(searchTimeout);
                
                // Debounced search
                searchTimeout = setTimeout(() => {
                    if (query.length > 0) {
                        this.showEnhancedSearchSuggestions(query);
                    } else {
                        this.hideSearchSuggestions();
                    }
                }, 150);
            });

            searchInput.addEventListener('focus', () => {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    this.showEnhancedSearchSuggestions(query);
                } else {
                    this.showRecentSearches();
                }
            });

            // Enhanced search shortcuts
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    if (query) {
                        this.performSearch(query);
                    }
                } else if (e.key === 'Escape') {
                    this.hideSearchSuggestions();
                    searchInput.blur();
                }
            });
        }

        // Enhanced clear search button
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    searchClearBtn.style.display = 'none';
                    this.hideSearchSuggestions();
                    searchInput.focus();
                }
            });
        }

        // Search filter button
        if (searchFilterBtn) {
            searchFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showSearchFilters();
            });
        }

        // Hide suggestions when clicking outside
        if (searchSuggestions) {
            document.addEventListener('click', (e) => {
                if (!searchInput?.contains(e.target) && 
                    !searchSuggestions.contains(e.target) &&
                    !searchFilterBtn?.contains(e.target)) {
                    this.hideSearchSuggestions();
                }
            });
        }

        // Setup global keyboard shortcuts
        this.setupKeyboardNavigation();
    }

    // Enhanced search suggestions
    showEnhancedSearchSuggestions(query) {
        const suggestions = document.getElementById('search-suggestions');
        if (!suggestions) return;
        
        const mockResults = this.getEnhancedSearchResults(query);
        const suggestionsList = document.getElementById('suggestion-list');
        
        if (suggestionsList && mockResults.length > 0) {
            suggestionsList.innerHTML = mockResults.map(result => `
                <div class="suggestion-item-enhanced" data-action="${result.action}">
                    <div class="suggestion-icon">${result.icon}</div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${result.title}</div>
                        <div class="suggestion-subtitle">${result.category}</div>
                    </div>
                    <div class="suggestion-shortcut">${result.shortcut || ''}</div>
                </div>
            `).join('');
            
            // Add click handlers for suggestions
            suggestionsList.querySelectorAll('.suggestion-item-enhanced').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.getAttribute('data-action');
                    this.executeSearchAction(action);
                    this.hideSearchSuggestions();
                });
            });
        }
        
        suggestions.style.display = 'block';
    }

    // Show recent searches
    showRecentSearches() {
        const suggestions = document.getElementById('search-suggestions');
        const suggestionsList = document.getElementById('suggestion-list');
        
        if (!suggestions || !suggestionsList) return;
        
        suggestionsList.innerHTML = `
            <div class="suggestion-item-enhanced recent-search">
                <div class="suggestion-icon">🕒</div>
                <div class="suggestion-content">
                    <div class="suggestion-title">Recent searches will appear here</div>
                    <div class="suggestion-subtitle">Start typing to search</div>
                </div>
            </div>
        `;
        
        suggestions.style.display = 'block';
    }

    // Hide search suggestions
    hideSearchSuggestions() {
        const suggestions = document.getElementById('search-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    // Get enhanced search results
    getEnhancedSearchResults(query) {
        const allResults = [
            { title: 'Inbound Delivery', category: 'Warehouse Operations', icon: '📦', action: 'inbound_delivery', shortcut: 'Alt+I' },
            { title: 'Outbound Delivery', category: 'Warehouse Operations', icon: '📤', action: 'outbound_delivery', shortcut: 'Alt+O' },
            { title: 'Material Master', category: 'Master Data', icon: '📋', action: 'material_master', shortcut: 'Alt+M' },
            { title: 'Storage Location', category: 'Master Data', icon: '📍', action: 'storage_location', shortcut: 'Alt+S' },
            { title: 'Inventory Report', category: 'Reports', icon: '📊', action: 'inventory_report', shortcut: 'Alt+R' },
            { title: 'Company Codes', category: 'System Configuration', icon: '🏢', action: 'company_codes', shortcut: 'Alt+C' },
            { title: 'Create Company Code', category: 'System Configuration', icon: '🏢', action: 'create_company', shortcut: 'Ctrl+C' },
            { title: 'Plants Management', category: 'Organizational Structure', icon: '🏭', action: 'plants_mgmt', shortcut: 'Ctrl+P' }
        ];
        
        return allResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);
    }

    // Execute search actions
    executeSearchAction(action) {
        console.log(`Executing action: ${action}`);
        switch(action) {
            case 'create_company':
                if (typeof showCreateCompanyCodePage === 'function') {
                    showCreateCompanyCodePage();
                }
                break;
            case 'company_codes':
                if (typeof showOrganizationalStructurePage === 'function') {
                    showOrganizationalStructurePage();
                }
                break;
            default:
                console.log(`Action ${action} not implemented yet`);
        }
    }

    // Perform search
    performSearch(query) {
        console.log(`Performing search for: ${query}`);
        // Add to search history
        this.addToSearchHistory(query);
        // Execute search logic here
    }

    // Add to search history
    addToSearchHistory(query) {
        if (!this.searchHistory) {
            this.searchHistory = [];
        }
        
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        
        // Add to beginning
        this.searchHistory.unshift(query);
        
        // Keep only last 10 items
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
    }

    // Show search filters
    showSearchFilters() {
        console.log('Search filters modal would open here');
    }

    // Setup keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Global shortcuts
            if (e.altKey) {
                switch(e.key.toLowerCase()) {
                    case 'h':
                        e.preventDefault();
                        document.getElementById('home-btn')?.click();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('nav-search-input')?.focus();
                        break;
                    case 'b':
                        e.preventDefault();
                        const config = this.pageConfigs[this.currentPage];
                        if (config && config.backAction) {
                            config.backAction();
                        }
                        break;
                }
            }
        });
    }

    initializeUserMenu() {
        // Use a small delay to ensure DOM is ready
        setTimeout(() => {
            const userBtn = document.getElementById('user-btn');
            const userDropdown = document.getElementById('user-dropdown');
            
            if (userBtn && userDropdown) {
                // Remove any existing event listeners to prevent duplicates
                userBtn.replaceWith(userBtn.cloneNode(true));
                const newUserBtn = document.getElementById('user-btn');
                
                newUserBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Close other dropdowns
                    this.closeAllDropdowns();
                    userDropdown.classList.toggle('show');
                });
            }

            // Profile link functionality
            const profileLink = document.getElementById('profile-link');
            if (profileLink) {
                profileLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Profile settings functionality would open here');
                    this.closeAllDropdowns();
                });
            }

            // Logout functionality
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm('Are you sure you want to sign out?')) {
                        if (typeof showLoginPage === 'function') {
                            showLoginPage();
                        } else {
                            alert('Login page function not available');
                        }
                    }
                });
            }
        }, 100);
    }

    initializeLanguageSwitcher() {
        const languageToggle = document.getElementById('language-toggle');
        const languageDropdown = document.getElementById('language-dropdown');
        
        if (languageToggle && languageDropdown) {
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other dropdowns
                this.closeAllDropdowns();
                languageDropdown.classList.toggle('show');
            });

            // Language selection - updated for new structure
            const languageOptions = languageDropdown.querySelectorAll('.nav-dropdown-item');
            languageOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = option.getAttribute('data-lang');
                    this.changeLanguage(lang);
                    this.updateLanguageDisplay(lang);
                    languageDropdown.classList.remove('show');
                });
            });
        }

        // Initialize back button visibility based on navigation history
        this.updateBackButtonVisibility();

        // Listen for language changes from i18n system
        window.addEventListener('languageChanged', (e) => {
            this.updateLanguageDisplay(e.detail.language);
            this.updateLanguageDisplayForClone(e.detail.language);
        });
    }

    // Close all dropdowns
    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown-unified');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    // Update language display
    updateLanguageDisplay(lang) {
        const langFlags = {
            'en': '🇺🇸',
            'fr': '🇫🇷'
        };
        
        const langNames = {
            'en': 'EN',
            'fr': 'FR'
        };
        
        console.log('Updating language display to:', lang);
        
        // Update the main navigation language button display
        const langIcon = document.querySelector('#language-flag');
        const langLabel = document.querySelector('#language-text');
        
        if (langIcon) {
            langIcon.textContent = langFlags[lang] || '🇺🇸';
            console.log('Updated flag to:', langFlags[lang]);
        } else {
            console.warn('Language flag element not found');
        }
        
        if (langLabel) {
            langLabel.textContent = langNames[lang] || 'EN';
            console.log('Updated language text to:', langNames[lang]);
        } else {
            console.warn('Language text element not found');
        }
        
        // Also update any cloned navigation instances
        this.updateLanguageDisplayForClone(lang);
    }

    changeLanguage(lang) {
        console.log('Attempting to change language to:', lang);
        if (window.i18n && typeof window.i18n.setLanguage === 'function') {
            window.i18n.setLanguage(lang);
            console.log('Language changed successfully');
        } else {
            console.warn('i18n system not available or setLanguage method missing');
            // Fallback: manually update the display
            this.updateLanguageDisplay(lang);
        }
    }

    updatePageConfig(configOrPageId) {
        let config;
        
        // Handle both configuration object and pageId
        if (typeof configOrPageId === 'string') {
            this.currentPage = configOrPageId;
            config = this.pageConfigs[configOrPageId];
        } else if (typeof configOrPageId === 'object') {
            // Direct configuration object
            config = configOrPageId;
            this.currentPageConfig = config;
        }
        
        if (!config) return;

        // Update page title (removed as requested)
        // Title is now removed from navigation

        // Back button visibility is now controlled by navigation history
        // (handled in updateBackButtonVisibility method)

        // Show/hide home button (always visible as requested)
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.style.display = 'flex'; // Always show home button
        }

        // Show/hide search
        const searchSection = document.querySelector('.nav-search-section');
        if (searchSection) {
            searchSection.style.display = (config.showSearch !== false) ? 'block' : 'none';
        }

        // Store back action
        if (config.backAction) {
            this.currentPageConfig = { ...this.currentPageConfig, backAction: config.backAction };
        }
    }

    navigateToPage(pageId) {
        // Add current page to history before navigating (if not already there)
        if (this.currentPage && this.currentPage !== pageId) {
            // Remove any existing instances of the current page from history
            this.navigationHistory = this.navigationHistory.filter(page => page !== this.currentPage);
            // Add current page to the beginning of history
            this.navigationHistory.unshift(this.currentPage);
            // Keep only last 10 pages in history
            if (this.navigationHistory.length > 10) {
                this.navigationHistory = this.navigationHistory.slice(0, 10);
            }
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });

        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
            this.currentPage = pageId;
            this.updatePageConfig(pageId);
            this.updateBackButtonVisibility();

            // Call page-specific setup functions if they exist
            if (pageId === 'dashboard' && typeof setupDashboard === 'function') {
                setupDashboard();
            } else if (pageId === 'organizational-structure' && typeof setupOrganizationalStructureActions === 'function') {
                setupOrganizationalStructureActions();
            } else if (pageId === 'create-company-code' && typeof setupCompanyCodeForm === 'function') {
                setupCompanyCodeForm();
            } else if (pageId === 'company-code-management' && typeof setupCompanyCodeManagement === 'function') {
                setupCompanyCodeManagement();
            }
        }
    }

    // Update back button visibility based on navigation history
    updateBackButtonVisibility() {
        // Always show back button except on dashboard page
        const showBack = this.currentPage !== 'dashboard';
        
        // Update original navigation
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.style.display = showBack ? 'flex' : 'none';
        }

        // Update all cloned navigation instances
        const clonedBackBtns = document.querySelectorAll('.nav-clone #back-btn');
        clonedBackBtns.forEach(clonedBackBtn => {
            clonedBackBtn.style.display = showBack ? 'flex' : 'none';
        });
    }
    
    // Update back button visibility for a specific element
    updateBackButtonVisibilityForElement(element) {
        const backBtn = element.querySelector('.nav-btn-back');
        if (backBtn) {
            // Detect current page from the element context if needed
            const currentPageFromElement = this.detectCurrentPageFromElement(element);
            const currentPage = currentPageFromElement || this.currentPage;
            
            // Show back button if not on dashboard page (always show on other pages)
            const showBack = currentPage !== 'dashboard';
            backBtn.style.display = showBack ? 'flex' : 'none';
        }
    }
    
    // Detect current page from element context (for cloned navigation)
    detectCurrentPageFromElement(element) {
        // Look for parent page container
        const pageContainer = element.closest('.page');
        if (pageContainer && pageContainer.id) {
            return pageContainer.id.replace('-page', '');
        }
        
        // Look for navigation ID that might contain page info
        if (element.id && element.id.includes('-navigation')) {
            return element.id.replace('-navigation', '');
        }
        
        return null;
    }

    // Go back to previous page in navigation history
    goBack() {
        console.log('goBack() called');
        console.log('Current page:', this.currentPage);
        console.log('Navigation history:', this.navigationHistory);
        
        if (this.navigationHistory.length > 0) {
            const previousPage = this.navigationHistory.shift(); // Remove and get first item
            console.log('Going back to:', previousPage);
            // Navigate without adding to history (since we're going back)
            this.navigateToPageWithoutHistory(previousPage);
        } else {
            console.log('No navigation history, using fallback');
            // Fallback: if no history, go to dashboard or use config-based back action
            if (this.currentPage !== 'dashboard') {
                // Try config-based back action first
                const config = this.pageConfigs[this.currentPage];
                console.log('Page config:', config);
                if (config && config.backAction) {
                    console.log('Using config back action');
                    config.backAction();
                } else {
                    // Default fallback: go to dashboard
                    console.log('Using default fallback to dashboard');
                    this.navigateToPageWithoutHistory('dashboard');
                }
            } else {
                console.log('Already on dashboard, no back action needed');
            }
        }
    }

    // Navigate to page without adding current page to history (used for back navigation)
    navigateToPageWithoutHistory(pageId) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });

        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
            this.currentPage = pageId;
            this.updatePageConfig(pageId);
            this.updateBackButtonVisibility();

            // Call page-specific setup functions if they exist
            if (pageId === 'dashboard' && typeof setupDashboard === 'function') {
                setupDashboard();
            } else if (pageId === 'organizational-structure' && typeof setupOrganizationalStructureActions === 'function') {
                setupOrganizationalStructureActions();
            } else if (pageId === 'create-company-code' && typeof setupCompanyCodeForm === 'function') {
                setupCompanyCodeForm();
            } else if (pageId === 'company-code-management' && typeof setupCompanyCodeManagement === 'function') {
                setupCompanyCodeManagement();
            }
        }
    }

    show() {
        if (this.navigationContainer) {
            this.navigationContainer.style.display = 'block';
        }
    }

    hide() {
        if (this.navigationContainer) {
            this.navigationContainer.style.display = 'none';
        }
    }

    // Reinitialize events for cloned navigation elements
    reinitializeEventsForClone(clonedElement) {
        // Add nav-clone class for identification
        clonedElement.classList.add('nav-clone');
        
        console.log('Reinitializing events for cloned navigation element');
        
        // Initialize all components for this cloned element
        this.initializeNavigationEvents(clonedElement);
        
        // Add global click handler for this clone to close dropdowns
        this.addGlobalClickHandlerForClone(clonedElement);
        
        // Force update back button visibility for this specific clone
        setTimeout(() => {
            this.detectCurrentPage();
            this.updateBackButtonVisibilityForElement(clonedElement);
            
            // Extra check and debug for back button visibility
            const backBtn = clonedElement.querySelector('.nav-btn-back');
            if (backBtn && this.currentPage !== 'dashboard') {
                backBtn.style.display = 'flex';
                console.log('Back button made visible on', this.currentPage, 'page');
            }
        }, 100);
    }
    
    // Universal method to initialize navigation events on any element
    initializeNavigationEvents(element = document) {
        console.log('Initializing navigation events for element:', element);
        
        // Update user display first
        this.updateUserDisplay(element);
        
        // Home button - use class selector within the element context
        const homeBtn = element.querySelector('.nav-btn-home');
        if (homeBtn) {
            console.log('Initializing home button');
            // Remove existing listeners by cloning
            const newHomeBtn = homeBtn.cloneNode(true);
            homeBtn.parentNode.replaceChild(newHomeBtn, homeBtn);
            
            // Add click handler with proper event handling
            const handleHomeClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Home button clicked');
                if (typeof showDashboardPage === 'function') {
                    showDashboardPage();
                }
            };
            
            newHomeBtn.addEventListener('click', handleHomeClick);
            
            // Also add handler to home icon to ensure it triggers the button
            const homeIcon = newHomeBtn.querySelector('.nav-home-icon');
            if (homeIcon) {
                homeIcon.addEventListener('click', handleHomeClick);
            }
        } else {
            console.log('Home button not found in element');
        }

        // Back button - use class selector within the element context
        const backBtn = element.querySelector('.nav-btn-back');
        if (backBtn) {
            console.log('Initializing back button');
            // Remove existing listeners by cloning
            const newBackBtn = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBackBtn, backBtn);
            
            // Add click handler to the button and ensure child elements trigger it
            const handleBackClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Back button clicked');
                this.goBack();
            };
            
            newBackBtn.addEventListener('click', handleBackClick);
            
            // Also add handlers to child elements to ensure they trigger the button
            const backIcon = newBackBtn.querySelector('.nav-back-icon');
            const backText = newBackBtn.querySelector('.nav-back-text');
            
            if (backIcon) {
                backIcon.addEventListener('click', handleBackClick);
            }
            if (backText) {
                backText.addEventListener('click', handleBackClick);
            }
        } else {
            console.log('Back button not found in element');
        }

        // User menu
        this.initializeSimpleUserMenu(element);
        
        // Language switcher
        this.initializeSimpleLanguageSwitcher(element);
        
        // New screen button - use class selector
        const newScreenBtn = element.querySelector('.nav-btn-new-session');
        if (newScreenBtn) {
            console.log('Initializing new session button');
            // Remove existing listeners by cloning
            const newNewScreenBtn = newScreenBtn.cloneNode(true);
            newScreenBtn.parentNode.replaceChild(newNewScreenBtn, newScreenBtn);
            
            newNewScreenBtn.addEventListener('click', () => {
                console.log('New session button clicked');
                this.openNewSession();
            });
        } else {
            console.log('New session button not found in element');
        }

        // Close session button - use class selector
        const closeBtn = element.querySelector('.nav-btn-close-session');
        if (closeBtn) {
            console.log('Initializing close session button');
            // Remove existing listeners by cloning
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', () => {
                console.log('Close session button clicked');
                this.closeCurrentSession();
            });
        } else {
            console.log('Close session button not found in element');
        }

        // Search functionality (if not already initialized)
        this.initializeSearchForElement(element);
        
        // Update back button visibility for this element
        this.updateBackButtonVisibilityForElement(element);
    }

    // Universal user menu initialization for any element
    initializeUserMenuForElement(element) {
        const userBtn = element.querySelector('.nav-user-menu .nav-btn-unified');
        const userDropdown = element.querySelector('.user-dropdown');
        
        console.log('User menu initialization:', {
            button: !!userBtn,
            dropdown: !!userDropdown,
            element: element
        });
        
        if (userBtn && userDropdown) {
            console.log('Initializing user menu');
            console.log('User dropdown classes:', userDropdown.className);
            console.log('User dropdown style:', userDropdown.style.cssText);
            
            // Remove any existing listeners by cloning the button
            const newUserBtn = userBtn.cloneNode(true);
            userBtn.parentNode.replaceChild(newUserBtn, userBtn);
            
            newUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('User menu clicked');
                
                // Close all other dropdowns
                document.querySelectorAll('.nav-dropdown-unified.show').forEach(dropdown => {
                    if (dropdown !== userDropdown) {
                        dropdown.classList.remove('show');
                    }
                });
                
                // Toggle this dropdown
                userDropdown.classList.toggle('show');
                console.log('User dropdown toggled, show class:', userDropdown.classList.contains('show'));
                console.log('User dropdown final classes:', userDropdown.className);
                console.log('User dropdown computed display:', window.getComputedStyle(userDropdown).display);
                console.log('User dropdown computed visibility:', window.getComputedStyle(userDropdown).visibility);
                console.log('User dropdown computed opacity:', window.getComputedStyle(userDropdown).opacity);
            });
        } else {
            console.log('User menu elements not found:', {
                button: !!userBtn,
                dropdown: !!userDropdown
            });
        }

        // Profile link functionality - use data attribute selector
        const profileLink = element.querySelector('.nav-dropdown-item[data-i18n="dashboard.profileSettings"]');
        if (profileLink) {
            console.log('Profile link found and initialized');
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('Profile settings functionality would open here');
                if (userDropdown) userDropdown.classList.remove('show');
            });
        } else {
            console.log('Profile link not found');
        }

        // Logout functionality - use data attribute selector
        const logoutLink = element.querySelector('.nav-dropdown-item[data-i18n="dashboard.signOut"]');
        if (logoutLink) {
            console.log('Logout link found and initialized');
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to sign out?')) {
                    if (typeof showLoginPage === 'function') {
                        showLoginPage();
                    } else {
                        alert('Login page function not available');
                    }
                }
            });
        } else {
            console.log('Logout link not found');
        }
    }

    // Universal language switcher initialization for any element
    initializeLanguageSwitcherForElement(element) {
        const languageToggle = element.querySelector('.nav-language-switcher .nav-btn-unified');
        const languageDropdown = element.querySelector('.language-dropdown');
        
        console.log('Language switcher initialization:', {
            toggle: !!languageToggle,
            dropdown: !!languageDropdown,
            element: element
        });
        
        if (languageToggle && languageDropdown) {
            console.log('Initializing language switcher');
            console.log('Language dropdown classes:', languageDropdown.className);
            console.log('Language dropdown style:', languageDropdown.style.cssText);
            
            // Remove any existing listeners by cloning the button
            const newLanguageToggle = languageToggle.cloneNode(true);
            languageToggle.parentNode.replaceChild(newLanguageToggle, languageToggle);
            
            newLanguageToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Language switcher clicked');
                
                // Close all other dropdowns
                document.querySelectorAll('.nav-dropdown-unified.show').forEach(dropdown => {
                    if (dropdown !== languageDropdown) {
                        dropdown.classList.remove('show');
                    }
                });
                
                // Toggle this dropdown
                languageDropdown.classList.toggle('show');
                console.log('Language dropdown toggled, show class:', languageDropdown.classList.contains('show'));
                console.log('Language dropdown final classes:', languageDropdown.className);
                console.log('Language dropdown computed display:', window.getComputedStyle(languageDropdown).display);
                console.log('Language dropdown computed visibility:', window.getComputedStyle(languageDropdown).visibility);
            });

            // Language selection - updated for new structure
            const languageOptions = languageDropdown.querySelectorAll('.nav-dropdown-item[data-lang]');
            console.log('Found language options:', languageOptions.length);
            
            languageOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const lang = option.getAttribute('data-lang');
                    console.log('Language option clicked:', lang);
                    this.changeLanguage(lang);
                    languageDropdown.classList.remove('show');
                });
            });
        } else {
            console.log('Language switcher elements not found:', {
                toggle: !!languageToggle,
                dropdown: !!languageDropdown
            });
        }
    }
    
    // Add global click handler for cloned element
    addGlobalClickHandlerForClone(element) {
        element.addEventListener('click', (e) => {
            // Check if click is outside any dropdown container within this element and not on navigation buttons
            if (!e.target.closest('.nav-language-switcher') && 
                !e.target.closest('.nav-user-menu') &&
                !e.target.closest('.nav-btn') &&
                !e.target.closest('.nav-btn-unified') &&
                !e.target.closest('.nav-btn-home') &&
                !e.target.closest('.nav-btn-back') &&
                !e.target.closest('.nav-btn-new-session') &&
                !e.target.closest('.nav-btn-close-session')) {
                const dropdowns = element.querySelectorAll('.nav-dropdown-unified');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
    }
    
    // Universal search initialization for any element
    initializeSearchForElement(element) {
        const searchInput = element.querySelector('.nav-search-input-enhanced');
        const searchClearBtn = element.querySelector('.search-clear-btn-enhanced');
        
        if (searchInput && searchClearBtn) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                searchClearBtn.style.display = query.length > 0 ? 'flex' : 'none';
            });
            
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchClearBtn.style.display = 'none';
            });
        }
    }
    
    // Detect current page based on which page is visible
    detectCurrentPage() {
        const pages = document.querySelectorAll('.page');
        for (let page of pages) {
            if (page.style.display !== 'none' && page.offsetParent !== null) {
                // Extract page name from ID (remove '-page' suffix)
                const pageId = page.id.replace('-page', '');
                if (pageId && this.pageConfigs[pageId]) {
                    this.currentPage = pageId;
                    return pageId;
                }
            }
        }
        // Default to dashboard if no page detected
        this.currentPage = 'dashboard';
        return 'dashboard';
    }

    initializeNewScreenForClone(clonedElement) {
        const newScreenBtn = clonedElement.querySelector('.nav-btn-new-session');
        if (newScreenBtn) {
            // Remove existing listeners by cloning
            const newNewScreenBtn = newScreenBtn.cloneNode(true);
            newScreenBtn.parentNode.replaceChild(newNewScreenBtn, newScreenBtn);
            
            newNewScreenBtn.addEventListener('click', () => {
                this.openNewSession();
            });
        }
    }

    updateLanguageDisplayForClone(lang, clonedElement = null) {
        const langFlags = {
            'en': '🇺🇸',
            'fr': '🇫🇷'
        };
        
        const langNames = {
            'en': 'EN',
            'fr': 'FR'
        };
        
        console.log('Updating language display for clones to:', lang);
        
        // If a specific cloned element is provided, update that one
        if (clonedElement) {
            const langIcon = clonedElement.querySelector('#language-flag');
            const langLabel = clonedElement.querySelector('#language-text');
            
            if (langIcon) {
                langIcon.textContent = langFlags[lang] || '🇺🇸';
                console.log('Updated clone flag to:', langFlags[lang]);
            }
            if (langLabel) {
                langLabel.textContent = langNames[lang] || 'EN';
                console.log('Updated clone text to:', langNames[lang]);
            }
        } else {
            // Update all cloned navigation instances
            document.querySelectorAll('.nav-clone').forEach(clone => {
                const langIcon = clone.querySelector('#language-flag');
                const langLabel = clone.querySelector('#language-text');
                
                if (langIcon) langIcon.textContent = langFlags[lang] || '🇺🇸';
                if (langLabel) langLabel.textContent = langNames[lang] || 'EN';
            });
        }
    }

    initializeSearchForClone(clonedElement) {
        const searchInput = clonedElement.querySelector('#nav-search-input');
        const searchClearBtn = clonedElement.querySelector('#search-clear-btn');
        const searchFilterBtn = clonedElement.querySelector('#search-filter-btn');
        const searchSuggestions = clonedElement.querySelector('#search-suggestions');
        
        if (searchInput) {
            // Enhanced real-time search with debouncing
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // Show/hide clear button
                if (searchClearBtn) {
                    searchClearBtn.style.display = query.length > 0 ? 'flex' : 'none';
                }
                
                // Clear previous timeout
                clearTimeout(searchTimeout);
                
                // Debounced search
                searchTimeout = setTimeout(() => {
                    if (query.length > 0) {
                        this.showEnhancedSearchSuggestionsForClone(query, clonedElement);
                    } else {
                        this.hideSearchSuggestionsForClone(clonedElement);
                    }
                }, 150);
            });

            searchInput.addEventListener('focus', () => {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    this.showEnhancedSearchSuggestionsForClone(query, clonedElement);
                } else {
                    this.showRecentSearchesForClone(clonedElement);
                }
            });

            // Enhanced search shortcuts
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    if (query) {
                        this.performSearch(query);
                    }
                } else if (e.key === 'Escape') {
                    this.hideSearchSuggestionsForClone(clonedElement);
                    searchInput.blur();
                }
            });
        }

        // Enhanced clear search button
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    searchClearBtn.style.display = 'none';
                    this.hideSearchSuggestionsForClone(clonedElement);
                    searchInput.focus();
                }
            });
        }

        // Search filter button
        if (searchFilterBtn) {
            searchFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showSearchFilters();
            });
        }

        // Hide suggestions when clicking outside
        if (searchSuggestions) {
            document.addEventListener('click', (e) => {
                if (!searchInput?.contains(e.target) && 
                    !searchSuggestions.contains(e.target) &&
                    !searchFilterBtn?.contains(e.target)) {
                    this.hideSearchSuggestionsForClone(clonedElement);
                }
            });
        }
    }

    // Search suggestions for cloned elements
    showEnhancedSearchSuggestionsForClone(query, clonedElement) {
        const suggestions = clonedElement.querySelector('#search-suggestions');
        if (!suggestions) return;
        
        const mockResults = this.getEnhancedSearchResults(query);
        const suggestionsList = clonedElement.querySelector('#suggestion-list');
        
        if (suggestionsList && mockResults.length > 0) {
            suggestionsList.innerHTML = mockResults.map(result => `
                <div class="suggestion-item-enhanced" data-action="${result.action}">
                    <div class="suggestion-icon">${result.icon}</div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${result.title}</div>
                        <div class="suggestion-subtitle">${result.category}</div>
                    </div>
                    <div class="suggestion-shortcut">${result.shortcut || ''}</div>
                </div>
            `).join('');
            
            // Add click handlers for suggestions
            suggestionsList.querySelectorAll('.suggestion-item-enhanced').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.getAttribute('data-action');
                    this.executeSearchAction(action);
                    this.hideSearchSuggestionsForClone(clonedElement);
                });
            });
        }
        
        suggestions.style.display = 'block';
    }

    showRecentSearchesForClone(clonedElement) {
        const suggestions = clonedElement.querySelector('#search-suggestions');
        const suggestionsList = clonedElement.querySelector('#suggestion-list');
        
        if (!suggestions || !suggestionsList) return;
        
        suggestionsList.innerHTML = `
            <div class="suggestion-item-enhanced recent-search">
                <div class="suggestion-icon">🕒</div>
                <div class="suggestion-content">
                    <div class="suggestion-title">Recent searches will appear here</div>
                    <div class="suggestion-subtitle">Start typing to search</div>
                </div>
            </div>
        `;
        
        suggestions.style.display = 'block';
    }

    hideSearchSuggestionsForClone(clonedElement) {
        const suggestions = clonedElement.querySelector('#search-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    // Open a new session/window
    openNewSession() {
        console.log('Opening new session...');
        console.log('NavigationManager available:', !!window.navigationManager);
        console.log('NavigationManager.openNewScreen available:', !!(window.navigationManager && window.navigationManager.openNewScreen));
        
        // Check if NavigationManager is available
        if (window.navigationManager && typeof window.navigationManager.openNewScreen === 'function') {
            console.log('Using NavigationManager.openNewScreen()');
            window.navigationManager.openNewScreen();
        } else {
            console.log('NavigationManager not available, using fallback');
            // Fallback implementation if NavigationManager is not available
            this.fallbackOpenNewSession();
        }
    }

    // Fallback method to open new session
    fallbackOpenNewSession() {
        try {
            // Try to use Electron's BrowserWindow directly
            if (typeof require !== 'undefined') {
                const { BrowserWindow } = require('electron');
                
                if (BrowserWindow) {
                    const newWindow = new BrowserWindow({
                        width: 1200,
                        height: 800,
                        title: 'ABWarehouse - New Session',
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false
                        }
                    });
                    
                    newWindow.loadFile('index.html');
                    console.log('New session window opened successfully');
                    return;
                }
            }
            
            // Fallback for web environment - open in new tab
            window.open(window.location.href, '_blank');
            console.log('New session opened in new tab');
            
        } catch (error) {
            console.error('Failed to open new session:', error);
            alert('Failed to open new session. Please try again.');
        }
    }

    // Close current session/window
    closeCurrentSession() {
        console.log('Closing current session...');
        console.log('NavigationManager available:', !!window.navigationManager);
        console.log('NavigationManager.closeCurrentSession available:', !!(window.navigationManager && window.navigationManager.closeCurrentSession));
        
        // Check if NavigationManager is available
        if (window.navigationManager && typeof window.navigationManager.closeCurrentSession === 'function') {
            console.log('Using NavigationManager.closeCurrentSession()');
            window.navigationManager.closeCurrentSession();
        } else {
            console.log('NavigationManager not available, using fallback');
            // Fallback implementation if NavigationManager is not available
            this.fallbackCloseCurrentSession();
        }
    }

    // Fallback method to close current session
    fallbackCloseCurrentSession() {
        try {
            // Try to use Electron's BrowserWindow directly
            if (typeof require !== 'undefined') {
                const { remote } = require('electron');
                if (remote) {
                    const currentWindow = remote.getCurrentWindow();
                    const allWindows = remote.BrowserWindow.getAllWindows();
                    
                    if (allWindows.length > 1) {
                        // Close only this window if multiple are open
                        currentWindow.close();
                    } else {
                        // Show confirmation if this is the last window
                        const response = confirm('This is the last session window. Do you want to close the application?');
                        if (response) {
                            currentWindow.close();
                        }
                    }
                    return;
                }
            }
            
            // Fallback for web environment
            const response = confirm('Do you want to close this session?');
            if (response) {
                window.close();
            }
            
        } catch (error) {
            console.error('Failed to close session:', error);
            // Last resort - try to close anyway
            const response = confirm('Do you want to close this session?');
            if (response) {
                try {
                    window.close();
                } catch (e) {
                    console.error('Could not close window:', e);
                    alert('Unable to close the session. Please close the window manually.');
                }
            }
        }
    }

    // Simple and reliable language switcher
    initializeSimpleLanguageSwitcher(element = document) {
        const languageBtn = element.querySelector('.nav-language-btn');
        const languageOptions = element.querySelector('.language-options');
        
        console.log('Simple language switcher init:', {
            button: !!languageBtn,
            options: !!languageOptions
        });
        
        // Initialize current language display
        this.initializeCurrentLanguageDisplay(element);
        
        if (languageBtn && languageOptions) {
            // Remove existing handlers
            const newLanguageBtn = languageBtn.cloneNode(true);
            languageBtn.parentNode.replaceChild(newLanguageBtn, languageBtn);
            
            // Toggle dropdown
            newLanguageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Language button clicked');
                
                // Close other dropdowns
                element.querySelectorAll('.nav-simple-dropdown.show').forEach(dropdown => {
                    if (dropdown !== languageOptions) {
                        dropdown.classList.remove('show');
                    }
                });
                
                // Toggle language dropdown
                languageOptions.classList.toggle('show');
                console.log('Language dropdown show class:', languageOptions.classList.contains('show'));
            });
            
            // Language selection
            const langItems = languageOptions.querySelectorAll('.nav-simple-item[data-lang]');
            console.log('Found language items:', langItems.length);
            
            langItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const lang = item.getAttribute('data-lang');
                    console.log('Language selected:', lang);
                    
                    // Change language
                    this.setSimpleLanguage(lang);
                    
                    // Update display for ALL navigation instances (main + clones)
                    this.updateLanguageDisplay(lang);
                    this.updateLanguageDisplayForClone(lang); // Update all clones
                    
                    // Close dropdown
                    languageOptions.classList.remove('show');
                });
            });
        }
    }

    // Simple and reliable user menu
    initializeSimpleUserMenu(element = document) {
        const userBtn = element.querySelector('.nav-user-btn');
        const userOptions = element.querySelector('.user-options');
        
        console.log('Simple user menu init:', {
            button: !!userBtn,
            options: !!userOptions
        });
        
        // Update user display with actual logged-in user
        this.updateUserDisplay(element);
        
        if (userBtn && userOptions) {
            // Remove existing handlers
            const newUserBtn = userBtn.cloneNode(true);
            userBtn.parentNode.replaceChild(newUserBtn, userBtn);
            
            // Toggle dropdown
            newUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('User button clicked');
                
                // Close other dropdowns
                element.querySelectorAll('.nav-simple-dropdown.show').forEach(dropdown => {
                    if (dropdown !== userOptions) {
                        dropdown.classList.remove('show');
                    }
                });
                
                // Toggle user dropdown
                userOptions.classList.toggle('show');
                console.log('User dropdown show class:', userOptions.classList.contains('show'));
            });
            
            // Profile option
            const profileOption = userOptions.querySelector('#profile-option');
            if (profileOption) {
                profileOption.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Profile clicked');
                    alert('Profile Settings functionality would open here');
                    userOptions.classList.remove('show');
                });
            }
            
            // Logout option
            const logoutOption = userOptions.querySelector('#logout-option');
            if (logoutOption) {
                logoutOption.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Logout clicked');
                    
                    const confirmMessage = window.i18n ? 
                        window.i18n.translate('navigation.confirmLogout') || 'Are you sure you want to sign out?' : 
                        'Are you sure you want to sign out?';
                    
                    if (confirm(confirmMessage)) {
                        this.performLogout();
                    }
                    userOptions.classList.remove('show');
                });
            }
        }
    }

    // Simple language switching
    setSimpleLanguage(lang) {
        console.log('Setting language to:', lang);
        if (window.i18n && typeof window.i18n.setLanguage === 'function') {
            window.i18n.setLanguage(lang);
            console.log('Language set via i18n system');
        } else {
            console.warn('i18n system not available, using fallback');
            // Update the display manually
            this.updateLanguageDisplay(lang);
        }
    }

    // Initialize current language display based on i18n system
    initializeCurrentLanguageDisplay(element = document) {
        let currentLang = 'en'; // Default fallback
        
        // Try to get current language from i18n system
        if (window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
            currentLang = window.i18n.getCurrentLanguage();
        } else if (window.i18n && window.i18n.currentLanguage) {
            currentLang = window.i18n.currentLanguage;
        }
        
        console.log('Initializing language display with current language:', currentLang);
        
        // Update the display for this element
        this.updateLanguageDisplayForElement(element, currentLang);
    }

    // Update language display for a specific element
    updateLanguageDisplayForElement(element, lang) {
        const langFlags = {
            'en': '🇺🇸',
            'fr': '🇫🇷'
        };
        
        const langNames = {
            'en': 'EN',
            'fr': 'FR'
        };
        
        const langIcon = element.querySelector('#language-flag');
        const langLabel = element.querySelector('#language-text');
        
        if (langIcon) {
            langIcon.textContent = langFlags[lang] || '🇺🇸';
        }
        if (langLabel) {
            langLabel.textContent = langNames[lang] || 'EN';
        }
    }

    // Close all dropdowns when clicking outside
    initializeGlobalDropdownHandler(element = document) {
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-language-container') && 
                !e.target.closest('.nav-user-container')) {
                element.querySelectorAll('.nav-simple-dropdown.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
    }

    // Update user display with actual logged-in user details
    updateUserDisplay(element = document) {
        const currentUser = this.getCurrentUser();
        const usernameDisplay = element.querySelector('#username-display');
        const userIcon = element.querySelector('.nav-user-btn .nav-icon-unified');
        
        console.log('Updating user display with:', currentUser);
        
        if (currentUser && usernameDisplay) {
            // Display first name or full name if short enough
            const displayName = currentUser.name ? 
                (currentUser.name.length <= 10 ? 
                    currentUser.name : 
                    currentUser.name.split(' ')[0]) : 
                'User';
            
            usernameDisplay.textContent = displayName;
            
            // Update user icon with initials if available
            if (userIcon && currentUser.name) {
                const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                userIcon.textContent = initials;
                userIcon.style.fontSize = '14px';
                userIcon.style.fontWeight = '600';
            }
        } else if (usernameDisplay) {
            usernameDisplay.textContent = 'User';
            if (userIcon) {
                userIcon.textContent = '👤';
            }
        }
    }

    // Get current user from auth system
    getCurrentUser() {
        if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
            return window.authManager.getCurrentUser();
        }
        console.warn('Auth manager not available');
        return null;
    }

    // Perform logout using the auth system
    performLogout() {
        try {
            if (window.authManager && typeof window.authManager.logout === 'function') {
                console.log('Logging out user...');
                window.authManager.logout();
            } else {
                console.error('Auth manager logout function not available');
                // Fallback to basic page navigation
                this.fallbackLogout();
            }
        } catch (error) {
            console.error('Error during logout:', error);
            this.fallbackLogout();
        }
    }

    // Fallback logout if auth manager is not available
    fallbackLogout() {
        console.log('Using fallback logout');
        
        // Clear any stored auth data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authRemember');
        sessionStorage.removeItem('authUser');
        
        // Navigate to login page
        const loginPage = document.getElementById('login-page');
        const dashboardPage = document.getElementById('dashboard-page');
        
        if (loginPage && dashboardPage) {
            dashboardPage.style.display = 'none';
            loginPage.classList.add('active');
            loginPage.style.display = 'block';
            console.log('Navigated to login page');
        } else {
            // If direct navigation fails, reload the page
            window.location.reload();
        }
    }

    // Refresh user display in all navigation instances
    refreshAllUserDisplays() {
        console.log('Refreshing user displays in all navigation instances');
        
        // Update main navigation
        this.updateUserDisplay(document);
        
        // Update cloned navigations
        const clonedNavs = document.querySelectorAll('.nav-clone');
        clonedNavs.forEach(nav => {
            this.updateUserDisplay(nav);
        });
    }
}

// Create global instance
window.commonNavigation = new CommonNavigation();

// Global function to refresh user displays when user logs in
window.refreshNavigationUserDisplays = function() {
    if (window.commonNavigation && typeof window.commonNavigation.refreshAllUserDisplays === 'function') {
        window.commonNavigation.refreshAllUserDisplays();
        console.log('✅ Navigation user displays refreshed');
    } else {
        console.warn('Common navigation not available for user display refresh');
    }
};

// Global function to test and refresh language displays
window.testLanguageDisplay = function() {
    if (window.commonNavigation) {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        console.log('Testing language display with current language:', currentLang);
        window.commonNavigation.updateLanguageDisplay(currentLang);
        window.commonNavigation.updateLanguageDisplayForClone(currentLang);
        console.log('✅ Language displays refreshed');
    } else {
        console.warn('Common navigation not available for language display test');
    }
};

// Global function to manually set language and test display
window.setLanguageAndTest = function(lang) {
    if (window.i18n && window.commonNavigation) {
        console.log('Setting language to:', lang);
        window.i18n.setLanguage(lang);
        setTimeout(() => {
            window.commonNavigation.updateLanguageDisplay(lang);
            window.commonNavigation.updateLanguageDisplayForClone(lang);
            console.log('✅ Language set and displays updated');
        }, 100);
    } else {
        console.warn('i18n or common navigation not available');
    }
};

// Global function to test user display functionality
window.testUserDisplay = function() {
    console.log('=== User Display Test ===');
    
    const currentUser = window.authManager ? window.authManager.getCurrentUser() : null;
    console.log('Current user from auth:', currentUser);
    
    if (currentUser) {
        console.log('User details:', {
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
        });
    } else {
        console.log('No user logged in or auth manager not available');
    }
    
    window.refreshNavigationUserDisplays();
};