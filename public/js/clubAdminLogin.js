// ============================================
// Staff Login Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (isAdmin()) {
    window.location.replace('/staff-dashboard.html');
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
      // Club Admin login
      const data = await apiRequest('/auth/club-admin/login', 'POST', {
        username, password
      });
      


      saveAuth(data.token, { ...data.user, role: data.user.role });
      showToast('Club Admin login successful!', 'success');

      setTimeout(() => {
        window.location.replace('/staff-dashboard.html');
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
      btn.textContent = '🔐 Club Admin Login';
    }
  });
});
