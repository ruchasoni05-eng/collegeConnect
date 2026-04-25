// ============================================
// Clubs Script
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

  await loadClubs();
});

async function loadClubs() {
  try {
    const clubs = await apiRequest('/clubs');
    const container = document.getElementById('clubs-list');
    
    if (clubs.length === 0) {
      container.innerHTML = '<div style="grid-column: span 3;"><p>No clubs active currently.</p></div>';
      return;
    }

    container.innerHTML = clubs.map(club => {
      let actionBtn = '';
      if (isLoggedIn() && !isAdmin()) {
        if (club.membershipStatus === 'pending') {
          actionBtn = '<button class="btn btn-outline" disabled>Request Pending ⏳</button>';
        } else if (club.membershipStatus === 'approved') {
          actionBtn = '<button class="btn btn-primary" onclick="openClubChat()">Chat & Events Unlocked</button>';
        } else {
          actionBtn = `<button class="btn btn-primary" onclick="joinClub('${club._id}')">Join Club</button>`;
        }
      } else if (!isLoggedIn()) {
        actionBtn = '<a href="/login.html" class="btn btn-primary">Login to Join</a>';
      }

      return `
        <div class="card feature-card">
          <div class="feature-icon">🎭</div>
          <h3>${club.name}</h3>
          <p>${club.description}</p>
          <div style="margin-top: 16px;">
            ${actionBtn}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    showToast('Failed to load clubs', 'error');
  }
}

async function joinClub(clubId) {
  try {
    const res = await apiRequest('/clubs/request-join', 'POST', { clubId });
    showToast('Join request sent!', 'success');
    loadClubs();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openClubChat() {
  showToast('Club Chat Feature Coming Soon!', 'info');
}
