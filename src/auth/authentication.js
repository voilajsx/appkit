/**
 * Core authentication class with Fastify-native middleware and Express adapter
 * @module @voilajsx/appkit/auth
 * @file src/auth/authentication.js
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validateSecret, validateRounds, validateRole } from './defaults.js';

/**
 * Authentication class with built-in JWT, password, and Fastify-native middleware
 */
export class AuthenticationClass {
  /**
   * Creates a new Authentication instance
   * @param {object} [config={}] - Authentication configuration
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Creates and signs a JWT token
   * @param {Object} payload - Data to encode in the token
   * @param {string} [expiresIn] - Token expiration (uses config default if not provided)
   * @returns {string} Signed JWT token
   */
  signToken(payload, expiresIn) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    const jwtSecret = this.config.jwt.secret;
    if (!jwtSecret) {
      throw new Error(
        'JWT secret required. Set VOILA_AUTH_SECRET environment variable'
      );
    }

    // Use provided expiration or config default
    const tokenExpiration = expiresIn || this.config.jwt.expiresIn;

    try {
      return jwt.sign(payload, jwtSecret, {
        expiresIn: tokenExpiration,
        algorithm: this.config.jwt.algorithm,
      });
    } catch (error) {
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  /**
   * Verifies and decodes a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a string');
    }

    const jwtSecret = this.config.jwt.secret;
    if (!jwtSecret) {
      throw new Error(
        'JWT secret required. Set VOILA_AUTH_SECRET environment variable'
      );
    }

    try {
      return jwt.verify(token, jwtSecret, {
        algorithms: [this.config.jwt.algorithm],
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Hashes a password using bcrypt
   * @param {string} password - Plain text password to hash
   * @param {number} [rounds] - Number of salt rounds (uses config default if not provided)
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password, rounds) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (password.length === 0) {
      throw new Error('Password cannot be empty');
    }

    // Use provided rounds or config default
    const saltRounds = rounds || this.config.password.saltRounds;

    // Validate rounds for production security
    validateRounds(saltRounds);

    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
  }

  /**
   * Compares a plain text password against a hashed password
   * @param {string} password - Plain text password to verify
   * @param {string} hash - Hashed password to compare against
   * @returns {Promise<boolean>} True if password matches the hash
   */
  async comparePassword(password, hash) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (!hash || typeof hash !== 'string') {
      throw new Error('Hash must be a non-empty string');
    }

    // Validate hash format (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (!hash.match(/^\$2[aby]\$\d{2}\$/)) {
      throw new Error('Invalid hash format');
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Failed to compare password: ${error.message}`);
    }
  }

  /**
   * Checks if user has a specific role (with inheritance)
   * @param {string|string[]} userRoles - User's roles
   * @param {string} requiredRole - Required role to check
   * @returns {boolean} True if user has the role
   */
  hasRole(userRoles, requiredRole) {
    if (!userRoles) {
      return false;
    }

    // Normalize to array
    const roles = Array.isArray(userRoles) ? userRoles : [userRoles];

    // Validate required role exists
    if (!validateRole(requiredRole, this.config.roles)) {
      throw new Error(`Invalid role: "${requiredRole}"`);
    }

    // Check direct role match
    if (roles.includes(requiredRole)) {
      return true;
    }

    // Check inherited roles
    const roleConfig = this.config.roles[requiredRole];
    if (!roleConfig || !roleConfig.inherits) {
      return false;
    }

    // Check if user has any higher-level role that inherits this role
    return Object.keys(this.config.roles).some((userRole) => {
      if (!roles.includes(userRole)) {
        return false;
      }

      const userRoleConfig = this.config.roles[userRole];
      return userRoleConfig && userRoleConfig.inherits.includes(requiredRole);
    });
  }

  /**
   * Creates Fastify-native authentication middleware for login-based routes
   * @param {Object} [options] - Additional middleware options
   * @param {Function} [options.getToken] - Custom token extraction function
   * @returns {Function} Fastify preHandler function
   */
  requireLogin(options = {}) {
    if (!this.config.jwt.secret) {
      throw new Error('JWT secret required for authentication middleware');
    }

    // Default token extraction function
    const getToken = options.getToken || this.getDefaultTokenExtractor();

    return async (request, reply) => {
      try {
        const token = getToken(request);

        if (!token) {
          throw {
            statusCode: 401,
            error: 'Authentication required',
            message: this.config.middleware.errorMessages.noToken,
          };
        }

        const payload = this.verifyToken(token);
        request.user = payload; // Set user information for login-based routes
      } catch (error) {
        const isExpired = error.message === 'Token has expired';
        const statusCode = error.statusCode || 401;

        const message = isExpired
          ? this.config.middleware.errorMessages.expiredToken
          : this.config.middleware.errorMessages.invalidToken;

        throw {
          statusCode,
          error: 'Authentication failed',
          message,
        };
      }
    };
  }

  /**
   * Creates Fastify-native token validation middleware for API-to-API communication
   * @param {Object} [options] - Additional middleware options
   * @param {Function} [options.getToken] - Custom token extraction function
   * @returns {Function} Fastify preHandler function
   */
  requireToken(options = {}) {
    if (!this.config.jwt.secret) {
      throw new Error('JWT secret required for token validation middleware');
    }

    // Default token extraction function
    const getToken = options.getToken || this.getDefaultTokenExtractor();

    return async (request, reply) => {
      try {
        const token = getToken(request);

        if (!token) {
          throw {
            statusCode: 401,
            error: 'Token required',
            message: 'Valid token required for API access',
          };
        }

        const payload = this.verifyToken(token);
        request.token = payload; // Set token payload for API routes (different from request.user)
      } catch (error) {
        const isExpired = error.message === 'Token has expired';
        const statusCode = error.statusCode || 401;

        const message = isExpired
          ? 'Token has expired'
          : 'Invalid token provided';

        throw {
          statusCode,
          error: 'Token validation failed',
          message,
        };
      }
    };
  }

  /**
   * Creates Fastify-native role-based authorization middleware
   * @param {...string|string[]} roles - Required roles (can be multiple arguments or array)
   * @returns {Function} Fastify preHandler function
   */
  requireRole(...roles) {
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

    // Validate all roles exist
    allowedRoles.forEach((role) => {
      if (!validateRole(role, this.config.roles)) {
        throw new Error(`Invalid role: "${role}"`);
      }
    });

    return async (request, reply) => {
      try {
        // Check for user authentication (from requireLogin)
        if (request.user) {
          const userRoles = request.user.roles || [];

          if (!Array.isArray(userRoles) || userRoles.length === 0) {
            throw {
              statusCode: 403,
              error: 'Authorization failed',
              message: this.config.middleware.errorMessages.noRoles,
            };
          }

          // Use role hierarchy checking
          const hasRequiredRole = allowedRoles.some((role) =>
            this.hasRole(userRoles, role)
          );

          if (!hasRequiredRole) {
            throw {
              statusCode: 403,
              error: 'Authorization failed',
              message:
                this.config.middleware.errorMessages.insufficientPermissions,
            };
          }

          return;
        }

        // Check for token authentication (from requireToken)
        if (request.token) {
          const tokenRoles = request.token.roles || [];

          if (!Array.isArray(tokenRoles) || tokenRoles.length === 0) {
            throw {
              statusCode: 403,
              error: 'Authorization failed',
              message: 'No roles found in token',
            };
          }

          // Use role hierarchy checking for tokens too
          const hasRequiredRole = allowedRoles.some((role) =>
            this.hasRole(tokenRoles, role)
          );

          if (!hasRequiredRole) {
            throw {
              statusCode: 403,
              error: 'Authorization failed',
              message: 'Insufficient token permissions',
            };
          }

          return;
        }

        // Neither user nor token found
        throw {
          statusCode: 401,
          error: 'Authentication required',
          message: 'Please authenticate first',
        };
      } catch (error) {
        const statusCode = error.statusCode || 500;
        throw {
          statusCode,
          error: error.error || 'Server error',
          message: error.message || 'Authorization check failed',
        };
      }
    };
  }

  /**
   * Gets user from request object safely (works with both requireLogin and requireToken)
   * @param {Object} request - Fastify request object
   * @returns {Object|null} User object or null if not authenticated
   */
  user(request) {
    // Return user from requireLogin() first, then token from requireToken()
    return request.user || request.token || null;
  }

  /**
   * Gets default token extraction function for Fastify
   * @returns {Function} Token extraction function
   */
  getDefaultTokenExtractor() {
    return (request) => {
      // Check Authorization header first (Bearer token)
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
      }

      // Check cookies
      if (request.cookies?.token) {
        return request.cookies.token;
      }

      // Check query params (less secure, but sometimes needed)
      if (request.query?.token) {
        return request.query.token;
      }

      return null;
    };
  }

  /**
   * Express adapter - converts Fastify middleware to work with Express
   * @param {Function} fastifyMiddleware - Fastify preHandler function
   * @returns {Function} Express middleware function
   */
  toExpress(fastifyMiddleware) {
    return async (req, res, next) => {
      try {
        // Create Fastify-like request object
        const request = {
          ...req,
          headers: req.headers,
          cookies: req.cookies,
          query: req.query,
        };

        // Create Fastify-like reply object (minimal)
        const reply = {
          code: (statusCode) => ({
            send: (data) => res.status(statusCode).json(data),
          }),
          send: (data) => res.json(data),
        };

        // Execute Fastify middleware
        await fastifyMiddleware(request, reply);

        // Copy user/token back to Express req
        if (request.user) req.user = request.user;
        if (request.token) req.token = request.token;

        next();
      } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
          error: error.error || 'Error',
          message: error.message || 'An error occurred',
        });
      }
    };
  }

  /**
   * Express convenience methods (using the adapter)
   */
  requireLoginExpress(options = {}) {
    return this.toExpress(this.requireLogin(options));
  }

  requireTokenExpress(options = {}) {
    return this.toExpress(this.requireToken(options));
  }

  requireRoleExpress(...roles) {
    return this.toExpress(this.requireRole(...roles));
  }
}
