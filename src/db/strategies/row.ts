/**
 * Row-level multi-tenancy strategy implementation
 * @module @voilajsx/appkit/db
 * @file src/db/strategies/row.ts
 */

import { createDatabaseError, type DatabaseConfig } from '../defaults';

export interface RowStrategyAdapter {
  createClient(config: any): Promise<any>;
  applyTenantMiddleware(client: any, tenantId: string, options: any): Promise<any>;
  hasTenantRegistry?(client: any): Promise<boolean>;
  createTenantRegistryEntry?(client: any, tenantId: string): Promise<void>;
  deleteTenantRegistryEntry?(client: any, tenantId: string): Promise<void>;
  tenantExistsInRegistry?(client: any, tenantId: string): Promise<boolean>;
  getTenantsFromRegistry?(client: any): Promise<string[]>;
}

/**
 * Row-level multi-tenancy strategy
 * All tenants share the same database and tables, with tenant isolation via tenant_id column
 */
export class RowStrategy {
  private connections = new Map<string, any>(); // Cache connections per tenant
  private baseClient: any = null; // Shared base client for non-tenant operations

  constructor(
    private config: DatabaseConfig,
    private adapter: RowStrategyAdapter
  ) {}

  /**
   * Gets database connection for tenant with automatic filtering
   */
  async getConnection(tenantId: string, orgId?: string): Promise<any> {
    const cacheKey = this._buildCacheKey(tenantId, orgId);

    // Check cache first
    if (this.connections.has(cacheKey)) {
      return this.connections.get(cacheKey);
    }

    try {
      // Create base client connection
      const client = await this.adapter.createClient({
        url: this._buildConnectionUrl(orgId),
      });

      // Apply tenant middleware for automatic filtering
      const tenantClient = await this.adapter.applyTenantMiddleware(
        client,
        tenantId,
        {
          fieldName: this.config.tenant.fieldName,
          orgId,
        }
      );

      // Cache the connection
      this.connections.set(cacheKey, tenantClient);

      return tenantClient;
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to create tenant connection for '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new tenant (implicit creation for row-level strategy)
   * Tenant is created when first record is inserted with tenant_id
   */
  async createTenant(tenantId: string, orgId?: string): Promise<void> {
    try {
      const client = await this._getBaseClient(orgId);

      // Check if we have a tenant registry table and create entry
      if (this.adapter.hasTenantRegistry && this.adapter.createTenantRegistryEntry) {
        const hasRegistry = await this.adapter.hasTenantRegistry(client);
        if (hasRegistry) {
          await this.adapter.createTenantRegistryEntry(client, tenantId);
        }
      }

      // For row-level strategy, tenant creation is mostly implicit
      // The tenant exists when the first record with tenant_id is created
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to register tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes all data for a tenant
   */
  async deleteTenant(tenantId: string, orgId?: string): Promise<void> {
    try {
      const client = await this._getBaseClient(orgId);

      // Remove from cache first
      const cacheKey = this._buildCacheKey(tenantId, orgId);
      if (this.connections.has(cacheKey)) {
        const cachedClient = this.connections.get(cacheKey);
        await this._closeClient(cachedClient);
        this.connections.delete(cacheKey);
      }

      // Delete all tenant data
      await this._deleteAllTenantData(client, tenantId);

      // Remove from tenant registry if exists
      if (this.adapter.deleteTenantRegistryEntry) {
        await this.adapter.deleteTenantRegistryEntry(client, tenantId);
      }
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to delete tenant data for '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Checks if tenant exists by looking for any records with the tenant ID
   */
  async tenantExists(tenantId: string, orgId?: string): Promise<boolean> {
    try {
      const client = await this._getBaseClient(orgId);

      // Check tenant registry first if available
      if (this.adapter.tenantExistsInRegistry) {
        const existsInRegistry = await this.adapter.tenantExistsInRegistry(client, tenantId);
        if (existsInRegistry !== undefined) {
          return existsInRegistry;
        }
      }

      // Fallback: check if tenant has any data in any table
      return await this._tenantHasData(client, tenantId);
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to check tenant existence for '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Lists all tenants by finding distinct tenant IDs across all tables
   */
  async listTenants(orgId?: string): Promise<string[]> {
    try {
      const client = await this._getBaseClient(orgId);

      // Use tenant registry if available
      if (this.adapter.getTenantsFromRegistry) {
        try {
          const tenants = await this.adapter.getTenantsFromRegistry(client);
          if (tenants.length > 0) {
            return tenants;
          }
        } catch {
          // Fall back to scanning tables
        }
      }

      // Fallback: scan all tables for distinct tenant IDs
      return await this._getDistinctTenantIds(client);
    } catch (error: any) {
      throw createDatabaseError(
        `Failed to list tenants: ${error.message}`,
        500
      );
    }
  }

  /**
   * Disconnects all cached connections
   */
  async disconnect(): Promise<void> {
    const disconnectPromises = [];

    // Disconnect all tenant connections
    for (const [tenantId, connection] of this.connections) {
      disconnectPromises.push(
        this._closeClient(connection).catch((error: any) =>
          console.warn(`Error disconnecting tenant ${tenantId}:`, error.message)
        )
      );
    }

    // Disconnect base client
    if (this.baseClient) {
      disconnectPromises.push(
        this._closeClient(this.baseClient).catch((error: any) =>
          console.warn('Error disconnecting base client:', error.message)
        )
      );
    }

    await Promise.all(disconnectPromises);
    
    this.connections.clear();
    this.baseClient = null;
  }

  // Private helper methods

  /**
   * Gets or creates base client for non-tenant operations
   */
  private async _getBaseClient(orgId?: string): Promise<any> {
    const cacheKey = `base_${orgId || 'default'}`;
    
    if (!this.baseClient || (orgId && !this.baseClient._orgId === orgId)) {
      this.baseClient = await this.adapter.createClient({
        url: this._buildConnectionUrl(orgId),
      });
      this.baseClient._orgId = orgId;
    }
    
    return this.baseClient;
  }

  /**
   * Builds connection URL for organization
   */
  private _buildConnectionUrl(orgId?: string): string {
    const baseUrl = this.config.database.url!;
    
    if (!orgId || !this.config.database.org) {
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
   * Builds cache key for tenant connections
   */
  private _buildCacheKey(tenantId: string, orgId?: string): string {
    return orgId ? `${orgId}_${tenantId}` : tenantId;
  }

  /**
   * Checks if tenant has any data in database
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
            // Model might not have tenant field, continue
            continue;
          }
        }
      }
      // For Mongoose
      else if (client.models) {
        const models = Object.values(client.models);

        for (const model of models as any[]) {
          try {
            const record = await model.findOne({
              [tenantField]: tenantId,
            });
            if (record) return true;
          } catch (error) {
            // Model might not have tenant field, continue
            continue;
          }
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets distinct tenant IDs from all tables
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
              where: {
                [tenantField]: { not: null },
              },
            });

            records.forEach((record: any) => {
              const tenantId = record[tenantField];
              if (tenantId) tenantIds.add(tenantId);
            });
          } catch (error) {
            // Model might not have tenant field, continue
            continue;
          }
        }
      }
      // For Mongoose
      else if (client.models) {
        const models = Object.values(client.models);

        for (const model of models as any[]) {
          try {
            const distinctIds = await model.distinct(tenantField);
            distinctIds.forEach((id: string) => {
              if (id) tenantIds.add(id);
            });
          } catch (error) {
            // Model might not have tenant field, continue
            continue;
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
   * Deletes all data for a tenant
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
            // Model might not have tenant field, continue
            continue;
          }
        }

        if (deleteOperations.length > 0) {
          await client.$transaction(deleteOperations);
        }
      }
      // For Mongoose
      else if (client.models) {
        const models = Object.values(client.models);

        for (const model of models as any[]) {
          try {
            await model.deleteMany({ [tenantField]: tenantId });
          } catch (error) {
            // Model might not have tenant field, continue
            continue;
          }
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