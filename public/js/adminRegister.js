// ============================================
// Admin Registration Page Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (isAdmin()) {
    window.location.replace('/admin-dashboard.html');
    return;
  }

  const form = document.getElementById('admin-register-form');
  const btn = document.getElementById('admin-register-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const secretKey = document.getElementById('secretKey').value;

    if (!username || !password || !secretKey) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Creating Account...';

    try {
      const data = await apiRequest('/auth/admin-register', {
        method: 'POST',
        body: JSON.stringify({ username, password, secretKey })
      });

      saveAuth(data.token, { ...data.admin, role: 'admin' });
      showToast('Admin registration successful!', 'success');

      setTimeout(() => {
        window.location.replace('/admin-dashboard.html');
      }, 1500);
    } catch (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = '🛡️ Create Admin Account';
    }
  });
});
