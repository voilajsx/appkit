/**
 * Simplified Database API - org/tenant with auto app detection and vector support
 *
 * Environment Variables Required:
 * - DATABASE_URL: PostgreSQL connection string
 *
 * Environment Variables Optional:
 * - VOILA_DB_ORGS: Enable organization mode (true/false)
 * - VOILA_DB_TENANTS: Enable tenant mode (true/false)
 * - VOILA_DB_VECTORS: Enable vector operations (true/false)
 *
 * Usage Examples:
 * - const db = await database.get()
 * - const tenantDB = await database.tenant('team-1')
 * - const orgDB = await database.org('acme').get()
 * - const vectorDB = await database.vectors()
 *
 * @module @voilajsx/appkit/db
 * @file src/db/index.js
 */

import { DatabaseClass } from './database.js';
import {
  getSmartDefaults,
  validateApiUsage,
  createApiError,
  createDatabaseError,
} from './defaults.js';

// Global database instances cache
const instances = new Map();

/**
 * Organization Database - provides tenant and vector methods within organization
 */
class OrgDatabase {
  constructor(orgId, config) {
    this.orgId = orgId;
    this.config = config;
  }

  /**
   * Get tenant-specific database within organization
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<any>} Database client
   */
  async tenant(tenantId) {
    const db = this._getDatabase();
    return await db.tenant(tenantId, { orgId: this.orgId });
  }

  /**
   * Get organization database (no tenant filtering)
   * @returns {Promise<any>} Database client
   */
  async get() {
    const db = this._getDatabase();
    return await db.client({ orgId: this.orgId });
  }

  /**
   * Get vector operations for this organization
   * @returns {Promise<any>} Vector-enabled database client
   */
  async vectors() {
    if (!this.config.vector.enabled) {
      throw createDatabaseError(createApiError('vectors', this.config), 400);
    }

    const db = this._getDatabase();
    const orgClient = await db.client({ orgId: this.orgId });
    return orgClient; // Same database, vector tables
  }

  /**
   * @private
   */
  _getDatabase() {
    const cacheKey = `org_${this.orgId}`;
    if (!instances.has(cacheKey)) {
      const instance = new DatabaseClass({
        ...this.config,
        orgId: this.orgId,
      });
      instances.set(cacheKey, instance);
    }
    return instances.get(cacheKey);
  }
}

/**
 * Main Database API - clean and minimal
 */
export const database = {
  /**
   * Get database client (auto-detects current app from file path)
   * @returns {Promise<any>} Database client
   */
  async get() {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.client();
  },

  /**
   * Get organization database - enables tenant method
   * @param {string} orgId - Organization ID
   * @returns {OrgDatabase} Organization database instance
   */
  org(orgId) {
    const config = getSmartDefaults();

    // Validate org mode is enabled
    if (!config.database.org) {
      throw createDatabaseError(createApiError('org', config), 400);
    }

    return new OrgDatabase(orgId, config);
  },

  /**
   * Get tenant database directly (only when orgs disabled)
   * @param {string} tenantId - Tenant ID
   * @returns {Promise<any>} Tenant-specific database client
   */
  async tenant(tenantId) {
    const config = getSmartDefaults();
    const usage = validateApiUsage(config);

    // Validate direct tenant usage is allowed
    if (!usage.allowDirectTenant) {
      throw createDatabaseError(createApiError('tenant', config), 400);
    }

    const db = this._getDatabase('main', config);
    return await db.tenant(tenantId);
  },

  /**
   * Get vector operations (same database, vector tables)
   * @returns {Promise<any>} Vector-enabled database client
   */
  async vectors() {
    const config = getSmartDefaults();

    // Validate vector mode is enabled
    if (!config.vector.enabled) {
      throw createDatabaseError(createApiError('vectors', config), 400);
    }

    const db = this._getDatabase('main', config);
    const client = await db.client();
    return client; // Same database, vector tables
  },

  /**
   * Health check for current app
   * @returns {Promise<Object>} Health status
   */
  async health() {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.health();
  },

  /**
   * List discovered apps
   * @returns {Promise<string[]>} Array of app names
   */
  async apps() {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);

    if (db.adapter?.discoverApps) {
      const apps = await db.adapter.discoverApps();
      return apps.map((app) => app.name);
    }

    return [];
  },

  /**
   * Configure database URL (convenience method)
   * @param {string} url - Database URL
   */
  configure(url) {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = url;
    }
  },

  /**
   * Create tenant (explicit creation)
   * @param {string} tenantId - Tenant ID
   * @param {Object} [options] - Options
   * @param {string} [options.orgId] - Organization ID
   * @returns {Promise<void>}
   */
  async createTenant(tenantId, options = {}) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.createTenant(tenantId, options);
  },

  /**
   * Delete tenant and all its data
   * @param {string} tenantId - Tenant ID
   * @param {Object} options - Options
   * @param {string} [options.orgId] - Organization ID
   * @param {boolean} options.confirm - Confirmation flag (required)
   * @returns {Promise<void>}
   */
  async deleteTenant(tenantId, options) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.deleteTenant(tenantId, options);
  },

  /**
   * Check if tenant exists
   * @param {string} tenantId - Tenant ID
   * @param {Object} [options] - Options
   * @param {string} [options.orgId] - Organization ID
   * @returns {Promise<boolean>}
   */
  async exists(tenantId, options = {}) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.exists(tenantId, options);
  },

  /**
   * List all tenants
   * @param {Object} [options] - Options
   * @param {string} [options.orgId] - Organization ID
   * @param {Function} [options.filter] - Filter function
   * @param {number} [options.limit] - Limit results
   * @returns {Promise<string[]>}
   */
  async list(options = {}) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.list(options);
  },

  /**
   * Create organization
   * @param {string} orgId - Organization ID
   * @param {Object} [options] - Options
   * @param {boolean} [options.confirm] - Confirmation flag
   * @returns {Promise<void>}
   */
  async createOrg(orgId, options = {}) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.createOrg(orgId, options);
  },

  /**
   * Delete organization and all its data
   * @param {string} orgId - Organization ID
   * @param {Object} options - Options
   * @param {boolean} options.confirm - Confirmation flag (required)
   * @returns {Promise<void>}
   */
  async deleteOrg(orgId, options) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.deleteOrg(orgId, options);
  },

  /**
   * Check if organization exists
   * @param {string} orgId - Organization ID
   * @returns {Promise<boolean>}
   */
  async orgExists(orgId) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (db.strategy && typeof db.strategy.orgExists === 'function') {
      return await db.strategy.orgExists(orgId);
    }
    return false;
  },

  /**
   * List all organizations
   * @returns {Promise<string[]>}
   */
  async listOrgs() {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (db.strategy && typeof db.strategy.listOrgs === 'function') {
      return await db.strategy.listOrgs();
    }
    return [];
  },

  /**
   * Get organization URL resolver metrics (enterprise feature)
   * @returns {Promise<Object>} Metrics object
   */
  async getOrgResolverMetrics() {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (
      db.strategy &&
      db.strategy.urlResolver &&
      typeof db.strategy.urlResolver.getMetrics === 'function'
    ) {
      return db.strategy.urlResolver.getMetrics();
    }
    return {
      cacheSize: 0,
      hitRate: 0,
      avgResolveTime: 0,
      circuitBreakerStatus: [],
    };
  },

  /**
   * Health check specific organization (enterprise feature)
   * @param {string} orgId - Organization ID
   * @returns {Promise<Object>} Health status
   */
  async checkOrgHealth(orgId) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (
      db.strategy &&
      db.strategy.urlResolver &&
      typeof db.strategy.urlResolver.healthCheck === 'function'
    ) {
      return await db.strategy.urlResolver.healthCheck(orgId);
    }
    return {
      healthy: false,
      error: 'Organization health check not available',
    };
  },

  /**
   * Force refresh organization URL (bypass cache)
   * @param {string} orgId - Organization ID
   * @returns {Promise<string>} Fresh URL
   */
  async refreshOrgUrl(orgId) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (
      db.strategy &&
      db.strategy.urlResolver &&
      typeof db.strategy.urlResolver.refreshOrg === 'function'
    ) {
      return await db.strategy.urlResolver.refreshOrg(orgId);
    }
    throw createDatabaseError('Organization URL refresh not available', 501);
  },

  /**
   * Clear organization URL cache
   * @param {string} [orgId] - Organization ID (optional, clears all if not provided)
   */
  clearOrgCache(orgId) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (
      db.strategy &&
      db.strategy.urlResolver &&
      typeof db.strategy.urlResolver.clearCache === 'function'
    ) {
      db.strategy.urlResolver.clearCache(orgId);
    }
  },

  /**
   * Preload organizations for faster access
   * @param {string[]} orgIds - Array of organization IDs
   * @returns {Promise<void>}
   */
  async preloadOrgs(orgIds) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (
      db.strategy &&
      db.strategy.urlResolver &&
      typeof db.strategy.urlResolver.preloadOrgs === 'function'
    ) {
      return await db.strategy.urlResolver.preloadOrgs(orgIds);
    }
  },

  /**
   * Manual circuit breaker control (development/testing)
   * @param {string} orgId - Organization ID
   * @param {string} state - 'open' or 'closed'
   */
  setOrgCircuitBreaker(orgId, state) {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    if (
      db.strategy &&
      db.strategy.urlResolver &&
      typeof db.strategy.urlResolver.setCircuitBreakerState === 'function'
    ) {
      db.strategy.urlResolver.setCircuitBreakerState(orgId, state);
    }
  },

  /**
   * Disconnect all connections and cleanup
   * @returns {Promise<void>}
   */
  async disconnect() {
    const disconnectPromises = [];

    for (const [key, instance] of instances) {
      disconnectPromises.push(
        instance
          .disconnect()
          .catch((error) =>
            console.warn(`Error disconnecting instance ${key}:`, error.message)
          )
      );
    }

    await Promise.all(disconnectPromises);
    instances.clear();
  },

  // Private helper methods

  /**
   * @private
   */
  _getDatabase(key, config) {
    if (!instances.has(key)) {
      const instance = new DatabaseClass(config);
      instances.set(key, instance);
    }
    return instances.get(key);
  },

  /**
   * Clear all cached instances (for testing)
   */
  _clearCache() {
    instances.clear();
  },
};

// Default export for convenience
export default database;

// Named exports for advanced usage
export { DatabaseClass } from './database.js';
export {
  getSmartDefaults,
  validateTenantId,
  validateOrgId,
  createDatabaseError,
} from './defaults.js';
export { createMiddleware } from './middleware.js';
