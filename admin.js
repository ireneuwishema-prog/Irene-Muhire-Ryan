// admin.js - lightweight admin dashboard for approving applications

const ADMIN_STORAGE_KEY = "L3_APPS_V1";
const ADMIN_SESSION_KEY = "L3_ADMIN_SESSION_V1";

const ADMIN_USER = "Irene";
const ADMIN_PASS = "irene123";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return fallback;
  }
}

function getApps() {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  const data = safeParse(raw, []);
  return Array.isArray(data) ? data : [];
}

function setApps(apps) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(apps));
}

function setAdminSession(isAuthed) {
  localStorage.setItem(ADMIN_SESSION_KEY, isAuthed ? "1" : "0");
}

function isAdminAuthed() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

function escapeHtml(str) {
  // Avoid using broken replaceAll quoting in TS tooling
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/\"/g, "")
    .replace(/'/g, "&#039;");
}

function renderTable() {
  const tbody = document.getElementById("apps-tbody");
  if (!tbody) return;

  const apps = getApps();
  const pending = apps.filter((a) => a.status === "Pending Review");

  const rows = pending
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .map((app) => {
      const name = escapeHtml(app.name || "");
      const email = escapeHtml(app.email || "");
      const submittedRole = escapeHtml(app.requestedRole || "Applicant");
      const createdAt = escapeHtml(app.createdAtText || "");
      const id = String(app.id || "");

      return `
        <tr>
          <td class="py-3 px-3">${name}</td>
          <td class="py-3 px-3">${email}</td>
          <td class="py-3 px-3">${submittedRole}</td>
          <td class="py-3 px-3">${createdAt}</td>
          <td class="py-3 px-3 text-right">
            <div class="row-actions">
              <button class="btn-approve" data-id="${escapeHtml(id)}">Approve</button>
              <button class="btn-decline" data-id="${escapeHtml(id)}">Decline</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  if (!rows) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-cell">No pending applications.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows;

  tbody.querySelectorAll(".btn-approve").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      updateStatus(id, "Approved");
    });
  });

  tbody.querySelectorAll(".btn-decline").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      updateStatus(id, "Declined");
    });
  });
}

function updateStatus(id, newStatus) {
  const apps = getApps();
  const idx = apps.findIndex((a) => String(a.id) === String(id));
  if (idx === -1) return;

  apps[idx].status = newStatus;
  apps[idx].reviewedAt = Date.now();

  setApps(apps);
  renderTable();
}

function tryAdminLogin(event) {
  event.preventDefault();

  const username = (document.getElementById("admin-username")?.value || "").trim();
  const password = document.getElementById("admin-password")?.value || "";

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    setAdminSession(true);
    document.getElementById("login-panel").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    renderTable();
    return;
  }

  const err = document.getElementById("admin-error");
  if (err) {
    err.textContent = "Invalid admin credentials";
    err.classList.remove("hidden");
  }
}

// Admin credentials
const ADMIN_CREDS = {
    username: 'admin',
    password: 'admin123'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const logoutBtn = document.getElementById('admin-logout-btn');

    loginForm.addEventListener('submit', handleAdminLogin);
    logoutBtn.addEventListener('click', handleAdminLogout);

    // Check if admin is already logged in
    if (isAdminLoggedIn()) {
        showAdminPanel();
    }
});

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();

    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('admin-error');

    // Validate credentials
    if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
        // Store admin session
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUsername', username);

        // Show admin panel
        showAdminPanel();
        errorDiv.classList.add('hidden');
    } else {
        errorDiv.textContent = '❌ Invalid credentials. Please try again.';
        errorDiv.classList.remove('hidden');
    }
}

// Handle admin logout
function handleAdminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUsername');
    
    document.getElementById('login-panel').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('admin-login-form').reset();
}

// Check if admin is logged in
function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

// Show admin panel and load data
function showAdminPanel() {
    document.getElementById('login-panel').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    
    const adminUsername = sessionStorage.getItem('adminUsername');
    document.getElementById('admin-welcome').textContent = `Welcome, ${adminUsername}!`;

    loadUsers();
    loadApplications();
    updateStats();
}

// Load registered users from localStorage
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const tbody = document.getElementById('users-tbody');

    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No registered users yet</td></tr>';
        return;
    }

    users.forEach((user, index) => {
        const row = document.createElement('tr');
        const registeredAt = new Date(user.registeredAt || Date.now()).toLocaleDateString();
        
        row.innerHTML = `
            <td>${escapeHtml(user.name || 'N/A')}</td>
            <td>${escapeHtml(user.email || 'N/A')}</td>
            <td>${registeredAt}</td>
            <td><span class="status-badge status-approved">Active</span></td>
            <td class="table-actions" style="text-align: right;">
                <button class="btn btn-delete" onclick="deleteUser(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load pending applications
function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('pendingApplications')) || [];
    const tbody = document.getElementById('apps-tbody');

    tbody.innerHTML = '';

    if (applications.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No pending applications</td></tr>';
        return;
    }

    applications.forEach((app, index) => {
        const row = document.createElement('tr');
        const submittedAt = new Date(app.submittedAt || Date.now()).toLocaleDateString();
        
        row.innerHTML = `
            <td>${escapeHtml(app.name || 'N/A')}</td>
            <td>${escapeHtml(app.email || 'N/A')}</td>
            <td>${escapeHtml(app.requestedRole || 'N/A')}</td>
            <td>${submittedAt}</td>
            <td class="table-actions" style="text-align: right;">
                <button class="btn btn-approve" onclick="approveApplication(${index})">Approve</button>
                <button class="btn btn-decline" onclick="declineApplication(${index})">Decline</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Approve application
function approveApplication(index) {
    const applications = JSON.parse(localStorage.getItem('pendingApplications')) || [];
    const app = applications[index];

    if (confirm(`Approve application from ${app.name}?`)) {
        applications.splice(index, 1);
        localStorage.setItem('pendingApplications', JSON.stringify(applications));
        loadApplications();
        updateStats();
        showNotification('Application approved!', 'success');
    }
}

// Decline application
function declineApplication(index) {
    const applications = JSON.parse(localStorage.getItem('pendingApplications')) || [];
    const app = applications[index];

    if (confirm(`Decline application from ${app.name}?`)) {
        applications.splice(index, 1);
        localStorage.setItem('pendingApplications', JSON.stringify(applications));
        loadApplications();
        updateStats();
        showNotification('Application declined!', 'success');
    }
}

// Delete user
function deleteUser(index) {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = users[index];

    if (confirm(`Delete user ${user.name}?`)) {
        users.splice(index, 1);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        loadUsers();
        updateStats();
        showNotification('User deleted!', 'success');
    }
}

// Update statistics
function updateStats() {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const applications = JSON.parse(localStorage.getItem('pendingApplications')) || [];

    document.getElementById('total-users').textContent = users.length;
    document.getElementById('pending-apps').textContent = applications.length;
    document.getElementById('approved-count').textContent = users.length; // Simplified
    document.getElementById('declined-count').textContent = '0'; // Simplified
}

// Show notification
function showNotification(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.insertBefore(alert, document.body.firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

