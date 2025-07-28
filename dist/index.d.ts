/**
 * @voilajsx/appkit - Ultra-minimal, tree-shakable Node.js application toolkit
 *
 * This file provides direct access to individual module entry points for optimal tree-shaking.
 * Import only what you need - unused code will be automatically eliminated by modern bundlers.
 *
 * @module @voilajsx/appkit
 * @file src/index.ts
 *
 * @example
 * // ✅ Perfect tree-shaking - only specific modules bundled
 * import { authClass } from '@voilajsx/appkit/auth';
 * import { databaseClass } from '@voilajsx/appkit/database';
 *
 * // ✅ Also tree-shakable - but imports main index
 * import { authClass, databaseClass } from '@voilajsx/appkit';
 *
 * // ❌ Avoid - imports everything
 * import * as appkit from '@voilajsx/appkit';
 */
/**
 * Library name
 * @type {string}
 */
export declare const NAME = "@voilajsx/appkit";
/**
 * Supported Node.js version
 * @type {string}
 */
export declare const NODE_VERSION = ">=18.0.0";
/**
 * Re-export main entry functions for convenience (tree-shakable)
 * Each import only loads the specific module needed
 *
 * Pattern: {folderName}Class.get() → creates {folderName} instance
 */
export { authClass } from './auth/index.js';
export { configClass } from './config/index.js';
export { securityClass } from './security/index.js';
export { databaseClass } from './database/index.js';
export { cacheClass } from './cache/index.js';
export { emailClass } from './email/index.js';
export { eventClass } from './event/index.js';
export { errorClass } from './error/index.js';
export { loggerClass } from './logger/index.js';
export { queueClass } from './queue/index.js';
export { storageClass } from './storage/index.js';
export { utilClass } from './util/index.js';
/**
 * Quick health check for the library
 * @returns {Object} Basic library information
 */
export declare function getLibraryInfo(): {
    name: string;
    nodeVersion: string;
    timestamp: string;
};
//# sourceMappingURL=index.d.ts.map