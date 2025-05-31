/**
 * @voilajsx/appkit - Authentication middleware
 * @module @voilajsx/appkit/auth/middleware
 * @file src/auth/middleware.js
 *
 * Middleware utilities for authentication and authorization using JWT.
 * Includes middleware to verify JWT tokens and restrict access by user roles.
 */

import { verifyToken } from './jwt.js';

/**
 * Creates authentication middleware.
 *
 * @param {Object} options - Middleware options.
 * @param {Function} [options.getToken] - Function to extract token from request (default checks headers, cookies, query).
 * @param {string} options.secret - JWT secret key used for token verification.
 * @param {Function} [options.onError] - Custom error handler called on auth failure.
 * @returns {Function} Express middleware function.
 */
export function createAuthMiddleware(options) {
  if (!options?.secret) {
    throw new Error('JWT secret is required');
  }

  // Default token extraction: Authorization header -> cookies -> query params
  const defaultGetToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    if (req.cookies?.token) {
      return req.cookies.token;
    }
    if (req.query?.token) {
      return req.query.token;
    }
    return null;
  };

  const {
    getToken = defaultGetToken,
    secret,
    onError = defaultAuthErrorHandler,
  } = options;

  return async (req, res, next) => {
    try {
      const token = getToken(req);

      if (!token) {
        throw new Error('No token provided');
      }

      const payload = verifyToken(token, { secret });
      req.user = payload;
      next();
    } catch (error) {
      onError(error, req, res);
    }
  };
}

/**
 * Creates authorization middleware to restrict access based on user roles.
 *
 * @param {string[]} allowedRoles - Array of roles allowed to access the route.
 * @param {Object} [options={}] - Middleware options.
 * @param {Function} [options.getRoles] - Function to extract roles from the request (defaults to `req.user.roles`).
 * @returns {Function} Express middleware function.
 */
export function createAuthorizationMiddleware(allowedRoles, options = {}) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('allowedRoles must be a non-empty array');
  }

  const { getRoles = defaultGetRoles } = options;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new Error('Authentication required');
      }

      const userRoles = getRoles(req);

      if (!userRoles || userRoles.length === 0) {
        throw new Error('No roles found for user');
      }

      const hasRole = userRoles.some((role) => allowedRoles.includes(role));

      if (!hasRole) {
        throw new Error('Insufficient permissions');
      }

      next();
    } catch (error) {
      res.status(403).json({
        error: 'Authorization failed',
        message: error.message,
      });
    }
  };
}

/**
 * Default error handler for authentication middleware.
 *
 * @private
 */
function defaultAuthErrorHandler(error, req, res) {
  const errorResponses = {
    'No token provided': {
      status: 401,
      message: 'Authentication required',
    },
    'Token has expired': {
      status: 401,
      message: 'Your session has expired. Please sign in again.',
    },
    'Invalid token': {
      status: 401,
      message: 'Invalid authentication. Please sign in again.',
    },
    'jwt malformed': {
      status: 401,
      message: 'Invalid authentication. Please sign in again.',
    },
    'jwt signature is required': {
      status: 401,
      message: 'Invalid authentication. Please sign in again.',
    },
    'invalid signature': {
      status: 401,
      message: 'Invalid authentication. Please sign in again.',
    },
  };

  const errorResponse = errorResponses[error.message] || {
    status: 401,
    message: 'Authentication failed',
  };

  res.status(errorResponse.status).json({
    error: 'Authentication failed',
    message: errorResponse.message,
  });
}

/**
 * Default function to extract roles from the request user object.
 *
 * @private
 */
function defaultGetRoles(req) {
  return req.user?.roles || [];
}
