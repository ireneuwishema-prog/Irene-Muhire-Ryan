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

document.addEventListener("DOMContentLoaded", () => {
  const loginPanel = document.getElementById("login-panel");
  const adminPanel = document.getElementById("admin-panel");

  if (isAdminAuthed()) {
    if (loginPanel) loginPanel.classList.add("hidden");
    if (adminPanel) adminPanel.classList.remove("hidden");
    renderTable();
  } else {
    if (loginPanel) loginPanel.classList.remove("hidden");
    if (adminPanel) adminPanel.classList.add("hidden");
  }

  const form = document.getElementById("admin-login-form");
  if (form) form.addEventListener("submit", tryAdminLogin);

  const logoutBtn = document.getElementById("admin-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setAdminSession(false);
      if (loginPanel) loginPanel.classList.remove("hidden");
      if (adminPanel) adminPanel.classList.add("hidden");
      const err = document.getElementById("admin-error");
      if (err) err.classList.add("hidden");
    });
  }
});

