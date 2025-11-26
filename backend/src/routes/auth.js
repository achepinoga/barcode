const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Hardcoded user credentials
const VALID_CREDENTIALS = {
  'justin.maas@student.fontys.nl': 'SecurePass2024!',
  'e.chapa@student.fontys.nl': 'SecurePass2024!',
  'r.cozma@student.fontys.nl': 'SecurePass2024!',
  'stefan@student.fontys.nl': 'SecurePass2024!',
  'alex@chepinoga.com': 'SecurePass2024!'
};

// JWT Secret - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt for:', username);

  if (VALID_CREDENTIALS[username] && VALID_CREDENTIALS[username] === password) {
    const token = jwt.sign(
      { username: username, role: 'staff' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('auth_token', token, COOKIE_OPTIONS);
    console.log('Cookie set for user:', username);
    console.log('Cookie options:', COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: { username: username, role: 'staff' }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });

  console.log('User logged out, cookie cleared');

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/verify - Verify if user is authenticated
router.get('/verify', (req, res) => {
  console.log('=== VERIFY REQUEST ===');
  console.log('Cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  
  let token = null;
  
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
    console.log('Token found in cookies');
  } else if (req.headers.authorization) {
    token = req.headers.authorization.substring(7);
    console.log('Token found in Authorization header');
  }

  if (!token) {
    console.log('No token found - user not authenticated');
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully for user:', decoded.username);
    
    res.json({
      success: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (err) {
    console.log('Token verification failed:', err.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;