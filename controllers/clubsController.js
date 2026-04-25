// ============================================
// Clubs Controller
// ============================================

const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');

// Get all clubs
exports.getClubs = async (req, res) => {
  try {
    const clubs = await Club.find().populate('adminId', 'username');
    
    // If student is logged in, attach their membership status
    let responseData = clubs.map(c => ({...c._doc}));
    
    if (req.user && req.user.role === 'student') {
      for (let i = 0; i < responseData.length; i++) {
        const membership = await ClubMembership.findOne({ clubId: responseData[i]._id, studentId: req.user.id });
        responseData[i].membershipStatus = membership ? membership.status : null;
      }
    }
    
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
};

// Create a club (Admin only for now, or SuperAdmin)
exports.createClub = async (req, res) => {
  try {
    const { name, description, adminId } = req.body;
    const newClub = await Club.create({ name, description, adminId: adminId || req.user.id });
    res.status(201).json(newClub);
  } catch (error) {
    res.status(500).json({ message: 'Error creating club', error: error.message });
  }
};

// Request to join a club (Student)
exports.requestJoin = async (req, res) => {
  try {
    const { clubId } = req.body;
    const existing = await ClubMembership.findOne({ studentId: req.user.id, clubId });
    if (existing) {
      return res.status(400).json({ message: 'Request already exists', status: existing.status });
    }
    const request = await ClubMembership.create({ studentId: req.user.id, clubId, status: 'pending' });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error joining club', error: error.message });
  }
};

// View pending requests (Club Admin)
exports.getPendingRequests = async (req, res) => {
  try {
    // Find clubs managed by this admin
    const clubsManaged = await Club.find({ adminId: req.user.id });
    const clubIds = clubsManaged.map(c => c._id);
    
    const requests = await ClubMembership.find({ clubId: { $in: clubIds }, status: 'pending' })
      .populate('studentId', 'name studentId department')
      .populate('clubId', 'name');
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};

// Approve/Reject request (Club Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body; // status = 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const request = await ClubMembership.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    // Verify admin owns the club
    const club = await Club.findById(request.clubId);
    if (club.adminId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    request.status = status;
    await request.save();
    
    res.json({ message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request', error: error.message });
  }
};
