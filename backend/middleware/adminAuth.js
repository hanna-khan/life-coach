const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const adminAuth = async (req, res, next) => {
  try {
    const IS_DEVELOPER = process.env.IS_DEVELOPER === 'true';
    
    // Check for token (x-auth-token or Authorization header)
    let token = req.header('x-auth-token');
    if (!token) token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      // Token exists - verify it
      if (!process.env.JWT_SECRET) {
        console.error('⚠️  JWT_SECRET is not set in environment variables');
        return res.status(500).json({ message: 'Server configuration error' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is admin type
        if (decoded.type !== 'admin') {
          return res.status(401).json({ message: 'Invalid token type. Admin token required.' });
        }

        const admin = await AdminUser.findById(decoded.id);
        
        if (!admin) {
          if (IS_DEVELOPER) {
            // In developer mode, allow access even if admin not found
            req.admin = {
              _id: 'dev-admin-id',
              id: 'dev-admin-id',
              name: 'Developer Admin',
              email: 'admin@lifecoach.com'
            };
            return next();
          }
          return res.status(401).json({ message: 'Admin not found' });
        }

        if (!admin.isActive) {
          return res.status(403).json({ message: 'Admin account is deactivated' });
        }

        req.admin = admin;
        req.user = { id: admin._id, _id: admin._id, role: 'admin', name: admin.name, email: admin.email };
        return next();
      } catch (tokenError) {
        if (IS_DEVELOPER) {
          req.admin = { _id: 'dev-admin-id', id: 'dev-admin-id', name: 'Developer Admin', email: 'admin@lifecoach.com' };
          req.user = { id: 'dev-admin-id', _id: 'dev-admin-id', role: 'admin', name: req.admin.name, email: req.admin.email };
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
      req.admin = { _id: 'dev-admin-id', id: 'dev-admin-id', name: 'Developer Admin', email: 'admin@lifecoach.com' };
      req.user = { id: 'dev-admin-id', _id: 'dev-admin-id', role: 'admin', name: req.admin.name, email: req.admin.email };
      return next();
    }
    
    // Production: No token, deny access
    return res.status(401).json({ message: 'No token, authorization denied' });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    // In developer mode, allow access even on error
    if (process.env.IS_DEVELOPER === 'true') {
      req.admin = { _id: 'dev-admin-id', id: 'dev-admin-id', name: 'Developer Admin', email: 'admin@lifecoach.com' };
      req.user = { id: 'dev-admin-id', _id: 'dev-admin-id', role: 'admin', name: req.admin.name, email: req.admin.email };
      return next();
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = adminAuth;

