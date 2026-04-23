// ============================================
// Home Page Script
// Loads announcements and generates QR codes
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Load announcements
  await loadAnnouncements();
  // Generate QR codes
  generateQRCodes();
  
  // Initialize Scroll Revel Observer
  initScrollObserver();
});

/**
 * Initialize Intersection Observer for scroll animations
 */
function initScrollObserver() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Select all items that should animate on scroll, including dynamically loaded ones
  const revealElements = document.querySelectorAll('.scroll-reveal');
  revealElements.forEach(el => observer.observe(el));
}

/**
 * Fetch and display announcements from the API
 */
async function loadAnnouncements() {
  const container = document.getElementById('announcements-list');
  try {
    const announcements = await apiRequest('/announcements');

    if (announcements.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📢</div>
          <h3>No announcements yet</h3>
          <p>Check back later for updates!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = announcements.map((a, index) => `
      <div class="announcement-card scroll-reveal" style="transition-delay: ${index * 100}ms;">
        <h3>${a.title}</h3>
        <p>${a.message}</p>
        <div class="announcement-date">${formatDate(a.createdAt)}</div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Could not load announcements</h3>
        <p>Please make sure the server is running.</p>
      </div>
    `;
  }
}

/**
 * Generate QR codes for different campus locations.
 * Uses a simple QR code generation via an external API.
 */
function generateQRCodes() {
  const container = document.getElementById('qr-codes');
  const locations = [
    { name: 'Library', emoji: '📚', id: 'library' },
    { name: 'Canteen', emoji: '🍽️', id: 'canteen' },
    { name: 'Computer Lab', emoji: '💻', id: 'computer-lab' },
    { name: 'Classroom', emoji: '🏫', id: 'classroom' },
    { name: 'Sports Ground', emoji: '⚽', id: 'sports' },
    { name: 'Hostel', emoji: '🏠', id: 'hostel' }
  ];

  // Build the base URL for QR codes (points to submit page with location pre-filled)
  const baseUrl = window.location.origin + '/submit.html?location=';

  container.innerHTML = locations.map((loc, index) => {
    // Use a free QR code API for generation
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(baseUrl + loc.id)}&bgcolor=15162b&color=7b5cff`;
    return `
      <div class="card qr-card scroll-reveal" style="transition-delay: ${index * 100}ms;">
        <div class="feature-icon">${loc.emoji}</div>
        <h4>${loc.name}</h4>
        <img src="${qrUrl}" alt="QR Code for ${loc.name}" width="150" height="150" loading="lazy" style="filter: drop-shadow(0 0 10px rgba(123, 92, 255, 0.4)); padding: 8px; background: rgba(22, 22, 38, 0.8);">
        <p>Scan to submit feedback</p>
      </div>
    `;
  }).join('');
  
  // Re-run observer assignment since these were rendered dynamically
  setTimeout(() => initScrollObserver(), 100);
}
