/**
 * SQL Query Interface for ABWarehouse
 * Handles SQL query execution, data grid display, pagination, and sorting
 */

class SQLQueryInterface {
    constructor() {
        console.log('🏗️ SQLQueryInterface constructor called');
        this.currentPage = 1;
        this.pageSize = 50;
        this.sortField = null;
        this.sortDirection = 'asc';
        this.lastQuery = '';
        this.lastResults = null;
        this.columns = [];
        this.filteredData = [];
        this.originalData = [];
        this.quickFilterValue = '';
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Load schema after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.loadSchema();
        }, 100);
    }

    initializeEventListeners() {
        console.log('🔧 Initializing SQL Query Interface event listeners');
        
        // Execute button
        const executeBtn = document.getElementById('execute-sql-btn');
        console.log('Execute button found:', !!executeBtn);
        if (executeBtn) {
            // Remove any existing listeners by cloning the element
            const newExecuteBtn = executeBtn.cloneNode(true);
            executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);
            
            newExecuteBtn.addEventListener('click', (e) => {
                console.log('🚀 Execute button clicked - starting query execution');
                e.preventDefault();
                e.stopPropagation();
                this.executeQuery();
            });
            console.log('✅ Execute button event listener attached');
        } else {
            console.warn('⚠️ Execute button not found, will retry later');
        }

        // Clear button
        const clearBtn = document.getElementById('clear-sql-btn');
        console.log('Clear button found:', !!clearBtn);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                console.log('🗑️ Clear button clicked');
                this.clearQuery();
            });
        }

        // Schema button
        const schemaBtn = document.getElementById('schema-btn');
        console.log('Schema button found:', !!schemaBtn);
        if (schemaBtn) {
            schemaBtn.addEventListener('click', () => {
                console.log('📋 Schema button clicked');
                this.toggleSchema();
            });
        }

        // Sample query buttons
        const sampleButtons = document.querySelectorAll('.sample-btn');
        sampleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                this.loadSampleQuery(query);
            });
        });

        // Page size change
        const pageSizeSelect = document.getElementById('rows-per-page');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderTable();
            });
        }

        // Quick filter
        const quickFilter = document.getElementById('quick-filter');
        if (quickFilter) {
            quickFilter.addEventListener('input', (e) => {
                this.quickFilterValue = e.target.value.toLowerCase();
                this.applyQuickFilter();
                this.currentPage = 1;
                this.renderTable();
            });
        }

        // Enter key in textarea
        const textarea = document.getElementById('sql-textarea');
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.executeQuery();
                }
            });
        }
    }

    async executeQuery() {
        console.log('🚀 executeQuery method called');
        
        const textarea = document.getElementById('sql-textarea');
        const query = textarea ? textarea.value.trim() : '';
        
        console.log('Query textarea found:', !!textarea);
        console.log('Query text:', query);
        
        if (!query) {
            console.warn('⚠️ No query provided');
            this.showMessage('Please enter a SQL query', 'error');
            return;
        }

        const executeBtn = document.getElementById('execute-sql-btn');
        if (executeBtn) {
            executeBtn.disabled = true;
            executeBtn.innerHTML = '<span class="spinner"></span> Executing...';
            console.log('✅ Execute button disabled and updated');
        }

        try {
            // Use the correct API URL for the Electron app
            const apiUrl = 'http://localhost:3001/api/sql/execute';
            console.log('📡 Making API request to:', apiUrl);
            
            const requestBody = {
                query: query,
                page: this.currentPage,
                limit: this.pageSize,
                sortField: this.sortField,
                sortDirection: this.sortDirection
            };
            console.log('Request body:', requestBody);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status, response.statusText);
            
            // Check if the response is HTML (404 page) instead of JSON
            const contentType = response.headers.get('content-type');
            console.log('Response content type:', contentType);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Server API not found. Please start the server by running: cd HelloWorldElectron/company-code-service && node server.js');
                }
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned invalid response. Please ensure the API server is running correctly.');
            }

            const result = await response.json();
            console.log('API response result:', result);

            if (result.success) {
                console.log('✅ Query successful, processing results');
                this.lastQuery = query;
                this.lastResults = result.data;
                this.originalData = result.data.records;
                this.columns = result.data.columns;
                console.log('Data processed:', {
                    records: this.originalData.length,
                    columns: this.columns.length
                });
                this.applyQuickFilter();
                this.showResults();
                this.showMessage(
                    `Query executed successfully! Found ${result.data.pagination.totalRecords} records.`, 
                    'success'
                );
                console.log('✅ Results displayed successfully');
            } else {
                console.error('❌ Query failed:', result.message);
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('❌ Query execution error:', error);
            
            // Check if it's a network error (server not running)
            if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED') || error.message.includes('Server API not found')) {
                console.log('🔄 Server not available, showing demo data');
                this.showDemoData(query);
            } else {
                this.showMessage(`Failed to execute query: ${error.message}. Please check that the server is running on http://localhost:3001`, 'error');
            }
        } finally {
            if (executeBtn) {
                executeBtn.disabled = false;
                executeBtn.innerHTML = '🚀 Execute Query';
                console.log('✅ Execute button re-enabled');
            }
        }
    }
    
    // Show demo data when server is not available
    showDemoData(query) {
        console.log('📊 Showing demo data for query:', query);
        
        // Create sample data structure
        const demoData = {
            records: [
                { id: 1, company_code: 'US01', company_name: 'ABC Warehouse Inc', city: 'New York', country: 'US', currency: 'USD', language: 'EN' },
                { id: 2, company_code: 'US02', company_name: 'XYZ Logistics LLC', city: 'Los Angeles', country: 'US', currency: 'USD', language: 'EN' },
                { id: 3, company_code: 'DE01', company_name: 'Deutsch Lager GmbH', city: 'Berlin', country: 'DE', currency: 'EUR', language: 'DE' },
                { id: 4, company_code: 'FR01', company_name: 'Entrepôt France SA', city: 'Paris', country: 'FR', currency: 'EUR', language: 'FR' },
                { id: 5, company_code: 'UK01', company_name: 'British Storage Ltd', city: 'London', country: 'UK', currency: 'GBP', language: 'EN' }
            ],
            columns: [
                { field: 'id', header: 'ID', type: 'number' },
                { field: 'company_code', header: 'Company Code', type: 'string' },
                { field: 'company_name', header: 'Company Name', type: 'string' },
                { field: 'city', header: 'City', type: 'string' },
                { field: 'country', header: 'Country', type: 'string' },
                { field: 'currency', header: 'Currency', type: 'string' },
                { field: 'language', header: 'Language', type: 'string' }
            ],
            pagination: {
                totalRecords: 5,
                totalPages: 1,
                currentPage: 1,
                pageSize: 50
            }
        };
        
        this.lastQuery = query;
        this.lastResults = demoData;
        this.originalData = demoData.records;
        this.columns = demoData.columns;
        
        console.log('Demo data processed:', {
            records: this.originalData.length,
            columns: this.columns.length
        });
        
        this.applyQuickFilter();
        this.showResults();
        this.showMessage(
            `Demo data displayed (${demoData.pagination.totalRecords} sample records). Server is not running - start it to query real data.`, 
            'success'
        );
        console.log('✅ Demo results displayed successfully');
    }

    clearQuery() {
        const textarea = document.getElementById('sql-textarea');
        if (textarea) {
            textarea.value = '';
        }
        this.hideResults();
        this.clearMessages();
    }

    loadSampleQuery(query) {
        const textarea = document.getElementById('sql-textarea');
        if (textarea) {
            textarea.value = query;
        }
    }

    toggleSchema() {
        const schemaInfo = document.getElementById('schema-info');
        const schemaBtn = document.getElementById('schema-btn');
        
        if (schemaInfo && schemaBtn) {
            const isVisible = schemaInfo.style.display !== 'none';
            schemaInfo.style.display = isVisible ? 'none' : 'block';
            schemaBtn.textContent = isVisible ? '📋 Show Schema' : '📋 Hide Schema';
        }
    }

    applyQuickFilter() {
        if (!this.quickFilterValue) {
            this.filteredData = [...this.originalData];
            return;
        }

        this.filteredData = this.originalData.filter(record => {
            return Object.values(record).some(value => 
                String(value).toLowerCase().includes(this.quickFilterValue)
            );
        });
    }

    showResults() {
        console.log('📊 showResults() called');
        const resultsSection = document.getElementById('sql-results-section');
        console.log('Results section found:', !!resultsSection);
        
        if (resultsSection) {
            resultsSection.style.display = 'block';
            console.log('✅ Results section made visible');
            console.log('Data to render:', {
                filteredDataLength: this.filteredData.length,
                columnsLength: this.columns.length
            });
            this.renderTable();
            console.log('✅ renderTable() called');
        } else {
            console.error('❌ Results section element not found');
        }
    }

    hideResults() {
        const resultsSection = document.getElementById('sql-results-section');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
    }

    renderTable() {
        console.log('🎨 renderTable() called');
        console.log('Data to render:', {
            filteredData: this.filteredData.length,
            columns: this.columns.length
        });
        
        this.renderTableHeaders();
        this.renderTableBody();
        this.renderPagination();
        this.updateResultsInfo();
        console.log('✅ All table rendering methods called');
    }

    renderTableHeaders() {
        console.log('📋 renderTableHeaders() called');
        const thead = document.getElementById('sql-table-head');
        console.log('Table head element found:', !!thead);
        console.log('Columns to render:', this.columns);
        
        if (!thead || !this.columns.length) {
            console.warn('❌ Table head element not found or no columns available');
            return;
        }

        thead.innerHTML = `
            <tr>
                ${this.columns.map(col => `
                    <th onclick="sqlQueryInterface.sortBy('${col.field}')" title="Click to sort by ${col.header}">
                        ${col.header}
                        <span class="sort-indicator ${this.sortField === col.field ? 'active' : ''}">
                            ${this.sortField === col.field 
                                ? (this.sortDirection === 'asc' ? '↑' : '↓')
                                : '↕'
                            }
                        </span>
                    </th>
                `).join('')}
            </tr>
        `;
        console.log('✅ Table headers rendered');
    }

    renderTableBody() {
        console.log('📋 renderTableBody() called');
        const tbody = document.getElementById('sql-table-body');
        console.log('Table body element found:', !!tbody);
        console.log('Filtered data length:', this.filteredData.length);
        
        if (!tbody) {
            console.error('❌ Table body element not found');
            return;
        }
        
        if (!this.filteredData.length) {
            console.log('⚠️ No filtered data available, showing no data message');
            tbody.innerHTML = `
                <tr>
                    <td colspan="${this.columns.length}" class="no-data">
                        ${this.originalData.length === 0 
                            ? 'No data found for this query.' 
                            : 'No records match the current filter.'
                        }
                    </td>
                </tr>
            `;
            return;
        }

        // Apply client-side sorting
        const sortedData = this.applySorting([...this.filteredData]);
        console.log('Data after sorting:', sortedData.length);
        
        // Apply client-side pagination
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = sortedData.slice(startIndex, endIndex);
        console.log('Page data:', pageData.length, 'records from index', startIndex, 'to', endIndex);

        tbody.innerHTML = pageData.map(record => `
            <tr>
                ${this.columns.map(col => `
                    <td title="${this.formatCellValue(record[col.field])}">
                        ${this.formatCellValue(record[col.field])}
                    </td>
                `).join('')}
            </tr>
        `).join('');
        
        console.log('✅ Table body rendered with', pageData.length, 'rows');
    }

    applySorting(data) {
        if (!this.sortField) return data;
        
        return data.sort((a, b) => {
            const aVal = a[this.sortField];
            const bVal = b[this.sortField];
            
            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            else if (aVal > bVal) comparison = 1;
            
            return this.sortDirection === 'desc' ? -comparison : comparison;
        });
    }

    formatCellValue(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'string' && value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        return String(value);
    }

    sortBy(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        
        this.renderTable();
    }

    renderPagination() {
        const totalRecords = this.filteredData.length;
        const totalPages = Math.ceil(totalRecords / this.pageSize);
        
        const paginationText = document.getElementById('pagination-text');
        const paginationButtons = document.getElementById('pagination-buttons');
        
        if (!paginationText || !paginationButtons) return;
        
        // Update pagination info
        const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
        const endRecord = Math.min(this.currentPage * this.pageSize, totalRecords);
        
        paginationText.textContent = `Showing ${startRecord}-${endRecord} of ${totalRecords} records`;
        
        // Generate pagination controls
        let controls = '';
        
        // Previous button
        controls += `
            <button class="pagination-btn" ${this.currentPage <= 1 ? 'disabled' : ''} 
                    onclick="sqlQueryInterface.goToPage(${this.currentPage - 1})">
                ← Previous
            </button>
        `;
        
        // Page numbers
        const maxPageButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        
        if (endPage - startPage < maxPageButtons - 1) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        
        if (startPage > 1) {
            controls += `<button class="pagination-btn" onclick="sqlQueryInterface.goToPage(1)">1</button>`;
            if (startPage > 2) {
                controls += `<span style="padding: 0 5px;">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            controls += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="sqlQueryInterface.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                controls += `<span style="padding: 0 5px;">...</span>`;
            }
            controls += `<button class="pagination-btn" onclick="sqlQueryInterface.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        controls += `
            <button class="pagination-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} 
                    onclick="sqlQueryInterface.goToPage(${this.currentPage + 1})">
                Next →
            </button>
        `;
        
        paginationButtons.innerHTML = controls;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    }

    updateResultsInfo() {
        const resultsCount = document.getElementById('results-count');
        const executionTime = document.getElementById('execution-time');
        
        if (resultsCount) {
            resultsCount.textContent = `${this.filteredData.length} records found`;
        }
        
        if (executionTime && this.lastResults) {
            const time = new Date(this.lastResults.executionTime).toLocaleTimeString();
            executionTime.textContent = `• Executed at ${time}`;
        }
    }

    showMessage(message, type) {
        const container = document.getElementById('sql-messages');
        if (!container) return;
        
        const messageClass = type === 'error' ? 'message-error' : 'message-success';
        
        container.innerHTML = `
            <div class="message ${messageClass}">
                ${message}
            </div>
        `;
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.clearMessages();
            }, 5000);
        }
    }

    clearMessages() {
        const container = document.getElementById('sql-messages');
        if (container) {
            container.innerHTML = '';
        }
    }

    async loadSchema() {
        try {
            const apiUrl = 'http://localhost:3001/api/sql/schema';
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    this.showMessage('Server not running. Please start it by running: cd HelloWorldElectron/company-code-service && node server.js', 'error');
                    return;
                }
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.updateSchemaDisplay(result.data);
                this.updateSampleQueries(result.data.sampleQueries);
            }
        } catch (error) {
            console.log('Could not load schema (server may not be running):', error);
            this.showMessage('Could not connect to server. Please ensure the API server is running on http://localhost:3001', 'error');
        }
    }

    updateSchemaDisplay(schema) {
        const schemaDetails = document.getElementById('schema-details');
        if (schemaDetails) {
            let columnsHtml = schema.columns.map(col => `
                <div class="schema-column">
                    <span class="column-name">${col.field}</span>
                    <span class="column-type">${col.type}</span>
                </div>
            `).join('');
            
            schemaDetails.innerHTML = `
                <p><strong>Table:</strong> ${schema.tableName} (${schema.totalRecords} records)</p>
                <div class="schema-columns">
                    ${columnsHtml}
                </div>
            `;
        }
    }

    updateSampleQueries(queries) {
        const sampleButtons = document.querySelector('.sample-query-buttons');
        if (sampleButtons && queries) {
            sampleButtons.innerHTML = queries.map(query => `
                <button class="sample-btn" data-query="${query.replace(/'/g, '&apos;')}">${query.substring(0, 30)}${query.length > 30 ? '...' : ''}</button>
            `).join('');
            
            // Re-attach event listeners for new buttons
            sampleButtons.querySelectorAll('.sample-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const query = e.target.getAttribute('data-query').replace(/&apos;/g, "'");
                    this.loadSampleQuery(query);
                });
            });
        }
    }
}

// Initialize SQL Query Interface when the content is shown
let sqlQueryInterface = null;

function initializeSQLQueryInterface() {
    console.log('🔧 initializeSQLQueryInterface called');
    
    // Check if elements exist first
    const executeBtn = document.getElementById('execute-sql-btn');
    const textarea = document.getElementById('sql-textarea');
    
    console.log('DOM elements check:', {
        executeBtn: !!executeBtn,
        textarea: !!textarea
    });
    
    if (!executeBtn || !textarea) {
        console.warn('⚠️ Required DOM elements not found, delaying initialization');
        // Try again after a delay
        setTimeout(() => {
            console.log('🔄 Retrying SQL interface initialization');
            initializeSQLQueryInterface();
        }, 300);
        return null;
    }
    
    if (!sqlQueryInterface) {
        console.log('🚀 Creating new SQL Query Interface instance');
        sqlQueryInterface = new SQLQueryInterface();
        // Load schema on initialization
        sqlQueryInterface.loadSchema();
    } else {
        console.log('✅ SQL Query Interface already exists, reinitializing event listeners');
        // Reinitialize event listeners in case DOM was recreated
        sqlQueryInterface.initializeEventListeners();
    }
    
    return sqlQueryInterface;
}

// Export for global access
window.initializeSQLQueryInterface = initializeSQLQueryInterface;

// Global test function to check SQL interface status
window.testSQLInterface = function() {
    console.log('=== SQL Interface Test ===');
    
    // Check if elements exist
    const executeBtn = document.getElementById('execute-sql-btn');
    const textarea = document.getElementById('sql-textarea');
    const resultsSection = document.getElementById('sql-results-section');
    const messagesContainer = document.getElementById('sql-messages');
    
    console.log('Execute button found:', !!executeBtn);
    console.log('Textarea found:', !!textarea);
    console.log('Results section found:', !!resultsSection);
    console.log('Messages container found:', !!messagesContainer);
    
    // Check if SQL interface instance exists
    console.log('Global sqlQueryInterface exists:', !!window.sqlQueryInterface);
    console.log('Module sqlQueryInterface exists:', !!sqlQueryInterface);
    
    // Try to manually execute a query
    if (window.sqlQueryInterface) {
        console.log('Attempting manual query execution...');
        if (textarea) textarea.value = 'SELECT * FROM companies LIMIT 5';
        window.sqlQueryInterface.executeQuery();
    } else {
        console.log('No SQL interface instance available');
    }
    
    return {
        executeBtn: !!executeBtn,
        textarea: !!textarea,
        resultsSection: !!resultsSection,
        messagesContainer: !!messagesContainer,
        sqlInterface: !!window.sqlQueryInterface
    };
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Will be initialized when showSQLQueryInterface is called
    });
}