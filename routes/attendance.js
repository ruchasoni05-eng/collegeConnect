// ============================================
// Attendance Routes
// Faculty-managed attendance
// ============================================

const express = require('express');
const router = express.Router();
const { getStudentsByDept, markAttendance, getAttendance } = require('../controllers/attendanceController');
const { authMiddleware, facultyMiddleware } = require('../middleware/auth');

// Get students by department (for attendance form)
router.get('/students', authMiddleware, facultyMiddleware, getStudentsByDept);

// Mark attendance
router.post('/', authMiddleware, facultyMiddleware, markAttendance);

// Get attendance records
router.get('/', authMiddleware, facultyMiddleware, getAttendance);

module.exports = router;
