const STORAGE_KEY_APP = 'appFormData';

function loadFormValues() {
    const saved = localStorage.getItem(STORAGE_KEY_APP);
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        document.getElementById('login-language').value = data.loginLanguage || 'en';
        document.getElementById('login-email').value = data.loginEmail || '';
        document.querySelector('input[name="remember"]').checked = data.loginRemember ?? true;

        document.getElementById('register-language').value = data.registerLanguage || 'en';
        document.getElementById('register-fullname').value = data.registerFullname || '';
        document.getElementById('register-email').value = data.registerEmail || '';
        document.querySelector('input[name="agree"]').checked = data.registerAgree ?? true;
    } catch (error) {
        console.warn('Unable to restore form values', error);
    }
}

function saveFormValues() {
    const data = {
        loginLanguage: document.getElementById('login-language').value,
        loginEmail: document.getElementById('login-email').value,
        loginRemember: document.querySelector('input[name="remember"]').checked,
        registerLanguage: document.getElementById('register-language').value,
        registerFullname: document.getElementById('register-fullname').value,
        registerEmail: document.getElementById('register-email').value,
        registerAgree: document.querySelector('input[name="agree"]').checked
    };
    localStorage.setItem(STORAGE_KEY_APP, JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', () => {
    loadFormValues();

    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', saveFormValues);
        element.addEventListener('change', saveFormValues);
    });
});