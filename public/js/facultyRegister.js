// ============================================
// Faculty Register Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (isAdmin()) {
    window.location.replace('/staff-dashboard.html');
    return;
  }

  const form = document.getElementById('admin-register-form'); // kept same form ID as cloned
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
      const data = await apiRequest('/auth/faculty/register', 'POST', {
        username, password, secretKey,
        department: document.getElementById('department').value
      });

      saveAuth(data.token, { ...data.user, role: data.user.role });
      showToast('Faculty registration successful!', 'success');

      setTimeout(() => {
        window.location.replace('/staff-dashboard.html');
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = '🛡️ Create Faculty Account';
    }
  });
});
