// ============================================
// Analytics Dashboard Script
// Fetches analytics data and renders Chart.js charts
// ============================================

// Color palette for charts
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

const CHART_COLORS = [
  '#6366f1', '#10b981', '#ef4444', '#f59e0b',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];
 
// Global Chart.js Defaults for premium look
Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(22, 22, 38, 0.9)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 20;

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check — must be admin or superadmin
  const currentUser = getUser();
  if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role)) {
    window.location.replace('/admin-login.html');
    return;
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  await loadAnalytics();
});

/**
 * Fetch analytics data and render all charts
 */
async function loadAnalytics() {
  try {
    const data = await apiRequest('/analytics');

    // Update stat cards
    document.getElementById('stat-total').textContent = data.totals.total;
    document.getElementById('stat-pending').textContent = data.totals.pending;
    document.getElementById('stat-review').textContent = data.totals.inReview;
    document.getElementById('stat-resolved').textContent = data.totals.resolved;

    // Render charts
    renderMonthlyChart(data.monthlyTrends);
    renderDepartmentChart(data.departmentStats);
    renderCategoryChart(data.categoryStats);
    renderSentimentChart(data.sentimentStats);
    renderStatusChart(data.totals);
    renderPriorityChart(data.priorityStats);
  } catch (error) {
    showToast('Failed to load analytics: ' + error.message, 'error');
  }
}

/**
 * Monthly Trends — Line Chart
 */
function renderMonthlyChart(trends) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labels = trends.map(t => `${months[t._id.month - 1]} ${t._id.year}`);
  const values = trends.map(t => t.count);

  new Chart(document.getElementById('monthlyChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Complaints',
        data: values,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '20',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: COLORS.primary,
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)', borderColor: 'transparent' }
        },
        x: {
          grid: { display: false, borderColor: 'transparent' }
        }
      }
    }
  });
}

/**
 * Department-wise — Bar Chart
 */
function renderDepartmentChart(stats) {
  new Chart(document.getElementById('departmentChart'), {
    type: 'bar',
    data: {
      labels: stats.map(s => s._id || 'Unknown'),
      datasets: [{
        label: 'Complaints',
        data: stats.map(s => s.count),
        backgroundColor: CHART_COLORS.slice(0, stats.length),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)', borderColor: 'transparent' }
        },
        x: {
          grid: { display: false, borderColor: 'transparent' }
        }
      }
    }
  });
}

/**
 * Category Distribution — Doughnut Chart
 */
function renderCategoryChart(stats) {
  new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: stats.map(s => s._id || 'Unknown'),
      datasets: [{
        data: stats.map(s => s.count),
        backgroundColor: [COLORS.primary, COLORS.danger, COLORS.warning],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

/**
 * Sentiment Analysis — Pie Chart
 */
function renderSentimentChart(stats) {
  const colorMap = { Positive: COLORS.success, Neutral: '#94a3b8', Negative: COLORS.danger };

  new Chart(document.getElementById('sentimentChart'), {
    type: 'pie',
    data: {
      labels: stats.map(s => s._id || 'Unknown'),
      datasets: [{
        data: stats.map(s => s.count),
        backgroundColor: stats.map(s => colorMap[s._id] || '#94a3b8'),
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

/**
 * Status Breakdown — Doughnut Chart
 */
function renderStatusChart(totals) {
  new Chart(document.getElementById('statusChart'), {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'In Review', 'Resolved'],
      datasets: [{
        data: [totals.pending, totals.inReview, totals.resolved],
        backgroundColor: [COLORS.warning, COLORS.info, COLORS.success],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

/**
 * Priority Distribution — Bar Chart
 */
function renderPriorityChart(stats) {
  const colorMap = { High: COLORS.danger, Medium: COLORS.warning, Low: COLORS.success };

  new Chart(document.getElementById('priorityChart'), {
    type: 'bar',
    data: {
      labels: stats.map(s => s._id || 'Unknown'),
      datasets: [{
        label: 'Complaints',
        data: stats.map(s => s.count),
        backgroundColor: stats.map(s => colorMap[s._id] || '#94a3b8'),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)', borderColor: 'transparent' }
        },
        x: {
          grid: { display: false, borderColor: 'transparent' }
        }
      }
    }
  });
}
