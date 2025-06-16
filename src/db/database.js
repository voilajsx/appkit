/**
 * Core database class with built-in tenant support and smart connection management
 * @module @voilajsx/appkit/db
 * @file src/db/database.js
 */

import { RowStrategy } from './strategies/row.js';
import { DatabaseStrategy } from './strategies/database.js';
import { PrismaAdapter } from './adapters/prisma.js';
import { MongooseAdapter } from './adapters/mongoose.js';
import { createDatabaseError, validateTenantId } from './defaults.js';

/**
 * Database class with built-in tenant support and connection management
 */
export class DatabaseClass {
  /**
   * Creates a new Database instance
   * @param {object} [config={}] - Database configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.strategy = null;
    this.adapter = null;
    this.initialized = false;
    this.connections = new Map(); // Cache tenant connections
  }

  /**
   * Lazy initialization of strategy and adapter
   * @private
   */
  async _initialize() {
    if (this.initialized) return;

    if (!this.config.database?.url) {
      throw createDatabaseError(
        'Database URL required. Set VOILA_DB_URL or DATABASE_URL environment variable',
        500
      );
    }

    // Initialize adapter
    const AdapterClass = this._getAdapterClass(this.config.database.adapter);
    this.adapter = new AdapterClass({
      url: this.config.database.url,
      ...this.config.connection,
    });

    // Initialize strategy
    const StrategyClass = this._getStrategyClass(this.config.database.strategy);
    this.strategy = new StrategyClass(
      {
        url: this.config.database.url,
        ...this.config.tenant,
      },
      this.adapter
    );

    this.initialized = true;

    // Setup cleanup on process exit
    this._setupCleanup();
  }

  /**
   * Gets database client (single-tenant mode)
   * @param {Object} [options] - Connection options
   * @returns {Promise<Object>} Database client
   */
  async client(options = {}) {
    await this._initialize();

    // If tenant mode is disabled, return simple client
    if (!this.config.database.tenant) {
      return this.adapter.createClient({
        url: this.config.database.url,
        ...options,
      });
    }

    throw createDatabaseError(
      'Tenant mode is enabled. Use tenant(id) method instead of client()',
      400
    );
  }

  /**
   * Gets database client for specific tenant
   * @param {string} tenantId - Tenant identifier
   * @param {Object} [options] - Connection options
   * @returns {Promise<Object>} Tenant-specific database client
   */
  async tenant(tenantId, options = {}) {
    await this._initialize();

    if (!tenantId) {
      throw createDatabaseError('Tenant ID is required', 400);
    }

    if (this.config.tenant.validation && !validateTenantId(tenantId)) {
      throw createDatabaseError(
        'Invalid tenant ID format. Use alphanumeric characters, underscores, and hyphens only',
        400
      );
    }

    // Check cache first
    const cacheKey = `${tenantId}:${JSON.stringify(options)}`;
    if (this.connections.has(cacheKey)) {
      return this.connections.get(cacheKey);
    }

    // Get connection from strategy
    const connection = await this.strategy.getConnection(tenantId);

    // Cache connection
    this.connections.set(cacheKey, connection);

    return connection;
  }

  /**
   * Creates a new tenant
   * @param {string} tenantId - Tenant identifier
   * @param {Object} [options] - Creation options
   * @returns {Promise<void>}
   */
  async createTenant(tenantId, options = {}) {
    await this._initialize();

    if (!tenantId) {
      throw createDatabaseError('Tenant ID is required', 400);
    }

    if (this.config.tenant.validation && !validateTenantId(tenantId)) {
      throw createDatabaseError(
        'Invalid tenant ID format. Use alphanumeric characters, underscores, and hyphens only',
        400
      );
    }

    // Check if tenant already exists
    if (await this.exists(tenantId)) {
      if (!options.force) {
        throw createDatabaseError(`Tenant '${tenantId}' already exists`, 409);
      }
    }

    try {
      await this.strategy.createTenant(tenantId);
    } catch (error) {
      throw createDatabaseError(
        `Failed to create tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes a tenant and all its data
   * @param {string} tenantId - Tenant identifier
   * @param {Object} [options] - Deletion options
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

    // Check if tenant exists
    if (!(await this.exists(tenantId))) {
      throw createDatabaseError(`Tenant '${tenantId}' not found`, 404);
    }

    try {
      // Remove from cache
      for (const [key] of this.connections) {
        if (key.startsWith(`${tenantId}:`)) {
          this.connections.delete(key);
        }
      }

      await this.strategy.deleteTenant(tenantId);
    } catch (error) {
      throw createDatabaseError(
        `Failed to delete tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant exists
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<boolean>} True if tenant exists
   */
  async exists(tenantId) {
    await this._initialize();

    if (!tenantId) {
      return false;
    }

    try {
      return await this.strategy.tenantExists(tenantId);
    } catch (error) {
      throw createDatabaseError(
        `Failed to check tenant existence: ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all tenants
   * @param {Object} [options] - List options
   * @returns {Promise<string[]>} Array of tenant IDs
   */
  async list(options = {}) {
    await this._initialize();

    try {
      const tenants = await this.strategy.listTenants();

      // Apply filtering if provided
      if (options.filter) {
        return tenants.filter(options.filter);
      }

      // Apply limit if provided
      if (options.limit) {
        return tenants.slice(0, options.limit);
      }

      return tenants;
    } catch (error) {
      throw createDatabaseError(
        `Failed to list tenants: ${error.message}`,
        500
      );
    }
  }

  /**
   * Gets middleware function for Express/Fastify
   * @param {Object} [options] - Middleware options
   * @returns {Function} Middleware function
   */
  middleware(options = {}) {
    const middlewareOptions = {
      ...this.config.middleware,
      ...options,
    };

    return async (req, res, next) => {
      try {
        // Extract tenant ID from request
        const tenantId = this._extractTenantId(req, middlewareOptions);

        if (!tenantId) {
          if (middlewareOptions.required) {
            const error = createDatabaseError('Tenant ID is required', 400);
            return this._handleMiddlewareError(error, req, res, next);
          }

          // If not required, continue without tenant context
          return next();
        }

        // Validate tenant ID
        if (this.config.tenant.validation && !validateTenantId(tenantId)) {
          const error = createDatabaseError('Invalid tenant ID format', 400);
          return this._handleMiddlewareError(error, req, res, next);
        }

        // Check if tenant exists (if not auto-create)
        if (!this.config.tenant.autoCreate) {
          const exists = await this.exists(tenantId);
          if (!exists) {
            const error = createDatabaseError(
              `Tenant '${tenantId}' not found`,
              404
            );
            return this._handleMiddlewareError(error, req, res, next);
          }
        }

        // Set tenant database connection
        req.db = await this.tenant(tenantId);
        req.tenantId = tenantId;

        next();
      } catch (error) {
        this._handleMiddlewareError(error, req, res, next);
      }
    };
  }

  /**
   * Disconnects all connections and cleans up
   * @returns {Promise<void>}
   */
  async disconnect() {
    // Close all cached connections
    for (const [key, connection] of this.connections) {
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

  /**
   * Gets health status of database connections
   * @returns {Promise<Object>} Health status
   */
  async health() {
    await this._initialize();

    const status = {
      healthy: true,
      connections: this.connections.size,
      strategy: this.config.database.strategy,
      adapter: this.config.database.adapter,
      tenant: this.config.database.tenant,
    };

    try {
      // Test basic connection
      if (this.config.database.tenant) {
        // Test with a sample tenant for tenant mode
        const testTenants = await this.list({ limit: 1 });
        if (testTenants.length > 0) {
          await this.tenant(testTenants[0]);
        }
      } else {
        // Test simple client connection
        const testClient = await this.client();
        if (testClient.$disconnect) {
          await testClient.$disconnect();
        } else if (testClient.close) {
          await testClient.close();
        }
      }
    } catch (error) {
      status.healthy = false;
      status.error = error.message;
    }

    return status;
  }

  // Private helper methods

  /**
   * Gets adapter class by name
   * @private
   */
  _getAdapterClass(adapterName) {
    const adapters = {
      prisma: PrismaAdapter,
      mongoose: MongooseAdapter,
    };

    const AdapterClass = adapters[adapterName];
    if (!AdapterClass) {
      throw createDatabaseError(
        `Unknown adapter: ${adapterName}. Supported: ${Object.keys(adapters).join(', ')}`,
        500
      );
    }

    return AdapterClass;
  }

  /**
   * Gets strategy class by name
   * @private
   */
  _getStrategyClass(strategyName) {
    const strategies = {
      row: RowStrategy,
      database: DatabaseStrategy,
    };

    const StrategyClass = strategies[strategyName];
    if (!StrategyClass) {
      throw createDatabaseError(
        `Unknown strategy: ${strategyName}. Supported: ${Object.keys(strategies).join(', ')}`,
        500
      );
    }

    return StrategyClass;
  }

  /**
   * Extracts tenant ID from request
   * @private
   */
  _extractTenantId(req, options) {
    return (
      req.headers[options.headerName] ||
      req.params?.[options.paramName] ||
      req.query?.[options.queryName] ||
      req.tenant?.id ||
      req.user?.tenantId ||
      req.body?.[options.paramName] ||
      null
    );
  }

  /**
   * Handles middleware errors
   * @private
   */
  _handleMiddlewareError(error, req, res, next) {
    console.error('Database middleware error:', error.message);

    // For Fastify compatibility
    if (res.code && typeof res.code === 'function') {
      return res.code(error.statusCode || 500).send({
        error: 'Database error',
        message: error.message,
      });
    }

    // For Express compatibility
    if (res.status && typeof res.status === 'function') {
      return res.status(error.statusCode || 500).json({
        error: 'Database error',
        message: error.message,
      });
    }

    // Fallback - call next with error
    next(error);
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
