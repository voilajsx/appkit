/**
 * Unified database API - single or multi-tenant with auto-discovery
 * @module @voilajsx/appkit/db
 * @file src/db/index.js
 */

import { DatabaseClass } from './database.js';
import { getSmartDefaults } from './defaults.js';

// Global database instances cache
const instances = new Map();

/**
 * Get database instance - unified API for single and multi-tenant
 * @param {object} [config] - Optional configuration overrides
 * @returns {DatabaseClass} Database instance with all methods
 */
function get(config = {}) {
  // Create cache key based on config
  const cacheKey = JSON.stringify(config);

  if (!instances.has(cacheKey)) {
    const defaults = getSmartDefaults();
    const finalConfig = {
      ...defaults,
      ...config,
      // Ensure app name is detected if not provided
      database: {
        ...defaults.database,
        ...config.database,
        appName:
          config.database?.appName || config.appName || defaults.database.appId,
      },
    };

    const instance = new DatabaseClass(finalConfig);
    instances.set(cacheKey, instance);
  }

  return instances.get(cacheKey);
}

/**
 * Simple database API with auto-discovery
 */
export const database = {
  /**
   * Get database client - auto-detects app (your working pattern)
   * @param {string} [appName] - App name (auto-detected if not provided)
   * @param {object} [config] - Additional config
   * @returns {Promise<Object>} Prisma client
   */
  async get(appName = null, config = {}) {
    const db = get({
      ...config,
      appName,
      database: {
        ...config.database,
        tenant: false, // Single-tenant mode
        appName,
      },
    });

    return await db.client();
  },

  /**
   * Get multi-tenant client
   * @param {string} tenantId - Tenant ID
   * @param {string} [appName] - App name (auto-detected if not provided)
   * @param {object} [config] - Additional config
   * @returns {Promise<Object>} Tenant-specific Prisma client
   */
  async tenant(tenantId, appName = null, config = {}) {
    const db = get({
      ...config,
      appName,
      database: {
        ...config.database,
        tenant: true, // Enable multi-tenant
        appName,
      },
    });

    return await db.tenant(tenantId);
  },

  /**
   * Health check for app
   * @param {string} [appName] - App name (auto-detected if not provided)
   * @returns {Promise<Object>} Health status
   */
  async health(appName = null) {
    const db = get({ appName });
    return await db.health();
  },

  /**
   * List available apps
   * @returns {Promise<string[]>} Array of app names
   */
  async apps() {
    const db = get();
    // Use the Prisma adapter's discovery
    if (db.adapter && db.adapter.discoverApps) {
      const apps = await db.adapter.discoverApps();
      return apps.map((app) => app.name);
    }
    return [];
  },
};

/**
 * Legacy compatibility exports
 */
export { DatabaseClass } from './database.js';
export { getSmartDefaults } from './defaults.js';
export { createMiddleware } from './middleware.js';

// Default export for simple usage
export default database;
