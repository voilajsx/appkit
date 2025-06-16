/**
 * Ultra-simple object-driven database that just works
 * @module @voilajsx/appkit/db
 * @file src/db/index.js
 */

import { DatabaseClass } from './database.js';
import { getSmartDefaults } from './defaults.js';

// Global database instance for performance
let globalDatabase = null;

/**
 * Get database instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @param {object} [overrides] - Optional configuration overrides
 * @returns {DatabaseClass} Database instance with all methods
 */
function get(overrides = {}) {
  // Lazy initialization - parse environment once
  if (!globalDatabase) {
    const defaults = getSmartDefaults();
    const config = { ...defaults, ...overrides };
    globalDatabase = new DatabaseClass(config);
  }

  return globalDatabase;
}

/**
 * Single database export with minimal functionality
 */
export const database = {
  get,
};
