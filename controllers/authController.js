// ============================================
// Auth Controller
// Handles student registration, login, and admin login
// ============================================

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

/**
 * Register a new student
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, studentId, department, email, password } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }]
    });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email or ID already exists.' });
    }

    // Create new student (password is hashed by the model pre-save hook)
    const student = await Student.create({ name, studentId, department, email, password });

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, studentId: student.studentId, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

/**
 * Student login
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, studentId: student.studentId, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

/**
 * Admin login
 * POST /api/auth/admin-login
 */
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Compare passwords
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Generate JWT token with admin role
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful!',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Admin login failed.', error: error.message });
  }
};
