// ============================================
// JWT Authentication Middleware
// Verifies JWT tokens for protected routes
// ============================================

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Contains id, role, studentId/username, department
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

const facultyMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Faculty only.' });
  }
};

const clubAdminMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'club_admin' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Club Admin only.' });
  }
};

const anyStaffMiddleware = (req, res, next) => {
  if (req.user && ['admin', 'faculty', 'club_admin'].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Staff only.' });
  }
};

module.exports = { authMiddleware, adminMiddleware, facultyMiddleware, clubAdminMiddleware, anyStaffMiddleware };
