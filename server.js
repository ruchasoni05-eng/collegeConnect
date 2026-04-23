// ============================================
// Server Entry Point
// Sets up Express app, connects to MongoDB,
// mounts routes, and starts the server
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// --- Middleware ---
app.use(cors());                                    // Enable CORS for all origins
app.use(express.json());                            // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));     // Parse URL-encoded bodies

// Serve static frontend files and prevent caching of HTML pages
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
  }
}));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/confessions', require('./routes/confessions'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/analytics', require('./routes/analytics'));

// --- Serve frontend for any unmatched route (SPA-style fallback) ---
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔══════════════════════════════════════════════╗
    ║  🎓 College Feedback System                  ║
    ║  📡 Server running on http://localhost:${PORT}  ║
    ║  🗄️  MongoDB connected                       ║
    ╚══════════════════════════════════════════════╝
    `);
  });
});
