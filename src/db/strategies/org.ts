/**
 * Organization-level database strategy implementation
 * @module @voilajsx/appkit/db
 * @file src/db/strategies/org.ts
 */

import { createDatabaseError, type DatabaseConfig } from '../defaults';

export interface OrgStrategyAdapter {
  createClient(config: any): Promise<any>;
  applyTenantMiddleware?(client: any, tenantId: string, options: any): Promise<any>;
  createDatabase?(name: string, systemClient?: any): Promise<void>;
  dropDatabase?(name: string, systemClient?: any): Promise<void>;
  listDatabases?(systemClient?: any): Promise<string[]>;
  getDatabaseStats?(client: any): Promise<any>;
  backupDatabase?(dbName: string, systemClient: any, options?: any): Promise<string>;
  restoreDatabase?(dbName: string, backupPath: string, systemClient: any, options?: any): Promise<void>;
}

/**
 * Organization-level strategy
 * Each organization has its own separate database for maximum isolation
 * Tenants within each org use row-level isolation
 */
export class OrgStrategy {
  private connections = new Map<string, any>(); // Cache org/tenant connections
  private systemConnection: any = null; // Cached system connection
  private baseUrl: { prefix: string; suffix: string };

  constructor(
    private config: DatabaseConfig,
    private adapter: OrgStrategyAdapter
  ) {
    this.baseUrl = this._parseBaseUrl(config.database.url!);
  }

  /**
   * Gets database connection for specific tenant within organization
   */
  async getConnection(tenantId: string, orgId?: string): Promise<any> {
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
      // Build org-specific database URL
      const databaseUrl = this._buildDatabaseUrl(orgId);

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

      // Cache the connection
      this.connections.set(cacheKey, finalClient);

      return finalClient;
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to connect to organization database '${orgId}' for tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new tenant within organization
   */
  async createTenant(tenantId: string, orgId?: string): Promise<void> {
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
        // This is similar to row strategy but within the org database
      }
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to create tenant '${tenantId}' in organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes a tenant and all its data within organization
   */
  async deleteTenant(tenantId: string, orgId?: string): Promise<void> {
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
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to delete tenant '${tenantId}' in organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant exists within organization
   */
  async tenantExists(tenantId: string, orgId?: string): Promise<boolean> {
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
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to check tenant existence for '${tenantId}' in org '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all tenants within organization
   */
  async listTenants(orgId?: string): Promise<string[]> {
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
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to list tenants for organization '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new organization database
   */
  async createOrg(orgId: string): Promise<void> {
    try {
      const dbName = this._sanitizeDatabaseName(orgId);

      // Check if organization already exists
      if (await this.orgExists(orgId)) {
        throw createDatabaseError(
          `Organization database '${orgId}' already exists`,
          409
        );
      }

      // Create the organization database if adapter supports it
      if (this.adapter.createDatabase) {
        const systemClient = await this._getSystemConnection();
        await this.adapter.createDatabase(dbName, systemClient);
      }

      // Run initial schema setup if needed
      await this._setupOrgDatabase(orgId);
    } catch (error: any) {
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
   */
  async deleteOrg(orgId: string): Promise<void> {
    try {
      const dbName = this._sanitizeDatabaseName(orgId);

      // Check if organization exists
      if (!(await this.orgExists(orgId))) {
        throw createDatabaseError(
          `Organization database '${orgId}' not found`,
          404
        );
      }

      // Close and remove all cached connections for this org
      this._removeOrgFromCache(orgId);

      // Drop the organization database if adapter supports it
      if (this.adapter.dropDatabase) {
        const systemClient = await this._getSystemConnection();
        await this.adapter.dropDatabase(dbName, systemClient);
      }
    } catch (error: any) {
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
   */
  async orgExists(orgId: string): Promise<boolean> {
    try {
      const dbName = this._sanitizeDatabaseName(orgId);

      // If adapter supports listing databases, use that
      if (this.adapter.listDatabases) {
        const systemClient = await this._getSystemConnection();
        const databases = await this.adapter.listDatabases(systemClient);
        return databases.includes(dbName);
      }

      // Fallback: try to connect to the org database
      try {
        const databaseUrl = this._buildDatabaseUrl(orgId);
        const testClient = await this.adapter.createClient({ url: databaseUrl });
        await this._closeClient(testClient);
        return true;
      } catch {
        return false;
      }
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to check organization existence for '${orgId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all organization databases
   */
  async listOrgs(): Promise<string[]> {
    try {
      // If adapter supports listing databases, use that
      if (this.adapter.listDatabases) {
        const systemClient = await this._getSystemConnection();
        const databases = await this.adapter.listDatabases(systemClient);
        return this._filterSystemDatabases(databases);
      }

      return [];
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to list organizations: ${error.message}`,
        500
      );
    }
  }

  /**
   * Disconnects all connections
   */
  async disconnect(): Promise<void> {
    const disconnectPromises = [];

    // Disconnect all org/tenant connections
    for (const [key, connection] of this.connections) {
      disconnectPromises.push(
        this._closeClient(connection).catch((error: any) =>
          console.warn(`Error disconnecting ${key}:`, error.message)
        )
      );
    }

    // Disconnect system connection
    if (this.systemConnection) {
      disconnectPromises.push(
        this._closeClient(this.systemConnection).catch((error: any) =>
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
   */
  private _parseBaseUrl(url: string): { prefix: string; suffix: string } {
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
      'Invalid database URL for org strategy. Use {org} placeholder or standard database URL.',
      500
    );
  }

  /**
   * Builds database URL for specific organization
   */
  private _buildDatabaseUrl(orgId: string): string {
    const dbName = this._sanitizeDatabaseName(orgId);
    
    if (this.config.database.url!.includes('{org}')) {
      return `${this.baseUrl.prefix}/${dbName}${this.baseUrl.suffix}`;
    }
    
    // Append org to existing database name
    const originalUrl = this.config.database.url!;
    const urlParts = originalUrl.match(/^(.*\/)([^/?]+)(.*)$/);
    if (urlParts) {
      return `${urlParts[1]}${orgId}_${urlParts[2]}${urlParts[3]}`;
    }
    
    return originalUrl;
  }

  /**
   * Gets organization database connection
   */
  private async _getOrgConnection(orgId: string): Promise<any> {
    const cacheKey = `org_${orgId}`;
    
    if (!this.connections.has(cacheKey)) {
      const databaseUrl = this._buildDatabaseUrl(orgId);
      const client = await this.adapter.createClient({ url: databaseUrl });
      this.connections.set(cacheKey, client);
    }
    
    return this.connections.get(cacheKey);
  }

  /**
   * Gets or creates system database connection
   */
  private async _getSystemConnection(): Promise<any> {
    if (!this.systemConnection) {
      const systemUrl = this._buildSystemUrl();
      this.systemConnection = await this.adapter.createClient({ url: systemUrl });
    }
    return this.systemConnection;
  }

  /**
   * Builds system database URL for management operations
   */
  private _buildSystemUrl(): string {
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
   * Detects database provider from URL
   */
  private _detectProvider(): string {
    const url = this.config.database.url!;

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
   */
  private _sanitizeDatabaseName(orgId: string): string {
    return orgId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }

  /**
   * Sets up initial schema for new organization database
   */
  private async _setupOrgDatabase(orgId: string): Promise<void> {
    try {
      // Get org connection and run any initial setup
      const orgClient = await this._getOrgConnection(orgId);
      
      // This would be where you run migrations or initial schema setup
      // For now, we'll just ensure the connection works
    } catch (error: any) {
      console.warn(
        `Failed to setup schema for organization '${orgId}':`,
        error.message
      );
      // Don't throw - database creation succeeded, schema setup is optional
    }
  }

  /**
   * Filters out system databases from org list
   */
  private _filterSystemDatabases(databases: string[]): string[] {
    const systemDatabases = [
      // PostgreSQL system databases
      'postgres', 'template0', 'template1',
      // MySQL system databases
      'mysql', 'information_schema', 'performance_schema', 'sys',
      // MongoDB system databases
      'admin', 'config', 'local',
    ];

    return databases
      .filter(name => 
        !systemDatabases.includes(name.toLowerCase()) &&
        !name.startsWith('_') &&
        name.length > 0
      )
      .sort();
  }

  /**
   * Builds cache key for connections
   */
  private _buildCacheKey(tenantId: string, orgId: string): string {
    return this.config.database.tenant 
      ? `${orgId}_${tenantId}`
      : `org_${orgId}`;
  }

  /**
   * Removes organization connections from cache
   */
  private _removeOrgFromCache(orgId: string): void {
    const keysToRemove = [];
    
    for (const [key] of this.connections) {
      if (key.includes(orgId)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      const connection = this.connections.get(key);
      if (connection) {
        this._closeClient(connection);
      }
      this.connections.delete(key);
    });
  }

  /**
   * Checks if tenant has any data in org database
   */
  private async _tenantHasData(client: any, tenantId: string): Promise<boolean> {
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
   */
  private async _getDistinctTenantIds(client: any): Promise<string[]> {
    const tenantIds = new Set<string>();
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

            records.forEach((record: any) => {
              const tenantId = record[tenantField];
              if (tenantId) tenantIds.add(tenantId);
            });
          } catch (error) {
            continue; // Model might not have tenant field
          }
        }
      }

      return Array.from(tenantIds).sort();
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to get tenant IDs: ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes all data for a tenant in org database
   */
  private async _deleteAllTenantData(client: any, tenantId: string): Promise<void> {
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
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to delete tenant data: ${error.message}`,
        500
      );
    }
  }

  /**
   * Gets list of Prisma model names
   */
  private _getPrismaModels(client: any): string[] {
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
   */
  private async _closeClient(client: any): Promise<void> {
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