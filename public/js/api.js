// ============================================
// API Helper — Shared HTTP utility for all pages
// Handles token management, API calls, and auth state
// ============================================

const API_BASE = '/api';

/**
 * Get stored JWT token from localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Get stored user data from localStorage
 */
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Save auth data (token + user) to localStorage
 */
function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear auth data and redirect to login
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Push login page, then replace current entry so back goes: login -> home
  window.location.replace('/login.html');
}

/**
 * Clear admin auth data and redirect to admin login
 */
function adminLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.replace('/admin-login.html');
}

/**
 * Check if user is currently logged in
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Check if current user is admin
 */
function isAdmin() {
  const user = getUser();
  return user && ['admin', 'superadmin', 'faculty', 'club_admin'].includes(user.role);
}

/**
 * Make an API request with optional authentication
 * Supports: 
 * - apiRequest('/url', { method: 'POST', body: JSON.stringify({...}) })
 * - apiRequest('/url', 'POST', {...})
 * @param {string} endpoint - API endpoint
 * @param {object|string} optionsOrMethod - Fetch options or HTTP method
 * @param {object} body - Body object (will be stringified)
 */
async function apiRequest(endpoint, optionsOrMethod = {}, body = null) {
  const url = `${API_BASE}${endpoint}`;
  let options = {};

  // Handle shorthand: apiRequest(url, 'POST', data)
  if (typeof optionsOrMethod === 'string') {
    options = { method: optionsOrMethod };
    if (body) options.body = JSON.stringify(body);
  } else {
    options = optionsOrMethod;
  }

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add auth token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
      }
      return text;
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Format a date string into a readable format
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format a date with time
 */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Update navbar based on auth state
 */
function updateNavAuth() {
  const authLinks = document.getElementById('auth-links');
  if (!authLinks) return;

  if (isLoggedIn()) {
    const user = getUser();
    let dashboardUrl = '/dashboard.html';

    if (user.role === 'admin' || user.role === 'superadmin') dashboardUrl = '/admin-dashboard.html';
    else if (user.role === 'faculty') dashboardUrl = '/staff-dashboard.html';
    else if (user.role === 'club_admin') dashboardUrl = '/staff-dashboard.html';

    authLinks.innerHTML = `
      <a href="${dashboardUrl}">Dashboard</a>
      <a href="#" onclick="logout()">Logout</a>
    `;
  } else {
    authLinks.innerHTML = `
      <a href="/portals.html">Login</a>
      <a href="/register.html">Register</a>
    `;
  }
}

// Update navbar auth state when page loads
document.addEventListener('DOMContentLoaded', updateNavAuth);

// Handle back-forward cache (bfcache) - if user navigates back after logout, force reload
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
