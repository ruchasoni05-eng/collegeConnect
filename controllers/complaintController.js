// ============================================
// Complaint Controller
// Handles CRUD operations for complaints,
// complaint tracking, upvotes, and status updates
// ============================================

const Complaint = require('../models/Complaint');
const { analyzeText } = require('../utils/aiAnalysis');

/**
 * Generate a unique complaint ID like "CMP-A1B2C3"
 */
function generateComplaintId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'CMP-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Submit a new complaint/feedback/suggestion
 * POST /api/complaints
 */
exports.createComplaint = async (req, res) => {
  try {
    const { category, subject, message, anonymous, department, location } = req.body;

    // Generate unique complaint ID
    let complaintId = generateComplaintId();
    // Make sure it's unique (extremely rare collision)
    while (await Complaint.findOne({ complaintId })) {
      complaintId = generateComplaintId();
    }

    // Run AI analysis on the message text
    const aiAnalysis = analyzeText(message);

    // Create the complaint document
    const complaint = await Complaint.create({
      complaintId,
      student: anonymous ? null : req.user.id,
      category,
      subject,
      message,
      anonymous: anonymous || false,
      department: department || 'General',
      location: location || null,
      aiAnalysis
    });

    res.status(201).json({
      message: 'Complaint submitted successfully!',
      complaint: {
        complaintId: complaint.complaintId,
        category: complaint.category,
        subject: complaint.subject,
        status: complaint.status,
        aiAnalysis: complaint.aiAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit complaint.', error: error.message });
  }
};

/**
 * Get all complaints (public view)
 * GET /api/complaints
 * Supports query params: ?status=Pending&department=CS&search=keyword&category=Feedback
 */
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, department, search, category } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('student', 'name studentId department')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints.', error: error.message });
  }
};

/**
 * Get complaints for the logged-in student
 * GET /api/complaints/my
 */
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your complaints.', error: error.message });
  }
};

/**
 * Track a complaint by its unique complaint ID
 * GET /api/complaints/track/:complaintId
 */
exports.trackComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId })
      .populate('student', 'name department');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found with this tracking ID.' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to track complaint.', error: error.message });
  }
};

/**
 * Update complaint status (Admin only)
 * PUT /api/complaints/:id/status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'In Review', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    res.json({ message: `Status updated to "${status}".`, complaint });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status.', error: error.message });
  }
};

/**
 * Delete a complaint (Admin only)
 * DELETE /api/complaints/:id
 */
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    res.json({ message: 'Complaint deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete complaint.', error: error.message });
  }
};

/**
 * Toggle vote (upvote/downvote) on a complaint
 * POST /api/complaints/:id/vote
 * Expects { voteType: 'up' | 'down' } in body
 */
exports.voteComplaint = async (req, res) => {
  try {
    const { voteType } = req.body;
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ message: "Invalid voteType. Must be 'up' or 'down'." });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const userId = req.user.id;
    
    // Arrays for upvotes and downvotes
    const upIndex = complaint.upvotes.indexOf(userId);
    const downIndex = complaint.downvotes.indexOf(userId);

    let message = '';

    if (voteType === 'up') {
      if (upIndex > -1) {
        // Already upvoted — remove upvote
        complaint.upvotes.splice(upIndex, 1);
        message = 'Upvote removed.';
      } else {
        // Add upvote
        complaint.upvotes.push(userId);
        message = 'Upvoted!';
        // Remove downvote if it exists
        if (downIndex > -1) complaint.downvotes.splice(downIndex, 1);
      }
    } else if (voteType === 'down') {
      if (downIndex > -1) {
        // Already downvoted — remove downvote
        complaint.downvotes.splice(downIndex, 1);
        message = 'Downvote removed.';
      } else {
        // Add downvote
        complaint.downvotes.push(userId);
        message = 'Downvoted.';
        // Remove upvote if it exists
        if (upIndex > -1) complaint.upvotes.splice(upIndex, 1);
      }
    }

    await complaint.save();

    res.json({
      message,
      upvoteCount: complaint.upvotes.length,
      downvoteCount: complaint.downvotes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process vote.', error: error.message });
  }
};
