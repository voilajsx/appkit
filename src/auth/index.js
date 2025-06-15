/**
 * @voilajsx/appkit - Authentication module
 * @module @voilajsx/appkit/auth
 * @file src/auth/index.js
 */

// Export all functions with developer-friendly names
export { signToken, verifyToken } from './jwt.js';
export { hashPassword, comparePassword } from './password.js';
export { requireAuth, requireRole } from './middleware.js';
