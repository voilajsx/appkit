/**
 * Minimal Prisma adapter with auto-detection
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/prisma.js
 */

import { createDatabaseError } from '../defaults.js';

/**
 * Minimal Prisma adapter - just what you need, nothing more
 */
export class PrismaAdapter {
  constructor(options) {
    this.options = options;
    this.PrismaClient = options.client || null;
  }

  /**
   * Creates Prisma client with auto-detection
   */
  async createClient(config) {
    if (!this.PrismaClient) {
      this.PrismaClient = await this._loadPrismaClient();
    }

    const client = new this.PrismaClient({
      datasourceUrl: config.url,
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    await client.$connect();
    return client;
  }

  /**
   * Applies tenant filtering middleware
   */
  async applyTenantMiddleware(client, tenantId, options = {}) {
    const tenantField = options.fieldName || 'tenantId';

    client.$use(async (params, next) => {
      // Add tenant to creates
      if (params.action === 'create' && params.args.data) {
        params.args.data[tenantField] = tenantId;
      }

      // Add tenant to createMany
      if (params.action === 'createMany' && params.args.data) {
        params.args.data = params.args.data.map((item) => ({
          ...item,
          [tenantField]: tenantId,
        }));
      }

      // Add tenant to upsert
      if (params.action === 'upsert') {
        if (params.args.create) params.args.create[tenantField] = tenantId;
        if (params.args.update) params.args.update[tenantField] = tenantId;
        if (!params.args.where[tenantField])
          params.args.where[tenantField] = tenantId;
      }

      // Add tenant filter to reads/updates/deletes
      if (
        [
          'findFirst',
          'findMany',
          'findUnique',
          'update',
          'updateMany',
          'delete',
          'deleteMany',
          'count',
        ].includes(params.action)
      ) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};

        // Handle complex where clauses
        if (params.args.where.AND) {
          if (
            !params.args.where.AND.some((condition) => condition[tenantField])
          ) {
            params.args.where.AND.push({ [tenantField]: tenantId });
          }
        } else if (params.args.where.OR) {
          params.args.where = {
            AND: [{ [tenantField]: tenantId }, { OR: params.args.where.OR }],
          };
        } else if (!params.args.where[tenantField]) {
          params.args.where[tenantField] = tenantId;
        }
      }

      return next(params);
    });

    return client;
  }

  /**
   * Applies app + tenant filtering for monorepo with table prefixing
   */
  async applyAppTenantMiddleware(
    client,
    {
      appId,
      tenantId,
      appField = 'appId',
      tenantField = 'tenantId',
      tablePrefix = true,
    }
  ) {
    const prefix = tablePrefix ? `${appId}_` : '';

    client.$use(async (params, next) => {
      // Auto-prefix table names to prevent app clashes
      if (prefix && params.model) {
        const originalModel = params.model;
        params.model = params.model.startsWith(prefix)
          ? params.model
          : `${prefix}${params.model}`;

        if (process.env.NODE_ENV === 'development') {
          console.debug(
            `🏷️  Prefixed table: ${originalModel} → ${params.model}`
          );
        }
      }

      // Add app + tenant to creates
      if (params.action === 'create' && params.args.data) {
        params.args.data[appField] = appId;
        if (tenantId) params.args.data[tenantField] = tenantId;
      }

      // Add app + tenant to createMany
      if (params.action === 'createMany' && params.args.data) {
        params.args.data = params.args.data.map((item) => ({
          ...item,
          [appField]: appId,
          ...(tenantId && { [tenantField]: tenantId }),
        }));
      }

      // Add app + tenant to upsert
      if (params.action === 'upsert') {
        if (params.args.create) {
          params.args.create[appField] = appId;
          if (tenantId) params.args.create[tenantField] = tenantId;
        }
        if (params.args.update) {
          params.args.update[appField] = appId;
          if (tenantId) params.args.update[tenantField] = tenantId;
        }
        if (!params.args.where[appField]) params.args.where[appField] = appId;
        if (tenantId && !params.args.where[tenantField])
          params.args.where[tenantField] = tenantId;
      }

      // Add filters to all operations
      if (
        [
          'findFirst',
          'findMany',
          'findUnique',
          'update',
          'updateMany',
          'delete',
          'deleteMany',
          'count',
        ].includes(params.action)
      ) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};

        // Always filter by app
        if (!params.args.where[appField]) {
          params.args.where[appField] = appId;
        }

        // Filter by tenant if provided
        if (tenantId && !params.args.where[tenantField]) {
          params.args.where[tenantField] = tenantId;
        }
      }

      return next(params);
    });

    return client;
  }

  /**
   * Auto-detects Prisma client location
   * @private
   */
  async _loadPrismaClient() {
    const paths = [
      '@prisma/client',
      './prisma/generated/client', // Root generated client
      '../prisma/generated/client', // Parent directory
      '../../prisma/generated/client', // Grandparent directory
      '../../../prisma/generated/client', // Great-grandparent directory
      './database/generated/client', // Support database/ folder structure
      './generated/client',
      './node_modules/@prisma/client',
      '../node_modules/@prisma/client',
      '../../node_modules/@prisma/client',
    ];

    for (const path of paths) {
      try {
        const prismaModule = await import(path);
        if (prismaModule.PrismaClient) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Found Prisma client at: ${path}`);
          }
          return prismaModule.PrismaClient;
        }
      } catch (error) {
        continue;
      }
    }

    throw createDatabaseError(
      `Prisma client not found. Run: npx prisma generate`,
      500
    );
  }

  // Minimal required methods for compatibility
  async disconnect() {
    return Promise.resolve();
  }

  async hasTenantRegistry() {
    return false;
  }

  async createTenantRegistryEntry() {
    return Promise.resolve();
  }

  async deleteTenantRegistryEntry() {
    return Promise.resolve();
  }

  async tenantExistsInRegistry() {
    return false;
  }

  async getTenantsFromRegistry() {
    return [];
  }
}
