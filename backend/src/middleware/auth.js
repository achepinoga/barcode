const jwt = require('jsonwebtoken');

// JWT Secret. Must match the one in auth.js
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  // Try to get token from Authorization header first, then from cookies
  let token = null;
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing authentication token'
    });
  }

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