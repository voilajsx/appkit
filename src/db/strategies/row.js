/**
 * Row-level multi-tenancy strategy implementation
 * @module @voilajsx/appkit/db
 * @file src/db/strategies/row.js
 */

import { createDatabaseError } from '../defaults.js';

/**
 * Row-level multi-tenancy strategy
 * All tenants share the same database and tables, with tenant isolation via a tenantId column
 */
export class RowStrategy {
  /**
   * Creates a new RowStrategy instance
   * @param {Object} options - Strategy configuration
   * @param {string} options.url - Database connection URL
   * @param {string} [options.fieldName='tenantId'] - Field name for tenant isolation
   * @param {Object} adapter - Database adapter instance
   */
  constructor(options, adapter) {
    this.options = options;
    this.adapter = adapter;
    this.tenantField = options.fieldName || 'tenantId';
    this.connections = new Map(); // Cache connections per tenant
  }

  /**
   * Gets database connection for tenant with automatic filtering
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<Object>} Database client with tenant middleware applied
   */
  async getConnection(tenantId) {
    // Check cache first
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId);
    }

    try {
      // Create base client connection
      const client = await this.adapter.createClient({
        url: this.options.url,
        ...this.options.connection,
      });

      // Apply tenant middleware for automatic filtering
      const tenantClient = await this.adapter.applyTenantMiddleware(
        client,
        tenantId,
        {
          fieldName: this.tenantField,
        }
      );

      // Cache the connection
      this.connections.set(tenantId, tenantClient);

      return tenantClient;
    } catch (error) {
      throw createDatabaseError(
        `Failed to create tenant connection for '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Creates a new tenant (no-op for row-level strategy)
   * Tenant is created implicitly when first record is inserted
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async createTenant(tenantId) {
    // For row-level strategy, tenants are created implicitly
    // We can optionally create a tenant registry entry here
    try {
      const client = await this.adapter.createClient({ url: this.options.url });

      // Check if we have a tenant registry table
      if (await this._hasTenantRegistry(client)) {
        await this._createTenantRegistryEntry(client, tenantId);
      }

      // Close temporary connection
      await this._closeClient(client);

      return Promise.resolve();
    } catch (error) {
      throw createDatabaseError(
        `Failed to register tenant '${tenantId}': ${error.message}`,
        500
      );
    }
  }

  /**
   * Deletes all data for a tenant
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async deleteTenant(tenantId) {
    let client = null;

    try {
      client = await this.adapter.createClient({ url: this.options.url });

      // Remove from cache first
      if (this.connections.has(tenantId)) {
        const cachedClient = this.connections.get(tenantId);
        await this._closeClient(cachedClient);
        this.connections.delete(tenantId);
      }

      // Delete all tenant data
      await this._deleteAllTenantData(client, tenantId);

      // Remove from tenant registry if exists
      if (await this._hasTenantRegistry(client)) {
        await this._deleteTenantRegistryEntry(client, tenantId);
      }
    } catch (error) {
      throw createDatabaseError(
        `Failed to delete tenant data for '${tenantId}': ${error.message}`,
        500
      );
    } finally {
      if (client) {
        await this._closeClient(client);
      }
    }
  }

  /**
   * Checks if tenant exists by looking for any records with the tenant ID
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<boolean>} True if tenant has any data
   */
  async tenantExists(tenantId) {
    let client = null;

    try {
      client = await this.adapter.createClient({ url: this.options.url });

      // Check tenant registry first if available
      if (await this._hasTenantRegistry(client)) {
        return await this._tenantExistsInRegistry(client, tenantId);
      }

      // Fallback: check if tenant has any data in any table
      return await this._tenantHasData(client, tenantId);
    } catch (error) {
      throw createDatabaseError(
        `Failed to check tenant existence for '${tenantId}': ${error.message}`,
        500
      );
    } finally {
      if (client) {
        await this._closeClient(client);
      }
    }
  }

  /**
   * Lists all tenants by finding distinct tenant IDs across all tables
   * @returns {Promise<string[]>} Array of tenant IDs
   */
  async listTenants() {
    let client = null;

    try {
      client = await this.adapter.createClient({ url: this.options.url });

      // Use tenant registry if available
      if (await this._hasTenantRegistry(client)) {
        return await this._getTenantsFromRegistry(client);
      }

      // Fallback: scan all tables for distinct tenant IDs
      return await this._getDistinctTenantIds(client);
    } catch (error) {
      throw createDatabaseError(
        `Failed to list tenants: ${error.message}`,
        500
      );
    } finally {
      if (client) {
        await this._closeClient(client);
      }
    }
  }

  /**
   * Disconnects all cached connections
   * @returns {Promise<void>}
   */
  async disconnect() {
    const disconnectPromises = [];

    for (const [tenantId, connection] of this.connections) {
      disconnectPromises.push(
        this._closeClient(connection).catch((error) =>
          console.warn(`Error disconnecting tenant ${tenantId}:`, error.message)
        )
      );
    }

    await Promise.all(disconnectPromises);
    this.connections.clear();
  }

  // Private helper methods

  /**
   * Checks if tenant registry table exists
   * @private
   */
  async _hasTenantRegistry(client) {
    try {
      return await this.adapter.hasTenantRegistry(client);
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates entry in tenant registry
   * @private
   */
  async _createTenantRegistryEntry(client, tenantId) {
    return await this.adapter.createTenantRegistryEntry(client, tenantId);
  }

  /**
   * Deletes entry from tenant registry
   * @private
   */
  async _deleteTenantRegistryEntry(client, tenantId) {
    return await this.adapter.deleteTenantRegistryEntry(client, tenantId);
  }

  /**
   * Checks if tenant exists in registry
   * @private
   */
  async _tenantExistsInRegistry(client, tenantId) {
    return await this.adapter.tenantExistsInRegistry(client, tenantId);
  }

  /**
   * Gets all tenants from registry
   * @private
   */
  async _getTenantsFromRegistry(client) {
    return await this.adapter.getTenantsFromRegistry(client);
  }

  /**
   * Checks if tenant has any data in database
   * @private
   */
  async _tenantHasData(client, tenantId) {
    try {
      // For Prisma
      if (client.$queryRaw) {
        const models = this._getPrismaModels(client);

        for (const modelName of models) {
          try {
            const record = await client[modelName].findFirst({
              where: { [this.tenantField]: tenantId },
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

        for (const model of models) {
          try {
            const record = await model.findOne({
              [this.tenantField]: tenantId,
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
   * @private
   */
  async _getDistinctTenantIds(client) {
    const tenantIds = new Set();

    try {
      // For Prisma
      if (client.$queryRaw) {
        const models = this._getPrismaModels(client);

        for (const modelName of models) {
          try {
            const records = await client[modelName].findMany({
              select: { [this.tenantField]: true },
              distinct: [this.tenantField],
              where: {
                [this.tenantField]: { not: null },
              },
            });

            records.forEach((record) => {
              const tenantId = record[this.tenantField];
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

        for (const model of models) {
          try {
            const distinctIds = await model.distinct(this.tenantField);
            distinctIds.forEach((id) => {
              if (id) tenantIds.add(id);
            });
          } catch (error) {
            // Model might not have tenant field, continue
            continue;
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
   * Deletes all data for a tenant
   * @private
   */
  async _deleteAllTenantData(client, tenantId) {
    try {
      // For Prisma - use transaction for safety
      if (client.$transaction) {
        const models = this._getPrismaModels(client);
        const deleteOperations = [];

        for (const modelName of models) {
          try {
            deleteOperations.push(
              client[modelName].deleteMany({
                where: { [this.tenantField]: tenantId },
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

        for (const model of models) {
          try {
            await model.deleteMany({ [this.tenantField]: tenantId });
          } catch (error) {
            // Model might not have tenant field, continue
            continue;
          }
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
