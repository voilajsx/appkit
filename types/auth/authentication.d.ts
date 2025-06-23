/**
 * Authentication class with built-in JWT, password, and Fastify-native middleware
 */
export class AuthenticationClass {
    /**
     * Creates a new Authentication instance
     * @param {object} [config={}] - Authentication configuration
     */
    constructor(config?: object);
    config: any;
    /**
     * Creates and signs a JWT token
     * @param {Object} payload - Data to encode in the token
     * @param {string} [expiresIn] - Token expiration (uses config default if not provided)
     * @returns {string} Signed JWT token
     */
    signToken(payload: any, expiresIn?: string): string;
    /**
     * Verifies and decodes a JWT token
     * @param {string} token - JWT token to verify
     * @returns {Object} Decoded token payload
     */
    verifyToken(token: string): any;
    /**
     * Hashes a password using bcrypt
     * @param {string} password - Plain text password to hash
     * @param {number} [rounds] - Number of salt rounds (uses config default if not provided)
     * @returns {Promise<string>} Hashed password
     */
    hashPassword(password: string, rounds?: number): Promise<string>;
    /**
     * Compares a plain text password against a hashed password
     * @param {string} password - Plain text password to verify
     * @param {string} hash - Hashed password to compare against
     * @returns {Promise<boolean>} True if password matches the hash
     */
    comparePassword(password: string, hash: string): Promise<boolean>;
    /**
     * Checks if user has a specific role (with inheritance)
     * @param {string|string[]} userRoles - User's roles
     * @param {string} requiredRole - Required role to check
     * @returns {boolean} True if user has the role
     */
    hasRole(userRoles: string | string[], requiredRole: string): boolean;
    /**
     * Creates Fastify-native authentication middleware for login-based routes
     * @param {Object} [options] - Additional middleware options
     * @param {Function} [options.getToken] - Custom token extraction function
     * @returns {Function} Fastify preHandler function
     */
    requireLogin(options?: {
        getToken?: Function;
    }): Function;
    /**
     * Creates Fastify-native token validation middleware for API-to-API communication
     * @param {Object} [options] - Additional middleware options
     * @param {Function} [options.getToken] - Custom token extraction function
     * @returns {Function} Fastify preHandler function
     */
    requireToken(options?: {
        getToken?: Function;
    }): Function;
    /**
     * Creates Fastify-native role-based authorization middleware
     * @param {...string|string[]} roles - Required roles (can be multiple arguments or array)
     * @returns {Function} Fastify preHandler function
     */
    requireRole(...roles: (string | string[])[]): Function;
    /**
     * Gets user from request object safely (works with both requireLogin and requireToken)
     * @param {Object} request - Fastify request object
     * @returns {Object|null} User object or null if not authenticated
     */
    user(request: any): any | null;
    /**
     * Gets default token extraction function for Fastify
     * @returns {Function} Token extraction function
     */
    getDefaultTokenExtractor(): Function;
    /**
     * Express adapter - converts Fastify middleware to work with Express
     * @param {Function} fastifyMiddleware - Fastify preHandler function
     * @returns {Function} Express middleware function
     */
    toExpress(fastifyMiddleware: Function): Function;
    /**
     * Express convenience methods (using the adapter)
     */
    requireLoginExpress(options?: {}): Function;
    requireTokenExpress(options?: {}): Function;
    requireRoleExpress(...roles: any[]): Function;
}
