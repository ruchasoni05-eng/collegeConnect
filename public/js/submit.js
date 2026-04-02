// ============================================
// Submit Page Script
// Handles feedback/complaint submission,
// QR code location auto-fill, and result display
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showToast('Please login to submit feedback.', 'warning');
    setTimeout(() => { window.location.href = '/login.html'; }, 1500);
    return;
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Check for QR code location in URL params
  const params = new URLSearchParams(window.location.search);
  const location = params.get('location');
  if (location) {
    const locationMap = {
      'library': 'Library',
      'canteen': 'Canteen',
      'computer-lab': 'Computer Lab',
      'classroom': 'Classroom',
      'sports': 'Sports Ground',
      'hostel': 'Hostel'
    };
    const locationName = locationMap[location] || location;
    document.getElementById('location').value = locationName;
    document.getElementById('location-group').style.display = 'block';
  }

  // Handle form submission
  const form = document.getElementById('submit-form');
  const btn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const department = document.getElementById('department').value;
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const anonymous = document.getElementById('anonymous').checked;
    const locationVal = document.getElementById('location').value;

    if (!category || !subject || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Submitting...';

    try {
      const data = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          category, department, subject, message, anonymous,
          location: locationVal || null
        })
      });

      showToast('Submitted successfully!', 'success');

      // Show result card with complaint ID and AI analysis
      const resultCard = document.getElementById('result-card');
      const resultContent = document.getElementById('result-content');
      resultCard.style.display = 'block';

      const c = data.complaint;
      resultContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 3rem;">🎉</div>
          <h3 style="margin: 12px 0 4px;">Submitted Successfully!</h3>
          <p style="color: var(--text-secondary);">Save your tracking ID below</p>
        </div>
        <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius); text-align: center; margin-bottom: 16px;">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Tracking ID</div>
          <div style="font-size: 1.5rem; font-weight: 800; font-family: monospace; color: var(--primary);">${c.complaintId}</div>
        </div>
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
      `;

      // Scroll to result
      resultCard.scrollIntoView({ behavior: 'smooth' });

      // Reset form
      form.reset();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🚀 Submit';
    }
  });
});
