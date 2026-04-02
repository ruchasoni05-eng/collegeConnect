// ============================================
// Confession Routes
// Anonymous confession wall
// ============================================

const express = require('express');
const router = express.Router();
const { getConfessions, createConfession } = require('../controllers/confessionController');

// GET /api/confessions - Get all confessions
router.get('/', getConfessions);

// POST /api/confessions - Post a new anonymous confession
router.post('/', createConfession);

module.exports = router;
