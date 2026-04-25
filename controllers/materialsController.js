// ============================================
// Study Materials Controller
// ============================================

const StudyMaterial = require('../models/StudyMaterial');
const path = require('path');

// Get materials (Students filter by subject/dept)
exports.getMaterials = async (req, res) => {
  try {
    const { subject, department } = req.query;
    let query = {};
    if (subject) query.subject = new RegExp(subject, 'i');
    
    // Students only see materials for their department, or 'General'. Staff see all unless filtered.
    if (req.user && req.user.role === 'student') {
      query.$or = [{ department: req.user.department }, { department: 'General' }];
    } else if (department) {
      query.department = department;
    }
    
    const materials = await StudyMaterial.find(query).populate('uploadedBy', 'username');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials', error: error.message });
  }
};

// Upload material (Faculty only)
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { title, subject, department, clubId } = req.body;
    
    const fileUrl = '/uploads/' + req.file.filename;
 
    const material = await StudyMaterial.create({
      title,
      subject,
      department: department || req.user.department || 'General',
      fileUrl,
      uploadedBy: req.user.id,
      clubId: clubId || null
    });
    
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading material', error: error.message });
  }
};
