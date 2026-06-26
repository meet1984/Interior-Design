const jwt = require('jsonwebtoken');
const { db } = require('../models');

const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and include their role
    const user = await db.User.findByPk(decoded.id, {
      include: [{ model: db.Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found in system' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: `Your account is ${user.status}. Access denied.` });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
