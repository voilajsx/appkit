/**
 * Core authentication class with role-level-permission system
 * @module @voilajsx/appkit/auth
 * @file src/auth/authentication.ts
 *
 * @llm-rule WHEN: Building apps that need JWT operations, password hashing, and role-based middleware
 * @llm-rule AVOID: Using directly - always get instance via authenticator.get()
 * @llm-rule NOTE: Use requireRole() for hierarchy-based access, requirePermission() for action-specific access
 * @llm-rule NOTE: Uses role.level format (user.basic, admin.tenant) with automatic inheritance
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validateRounds, validateRoleLevel, validatePermission, } from './defaults.js';
/**
 * Authentication class with JWT, password, and role-level-permission system
 */
export class AuthenticationClass {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Creates and signs a JWT token with role-level-permission structure
     * @llm-rule WHEN: Creating tokens for authenticated users with role-based access
     * @llm-rule AVOID: Missing userId, role, or level in payload - token will be invalid
     * @llm-rule AVOID: Using {userId, roles: ['admin']} format - use {userId, role: 'admin', level: 'tenant'}
     * @llm-rule NOTE: permissions array is optional - defaults are used from role.level config
     */
    signToken(payload, expiresIn) {
        if (!payload || typeof payload !== 'object') {
            throw new Error('Payload must be an object');
        }
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
            throw new Error('JWT secret required. Set VOILA_AUTH_SECRET environment variable');
        }
        const tokenExpiration = expiresIn || this.config.jwt.expiresIn;
        try {
            return jwt.sign(payload, jwtSecret, {
                expiresIn: tokenExpiration,
            });
        }
        catch (error) {
            throw new Error(`Failed to generate token: ${error.message}`);
        }
    }
    /**
     * Verifies and decodes a JWT token
     * @llm-rule WHEN: Validating incoming tokens from requests
     * @llm-rule AVOID: Using jwt.verify directly - this handles errors and validates structure
     */
    verifyToken(token) {
        if (!token || typeof token !== 'string') {
            throw new Error('Token must be a string');
        }
        const jwtSecret = this.config.jwt.secret;
        if (!jwtSecret) {
            throw new Error('JWT secret required. Set VOILA_AUTH_SECRET environment variable');
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
        }
        catch (error) {
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
     * @llm-rule WHEN: Storing user passwords - always hash before saving to database
     * @llm-rule AVOID: Storing plain text passwords - major security vulnerability
     * @llm-rule NOTE: Takes ~100ms with default 10 rounds - don't call in tight loops
     */
    async hashPassword(password, rounds) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }
        if (password.length === 0) {
            throw new Error('Password cannot be empty');
        }
        const saltRounds = rounds || this.config.password.saltRounds;
        validateRounds(saltRounds);
        try {
            return await bcrypt.hash(password, saltRounds);
        }
        catch (error) {
            throw new Error(`Failed to hash password: ${error.message}`);
        }
    }
    /**
     * Compares a plain text password against a hashed password
     * @llm-rule WHEN: User login - verify input password against stored hash
     * @llm-rule AVOID: Comparing hashed passwords directly - use this method for timing attack protection
     */
    async comparePassword(password, hash) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }
        if (!hash || typeof hash !== 'string') {
            throw new Error('Hash must be a non-empty string');
        }
        if (!hash.match(/^\$2[aby]\$\d{2}\$/)) {
            throw new Error('Invalid hash format');
        }
        try {
            return await bcrypt.compare(password, hash);
        }
        catch (error) {
            throw new Error(`Failed to compare password: ${error.message}`);
        }
    }
    /**
     * Checks if user has a specific role.level (with inheritance)
     * @llm-rule WHEN: Checking if user meets minimum role requirement
     * @llm-rule AVOID: Exact string matching - use this for hierarchy checking
     * @llm-rule NOTE: Inheritance works upward - admin.org has admin.tenant access, not vice versa
     * @llm-rule NOTE: admin.org automatically has admin.tenant access via inheritance
     */
    hasRole(userRoleLevel, requiredRoleLevel) {
        if (!userRoleLevel || !requiredRoleLevel) {
            return false;
        }
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
     * @llm-rule WHEN: Checking fine-grained permissions beyond role hierarchy
     * @llm-rule AVOID: Manual permission array checking - this handles manage:scope fallbacks
     * @llm-rule NOTE: manage:tenant permission automatically grants edit:tenant, view:tenant, etc.
     */
    can(user, permission) {
        if (!user || !permission) {
            return false;
        }
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
     * @llm-rule WHEN: Protecting routes that need authenticated users (Fastify framework)
     * @llm-rule AVOID: Using without requireRole/requirePermission - this only validates token
     * @llm-rule AVOID: Using with Express - use requireLoginExpress() for Express apps
     */
    requireLogin(options = {}) {
        if (!this.config.jwt.secret) {
            throw new Error('JWT secret required for authentication middleware');
        }
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
                request.user = payload;
            }
            catch (error) {
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
     * @llm-rule WHEN: Protecting API endpoints for service-to-service calls (Fastify framework)
     * @llm-rule AVOID: Using for user-facing routes - use requireLogin instead
     * @llm-rule AVOID: Using with Express - use requireTokenExpress() for Express apps
     */
    requireToken(options = {}) {
        if (!this.config.jwt.secret) {
            throw new Error('JWT secret required for token validation middleware');
        }
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
                request.token = payload;
            }
            catch (error) {
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
     * @llm-rule WHEN: Protecting routes that need minimum role.level access (Fastify framework)
     * @llm-rule AVOID: Using with exact role matching - this uses inheritance hierarchy
     * @llm-rule AVOID: Using with Express - use requireRoleExpress() for Express apps
     * @llm-rule NOTE: Use this for hierarchy-based access (admin.org gets admin.tenant access)
     */
    requireRole(requiredRoleLevel) {
        if (!requiredRoleLevel) {
            throw new Error('Role.level must be specified (e.g., "admin.tenant")');
        }
        if (!validateRoleLevel(requiredRoleLevel, this.config.roles)) {
            throw new Error(`Invalid role.level: "${requiredRoleLevel}"`);
        }
        return async (request, reply) => {
            try {
                let user = null;
                if (request.user) {
                    user = request.user;
                }
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
                if (!this.hasRole(userRoleLevel, requiredRoleLevel)) {
                    throw {
                        statusCode: 403,
                        error: 'Authorization failed',
                        message: this.config.middleware.errorMessages.insufficientRole,
                    };
                }
            }
            catch (error) {
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
     * @llm-rule WHEN: Protecting routes that need specific action:scope permissions (Fastify framework)
     * @llm-rule AVOID: Using for simple role checks - use requireRole for hierarchy-based access
     * @llm-rule AVOID: Using with Express - use requirePermissionExpress() for Express apps
     * @llm-rule NOTE: Use this for action-specific access (edit:tenant, view:org, etc.)
     */
    requirePermission(requiredPermission) {
        if (!requiredPermission) {
            throw new Error('Permission must be specified (e.g., "edit:tenant")');
        }
        if (!validatePermission(requiredPermission)) {
            throw new Error(`Invalid permission format: "${requiredPermission}"`);
        }
        return async (request, reply) => {
            try {
                let user = null;
                if (request.user) {
                    user = request.user;
                }
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
                if (!this.can(user, requiredPermission)) {
                    throw {
                        statusCode: 403,
                        error: 'Authorization failed',
                        message: this.config.middleware.errorMessages.insufficientPermissions,
                    };
                }
            }
            catch (error) {
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
     * @llm-rule WHEN: Need to access user data from authenticated requests
     * @llm-rule AVOID: Accessing req.user or req.token directly - WILL crash app when undefined
     * @llm-rule NOTE: Always returns null safely - never throws undefined errors
     */
    user(request) {
        return request.user || request.token || null;
    }
    /**
     * Gets default token extraction function for Fastify
     */
    getDefaultTokenExtractor() {
        return (request) => {
            const authHeader = request.headers.authorization;
            if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
                return authHeader.slice(7);
            }
            if (request.cookies?.token) {
                return request.cookies.token;
            }
            if (request.query?.token) {
                return request.query.token;
            }
            return null;
        };
    }
    /**
     * Express adapter - converts Fastify middleware to work with Express
     * @llm-rule WHEN: Using Express framework instead of Fastify
     * @llm-rule AVOID: Using Fastify methods directly in Express - use *Express variants
     */
    toExpress(fastifyMiddleware) {
        return async (req, res, next) => {
            try {
                const request = {
                    ...req,
                    headers: req.headers,
                    cookies: req.cookies,
                    query: req.query,
                };
                const reply = {
                    code: (statusCode) => ({
                        send: (data) => res.status(statusCode).json(data),
                    }),
                    send: (data) => res.json(data),
                };
                await fastifyMiddleware(request, reply);
                if (request.user)
                    req.user = request.user;
                if (request.token)
                    req.token = request.token;
                next();
            }
            catch (error) {
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
     * @llm-rule WHEN: Using Express framework - these handle Fastify-to-Express conversion automatically
     * @llm-rule AVOID: Mixing Fastify and Express methods - stick to one framework's methods
     * @llm-rule AVOID: Using requireLogin() with Express - use these Express variants instead
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
//# sourceMappingURL=authentication.js.map