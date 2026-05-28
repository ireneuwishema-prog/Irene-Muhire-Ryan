// Translation dictionary
const translations = {
    en: {
        title: 'Login Form',
        langLabel: 'Language',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        loginBtn: 'Login',
        adminBtn: 'Admin Login',
        switchText: "Don't have an account?",
        registerLink: 'Register',
        backHome: 'Back Home',
        emailError: 'Please enter a valid email',
        passwordError: 'Password must be at least 6 characters',
        loginError: 'Invalid email or password',
        loginSuccess: 'Login successful! Redirecting...'
    },
    fr: {
        title: 'Formulaire de Connexion',
        langLabel: 'Langue',
        emailLabel: 'Email',
        passwordLabel: 'Mot de passe',
        loginBtn: 'Connexion',
        adminBtn: 'Admin',
        switchText: "Vous n'avez pas de compte?",
        registerLink: 'S\'inscrire',
        backHome: 'Retour à l\'accueil',
        emailError: 'Veuillez entrer un email valide',
        passwordError: 'Le mot de passe doit contenir au moins 6 caractères',
        loginError: 'Email ou mot de passe invalide',
        loginSuccess: 'Connexion réussie!'
    },
    rw: {
        title: 'Fomu y\'Iyinjira',
        langLabel: 'Ururimi',
        emailLabel: 'Email',
        passwordLabel: 'Ijambo-banga',
        loginBtn: 'Iyinjira',
        adminBtn: 'Admin',
        switchText: 'Nta konti?',
        registerLink: 'Kwiyandikisha',
        backHome: 'Subira ku Mwambaro',
        emailError: 'Injiza email nziza',
        passwordError: 'Ijambo-banga rigomba kuba na characters 6',
        loginError: 'Email cyangwa ijambo-banga sibyemewe',
        loginSuccess: 'Iyinjira ryakozwe!'
    }
};

let currentLanguage = 'en';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    
    const mainButton = document.getElementById('mainButton');
    const langSelect = document.getElementById('languageSelect');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    if (mainButton) {
        console.log('Main button found');
        mainButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLoginClick();
        });
    }

    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLoginClick();
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLoginClick();
            }
        });
    }

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
});

// Handle login click
function handleLoginClick() {
    console.log('Login clicked');
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const mainButton = document.getElementById('mainButton');

    console.log('Email:', email, 'Password length:', password.length);

    // Clear previous errors
    clearErrors();

    // Validate inputs
    if (!email || !validateEmail(email)) {
        console.log('Email validation failed');
        showError('emailError', translations[currentLanguage].emailError);
        return;
    }

    if (password.length < 6) {
        console.log('Password validation failed');
        showError('passwordError', translations[currentLanguage].passwordError);
        return;
    }

    // Show loading state
    mainButton.setAttribute('aria-busy', 'true');
    mainButton.disabled = true;
    mainButton.textContent = 'Logging in...';

    // Simulate API delay
    setTimeout(() => {
        // Get registered users from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        console.log('Registered users:', registeredUsers);

        // Find user with matching email and password
        const user = registeredUsers.find(u => u.email === email && u.password === password);

        if (user) {
            console.log('User found:', user);
            
            // User found - save current user session
            const currentUser = {
                name: user.name,
                email: user.email,
                registeredAt: user.registeredAt,
                isAdmin: false
            };

            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('User saved to localStorage');
            
            // Show success message
            showSuccessMessage(translations[currentLanguage].loginSuccess);

            // Redirect to course page after brief delay
            setTimeout(() => {
                console.log('Redirecting to course.html');
                window.location.href = 'course.html';
            }, 1500);
        } else {
            console.log('User not found');
            
            // User not found
            mainButton.setAttribute('aria-busy', 'false');
            mainButton.disabled = false;
            mainButton.textContent = 'Login';
            showError('emailError', translations[currentLanguage].loginError);
        }
    }, 1000);
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Clear all errors
function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
}

// Show success message
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.padding = '15px 20px';
    alertDiv.style.background = '#d5f4e6';
    alertDiv.style.color = '#27ae60';
    alertDiv.style.border = '1px solid #abebc6';
    alertDiv.style.borderRadius = '8px';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Update all text elements
    const textKeys = {
        'title': 'title',
        'langLabel': 'langLabel',
        'emailLabel': 'emailLabel',
        'passwordLabel': 'passwordLabel',
        'mainButton': 'loginBtn'
    };

    for (const [elementId, translationKey] of Object.entries(textKeys)) {
        const element = document.getElementById(elementId);
        if (element && translations[lang][translationKey]) {
            element.textContent = translations[lang][translationKey];
        }
    }

    // Update register link text
    const switchText = document.getElementById('switchText');
    if (switchText) {
        switchText.innerHTML = `${translations[lang].switchText} <a href="register.html">${translations[lang].registerLink}</a>`;
    }
}

const accountsKey = 'grpupAccounts';

const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const mainButton = document.getElementById('mainButton');
const registerButton = document.getElementById('registerButton');

if (mainButton) mainButton.addEventListener('click', handleLogin);
if (registerButton) registerButton.addEventListener('click', handleRegister);

function handleLogin() {
    clearErrors();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email) {
        emailError.textContent = 'Enter your email';
        return;
    }
    if (!password) {
        passwordError.textContent = 'Enter your password';
        return;
    }

    const account = getAccount(email);
    if (!account) {
        emailError.textContent = 'No account found';
        return;
    }
    if (account.password !== password) {
        passwordError.textContent = 'Wrong password';
        return;
    }

    alert('Login successful');
    window.location.href = 'home.html';
}

function handleRegister() {
    clearErrors();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!email) {
        emailError.textContent = 'Enter your email';
        return;
    }
    if (!password) {
        passwordError.textContent = 'Enter your password';
        return;
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
        passwordError.textContent = 'Passwords do not match';
        return;
    }

    const accounts = getAccounts();
    if (accounts[email]) {
        emailError.textContent = 'Account already exists';
        return;
    }

    accounts[email] = { email, password };
    localStorage.setItem(accountsKey, JSON.stringify(accounts));

    alert('Account created');
    window.location.href = 'login.html';
}

function getAccounts() {
    const stored = localStorage.getItem(accountsKey);
    return stored ? JSON.parse(stored) : {};
}

function getAccount(email) {
    return getAccounts()[email] || null;
}

function clearErrors() {
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';
}


