const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'Invalid token' });

    req.user = { id: user._id, role: user.role }; // Attach user info
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Token failed or expired' });
  }
};

// Check if user is Admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'CEO') {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
  next();
};
