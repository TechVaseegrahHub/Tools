import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- SuperAdmin: token-only, no DB lookup needed ---
      if (decoded.isSuperAdmin) {
        req.user = {
          id: 'superadmin',
          role: 'SuperAdmin',
          isSuperAdmin: true,
          orgId: null,
        };
        return next();
      }

      // --- Normal tenant user ---
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = {
        id: user._id,
        orgId: user.orgId,
        role: user.role,
        isSuperAdmin: false,
      };

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Block SuperAdmin from accessing org-scoped routes
const requireOrg = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    return res.status(403).json({
      message: 'SuperAdmin cannot access tenant-specific routes directly. Use /api/superadmin/* routes.',
    });
  }
  if (!req.user?.orgId) {
    return res.status(403).json({ message: 'No organization assigned to this user.' });
  }
  next();
};

export { protect, authorize, requireOrg };