// ============================================
// Analytics Routes
// Dashboard statistics for admin
// ============================================

const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/analytics - Get dashboard analytics (admin only)
router.get('/', authMiddleware, adminMiddleware, getAnalytics);

module.exports = router;
