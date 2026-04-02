// ============================================
// Confessions Page Script
// Loads confessions and handles new posts
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Handle confession form
  const form = document.getElementById('confession-form');
  const btn = document.getElementById('confess-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = document.getElementById('confession-message').value.trim();
    if (!message) {
      showToast('Please write something!', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Posting...';

    try {
      await apiRequest('/confessions', {
        method: 'POST',
        body: JSON.stringify({ message })
      });

      showToast('Confession posted anonymously! 🤫', 'success');
      document.getElementById('confession-message').value = '';
      await loadConfessions(); // Refresh list
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🕶️ Post Anonymously';
    }
  });

  // Load confessions
  await loadConfessions();
});

/**
 * Fetch and display all confessions
 */
async function loadConfessions() {
  const container = document.getElementById('confessions-list');

  try {
    const confessions = await apiRequest('/confessions');

    if (confessions.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🤫</div>
          <h3>No confessions yet</h3>
          <p>Be the first to share your thoughts!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = confessions.map(c => `
      <div class="confession-card">
        <p>"${c.message}"</p>
        <div class="confession-date">🕐 ${formatDate(c.createdAt)}</div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⚠️</div>
        <h3>Could not load confessions</h3>
        <p>Please make sure the server is running.</p>
      </div>
    `;
  }
}
