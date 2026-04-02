// ============================================
// Confession Model
// Stores anonymous confessions
// ============================================

const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
  // The confession message text
  message: {
    type: String,
    required: [true, 'Confession message is required'],
    trim: true
  }
}, {
  timestamps: true // createdAt used for display ordering
});

module.exports = mongoose.model('Confession', confessionSchema);
