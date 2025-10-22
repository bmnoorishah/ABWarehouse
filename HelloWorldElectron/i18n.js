// Internationalization (i18n) System
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.supportedLanguages = {
            'en': { name: 'English', flag: '🇬🇧' },
            'fr': { name: 'Français', flag: '🇫🇷' }
        };
        
        this.init();
    }

    async init() {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('language') || 'en';
        
        // Load all translation files
        await this.loadTranslations();
        
        // Set initial language
        await this.setLanguage(savedLanguage);
        
        // Setup language switcher
        this.setupLanguageSwitcher();
    }

    async loadTranslations() {
        try {
            // Load English (fallback)
            const enResponse = await fetch('./translations/en.json');
            this.translations.en = await enResponse.json();
            
            // Load French
            const frResponse = await fetch('./translations/fr.json');
            this.translations.fr = await frResponse.json();
            
            console.log('All translations loaded successfully');
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to empty object if loading fails
            this.translations = {
                en: {},
                fr: {}
            };
        }
    }

    async setLanguage(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.warn(`Language ${langCode} not supported, falling back to ${this.fallbackLanguage}`);
            langCode = this.fallbackLanguage;
        }

        this.currentLanguage = langCode;
        localStorage.setItem('language', langCode);
        
        // Update document language attribute
        document.documentElement.lang = langCode;
        
        // Update all translatable elements
        this.updatePageTranslations();
        
        // Update language switcher
        this.updateLanguageSwitcher();
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: langCode } 
        }));
    }

    translate(key, params = {}) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        // Navigate through nested keys
        for (const k of keys) {
            if (translation && typeof translation === 'object') {
                translation = translation[k];
            } else {
                translation = undefined;
                break;
            }
        }
        
        // Fallback to English if translation not found
        if (translation === undefined) {
            translation = this.translations[this.fallbackLanguage];
            for (const k of keys) {
                if (translation && typeof translation === 'object') {
                    translation = translation[k];
                } else {
                    translation = key; // Return key if no translation found
                    break;
                }
            }
        }
        
        // Handle parameterized translations
        if (typeof translation === 'string' && Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                translation = translation.replace(`{${param}}`, params[param]);
            });
        }
        
        return translation || key;
    }

    // Alias for translate method for convenience
    t(key, params = {}) {
        return this.translate(key, params);
    }

    updatePageTranslations() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'password')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update elements with data-i18n-html for HTML content
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.translate(key);
            element.innerHTML = translation;
        });
        
        // Update title
        document.title = this.translate('common.appName');
    }

    setupLanguageSwitcher() {
        // Create language switcher HTML if it doesn't exist
        this.createLanguageSwitcherHTML();
        
        // Setup event listeners for old login page language switcher
        const languageToggle = document.getElementById('language-toggle');
        const languageDropdown = document.getElementById('language-dropdown');
        const languageOptions = document.querySelectorAll('.language-option, .nav-dropdown-item[data-lang]');
        
        if (languageToggle) {
            languageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                languageDropdown.classList.toggle('show');
            });
        }
        
        // Setup event listeners for new navigation language switcher
        const navLanguageToggle = document.getElementById('nav-language-toggle');
        const navLanguageDropdown = document.getElementById('nav-language-dropdown');
        const navLanguageOptions = document.querySelectorAll('.nav-language-option, .nav-dropdown-item[data-lang]');
        
        if (navLanguageToggle) {
            navLanguageToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navLanguageDropdown.classList.toggle('show');
            });
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            if (languageDropdown) {
                languageDropdown.classList.remove('show');
            }
            if (navLanguageDropdown) {
                navLanguageDropdown.classList.remove('show');
            }
        });
        
        // Handle language selection for old switcher (if exists)
        languageOptions.forEach(option => {
            // Only add event listener if this element doesn't belong to the navigation system
            if (!option.closest('.nav-container')) {
                option.addEventListener('click', () => {
                    const langCode = option.dataset.lang;
                    this.setLanguage(langCode);
                    languageDropdown.classList.remove('show');
                });
            }
        });
        
        // Don't add handlers for navigation language switcher - let navigation system handle it
        // Navigation system will call window.i18n.setLanguage() directly
    }

    createLanguageSwitcherHTML() {
        // Check if language switcher already exists
        if (document.getElementById('language-switcher')) {
            return;
        }
        
        // Create language switcher for login page
        const loginCard = document.querySelector('.login-card');
        if (loginCard) {
            const languageSwitcher = document.createElement('div');
            languageSwitcher.id = 'language-switcher';
            languageSwitcher.className = 'language-switcher login-lang-switcher';
            languageSwitcher.innerHTML = this.getLanguageSwitcherHTML();
            
            // Insert at the top of login card
            loginCard.insertBefore(languageSwitcher, loginCard.firstChild);
        }
        
        // Create language switcher for navigation (dashboard)
        const navLanguageSwitcher = document.querySelector('.nav-language-switcher');
        if (navLanguageSwitcher) {
            navLanguageSwitcher.innerHTML = this.getNavigationLanguageSwitcherHTML();
        }
    }

    getLanguageSwitcherHTML() {
        const currentLang = this.supportedLanguages[this.currentLanguage];
        
        return `
            <div class="language-selector">
                <button class="language-toggle" id="language-toggle">
                    <span class="flag">${currentLang.flag}</span>
                    <span class="lang-name">${currentLang.name}</span>
                    <span class="arrow">▼</span>
                </button>
                <div class="language-dropdown" id="language-dropdown">
                    ${Object.entries(this.supportedLanguages).map(([code, lang]) => `
                        <div class="language-option ${code === this.currentLanguage ? 'active' : ''}" data-lang="${code}">
                            <span class="flag">${lang.flag}</span>
                            <span class="name">${lang.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getNavigationLanguageSwitcherHTML() {
        const currentLang = this.supportedLanguages[this.currentLanguage];
        
        return `
            <button class="nav-language-btn" id="nav-language-toggle">
                <span class="flag">${currentLang.flag}</span>
                <span class="lang-code">${this.currentLanguage.toUpperCase()}</span>
                <span class="arrow">▼</span>
            </button>
            <div class="nav-language-dropdown" id="nav-language-dropdown">
                ${Object.entries(this.supportedLanguages).map(([code, lang]) => `
                    <a href="#" class="nav-language-option ${code === this.currentLanguage ? 'active' : ''}" data-lang="${code}">
                        <span class="flag">${lang.flag}</span>
                        <span class="name">${lang.name}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }

    updateLanguageSwitcher() {
        const currentLang = this.supportedLanguages[this.currentLanguage];
        
        // Update old login page toggle button
        document.querySelectorAll('.language-toggle').forEach(toggle => {
            const flag = toggle.querySelector('.flag');
            const name = toggle.querySelector('.lang-name');
            
            if (flag) flag.textContent = currentLang.flag;
            if (name) name.textContent = currentLang.name;
        });
        
        // Update new navigation toggle button
        document.querySelectorAll('.nav-language-btn').forEach(toggle => {
            const flag = toggle.querySelector('.flag');
            const langCode = toggle.querySelector('.lang-code');
            
            if (flag) flag.textContent = currentLang.flag;
            if (langCode) langCode.textContent = this.currentLanguage.toUpperCase();
        });
        
        // Update active option in old switcher
        document.querySelectorAll('.language-option').forEach(option => {
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Update active option in new navigation switcher
        document.querySelectorAll('.nav-language-option').forEach(option => {
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// Global instance
let i18n;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    i18n = new I18nManager();
    
    // Make available globally
    window.i18n = i18n;
});

// Helper function for easy translation access
function t(key, params = {}) {
    return window.i18n ? window.i18n.translate(key, params) : key;
}