// ============================================
// Auth Routes
// Student registration, login, and admin login
// ============================================

const express = require('express');
const router = express.Router();
const { register, login, adminLogin } = require('../controllers/authController');

// POST /api/auth/register - Register a new student
router.post('/register', register);

// POST /api/auth/login - Student login
router.post('/login', login);

// POST /api/auth/admin-login - Admin login
router.post('/admin-login', adminLogin);

// POST /api/auth/admin-register - Admin registration
const { adminRegister } = require('../controllers/authController');
router.post('/admin-register', adminRegister);

module.exports = router;
