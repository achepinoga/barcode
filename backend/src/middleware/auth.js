const jwt = require('jsonwebtoken');

// JWT Secret - must match the one in auth.js
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid authentication token'
    });
  }

  // Extract token from Bearer header
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info from token to request
    req.user = {
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token'
    });
  }
};

module.exports = { authenticateRequest };
