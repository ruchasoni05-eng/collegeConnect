// ============================================
// Confession Controller
// Handles anonymous confession wall
// ============================================

const Confession = require('../models/Confession');

/**
 * Get all confessions (newest first)
 * GET /api/confessions
 */
exports.getConfessions = async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });
    res.json(confessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch confessions.', error: error.message });
  }
};

/**
 * Post a new anonymous confession
 * POST /api/confessions
 */
exports.createConfession = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Confession message is required.' });
    }

    const confession = await Confession.create({ message: message.trim() });

    res.status(201).json({
      message: 'Confession posted anonymously!',
      confession
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to post confession.', error: error.message });
  }
};
