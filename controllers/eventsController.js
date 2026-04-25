// ============================================
// Events Controller
// ============================================

const Event = require('../models/Event');
const ClubMembership = require('../models/ClubMembership');
const Club = require('../models/Club');

// Get all allowed events
exports.getEvents = async (req, res) => {
  try {
    let allowedClubIds = [];
    
    // If user is a student, fetch clubs they are approved members of
    if (req.user && req.user.role === 'student') {
      const memberships = await ClubMembership.find({ studentId: req.user.id, status: 'approved' });
      allowedClubIds = memberships.map(m => m.clubId);
    }
    
    // Filter logic: Return public events, OR events belonging to allowed clubs
    const query = {
      $or: [
        { isPublic: true },
        { isPublic: false, clubId: { $in: allowedClubIds } },
        { clubId: null } // College general events
      ]
    };
    
    // If staff, let them see everything for simplicity 
    const finalQuery = req.user.role !== 'student' ? {} : query;
    const events = await Event.find(finalQuery).populate('clubId', 'name').sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Create an event (Club Admin or Admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, clubId, isPublic } = req.body;
    
    // Verify user manages the club if clubId is provided
    if (clubId && req.user.role !== 'admin') {
      const club = await Club.findById(clubId);
      if (!club || club.adminId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized for this club' });
      }
    }
    
    const event = await Event.create({ title, description, date, clubId: clubId || null, isPublic });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Register for an event (Student)
exports.registerEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Check if membership is required
    if (!event.isPublic && event.clubId) {
      const membership = await ClubMembership.findOne({ studentId: req.user.id, clubId: event.clubId, status: 'approved' });
      if (!membership) {
        return res.status(403).json({ message: 'Must be an approved club member to join this event.' });
      }
    }
    
    // Check if already registered
    if (event.registeredStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    
    event.registeredStudents.push(req.user.id);
    await event.save();
    
    res.json({ message: 'Registered successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
};
