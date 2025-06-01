/**
 * @voilajsx/appkit - Session management utilities
 * @module @voilajsx/appkit/session
 * @file src/session/index.js
 */

// Core middleware
export {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
} from './middleware.js';

// Session stores
export { MemoryStore, FileStore, RedisStore } from './stores.js';

// Utilities (for advanced usage)
export {
  SessionManager,
  createSessionSecret,
  validateSessionConfig,
  sanitizeSessionData,
} from './utils.js';
