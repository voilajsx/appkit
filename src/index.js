/**
 * @voilajsx/appkit - Ultra-minimal, tree-shakable Node.js application toolkit
 *
 * This file provides direct access to individual module entry points for optimal tree-shaking.
 * Import only what you need - unused code will be automatically eliminated by modern bundlers.
 *
 * @module @voilajsx/appkit
 *
 * @example
 * // ✅ Perfect tree-shaking - only specific modules bundled
 * import { authenticator } from '@voilajsx/appkit/auth';
 * import { database } from '@voilajsx/appkit/database';
 *
 * // ✅ Also tree-shakable - but imports main index
 * import { authenticator, database } from '@voilajsx/appkit';
 *
 * // ❌ Avoid - imports everything
 * import * as appkit from '@voilajsx/appkit';
 */

/**
 * Library version
 * @type {string}
 */
export const VERSION = '1.0.16';

/**
 * Library name
 * @type {string}
 */
export const NAME = '@voilajsx/appkit';

/**
 * Supported Node.js version
 * @type {string}
 */
export const NODE_VERSION = '>=18.0.0';

/**
 * Re-export main entry functions for convenience (tree-shakable)
 * Each import only loads the specific module needed
 */

// Authentication
export { authenticator } from './auth/index.js';

// Configuration
export { configure } from './config/index.js';

// Security
export { security } from './security/index.js';

// Database
export { database } from './database/index.js';

// Caching
export { caching } from './cache/index.js';

// Email
export { emailing } from './email/index.js';

// Error handling
export { error } from './error/index.js';

// Logging
export { logger } from './logging/index.js';

// Queuing
export { queuing } from './queue/index.js';

// Storage
export { store } from './storage/index.js';

// Utilities
export { utility } from './utils/index.js';

/**
 * Quick health check for the library
 * @returns {Object} Basic library information
 */
export function getLibraryInfo() {
  return {
    name: NAME,
    version: VERSION,
    nodeVersion: NODE_VERSION,
    timestamp: new Date().toISOString(),
  };
}
