// ============================================
// Announcement Routes
// Admin-managed announcements
// ============================================

const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { authMiddleware, adminMiddleware, anyStaffMiddleware } = require('../middleware/auth');

// GET /api/announcements - Get all announcements (public)
router.get('/', getAnnouncements);

// POST /api/announcements - Create announcement (any staff)
router.post('/', authMiddleware, anyStaffMiddleware, createAnnouncement);

// DELETE /api/announcements/:id - Delete announcement (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteAnnouncement);

module.exports = router;
