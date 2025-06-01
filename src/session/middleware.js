/**
 * @file src/session/middleware.js
 * @voilajsx/appkit - Session middleware
 * @module @voilajsx/appkit/session/middleware
 */

import { SessionManager } from './utils.js';
import { MemoryStore } from './stores.js';

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
export function createSessionMiddleware(options = {}) {
  // Validate required options for production
  if (process.env.NODE_ENV === 'production' && !options.secret) {
    throw new Error('Session secret is required in production');
  }

  // Initialize store and session manager
  const store = options.store || new MemoryStore();
  const sessionManager = new SessionManager({
    ...options,
    store, // Pass store to session manager
  });

  return async (req, res, next) => {
    try {
      // Extract session ID from cookie
      const signedSessionId = sessionManager.getCookie(req);
      let sessionId = null;
      let sessionData = {};

      // Verify and load existing session
      if (signedSessionId) {
        sessionId = sessionManager.unsignSessionId(signedSessionId);
        if (sessionId) {
          const existingSession = await store.get(sessionId);
          if (existingSession) {
            sessionData = existingSession;

            // Extend session if rolling sessions are enabled
            if (sessionManager.rolling) {
              await store.touch(sessionId, sessionManager.maxAge);
            }
          } else {
            // Session expired or doesn't exist
            sessionId = null;
          }
        }
      }

      // Create session object with methods
      req.session = {
        id: sessionId,
        data: sessionData,

        /**
         * Save data to session
         * @param {Object} data - Data to save
         * @returns {Promise<void>}
         */
        save: async (data = {}) => {
          // Create new session if doesn't exist
          if (!sessionId) {
            sessionId = sessionManager.generateSessionId();
            req.session.id = sessionId;

            // Set cookie
            const signedId = sessionManager.signSessionId(sessionId);
            sessionManager.setCookie(res, signedId);
          }

          // Merge data
          req.session.data = { ...req.session.data, ...data };

          // Add metadata
          req.session.data._createdAt =
            req.session.data._createdAt || Date.now();
          req.session.data._updatedAt = Date.now();

          // Save to store
          await store.set(sessionId, req.session.data, sessionManager.maxAge);
        },

        /**
         * Destroy session completely
         * @returns {Promise<void>}
         */
        destroy: async () => {
          if (sessionId) {
            await store.destroy(sessionId);
            sessionManager.clearCookie(res);
            req.session.id = null;
            req.session.data = {};
          }
        },

        /**
         * Regenerate session ID (prevents session fixation attacks)
         * @returns {Promise<void>}
         */
        regenerate: async () => {
          const currentData = { ...req.session.data };

          // Destroy old session
          if (sessionId) {
            await store.destroy(sessionId);
          }

          // Create new session with same data
          sessionId = sessionManager.generateSessionId();
          req.session.id = sessionId;

          // Set new cookie
          const signedId = sessionManager.signSessionId(sessionId);
          sessionManager.setCookie(res, signedId);

          // Save data to new session
          if (Object.keys(currentData).length > 0) {
            currentData._updatedAt = Date.now();
            await store.set(sessionId, currentData, sessionManager.maxAge);
          }
        },

        /**
         * Touch session to extend expiry
         * @returns {Promise<void>}
         */
        touch: async () => {
          if (sessionId) {
            await store.touch(sessionId, sessionManager.maxAge);
          }
        },

        /**
         * Check if session exists and is active
         * @returns {boolean}
         */
        isActive: () => {
          return sessionId !== null;
        },

        /**
         * Get session age in milliseconds
         * @returns {number|null}
         */
        getAge: () => {
          const createdAt = req.session.data._createdAt;
          return createdAt ? Date.now() - createdAt : null;
        },
      };

      next();
    } catch (error) {
      // Log error but don't break the request
      console.error('Session middleware error:', error);

      // Provide empty session on error
      req.session = {
        id: null,
        data: {},
        save: async () => {},
        destroy: async () => {},
        regenerate: async () => {},
        touch: async () => {},
        isActive: () => false,
        getAge: () => null,
      };

      next();
    }
  };
}

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
export function createSessionAuthMiddleware(options = {}) {
  const {
    loginUrl = '/login',
    userKey = 'user',
    getUser = (sessionData) => sessionData[userKey],
    onAuthRequired,
  } = options;

  return async (req, res, next) => {
    try {
      // Check if session exists
      if (!req.session || !req.session.isActive()) {
        throw new Error('No active session');
      }

      // Extract user from session
      const user = getUser(req.session.data);

      if (!user) {
        throw new Error('No user in session');
      }

      // Add user to request
      req.user = user;

      next();
    } catch (error) {
      // Handle authentication required
      if (onAuthRequired) {
        return onAuthRequired(req, res, next, error);
      }

      // Default behavior based on request type
      const isApiRequest =
        req.headers.accept?.includes('application/json') ||
        req.path?.startsWith('/api/') ||
        req.url?.startsWith('/api/');

      if (isApiRequest) {
        // API request - return JSON error
        if (res.status && res.json) {
          return res.status(401).json({
            error: 'Authentication required',
            message: 'Please log in to access this resource',
            loginUrl,
          });
        } else {
          // Fallback for frameworks without res.status/json
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify({
              error: 'Authentication required',
              message: 'Please log in to access this resource',
              loginUrl,
            })
          );
        }
      } else {
        // Web request - redirect to login
        if (res.redirect && typeof res.redirect === 'function') {
          return res.redirect(loginUrl);
        } else {
          // Fallback for frameworks without redirect method
          res.statusCode = 302;
          res.setHeader('Location', loginUrl);
          return res.end();
        }
      }
    }
  };
}

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
export function createSessionAuthorizationMiddleware(
  allowedRoles,
  options = {}
) {
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];
  const {
    roleKey = 'role',
    getRoles = (user) => {
      const userRole = user[roleKey];
      return Array.isArray(userRole) ? userRole : [userRole].filter(Boolean);
    },
  } = options;

  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new Error('Authentication required before authorization');
      }

      // Get user roles
      const userRoles = getRoles(req.user);

      if (!userRoles || userRoles.length === 0) {
        throw new Error('No roles found for user');
      }

      // Check if user has any of the required roles
      const hasRequiredRole = rolesArray.some((role) =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        throw new Error('Insufficient permissions');
      }

      next();
    } catch (error) {
      // Always return 403 for authorization failures
      const isApiRequest =
        req.headers.accept?.includes('application/json') ||
        req.path?.startsWith('/api/') ||
        req.url?.startsWith('/api/');

      if (isApiRequest) {
        if (res.status && res.json) {
          return res.status(403).json({
            error: 'Access forbidden',
            message: error.message,
            requiredRoles: rolesArray,
          });
        } else {
          // Fallback for frameworks without res.status/json
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify({
              error: 'Access forbidden',
              message: error.message,
              requiredRoles: rolesArray,
            })
          );
        }
      } else {
        // For web requests, show a 403 page
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        return res.end('Access Forbidden: Insufficient permissions');
      }
    }
  };
}
