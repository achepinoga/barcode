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

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  if (VALID_CREDENTIALS[username] && VALID_CREDENTIALS[username] === password) {
    // Generate JWT token
    const token = jwt.sign(
      {
        username: username,
        role: 'staff'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        username: username,
        role: 'staff'
      }
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

module.exports = router;