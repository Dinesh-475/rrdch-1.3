/**
 * RRDCH — auth.js
 * Client-side authentication helpers.
 * Provides: getToken, getUser, requireAuth, logout, injectUserHeader
 *
 * Usage in portal pages:
 *   requireAuth('admin');   // redirects to /login.html if not logged in or wrong role
 *   requireAuth('student'); // call at top of portal scripts
 */

const API = '/api';

// ─── Token Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the stored JWT, or null.
 */
function getToken() {
  return localStorage.getItem('rrdch_token') || null;
}

/**
 * Returns the decoded user object from the stored JWT, or null.
 * Does basic structure validation (no signature verify — server handles that).
 */
function getUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearAuth();
      return null;
    }
    return payload;
  } catch {
    clearAuth();
    return null;
  }
}

/**
 * Store token + user after login.
 */
function setAuth(token, user) {
  localStorage.setItem('rrdch_token', token);
  localStorage.setItem('rrdch_user', JSON.stringify(user));
}

/**
 * Remove auth data from storage.
 */
function clearAuth() {
  localStorage.removeItem('rrdch_token');
  localStorage.removeItem('rrdch_user');
}

// ─── Portal Guard ─────────────────────────────────────────────────────────────

/**
 * Call at the top of any portal page script.
 * Redirects to /login.html if user is not authenticated or has wrong role.
 *
 * @param {...string} roles - Allowed roles: 'admin', 'student', 'doctor', 'patient', 'hod'
 */
function requireAuth(...roles) {
  const user = getUser();

  if (!user) {
    // Not logged in — redirect to login
    window.location.href = '/login.html?reason=session_expired';
    throw new Error('Redirecting to login'); // stop script execution
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Wrong role — redirect to their correct portal
    const portalMap = {
      admin:   '/portals/admin.html',
      hod:     '/portals/admin.html',
      student: '/portals/student.html',
      doctor:  '/portals/doctor.html',
      patient: '/portals/patient.html',
    };
    window.location.href = portalMap[user.role] || '/login.html';
    throw new Error('Redirecting to correct portal');
  }

  return user;
}

/** Alias used by some portal pages: guardPage(['student']) or guardPage('student') */
function guardPage(...roles) {
  const flat = roles.length === 1 && Array.isArray(roles[0]) ? roles[0] : roles;
  return requireAuth(...flat);
}

function getCurrentUser() {
  return getUser();
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Clears auth and redirects to login page.
 * Also notifies server (fire and forget).
 */
async function logout() {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch { /* network error — proceed anyway */ }
  }
  clearAuth();
  window.location.href = '/login.html';
}

// ─── API Fetch Helper ─────────────────────────────────────────────────────────

/**
 * Authenticated fetch wrapper.
 * Automatically adds Authorization header.
 * Redirects to login on 401.
 *
 * @param {string} endpoint - e.g. '/api/admin/dashboard'
 * @param {object} options  - fetch options
 * @returns {Promise<any>}  - parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(endpoint, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login.html?reason=session_expired';
    throw new Error('Unauthorized — redirecting to login');
  }

  return res.json();
}

// ─── Header Injection ─────────────────────────────────────────────────────────

/**
 * Inject the logged-in user's name and role into portal header elements.
 * Looks for elements with data-auth="name" and data-auth="role".
 */
function injectUserHeader() {
  const user = getUser();
  if (!user) return;

  document.querySelectorAll('[data-auth="name"]').forEach(el => {
    el.textContent = user.name || 'User';
  });
  document.querySelectorAll('[data-auth="role"]').forEach(el => {
    el.textContent = (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1);
  });
  document.querySelectorAll('[data-auth="initials"]').forEach(el => {
    const names = (user.name || 'U').split(' ');
    el.textContent = names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
  });
}

// ─── Login Page Helper ────────────────────────────────────────────────────────

/**
 * Handle login form submission.
 * @param {string} identifier - email / student ID / phone
 * @param {string} password
 * @param {string} role       - 'admin', 'student', 'doctor'
 * @returns {Promise<{ok, token, user, msg}>}
 */
async function doLogin(identifier, password, role) {
  let endpoint = `${API}/auth/login`;
  let bodyData = { identifier, password, role };

  if (role === 'patient') {
    endpoint = `${API}/auth/patient/otp/verify`;
    bodyData = { phone: identifier, otp: password };
  }

  const data = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(bodyData),
  });

  if (data.ok) {
    setAuth(data.token, data.user);
    // Redirect to the correct portal
    const portalMap = {
      admin:   '/portals/admin.html',
      hod:     '/portals/admin.html',
      student: '/portals/student.html',
      doctor:  '/portals/doctor.html',
      patient: '/portals/patient.html',
    };
    window.location.href = portalMap[data.user.portal] || portalMap[data.user.role] || '/portals/student.html';
  }
  return data;
}

/**
 * If user is already logged in and visits login page, redirect them to their portal.
 */
function redirectIfLoggedIn() {
  const user = getUser();
  if (!user) return;
  const portalMap = {
    admin:   '/portals/admin.html',
    hod:     '/portals/admin.html',
    student: '/portals/student.html',
    doctor:  '/portals/doctor.html',
    patient: '/portals/patient.html',
  };
  window.location.href = portalMap[user.portal] || portalMap[user.role] || '/portals/student.html';
}

// ─── URL Param Helper ─────────────────────────────────────────────────────────

function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// Make available globally
window.RRDCH = {
  getToken, getUser, setAuth, clearAuth,
  requireAuth, guardPage, getCurrentUser, logout,
  apiFetch, injectUserHeader,
  doLogin, redirectIfLoggedIn, getUrlParam,
};
