// ============================================
// Materials Script
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }
  
  if (isAdmin()) {
    document.getElementById('dash-link').href = '/staff-dashboard.html';
  } else if (!isLoggedIn()) {
    document.getElementById('dash-link').style.display = 'none';
  }

  await loadMaterials();
});

async function loadMaterials() {
  try {
    const subject = document.getElementById('subject-filter')?.value || '';
    const endpoint = subject ? `/materials?subject=${subject}` : '/materials';
    const materials = await apiRequest(endpoint);
    
    const container = document.getElementById('materials-list');
    
    if (materials.length === 0) {
      container.innerHTML = '<div style="grid-column: span 3;"><p>No materials found.</p></div>';
      return;
    }

    container.innerHTML = materials.map(mat => `
      <div class="card">
        <h3 style="margin-bottom: 4px;">${mat.title}</h3>
        <p style="margin:0; font-size: 0.9rem; color:var(--primary-color);">${mat.subject}</p>
        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 8px;">By: ${mat.uploadedBy?.username || 'Faculty'} | Dept: ${mat.department}</p>
        <div style="margin-top: 16px;">
          <a href="${mat.fileUrl}" target="_blank" class="btn btn-outline" style="width: 100%; text-align: center;">⬇️ Download</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showToast('Login required to view materials', 'error');
  }
}
