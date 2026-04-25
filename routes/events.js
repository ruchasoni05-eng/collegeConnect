const express = require('express');
const router = express.Router();
const { getEvents, createEvent, registerEvent } = require('../controllers/eventsController');
const { authMiddleware, anyStaffMiddleware } = require('../middleware/auth');

// All logged in users
router.get('/', authMiddleware, getEvents);
router.post('/:eventId/register', authMiddleware, registerEvent);

// Staff only
router.post('/create', authMiddleware, anyStaffMiddleware, createEvent);

module.exports = router;
