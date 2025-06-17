/**
 * Enhanced Prisma adapter with auto-discovery and app detection
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/prisma.js
 */

import fs from 'fs';
import path from 'path';
import { createDatabaseError } from '../defaults.js';

/**
 * Enhanced Prisma adapter - auto-discovery + multi-tenant support
 */
export class PrismaAdapter {
  constructor(options = {}) {
    this.options = options;
    this.clients = new Map(); // Cache clients per app
    this.discoveredApps = null;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Creates Prisma client with auto-discovery and app detection
   */
  async createClient(config = {}) {
    // Auto-detect app if not provided
    const appName = config.appName || this._detectAppFromPath();
    const dbUrl = config.url || this._getDefaultUrl();
    const clientKey = `${appName}_${dbUrl}_${JSON.stringify(config.options || {})}`;

    if (!this.clients.has(clientKey)) {
      try {
        // Load app-specific Prisma client using your proven discovery
        const PrismaClient = await this._loadPrismaClientForApp(appName);

        const client = new PrismaClient({
          datasourceUrl: dbUrl,
          log: this.isDevelopment ? ['error', 'warn'] : ['error'],
          ...config.options,
        });

        await client.$connect();

        // Add app metadata
        client._appName = appName;
        client._appKit = true;

        this.clients.set(clientKey, client);

        if (this.isDevelopment) {
          console.log(`✅ [AppKit] Created Prisma client for app: ${appName}`);
        }
      } catch (error) {
        throw createDatabaseError(
          `Failed to create Prisma client for app '${appName}': ${error.message}`,
          500
        );
      }
    }

    return this.clients.get(clientKey);
  }

  /**
   * Applies tenant filtering middleware
   */
  async applyTenantMiddleware(client, tenantId, options = {}) {
    const tenantField = options.fieldName || 'tenantId';
    const appField = options.appField || 'appId';
    const useAppIsolation = options.appIsolation !== false;

    client.$use(async (params, next) => {
      // Add tenant (and app) to creates
      if (params.action === 'create' && params.args.data) {
        params.args.data[tenantField] = tenantId;
        if (useAppIsolation && client._appName) {
          params.args.data[appField] = client._appName;
        }
      }

      // Add tenant (and app) to createMany
      if (params.action === 'createMany' && params.args.data) {
        params.args.data = params.args.data.map((item) => ({
          ...item,
          [tenantField]: tenantId,
          ...(useAppIsolation &&
            client._appName && { [appField]: client._appName }),
        }));
      }

      // Add tenant (and app) to upsert
      if (params.action === 'upsert') {
        if (params.args.create) {
          params.args.create[tenantField] = tenantId;
          if (useAppIsolation && client._appName) {
            params.args.create[appField] = client._appName;
          }
        }
        if (params.args.update) {
          params.args.update[tenantField] = tenantId;
          if (useAppIsolation && client._appName) {
            params.args.update[appField] = client._appName;
          }
        }
        if (!params.args.where[tenantField]) {
          params.args.where[tenantField] = tenantId;
        }
        if (
          useAppIsolation &&
          client._appName &&
          !params.args.where[appField]
        ) {
          params.args.where[appField] = client._appName;
        }
      }

      // Add tenant (and app) filter to reads/updates/deletes
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
        const filters = { [tenantField]: tenantId };
        if (useAppIsolation && client._appName) {
          filters[appField] = client._appName;
        }

        if (params.args.where.AND) {
          // Add to existing AND clause
          const hasFilters = Object.keys(filters).every((field) =>
            params.args.where.AND.some((condition) => condition[field])
          );
          if (!hasFilters) {
            params.args.where.AND.push(filters);
          }
        } else if (params.args.where.OR) {
          // Wrap OR in AND with filters
          params.args.where = {
            AND: [filters, { OR: params.args.where.OR }],
          };
        } else {
          // Add filters to simple where
          Object.keys(filters).forEach((field) => {
            if (!params.args.where[field]) {
              params.args.where[field] = filters[field];
            }
          });
        }
      }

      return next(params);
    });

    return client;
  }

  /**
   * Auto-discover apps with Prisma clients (your proven logic)
   */
  async discoverApps() {
    if (this.discoveredApps) return this.discoveredApps;

    const searchPaths = [
      process.env.VOILA_APPS_DIR,
      ...this._findAppsDirectoryUpwards(process.cwd()),
    ].filter(Boolean);

    let foundAppsDir = null;
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        foundAppsDir = searchPath;
        break;
      }
    }

    if (!foundAppsDir) {
      if (this.isDevelopment) {
        console.warn('⚠️  [AppKit] No apps directory found');
      }
      return [];
    }

    const apps = [];
    try {
      const appFolders = fs
        .readdirSync(foundAppsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const appName of appFolders) {
        const clientPath = path.join(
          foundAppsDir,
          appName,
          'prisma/generated/client/index.js'
        );

        if (fs.existsSync(clientPath)) {
          apps.push({
            name: appName,
            clientPath,
          });

          if (this.isDevelopment) {
            console.log(`✅ [AppKit] Found Prisma client for: ${appName}`);
          }
        }
      }

      this.discoveredApps = apps;
    } catch (error) {
      console.error('❌ [AppKit] Error discovering apps:', error.message);
      return [];
    }

    return apps;
  }

  /**
   * Auto-detect app-specific Prisma client (your proven logic)
   * @private
   */
  async _loadPrismaClientForApp(appName) {
    // First try auto-discovery
    const apps = await this.discoverApps();
    const app = apps.find((a) => a.name === appName);

    if (app) {
      try {
        const module = await import(app.clientPath);
        if (module.PrismaClient) {
          return module.PrismaClient;
        }
      } catch (error) {
        console.warn(
          `Failed to load discovered client for ${appName}:`,
          error.message
        );
      }
    }

    // Fallback to path-based search (your original logic)
    const searchPaths = [
      `./apps/${appName}/prisma/generated/client/index.js`,
      `../apps/${appName}/prisma/generated/client/index.js`,
      `../../apps/${appName}/prisma/generated/client/index.js`,
      `./prisma/generated/client/index.js`, // Current app
      `../prisma/generated/client/index.js`,
      `../../prisma/generated/client/index.js`,
      '@prisma/client', // Global fallback
    ];

    let lastError;
    for (const clientPath of searchPaths) {
      try {
        if (this.isDevelopment) {
          console.debug(`  [AppKit] Trying Prisma client: ${clientPath}`);
        }

        const module = await import(clientPath);
        if (module.PrismaClient) {
          if (this.isDevelopment) {
            console.log(`✅ [AppKit] Found Prisma client at: ${clientPath}`);
          }
          return module.PrismaClient;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    throw createDatabaseError(
      `Prisma client not found for app '${appName}'. Tried: ${searchPaths.join(', ')}\n\n` +
        `To fix this:\n` +
        `1. Run: npx prisma generate (in /apps/${appName}/)\n` +
        `2. Or ensure client exists at: /apps/${appName}/prisma/generated/client/\n` +
        `3. Or set VOILA_APPS_DIR environment variable`,
      500
    );
  }

  /**
   * Auto-detect app name from path (your proven logic)
   * @private
   */
  _detectAppFromPath() {
    const cwd = process.cwd();

    // Look for /apps/{appName}/ pattern
    const appsMatch = cwd.match(/\/apps\/([^\/]+)/);
    if (appsMatch) {
      return appsMatch[1];
    }

    // Fallback to directory name
    return path.basename(cwd);
  }

  /**
   * Search upwards for apps directory (your proven logic)
   * @private
   */
  _findAppsDirectoryUpwards(startDir) {
    const paths = [];
    let currentDir = startDir;

    for (let i = 0; i < 6; i++) {
      paths.push(path.join(currentDir, 'apps'));
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }

    return paths;
  }

  /**
   * Get default database URL with environment fallbacks
   * @private
   */
  _getDefaultUrl() {
    return (
      this.options.url ||
      process.env.DATABASE_URL ||
      process.env.VOILA_DATABASE_URL ||
      process.env.VOILA_DB_URL
    );
  }

  /**
   * Database operations for database-per-tenant strategy
   */
  async createDatabase(name, systemClient) {
    throw createDatabaseError(
      'Database creation not implemented for Prisma adapter. Use migrations instead.',
      500
    );
  }

  async dropDatabase(name, systemClient) {
    throw createDatabaseError(
      'Database dropping not implemented for Prisma adapter. Use migrations instead.',
      500
    );
  }

  async listDatabases(systemClient) {
    throw createDatabaseError(
      'Database listing not implemented for Prisma adapter. Use migrations instead.',
      500
    );
  }

  async getDatabaseStats(client) {
    try {
      // Basic stats using Prisma raw queries
      const dbType = client._engine?.config?.datasourceUrl?.includes(
        'postgresql'
      )
        ? 'postgresql'
        : 'unknown';

      return {
        provider: 'prisma',
        type: dbType,
        app: client._appName || 'unknown',
        connected: true,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        provider: 'prisma',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Tenant registry operations (simplified for Prisma)
   */
  async hasTenantRegistry(client) {
    try {
      // Check if a tenant registry table/model exists
      const models = Object.keys(client).filter(
        (key) =>
          !key.startsWith('$') &&
          !key.startsWith('_') &&
          typeof client[key] === 'object'
      );
      return (
        models.includes('tenantRegistry') || models.includes('TenantRegistry')
      );
    } catch (error) {
      return false;
    }
  }

  async createTenantRegistryEntry(client, tenantId) {
    try {
      if (client.tenantRegistry) {
        await client.tenantRegistry.upsert({
          where: { tenantId },
          create: { tenantId, createdAt: new Date() },
          update: { updatedAt: new Date() },
        });
      }
    } catch (error) {
      console.debug('Failed to create tenant registry entry:', error.message);
    }
  }

  async deleteTenantRegistryEntry(client, tenantId) {
    try {
      if (client.tenantRegistry) {
        await client.tenantRegistry.delete({
          where: { tenantId },
        });
      }
    } catch (error) {
      console.debug('Failed to delete tenant registry entry:', error.message);
    }
  }

  async tenantExistsInRegistry(client, tenantId) {
    try {
      if (client.tenantRegistry) {
        const entry = await client.tenantRegistry.findUnique({
          where: { tenantId },
        });
        return !!entry;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getTenantsFromRegistry(client) {
    try {
      if (client.tenantRegistry) {
        const entries = await client.tenantRegistry.findMany({
          select: { tenantId: true },
          orderBy: { tenantId: 'asc' },
        });
        return entries.map((entry) => entry.tenantId);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Setup tenant schema (run migrations, etc.)
   */
  async setupTenantSchema(client, tenantId) {
    try {
      if (this.isDevelopment) {
        console.log(
          `[AppKit] Setting up schema for tenant '${tenantId}' in app '${client._appName}'`
        );
      }

      // For Prisma, schema is already set up via migrations
      // This is a placeholder for any tenant-specific initialization
    } catch (error) {
      console.warn(
        `Schema setup failed for tenant '${tenantId}':`,
        error.message
      );
    }
  }

  /**
   * Disconnect all cached clients
   */
  async disconnect() {
    const disconnectPromises = [];

    for (const [key, client] of this.clients) {
      disconnectPromises.push(
        client
          .$disconnect()
          .catch((error) =>
            console.warn(`Error disconnecting client ${key}:`, error.message)
          )
      );
    }

    await Promise.all(disconnectPromises);
    this.clients.clear();
    this.discoveredApps = null;
  }
}
