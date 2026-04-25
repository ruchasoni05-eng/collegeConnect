// ============================================
// Auth Routes
// Separated registration and login for Student, Admin, Faculty, Club Admin
// ============================================

const express = require('express');
const router = express.Router();
const { 
  studentRegister, 
  studentLogin, 
  adminLogin, 
  adminRegister,
  facultyLogin,
  facultyRegister,
  clubAdminLogin,
  clubAdminRegister,
  getStaff
} = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Student
router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);

// Admin
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);

// Faculty
router.post('/faculty/register', facultyRegister);
router.post('/faculty/login', facultyLogin);

// Club Admin
router.post('/club-admin/register', clubAdminRegister);
router.post('/club-admin/login', clubAdminLogin);
 
// Staff Management (Admin only)
router.get('/staff', authMiddleware, adminMiddleware, getStaff);

module.exports = router;
