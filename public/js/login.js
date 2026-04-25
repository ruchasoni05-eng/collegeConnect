// ============================================
// Login Page Script
// Handles student login form submission
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    window.location.replace('/dashboard.html');
    return;
  }

  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Logging in...';

    try {
      const data = await apiRequest('/auth/student/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      saveAuth(data.token, { ...data.student, role: 'student' });
      showToast('Login successful! Redirecting...', 'success');

      setTimeout(() => {
        window.location.replace('/dashboard.html');
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = '🔐 Login';
    }
  });
});
