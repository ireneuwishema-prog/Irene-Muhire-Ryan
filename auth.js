const AUTH_STORAGE_KEY = 'grpupAccounts';
const AUTH_SESSION_KEY = 'grpupCurrentUser';

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function getStoredAccounts() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function setStoredAccounts(accounts) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts));
}

function saveAccount(email, password) {
    const normalized = normalizeEmail(email);
    if (!normalized || !password) {
        throw new Error('Email and password are required.');
    }

    const accounts = getStoredAccounts();
    if (accounts[normalized]) {
        throw new Error('This email is already registered.');
    }

    const account = { email: normalized, password };
    accounts[normalized] = account;
    setStoredAccounts(accounts);
    setCurrentUser(account);
    return account;
}

function getAccount(email) {
    return getStoredAccounts()[normalizeEmail(email)] || null;
}

function authenticate(email, password) {
    const account = getAccount(email);
    if (!account || account.password !== password) {
        return null;
    }
    setCurrentUser(account);
    return account;
}

function setCurrentUser(account) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(account));
}

function getCurrentUser() {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function logoutUser() {
    localStorage.removeItem(AUTH_SESSION_KEY);
}