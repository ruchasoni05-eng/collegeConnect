// ============================================
// Complaint Model
// Stores feedback, complaints, and suggestions
// ============================================

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Unique complaint tracking ID (e.g., "CMP-A1B2C3")
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  // Reference to the student who submitted (null if anonymous)
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  // Type of submission
  category: {
    type: String,
    required: true,
    enum: ['Feedback', 'Complaint', 'Suggestion']
  },
  // Short subject line
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  // Detailed message
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  // Optional file attachment URL
  fileUrl: {
    type: String,
    default: null
  },
  // Whether the submission is anonymous
  anonymous: {
    type: Boolean,
    default: false
  },
  // Current status of the complaint
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'In Review', 'Resolved']
  },
  // Department the complaint is related to
  department: {
    type: String,
    default: 'General'
  },
  // Location (auto-filled via QR code scanning)
  location: {
    type: String,
    default: null
  },
  // Array of student IDs who upvoted this complaint
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  // Array of student IDs who downvoted this complaint
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  // AI-generated analysis results
  aiAnalysis: {
    // Detected category (Infrastructure, Academic, Facility, etc.)
    detectedCategory: {
      type: String,
      default: 'Other'
    },
    // Sentiment: Positive, Neutral, or Negative
    sentiment: {
      type: String,
      default: 'Neutral'
    },
    // Priority level: High, Medium, or Low
    priority: {
      type: String,
      default: 'Medium'
    }
  }
}, {
  timestamps: true
});

// Create indexes for efficient searching
complaintSchema.index({ student: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
