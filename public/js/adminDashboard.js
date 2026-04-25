// ============================================
// Admin Dashboard Script
// Loads complaints table with filters,
// handles status updates, deletions, announcements,
// manages clubs, and renders full analytics charts
// ============================================

// Chart color palette
const COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316'
};

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check — must be admin or superadmin
  const currentUser = getUser();
  if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role)) {
    window.location.replace('/admin-login.html');
    return;
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
      await apiRequest('/announcements', 'POST', { title, message });
      showToast('Announcement posted!', 'success');
      annForm.reset();
      toggleAnnouncementForm();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  // Club form handler
  const clubForm = document.getElementById('club-form');
  clubForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('club-name').value.trim();
    const description = document.getElementById('club-desc').value.trim();
    const adminId = document.getElementById('club-admin').value;

    try {
      await apiRequest('/clubs', 'POST', { name, description, adminId });
      showToast('Club created successfully!', 'success');
      clubForm.reset();
      toggleClubModal();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  // Search on Enter key
  document.getElementById('search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadComplaints();
  });

  // Load dashboard data
  await refreshDashboard();
});

/**
 * Main dashboard refresh function
 */
async function refreshDashboard() {
  await loadComplaints();
  await loadAnalyticsSummary();
  await loadClubAdmins();
}

/**
 * Toggle the announcement form visibility
 */
window.toggleAnnouncementForm = function() {
  const card = document.getElementById('announcement-form-card');
  card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

/**
 * Toggle the Club Modal visibility
 */
window.toggleClubModal = function() {
  const modal = document.getElementById('club-modal');
  modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
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
          <td style="text-align: center; font-size: 0.85rem; min-width: 65px;">
            <span style="color:var(--success);">👍 ${c.upvotes ? c.upvotes.length : 0}</span><br>
            <span style="color:var(--danger);">👎 ${c.downvotes ? c.downvotes.length : 0}</span>
          </td>
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
    await apiRequest(`/complaints/${id}/status`, 'PUT', { status });
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

/**
 * Load Analytics Summary and populate ALL 6 charts + 4 stat cards
 */
async function loadAnalyticsSummary() {
  try {
    const data = await apiRequest('/analytics');
    
    // Update Stats Cards
    document.getElementById('stat-total').textContent = data.totals.total;
    document.getElementById('stat-pending').textContent = data.totals.pending;
    document.getElementById('stat-inreview').textContent = data.totals.inReview;
    document.getElementById('stat-resolved').textContent = data.totals.resolved;

    // ---- Chart 1: Monthly Trends (Line) ----
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendLabels = data.monthlyTrends.map(t => `${months[t._id.month - 1]} ${t._id.year}`);
    const trendValues = data.monthlyTrends.map(t => t.count);

    new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [{
          label: 'Complaints',
          data: trendValues,
          borderColor: COLORS.primary,
          backgroundColor: COLORS.primary + '20',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: COLORS.primary,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { display: false } } }
      }
    });

    // ---- Chart 2: Department-wise (Bar) ----
    const CHART_COLORS = [COLORS.primary, COLORS.success, COLORS.danger, COLORS.warning, COLORS.info, COLORS.purple, COLORS.pink, COLORS.teal, COLORS.orange];

    new Chart(document.getElementById('deptChart'), {
      type: 'bar',
      data: {
        labels: data.departmentStats.map(s => s._id || 'Unknown'),
        datasets: [{
          label: 'Complaints',
          data: data.departmentStats.map(s => s.count),
          backgroundColor: CHART_COLORS.slice(0, data.departmentStats.length),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { display: false } } }
      }
    });

    // ---- Chart 3: Category Distribution (Doughnut) ----
    new Chart(document.getElementById('categoryChart'), {
      type: 'doughnut',
      data: {
        labels: data.categoryStats.map(s => s._id || 'Unknown'),
        datasets: [{
          data: data.categoryStats.map(s => s.count),
          backgroundColor: [COLORS.primary, COLORS.danger, COLORS.warning],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.8)', padding: 16 } } } }
    });

    // ---- Chart 4: Sentiment Analysis (Pie) ----
    const sentimentColorMap = { Positive: COLORS.success, Neutral: '#94a3b8', Negative: COLORS.danger };
    new Chart(document.getElementById('sentimentChart'), {
      type: 'pie',
      data: {
        labels: data.sentimentStats.map(s => s._id || 'Unknown'),
        datasets: [{
          data: data.sentimentStats.map(s => s.count),
          backgroundColor: data.sentimentStats.map(s => sentimentColorMap[s._id] || '#94a3b8'),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.8)', padding: 16 } } } }
    });

    // ---- Chart 5: Status Breakdown (Doughnut) ----
    new Chart(document.getElementById('statusChart'), {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Review', 'Resolved'],
        datasets: [{
          data: [data.totals.pending, data.totals.inReview, data.totals.resolved],
          backgroundColor: [COLORS.warning, COLORS.info, COLORS.success],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.8)', padding: 16 } } } }
    });

    // ---- Chart 6: Priority Distribution (Bar) ----
    const priorityColorMap = { High: COLORS.danger, Medium: COLORS.warning, Low: COLORS.success };
    new Chart(document.getElementById('priorityChart'), {
      type: 'bar',
      data: {
        labels: data.priorityStats.map(s => s._id || 'Unknown'),
        datasets: [{
          label: 'Complaints',
          data: data.priorityStats.map(s => s.count),
          backgroundColor: data.priorityStats.map(s => priorityColorMap[s._id] || '#94a3b8'),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { display: false } } }
      }
    });

  } catch (err) {
    console.error('Analytics load failed', err);
  }
}

/**
 * Load list of club admins for the assignment dropdown
 */
async function loadClubAdmins() {
  try {
    const admins = await apiRequest('/auth/staff?role=club_admin');
    const select = document.getElementById('club-admin');
    
    if (admins.length === 0) {
      select.innerHTML = '<option value="">No Club Admins found. Register one first.</option>';
      return;
    }

    select.innerHTML = '<option value="">-- Select Admin --</option>' + 
      admins.map(a => `<option value="${a._id}">${a.username}</option>`).join('');
  } catch (err) {
    showToast('Failed to load staff list', 'error');
  }
}
