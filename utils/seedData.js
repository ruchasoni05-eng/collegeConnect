// ============================================
// Seed Data Script
// Populates MongoDB with sample data for testing
// Run: npm run seed
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');
const Confession = require('../models/Confession');
const Announcement = require('../models/Announcement');
const { analyzeText } = require('./aiAnalysis');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Admin.deleteMany({});
    await Complaint.deleteMany({});
    await Confession.deleteMany({});
    await Announcement.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // --- Create Admin ---
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    console.log('👤 Admin created (username: admin, password: admin123)');

    // --- Create Students ---
    const students = await Student.create([
      { name: 'Rahul Sharma', studentId: 'STU001', department: 'Computer Science', email: 'rahul@college.edu', password: 'password123' },
      { name: 'Priya Patel', studentId: 'STU002', department: 'Information Technology', email: 'priya@college.edu', password: 'password123' },
      { name: 'Amit Kumar', studentId: 'STU003', department: 'Electronics', email: 'amit@college.edu', password: 'password123' },
      { name: 'Sneha Reddy', studentId: 'STU004', department: 'Mechanical', email: 'sneha@college.edu', password: 'password123' },
      { name: 'Vikram Singh', studentId: 'STU005', department: 'Civil', email: 'vikram@college.edu', password: 'password123' }
    ]);
    console.log(`👨‍🎓 ${students.length} students created`);

    // --- Create Complaints ---
    const complaintData = [
      {
        category: 'Complaint', subject: 'WiFi not working in library',
        message: 'The WiFi in the library has been broken for the past 2 weeks. Students are unable to access the internet for research. This is urgent and needs immediate attention.',
        department: 'Computer Science', student: students[0]._id
      },
      {
        category: 'Feedback', subject: 'Great new computer lab',
        message: 'The new computer lab is excellent and well-equipped. The faculty members are very helpful and the atmosphere is great for studying. Thank you for the improvement!',
        department: 'Information Technology', student: students[1]._id
      },
      {
        category: 'Complaint', subject: 'Canteen food quality',
        message: 'The food quality in the canteen is terrible. The food is often cold, unhygienic, and overpriced. Many students have complained about stomach issues. This is a serious health hazard.',
        department: 'General', student: students[2]._id
      },
      {
        category: 'Suggestion', subject: 'Add more elective courses',
        message: 'I would suggest adding more elective courses in AI and Machine Learning. This would improve our curriculum and help students with modern industry requirements.',
        department: 'Computer Science', student: students[3]._id
      },
      {
        category: 'Complaint', subject: 'Washroom maintenance',
        message: 'The washrooms on the second floor are in a terrible condition. They are dirty, the taps are broken, and there is no water supply. This is dangerous and unacceptable.',
        department: 'Civil', student: students[4]._id
      },
      {
        category: 'Feedback', subject: 'Excellent teaching in AI course',
        message: 'The professor teaching Artificial Intelligence is outstanding. The lectures are engaging, the assignments are helpful, and the course content is excellent.',
        department: 'Computer Science', student: students[0]._id, anonymous: true
      },
      {
        category: 'Complaint', subject: 'Parking space shortage',
        message: 'There is a severe lack of parking spaces on campus. Students have to park outside the campus which is unsafe. This needs urgent attention from the administration.',
        department: 'General', student: students[1]._id
      },
      {
        category: 'Suggestion', subject: 'Install water coolers',
        message: 'Could the administration consider installing water coolers on every floor? Currently students have to go to the ground floor for drinking water which is very inconvenient.',
        department: 'General', student: students[2]._id
      }
    ];

    const complaints = [];
    for (let i = 0; i < complaintData.length; i++) {
      const data = complaintData[i];
      const aiAnalysis = analyzeText(data.message);
      const statuses = ['Pending', 'In Review', 'Resolved'];
      complaints.push(await Complaint.create({
        complaintId: `CMP-SEED${String(i + 1).padStart(2, '0')}`,
        student: data.anonymous ? null : data.student,
        category: data.category,
        subject: data.subject,
        message: data.message,
        anonymous: data.anonymous || false,
        status: statuses[i % 3],
        department: data.department,
        aiAnalysis,
        upvotes: students.slice(0, Math.floor(Math.random() * 4) + 1).map(s => s._id),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within last 90 days
      }));
    }
    console.log(`📝 ${complaints.length} complaints created`);

    // --- Create Confessions ---
    await Confession.create([
      { message: "I've been secretly studying in the library every weekend because I love the peaceful atmosphere there. It's become my favorite place on campus! 📚" },
      { message: "I accidentally broke the projector in Room 204 last month. I'm sorry, I was too scared to tell anyone. I'll pay for the repair if needed." },
      { message: "The canteen uncle always gives me extra food because I helped him once with his phone. He's the nicest person on campus! 🍛" },
      { message: "I've had a crush on someone in the CS department for 2 years but never had the courage to talk to them. Maybe someday! 💕" },
      { message: "Our college fest was the best experience of my life. The organizing committee did an amazing job and I'm grateful to be part of this college! 🎉" }
    ]);
    console.log('🤫 5 confessions created');

    // --- Create Announcements ---
    await Announcement.create([
      { title: '🎉 Annual College Fest 2025', message: 'The annual college fest "TechVista 2025" will be held from March 15-17. All students are encouraged to participate in various technical and cultural events. Registration starts next week!' },
      { title: '📅 Mid-Semester Exam Schedule', message: 'Mid-semester examinations will commence from April 1st. The detailed schedule has been uploaded to the college website. Students are advised to prepare accordingly.' },
      { title: '🏆 Placement Drive Update', message: 'Major tech companies including Google, Microsoft, and Amazon will be visiting campus for placement drives in May. Eligible students should update their profiles on the placement portal.' }
    ]);
    console.log('📢 3 announcements created');

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login → username: admin | password: admin123');
    console.log('Student Login → email: rahul@college.edu | password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
