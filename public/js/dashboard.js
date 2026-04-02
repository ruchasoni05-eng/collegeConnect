// ============================================
// Student Dashboard Script
// Loads and displays student's own complaints
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check
  if (!isLoggedIn() || isAdmin()) {
    window.location.href = '/login.html';
    return;
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Show welcome message with user name
  const user = getUser();
  if (user) {
    document.getElementById('welcome-msg').textContent = `👋 Welcome, ${user.name}!`;
  }

  // Load complaints
  await loadMyComplaints();
});

/**
 * Fetch and display student's own complaints
 */
async function loadMyComplaints() {
  const container = document.getElementById('complaints-list');

  try {
    const complaints = await apiRequest('/complaints/my');

    if (complaints.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>No submissions yet</h3>
          <p>You haven't submitted any feedback or complaints.</p>
          <a href="/submit.html" class="btn btn-primary mt-16">📝 Submit Now</a>
        </div>
      `;
      return;
    }

    container.innerHTML = complaints.map(c => `
      <div class="complaint-card">
        <div class="complaint-meta">
          <span class="complaint-id">${c.complaintId}</span>
          <span class="badge badge-${c.category.toLowerCase()}">${c.category}</span>
          <span class="badge badge-${c.status === 'Pending' ? 'pending' : c.status === 'In Review' ? 'review' : 'resolved'}">${c.status}</span>
          ${c.aiAnalysis ? `<span class="badge badge-${c.aiAnalysis.priority.toLowerCase()}">${c.aiAnalysis.priority} Priority</span>` : ''}
        </div>
        <h3>${c.subject}</h3>
        <p>${c.message.length > 200 ? c.message.substring(0, 200) + '...' : c.message}</p>
        ${c.aiAnalysis ? `
          <div class="ai-analysis">
            <div class="ai-item">
              <div class="ai-item-label">AI Category</div>
              <span class="badge badge-feedback">${c.aiAnalysis.detectedCategory}</span>
            </div>
            <div class="ai-item">
              <div class="ai-item-label">Sentiment</div>
              <span class="badge badge-${c.aiAnalysis.sentiment.toLowerCase()}">${c.aiAnalysis.sentiment}</span>
            </div>
            <div class="ai-item">
              <div class="ai-item-label">Priority</div>
              <span class="badge badge-${c.aiAnalysis.priority.toLowerCase()}">${c.aiAnalysis.priority}</span>
            </div>
          </div>
        ` : ''}
        <div class="complaint-footer">
          <span class="complaint-date">📅 ${formatDate(c.createdAt)}</span>
          <span style="color: var(--text-muted);">🏢 ${c.department} &nbsp;|&nbsp; 👍 ${c.upvotes.length} upvotes</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Error loading complaints</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}
