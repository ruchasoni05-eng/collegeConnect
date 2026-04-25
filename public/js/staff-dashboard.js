// ============================================
// Staff Dashboard Script
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn()) {
    window.location.replace('/admin-login.html');
    return;
  }

  const user = getUser();
  document.getElementById('welcome-msg').textContent = `👋 Welcome, ${user.username || 'Staff'}!`;
  document.getElementById('role-msg').textContent = `Role: ${user.role.toUpperCase()}`;

  // Reveal tools based on role
  if (user.role === 'admin' || user.role === 'superadmin') {
    document.getElementById('admin-tools').style.display = 'block';
  }
/**
 * Toggle the announcement form visibility
 */
window.toggleAnnouncementForm = function() {
  const card = document.getElementById('announcement-form-card');
  if (card) card.style.display = card.style.display === 'none' ? 'block' : 'none';
}

/**
 * Toggle the Club Modal visibility
 */
window.toggleClubModal = function() {
  const modal = document.getElementById('club-modal');
  if (modal) modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}
  if (user.role === 'faculty' || user.role === 'admin') {
    document.getElementById('faculty-tools').style.display = 'block';
    setupFacultyForm();
  }
  if (user.role === 'club_admin' || user.role === 'admin') {
    document.getElementById('club-tools').style.display = 'block';
    setupClubForm();
    loadClubRequests();
  }
});
 
function setupFacultyForm() {
  const uploadForm = document.getElementById('upload-form');
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('mat-title').value);
    formData.append('subject', document.getElementById('mat-subject').value);
    formData.append('materialFile', document.getElementById('mat-file').files[0]);
 
    try {
      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      showToast('Material uploaded successfully!', 'success');
      uploadForm.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
 
  const annForm = document.getElementById('faculty-ann-form');
  annForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/announcements', 'POST', {
        title: document.getElementById('fa-title').value,
        message: document.getElementById('fa-message').value,
        targetDepartments: [getUser().department]
      });
      showToast('Department notice sent!', 'success');
      annForm.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
 
async function setupClubForm() {
  // Fetch the club owned by this admin
  let myClub = null;
  try {
    const clubs = await apiRequest('/clubs');
    const user = getUser();
    myClub = clubs.find(c => c.adminId === user.id || c.adminId?._id === user.id);
  } catch (err) {}
 
  // Event Form
  const eventForm = document.getElementById('event-form');
  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/events/create', 'POST', {
        title: document.getElementById('ev-title').value,
        date: document.getElementById('ev-date').value,
        description: document.getElementById('ev-desc').value,
        isPublic: document.getElementById('ev-public').checked,
        clubId: myClub ? myClub._id : null
      });
      showToast('Event created successfully!', 'success');
      eventForm.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
 
  // Announcement Form
  const annForm = document.getElementById('club-ann-form');
  annForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/announcements', 'POST', {
        title: document.getElementById('ca-title').value,
        message: document.getElementById('ca-message').value,
        clubId: myClub ? myClub._id : null
      });
      showToast('Club update posted!', 'success');
      annForm.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
 
  // Club Material Form
  const matForm = document.getElementById('club-mat-form');
  matForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('cm-title').value);
    formData.append('subject', document.getElementById('cm-topic').value);
    formData.append('clubId', myClub ? myClub._id : '');
    formData.append('materialFile', document.getElementById('cm-file').files[0]);
 
    try {
      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      showToast('Club resource shared!', 'success');
      matForm.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
 
async function loadClubRequests() {
  try {
    const list = await apiRequest('/clubs/pending-requests');
    const container = document.getElementById('requests-list');
    if (list.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No pending join requests.</p>';
      return;
    }
    
    container.innerHTML = list.map(req => `
      <div style="border: 1px solid var(--border); padding: 16px; border-radius: var(--radius); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);">
        <div>
          <strong style="color: white;">${req.studentId.name}</strong><br>
          <small style="color: var(--text-muted);">Dept: ${req.studentId.department} | ID: ${req.studentId.studentId}</small>
        </div>
        <div class="d-flex gap-8">
          <button class="btn btn-primary btn-sm" onclick="window.handleRequest('${req._id}', 'approved')">Accept</button>
          <button class="btn btn-outline btn-sm" style="border-color: var(--danger); color: var(--danger);" onclick="window.handleRequest('${req._id}', 'rejected')">Decline</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    document.getElementById('requests-list').innerHTML = '<p>Failed to load requests.</p>';
  }
}
 
window.handleRequest = async function(id, status) {
  try {
    await apiRequest('/clubs/request-status', 'PUT', { requestId: id, status });
    showToast(`Request ${status}!`, 'success');
    loadClubRequests(); 
  } catch (err) {
    showToast(err.message, 'error');
  }
}
 
// ============================================
// ATTENDANCE FUNCTIONS
// ============================================
 
window.loadStudentsForAttendance = async function() {
  const subjectEl = document.getElementById('att-subject');
  if (!subjectEl.value.trim()) {
    showToast('Please enter a subject name first.', 'error');
    return;
  }
 
  const container = document.getElementById('attendance-list');
  container.innerHTML = '<p>Loading students...</p>';
 
  try {
    const user = getUser();
    const students = await apiRequest(`/attendance/students?department=${encodeURIComponent(user.department)}`);
 
    if (students.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted);">No students found in your department.</p>';
      return;
    }
 
    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: rgba(255,255,255,0.05);">
            <th style="padding: 10px; text-align: left; font-size: 0.8rem;">STUDENT</th>
            <th style="padding: 10px; text-align: left; font-size: 0.8rem;">ID</th>
            <th style="padding: 10px; text-align: center; font-size: 0.8rem;">STATUS</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr data-student-id="${s._id}" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 10px; font-size: 0.9rem;">${s.name}</td>
              <td style="padding: 10px; font-size: 0.8rem; color: var(--text-muted);">${s.studentId}</td>
              <td style="padding: 10px; text-align: center;">
                <select class="form-control att-status" data-sid="${s._id}" style="padding: 6px 8px; font-size: 0.8rem; min-width: 100px;">
                  <option value="present" selected>✅ Present</option>
                  <option value="absent">❌ Absent</option>
                  <option value="late">⏰ Late</option>
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
 
    document.getElementById('submit-attendance-btn').style.display = 'block';
  } catch (err) {
    container.innerHTML = `<p style="color: var(--danger);">Error: ${err.message}</p>`;
  }
}
 
window.submitAttendance = async function() {
  const subject = document.getElementById('att-subject').value.trim();
  const date = document.getElementById('att-date').value || new Date().toISOString().split('T')[0];
  const user = getUser();
 
  const selects = document.querySelectorAll('.att-status');
  const records = Array.from(selects).map(sel => ({
    student: sel.dataset.sid,
    status: sel.value
  }));
 
  if (records.length === 0) {
    showToast('No students to mark attendance for.', 'error');
    return;
  }
 
  try {
    await apiRequest('/attendance', 'POST', {
      subject,
      date,
      department: user.department,
      records
    });
    showToast('Attendance marked successfully!', 'success');
    document.getElementById('attendance-list').innerHTML = '<p style="color: var(--success);">✅ Attendance saved!</p>';
    document.getElementById('submit-attendance-btn').style.display = 'none';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

