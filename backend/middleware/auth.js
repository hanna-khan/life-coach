const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // TEMPORARILY DISABLED: Authentication check bypassed
    // Create a mock user - assuming user is logged in
    req.user = {
      _id: 'dev-user-id',
      id: 'dev-user-id',
      name: 'Developer User',
      email: 'dev@lifecoach.com',
      role: 'admin'
    };
    return next();

    // Original authentication code (commented out temporarily)
    /*
    const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';
    
    if (IS_DEVELOPER) {
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
    */
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Even on error, allow access temporarily
    req.user = {
      _id: 'dev-user-id',
      id: 'dev-user-id',
      name: 'Developer User',
      email: 'dev@lifecoach.com',
      role: 'admin'
    };
    next();
  }
};

const adminAuth = async (req, res, next) => {
  try {
    // TEMPORARILY DISABLED: Admin check bypassed
    // Always allow admin access
    return next();

    // Original admin check code (commented out temporarily)
    /*
    const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';
    
    if (IS_DEVELOPER) {
      return next();
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
    */
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    // Even on error, allow access temporarily
    next();
  }
};

module.exports = { auth, adminAuth };
