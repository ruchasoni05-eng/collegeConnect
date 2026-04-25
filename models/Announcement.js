// ============================================
// Announcement Model
// Admin-posted announcements shown on homepage
// ============================================

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  targetDepartments: {
    type: [String],
    default: [] // Empty means all departments
  },
  targetYears: {
    type: [String],
    default: [] // Empty means all years
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
