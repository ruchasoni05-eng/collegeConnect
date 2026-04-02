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

module.exports = router;
