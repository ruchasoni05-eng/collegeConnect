// ============================================
// Admin Model
// Stores admin credentials and role
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Admin username
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  // Hashed password
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  // Admin role (for future role-based access)
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin']
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
