/**
 * Ultra-simple object-driven authentication that just works
 * @module @voilajsx/appkit/auth
 * @file src/auth/index.js
 */

import { AuthenticationClass } from './authentication.js';
import { getSmartDefaults } from './defaults.js';

// Global authentication instance for performance
let globalAuthentication = null;

/**
 * Get authentication instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @param {object} [overrides] - Optional configuration overrides
 * @returns {AuthenticationClass} Authentication instance with all methods
 */
function get(overrides = {}) {
  // Lazy initialization - parse environment once
  if (!globalAuthentication) {
    const defaults = getSmartDefaults();
    const config = { ...defaults, ...overrides };
    globalAuthentication = new AuthenticationClass(config);
  }

  return globalAuthentication;
}

/**
 * Single authentication export with minimal functionality
 */
export const authenticator = {
  get,
};
