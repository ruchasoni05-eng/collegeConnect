// ============================================
// Admin Login Page Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (isAdmin()) {
    window.location.href = '/admin-dashboard.html';
    return;
  }

  const form = document.getElementById('admin-login-form');
  const btn = document.getElementById('admin-login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Logging in...';

    try {
      const data = await apiRequest('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      saveAuth(data.token, { ...data.admin, role: 'admin' });
      showToast('Admin login successful!', 'success');

      setTimeout(() => {
        window.location.href = '/admin-dashboard.html';
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = '🔐 Admin Login';
    }
  });
});
