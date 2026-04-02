// ============================================
// Announcement Model
// Admin-posted announcements shown on homepage
// ============================================

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  // Announcement title
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  // Announcement body message
  message: {
    type: String,
    required: [true, 'Message is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
