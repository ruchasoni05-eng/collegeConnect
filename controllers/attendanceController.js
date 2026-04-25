// ============================================
// Attendance Controller
// Faculty marks and views attendance
// ============================================

const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

/**
 * Get students list for a department (to mark attendance)
 * GET /api/attendance/students?department=...
 */
exports.getStudentsByDept = async (req, res) => {
  try {
    const dept = req.query.department || req.user.department;
    const students = await Student.find({ department: dept }).select('name studentId department').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students.', error: error.message });
  }
};

/**
 * Mark attendance for a class session
 * POST /api/attendance
 * body: { date, subject, department, records: [{ student, status }] }
 */
exports.markAttendance = async (req, res) => {
  try {
    const { date, subject, department, records } = req.body;

    if (!subject || !records || records.length === 0) {
      return res.status(400).json({ message: 'Subject and attendance records are required.' });
    }

    const attendance = await Attendance.create({
      date: date || new Date(),
      subject,
      department: department || req.user.department,
      markedBy: req.user.id,
      records
    });

    res.status(201).json({ message: 'Attendance marked successfully!', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark attendance.', error: error.message });
  }
};

/**
 * Get attendance records with optional filters
 * GET /api/attendance?department=...&subject=...&date=...
 */
exports.getAttendance = async (req, res) => {
  try {
    const { department, subject, date } = req.query;
    const query = {};
    if (department) query.department = department;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    }

    // Faculty sees only their own records; admin sees all
    if (req.user.role === 'faculty') {
      query.markedBy = req.user.id;
    }

    const records = await Attendance.find(query)
      .populate('records.student', 'name studentId')
      .populate('markedBy', 'username')
      .sort({ date: -1 })
      .limit(50);

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance.', error: error.message });
  }
};
