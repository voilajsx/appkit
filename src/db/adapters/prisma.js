/**
 * Production-ready Prisma adapter with optimal caching
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/prisma.js
 */

import fs from 'fs';
import path from 'path';
import { createDatabaseError } from '../defaults.js';

/**
 * Enhanced Prisma adapter with performance optimizations
 */
export class PrismaAdapter {
  constructor(options = {}) {
    this.options = options;
    this.clients = new Map(); // Cache clients per app
    this.discoveredApps = null; // Cache apps for process lifetime
    this.isDevelopment = process.env.NODE_ENV === 'development';

    // PERFORMANCE OPTIMIZATION: Cache app detection results
    this.appDetectionCache = new Map(); // Cache file path -> app name mappings
    this.callStackCache = new Map(); // Cache call patterns -> app name
    this.cacheStats = {
      hits: 0,
      misses: 0,
      detectionCalls: 0,
    };

    if (this.isDevelopment) {
      console.log(
        '⚡ [AppKit] Process-lifetime caching enabled - optimal for restart-based deployments'
      );
    }
  }

  /**
   * Creates Prisma client with cached auto-discovery
   */
  async createClient(config = {}) {
    // Use cached app detection for better performance
    const appName =
      config.appName || (await this._detectAppFromCallStackCached());
    const dbUrl = config.url || this._getDefaultUrl();
    const clientKey = `${appName}_${dbUrl}_${JSON.stringify(config.options || {})}`;

    if (!this.clients.has(clientKey)) {
      try {
        // Load app-specific Prisma client using cached discovery
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
          this._logCacheStats();
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
   * OPTIMIZED: Cached app detection with multiple strategies
   * @private
   */
  async _detectAppFromCallStackCached() {
    this.cacheStats.detectionCalls++;

    try {
      // Strategy 1: Check if we can determine app from calling file directly (fastest)
      const callingFile = this._getCallingFile();
      if (callingFile) {
        if (this.appDetectionCache.has(callingFile)) {
          this.cacheStats.hits++;
          return this.appDetectionCache.get(callingFile);
        }

        // Quick file path check (fastest)
        const appFromPath = this._extractAppFromPath(callingFile);
        if (appFromPath) {
          this.appDetectionCache.set(callingFile, appFromPath);
          this.cacheStats.misses++;
          if (this.isDevelopment) {
            console.log(`⚡ [AppKit] Fast path detection: ${appFromPath}`);
          }
          return appFromPath;
        }
      }

      // Strategy 2: Call stack analysis (slower, cached by pattern)
      return await this._detectFromCallStackWithCache();
    } catch (error) {
      if (this.isDevelopment) {
        console.error(
          '❌ [AppKit] Error in cached app detection:',
          error.message
        );
      }
      return 'main';
    }
  }

  /**
   * Get the file that called the database function (fast)
   * @private
   */
  _getCallingFile() {
    try {
      const stack = new Error().stack;
      const stackLines = stack.split('\n');

      // Look for the first non-AppKit file in the stack
      for (let i = 1; i < Math.min(stackLines.length, 10); i++) {
        const line = stackLines[i];
        if (
          line.includes('file://') &&
          !line.includes('/node_modules/@voilajsx/appkit/') &&
          !line.includes('/node_modules/')
        ) {
          const fileMatch = line.match(/file:\/\/([^)]+)/);
          if (fileMatch) {
            return fileMatch[1].split(':')[0]; // Remove line numbers
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract app name from file path (very fast)
   * @private
   */
  _extractAppFromPath(filePath) {
    const appsMatch = filePath.match(/\/apps\/([^\/]+)\//);
    return appsMatch ? appsMatch[1] : null;
  }

  /**
   * Call stack analysis with caching by pattern
   * @private
   */
  async _detectFromCallStackWithCache() {
    try {
      const stack = new Error().stack;

      // Create a cache key from the call pattern
      const callPattern = this._extractCallPattern(stack);

      if (this.callStackCache.has(callPattern)) {
        this.cacheStats.hits++;
        return this.callStackCache.get(callPattern);
      }

      // Do the expensive call stack analysis
      const stackLines = stack.split('\n');

      // Look through stack trace for /apps/{appName}/ pattern
      for (const line of stackLines) {
        const fileMatch = line.match(/(?:file:\/\/)?([^)]+)/);
        if (fileMatch) {
          const filePath = fileMatch[1];
          const appsMatch = filePath.match(/\/apps\/([^\/]+)\//);
          if (appsMatch) {
            const detectedApp = appsMatch[1];

            // Cache this pattern for future calls
            this.callStackCache.set(callPattern, detectedApp);
            this.cacheStats.misses++;

            if (this.isDevelopment) {
              console.log(`🔍 [AppKit] Stack analysis cached: ${detectedApp}`);
            }
            return detectedApp;
          }
        }
      }

      // Fallback strategies
      return this._getFallbackApp();
    } catch (error) {
      return 'main';
    }
  }

  /**
   * Extract a pattern from call stack for caching
   * @private
   */
  _extractCallPattern(stack) {
    const lines = stack.split('\n').slice(1, 6); // First 5 lines
    return lines
      .map((line) => {
        // Extract just the function names and remove file paths
        const funcMatch = line.match(/at\s+([^(]+)/);
        return funcMatch ? funcMatch[1].trim() : '';
      })
      .filter(Boolean)
      .join('->');
  }

  /**
   * Load Prisma client for app with caching
   * @private
   */
  async _loadPrismaClientForApp(appName) {
    // Use cached app discovery
    const apps = await this.discoverAppsCached();
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

    // Fallback to path-based search
    return await this._loadClientWithPathSearch(appName);
  }

  /**
   * Cached app discovery (only runs once per process)
   */
  async discoverAppsCached() {
    if (this.discoveredApps !== null) {
      return this.discoveredApps;
    }

    return await this.discoverApps(); // This caches in discoveredApps
  }

  /**
   * Path-based client loading fallback
   * @private
   */
  async _loadClientWithPathSearch(appName) {
    const searchPaths = [
      `./apps/${appName}/prisma/generated/client/index.js`,
      `../apps/${appName}/prisma/generated/client/index.js`,
      `../../apps/${appName}/prisma/generated/client/index.js`,
      `./prisma/generated/client/index.js`,
      `../prisma/generated/client/index.js`,
      `../../prisma/generated/client/index.js`,
      '@prisma/client',
    ];

    let lastError;
    for (const clientPath of searchPaths) {
      try {
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
        `2. Or ensure client exists at: /apps/${appName}/prisma/generated/client/`,
      500
    );
  }

  /**
   * Get fallback app with smart defaults
   * @private
   */
  _getFallbackApp() {
    // Check if we're in a VoilaJS project
    if (this._isVoilaJSProject()) {
      return 'main';
    }

    // Use directory name as last resort
    return path.basename(process.cwd());
  }

  /**
   * Log cache performance stats
   * @private
   */
  _logCacheStats() {
    if (this.cacheStats.detectionCalls > 0) {
      const hitRate = (
        (this.cacheStats.hits / this.cacheStats.detectionCalls) *
        100
      ).toFixed(1);
      console.log(
        `📊 [AppKit] Cache stats: ${this.cacheStats.hits} hits, ${this.cacheStats.misses} misses (${hitRate}% hit rate)`
      );
    }
  }

  /**
   * Auto-discover apps with Prisma clients
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
      this.discoveredApps = [];
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
      this.discoveredApps = [];
      return [];
    }

    return apps;
  }

  /**
   * Apply tenant filtering middleware
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
   * Search upwards for apps directory
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
   * Check if we're in a VoilaJS project structure
   * @private
   */
  _isVoilaJSProject() {
    const cwd = process.cwd();
    const appsDir = path.join(cwd, 'apps');
    const packageJsonPath = path.join(cwd, 'package.json');

    try {
      if (!fs.existsSync(appsDir)) return false;

      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        if (
          packageJson.dependencies?.['@voilajsx/voilajs'] ||
          packageJson.name?.includes('voila')
        ) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
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
   * Clear caches (for testing or memory management)
   */
  clearCaches() {
    this.appDetectionCache.clear();
    this.callStackCache.clear();
    this.cacheStats = { hits: 0, misses: 0, detectionCalls: 0 };
    if (this.isDevelopment) {
      console.log('🧹 [AppKit] Detection caches cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      ...this.cacheStats,
      appDetectionCacheSize: this.appDetectionCache.size,
      callStackCacheSize: this.callStackCache.size,
      clientCacheSize: this.clients.size,
    };
  }

  /**
   * Force refresh app discovery (for special cases)
   */
  async refreshApps() {
    this.discoveredApps = null;
    const apps = await this.discoverApps();
    if (this.isDevelopment) {
      console.log(
        `🔄 [AppKit] Apps refreshed: ${apps.map((a) => a.name).join(', ')}`
      );
    }
    return apps;
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
      // Basic stats using Prisma
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
   * Disconnect all cached clients and cleanup
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
    this.clearCaches();

    if (this.isDevelopment) {
      console.log('👋 [AppKit] Prisma adapter disconnected and cleaned up');
    }
  }
}
