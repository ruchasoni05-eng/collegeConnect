// ============================================
// Analytics Controller
// Provides statistics for the admin dashboard
// ============================================

const Complaint = require('../models/Complaint');

/**
 * Get analytics data for the dashboard
 * GET /api/analytics
 * Returns: totals, department breakdown, monthly trends, category/status/sentiment/priority breakdowns
 */
exports.getAnalytics = async (req, res) => {
  try {
    // --- Overall Totals ---
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inReview = await Complaint.countDocuments({ status: 'In Review' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });

    // --- Department-wise breakdown ---
    const departmentStats = await Complaint.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // --- Category breakdown ---
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // --- Monthly trends (last 12 months) ---
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrends = await Complaint.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // --- Sentiment breakdown ---
    const sentimentStats = await Complaint.aggregate([
      { $group: { _id: '$aiAnalysis.sentiment', count: { $sum: 1 } } }
    ]);

    // --- Priority breakdown ---
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$aiAnalysis.priority', count: { $sum: 1 } } }
    ]);

    res.json({
      totals: { total, pending, inReview, resolved },
      departmentStats,
      categoryStats,
      monthlyTrends,
      sentimentStats,
      priorityStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics.', error: error.message });
  }
};
