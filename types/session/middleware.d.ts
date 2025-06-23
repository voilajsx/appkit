/**
 * Creates a session middleware that works with any Node.js framework
 * @param {Object} options - Session configuration
 * @param {Object} [options.store] - Session store (defaults to MemoryStore)
 * @param {string} [options.cookieName='sessionId'] - Name of session cookie
 * @param {number} [options.maxAge=86400000] - Session max age in milliseconds (24 hours)
 * @param {boolean} [options.secure] - Secure cookie flag (auto-detects production)
 * @param {boolean} [options.httpOnly=true] - HTTP-only cookie flag
 * @param {string} [options.sameSite='strict'] - SameSite cookie attribute
 * @param {string} [options.secret] - Secret for signing session IDs (required for production)
 * @param {boolean} [options.rolling=true] - Extend session on activity
 * @param {string} [options.path='/'] - Cookie path
 * @param {string} [options.domain] - Cookie domain
 * @returns {Function} Middleware function (req, res, next)
 *
 * @example
 * // Basic usage
 * const sessionMiddleware = createSessionMiddleware({
 *   secret: 'your-secret-key'
 * });
 *
 * // With custom store
 * const sessionMiddleware = createSessionMiddleware({
 *   store: new RedisStore(redis),
 *   secret: process.env.SESSION_SECRET
 * });
 */
export function createSessionMiddleware(options?: {
    store?: any;
    cookieName?: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: string;
    secret?: string;
    rolling?: boolean;
    path?: string;
    domain?: string;
}): Function;
/**
 * Creates session-based authentication middleware
 * @param {Object} options - Authentication options
 * @param {string} [options.loginUrl='/login'] - URL to redirect unauthenticated users
 * @param {Function} [options.getUser] - Function to extract user from session data
 * @param {Function} [options.onAuthRequired] - Custom handler for authentication required
 * @param {string} [options.userKey='user'] - Key in session data that contains user info
 * @returns {Function} Authentication middleware
 *
 * @example
 * // Basic usage
 * const authRequired = createSessionAuthMiddleware();
 * app.get('/dashboard', authRequired, handler);
 *
 * // Custom user extraction
 * const authRequired = createSessionAuthMiddleware({
 *   getUser: (sessionData) => sessionData.currentUser,
 *   loginUrl: '/auth/login'
 * });
 */
export function createSessionAuthMiddleware(options?: {
    loginUrl?: string;
    getUser?: Function;
    onAuthRequired?: Function;
    userKey?: string;
}): Function;
/**
 * Helper to create role-based authorization middleware using sessions
 * @param {string|string[]} allowedRoles - Role(s) that can access the resource
 * @param {Object} options - Authorization options
 * @param {Function} [options.getRoles] - Function to extract user roles
 * @param {string} [options.roleKey='role'] - Key in user object that contains role
 * @returns {Function} Authorization middleware
 *
 * @example
 * // Single role
 * const adminOnly = createSessionAuthorizationMiddleware(['admin']);
 *
 * // Multiple roles
 * const moderatorAccess = createSessionAuthorizationMiddleware(['admin', 'moderator']);
 *
 * // Custom role extraction
 * const customAuth = createSessionAuthorizationMiddleware(['editor'], {
 *   getRoles: (user) => user.permissions.map(p => p.role)
 * });
 */
export function createSessionAuthorizationMiddleware(allowedRoles: string | string[], options?: {
    getRoles?: Function;
    roleKey?: string;
}): Function;
