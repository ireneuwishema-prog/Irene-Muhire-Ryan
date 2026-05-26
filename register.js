const translations = {
    en: {
        title: 'Register Form',
        nameLabel: 'Full Name',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        registerBtn: 'Register',
        nameError: 'Please enter your full name',
        emailError: 'Please enter a valid email',
        passwordError: 'Password must be at least 6 characters',
        emailExists: 'This email is already registered',
        registerSuccess: 'Registration successful! Redirecting to login...'
    },
    fr: {
        title: 'Formulaire d\'Inscription',
        nameLabel: 'Nom complet',
        emailLabel: 'Email',
        passwordLabel: 'Mot de passe',
        registerBtn: 'S\'inscrire',
        nameError: 'Veuillez entrer votre nom complet',
        emailError: 'Veuillez entrer un email valide',
        passwordError: 'Le mot de passe doit contenir au moins 6 caractères',
        emailExists: 'Cet email est déjà enregistré',
        registerSuccess: 'Inscription réussie!'
    },
    rw: {
        title: 'Fomu y\'Iyandikisha',
        nameLabel: 'Izina Ryose',
        emailLabel: 'Email',
        passwordLabel: 'Ijambo-banga',
        registerBtn: 'Kwiyandikisha',
        nameError: 'Andika izina ryose',
        emailError: 'Andika email nziza',
        passwordError: 'Ijambo-banga rigomba kuba na characters 6',
        emailExists: 'Email iyi ari yo yanditse',
        registerSuccess: 'Iyandikisha ryakozwe!'
    }
};

let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Register page loaded');
    
    const mainButton = document.getElementById('mainButton');
    const langSelect = document.getElementById('languageSelect');
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    if (mainButton) {
        console.log('Register button found');
        mainButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleRegisterClick();
        });
    }

    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleRegisterClick();
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleRegisterClick();
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleRegisterClick();
            }
        });
    }

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
});

function handleRegisterClick() {
    console.log('Register clicked');
    
    const name = document.getElementById('nameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const mainButton = document.getElementById('mainButton');

    console.log('Name:', name, 'Email:', email, 'Password length:', password.length);

    clearErrors();

    // Validate
    if (!name) {
        console.log('Name validation failed');
        showError('nameError', translations[currentLanguage].nameError);
        return;
    }

    if (!validateEmail(email)) {
        console.log('Email validation failed');
        showError('emailError', translations[currentLanguage].emailError);
        return;
    }

    if (password.length < 6) {
        console.log('Password validation failed');
        showError('passwordError', translations[currentLanguage].passwordError);
        return;
    }

    // Check if email already exists
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    console.log('Current registered users:', registeredUsers);
    
    if (registeredUsers.some(u => u.email === email)) {
        console.log('Email already exists');
        showError('emailError', translations[currentLanguage].emailExists);
        return;
    }

    // Show loading
    mainButton.setAttribute('aria-busy', 'true');
    mainButton.disabled = true;
    mainButton.textContent = 'Registering...';

    setTimeout(() => {
        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: password,
            registeredAt: new Date().toISOString()
        };

        // Add to registered users
        registeredUsers.push(newUser);
        console.log('New user created:', newUser);
        console.log('All users now:', registeredUsers);
        
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        console.log('Users saved to localStorage');

        // Show success
        showSuccessMessage(translations[currentLanguage].registerSuccess);

        // Redirect to login
        setTimeout(() => {
            console.log('Redirecting to login.html');
            window.location.href = 'login.html';
        }, 1500);
    }, 1000);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
}

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

function changeLanguage(lang) {
    currentLanguage = lang;
    
    const textKeys = {
        'title': 'title',
        'langLabel': 'Language',
        'nameLabel': 'nameLabel',
        'emailLabel': 'emailLabel',
        'passwordLabel': 'passwordLabel',
        'mainButton': 'registerBtn'
    };

    for (const [elementId, translationKey] of Object.entries(textKeys)) {
        const element = document.getElementById(elementId);
        if (element && translations[lang][translationKey]) {
            element.textContent = translations[lang][translationKey];
        }
    }
}