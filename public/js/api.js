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
  window.location.href = '/login.html';
}

/**
 * Clear admin auth data and redirect to admin login
 */
function adminLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/admin-login.html';
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
  return user && user.role === 'admin';
}

/**
 * Make an API request with optional authentication
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
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

  if (isAdmin()) {
    authLinks.innerHTML = `
      <a href="/admin-dashboard.html">Dashboard</a>
      <a href="#" onclick="adminLogout()">Logout</a>
    `;
  } else if (isLoggedIn()) {
    const user = getUser();
    authLinks.innerHTML = `
      <a href="/dashboard.html">Dashboard</a>
      <a href="#" onclick="logout()">Logout</a>
    `;
  } else {
    authLinks.innerHTML = `
      <a href="/login.html">Login</a>
      <a href="/register.html">Register</a>
    `;
  }
}

// Update navbar auth state when page loads
document.addEventListener('DOMContentLoaded', updateNavAuth);
