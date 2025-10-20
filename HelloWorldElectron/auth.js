// Authentication and Login Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.twoFactorEnabled = false;
        this.currentTwoFactorMethod = 'app';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('AuthManager initializeEventListeners called');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded event fired');
            this.setupLoginForm();
            this.setupTwoFactorModal();
            this.setupDashboard();
            this.checkAuthState();
            
            // Add multiple attempts to ensure demo users are set up
            setTimeout(() => {
                this.setupDemoUsers();
            }, 100);
            
            setTimeout(() => {
                this.setupDemoUsers();
            }, 500);
            
            setTimeout(() => {
                this.setupDemoUsers();
            }, 1000);
            
            // Add global click delegation as backup
            document.addEventListener('click', (e) => {
                console.log('Global click event detected on:', e.target);
                const demoUser = e.target.closest('.demo-user');
                if (demoUser) {
                    console.log('Global click detected on demo user:', demoUser);
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const username = demoUser.dataset.username;
                    const password = demoUser.dataset.password;
                    
                    console.log('Demo user data:', { username, password });
                    
                    if (username && password) {
                        const emailField = document.getElementById('email-username');
                        const passwordField = document.getElementById('password');
                        
                        console.log('Form fields:', { emailField: !!emailField, passwordField: !!passwordField });
                        
                        if (emailField && passwordField) {
                            emailField.value = username;
                            passwordField.value = password;
                            
                            // Visual feedback
                            demoUser.style.backgroundColor = '#e6f3ff';
                            setTimeout(() => {
                                demoUser.style.backgroundColor = '';
                            }, 300);
                            
                            this.showSuccess(`Demo account "${username}" auto-filled!`);
                        } else {
                            console.error('Login form fields not found!');
                        }
                    } else {
                        console.error('Username or password not found in demo user data');
                    }
                }
            });
        });
    }

    updateDashboardData() {
        console.log('updateDashboardData called, currentUser:', this.currentUser);
        if (!this.currentUser) return;
        
        // Update user info
        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');
        const welcomeMessageEl = document.getElementById('welcome-message');
        
        if (userNameEl) userNameEl.textContent = this.currentUser.name;
        if (userEmailEl) userEmailEl.textContent = this.currentUser.email;
        if (welcomeMessageEl) welcomeMessageEl.textContent = `Welcome back, ${this.currentUser.name.split(' ')[0]}!`;
        
        // Update user initials
        const userInitials = document.getElementById('user-initials');
        if (userInitials) {
            const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            userInitials.textContent = initials;
        }
        
        // Update last login
        const lastLoginEl = document.getElementById('last-login');
        if (lastLoginEl) lastLoginEl.textContent = new Date().toLocaleTimeString();
        
        // Update platform info
        const platformInfoEl = document.getElementById('platform-info');
        if (platformInfoEl) platformInfoEl.textContent = this.getPlatformName();
        
        // Add login activity
        this.addActivity('Signed in successfully');
        
        // Trigger role-based tile rendering
        console.log('Calling updateRoleAndTiles...');
        if (window.updateRoleAndTiles) {
            window.updateRoleAndTiles();
        } else {
            console.error('updateRoleAndTiles function not found');
        }
    }

    setupLoginForm() {
        console.log('setupLoginForm called');
        const loginForm = document.getElementById('login-form');
        const passwordToggle = document.getElementById('password-toggle');
        const passwordField = document.getElementById('password');
        const ssoBtn = document.getElementById('sso-btn');

        console.log('Login form elements:', { loginForm, passwordToggle, passwordField, ssoBtn });

        // Password visibility toggle
        passwordToggle?.addEventListener('click', () => {
            const isPassword = passwordField.type === 'password';
            passwordField.type = isPassword ? 'text' : 'password';
            passwordToggle.textContent = isPassword ? '🙈' : '👁️';
        });

        // Login form submission
        loginForm?.addEventListener('submit', (e) => {
            console.log('Login form submit event triggered');
            e.preventDefault();
            this.handleLogin();
        });

        // SSO button
        ssoBtn?.addEventListener('click', () => {
            this.showSSOModal();
        });

        // Demo user auto-fill functionality
        this.setupDemoUsers();
    }

    setupDemoUsers() {
        console.log('setupDemoUsers called');
        
        // Try multiple times to ensure DOM is ready
        const attemptSetup = (attempt = 1) => {
            const demoUsers = document.querySelectorAll('.demo-user');
            console.log(`Attempt ${attempt}: Found demo users:`, demoUsers.length);
            
            if (demoUsers.length === 0 && attempt < 5) {
                console.log(`No demo users found on attempt ${attempt}, retrying...`);
                setTimeout(() => attemptSetup(attempt + 1), 200);
                return;
            }
            
            if (demoUsers.length === 0) {
                console.error('No demo users found after multiple attempts! Check HTML structure.');
                return;
            }
            
            demoUsers.forEach((demoUser, index) => {
                console.log(`Setting up demo user ${index}:`, {
                    username: demoUser.dataset.username,
                    password: demoUser.dataset.password,
                    element: demoUser
                });
                
                // Ensure the element is clickable
                demoUser.style.pointerEvents = 'auto';
                demoUser.style.cursor = 'pointer';
                demoUser.setAttribute('tabindex', '0');
                
                // Remove any existing event listeners
                const oldHandler = demoUser.clickHandler;
                if (oldHandler) {
                    demoUser.removeEventListener('click', oldHandler);
                }
                
                // Create new event handler
                const clickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Demo user click event fired!', e.target);
                    
                    const username = demoUser.dataset.username;
                    const password = demoUser.dataset.password;
                    
                    console.log('Demo user clicked:', { username, password });
                    
                    // Fill the form fields
                    const emailField = document.getElementById('email-username');
                    const passwordField = document.getElementById('password');
                    
                    if (emailField && passwordField) {
                        emailField.value = username;
                        passwordField.value = password;
                        
                        console.log('Form fields filled with:', { username, password });
                        
                        // Add visual feedback
                        demoUser.style.backgroundColor = '#e6f3ff';
                        setTimeout(() => {
                            demoUser.style.backgroundColor = '';
                        }, 300);
                        
                        // Show success notification
                        this.showSuccess(`Demo account "${username}" auto-filled!`);
                        
                        // Focus the login button
                        const loginBtn = document.getElementById('login-btn');
                        loginBtn?.focus();
                    } else {
                        console.error('Login form fields not found');
                    }
                };
                
                // Store the handler reference
                demoUser.clickHandler = clickHandler;
                
                // Add the event listener
                demoUser.addEventListener('click', clickHandler);
                
                // Also add keyboard support
                demoUser.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        clickHandler(e);
                    }
                });
                
                console.log(`Demo user ${index} setup complete`);
            });
            
            console.log('All demo users setup complete');
        };
        
        attemptSetup();
    }

    setupTwoFactorModal() {
        const modal = document.getElementById('twofa-modal');
        const closeBtn = document.getElementById('twofa-close');
        const form = document.getElementById('twofa-form');
        const methodBtns = document.querySelectorAll('.method-btn');
        const codeInputs = document.querySelectorAll('.code-input');
        const resendBtn = document.getElementById('resend-code');

        // Close modal
        closeBtn?.addEventListener('click', () => {
            this.hideTwoFactorModal();
        });

        // Method selection
        methodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                methodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTwoFactorMethod = btn.dataset.method;
                this.updateTwoFactorMethodDisplay();
            });
        });

        // Code input handling
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
                this.checkTwoFactorCode();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });
        });

        // Form submission
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyTwoFactor();
        });

        // Resend code
        resendBtn?.addEventListener('click', () => {
            this.resendTwoFactorCode();
        });
    }

    setupSSOModal() {
        const modal = document.getElementById('sso-modal');
        const closeBtn = document.getElementById('sso-close');
        const providerBtns = document.querySelectorAll('.provider-btn');

        // Close modal
        closeBtn?.addEventListener('click', () => {
            this.hideSSOModal();
        });

        // Provider selection
        providerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                this.initiateSSO(provider);
            });
        });
    }

    setupDashboard() {
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        const logoutLink = document.getElementById('logout-link');

        // User menu toggle
        userMenuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown?.classList.remove('show');
        });

        // Logout
        logoutLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    async handleLogin() {
        const emailUsername = document.getElementById('email-username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        const loginBtn = document.getElementById('login-btn');

        console.log('handleLogin called with:', { emailUsername, password });

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        try {
            // Simulate API call
            await this.simulateDelay(1000);
            
            // Mock authentication logic
            const authResult = await this.authenticateUser(emailUsername, password);
            console.log('Authentication result:', authResult);
            
            if (authResult.success) {
                console.log('Authentication successful');
                if (authResult.requiresTwoFactor) {
                    console.log('2FA required');
                    this.twoFactorEnabled = true;
                    this.showTwoFactorModal();
                } else {
                    console.log('No 2FA required, completing login');
                    this.completeLogin(authResult.user, rememberMe);
                }
            } else {
                console.log('Authentication failed');
                this.showError('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    }

    async authenticateUser(emailUsername, password) {
        // Mock authentication - In a real app, this would be an API call
        const mockUsers = {
            'demo@example.com': {
                password: 'demo123',
                name: 'Demo User',
                email: 'demo@example.com',
                role: 'warehouse_operator',
                requiresTwoFactor: false
            },
            'admin': {
                password: 'admin123',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'supervisor_admin',
                requiresTwoFactor: false
            },
            'test@company.com': {
                password: 'test123',
                name: 'Test Consultant',
                email: 'test@company.com',
                role: 'consultant',
                requiresTwoFactor: false
            },
            'user@demo.com': {
                password: 'user123',
                name: 'Finance User',
                email: 'user@demo.com',
                role: 'procurement_finance',
                requiresTwoFactor: false
            },
            'john.doe@company.com': {
                password: 'john123',
                name: 'John Doe',
                email: 'john.doe@company.com',
                role: 'warehouse_operator',
                requiresTwoFactor: false
            },
            'jane.smith@enterprise.com': {
                password: 'jane123',
                name: 'Jane Smith',
                email: 'jane.smith@enterprise.com',
                role: 'supervisor_admin',
                requiresTwoFactor: false
            },
            'guest': {
                password: 'guest123',
                name: 'Guest User',
                email: 'guest@example.com',
                role: 'warehouse_operator',
                requiresTwoFactor: false
            }
        };

        const user = mockUsers[emailUsername];
        if (user && user.password === password) {
            return {
                success: true,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    id: Date.now()
                },
                requiresTwoFactor: user.requiresTwoFactor
            };
        }

        return { success: false };
    }

    showTwoFactorModal() {
        const modal = document.getElementById('twofa-modal');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Focus first input
        const firstInput = document.querySelector('.code-input');
        firstInput?.focus();
        
        this.updateTwoFactorMethodDisplay();
    }

    hideTwoFactorModal() {
        const modal = document.getElementById('twofa-modal');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        this.clearTwoFactorCode();
    }

    updateTwoFactorMethodDisplay() {
        const methods = {
            app: 'Enter the 6-digit code from your authenticator app.',
            sms: 'Enter the code sent to your mobile device via SMS.',
            email: 'Enter the code sent to your email address.'
        };
        
        const description = document.querySelector('#twofa-modal .modal-body p');
        if (description) {
            description.textContent = methods[this.currentTwoFactorMethod];
        }
    }

    checkTwoFactorCode() {
        const inputs = document.querySelectorAll('.code-input');
        const code = Array.from(inputs).map(input => input.value).join('');
        const verifyBtn = document.getElementById('verify-btn');
        
        verifyBtn.disabled = code.length !== 6;
    }

    clearTwoFactorCode() {
        const inputs = document.querySelectorAll('.code-input');
        inputs.forEach(input => {
            input.value = '';
        });
    }

    async verifyTwoFactor() {
        const inputs = document.querySelectorAll('.code-input');
        const code = Array.from(inputs).map(input => input.value).join('');
        const verifyBtn = document.getElementById('verify-btn');

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            await this.simulateDelay(1000);
            
            // Mock verification - in real app, verify with backend
            const isValid = code === '123456' || code === '000000';
            
            if (isValid) {
                this.hideTwoFactorModal();
                this.completeLogin({
                    name: 'Demo User',
                    email: 'demo@example.com',
                    id: Date.now()
                }, false);
            } else {
                this.showError('Invalid verification code. Please try again.');
                this.clearTwoFactorCode();
            }
        } catch (error) {
            this.showError('Verification failed. Please try again.');
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    }

    async resendTwoFactorCode() {
        const resendBtn = document.getElementById('resend-code');
        const originalText = resendBtn.textContent;
        
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';
        
        try {
            await this.simulateDelay(1000);
            this.showSuccess(`Verification code sent via ${this.currentTwoFactorMethod}.`);
            
            // Start countdown
            let countdown = 30;
            const countdownInterval = setInterval(() => {
                resendBtn.textContent = `Resend (${countdown}s)`;
                countdown--;
                
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    resendBtn.disabled = false;
                    resendBtn.textContent = originalText;
                }
            }, 1000);
        } catch (error) {
            this.showError('Failed to resend code.');
            resendBtn.disabled = false;
            resendBtn.textContent = originalText;
        }
    }

    showSSOModal() {
        const modal = document.getElementById('sso-modal');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    hideSSOModal() {
        const modal = document.getElementById('sso-modal');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    async initiateSSO(provider) {
        const loading = document.getElementById('sso-loading');
        const providerBtns = document.querySelectorAll('.provider-btn');
        
        // Show loading state
        providerBtns.forEach(btn => btn.style.display = 'none');
        loading.style.display = 'block';
        
        try {
            await this.simulateDelay(2000);
            
            // Mock SSO success
            const ssoUser = {
                name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
                email: `user@${provider}.com`,
                id: Date.now(),
                ssoProvider: provider
            };
            
            this.hideSSOModal();
            this.completeLogin(ssoUser, false);
        } catch (error) {
            this.showError('SSO authentication failed.');
            loading.style.display = 'none';
            providerBtns.forEach(btn => btn.style.display = 'block');
        }
    }

    completeLogin(user, rememberMe) {
        console.log('completeLogin called with user:', user);
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Store auth state if remember me is checked
        if (rememberMe) {
            localStorage.setItem('authUser', JSON.stringify(user));
            localStorage.setItem('authRemember', 'true');
        } else {
            sessionStorage.setItem('authUser', JSON.stringify(user));
        }
        
        console.log('Showing dashboard...');
        this.showDashboard();
        console.log('Updating dashboard data...');
        this.updateDashboardData();
    }

    showDashboard() {
        const loginPage = document.getElementById('login-page');
        const dashboardPage = document.getElementById('dashboard-page');
        
        loginPage.classList.remove('active');
        dashboardPage.classList.add('active');
        
        // Refresh navigation user displays after successful login
        setTimeout(() => {
            if (typeof window.refreshNavigationUserDisplays === 'function') {
                window.refreshNavigationUserDisplays();
            } else {
                console.warn('Navigation user display refresh function not available');
            }
        }, 100);
    }

    showLoginPage() {
        const loginPage = document.getElementById('login-page');
        const dashboardPage = document.getElementById('dashboard-page');
        
        dashboardPage.classList.remove('active');
        loginPage.classList.add('active');
    }

    addActivity(text) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) {
            console.log('Activity list not found, skipping activity log:', text);
            return;
        }
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-time">${new Date().toLocaleTimeString()}</span>
            <span class="activity-text">${text}</span>
        `;
        activityList.insertBefore(activityItem, activityList.firstChild);
    }

    checkAuthState() {
        // Check for existing authentication
        const rememberedUser = localStorage.getItem('authUser');
        const sessionUser = sessionStorage.getItem('authUser');
        
        if (rememberedUser && localStorage.getItem('authRemember') === 'true') {
            this.currentUser = JSON.parse(rememberedUser);
            this.isAuthenticated = true;
            this.showDashboard();
            this.updateDashboardData();
        } else if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
            this.isAuthenticated = true;
            this.showDashboard();
            this.updateDashboardData();
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Clear stored auth data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authRemember');
        sessionStorage.removeItem('authUser');
        
        this.showLoginPage();
        this.clearLoginForm();
    }

    clearLoginForm() {
        document.getElementById('email-username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('remember-me').checked = false;
    }

    getPlatformName() {
        if (typeof process !== 'undefined' && process.platform) {
            switch (process.platform) {
                case 'darwin': return 'macOS';
                case 'win32': return 'Windows';
                case 'linux': return 'Linux';
                default: return process.platform;
            }
        }
        return 'Web';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
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
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    getUserRole() {
        return this.currentUser?.role || null;
    }
}

// Global function for inline onclick handlers
function fillDemoUser(element) {
    console.log('fillDemoUser called directly:', element);
    
    const username = element.dataset.username;
    const password = element.dataset.password;
    
    console.log('Demo user data from inline handler:', { username, password });
    
    if (username && password) {
        const emailField = document.getElementById('email-username');
        const passwordField = document.getElementById('password');
        
        console.log('Form fields found:', { emailField: !!emailField, passwordField: !!passwordField });
        
        if (emailField && passwordField) {
            emailField.value = username;
            passwordField.value = password;
            
            // Visual feedback
            element.style.backgroundColor = '#e6f3ff';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 300);
            
            // Show success if authManager is available
            if (window.authManager) {
                window.authManager.showSuccess(`Demo account "${username}" auto-filled!`);
            } else {
                console.log(`Demo account "${username}" auto-filled!`);
            }
            
            // Focus the login button
            const loginBtn = document.getElementById('login-btn');
            loginBtn?.focus();
        } else {
            console.error('Login form fields not found!');
        }
    } else {
        console.error('Username or password not found in demo user data');
    }
}

// Make it globally available
window.fillDemoUser = fillDemoUser;

// Initialize authentication manager
console.log('Creating AuthManager instance...');
const authManager = new AuthManager();
window.authManager = authManager;
console.log('AuthManager initialized and assigned to window:', !!window.authManager);