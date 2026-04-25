// ============================================
// Announcement Controller
// Admin creates announcements shown on homepage
// ============================================

const Announcement = require('../models/Announcement');

/**
 * Get all announcements (newest first)
 * GET /api/announcements
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements.', error: error.message });
  }
};

/**
 * Create a new announcement (Admin only)
 * POST /api/announcements
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, clubId, isPinned, targetDepartments } = req.body;
 
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }
 
    const announcement = await Announcement.create({
      title,
      message,
      postedBy: req.user.id,
      clubId: req.user.role === 'club_admin' ? (clubId || null) : null,
      isPinned: isPinned || false,
      targetDepartments: targetDepartments || []
    });
 
    res.status(201).json({
      message: 'Announcement posted!',
      announcement
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement.', error: error.message });
  }
};

/**
 * Delete an announcement (Admin only)
 * DELETE /api/announcements/:id
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    res.json({ message: 'Announcement deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete announcement.', error: error.message });
  }
};
