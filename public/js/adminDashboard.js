// ============================================
// Admin Dashboard Script
// Loads complaints table with filters,
// handles status updates, deletions, and announcements
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check — must be admin
  if (!isAdmin()) {
    window.location.href = '/admin-login.html';
    return;
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Announcement form handler
  const annForm = document.getElementById('announcement-form');
  annForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('ann-title').value.trim();
    const message = document.getElementById('ann-message').value.trim();

    if (!title || !message) {
      showToast('Please fill in both fields.', 'error');
      return;
    }

    try {
      await apiRequest('/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, message })
      });
      showToast('Announcement posted!', 'success');
      annForm.reset();
      toggleAnnouncementForm();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  // Search on Enter key
  document.getElementById('search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadComplaints();
  });

  // Load complaints
  await loadComplaints();
});

/**
 * Toggle the announcement form visibility
 */
function toggleAnnouncementForm() {
  const card = document.getElementById('announcement-form-card');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

/**
 * Load complaints with current filters
 */
async function loadComplaints() {
  const tbody = document.getElementById('complaints-table');
  const search = document.getElementById('search').value.trim();
  const status = document.getElementById('filter-status').value;
  const category = document.getElementById('filter-category').value;
  const department = document.getElementById('filter-department').value;

  // Build query string
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  if (department) params.set('department', department);

  try {
    const complaints = await apiRequest(`/complaints?${params.toString()}`);

    if (complaints.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="11" class="text-center" style="padding: 40px;">
          <div class="empty-state-icon">📭</div>
          <p>No complaints found.</p>
        </td></tr>
      `;
      return;
    }

    tbody.innerHTML = complaints.map(c => {
      const studentName = c.anonymous
        ? '<span style="color: var(--text-muted);">🕶️ Anonymous</span>'
        : (c.student ? c.student.name : 'N/A');

      return `
        <tr>
          <td><span class="complaint-id">${c.complaintId}</span></td>
          <td>${studentName}</td>
          <td style="font-size: 0.8rem;">${c.department}</td>
          <td><span class="badge badge-${c.category.toLowerCase()}">${c.category}</span></td>
          <td class="truncate" title="${c.subject}">${c.subject}</td>
          <td><span class="badge badge-${(c.aiAnalysis?.sentiment || 'neutral').toLowerCase()}">${c.aiAnalysis?.sentiment || 'N/A'}</span></td>
          <td><span class="badge badge-${(c.aiAnalysis?.priority || 'medium').toLowerCase()}">${c.aiAnalysis?.priority || 'N/A'}</span></td>
          <td style="text-align: center;">👍 ${c.upvotes.length}</td>
          <td style="font-size: 0.8rem; white-space: nowrap;">${formatDate(c.createdAt)}</td>
          <td>
            <select class="form-control" style="padding: 6px 8px; font-size: 0.8rem; min-width: 110px;"
              onchange="updateStatus('${c._id}', this.value)">
              <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="In Review" ${c.status === 'In Review' ? 'selected' : ''}>🔍 In Review</option>
              <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
            </select>
          </td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deleteComplaint('${c._id}')" title="Delete">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    tbody.innerHTML = `
      <tr><td colspan="11" class="text-center" style="padding: 40px; color: var(--danger);">
        ⚠️ Error: ${error.message}
      </td></tr>
    `;
  }
}

/**
 * Update complaint status
 */
async function updateStatus(id, status) {
  try {
    await apiRequest(`/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    showToast(`Status updated to "${status}"`, 'success');
  } catch (error) {
    showToast(error.message, 'error');
    await loadComplaints(); // Revert on error
  }
}

/**
 * Delete a complaint
 */
async function deleteComplaint(id) {
  if (!confirm('Are you sure you want to delete this complaint?')) return;

  try {
    await apiRequest(`/complaints/${id}`, { method: 'DELETE' });
    showToast('Complaint deleted.', 'success');
    await loadComplaints();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
