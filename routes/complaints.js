// ============================================
// Complaint Routes
// CRUD, tracking, upvoting, and status updates
// ============================================

const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  trackComplaint,
  updateStatus,
  deleteComplaint,
  voteComplaint
} = require('../controllers/complaintController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// POST /api/complaints - Submit a new complaint (auth required)
router.post('/', authMiddleware, createComplaint);

// GET /api/complaints - Get all complaints (public)
router.get('/', getAllComplaints);

// GET /api/complaints/my - Get logged-in student's complaints
router.get('/my', authMiddleware, getMyComplaints);

// GET /api/complaints/track/:complaintId - Track complaint by ID (public)
router.get('/track/:complaintId', trackComplaint);

// PUT /api/complaints/:id/status - Update status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, updateStatus);

// DELETE /api/complaints/:id - Delete complaint (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteComplaint);

// POST /api/complaints/:id/vote - Toggle vote (auth required)
router.post('/:id/vote', authMiddleware, voteComplaint);

module.exports = router;
