/**
 * @voilajsx/appkit - Authentication module
 * @module @voilajsx/appkit/auth
 * @file src/auth/index.js
 */

// Main exports file - re-exports all auth utilities
export { generateToken, verifyToken } from './jwt.js';
export { hashPassword, comparePassword } from './password.js';
export {
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from './middleware.js';
