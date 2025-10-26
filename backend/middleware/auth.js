const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check if running in developer mode
    const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';
    
    if (IS_DEVELOPER) {
      // Create a mock user for developer mode
      req.user = {
        _id: 'dev-user-id',
        id: 'dev-user-id',
        name: 'Developer User',
        email: 'dev@lifecoach.com',
        role: 'admin'
      };
      return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // Check if running in developer mode
    const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';
    
    if (IS_DEVELOPER) {
      // In developer mode, always allow admin access
      return next();
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, adminAuth };
