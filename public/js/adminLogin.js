// ============================================
// Staff Login Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = getUser();
  if (currentUser && ['admin', 'superadmin'].includes(currentUser.role)) {
    window.location.replace('/admin-dashboard.html');
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
      const data = await apiRequest('/auth/admin/login', 'POST', {
        username, password
      });
      


      saveAuth(data.token, { ...data.user, role: data.user.role });
      showToast('Admin login successful!', 'success');

      setTimeout(() => {
        window.location.replace('/admin-dashboard.html');
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
      btn.textContent = '🔐 Admin Login';
    }
  });
});
