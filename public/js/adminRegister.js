// ============================================
// Admin Register Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = getUser();
  if (currentUser && ['admin', 'superadmin'].includes(currentUser.role)) {
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

    btn.disabled = true;
    btn.textContent = '⏳ Registering...';

    try {
      const data = await apiRequest('/auth/admin/register', 'POST', {
        username, password, secretKey
      });

      saveAuth(data.token, { ...data.user, role: data.user.role });
      showToast('Admin registration successful!', 'success');

      setTimeout(() => {
        window.location.replace('/admin-dashboard.html');
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = '🛡️ Create Admin Account';
    }
  });
});
