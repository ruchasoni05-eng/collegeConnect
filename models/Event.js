// ============================================
// Event Model
// Events created by club or event admins
// ============================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
    // Optional. If null, it's a general college event.
  },
  isPublic: {
    type: Boolean,
    default: false
    // If true, non-members can see and register. If false, membership is required.
  },
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
