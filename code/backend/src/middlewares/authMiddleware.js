/**
 * Authentication middleware for JWT verification and user extraction
 * 
 * This middleware verifies JWT tokens in requests and attaches the authenticated
 * user to the request object for use in route handlers.
 */

const AuthService = require('../services/AuthService');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and extract user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Get user from database
    const user = await User.query()
      .findById(decoded.sub)
      .withGraphFetched('roles.permissions');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({ message: `Account is ${user.status}` });
    }
    
    // Attach user and token data to request
    req.user = user;
    req.token = decoded;
    req.tenantId = decoded.tenant_id;
    
    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

/**
 * Middleware to check if user has required roles
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Express middleware
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userRoles = req.user.roles.map(role => role.name);
    
    // Convert single role to array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Middleware to check if user has required permissions
 * @param {string|string[]} permissions - Required permission(s)
 * @returns {Function} Express middleware
 */
const hasPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract user permissions from roles
    const userPermissions = new Set();
    req.user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => {
          userPermissions.add(permission.code);
        });
      }
    });
    
    // Convert single permission to array
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.has(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Middleware to check if user belongs to the specified tenant
 * @param {Function} getTenantId - Function to extract tenant ID from request
 * @returns {Function} Express middleware
 */
const belongsToTenant = (getTenantId = req => req.params.tenantId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const tenantId = getTenantId(req);
    
    // Skip check if no tenant ID provided
    if (!tenantId) {
      return next();
    }
    
    // Check if user belongs to the tenant
    if (req.user.tenant_id !== parseInt(tenantId)) {
      return res.status(403).json({ message: 'Access denied to this tenant' });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  hasRole,
  hasPermission,
  belongsToTenant
};
