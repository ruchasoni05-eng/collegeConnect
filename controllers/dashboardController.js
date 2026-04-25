// ============================================
// Dashboard Controller
// ============================================

const Complaint = require('../models/Complaint');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const ClubMembership = require('../models/ClubMembership');

// Get student dashboard summary
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const department = req.user.department;
    // Assume studentId holds logic or we just query by ref
    
    // 1. Pending Complaints Status
    const complaints = await Complaint.find({ studentId: userId }).sort({ createdAt: -1 }).limit(5);
    
    // 2. Announcements for their department
    const announcements = await Announcement.find({
      $or: [
        { targetDepartments: { $size: 0 } }, // global
        { targetDepartments: department }
      ]
    }).sort({ isPinned: -1, createdAt: -1 }).limit(5);
    
    // 3. Upcoming Events they are registered for, or available to them
    // Allowed clubs:
    const memberships = await ClubMembership.find({ studentId: userId, status: 'approved' });
    const allowedClubIds = memberships.map(m => m.clubId);
    
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
      $or: [
        { isPublic: true },
        { clubId: null },
        { clubId: { $in: allowedClubIds } }
      ]
    }).sort({ date: 1 }).limit(5);
    
    // 4. Mock Attendance
    // In a real app this would query an Attendance table. 
    // Here we derive a stable mock value based on student ID to be consistent.
    const mockAttendance = 75 + (parseInt(userId.toString().slice(-4), 16) % 25); 

    res.json({
      complaints,
      announcements,
      upcomingEvents,
      attendance: mockAttendance,
      memberships
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};
