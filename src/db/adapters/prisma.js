/**
 * Minimal Prisma adapter with auto-detection and correct search priority
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
    this.clientPath = options.clientPath || null;
    this.detectedPath = null;
    this.isDevelopment = process.env.NODE_ENV === 'development';
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
      log: this.isDevelopment ? ['error', 'warn'] : ['error'],
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

        if (this.isDevelopment) {
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
   * Auto-detects Prisma client location with correct priority
   * @private
   */
  async _loadPrismaClient() {
    // If explicit path provided, try it first
    if (this.clientPath) {
      try {
        const prismaModule = await import(this.clientPath);
        if (prismaModule.PrismaClient) {
          this.detectedPath = this.clientPath;
          if (this.isDevelopment) {
            console.log(
              `✅ [DEV MODE] Using explicit Prisma client from: ${this.clientPath}`
            );
          }
          return prismaModule.PrismaClient;
        }
      } catch (error) {
        console.warn(
          `Failed to load Prisma client from explicit path ${this.clientPath}:`,
          error.message
        );
      }
    }

    // Search paths prioritizing app-specific clients over global ones
    const paths = [
      './prisma/generated/client', // App-specific client (highest priority)
      '../prisma/generated/client', // Parent directory
      '../../prisma/generated/client', // Grandparent directory
      '../../../prisma/generated/client', // Great-grandparent directory
      './database/generated/client', // Support database/ folder structure
      './generated/client', // Custom generated folder
      '@prisma/client', // Global client (lower priority)
      './node_modules/@prisma/client', // Local node_modules
      '../node_modules/@prisma/client', // Parent node_modules
      '../../node_modules/@prisma/client', // Grandparent node_modules
    ];

    let lastError;

    for (const path of paths) {
      try {
        if (this.isDevelopment) {
          console.debug(`  Trying: ${path}`);
        }
        const prismaModule = await import(path);

        if (prismaModule.PrismaClient) {
          this.detectedPath = path;
          if (this.isDevelopment) {
            console.log(`✅ [DEV MODE] Found Prisma client at: ${path}`);
          }
          return prismaModule.PrismaClient;
        }
      } catch (error) {
        lastError = error;
        if (this.isDevelopment) {
          console.debug(`  ❌ Failed: ${error.message}`);
        }
        continue;
      }
    }

    // If all paths failed, provide helpful error message
    throw createDatabaseError(
      `Prisma client not found. Tried paths: ${paths.join(', ')}.\n\n` +
        `To fix this:\n` +
        `1. Run: npx prisma generate\n` +
        `2. Or set explicit path: VOILA_DB_PRISMA_CLIENT_PATH=./your/path\n` +
        `3. Or inject client directly in your config\n\n` +
        `Working directory: ${process.cwd()}`,
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
