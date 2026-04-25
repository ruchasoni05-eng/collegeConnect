// ============================================
// Club Model
// Info about official college clubs
// ============================================

const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Club description is required']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Club admin is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
