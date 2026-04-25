// ============================================
// Student Dashboard Script
// Fetches Dashboard API and populates Bento Grid
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn() || isAdmin()) {
    window.location.replace('/login.html');
    return;
  }

  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  const user = getUser();
  if (user) {
    document.getElementById('welcome-msg').textContent = `👋 Welcome, ${user.name}!`;
  }

  await loadDashboard();
});

async function loadDashboard() {
  try {
    const data = await apiRequest('/dashboard/student');
    
    // 1. Attendance
    document.getElementById('attendance-val').textContent = `${data.attendance}%`;
    const gauge = document.getElementById('attendance-gauge');
    const color = data.attendance >= 75 ? 'var(--primary-color)' : '#f44336';
    gauge.style.background = `conic-gradient(${color} ${data.attendance}%, transparent 0%)`;

    // 2. Notices
    const noticesContainer = document.getElementById('notices-list');
    if (data.announcements.length === 0) {
      noticesContainer.innerHTML = '<p>No recent notices.</p>';
    } else {
      noticesContainer.innerHTML = data.announcements.map(n => `
        <div class="notice-item">
          <h4>${n.isPinned ? '📌 ' : ''}${n.title}</h4>
          <p>${n.message}</p>
        </div>
      `).join('');
    }

    // 3. Events
    const eventsContainer = document.getElementById('events-list');
    if (data.upcomingEvents.length === 0) {
      eventsContainer.innerHTML = '<p>No upcoming events.</p>';
    } else {
      eventsContainer.innerHTML = data.upcomingEvents.map(e => `
        <div class="event-item">
          <div>
            <strong>${e.title}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(e.date)}</div>
          </div>
          <button class="btn btn-outline" style="padding: 4px 12px;" onclick="registerEvent('${e._id}')">Join</button>
        </div>
      `).join('');
    }

    // 4. Complaints
    const complaintsContainer = document.getElementById('complaints-list');
    if (data.complaints.length === 0) {
      complaintsContainer.innerHTML = '<p>No recent complaints.</p>';
    } else {
      complaintsContainer.innerHTML = data.complaints.map(c => `
        <div class="event-item">
          <div>
            <strong>${c.subject}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${c.complaintId}</div>
          </div>
          <span class="badge badge-${c.status === 'Pending' ? 'pending' : c.status === 'In Review' ? 'review' : 'resolved'}">${c.status}</span>
        </div>
      `).join('');
    }
  } catch (error) {
    showToast('Failed to load dashboard data: ' + error.message, 'error');
  }
}

async function registerEvent(eventId) {
  try {
    const res = await apiRequest(`/events/${eventId}/register`, 'POST');
    showToast(res.message, 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
