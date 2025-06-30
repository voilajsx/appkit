/**
 * Core authentication class with role-level-permission system
 * @module @voilajsx/appkit/auth
 * @file src/auth/authentication.js
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  validateSecret,
  validateRounds,
  validateRoleLevel,
  validatePermission,
} from './defaults.js';

/**
 * Authentication class with JWT, password, and role-level-permission system
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
   * Creates and signs a JWT token with role-level-permission structure
   * @param {Object} payload - Data to encode in the token
   * @param {string} [expiresIn] - Token expiration (uses config default if not provided)
   * @returns {string} Signed JWT token
   */
  signToken(payload, expiresIn) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    // Validate required fields for new structure
    if (!payload.userId) {
      throw new Error('Payload must include userId');
    }

    if (!payload.role || !payload.level) {
      throw new Error('Payload must include both role and level');
    }

    // Validate role.level exists
    const roleLevel = `${payload.role}.${payload.level}`;
    if (!validateRoleLevel(roleLevel, this.config.roles)) {
      throw new Error(`Invalid role.level: "${roleLevel}"`);
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
      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: [this.config.jwt.algorithm],
      });

      // Validate decoded token has required structure
      if (!decoded.role || !decoded.level) {
        throw new Error('Token missing required role or level information');
      }

      return decoded;
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
   * Checks if user has a specific role.level (with inheritance)
   * @param {string} userRoleLevel - User's role.level (e.g., 'admin.tenant')
   * @param {string} requiredRoleLevel - Required role.level to check
   * @returns {boolean} True if user has the role.level or higher
   */
  hasRole(userRoleLevel, requiredRoleLevel) {
    if (!userRoleLevel || !requiredRoleLevel) {
      return false;
    }

    // Validate both role levels exist
    if (!validateRoleLevel(userRoleLevel, this.config.roles)) {
      throw new Error(`Invalid user role.level: "${userRoleLevel}"`);
    }

    if (!validateRoleLevel(requiredRoleLevel, this.config.roles)) {
      throw new Error(`Invalid required role.level: "${requiredRoleLevel}"`);
    }

    // Direct match
    if (userRoleLevel === requiredRoleLevel) {
      return true;
    }

    // Check inheritance
    const userRoleConfig = this.config.roles[userRoleLevel];
    return userRoleConfig.inherits.includes(requiredRoleLevel);
  }

  /**
   * Checks if user has a specific permission
   * @param {Object} user - User object with permissions array
   * @param {string} permission - Permission to check (e.g., 'edit:tenant')
   * @returns {boolean} True if user has the permission
   */
  can(user, permission) {
    if (!user || !permission) {
      return false;
    }

    // Validate permission format
    if (!validatePermission(permission)) {
      throw new Error(`Invalid permission format: "${permission}"`);
    }

    // Check if user has the specific permission
    if (user.permissions && Array.isArray(user.permissions)) {
      if (user.permissions.includes(permission)) {
        return true;
      }

      // Check for manage permission (includes all other actions)
      const [action, scope] = permission.split(':');
      if (action !== 'manage') {
        const managePermission = `manage:${scope}`;
        if (user.permissions.includes(managePermission)) {
          return true;
        }
      }
    }

    // Fallback: check default permissions for user's role.level
    const userRoleLevel = `${user.role}.${user.level}`;
    const defaultPermissions = this.config.permissions.defaults[userRoleLevel];

    if (defaultPermissions && Array.isArray(defaultPermissions)) {
      if (defaultPermissions.includes(permission)) {
        return true;
      }

      // Check for manage permission in defaults
      const [action, scope] = permission.split(':');
      if (action !== 'manage') {
        const managePermission = `manage:${scope}`;
        if (defaultPermissions.includes(managePermission)) {
          return true;
        }
      }
    }

    return false;
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
   * Creates Fastify-native role-level authorization middleware
   * @param {string} requiredRoleLevel - Required role.level (e.g., 'admin.tenant')
   * @returns {Function} Fastify preHandler function
   */
  requireRole(requiredRoleLevel) {
    if (!requiredRoleLevel) {
      throw new Error('Role.level must be specified (e.g., "admin.tenant")');
    }

    // Validate role.level exists
    if (!validateRoleLevel(requiredRoleLevel, this.config.roles)) {
      throw new Error(`Invalid role.level: "${requiredRoleLevel}"`);
    }

    return async (request, reply) => {
      try {
        let user = null;

        // Check for user authentication (from requireLogin)
        if (request.user) {
          user = request.user;
        }
        // Check for token authentication (from requireToken)
        else if (request.token) {
          user = request.token;
        }

        if (!user) {
          throw {
            statusCode: 401,
            error: 'Authentication required',
            message: 'Please authenticate first',
          };
        }

        if (!user.role || !user.level) {
          throw {
            statusCode: 403,
            error: 'Authorization failed',
            message: this.config.middleware.errorMessages.noRole,
          };
        }

        const userRoleLevel = `${user.role}.${user.level}`;

        // Use role hierarchy checking
        if (!this.hasRole(userRoleLevel, requiredRoleLevel)) {
          throw {
            statusCode: 403,
            error: 'Authorization failed',
            message: this.config.middleware.errorMessages.insufficientRole,
          };
        }
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
   * Creates Fastify-native permission-based authorization middleware
   * @param {string} requiredPermission - Required permission (e.g., 'edit:tenant')
   * @returns {Function} Fastify preHandler function
   */
  requirePermission(requiredPermission) {
    if (!requiredPermission) {
      throw new Error('Permission must be specified (e.g., "edit:tenant")');
    }

    // Validate permission format
    if (!validatePermission(requiredPermission)) {
      throw new Error(`Invalid permission format: "${requiredPermission}"`);
    }

    return async (request, reply) => {
      try {
        let user = null;

        // Check for user authentication (from requireLogin)
        if (request.user) {
          user = request.user;
        }
        // Check for token authentication (from requireToken)
        else if (request.token) {
          user = request.token;
        }

        if (!user) {
          throw {
            statusCode: 401,
            error: 'Authentication required',
            message: 'Please authenticate first',
          };
        }

        // Use permission checking
        if (!this.can(user, requiredPermission)) {
          throw {
            statusCode: 403,
            error: 'Authorization failed',
            message:
              this.config.middleware.errorMessages.insufficientPermissions,
          };
        }
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

  requireRoleExpress(requiredRoleLevel) {
    return this.toExpress(this.requireRole(requiredRoleLevel));
  }

  requirePermissionExpress(requiredPermission) {
    return this.toExpress(this.requirePermission(requiredPermission));
  }
}
