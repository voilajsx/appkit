/**
 * @voilajsx/appkit - Authentication middleware
 * @module @voilajsx/appkit/auth/middleware
 * @file src/auth/middleware.js
 *
 * Production-ready middleware utilities for authentication and authorization.
 */

import { verifyToken } from './jwt.js';

/**
 * Creates authentication middleware with simplified arguments
 * @param {string} [secret] - JWT secret (uses VOILA_AUTH_SECRET if not provided)
 * @param {Object} [options] - Additional middleware options
 * @returns {Function} Express middleware function
 */
export function requireAuth(secret, options = {}) {
  // Handle different argument patterns
  if (typeof secret === 'object') {
    // requireAuth(options) - when secret is in env or options
    options = secret;
    secret = options.secret;
  }

  const jwtSecret = secret || process.env.VOILA_AUTH_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT secret required for authentication middleware');
  }

  // Default token extraction function
  const getToken =
    options.getToken ||
    ((req) => {
      // Check Authorization header first
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
      }

      // Check cookies
      if (req.cookies?.token) {
        return req.cookies.token;
      }

      // Check query params (less secure, but sometimes needed)
      if (req.query?.token) {
        return req.query.token;
      }

      return null;
    });

  return async (req, res, next) => {
    try {
      const token = getToken(req);

      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No token provided',
        });
      }

      const payload = verifyToken(token, jwtSecret);
      req.user = payload;
      next();
    } catch (error) {
      const statusCode = error.message === 'Token has expired' ? 401 : 401;
      const message =
        error.message === 'Token has expired'
          ? 'Your session has expired. Please sign in again.'
          : 'Invalid authentication. Please sign in again.';

      res.status(statusCode).json({
        error: 'Authentication failed',
        message,
      });
    }
  };
}

/**
 * Creates role-based authorization middleware with simplified arguments
 * @param {...string|string[]} roles - Required roles (can be multiple arguments or array)
 * @returns {Function} Express middleware function
 */
export function requireRole(...roles) {
  let allowedRoles;

  // Handle different argument patterns
  if (roles.length === 1 && Array.isArray(roles[0])) {
    // requireRole(['admin', 'editor'])
    allowedRoles = roles[0];
  } else {
    // requireRole('admin', 'editor') or requireRole('admin')
    allowedRoles = roles;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    throw new Error('At least one role must be specified');
  }

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please authenticate first',
        });
      }

      const userRoles = req.user.roles || [];

      if (!Array.isArray(userRoles) || userRoles.length === 0) {
        return res.status(403).json({
          error: 'Authorization failed',
          message: 'No roles found for user',
        });
      }

      const hasRole = userRoles.some((role) => allowedRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          error: 'Authorization failed',
          message: 'Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Server error',
        message: 'Authorization check failed',
      });
    }
  };
}
