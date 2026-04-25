const express = require('express');
const router = express.Router();
const { getClubs, createClub, requestJoin, getPendingRequests, updateRequestStatus } = require('../controllers/clubsController');
const { authMiddleware, adminMiddleware, clubAdminMiddleware } = require('../middleware/auth');

// Public/Auth routes
router.get('/', authMiddleware, getClubs); // All logged in users
router.post('/request-join', authMiddleware, requestJoin); // Student only implicitly by frontend, but auth secured

// Staff routes
router.post('/', authMiddleware, adminMiddleware, createClub);
router.get('/pending-requests', authMiddleware, clubAdminMiddleware, getPendingRequests);
router.put('/request-status', authMiddleware, clubAdminMiddleware, updateRequestStatus);

module.exports = router;
