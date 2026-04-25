// ============================================
// Register Page Script
// Handles student registration form submission
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (isLoggedIn()) {
    window.location.replace('/dashboard.html');
    return;
  }

  const form = document.getElementById('register-form');
  const btn = document.getElementById('register-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const department = document.getElementById('department').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Basic validation
    if (!name || !studentId || !department || !email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    // Disable button to prevent double-submit
    btn.disabled = true;
    btn.textContent = '⏳ Creating Account...';

    try {
      const data = await apiRequest('/auth/student/register', {
        method: 'POST',
        body: JSON.stringify({ name, studentId, department, email, password })
      });

      saveAuth(data.token, { ...data.student, role: 'student' });
      showToast('Registration successful! Redirecting...', 'success');

      // Redirect to dashboard
      setTimeout(() => {
        window.location.replace('/dashboard.html');
      }, 1500);
    } catch (error) {
      showToast(error.message, 'error');
      btn.disabled = false;
      btn.textContent = '🚀 Create Account';
    }
  });
});
