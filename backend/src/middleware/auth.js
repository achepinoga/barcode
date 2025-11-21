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

  // Extract username from Bearer token
  const username = authHeader.substring(7); // Remove 'Bearer ' prefix

  // For now, validate that username matches one of the known users
  const VALID_USERS = {
    'justin.maas@student.fontys.nl': true,
    'e.chapa@student.fontys.nl': true,
    'r.cozma@student.fontys.nl': true,
    'stefan@student.fontys.nl': true,
    'alex@chepinoga.com': true
  };

  if (!VALID_USERS[username]) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid user'
    });
  }

  // Attach username to request for logging purposes
  req.user = { username };
  next();
};

module.exports = { authenticateRequest };
