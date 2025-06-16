/**
 * Database-per-tenant strategy implementation
 * @module @voilajsx/appkit/db
 * @file src/db/strategies/database.js
 */

import { createDatabaseError } from '../defaults.js';

/**
 * Database-per-tenant strategy
 * Each tenant has their own separate database for maximum isolation
 */
export class DatabaseStrategy {
  /**
   * Creates a new DatabaseStrategy instance
   * @param {Object} options - Strategy configuration
   * @param {string} options.url - Database connection URL with {tenant} placeholder
   * @param {Object} adapter - Database adapter instance
   */
  constructor(options, adapter) {
    this.options = options;
    this.adapter = adapter;
    this.baseUrl = this._parseBaseUrl(options.url);
    this.connections = new Map(); // Cache tenant connections
    this.systemConnection = null; // Cached system connection
  }

  /**
   * Gets database connection for specific tenant
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<Object>} Database client for tenant database
   */
  async getConnection(tenantId) {
    // Check cache first
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId);
    }

    try {
      // Build tenant-specific database URL
      const databaseUrl = this._buildDatabaseUrl(tenantId);

      // Create client connection for tenant database
      const client = await this.adapter.createClient({
        url: databaseUrl,
        ...this.options.connection,
      });

      // Cache the connection
      this.connections.set(tenantId, client);

      return client;
    } catch (error) {
      throw createDatabaseError(
        `Failed to connect to tenant database '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new tenant database
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async createTenant(tenantId) {
    let systemClient = null;

    try {
      const dbName = this._sanitizeDatabaseName(tenantId);

      // Check if database already exists
      if (await this.tenantExists(tenantId)) {
        throw createDatabaseError(
          `Tenant database '${tenantId}' already exists`,
          409
        );
      }

      // Connect to system database to create new database
      systemClient = await this._getSystemConnection();

      // Create the tenant database
      await this.adapter.createDatabase(dbName, systemClient);

      // Run initial schema setup if needed
      await this._setupTenantDatabase(tenantId);
    } catch (error) {
      // If it's already a database error, re-throw
      if (error.statusCode) {
        throw error;
      }

      throw createDatabaseError(
        `Failed to create tenant database '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes a tenant database completely
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async deleteTenant(tenantId) {
    let systemClient = null;

    try {
      const dbName = this._sanitizeDatabaseName(tenantId);

      // Check if database exists
      if (!(await this.tenantExists(tenantId))) {
        throw createDatabaseError(
          `Tenant database '${tenantId}' not found`,
          404
        );
      }

      // Close and remove cached connection first
      if (this.connections.has(tenantId)) {
        const tenantClient = this.connections.get(tenantId);
        await this._closeClient(tenantClient);
        this.connections.delete(tenantId);
      }

      // Connect to system database
      systemClient = await this._getSystemConnection();

      // Drop the tenant database
      await this.adapter.dropDatabase(dbName, systemClient);
    } catch (error) {
      // If it's already a database error, re-throw
      if (error.statusCode) {
        throw error;
      }

      throw createDatabaseError(
        `Failed to delete tenant database '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant database exists
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<boolean>} True if tenant database exists
   */
  async tenantExists(tenantId) {
    let systemClient = null;

    try {
      const dbName = this._sanitizeDatabaseName(tenantId);

      // Get system connection
      systemClient = await this._getSystemConnection();

      // List databases and check if tenant database exists
      const databases = await this.adapter.listDatabases(systemClient);
      return databases.includes(dbName);
    } catch (error) {
      throw createDatabaseError(
        `Failed to check tenant database existence for '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all tenant databases
   * @returns {Promise<string[]>} Array of tenant IDs
   */
  async listTenants() {
    let systemClient = null;

    try {
      // Get system connection
      systemClient = await this._getSystemConnection();

      // Get all databases
      const databases = await this.adapter.listDatabases(systemClient);

      // Filter out system databases and return as tenant IDs
      return this._filterSystemDatabases(databases);
    } catch (error) {
      throw createDatabaseError(
        `Failed to list tenant databases: ${error.message}`,
        500
      );
    }
  }

  /**
   * Gets database size and statistics for a tenant
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<Object>} Database statistics
   */
  async getTenantStats(tenantId) {
    try {
      const tenantClient = await this.getConnection(tenantId);
      return await this.adapter.getDatabaseStats(tenantClient);
    } catch (error) {
      throw createDatabaseError(
        `Failed to get stats for tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Backs up a tenant database
   * @param {string} tenantId - Tenant identifier
   * @param {Object} [options] - Backup options
   * @returns {Promise<string>} Backup file path or identifier
   */
  async backupTenant(tenantId, options = {}) {
    try {
      const dbName = this._sanitizeDatabaseName(tenantId);
      const systemClient = await this._getSystemConnection();

      return await this.adapter.backupDatabase(dbName, systemClient, options);
    } catch (error) {
      throw createDatabaseError(
        `Failed to backup tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Restores a tenant database from backup
   * @param {string} tenantId - Tenant identifier
   * @param {string} backupPath - Path to backup file
   * @param {Object} [options] - Restore options
   * @returns {Promise<void>}
   */
  async restoreTenant(tenantId, backupPath, options = {}) {
    try {
      const dbName = this._sanitizeDatabaseName(tenantId);
      const systemClient = await this._getSystemConnection();

      // Remove cached connection if exists
      if (this.connections.has(tenantId)) {
        const tenantClient = this.connections.get(tenantId);
        await this._closeClient(tenantClient);
        this.connections.delete(tenantId);
      }

      await this.adapter.restoreDatabase(
        dbName,
        backupPath,
        systemClient,
        options
      );
    } catch (error) {
      throw createDatabaseError(
        `Failed to restore tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Disconnects all connections
   * @returns {Promise<void>}
   */
  async disconnect() {
    const disconnectPromises = [];

    // Disconnect all tenant connections
    for (const [tenantId, connection] of this.connections) {
      disconnectPromises.push(
        this._closeClient(connection).catch((error) =>
          console.warn(`Error disconnecting tenant ${tenantId}:`, error.message)
        )
      );
    }

    // Disconnect system connection
    if (this.systemConnection) {
      disconnectPromises.push(
        this._closeClient(this.systemConnection).catch((error) =>
          console.warn('Error disconnecting system connection:', error.message)
        )
      );
    }

    await Promise.all(disconnectPromises);

    this.connections.clear();
    this.systemConnection = null;
  }

  // Private helper methods

  /**
   * Parses base URL for database connections
   * @private
   */
  _parseBaseUrl(url) {
    // Handle URLs like: postgresql://user:pass@host:5432/{tenant}
    const match = url.match(/^(.+?)\/\{tenant\}(.*)$/);
    if (!match) {
      throw createDatabaseError(
        'Database URL must contain {tenant} placeholder for database strategy. Example: postgresql://user:pass@host:5432/{tenant}',
        500
      );
    }

    return {
      prefix: match[1],
      suffix: match[2] || '',
    };
  }

  /**
   * Builds database URL for specific tenant
   * @private
   */
  _buildDatabaseUrl(tenantId) {
    const dbName = this._sanitizeDatabaseName(tenantId);
    return `${this.baseUrl.prefix}/${dbName}${this.baseUrl.suffix}`;
  }

  /**
   * Builds system database URL for management operations
   * @private
   */
  _buildSystemUrl() {
    const provider = this._detectProvider();

    switch (provider) {
      case 'postgresql':
        return `${this.baseUrl.prefix}/postgres${this.baseUrl.suffix}`;
      case 'mysql':
        return `${this.baseUrl.prefix}/mysql${this.baseUrl.suffix}`;
      case 'mongodb':
        return `${this.baseUrl.prefix}/admin${this.baseUrl.suffix}`;
      default:
        throw createDatabaseError(
          `Unsupported database provider: ${provider}`,
          500
        );
    }
  }

  /**
   * Gets or creates system database connection
   * @private
   */
  async _getSystemConnection() {
    if (!this.systemConnection) {
      const systemUrl = this._buildSystemUrl();
      this.systemConnection = await this.adapter.createClient({
        url: systemUrl,
        ...this.options.connection,
      });
    }
    return this.systemConnection;
  }

  /**
   * Sets up initial schema for new tenant database
   * @private
   */
  async _setupTenantDatabase(tenantId) {
    try {
      // Get tenant connection
      const tenantClient = await this.getConnection(tenantId);

      // Run any initial setup operations
      await this.adapter.setupTenantSchema?.(tenantClient, tenantId);
    } catch (error) {
      console.warn(
        `Failed to setup schema for tenant '${tenantId}':`,
        error.message
      );
      // Don't throw - database creation succeeded, schema setup is optional
    }
  }

  /**
   * Detects database provider from URL
   * @private
   */
  _detectProvider() {
    const url = this.baseUrl.prefix;

    if (url.includes('postgresql://') || url.includes('postgres://')) {
      return 'postgresql';
    }
    if (url.includes('mysql://')) {
      return 'mysql';
    }
    if (url.includes('mongodb://') || url.includes('mongodb+srv://')) {
      return 'mongodb';
    }

    throw createDatabaseError(
      'Unsupported database provider for database strategy',
      500
    );
  }

  /**
   * Sanitizes database name to prevent injection
   * @private
   */
  _sanitizeDatabaseName(tenantId) {
    // Remove any characters that aren't alphanumeric, underscore, or hyphen
    // Convert to lowercase for consistency
    return tenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  /**
   * Filters out system databases from tenant list
   * @private
   */
  _filterSystemDatabases(databases) {
    const systemDatabases = [
      // PostgreSQL system databases
      'postgres',
      'template0',
      'template1',
      // MySQL system databases
      'mysql',
      'information_schema',
      'performance_schema',
      'sys',
      // MongoDB system databases
      'admin',
      'config',
      'local',
      // SQLite system files
      'sqlite_master',
      'sqlite_temp_master',
    ];

    return databases
      .filter(
        (name) =>
          !systemDatabases.includes(name.toLowerCase()) &&
          !name.startsWith('_') && // Skip databases starting with underscore
          name.length > 0
      )
      .sort();
  }

  /**
   * Closes database client connection
   * @private
   */
  async _closeClient(client) {
    try {
      if (client.$disconnect) {
        await client.$disconnect();
      } else if (client.close) {
        await client.close();
      }
    } catch (error) {
      // Ignore disconnect errors
    }
  }
}
