/**
 * Ultra-simple object-driven security that just works
 * @module @voilajsx/appkit/security
 * @file src/security/index.js
 */

import { SecurityClass } from './security.js';
import { getSmartDefaults } from './defaults.js';

// Global security instance for performance
let globalSecurity = null;

/**
 * Get security instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @param {object} [overrides] - Optional configuration overrides
 * @returns {SecurityClass} Security instance with all methods
 */
function get(overrides = {}) {
  // Lazy initialization - parse environment once
  if (!globalSecurity) {
    const defaults = getSmartDefaults();
    const config = { ...defaults, ...overrides };
    globalSecurity = new SecurityClass(config);
  }

  return globalSecurity;
}

/**
 * Single security export with minimal functionality
 */
export const security = {
  get,
};
