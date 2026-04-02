// ============================================
// JWT Authentication Middleware
// Verifies JWT tokens for protected routes
// ============================================

const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes that require authentication.
 * Extracts JWT token from the Authorization header,
 * verifies it, and attaches user info to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from the Authorization header (format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user data to the request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Middleware to check if the user is an admin.
 * Must be used AFTER authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
