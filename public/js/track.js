// ============================================
// Track Page Script
// Tracks complaint status via unique ID
// Shows a visual timeline of the status
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Allow pressing Enter to track
  document.getElementById('trackId').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') trackComplaint();
  });
});

/**
 * Track a complaint by its ID and display the result
 */
async function trackComplaint() {
  const trackId = document.getElementById('trackId').value.trim();
  const resultCard = document.getElementById('result-card');
  const resultContent = document.getElementById('result-content');

  if (!trackId) {
    showToast('Please enter a complaint tracking ID.', 'error');
    return;
  }

  const btn = document.getElementById('track-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Searching...';

  try {
    const complaint = await apiRequest(`/complaints/track/${trackId}`);

    resultCard.style.display = 'block';

    // Determine status step for timeline
    const statuses = ['Pending', 'In Review', 'Resolved'];
    const currentIndex = statuses.indexOf(complaint.status);
    const statusIcons = { 'Pending': '⏳', 'In Review': '🔍', 'Resolved': '✅' };

    resultContent.innerHTML = `
      <div class="track-result">
        <div class="track-status-icon">${statusIcons[complaint.status]}</div>
        <h2 style="margin-bottom: 4px;">Status: <span style="color: var(--primary);">${complaint.status}</span></h2>
        <p style="color: var(--text-secondary); margin-bottom: 8px;">Tracking ID: <strong>${complaint.complaintId}</strong></p>

        <!-- Status Timeline -->
        <div class="track-timeline">
          ${statuses.map((s, i) => `
            <div class="timeline-step ${i <= currentIndex ? 'completed' : ''}">
              <div class="timeline-dot ${i === currentIndex ? 'active' : (i < currentIndex ? 'completed' : '')}">
                ${i < currentIndex ? '✓' : i + 1}
              </div>
              <span class="timeline-label">${s}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Complaint Details -->
      <div style="text-align: left; margin-top: 24px;">
        <div class="complaint-meta">
          <span class="badge badge-${complaint.category.toLowerCase()}">${complaint.category}</span>
          <span class="badge badge-${complaint.status === 'Pending' ? 'pending' : complaint.status === 'In Review' ? 'review' : 'resolved'}">${complaint.status}</span>
          ${complaint.anonymous ? '<span class="badge badge-neutral">🕶️ Anonymous</span>' : ''}
        </div>
        <h3 style="margin-bottom: 8px;">${complaint.subject}</h3>
        <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 16px;">${complaint.message}</p>

        <div class="d-flex justify-between align-center flex-wrap gap-8" style="font-size: 0.85rem; color: var(--text-muted);">
          <span>📅 Submitted: ${formatDate(complaint.createdAt)}</span>
          <span>🏢 Department: ${complaint.department}</span>
          <span>👍 Upvotes: ${complaint.upvotes.length}</span>
        </div>

        ${complaint.aiAnalysis ? `
          <div class="ai-analysis" style="margin-top: 20px;">
            <div class="ai-item">
              <div class="ai-item-label">AI Category</div>
              <span class="badge badge-feedback">${complaint.aiAnalysis.detectedCategory}</span>
            </div>
            <div class="ai-item">
              <div class="ai-item-label">Sentiment</div>
              <span class="badge badge-${complaint.aiAnalysis.sentiment.toLowerCase()}">${complaint.aiAnalysis.sentiment}</span>
            </div>
            <div class="ai-item">
              <div class="ai-item-label">Priority</div>
              <span class="badge badge-${complaint.aiAnalysis.priority.toLowerCase()}">${complaint.aiAnalysis.priority}</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    resultCard.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    showToast(error.message, 'error');
    resultCard.style.display = 'none';
  } finally {
    btn.disabled = false;
    btn.textContent = '🔍 Track';
  }
}
