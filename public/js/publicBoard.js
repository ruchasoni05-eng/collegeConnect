// ============================================
// Public Board Script
// Loads all complaints and handles upvotes/downvotes
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Search on Enter key
  document.getElementById('search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadPublicComplaints();
  });

  await loadPublicComplaints();
});

/**
 * Load complaints with active filters
 */
async function loadPublicComplaints() {
  const container = document.getElementById('public-complaints-list');
  const search = document.getElementById('search').value.trim();
  const category = document.getElementById('filter-category').value;
  const department = document.getElementById('filter-department').value;

  // We only show complaints that aren't resolved or maybe all, but let's show all by default
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (department) params.set('department', department);

  try {
    const complaints = await apiRequest(`/complaints?${params.toString()}`);

    if (complaints.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">📭</div>
          <h3>No records found</h3>
          <p>No complaints match your filters.</p>
        </div>
      `;
      return;
    }

    const currentUser = getUser();
    const currentUserId = currentUser ? currentUser.id : null;

    container.innerHTML = complaints.map(c => {
      // Determine if current user has voted
      const hasUpvoted = currentUserId && c.upvotes && c.upvotes.includes(currentUserId);
      const hasDownvoted = currentUserId && c.downvotes && c.downvotes.includes(currentUserId);

      const upvotesCount = c.upvotes ? c.upvotes.length : 0;
      const downvotesCount = c.downvotes ? c.downvotes.length : 0;

      const studentName = c.anonymous
        ? '🕶️ Anonymous Student'
        : (c.student ? `👤 ${c.student.name}` : 'Unknown Student');

      return `
        <div class="complaint-card">
          <div class="complaint-meta">
            <span class="complaint-id">${c.complaintId}</span>
            <span class="badge badge-${c.category.toLowerCase()}">${c.category}</span>
            <span class="badge badge-${c.status === 'Pending' ? 'pending' : c.status === 'In Review' ? 'review' : 'resolved'}">${c.status}</span>
          </div>
          <h3>${c.subject}</h3>
          <p>${c.message.length > 200 ? c.message.substring(0, 200) + '...' : c.message}</p>
          
          <div class="complaint-footer">
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              <div>${studentName}</div>
              <div style="margin-top: 4px;">📅 ${formatDate(c.createdAt)} | 🏢 ${c.department}</div>
            </div>
            
            <div class="vote-container">
              <button class="upvote-btn ${hasUpvoted ? 'active' : ''}" onclick="vote('${c._id}', 'up')" title="Like">
                👍 <span id="up-count-${c._id}">${upvotesCount}</span>
              </button>
              <button class="upvote-btn ${hasDownvoted ? 'active' : ''}" onclick="vote('${c._id}', 'down')" style="border-radius: 20px; padding: 6px 14px;" title="Dislike">
                👎 <span id="down-count-${c._id}">${downvotesCount}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">⚠️</div>
        <h3>Error loading public board</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

/**
 * Handle Voting (Like/Dislike)
 */
async function vote(complaintId, voteType) {
  if (!isLoggedIn()) {
    showToast('Please login to vote.', 'warning');
    return;
  }

  try {
    const data = await apiRequest(`/complaints/${complaintId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType })
    });

    // Don't completely reload the page just to show vote change,
    // Just refresh the entire board to make logic cleaner 
    await loadPublicComplaints();

  } catch (error) {
    showToast(error.message, 'error');
  }
}
