/**
 * @voilajs/appkit - Session management utilities
 * @module @voilajs/appkit/session
 */

// Core middleware
export {
  createSessionMiddleware,
  createSessionAuth,
  createSessionRoleAuth,
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
