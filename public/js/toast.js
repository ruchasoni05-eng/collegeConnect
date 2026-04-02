// ============================================
// Toast Notification System
// Shows animated success/error/warning toasts
// ============================================

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', or 'warning'
 * @param {number} duration - How long to show (ms), default 4000
 */
function showToast(message, type = 'success', duration = 4000) {
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Choose icon based on type
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💬'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}
