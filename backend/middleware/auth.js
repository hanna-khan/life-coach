const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';
    
    // Check for token in multiple places
    let token = req.header('x-auth-token'); // Check x-auth-token first
    if (!token) {
      token = req.header('Authorization')?.replace('Bearer ', ''); // Then check Authorization
    }
    
    if (token) {
      // Token exists - verify it and get real user (even in developer mode)
      if (!process.env.JWT_SECRET) {
        console.error('⚠️  JWT_SECRET is not set in environment variables');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          // In developer mode, allow mock user if real user not found
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
          return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = user;
        return next();
      } catch (tokenError) {
        // Token verification failed
        if (IS_DEVELOPER) {
          // In developer mode, allow mock user on token error
          req.user = {
            _id: 'dev-user-id',
            id: 'dev-user-id',
            name: 'Developer User',
            email: 'dev@lifecoach.com',
            role: 'admin'
          };
          return next();
        }
        
        if (tokenError.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token' });
        }
        if (tokenError.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Authentication failed' });
      }
    }
    
    // No token provided
    if (IS_DEVELOPER) {
      // In developer mode, allow access with mock user when no token
      req.user = {
        _id: 'dev-user-id',
        id: 'dev-user-id',
        name: 'Developer User',
        email: 'dev@lifecoach.com',
        role: 'admin'
      };
      return next();
    }
    
    // Production: No token, deny access
    return res.status(401).json({ message: 'No token, authorization denied' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // In developer mode, allow access even on error
    if (process.env.IS_DEVELOPER === 'true') {
      req.user = {
        _id: 'dev-user-id',
        id: 'dev-user-id',
        name: 'Developer User',
        email: 'dev@lifecoach.com',
        role: 'admin'
      };
      return next();
    }
    
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';
    
    // In developer mode, always allow admin access
    if (IS_DEVELOPER) {
      return next();
    }

    // Production: Check if user is admin
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    // In developer mode, allow access even on error
    if (process.env.IS_DEVELOPER === 'true') {
      return next();
    }
    
    return res.status(403).json({ message: 'Admin access denied' });
  }
};

module.exports = { auth, adminAuth };
