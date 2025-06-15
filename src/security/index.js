/**
 * @voilajsx/appkit - Production-ready security utilities
 * @module @voilajsx/appkit/security
 * @file src/security/index.js
 *
 * Independent security module with environment-first design and smart defaults.
 */

// Form protection (1)
export { protectForms } from './csrf.js';

// Rate limiting (1)
export { limitRequests } from './rateLimiter.js';

// Input cleaning (3)
export { cleanInput, cleanHtml, escapeHtml } from './sanitizer.js';

// Data encryption (3)
export { encryptData, decryptData, generateKey } from './encryption.js';
