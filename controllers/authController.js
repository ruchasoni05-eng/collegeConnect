// ============================================
// Auth Controller
// Separated auth logic for Student, Admin, Faculty, Club Admin
// ============================================

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const User = require('../models/User');

// --- Helper Functions ---
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// =============================================
// STUDENT AUTHENTICATION
// =============================================

exports.studentRegister = async (req, res) => {
  try {
    const { name, studentId, department, email, password } = req.body;
    const existingStudent = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (existingStudent) return res.status(400).json({ message: 'Student with this email or ID already exists.' });

    const student = await Student.create({ name, studentId, department, email, password });
    const token = generateToken({ id: student._id, studentId: student.studentId, role: 'student' });

    res.status(201).json({ message: 'Registration successful!', token, student: { id: student._id, name: student.name, studentId: student.studentId, department: student.department, email: student.email } });
  } catch (error) { res.status(500).json({ message: 'Registration failed.', error: error.message }); }
};

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await student.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = generateToken({ id: student._id, studentId: student.studentId, role: 'student', department: student.department });
    res.json({ message: 'Login successful!', token, student: { id: student._id, name: student.name, studentId: student.studentId, department: student.department, email: student.email } });
  } catch (error) { res.status(500).json({ message: 'Login failed.', error: error.message }); }
};

// =============================================
// STAFF AUTHENTICATION HELPER
// =============================================
const handleStaffRegister = async (req, res, targetRole) => {
  try {
    const { username, password, department, secretKey } = req.body;

    // Each role has its own secret key
    let expectedKey;
    if (targetRole === 'admin') expectedKey = process.env.ADMIN_SECRET_KEY;
    else if (targetRole === 'faculty') expectedKey = process.env.FACULTY_SECRET_KEY;
    else if (targetRole === 'club_admin') expectedKey = process.env.CLUB_ADMIN_SECRET_KEY;
    else expectedKey = process.env.ADMIN_SECRET_KEY;

    if (secretKey !== expectedKey) return res.status(403).json({ message: 'Invalid secret key.' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Staff with this username already exists.' });

    const user = await User.create({ username, password, role: targetRole, department: targetRole === 'faculty' ? department : 'General' });
    const token = generateToken({ id: user._id, username: user.username, role: user.role, department: user.department });

    res.status(201).json({ message: `${targetRole} registration successful!`, token, user: { id: user._id, username: user.username, role: user.role, department: user.department } });
  } catch (error) { res.status(500).json({ message: `${targetRole} registration failed.`, error: error.message }); }
};

const handleStaffLogin = async (req, res, targetRole) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid username or password.' });

    if (user.role !== targetRole && user.role !== 'superadmin') {
      return res.status(403).json({ message: `Access denied. You are not a ${targetRole}.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password.' });

    const token = generateToken({ id: user._id, username: user.username, role: user.role, department: user.department });
    res.json({ message: `${targetRole} login successful!`, token, user: { id: user._id, username: user.username, role: user.role, department: user.department } });
  } catch (error) { res.status(500).json({ message: `${targetRole} login failed.`, error: error.message }); }
};

// =============================================
// ADMIN
// =============================================
exports.adminRegister = (req, res) => handleStaffRegister(req, res, 'admin');
exports.adminLogin = (req, res) => handleStaffLogin(req, res, 'admin');

// =============================================
// FACULTY
// =============================================
exports.facultyRegister = (req, res) => handleStaffRegister(req, res, 'faculty');
exports.facultyLogin = (req, res) => handleStaffLogin(req, res, 'faculty');

// =============================================
// CLUB ADMIN
// =============================================
exports.clubAdminRegister = (req, res) => handleStaffRegister(req, res, 'club_admin');
exports.clubAdminLogin = (req, res) => handleStaffLogin(req, res, 'club_admin');
 
// =============================================
// STAFF MANAGEMENT (Admin Only)
// =============================================
exports.getStaff = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    
    // Do not return password hashing or sensitive fields
    const staff = await User.find(filter).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff list.', error: error.message });
  }
};
