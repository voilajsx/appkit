/**
 * Core database class with org/tenant support and smart connection management
 * @module @voilajsx/appkit/db
 * @file src/db/database.js
 */

import { RowStrategy } from './strategies/row.js';
import { OrgStrategy } from './strategies/org.js';
import { PrismaAdapter } from './adapters/prisma.js';
import { MongooseAdapter } from './adapters/mongoose.js';
import {
  createDatabaseError,
  validateTenantId,
  validateOrgId,
  validateSchema,
} from './defaults.js';

/**
 * Database class with built-in org/tenant support and connection management
 */
export class DatabaseClass {
  constructor(config) {
    this.config = config;
    this.strategy = null;
    this.adapter = null;
    this.initialized = false;
    this.connections = new Map(); // Cache connections
    this._setupCleanup();
  }

  /**
   * Gets database client (single-tenant mode or org-specific)
   * @param {Object} options - Options object
   * @param {string} [options.orgId] - Organization ID
   * @param {string} [options.tenantId] - Tenant ID
   * @returns {Promise<any>} Database client
   */
  async client(options = {}) {
    await this._initialize();

    // If tenant mode is enabled without org context, throw error
    if (
      this.config.database.tenant &&
      !this.config.database.org &&
      !options.tenantId
    ) {
      throw createDatabaseError(
        'Tenant mode is enabled. Use tenant(id) method or disable tenant mode.',
        400
      );
    }

    const cacheKey = this._buildCacheKey('client', options);

    if (this.connections.has(cacheKey)) {
      return this.connections.get(cacheKey);
    }

    try {
      const client = await this.adapter.createClient({
        url: this._buildConnectionUrl(options.orgId),
        ...options,
      });

      // Validate schema in development
      if (this.config.environment.isDevelopment) {
        validateSchema(client, this.config);
      }

      this.connections.set(cacheKey, client);
      return client;
    } catch (error) {
      throw createDatabaseError(
        `Failed to create database client: ${error.message}`,
        500
      );
    }
  }

  /**
   * Gets database client for specific tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} options - Options object
   * @param {string} [options.orgId] - Organization ID
   * @returns {Promise<any>} Database client
   */
  async tenant(tenantId, options = {}) {
    await this._initialize();

    if (!tenantId) {
      throw createDatabaseError('Tenant ID is required', 400);
    }

    if (!validateTenantId(tenantId)) {
      throw createDatabaseError(
        'Invalid tenant ID format. Use alphanumeric characters, underscores, and hyphens only',
        400
      );
    }

    const cacheKey = this._buildCacheKey('tenant', { tenantId, ...options });

    if (this.connections.has(cacheKey)) {
      return this.connections.get(cacheKey);
    }

    try {
      // Get connection from strategy
      const connection = await this.strategy.getConnection(
        tenantId,
        options.orgId
      );

      // Cache connection
      this.connections.set(cacheKey, connection);
      return connection;
    } catch (error) {
      throw createDatabaseError(
        `Failed to get tenant connection for '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new tenant
   * @param {string} tenantId - Tenant ID
   * @param {Object} options - Options object
   * @param {string} [options.orgId] - Organization ID
   * @returns {Promise<void>}
   */
  async createTenant(tenantId, options = {}) {
    await this._initialize();

    if (!tenantId) {
      throw createDatabaseError('Tenant ID is required', 400);
    }

    if (!validateTenantId(tenantId)) {
      throw createDatabaseError(
        'Invalid tenant ID format. Use alphanumeric characters, underscores, and hyphens only',
        400
      );
    }

    try {
      await this.strategy.createTenant(tenantId, options.orgId);
    } catch (error) {
      throw createDatabaseError(
        `Failed to create tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes a tenant and all its data
   * @param {string} tenantId - Tenant ID
   * @param {Object} options - Options object
   * @param {string} [options.orgId] - Organization ID
   * @param {boolean} [options.confirm] - Confirmation flag
   * @returns {Promise<void>}
   */
  async deleteTenant(tenantId, options = {}) {
    await this._initialize();

    if (!tenantId) {
      throw createDatabaseError('Tenant ID is required', 400);
    }

    // Safety check - require explicit confirmation
    if (!options.confirm) {
      throw createDatabaseError(
        'Tenant deletion requires explicit confirmation. Pass { confirm: true }',
        400
      );
    }

    try {
      // Remove from cache
      this._removeTenantFromCache(tenantId, options.orgId);

      await this.strategy.deleteTenant(tenantId, options.orgId);
    } catch (error) {
      throw createDatabaseError(
        `Failed to delete tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant exists
   * @param {string} tenantId - Tenant ID
   * @param {Object} options - Options object
   * @param {string} [options.orgId] - Organization ID
   * @returns {Promise<boolean>}
   */
  async exists(tenantId, options = {}) {
    await this._initialize();

    if (!tenantId) {
      return false;
    }

    try {
      return await this.strategy.tenantExists(tenantId, options.orgId);
    } catch (error) {
      throw createDatabaseError(
        `Failed to check tenant existence: ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all tenants
   * @param {Object} options - Options object
   * @param {string} [options.orgId] - Organization ID
   * @param {Function} [options.filter] - Filter function
   * @param {number} [options.limit] - Limit results
   * @returns {Promise<string[]>}
   */
  async list(options = {}) {
    await this._initialize();

    try {
      const tenants = await this.strategy.listTenants(options.orgId);

      // Apply filtering if provided
      let filtered = options.filter ? tenants.filter(options.filter) : tenants;

      // Apply limit if provided
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    } catch (error) {
      throw createDatabaseError(
        `Failed to list tenants: ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates an organization
   * @param {string} orgId - Organization ID
   * @param {Object} options - Options object
   * @param {boolean} [options.confirm] - Confirmation flag
   * @returns {Promise<void>}
   */
  async createOrg(orgId, options = {}) {
    if (!this.config.database.org) {
      throw createDatabaseError('Organization mode not enabled', 400);
    }

    await this._initialize();

    if (!orgId) {
      throw createDatabaseError('Organization ID is required', 400);
    }

    if (!validateOrgId(orgId)) {
      throw createDatabaseError(
        'Invalid organization ID format. Use alphanumeric characters, underscores, and hyphens only',
        400
      );
    }

    try {
      if (this.strategy instanceof OrgStrategy) {
        await this.strategy.createOrg(orgId);
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to create organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes an organization and all its data
   * @param {string} orgId - Organization ID
   * @param {Object} options - Options object
   * @param {boolean} [options.confirm] - Confirmation flag
   * @returns {Promise<void>}
   */
  async deleteOrg(orgId, options = {}) {
    if (!this.config.database.org) {
      throw createDatabaseError('Organization mode not enabled', 400);
    }

    await this._initialize();

    if (!orgId) {
      throw createDatabaseError('Organization ID is required', 400);
    }

    // Safety check - require explicit confirmation
    if (!options.confirm) {
      throw createDatabaseError(
        'Organization deletion requires explicit confirmation. Pass { confirm: true }',
        400
      );
    }

    try {
      // Remove from cache
      this._removeOrgFromCache(orgId);

      if (this.strategy instanceof OrgStrategy) {
        await this.strategy.deleteOrg(orgId);
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to delete organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Gets health status of database connections
   * @returns {Promise<Object>} Health status
   */
  async health() {
    const status = {
      healthy: true,
      connections: this.connections.size,
      strategy: this.config.database.strategy,
      adapter: this.config.database.adapter,
      org: this.config.database.org,
      tenant: this.config.database.tenant,
    };

    try {
      await this._initialize();

      // Test basic connection
      const testClient = await this.client();

      // Simple health check - try to access the client
      if (testClient.$queryRaw || testClient.db) {
        // Connection is healthy
      }
    } catch (error) {
      status.healthy = false;
      status.error = error.message;
    }

    return status;
  }

  /**
   * Disconnects all connections and cleans up
   * @returns {Promise<void>}
   */
  async disconnect() {
    // Close all cached connections
    const disconnectPromises = [];

    for (const [key, connection] of this.connections) {
      disconnectPromises.push(this._closeConnection(connection, key));
    }

    await Promise.all(disconnectPromises);
    this.connections.clear();

    // Disconnect strategy and adapter
    if (this.strategy) {
      await this.strategy.disconnect();
    }

    if (this.adapter) {
      await this.adapter.disconnect();
    }

    this.initialized = false;
  }

  // Private helper methods

  /**
   * Lazy initialization of strategy and adapter
   * @private
   */
  async _initialize() {
    if (this.initialized) return;

    if (!this.config.database.url) {
      throw createDatabaseError(
        'Database URL required. Set DATABASE_URL environment variable',
        500
      );
    }

    // Initialize adapter
    const AdapterClass = this._getAdapterClass();
    this.adapter = new AdapterClass({
      url: this.config.database.url,
    });

    // Initialize strategy
    const StrategyClass = this._getStrategyClass();
    this.strategy = new StrategyClass(this.config, this.adapter);

    this.initialized = true;
  }

  /**
   * Gets adapter class by name
   * @private
   */
  _getAdapterClass() {
    const adapters = {
      prisma: PrismaAdapter,
      mongoose: MongooseAdapter,
    };

    const AdapterClass = adapters[this.config.database.adapter];
    if (!AdapterClass) {
      throw createDatabaseError(
        `Unknown adapter: ${this.config.database.adapter}. Supported: ${Object.keys(adapters).join(', ')}`,
        500
      );
    }

    return AdapterClass;
  }

  /**
   * Gets strategy class by name
   * @private
   */
  _getStrategyClass() {
    const strategies = {
      row: RowStrategy,
      org: OrgStrategy,
    };

    const StrategyClass = strategies[this.config.database.strategy];
    if (!StrategyClass) {
      throw createDatabaseError(
        `Unknown strategy: ${this.config.database.strategy}. Supported: ${Object.keys(strategies).join(', ')}`,
        500
      );
    }

    return StrategyClass;
  }

  /**
   * Builds connection URL for organization
   * @private
   */
  _buildConnectionUrl(orgId) {
    const baseUrl = this.config.database.url;

    if (!orgId || this.config.database.strategy !== 'org') {
      return baseUrl;
    }

    // Replace {org} placeholder in URL
    if (baseUrl.includes('{org}')) {
      return baseUrl.replace('{org}', orgId);
    }

    // Append org to database name
    const urlParts = baseUrl.match(/^(.*\/)([^/?]+)(.*)$/);
    if (urlParts) {
      return `${urlParts[1]}${orgId}_${urlParts[2]}${urlParts[3]}`;
    }

    return baseUrl;
  }

  /**
   * Builds cache key for connections
   * @private
   */
  _buildCacheKey(type, options = {}) {
    const parts = [type];

    if (options.orgId) parts.push(`org:${options.orgId}`);
    if (options.tenantId) parts.push(`tenant:${options.tenantId}`);

    return parts.join('_');
  }

  /**
   * Removes tenant connections from cache
   * @private
   */
  _removeTenantFromCache(tenantId, orgId) {
    const keysToRemove = [];

    for (const [key] of this.connections) {
      if (key.includes(`tenant:${tenantId}`)) {
        if (!orgId || key.includes(`org:${orgId}`)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => {
      const connection = this.connections.get(key);
      if (connection) {
        this._closeConnection(connection, key);
      }
      this.connections.delete(key);
    });
  }

  /**
   * Removes organization connections from cache
   * @private
   */
  _removeOrgFromCache(orgId) {
    const keysToRemove = [];

    for (const [key] of this.connections) {
      if (key.includes(`org:${orgId}`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      const connection = this.connections.get(key);
      if (connection) {
        this._closeConnection(connection, key);
      }
      this.connections.delete(key);
    });
  }

  /**
   * Closes a database connection
   * @private
   */
  async _closeConnection(connection, key) {
    try {
      if (connection.$disconnect) {
        await connection.$disconnect();
      } else if (connection.close) {
        await connection.close();
      }
    } catch (error) {
      console.warn(`Error closing connection ${key}:`, error.message);
    }
  }

  /**
   * Sets up cleanup handlers
   * @private
   */
  _setupCleanup() {
    const cleanup = async () => {
      try {
        await this.disconnect();
      } catch (error) {
        console.error('Error during database cleanup:', error);
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('beforeExit', cleanup);
  }
}
