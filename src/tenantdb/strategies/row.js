/**
 * @voilajsx/appkit - Row-level multi-tenancy strategy
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/strategies/row.js
 */

/**
 * Row-level multi-tenancy strategy
 * All tenants share the same database and tables, with tenant isolation via a tenantId column
 */
export class RowStrategy {
  constructor(options, adapter) {
    this.options = options;
    this.adapter = adapter;
  }

  /**
   * Gets database connection for tenant
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<Object>} Database client with tenant middleware
   */
  async getConnection(tenantId) {
    const client = await this.adapter.createClient({ url: this.options.url });
    return this.adapter.applyTenantMiddleware(client, tenantId);
  }

  /**
   * Creates a new tenant (no-op for row-level strategy)
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async createTenant(tenantId) {
    // For row-level strategy, no special setup needed
    // Tenant is created implicitly when first record is inserted
    return Promise.resolve();
  }

  /**
   * Deletes a tenant's data
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<void>}
   */
  async deleteTenant(tenantId) {
    const client = await this.adapter.createClient({ url: this.options.url });

    try {
      // For Prisma
      if (client.$transaction) {
        const modelNames = Object.keys(client).filter(
          (key) =>
            !key.startsWith('$') &&
            !key.startsWith('_') &&
            typeof client[key].deleteMany === 'function'
        );

        await client.$transaction(
          modelNames.map((modelName) =>
            client[modelName].deleteMany({ where: { tenantId } })
          )
        );
      }
      // For Mongoose
      else if (client.models) {
        const models = Object.values(client.models);
        for (const model of models) {
          await model.deleteMany({ tenantId });
        }
      }
    } finally {
      (await client.$disconnect?.()) || (await client.close?.());
    }
  }

  /**
   * Checks if tenant exists
   * @param {string} tenantId - Tenant identifier
   * @returns {Promise<boolean>}
   */
  async tenantExists(tenantId) {
    const client = await this.adapter.createClient({ url: this.options.url });

    try {
      // For Prisma
      if (client.$queryRaw) {
        const models = Object.keys(client).filter(
          (key) =>
            !key.startsWith('$') &&
            !key.startsWith('_') &&
            typeof client[key].findFirst === 'function'
        );

        for (const modelName of models) {
          try {
            const record = await client[modelName].findFirst({
              where: { tenantId },
            });
            if (record) return true;
          } catch (e) {
            // Model might not have tenantId field
          }
        }
      }
      // For Mongoose
      else if (client.models) {
        const models = Object.values(client.models);
        for (const model of models) {
          try {
            const record = await model.findOne({ tenantId });
            if (record) return true;
          } catch (e) {
            // Model might not have tenantId field
          }
        }
      }

      return false;
    } finally {
      (await client.$disconnect?.()) || (await client.close?.());
    }
  }

  /**
   * Lists all tenants
   * @returns {Promise<string[]>} Array of tenant IDs
   */
  async listTenants() {
    const client = await this.adapter.createClient({ url: this.options.url });

    try {
      const tenantIds = new Set();

      // For Prisma
      if (client.$queryRaw) {
        const models = Object.keys(client).filter(
          (key) =>
            !key.startsWith('$') &&
            !key.startsWith('_') &&
            typeof client[key].findMany === 'function'
        );

        for (const modelName of models) {
          try {
            const records = await client[modelName].findMany({
              select: { tenantId: true },
              distinct: ['tenantId'],
            });

            records.forEach((r) => {
              if (r.tenantId) tenantIds.add(r.tenantId);
            });
          } catch (e) {
            // Model might not have tenantId field
          }
        }
      }
      // For Mongoose
      else if (client.models) {
        const models = Object.values(client.models);
        for (const model of models) {
          try {
            const records = await model.distinct('tenantId');
            records.forEach((tenantId) => {
              if (tenantId) tenantIds.add(tenantId);
            });
          } catch (e) {
            // Model might not have tenantId field
          }
        }
      }

      return Array.from(tenantIds);
    } finally {
      (await client.$disconnect?.()) || (await client.close?.());
    }
  }

  /**
   * Disconnects all connections
   * @returns {Promise<void>}
   */
  async disconnect() {
    // No persistent connections in this strategy
    return Promise.resolve();
  }
}
