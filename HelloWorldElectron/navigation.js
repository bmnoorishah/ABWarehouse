// Navigation and Feature Management
class NavigationManager {
    constructor() {
        this.navigationHistory = [];
        this.currentScreen = 'dashboard';
        this.searchData = [];
        this.searchHistory = this.loadSearchHistory();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSearchData();
        this.addToHistory('dashboard', 'Dashboard');
    }

    setupEventListeners() {
        // Navigation button events
        document.getElementById('new-screen-btn')?.addEventListener('click', () => this.openNewScreen());
        document.getElementById('back-btn')?.addEventListener('click', () => this.goBack());
        document.getElementById('close-btn')?.addEventListener('click', () => this.closeCurrentSession());
        document.getElementById('system-config-btn')?.addEventListener('click', () => this.openSystemConfigModal());
        
        // Tree action events
        document.getElementById('insert-transaction-btn')?.addEventListener('click', () => this.insertTransaction());
        document.getElementById('add-folder-btn')?.addEventListener('click', () => this.addFolder());

        // Modal close events
        this.setupModalCloseEvents();

        // Enhanced search functionality
        this.setupSearchEvents();

        // System configuration functionality
        this.setupSystemConfigEvents();
        
        // Initialize tree structure
        this.initializeTree();
    }

    setupModalCloseEvents() {
        const modals = ['search', 'system-config'];
        modals.forEach(modalType => {
            const modal = document.getElementById(`${modalType}-modal`);
            const closeBtn = document.getElementById(`${modalType}-close`);
            
            closeBtn?.addEventListener('click', () => this.closeModal(modalType));
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modalType);
            });
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    setupSearchEvents() {
        const searchInput = document.getElementById('nav-search-input');
        const searchClearBtn = document.getElementById('search-clear-btn');
        const searchSuggestions = document.getElementById('search-suggestions');
        const suggestionList = document.getElementById('suggestion-list');
        const clearHistoryBtn = document.getElementById('clear-search-history');

        if (!searchInput) return;

        // Show suggestions on focus
        searchInput.addEventListener('focus', () => {
            this.showSearchSuggestions();
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                this.hideSearchSuggestions();
            }
        });

        // Handle input changes
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.performLiveSearch(query);
            } else {
                this.showRecentSearches();
            }
        });

        // Handle Enter key - execute search and add to history
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    this.executeSearch(query);
                    this.addToSearchHistory(query);
                    this.hideSearchSuggestions();
                }
            }
        });

        // Clear search input
        searchClearBtn?.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            this.showRecentSearches();
        });

        // Clear search history
        clearHistoryBtn?.addEventListener('click', () => {
            this.clearSearchHistory();
        });

        // Handle suggestion clicks
        suggestionList?.addEventListener('click', (e) => {
            const suggestionItem = e.target.closest('.suggestion-item');
            const removeBtn = e.target.closest('.suggestion-remove');

            if (removeBtn) {
                // Remove individual history item
                const query = suggestionItem.querySelector('.suggestion-text').textContent;
                this.removeFromSearchHistory(query);
                e.stopPropagation();
            } else if (suggestionItem) {
                // Execute search from suggestion
                const query = suggestionItem.querySelector('.suggestion-text').textContent;
                searchInput.value = query;
                this.executeSearch(query);
                this.addToSearchHistory(query);
                this.hideSearchSuggestions();
            }
        });
    }

    // Generic search setup for different pages/elements
    setupSearchEventsForElement(searchInput, searchClearBtn, searchSuggestions, suggestionListId, clearHistoryBtnId) {
        if (!searchInput) return;

        const suggestionList = document.getElementById(suggestionListId);
        const clearHistoryBtn = document.getElementById(clearHistoryBtnId);

        // Show suggestions on focus
        searchInput.addEventListener('focus', () => {
            if (searchSuggestions) {
                searchSuggestions.style.display = 'block';
                this.showRecentSearchesInElement(suggestionList);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && searchSuggestions && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });

        // Handle input changes
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.performLiveSearchInElement(query, suggestionList);
            } else {
                this.showRecentSearchesInElement(suggestionList);
            }
        });

        // Handle Enter key - execute search and add to history
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    this.executeSearch(query);
                    this.addToSearchHistory(query);
                    if (searchSuggestions) {
                        searchSuggestions.style.display = 'none';
                    }
                }
            }
        });

        // Clear search input
        searchClearBtn?.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            this.showRecentSearchesInElement(suggestionList);
        });

        // Clear search history
        clearHistoryBtn?.addEventListener('click', () => {
            this.clearSearchHistory();
        });

        // Handle suggestion clicks
        suggestionList?.addEventListener('click', (e) => {
            const suggestionItem = e.target.closest('.suggestion-item');
            const removeBtn = e.target.closest('.suggestion-remove');

            if (removeBtn) {
                // Remove individual history item
                const query = suggestionItem.querySelector('.suggestion-text').textContent;
                this.removeFromSearchHistory(query);
                e.stopPropagation();
            } else if (suggestionItem) {
                // Execute search from suggestion
                const query = suggestionItem.querySelector('.suggestion-text').textContent;
                searchInput.value = query;
                this.executeSearch(query);
                this.addToSearchHistory(query);
                if (searchSuggestions) {
                    searchSuggestions.style.display = 'none';
                }
            }
        });
    }

    setupSystemConfigEvents() {
        const configBtns = document.querySelectorAll('.config-btn');
        configBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const configType = e.currentTarget.getAttribute('data-config');
                this.openConfiguration(configType);
            });
        });
    }

    // Navigation History Management
    addToHistory(screenId, screenTitle) {
        // Remove any future history if we're not at the end
        const currentIndex = this.navigationHistory.findIndex(item => item.current);
        if (currentIndex >= 0 && currentIndex < this.navigationHistory.length - 1) {
            this.navigationHistory = this.navigationHistory.slice(0, currentIndex + 1);
        }

        // Mark all items as not current
        this.navigationHistory.forEach(item => item.current = false);

        // Add new item
        this.navigationHistory.push({
            id: screenId,
            title: screenTitle,
            timestamp: Date.now(),
            current: true
        });

        this.updateBackButton();
    }

    goBack() {
        const currentIndex = this.navigationHistory.findIndex(item => item.current);
        if (currentIndex > 0) {
            this.navigationHistory[currentIndex].current = false;
            this.navigationHistory[currentIndex - 1].current = true;
            
            const previousScreen = this.navigationHistory[currentIndex - 1];
            this.navigateToScreen(previousScreen.id);
            this.updateBackButton();
            
            this.showNotification(`Navigated back to ${previousScreen.title}`, 'info');
        }
    }

    updateBackButton() {
        const backBtn = document.getElementById('back-btn');
        const currentIndex = this.navigationHistory.findIndex(item => item.current);
        
        if (backBtn) {
            if (currentIndex <= 0) {
                backBtn.classList.add('disabled');
                backBtn.disabled = true;
            } else {
                backBtn.classList.remove('disabled');
                backBtn.disabled = false;
                
                const previousScreen = this.navigationHistory[currentIndex - 1];
                backBtn.title = `Back to ${previousScreen.title}`;
            }
        }
    }

    navigateToScreen(screenId) {
        // This would implement actual screen navigation
        // For now, we'll just update the current screen reference
        this.currentScreen = screenId;
        console.log(`Navigating to screen: ${screenId}`);
    }

    // Search Functionality
    initializeSearchData() {
        this.searchData = [
            { title: 'Inbox', category: 'inbound', description: 'View incoming messages and notifications', id: 'inbox' },
            { title: 'Inbound Delivery', category: 'inbound', description: 'Manage incoming shipments and deliveries', id: 'inbound' },
            { title: 'Outbound Delivery', category: 'outbound', description: 'Handle outgoing shipments and orders', id: 'outbound' },
            { title: 'Stock Replenishment', category: 'inventory', description: 'Monitor and manage inventory replenishment', id: 'replenishment' },
            { title: 'Physical Inventory', category: 'inventory', description: 'Conduct physical inventory counts', id: 'physical_inventory' },
            { title: 'Internal Stock Movements', category: 'inventory', description: 'Manage internal warehouse movements', id: 'internal_movements' },
            { title: 'Return Process', category: 'outbound', description: 'Handle product returns and return processing', id: 'return_process' },
            { title: 'Master Data', category: 'configuration', description: 'Manage master data settings', id: 'master_data' },
            { title: 'System Configuration', category: 'configuration', description: 'Configure system parameters', id: 'configuration' },
            { title: 'Warehouse Monitor', category: 'configuration', description: 'Monitor warehouse performance and metrics', id: 'warehouse_monitor' }
        ];
    }

    performSearch(query, category) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (!query.trim()) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <span class="search-placeholder-icon">🔍</span>
                    <p data-i18n="search.startTyping">Start typing to search for transactions...</p>
                </div>
            `;
            return;
        }

        const filteredResults = this.searchData.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase()) ||
                               item.description.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = category === 'all' || item.category === category;
            return matchesQuery && matchesCategory;
        });

        if (filteredResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <span class="search-placeholder-icon">❌</span>
                    <p>No results found for "${query}"</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = filteredResults.map(item => `
            <div class="search-result-item" data-item-id="${item.id}">
                <div class="search-result-title">${item.title}</div>
                <div class="search-result-category">${item.category}</div>
                <div class="search-result-description">${item.description}</div>
            </div>
        `).join('');

        // Add click handlers to results
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-item-id');
                this.selectSearchResult(itemId);
            });
        });
    }

    // Search History Management
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('transactionSearchHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('transactionSearchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    addToSearchHistory(query) {
        if (!query || query.length < 2) return;
        
        // Remove existing entry if it exists
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        
        // Add to beginning of array
        this.searchHistory.unshift(query);
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        this.saveSearchHistory();
    }

    removeFromSearchHistory(query) {
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        this.saveSearchHistory();
        this.showRecentSearches();
    }

    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
        this.hideSearchSuggestions();
    }

    // Search Suggestions Display
    showSearchSuggestions() {
        const searchSuggestions = document.getElementById('search-suggestions');
        if (searchSuggestions) {
            searchSuggestions.style.display = 'block';
            this.showRecentSearches();
        }
    }

    hideSearchSuggestions() {
        const searchSuggestions = document.getElementById('search-suggestions');
        if (searchSuggestions) {
            searchSuggestions.style.display = 'none';
        }
    }

    showRecentSearches() {
        const suggestionList = document.getElementById('suggestion-list');
        if (!suggestionList) return;

        suggestionList.innerHTML = '';

        if (this.searchHistory.length === 0) {
            suggestionList.innerHTML = '<div class="suggestion-item empty">No recent searches</div>';
            return;
        }

        this.searchHistory.forEach(query => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <span class="suggestion-icon">🕒</span>
                <span class="suggestion-text">${this.escapeHtml(query)}</span>
                <button class="suggestion-remove" title="Remove from history">×</button>
            `;
            suggestionList.appendChild(item);
        });
    }

    performLiveSearch(query) {
        // Filter recent searches that match the query
        const filteredHistory = this.searchHistory.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );

        const suggestionList = document.getElementById('suggestion-list');
        if (!suggestionList) return;

        suggestionList.innerHTML = '';

        if (filteredHistory.length === 0) {
            suggestionList.innerHTML = `<div class="suggestion-item empty">No matches for "${this.escapeHtml(query)}"</div>`;
            return;
        }

        filteredHistory.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            
            // Highlight matching text
            const highlightedText = this.highlightText(item, query);
            
            suggestionItem.innerHTML = `
                <span class="suggestion-icon">🔍</span>
                <span class="suggestion-text">${highlightedText}</span>
                <button class="suggestion-remove" title="Remove from history">×</button>
            `;
            suggestionList.appendChild(suggestionItem);
        });
    }

    executeSearch(query) {
        this.performSearch(query, 'all');
    }

    highlightText(text, query) {
        if (!query) return this.escapeHtml(text);
        
        const escapedText = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(query);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        return escapedText.replace(regex, '<strong>$1</strong>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Helper methods for element-specific search functionality
    showRecentSearchesInElement(suggestionList) {
        if (!suggestionList) return;

        suggestionList.innerHTML = '';

        if (this.searchHistory.length === 0) {
            suggestionList.innerHTML = '<div class="suggestion-item empty">No recent searches</div>';
            return;
        }

        this.searchHistory.forEach(query => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <span class="suggestion-icon">🕒</span>
                <span class="suggestion-text">${this.escapeHtml(query)}</span>
                <button class="suggestion-remove" title="Remove from history">×</button>
            `;
            suggestionList.appendChild(item);
        });
    }

    performLiveSearchInElement(query, suggestionList) {
        // Filter recent searches that match the query
        const filteredHistory = this.searchHistory.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        );

        if (!suggestionList) return;

        suggestionList.innerHTML = '';

        if (filteredHistory.length === 0) {
            suggestionList.innerHTML = `<div class="suggestion-item empty">No matches for "${this.escapeHtml(query)}"</div>`;
            return;
        }

        filteredHistory.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            
            // Highlight matching text
            const highlightedText = this.highlightText(item, query);
            
            suggestionItem.innerHTML = `
                <span class="suggestion-icon">🔍</span>
                <span class="suggestion-text">${highlightedText}</span>
                <button class="suggestion-remove" title="Remove from history">×</button>
            `;
            suggestionList.appendChild(suggestionItem);
        });
    }

    // Setup search events for custom elements (used by other pages)
    setupSearchEventsForElement(searchInput, searchClearBtn, searchSuggestions, suggestionListId, clearHistoryId) {
        if (!searchInput) return;

        const suggestionList = document.getElementById(suggestionListId);
        const clearHistoryBtn = document.getElementById(clearHistoryId);

        // Show suggestions on focus
        searchInput.addEventListener('focus', () => {
            if (searchSuggestions) {
                searchSuggestions.style.display = 'block';
                this.showRecentSearchesInElement(suggestionList);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && searchSuggestions && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });

        // Handle input changes
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.performLiveSearchInElement(query, suggestionList);
            } else {
                this.showRecentSearchesInElement(suggestionList);
            }
        });

        // Handle Enter key - execute search and add to history
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    this.executeSearch(query);
                    this.addToSearchHistory(query);
                    if (searchSuggestions) {
                        searchSuggestions.style.display = 'none';
                    }
                }
            }
        });

        // Clear search input
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
                this.showRecentSearchesInElement(suggestionList);
            });
        }

        // Clear search history
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearSearchHistory();
                if (searchSuggestions) {
                    searchSuggestions.style.display = 'none';
                }
            });
        }

        // Handle suggestion clicks
        if (suggestionList) {
            suggestionList.addEventListener('click', (e) => {
                const suggestionItem = e.target.closest('.suggestion-item');
                const removeBtn = e.target.closest('.suggestion-remove');

                if (removeBtn) {
                    // Remove individual history item
                    const query = suggestionItem.querySelector('.suggestion-text').textContent;
                    this.removeFromSearchHistory(query);
                    e.stopPropagation();
                } else if (suggestionItem) {
                    // Execute search from suggestion
                    const query = suggestionItem.querySelector('.suggestion-text').textContent;
                    searchInput.value = query;
                    this.executeSearch(query);
                    this.addToSearchHistory(query);
                    if (searchSuggestions) {
                        searchSuggestions.style.display = 'none';
                    }
                }
            });
        }
    }

    selectSearchResult(itemId) {
        const item = this.searchData.find(data => data.id === itemId);
        if (item) {
            this.closeModal('search');
            this.addToHistory(itemId, item.title);
            this.navigateToScreen(itemId);
            this.showNotification(`Opening ${item.title}`, 'success');
        }
    }

    // Modal Management
    openSearchModal() {
        this.openModal('search');
        // Focus on search input when modal opens
        setTimeout(() => {
            document.getElementById('search-input')?.focus();
        }, 100);
    }

    openSystemConfigModal() {
        this.openModal('system-config');
    }

    // SAP-Style Tree Management
    initializeTree() {
        this.treeData = this.getDefaultTreeStructure();
        this.renderTree();
    }

    // Test scroll functionality
    testTreeScroll() {
        const treeContainer = document.getElementById('favorites-tree');
        if (!treeContainer) {
            console.error('Tree container not found for scroll test');
            return;
        }
        
        console.log('=== Tree Scroll Test ===');
        console.log('Container scrollHeight:', treeContainer.scrollHeight);
        console.log('Container clientHeight:', treeContainer.clientHeight);
        console.log('Container offsetHeight:', treeContainer.offsetHeight);
        console.log('Current scrollTop:', treeContainer.scrollTop);
        console.log('Max scroll:', treeContainer.scrollHeight - treeContainer.clientHeight);
        
        if (treeContainer.scrollHeight > treeContainer.clientHeight) {
            console.log('✅ Scroll is available');
            
            // Test scroll to bottom
            treeContainer.scrollTop = treeContainer.scrollHeight;
            console.log('Scrolled to bottom, new scrollTop:', treeContainer.scrollTop);
            
            // Test scroll to middle
            setTimeout(() => {
                treeContainer.scrollTop = treeContainer.scrollHeight / 2;
                console.log('Scrolled to middle, new scrollTop:', treeContainer.scrollTop);
                
                // Test scroll to top
                setTimeout(() => {
                    treeContainer.scrollTop = 0;
                    console.log('Scrolled to top, new scrollTop:', treeContainer.scrollTop);
                }, 500);
            }, 500);
        } else {
            console.log('❌ No scroll needed - content fits');
        }
    }

    getDefaultTreeStructure() {
        return [
            {
                id: 'favorites',
                label: 'Favorites',
                icon: '⭐',
                type: 'folder',
                expanded: true,
                children: [
                    {
                        id: 'fav_inbound',
                        label: 'Inbound Delivery',
                        icon: '⬇️',
                        type: 'transaction',
                        action: 'inbound'
                    },
                    {
                        id: 'fav_warehouse_monitor',
                        label: 'Warehouse Monitor',
                        icon: '📊',
                        type: 'transaction',
                        action: 'warehouse_monitor'
                    },
                    {
                        id: 'fav_outbound',
                        label: 'Outbound Delivery',
                        icon: '📤',
                        type: 'transaction',
                        action: 'outbound'
                    },
                    {
                        id: 'fav_inventory',
                        label: 'Physical Inventory',
                        icon: '📊',
                        type: 'transaction',
                        action: 'physical_inventory'
                    },
                    {
                        id: 'fav_picking',
                        label: 'Picking',
                        icon: '🎯',
                        type: 'transaction',
                        action: 'picking'
                    }
                ]
            },
            {
                id: 'warehouse_mgmt',
                label: 'Warehouse Management',
                icon: '🏭',
                type: 'folder',
                expanded: true,
                children: [
                    {
                        id: 'inbound_folder',
                        label: 'Inbound Operations',
                        icon: '📁',
                        type: 'folder',
                        expanded: false,
                        children: [
                            {
                                id: 'inbound_delivery',
                                label: 'Inbound Delivery',
                                icon: '📋',
                                type: 'transaction',
                                action: 'inbound'
                            },
                            {
                                id: 'goods_receipt',
                                label: 'Goods Receipt',
                                icon: '✅',
                                type: 'transaction',
                                action: 'goods_receipt'
                            },
                            {
                                id: 'asn_processing',
                                label: 'ASN Processing',
                                icon: '📧',
                                type: 'transaction',
                                action: 'asn_processing'
                            },
                            {
                                id: 'quality_inspection',
                                label: 'Quality Inspection',
                                icon: '🔍',
                                type: 'transaction',
                                action: 'quality_inspection'
                            }
                        ]
                    },
                    {
                        id: 'outbound_folder',
                        label: 'Outbound Operations',
                        icon: '📁',
                        type: 'folder',
                        expanded: false,
                        children: [
                            {
                                id: 'outbound_delivery',
                                label: 'Outbound Delivery',
                                icon: '📤',
                                type: 'transaction',
                                action: 'outbound'
                            },
                            {
                                id: 'picking',
                                label: 'Picking',
                                icon: '🎯',
                                type: 'transaction',
                                action: 'picking'
                            },
                            {
                                id: 'packing',
                                label: 'Packing',
                                icon: '📦',
                                type: 'transaction',
                                action: 'packing'
                            },
                            {
                                id: 'shipping',
                                label: 'Shipping',
                                icon: '🚛',
                                type: 'transaction',
                                action: 'shipping'
                            },
                            {
                                id: 'wave_planning',
                                label: 'Wave Planning',
                                icon: '🌊',
                                type: 'transaction',
                                action: 'wave_planning'
                            }
                        ]
                    },
                    {
                        id: 'inventory_folder',
                        label: 'Inventory Management',
                        icon: '📁',
                        type: 'folder',
                        expanded: false,
                        children: [
                            {
                                id: 'physical_inventory',
                                label: 'Physical Inventory',
                                icon: '📊',
                                type: 'transaction',
                                action: 'physical_inventory'
                            },
                            {
                                id: 'stock_movements',
                                label: 'Stock Movements',
                                icon: '🔄',
                                type: 'transaction',
                                action: 'internal_movements'
                            },
                            {
                                id: 'cycle_counting',
                                label: 'Cycle Counting',
                                icon: '🔢',
                                type: 'transaction',
                                action: 'cycle_counting'
                            },
                            {
                                id: 'stock_transfer',
                                label: 'Stock Transfer',
                                icon: '↔️',
                                type: 'transaction',
                                action: 'stock_transfer'
                            },
                            {
                                id: 'abc_analysis',
                                label: 'ABC Analysis',
                                icon: '📈',
                                type: 'transaction',
                                action: 'abc_analysis'
                            }
                        ]
                    },
                    {
                        id: 'replenishment_folder',
                        label: 'Replenishment',
                        icon: '📁',
                        type: 'folder',
                        expanded: false,
                        children: [
                            {
                                id: 'auto_replenishment',
                                label: 'Auto Replenishment',
                                icon: '🔄',
                                type: 'transaction',
                                action: 'replenishment'
                            },
                            {
                                id: 'manual_replenishment',
                                label: 'Manual Replenishment',
                                icon: '👋',
                                type: 'transaction',
                                action: 'manual_replenishment'
                            },
                            {
                                id: 'slotting_optimization',
                                label: 'Slotting Optimization',
                                icon: '🎯',
                                type: 'transaction',
                                action: 'slotting'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'master_data',
                label: 'Master Data',
                icon: '🗃️',
                type: 'folder',
                expanded: false,
                children: [
                    {
                        id: 'material_master',
                        label: 'Material Master',
                        icon: '📄',
                        type: 'transaction',
                        action: 'material_master'
                    },
                    {
                        id: 'storage_locations',
                        label: 'Storage Locations',
                        icon: '📍',
                        type: 'transaction',
                        action: 'storage_locations'
                    },
                    {
                        id: 'vendor_master',
                        label: 'Vendor Master',
                        icon: '🏢',
                        type: 'transaction',
                        action: 'vendor_master'
                    },
                    {
                        id: 'customer_master',
                        label: 'Customer Master',
                        icon: '👥',
                        type: 'transaction',
                        action: 'customer_master'
                    },
                    {
                        id: 'warehouse_structure',
                        label: 'Warehouse Structure',
                        icon: '🏗️',
                        type: 'transaction',
                        action: 'warehouse_structure'
                    }
                ]
            },
            {
                id: 'reports_folder',
                label: 'Reports & Analytics',
                icon: '📊',
                type: 'folder',
                expanded: false,
                children: [
                    {
                        id: 'inventory_reports',
                        label: 'Inventory Reports',
                        icon: '📋',
                        type: 'transaction',
                        action: 'inventory_reports'
                    },
                    {
                        id: 'performance_kpis',
                        label: 'Performance KPIs',
                        icon: '📈',
                        type: 'transaction',
                        action: 'performance_kpis'
                    },
                    {
                        id: 'cost_analysis',
                        label: 'Cost Analysis',
                        icon: '💰',
                        type: 'transaction',
                        action: 'cost_analysis'
                    },
                    {
                        id: 'exception_reports',
                        label: 'Exception Reports',
                        icon: '⚠️',
                        type: 'transaction',
                        action: 'exception_reports'
                    }
                ]
            },
            {
                id: 'system_admin',
                label: 'System Administration',
                icon: '⚙️',
                type: 'folder',
                expanded: false,
                children: [
                    {
                        id: 'user_management',
                        label: 'User Management',
                        icon: '👤',
                        type: 'transaction',
                        action: 'user_management'
                    },
                    {
                        id: 'system_config',
                        label: 'System Configuration',
                        icon: '🔧',
                        type: 'transaction',
                        action: 'system_config'
                    },
                    {
                        id: 'backup_restore',
                        label: 'Backup & Restore',
                        icon: '💾',
                        type: 'transaction',
                        action: 'backup_restore'
                    },
                    {
                        id: 'system_monitoring',
                        label: 'System Monitoring',
                        icon: '📡',
                        type: 'transaction',
                        action: 'system_monitoring'
                    }
                ]
            }
        ];
    }

    renderTree() {
        const treeContainer = document.getElementById('favorites-tree');
        if (!treeContainer) {
            console.warn('Tree container not found');
            return;
        }

        const html = this.buildTreeHTML(this.treeData, 0);
        treeContainer.innerHTML = html;
        
        // Debug scroll functionality
        console.log('Tree rendered with scroll height:', treeContainer.scrollHeight);
        console.log('Tree container height:', treeContainer.clientHeight);
        console.log('Scroll needed:', treeContainer.scrollHeight > treeContainer.clientHeight);
        
        this.attachTreeEventListeners();
        
        // Force refresh to ensure scroll is calculated properly
        setTimeout(() => {
            console.log('After timeout - scroll height:', treeContainer.scrollHeight);
            console.log('After timeout - client height:', treeContainer.clientHeight);
            
            // Add scrollable class if scrolling is needed
            if (treeContainer.scrollHeight > treeContainer.clientHeight) {
                treeContainer.classList.add('scrollable');
                console.log('✅ Scroll is available for favorites tree');
            } else {
                treeContainer.classList.remove('scrollable');
                console.log('⚠️ No scroll needed - content fits in container');
            }
        }, 100);
    }

    buildTreeHTML(nodes, level) {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const expandIcon = hasChildren ? (node.expanded ? '▼' : '▶') : '';
            const childrenHTML = hasChildren && node.expanded ? this.buildTreeHTML(node.children, level + 1) : '';
            
            return `
                <div class="tree-node" data-node-id="${node.id}">
                    <div class="tree-item tree-level-${level}" data-level="${level}" data-type="${node.type}" data-action="${node.action || ''}">
                        ${hasChildren ? `<div class="tree-expand" data-node-id="${node.id}">${expandIcon}</div>` : '<div class="tree-expand tree-expand-empty"></div>'}
                        <div class="tree-icon ${node.type === 'folder' ? 'folder-icon' : node.type === 'transaction' ? 'transaction-icon' : 'document-icon'}">${node.icon}</div>
                        <div class="tree-label">${node.label}</div>
                    </div>
                    ${hasChildren ? `<div class="tree-children ${!node.expanded ? 'collapsed' : ''}" data-parent="${node.id}">${childrenHTML}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    attachTreeEventListeners() {
        const treeContainer = document.getElementById('favorites-tree');
        if (!treeContainer) return;

        // Expand/collapse handlers
        treeContainer.querySelectorAll('.tree-expand').forEach(expandBtn => {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nodeId = expandBtn.dataset.nodeId;
                if (nodeId) {
                    this.toggleNode(nodeId);
                }
            });
        });

        // Node click handlers
        treeContainer.querySelectorAll('.tree-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove previous selection
                treeContainer.querySelectorAll('.tree-item').forEach(i => i.classList.remove('selected'));
                // Add selection to clicked item
                item.classList.add('selected');
                
                // Ensure selected item is visible (scroll into view if needed)
                item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
                
                const action = item.dataset.action;
                if (action && action !== 'undefined') {
                    this.executeTreeAction(action);
                }
            });
        });
        
        // Add keyboard navigation for better accessibility
        treeContainer.addEventListener('keydown', (e) => {
            const selected = treeContainer.querySelector('.tree-item.selected');
            if (!selected) return;
            
            let nextItem = null;
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    nextItem = this.getNextTreeItem(selected);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    nextItem = this.getPreviousTreeItem(selected);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    const expandBtn = selected.querySelector('.tree-expand[data-node-id]');
                    if (expandBtn) {
                        expandBtn.click();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    const collapseBtn = selected.querySelector('.tree-expand[data-node-id]');
                    if (collapseBtn) {
                        collapseBtn.click();
                    }
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    selected.click();
                    break;
            }
            
            if (nextItem) {
                treeContainer.querySelectorAll('.tree-item').forEach(i => i.classList.remove('selected'));
                nextItem.classList.add('selected');
                nextItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        });
        
        // Make tree focusable for keyboard navigation
        if (!treeContainer.hasAttribute('tabindex')) {
            treeContainer.setAttribute('tabindex', '0');
        }
    }

    getNextTreeItem(currentItem) {
        const allItems = Array.from(document.querySelectorAll('.tree-item'));
        const currentIndex = allItems.indexOf(currentItem);
        return allItems[currentIndex + 1] || null;
    }

    getPreviousTreeItem(currentItem) {
        const allItems = Array.from(document.querySelectorAll('.tree-item'));
        const currentIndex = allItems.indexOf(currentItem);
        return allItems[currentIndex - 1] || null;
    }

    toggleNode(nodeId) {
        const node = this.findNode(this.treeData, nodeId);
        if (node) {
            node.expanded = !node.expanded;
            this.renderTree();
        }
    }

    findNode(nodes, targetId) {
        for (const node of nodes) {
            if (node.id === targetId) {
                return node;
            }
            if (node.children) {
                const found = this.findNode(node.children, targetId);
                if (found) return found;
            }
        }
        return null;
    }

    executeTreeAction(action) {
        switch(action) {
            case 'inbound':
            case 'outbound':
            case 'warehouse_monitor':
            case 'physical_inventory':
            case 'internal_movements':
                this.showNotification(`Opening ${action} module...`, 'info');
                break;
            default:
                this.showNotification(`Executing ${action}...`, 'info');
        }
    }

    insertTransaction() {
        this.showCustomPrompt('Enter transaction name:', (name) => {
            if (name && name.trim()) {
                // Add to selected folder or root
                this.showNotification(`Transaction "${name}" inserted successfully`, 'success');
                // In a real app, this would update the tree structure
            }
        });
    }

    addFolder() {
        this.showCustomPrompt('Enter folder name:', (name) => {
            if (name && name.trim()) {
                // Add new folder
                this.showNotification(`Folder "${name}" created successfully`, 'success');
                // In a real app, this would update the tree structure
            }
        });
    }

    showCustomPrompt(message, callback) {
        // Create a custom modal dialog instead of using prompt()
        this.showInputModal(message, callback);
    }

    showInputModal(message, callback) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-prompt-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'custom-prompt-modal';
        modal.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            min-width: 300px;
            max-width: 500px;
        `;

        modal.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333;">${message}</h3>
            <input type="text" id="prompt-input" style="
                width: 100%;
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                margin-bottom: 20px;
                box-sizing: border-box;
            " maxlength="50">
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="prompt-cancel" style="
                    padding: 8px 16px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">Cancel</button>
                <button id="prompt-ok" style="
                    padding: 8px 16px;
                    border: none;
                    background: #667eea;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">OK</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const input = modal.querySelector('#prompt-input');
        const okBtn = modal.querySelector('#prompt-ok');
        const cancelBtn = modal.querySelector('#prompt-cancel');

        // Focus the input
        input.focus();

        // Handle OK button
        const handleOk = () => {
            const value = input.value.trim();
            document.body.removeChild(overlay);
            callback(value);
        };

        // Handle Cancel button
        const handleCancel = () => {
            document.body.removeChild(overlay);
            callback(null);
        };

        // Event listeners
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Enter key submits
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleOk();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        });

        // Click outside to cancel
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                handleCancel();
            }
        });
    }

    handleQuickLinkClick(action) {
        // Handle quick link clicks based on action
        switch(action) {
            case 'inbound':
            case 'outbound':
            case 'warehouse_monitor':
                // Navigate to specific module
                this.showNotification(`Opening ${action} module...`);
                break;
            case 'system-config':
                this.openSystemConfigModal();
                break;
            default:
                console.log(`Quick link action: ${action}`);
        }
    }

    openModal(modalType) {
        const modal = document.getElementById(`${modalType}-modal`);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalType) {
        const modal = document.getElementById(`${modalType}-modal`);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    closeAllModals() {
        const modals = ['search', 'reports', 'system-config'];
        modals.forEach(modalType => this.closeModal(modalType));
    }

    // System Configuration Management
    openConfiguration(configType) {
        this.closeModal('system-config');
        this.addToHistory(configType, this.getConfigTitle(configType));
        this.navigateToScreen(configType);
        this.showNotification(`Opening ${this.getConfigTitle(configType)} Configuration...`, 'info');
    }

    getConfigTitle(configType) {
        const titles = {
            'company-codes': 'Company Codes',
            'plants': 'Plants',
            'storage-locations': 'Storage Locations',
            'warehouse-structure': 'Warehouse Structure',
            'picking-strategies': 'Picking Strategies',
            'putaway-strategies': 'Putaway Strategies',
            'inbound-process': 'Inbound Process',
            'outbound-process': 'Outbound Process',
            'inventory-management': 'Inventory Management',
            'number-ranges': 'Number Ranges',
            'user-roles': 'User Roles & Permissions',
            'integration-settings': 'Integration Settings'
        };
        return titles[configType] || configType;
    }

    // New Screen Management
    openNewScreen() {
        // Create a new window for multi-screen work
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
            this.showNotification('New session window opened', 'success');
        } else {
            // Fallback for non-Electron environment
            this.showNotification('Opening new session...', 'info');
            // In a web environment, you might open a new tab or popup
            window.open(window.location.href, '_blank');
        }
    }

    // Close Current Session
    closeCurrentSession() {
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
            }
        } else {
            // Fallback for web environment
            const response = confirm('Do you want to close this session?');
            if (response) {
                window.close();
            }
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#667eea'
        };
        return colors[type] || '#667eea';
    }
}

// CSS for notifications
const notificationCSS = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

// Add notification CSS to document
const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);

// Navigation User Menu Functionality
function initializeNavigationUserMenu() {
    const userAvatar = document.querySelector('.nav-user-avatar');
    const userDropdown = document.querySelector('.nav-user-dropdown');
    
    if (userAvatar && userDropdown) {
        // Setup user avatar click handler
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
        
        // Setup user menu links
        const profileLink = userDropdown.querySelector('[data-i18n="dashboard.profileSettings"]');
        const logoutLink = userDropdown.querySelector('[data-i18n="dashboard.signOut"]');
        
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Handle profile settings
                console.log('Open profile settings');
                userDropdown.classList.remove('show');
            });
        }
        
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Handle logout
                console.log('Logout user');
                userDropdown.classList.remove('show');
                // You can implement actual logout functionality here
            });
        }
        
        // Initialize user info
        const userName = userDropdown.querySelector('.nav-user-name');
        const userEmail = userDropdown.querySelector('.nav-user-email');
        const userInitials = userAvatar.querySelector('span');
        
        // Set default user info (you can modify this based on actual user data)
        if (userName) userName.textContent = 'User Name';
        if (userEmail) userEmail.textContent = 'user@example.com';
        if (userInitials) userInitials.textContent = 'UN';
    }
}

// Make tree navigation available globally for testing
window.testTreeScroll = function() {
    const favoritesTree = window.favoritesTree;
    if (favoritesTree) {
        favoritesTree.testTreeScroll();
    } else {
        console.error('Favorites tree not initialized');
    }
};

// Also add a function to manually expand all folders for testing
window.expandAllTreeNodes = function() {
    const treeContainer = document.getElementById('favorites-tree');
    if (treeContainer) {
        treeContainer.querySelectorAll('.tree-expand[data-node-id]').forEach(btn => {
            const icon = btn.textContent;
            if (icon === '▶') { // Only expand collapsed nodes
                btn.click();
            }
        });
        console.log('All tree nodes expanded');
        
        // Test scroll after expanding
        setTimeout(() => {
            window.testTreeScroll();
        }, 500);
    }
};

// Initialize navigation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
    
    // Initialize navigation user menu
    initializeNavigationUserMenu();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}