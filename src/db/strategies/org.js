/**
 * Organization-level database strategy implementation with enterprise URL resolution
 * @module @voilajsx/appkit/db
 * @file src/db/strategies/org.js
 */

import { createDatabaseError, OrgUrlResolver } from '../defaults.js';

/**
 * Organization-level strategy with enterprise-grade URL resolution
 * Each organization can have its own separate database on different servers/clouds
 * Tenants within each org use row-level isolation
 */
export class OrgStrategy {
  constructor(config, adapter) {
    this.config = config;
    this.adapter = adapter;
    this.connections = new Map(); // Cache org/tenant connections
    this.systemConnection = null; // Cached system connection
    this.baseUrl = null;

    // Initialize enterprise URL resolver with built-in caching and error handling
    this.urlResolver = new OrgUrlResolver(
      config.orgUrlResolver,
      config.orgUrlCacheTTL,
      config.environment.isDevelopment
    );

    // Parse base URL for fallback scenarios
    if (config.database.url) {
      try {
        this.baseUrl = this._parseBaseUrl(config.database.url);
      } catch (error) {
        // If URL parsing fails, log warning but continue (resolver might provide URLs)
        if (config.environment.isDevelopment) {
          console.warn(
            `[AppKit] Could not parse base URL, relying on custom resolver: ${error.message}`
          );
        }
      }
    }
  }

  /**
   * Gets database connection for specific tenant within organization
   * @param {string} tenantId - Tenant ID
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<any>} Database client
   */
  async getConnection(tenantId, orgId) {
    if (!orgId) {
      throw createDatabaseError(
        'Organization ID is required for org strategy',
        400
      );
    }

    const cacheKey = this._buildCacheKey(tenantId, orgId);

    // Check cache first
    if (this.connections.has(cacheKey)) {
      return this.connections.get(cacheKey);
    }

    try {
      // Use enterprise URL resolver to get org-specific database URL
      const databaseUrl = await this.urlResolver.resolve(orgId);

      // Create client connection for org database
      const client = await this.adapter.createClient({
        url: databaseUrl,
      });

      let finalClient = client;

      // Apply tenant middleware if tenant mode is enabled
      if (this.config.database.tenant && this.adapter.applyTenantMiddleware) {
        finalClient = await this.adapter.applyTenantMiddleware(
          client,
          tenantId,
          {
            fieldName: this.config.tenant.fieldName,
            orgId,
          }
        );
      }

      // Add metadata for debugging and monitoring
      finalClient._orgId = orgId;
      finalClient._tenantId = tenantId;
      finalClient._appKit = true;

      // Cache the connection
      this.connections.set(cacheKey, finalClient);

      if (this.config.environment.isDevelopment) {
        console.log(
          `✅ [AppKit] Connected to org '${orgId}' database for tenant '${tenantId}'`
        );
      }

      return finalClient;
    } catch (error) {
      throw createDatabaseError(
        `Failed to connect to organization database '${orgId}' for tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new tenant within organization
   * @param {string} tenantId - Tenant ID
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<void>}
   */
  async createTenant(tenantId, orgId) {
    if (!orgId) {
      throw createDatabaseError(
        'Organization ID is required for org strategy',
        400
      );
    }

    try {
      // Ensure organization database exists
      if (!(await this.orgExists(orgId))) {
        await this.createOrg(orgId);
      }

      // For org strategy with tenant mode, tenants are row-level within org DB
      if (this.config.database.tenant) {
        // Tenant creation is implicit - they exist when first record is created
        // We could create a tenant registry entry here if needed
        const client = await this._getOrgConnection(orgId);

        // Optional: Create tenant registry entry if adapter supports it
        if (this.adapter.createDatabase) {
          // This is for database-level tenant isolation within org
          // Most use cases will use row-level isolation instead
        }

        if (this.config.environment.isDevelopment) {
          console.log(
            `✅ [AppKit] Tenant '${tenantId}' ready in organization '${orgId}'`
          );
        }
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to create tenant '${tenantId}' in organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes a tenant and all its data within organization
   * @param {string} tenantId - Tenant ID
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<void>}
   */
  async deleteTenant(tenantId, orgId) {
    if (!orgId) {
      throw createDatabaseError(
        'Organization ID is required for org strategy',
        400
      );
    }

    try {
      // Remove from cache first
      const cacheKey = this._buildCacheKey(tenantId, orgId);
      if (this.connections.has(cacheKey)) {
        const cachedClient = this.connections.get(cacheKey);
        await this._closeClient(cachedClient);
        this.connections.delete(cacheKey);
      }

      // Delete all tenant data within the org database
      const orgClient = await this._getOrgConnection(orgId);
      await this._deleteAllTenantData(orgClient, tenantId);

      if (this.config.environment.isDevelopment) {
        console.log(
          `✅ [AppKit] Deleted tenant '${tenantId}' from organization '${orgId}'`
        );
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to delete tenant '${tenantId}' in organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant exists within organization
   * @param {string} tenantId - Tenant ID
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<boolean>}
   */
  async tenantExists(tenantId, orgId) {
    if (!orgId) {
      return false;
    }

    try {
      // Check if org exists first
      if (!(await this.orgExists(orgId))) {
        return false;
      }

      // For tenant mode, check if tenant has data in org database
      if (this.config.database.tenant) {
        const orgClient = await this._getOrgConnection(orgId);
        return await this._tenantHasData(orgClient, tenantId);
      }

      return true; // In org-only mode, existence is at org level
    } catch (error) {
      throw createDatabaseError(
        `Failed to check tenant existence for '${tenantId}' in org '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all tenants within organization
   * @param {string} [orgId] - Organization ID
   * @returns {Promise<string[]>}
   */
  async listTenants(orgId) {
    if (!orgId) {
      throw createDatabaseError(
        'Organization ID is required for org strategy',
        400
      );
    }

    try {
      // Check if org exists first
      if (!(await this.orgExists(orgId))) {
        return [];
      }

      // For tenant mode, get distinct tenant IDs from org database
      if (this.config.database.tenant) {
        const orgClient = await this._getOrgConnection(orgId);
        return await this._getDistinctTenantIds(orgClient);
      }

      return []; // In org-only mode, no tenant list
    } catch (error) {
      throw createDatabaseError(
        `Failed to list tenants for organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new organization database
   * @param {string} orgId - Organization ID
   * @returns {Promise<void>}
   */
  async createOrg(orgId) {
    try {
      // Check if organization already exists
      if (await this.orgExists(orgId)) {
        throw createDatabaseError(
          `Organization database '${orgId}' already exists`,
          409
        );
      }

      // For enterprise setups, the database might already exist on the target server
      // Try to connect first, if it fails, then try to create
      try {
        await this._getOrgConnection(orgId);
        if (this.config.environment.isDevelopment) {
          console.log(
            `✅ [AppKit] Organization '${orgId}' database already exists and is accessible`
          );
        }
        return;
      } catch (connectionError) {
        // Database doesn't exist or isn't accessible, try to create it
      }

      // Create the organization database if adapter supports it
      if (this.adapter.createDatabase) {
        const dbName = this._sanitizeDatabaseName(orgId);
        const systemClient = await this._getSystemConnection(orgId);
        await this.adapter.createDatabase(dbName, systemClient);
      }

      // Run initial schema setup if needed
      await this._setupOrgDatabase(orgId);

      if (this.config.environment.isDevelopment) {
        console.log(`✅ [AppKit] Created organization database: ${orgId}`);
      }
    } catch (error) {
      // If it's already a database error, re-throw
      if (error.statusCode) {
        throw error;
      }

      throw createDatabaseError(
        `Failed to create organization database '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes an organization database completely
   * @param {string} orgId - Organization ID
   * @returns {Promise<void>}
   */
  async deleteOrg(orgId) {
    try {
      // Check if organization exists
      if (!(await this.orgExists(orgId))) {
        throw createDatabaseError(
          `Organization database '${orgId}' not found`,
          404
        );
      }

      // Close and remove all cached connections for this org
      this._removeOrgFromCache(orgId);

      // Clear URL resolver cache for this org
      this.urlResolver.clearCache(orgId);

      // Drop the organization database if adapter supports it
      if (this.adapter.dropDatabase) {
        const dbName = this._sanitizeDatabaseName(orgId);
        const systemClient = await this._getSystemConnection(orgId);
        await this.adapter.dropDatabase(dbName, systemClient);
      }

      if (this.config.environment.isDevelopment) {
        console.log(`✅ [AppKit] Deleted organization database: ${orgId}`);
      }
    } catch (error) {
      // If it's already a database error, re-throw
      if (error.statusCode) {
        throw error;
      }

      throw createDatabaseError(
        `Failed to delete organization database '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if organization database exists
   * @param {string} orgId - Organization ID
   * @returns {Promise<boolean>}
   */
  async orgExists(orgId) {
    try {
      // Try to connect to the org database using the resolver
      const testClient = await this._getOrgConnection(orgId);

      // Simple test query to verify database accessibility
      if (testClient.$queryRaw) {
        // Prisma client
        await testClient.$queryRaw`SELECT 1`;
      } else if (testClient.db) {
        // Mongoose connection
        await testClient.db.admin().ping();
      }

      return true;
    } catch (error) {
      // If connection or query fails, org doesn't exist or isn't accessible
      return false;
    }
  }

  /**
   * Lists all organization databases
   * @returns {Promise<string[]>}
   */
  async listOrgs() {
    try {
      // For enterprise setups with custom resolvers, we can't easily list all orgs
      // since they might be on different servers. This would need to be implemented
      // by the developer's custom resolver or a registry system.

      if (this.config.orgUrlResolver) {
        // With custom resolver, we don't know all orgs without a registry
        throw createDatabaseError(
          'Listing organizations with custom URL resolver requires implementing a registry system',
          501
        );
      }

      // Fallback to adapter's database listing (only works with default URL pattern)
      if (this.adapter.listDatabases && this.baseUrl) {
        const systemClient = await this._getSystemConnection();
        const databases = await this.adapter.listDatabases(systemClient);
        return this._filterSystemDatabases(databases);
      }

      return [];
    } catch (error) {
      throw createDatabaseError(
        `Failed to list organizations: ${error.message}`,
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

    // Disconnect all org/tenant connections
    for (const [key, connection] of this.connections) {
      disconnectPromises.push(
        this._closeClient(connection).catch((error) =>
          console.warn(`Error disconnecting ${key}:`, error.message)
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

    // Clear URL resolver caches
    this.urlResolver.clearCache();

    if (this.config.environment.isDevelopment) {
      console.log('👋 [AppKit] Org strategy disconnected and cleaned up');
    }
  }

  // Private helper methods

  /**
   * Parses base URL for database connections (fallback only)
   * @private
   */
  _parseBaseUrl(url) {
    // Handle URLs like: postgresql://user:pass@host:5432/{org}
    const match = url.match(/^(.+?)\/\{org\}(.*)$/);
    if (match) {
      return {
        prefix: match[1],
        suffix: match[2] || '',
      };
    }

    // If no {org} placeholder, treat as base URL and append org to database name
    const urlParts = url.match(/^(.*\/)([^/?]+)(.*)$/);
    if (urlParts) {
      return {
        prefix: urlParts[1],
        suffix: urlParts[3] || '',
      };
    }

    throw createDatabaseError(
      'Invalid database URL for org strategy. Use {org} placeholder or provide custom orgUrlResolver',
      500
    );
  }

  /**
   * Gets organization database connection using enterprise resolver
   * @private
   */
  async _getOrgConnection(orgId) {
    const cacheKey = `org_${orgId}`;

    if (!this.connections.has(cacheKey)) {
      // Use the enterprise URL resolver
      const databaseUrl = await this.urlResolver.resolve(orgId);
      const client = await this.adapter.createClient({ url: databaseUrl });

      // Add metadata
      client._orgId = orgId;
      client._appKit = true;

      this.connections.set(cacheKey, client);
    }

    return this.connections.get(cacheKey);
  }

  /**
   * Gets or creates system database connection for management operations
   * @private
   */
  async _getSystemConnection(orgId) {
    // For enterprise setups, system connection might be org-specific
    const cacheKey = orgId ? `system_${orgId}` : 'system_default';

    if (
      !this.systemConnection ||
      (orgId && this.systemConnection._orgId !== orgId)
    ) {
      if (this.config.orgUrlResolver && orgId) {
        // For custom resolvers, use the org's URL but connect to system database
        const orgUrl = await this.urlResolver.resolve(orgId);
        const systemUrl = this._buildSystemUrlFromOrgUrl(orgUrl);
        this.systemConnection = await this.adapter.createClient({
          url: systemUrl,
        });
        this.systemConnection._orgId = orgId;
      } else if (this.baseUrl) {
        // Use default system URL pattern
        const systemUrl = this._buildSystemUrl();
        this.systemConnection = await this.adapter.createClient({
          url: systemUrl,
        });
      } else {
        throw createDatabaseError(
          'Cannot create system connection without base URL or custom resolver context',
          500
        );
      }
    }

    return this.systemConnection;
  }

  /**
   * Builds system database URL from organization URL
   * @private
   */
  _buildSystemUrlFromOrgUrl(orgUrl) {
    const provider = this._detectProviderFromUrl(orgUrl);

    // Replace database name with system database
    const urlParts = orgUrl.match(/^(.*\/)([^/?]+)(.*)$/);
    if (!urlParts) {
      throw createDatabaseError(
        'Invalid organization database URL format',
        500
      );
    }

    let systemDbName;
    switch (provider) {
      case 'postgresql':
        systemDbName = 'postgres';
        break;
      case 'mysql':
        systemDbName = 'mysql';
        break;
      case 'mongodb':
        systemDbName = 'admin';
        break;
      default:
        throw createDatabaseError(
          `Unsupported database provider: ${provider}`,
          500
        );
    }

    return `${urlParts[1]}${systemDbName}${urlParts[3]}`;
  }

  /**
   * Builds system database URL for management operations (fallback)
   * @private
   */
  _buildSystemUrl() {
    if (!this.baseUrl) {
      throw createDatabaseError(
        'Base URL not available for system connection',
        500
      );
    }

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
   * Detects database provider from base URL
   * @private
   */
  _detectProvider() {
    if (!this.config.database.url) {
      throw createDatabaseError('Database URL not available', 500);
    }

    return this._detectProviderFromUrl(this.config.database.url);
  }

  /**
   * Detects database provider from any URL
   * @private
   */
  _detectProviderFromUrl(url) {
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
      'Unsupported database provider for org strategy',
      500
    );
  }

  /**
   * Sanitizes database name to prevent injection
   * @private
   */
  _sanitizeDatabaseName(orgId) {
    return orgId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  /**
   * Sets up initial schema for new organization database
   * @private
   */
  async _setupOrgDatabase(orgId) {
    try {
      // Get org connection and run any initial setup
      const orgClient = await this._getOrgConnection(orgId);

      // This would be where you run migrations or initial schema setup
      // For now, we'll just ensure the connection works with a simple test
      if (orgClient.$queryRaw) {
        await orgClient.$queryRaw`SELECT 1`;
      } else if (orgClient.db) {
        await orgClient.db.admin().ping();
      }
    } catch (error) {
      console.warn(
        `Failed to setup schema for organization '${orgId}':`,
        error.message
      );
      // Don't throw - database creation succeeded, schema setup is optional
    }
  }

  /**
   * Filters out system databases from org list
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
    ];

    return databases
      .filter(
        (name) =>
          !systemDatabases.includes(name.toLowerCase()) &&
          !name.startsWith('_') &&
          name.length > 0
      )
      .sort();
  }

  /**
   * Builds cache key for connections
   * @private
   */
  _buildCacheKey(tenantId, orgId) {
    return this.config.database.tenant
      ? `${orgId}_${tenantId}`
      : `org_${orgId}`;
  }

  /**
   * Removes organization connections from cache
   * @private
   */
  _removeOrgFromCache(orgId) {
    const keysToRemove = [];

    for (const [key] of this.connections) {
      if (key.includes(orgId)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      const connection = this.connections.get(key);
      if (connection) {
        this._closeClient(connection);
      }
      this.connections.delete(key);
    });
  }

  /**
   * Checks if tenant has any data in org database
   * @private
   */
  async _tenantHasData(client, tenantId) {
    try {
      const tenantField = this.config.tenant.fieldName;

      // For Prisma
      if (client.$queryRaw) {
        const models = this._getPrismaModels(client);

        for (const modelName of models) {
          try {
            const record = await client[modelName].findFirst({
              where: { [tenantField]: tenantId },
            });
            if (record) return true;
          } catch (error) {
            continue; // Model might not have tenant field
          }
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets distinct tenant IDs from org database
   * @private
   */
  async _getDistinctTenantIds(client) {
    const tenantIds = new Set();
    const tenantField = this.config.tenant.fieldName;

    try {
      // For Prisma
      if (client.$queryRaw) {
        const models = this._getPrismaModels(client);

        for (const modelName of models) {
          try {
            const records = await client[modelName].findMany({
              select: { [tenantField]: true },
              distinct: [tenantField],
              where: { [tenantField]: { not: null } },
            });

            records.forEach((record) => {
              const tenantId = record[tenantField];
              if (tenantId) tenantIds.add(tenantId);
            });
          } catch (error) {
            continue; // Model might not have tenant field
          }
        }
      }

      return Array.from(tenantIds).sort();
    } catch (error) {
      throw createDatabaseError(
        `Failed to get tenant IDs: ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes all data for a tenant in org database
   * @private
   */
  async _deleteAllTenantData(client, tenantId) {
    const tenantField = this.config.tenant.fieldName;

    try {
      // For Prisma - use transaction for safety
      if (client.$transaction) {
        const models = this._getPrismaModels(client);
        const deleteOperations = [];

        for (const modelName of models) {
          try {
            deleteOperations.push(
              client[modelName].deleteMany({
                where: { [tenantField]: tenantId },
              })
            );
          } catch (error) {
            continue; // Model might not have tenant field
          }
        }

        if (deleteOperations.length > 0) {
          await client.$transaction(deleteOperations);
        }
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to delete tenant data: ${error.message}`,
        500
      );
    }
  }

  /**
   * Gets list of Prisma model names
   * @private
   */
  _getPrismaModels(client) {
    return Object.keys(client).filter(
      (key) =>
        !key.startsWith('$') &&
        !key.startsWith('_') &&
        typeof client[key] === 'object' &&
        typeof client[key].findFirst === 'function'
    );
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
