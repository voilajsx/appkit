/**
 * @voilajsx/appkit - Multi-tenant database core
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/database.js
 */

import { RowStrategy } from './strategies/row.js';
import { DatabaseStrategy } from './strategies/database.js';
import { PrismaAdapter } from './adapters/prisma.js';
import { MongooseAdapter } from './adapters/mongoose.js';

// Available strategies
const strategies = {
  row: RowStrategy,
  database: DatabaseStrategy,
};

// Available adapters
const adapters = {
  prisma: PrismaAdapter,
  mongoose: MongooseAdapter,
};

/**
 * Creates a multi-tenant database instance
 * @param {Object} config - Configuration options
 * @param {string} config.url - Database connection URL
 * @param {string} [config.strategy] - Tenancy strategy: 'row' or 'database' (auto-detected)
 * @param {string} [config.adapter] - Database adapter: 'prisma' or 'mongoose' (auto-detected)
 * @returns {Object} Multi-tenant database instance
 */
export function createDb(config) {
  if (!config?.url) {
    throw new Error('Database URL is required');
  }

  // Auto-detect strategy from URL
  const hasPlaceholder = config.url.includes('{tenant}');
  const strategy = config.strategy || (hasPlaceholder ? 'database' : 'row');

  // Auto-detect adapter from URL
  const isMongoUrl = config.url.includes('mongodb');
  const adapter = config.adapter || (isMongoUrl ? 'mongoose' : 'prisma');

  // Validate strategy
  const StrategyClass = strategies[strategy];
  if (!StrategyClass) {
    throw new Error(
      `Unknown strategy: ${strategy}. Supported: ${Object.keys(strategies).join(', ')}`
    );
  }

  // Validate adapter
  const AdapterClass = adapters[adapter];
  if (!AdapterClass) {
    throw new Error(
      `Unknown adapter: ${adapter}. Supported: ${Object.keys(adapters).join(', ')}`
    );
  }

  // Initialize adapter and strategy
  const adapterInstance = new AdapterClass({ url: config.url });
  const strategyInstance = new StrategyClass(
    { url: config.url },
    adapterInstance
  );

  const instance = {
    /**
     * Gets database connection for a specific tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Database client for the tenant
     */
    async forTenant(tenantId) {
      if (!tenantId) {
        throw new Error('Tenant ID is required');
      }

      return strategyInstance.getConnection(tenantId);
    },

    /**
     * Creates a new tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async createTenant(tenantId) {
      if (!tenantId) {
        throw new Error('Tenant ID is required');
      }

      // Validate tenant ID format
      if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
        throw new Error(
          'Tenant ID must contain only alphanumeric characters, underscores, and hyphens'
        );
      }

      return strategyInstance.createTenant(tenantId);
    },

    /**
     * Deletes a tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async deleteTenant(tenantId) {
      if (!tenantId) {
        throw new Error('Tenant ID is required');
      }

      return strategyInstance.deleteTenant(tenantId);
    },

    /**
     * Checks if tenant exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    async tenantExists(tenantId) {
      if (!tenantId) {
        return false;
      }

      return strategyInstance.tenantExists(tenantId);
    },

    /**
     * Lists all tenants
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    async listTenants() {
      return strategyInstance.listTenants();
    },

    /**
     * Disconnects all connections and cleans up
     * @returns {Promise<void>}
     */
    async disconnect() {
      await strategyInstance.disconnect();
      await adapterInstance.disconnect();
    },
  };

  // Add cleanup on process exit
  const cleanup = async () => {
    try {
      await instance.disconnect();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  return instance;
}
