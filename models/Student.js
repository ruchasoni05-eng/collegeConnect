// ============================================
// Student Model
// Stores registered student information
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  // Full name of the student
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  // Unique student ID (e.g., roll number)
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  },
  // Department the student belongs to
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other']
  },
  // Student email address
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  // Hashed password
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Hash password before saving to database
studentSchema.pre('save', async function(next) {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with stored hash
studentSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
