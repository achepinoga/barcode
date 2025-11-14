const express = require('express');
const router = express.Router();

// Hardcoded user credentials
const VALID_CREDENTIALS = {
  'justin.maas@student.fontys.nl': 'SecurePass2024!',
  'e.chapa@student.fontys.nl': 'SecurePass2024!',
  'r.cozma@student.fontys.nl': 'SecurePass2024!',
  'stefan@student.fontys.nl': 'SecurePass2024!',
  'alex@chepinoga.com': 'SecurePass2024!'
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  if (VALID_CREDENTIALS[username] && VALID_CREDENTIALS[username] === password) {
    return res.json({
      success: true,
      message: 'Login successful',
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