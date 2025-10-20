/**
 * Company Code Management Service
 * Handles API communication with the company code microservice
 */

class CompanyCodeService {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Get all company codes with optional filters
    async getAllCompanyCodes(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.country) queryParams.append('country', filters.country);
        if (filters.currency) queryParams.append('currency', filters.currency);
        if (filters.search) queryParams.append('search', filters.search);

        const endpoint = `/company-codes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return await this.makeRequest(endpoint);
    }

    // Get company code by ID
    async getCompanyCodeById(id) {
        return await this.makeRequest(`/company-codes/${id}`);
    }

    // Get company code by company code
    async getCompanyCodeByCode(companyCode) {
        return await this.makeRequest(`/company-codes/search/${companyCode}`);
    }

    // Create new company code
    async createCompanyCode(companyData) {
        return await this.makeRequest('/company-codes', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }

    // Update existing company code
    async updateCompanyCode(id, companyData) {
        return await this.makeRequest(`/company-codes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(companyData)
        });
    }

    // Delete company code
    async deleteCompanyCode(id) {
        return await this.makeRequest(`/company-codes/${id}`, {
            method: 'DELETE'
        });
    }

    // Get statistics
    async getStats() {
        return await this.makeRequest('/company-codes/stats');
    }

    // Get dropdown options
    async getOptions() {
        return await this.makeRequest('/company-codes/options');
    }

    // Check if microservice is available
    async checkHealth() {
        try {
            const response = await fetch('http://localhost:3001/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

/**
 * Company Code Management Page Controller
 */
class CompanyCodeManagement {
    constructor() {
        this.service = new CompanyCodeService();
        this.currentCompanyCodes = [];
        this.filteredCompanyCodes = [];
        this.currentEditingId = null;
        this.dropdownOptions = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Main elements
        this.tableContainer = document.getElementById('company-codes-table-container');
        this.tbody = document.getElementById('company-codes-tbody');
        this.loadingState = document.getElementById('loading-state');
        this.errorState = document.getElementById('error-state');
        this.emptyState = document.getElementById('empty-state');
        this.errorMessage = document.getElementById('error-message');
        
        // Toolbar elements
        this.refreshBtn = document.getElementById('refresh-company-codes');
        this.addBtn = document.getElementById('add-company-code');
        this.searchInput = document.getElementById('search-company-codes');
        this.countryFilter = document.getElementById('filter-country');
        this.currencyFilter = document.getElementById('filter-currency');
        
        // Modal elements
        this.modal = document.getElementById('company-code-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalForm = document.getElementById('company-code-form');
        this.modalClose = document.querySelector('.modal-close');
        this.modalCancel = document.getElementById('modal-cancel');
        this.modalSave = document.getElementById('modal-save');
        this.modalDelete = document.getElementById('modal-delete');
        
        // Statistics elements
        this.totalCompaniesEl = document.getElementById('total-companies');
        this.totalCountriesEl = document.getElementById('total-countries');
        this.totalCurrenciesEl = document.getElementById('total-currencies');
        
        // Form elements
        this.formElements = {
            companyCode: document.getElementById('modal-company-code'),
            companyName: document.getElementById('modal-company-name'),
            city: document.getElementById('modal-city'),
            country: document.getElementById('modal-country'),
            currency: document.getElementById('modal-currency'),
            language: document.getElementById('modal-language')
        };
    }

    bindEvents() {
        // Navigation events
        document.getElementById('back-to-org-structure')?.addEventListener('click', () => this.navigateBack());
        
        // Toolbar events
        this.refreshBtn?.addEventListener('click', () => this.loadCompanyCodes());
        this.addBtn?.addEventListener('click', () => this.openCreateModal());
        this.searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.countryFilter?.addEventListener('change', () => this.applyFilters());
        this.currencyFilter?.addEventListener('change', () => this.applyFilters());
        
        // Modal events
        this.modalClose?.addEventListener('click', () => this.closeModal());
        this.modalCancel?.addEventListener('click', () => this.closeModal());
        this.modalSave?.addEventListener('click', () => this.saveCompanyCode());
        this.modalDelete?.addEventListener('click', () => this.deleteCompanyCode());
        
        // Form events
        this.modalForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCompanyCode();
        });
        
        // Error state retry
        document.getElementById('retry-load')?.addEventListener('click', () => this.loadCompanyCodes());
        document.getElementById('add-first-company-code')?.addEventListener('click', () => this.openCreateModal());
        
        // Modal background click
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    async initialize() {
        console.log('Initializing Company Code Management...');
        
        // Check if microservice is running
        const isHealthy = await this.service.checkHealth();
        if (!isHealthy) {
            this.showError('Company Code microservice is not running. Please start it at http://localhost:3001');
            return;
        }

        // Load dropdown options
        await this.loadDropdownOptions();
        
        // Load company codes
        await this.loadCompanyCodes();
        
        // Load statistics
        await this.loadStatistics();
    }

    async loadDropdownOptions() {
        try {
            const response = await this.service.getOptions();
            this.dropdownOptions = response.data;
            this.populateDropdowns();
        } catch (error) {
            console.error('Error loading dropdown options:', error);
        }
    }

    populateDropdowns() {
        if (!this.dropdownOptions) return;

        // Populate country dropdowns
        const countrySelects = [this.countryFilter, this.formElements.country];
        countrySelects.forEach(select => {
            if (!select) return;
            
            // Clear existing options (except first one for filters)
            const isFilter = select === this.countryFilter;
            select.innerHTML = isFilter ? '<option value="">All Countries</option>' : '<option value="">Select Country</option>';
            
            this.dropdownOptions.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = country.name;
                select.appendChild(option);
            });
        });

        // Populate currency dropdowns
        const currencySelects = [this.currencyFilter, this.formElements.currency];
        currencySelects.forEach(select => {
            if (!select) return;
            
            const isFilter = select === this.currencyFilter;
            select.innerHTML = isFilter ? '<option value="">All Currencies</option>' : '<option value="">Select Currency</option>';
            
            this.dropdownOptions.currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                select.appendChild(option);
            });
        });

        // Populate language dropdown
        if (this.formElements.language) {
            this.formElements.language.innerHTML = '<option value="">Select Language</option>';
            this.dropdownOptions.languages.forEach(language => {
                const option = document.createElement('option');
                option.value = language.code;
                option.textContent = language.name;
                this.formElements.language.appendChild(option);
            });
        }
    }

    async loadCompanyCodes() {
        this.showLoading();
        
        try {
            const response = await this.service.getAllCompanyCodes();
            this.currentCompanyCodes = response.data;
            this.filteredCompanyCodes = [...this.currentCompanyCodes];
            this.renderCompanyCodes();
            this.updateVisibility();
        } catch (error) {
            console.error('Error loading company codes:', error);
            this.showError(error.message);
        }
    }

    async loadStatistics() {
        try {
            const response = await this.service.getStats();
            this.updateStatistics(response.data);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    renderCompanyCodes() {
        if (!this.tbody) return;

        this.tbody.innerHTML = '';

        this.filteredCompanyCodes.forEach(company => {
            const row = this.createCompanyRow(company);
            this.tbody.appendChild(row);
        });
    }

    createCompanyRow(company) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="company-code-cell">${this.escapeHtml(company.companyCode)}</td>
            <td class="company-name-cell">${this.escapeHtml(company.companyName)}</td>
            <td>${this.escapeHtml(company.city)}</td>
            <td>${this.escapeHtml(company.country)}</td>
            <td>${this.escapeHtml(company.currency)}</td>
            <td>${this.escapeHtml(company.language)}</td>
            <td class="actions-cell">
                <button type="button" class="btn-icon btn-edit" data-id="${company.id}" title="Edit">
                    ✏️
                </button>
                <button type="button" class="btn-icon btn-delete" data-id="${company.id}" title="Delete">
                    🗑️
                </button>
            </td>
        `;

        // Bind action buttons
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');

        editBtn?.addEventListener('click', () => this.openEditModal(company.id));
        deleteBtn?.addEventListener('click', () => this.confirmDelete(company.id));

        return row;
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredCompanyCodes = [...this.currentCompanyCodes];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredCompanyCodes = this.currentCompanyCodes.filter(company =>
                company.companyCode.toLowerCase().includes(term) ||
                company.companyName.toLowerCase().includes(term) ||
                company.city.toLowerCase().includes(term)
            );
        }
        
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.filteredCompanyCodes];

        // Apply country filter
        const countryFilter = this.countryFilter?.value;
        if (countryFilter) {
            filtered = filtered.filter(company => company.country === countryFilter);
        }

        // Apply currency filter
        const currencyFilter = this.currencyFilter?.value;
        if (currencyFilter) {
            filtered = filtered.filter(company => company.currency === currencyFilter);
        }

        this.filteredCompanyCodes = filtered;
        this.renderCompanyCodes();
        this.updateVisibility();
    }

    openCreateModal() {
        this.currentEditingId = null;
        this.modalTitle.textContent = window.i18n.t('companyCodeManagement.createCompany');
        this.modalDelete.style.display = 'none';
        this.formElements.companyCode.disabled = false;
        this.resetForm();
        this.showModal();
    }

    async openEditModal(id) {
        try {
            const response = await this.service.getCompanyCodeById(id);
            const company = response.data;
            
            this.currentEditingId = id;
            this.modalTitle.textContent = window.i18n.t('companyCodeManagement.editCompany');
            this.modalDelete.style.display = 'inline-block';
            this.formElements.companyCode.disabled = true;
            
            this.populateForm(company);
            this.showModal();
        } catch (error) {
            console.error('Error loading company for edit:', error);
            this.showToast(error.message, 'error');
        }
    }

    populateForm(company) {
        Object.keys(this.formElements).forEach(key => {
            const element = this.formElements[key];
            if (element && company[key] !== undefined) {
                element.value = company[key] || '';
            }
        });
    }

    resetForm() {
        Object.values(this.formElements).forEach(element => {
            if (element) element.value = '';
        });
    }

    async saveCompanyCode() {
        try {
            const formData = this.getFormData();
            const isValid = this.validateForm(formData);
            
            if (!isValid) {
                this.showToast(window.i18n.t('companyCodeManagement.validationError'), 'error');
                return;
            }

            let response;
            if (this.currentEditingId) {
                response = await this.service.updateCompanyCode(this.currentEditingId, formData);
                this.showToast(window.i18n.t('companyCodeManagement.updateSuccess'), 'success');
            } else {
                response = await this.service.createCompanyCode(formData);
                this.showToast(window.i18n.t('companyCodeManagement.createSuccess'), 'success');
            }

            this.closeModal();
            await this.loadCompanyCodes();
            await this.loadStatistics();
        } catch (error) {
            console.error('Error saving company code:', error);
            
            if (error.message.includes('already exists')) {
                this.showToast(window.i18n.t('companyCodeManagement.duplicateCode'), 'error');
            } else {
                this.showToast(window.i18n.t('companyCodeManagement.errorSaving'), 'error');
            }
        }
    }

    async confirmDelete(id) {
        const confirmed = confirm(window.i18n.t('companyCodeManagement.deleteConfirm'));
        if (!confirmed) return;

        try {
            await this.service.deleteCompanyCode(id);
            this.showToast(window.i18n.t('companyCodeManagement.deleteSuccess'), 'success');
            await this.loadCompanyCodes();
            await this.loadStatistics();
        } catch (error) {
            console.error('Error deleting company code:', error);
            this.showToast(window.i18n.t('companyCodeManagement.errorDeleting'), 'error');
        }
    }

    async deleteCompanyCode() {
        if (this.currentEditingId) {
            this.closeModal();
            await this.confirmDelete(this.currentEditingId);
        }
    }

    getFormData() {
        const data = {};
        Object.keys(this.formElements).forEach(key => {
            const element = this.formElements[key];
            if (element) {
                data[key] = element.value.trim();
            }
        });
        return data;
    }

    validateForm(data) {
        let isValid = true;

        // Required fields
        const requiredFields = ['companyCode', 'companyName', 'city', 'country', 'currency', 'language'];
        
        requiredFields.forEach(field => {
            const element = this.formElements[field];
            if (!data[field]) {
                element?.classList.add('error');
                isValid = false;
            } else {
                element?.classList.remove('error');
            }
        });

        // Field length validations
        if (data.companyCode && data.companyCode.length !== 4) {
            this.formElements.companyCode?.classList.add('error');
            isValid = false;
        }

        if (data.country && data.country.length !== 2) {
            this.formElements.country?.classList.add('error');
            isValid = false;
        }

        if (data.currency && data.currency.length !== 3) {
            this.formElements.currency?.classList.add('error');
            isValid = false;
        }

        if (data.language && data.language.length !== 2) {
            this.formElements.language?.classList.add('error');
            isValid = false;
        }

        return isValid;
    }

    updateStatistics(stats) {
        if (this.totalCompaniesEl) {
            this.totalCompaniesEl.textContent = stats.totalCompanies || 0;
        }
        
        if (this.totalCountriesEl) {
            this.totalCountriesEl.textContent = stats.byCountry?.length || 0;
        }
        
        if (this.totalCurrenciesEl) {
            this.totalCurrenciesEl.textContent = stats.byCurrency?.length || 0;
        }
    }

    showLoading() {
        this.loadingState.style.display = 'block';
        this.errorState.style.display = 'none';
        this.tableContainer.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorState.style.display = 'block';
        this.loadingState.style.display = 'none';
        this.tableContainer.style.display = 'none';
        this.emptyState.style.display = 'none';
    }

    updateVisibility() {
        const hasData = this.filteredCompanyCodes.length > 0;
        
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'none';
        
        if (hasData) {
            this.tableContainer.style.display = 'block';
            this.emptyState.style.display = 'none';
        } else {
            this.tableContainer.style.display = 'none';
            this.emptyState.style.display = 'block';
        }
    }

    navigateBack() {
        // Navigate back to organizational structure page
        if (window.commonNavigation) {
            window.commonNavigation.navigateToPage('organizational-structure');
        } else {
            // Fallback: direct navigation
            document.getElementById('company-code-management-page').style.display = 'none';
            document.getElementById('organizational-structure-page').style.display = 'block';
        }
        console.log('Navigated back to Organizational Structure page');
    }

    showModal() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.resetForm();
        this.currentEditingId = null;
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global instance
let companyCodeManagement = null;

// Initialize when page is shown
function setupCompanyCodeManagement() {
    if (!companyCodeManagement) {
        companyCodeManagement = new CompanyCodeManagement();
    }
    companyCodeManagement.initialize();
}