/**
 * Production-ready Prisma adapter with app isolation and tenant middleware
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/prisma.js
 */

import fs from 'fs';
import path from 'path';
import { createDatabaseError } from '../defaults.js';

export interface DiscoveredApp {
  name: string;
  clientPath: string;
}

export interface PrismaClientConfig {
  url?: string;
  appName?: string;
  options?: any;
}

/**
 * Enhanced Prisma adapter with app-level schema isolation and tenant middleware
 */
export class PrismaAdapter {
  private clients = new Map<string, any>(); // Cache clients per app/url combo
  private discoveredApps: DiscoveredApp[] | null = null; // Cache apps for process lifetime
  private isDevelopment = process.env.NODE_ENV === 'development';

  // Performance optimization: Cache app detection results
  private appDetectionCache = new Map<string, string>(); // file path -> app name
  private cacheStats = { hits: 0, misses: 0, detectionCalls: 0 };

  constructor(private options: any = {}) {
    if (this.isDevelopment) {
      console.log('⚡ [AppKit] Prisma adapter initialized with app isolation');
    }
  }

  /**
   * Creates Prisma client with cached auto-discovery
   */
  async createClient(config: PrismaClientConfig = {}): Promise<any> {
    const appName = config.appName || (await this._detectAppFromCallStackCached());
    const dbUrl = config.url || this._getDefaultUrl();
    const clientKey = `${appName}_${dbUrl}_${JSON.stringify(config.options || {})}`;

    if (!this.clients.has(clientKey)) {
      try {
        // Load app-specific Prisma client using cached discovery
        const PrismaClient = await this._loadPrismaClientForApp(appName);

        const client = new PrismaClient({
          datasources: {
            db: {
              url: dbUrl,
            },
          },
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
      } catch (error: any) {
        throw createDatabaseError(
          `Failed to create Prisma client for app '${appName}': ${error.message}`,
          500
        );
      }
    }

    return this.clients.get(clientKey);
  }

  /**
   * Apply tenant filtering middleware to Prisma client
   */
  async applyTenantMiddleware(
    client: any, 
    tenantId: string, 
    options: { fieldName?: string; orgId?: string } = {}
  ): Promise<any> {
    const tenantField = options.fieldName || 'tenant_id';

    // Add tenant middleware for automatic filtering
    client.$use(async (params: any, next: any) => {
      // Add tenant to creates
      if (params.action === 'create' && params.args.data) {
        params.args.data[tenantField] = tenantId;
      }

      // Add tenant to createMany
      if (params.action === 'createMany' && params.args.data) {
        params.args.data = params.args.data.map((item: any) => ({
          ...item,
          [tenantField]: tenantId,
        }));
      }

      // Add tenant to upsert
      if (params.action === 'upsert') {
        if (params.args.create) {
          params.args.create[tenantField] = tenantId;
        }
        if (params.args.update) {
          params.args.update[tenantField] = tenantId;
        }
        if (!params.args.where[tenantField]) {
          params.args.where[tenantField] = tenantId;
        }
      }

      // Add tenant filter to reads/updates/deletes
      if ([
        'findFirst', 'findMany', 'findUnique', 'update', 'updateMany',
        'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'
      ].includes(params.action)) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};

        // Handle complex where clauses
        if (params.args.where.AND) {
          // Add to existing AND clause
          const hasTenantFilter = params.args.where.AND.some((condition: any) => 
            condition[tenantField] !== undefined
          );
          if (!hasTenantFilter) {
            params.args.where.AND.push({ [tenantField]: tenantId });
          }
        } else if (params.args.where.OR) {
          // Wrap OR in AND with tenant filter
          params.args.where = {
            AND: [
              { [tenantField]: tenantId },
              { OR: params.args.where.OR }
            ],
          };
          delete params.args.where.OR;
        } else {
          // Add tenant filter to simple where
          if (!params.args.where[tenantField]) {
            params.args.where[tenantField] = tenantId;
          }
        }
      }

      return next(params);
    });

    // Mark as tenant-filtered for identification
    client._tenantId = tenantId;
    client._tenantFiltered = true;

    return client;
  }

  /**
   * Auto-discover apps with Prisma clients (cached)
   */
  async discoverApps(): Promise<DiscoveredApp[]> {
    if (this.discoveredApps) return this.discoveredApps;

    const searchPaths = [
      process.env.VOILA_APPS_DIR,
      ...this._findAppsDirectoryUpwards(process.cwd()),
    ].filter(Boolean);

    let foundAppsDir: string | null = null;
    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        foundAppsDir = searchPath;
        break;
      }
    }

    if (!foundAppsDir) {
      if (this.isDevelopment) {
        console.warn('⚠️  [AppKit] No apps directory found, using single app mode');
      }
      this.discoveredApps = [];
      return [];
    }

    const apps: DiscoveredApp[] = [];
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
            clientPath: `file://${clientPath}`,
          });

          if (this.isDevelopment) {
            console.log(`✅ [AppKit] Found Prisma client for app: ${appName}`);
          }
        } else if (this.isDevelopment) {
          console.log(`⚠️  [AppKit] No Prisma client found for app: ${appName}`);
          console.log(`   Expected: ${clientPath}`);
          console.log(`   Run: cd apps/${appName} && npx prisma generate`);
        }
      }

      this.discoveredApps = apps;
    } catch (error: any) {
      console.error('❌ [AppKit] Error discovering apps:', error.message);
      this.discoveredApps = [];
      return [];
    }

    if (this.isDevelopment) {
      console.log(`🔍 [AppKit] Discovered ${apps.length} apps with Prisma clients`);
    }

    return apps;
  }

  /**
   * Check if tenant registry exists (simplified for Prisma)
   */
  async hasTenantRegistry(client: any): Promise<boolean> {
    try {
      const models = Object.keys(client).filter(
        (key) =>
          !key.startsWith('$') &&
          !key.startsWith('_') &&
          typeof client[key] === 'object'
      );
      return (
        models.includes('tenantRegistry') || 
        models.includes('TenantRegistry') ||
        models.includes('tenant_registry')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Create tenant registry entry
   */
  async createTenantRegistryEntry(client: any, tenantId: string): Promise<void> {
    try {
      const registryModel = this._getTenantRegistryModel(client);
      if (registryModel) {
        await registryModel.upsert({
          where: { tenantId },
          create: { tenantId, createdAt: new Date() },
          update: { updatedAt: new Date() },
        });
      }
    } catch (error: any) {
      if (this.isDevelopment) {
        console.debug('Failed to create tenant registry entry:', error.message);
      }
    }
  }

  /**
   * Delete tenant registry entry
   */
  async deleteTenantRegistryEntry(client: any, tenantId: string): Promise<void> {
    try {
      const registryModel = this._getTenantRegistryModel(client);
      if (registryModel) {
        await registryModel.delete({
          where: { tenantId },
        });
      }
    } catch (error: any) {
      if (this.isDevelopment) {
        console.debug('Failed to delete tenant registry entry:', error.message);
      }
    }
  }

  /**
   * Check if tenant exists in registry
   */
  async tenantExistsInRegistry(client: any, tenantId: string): Promise<boolean> {
    try {
      const registryModel = this._getTenantRegistryModel(client);
      if (registryModel) {
        const entry = await registryModel.findUnique({
          where: { tenantId },
        });
        return !!entry;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all tenants from registry
   */
  async getTenantsFromRegistry(client: any): Promise<string[]> {
    try {
      const registryModel = this._getTenantRegistryModel(client);
      if (registryModel) {
        const entries = await registryModel.findMany({
          select: { tenantId: true },
          orderBy: { tenantId: 'asc' },
        });
        return entries.map((entry: any) => entry.tenantId);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Disconnect all cached clients and cleanup
   */
  async disconnect(): Promise<void> {
    const disconnectPromises = [];

    for (const [key, client] of this.clients) {
      disconnectPromises.push(
        client
          .$disconnect()
          .catch((error: any) =>
            console.warn(`Error disconnecting client ${key}:`, error.message)
          )
      );
    }

    await Promise.all(disconnectPromises);
    this.clients.clear();
    this.discoveredApps = null;
    this._clearCaches();

    if (this.isDevelopment) {
      console.log('👋 [AppKit] Prisma adapter disconnected and cleaned up');
    }
  }

  // Private helper methods

  /**
   * OPTIMIZED: Cached app detection with multiple strategies
   */
  private async _detectAppFromCallStackCached(): Promise<string> {
    this.cacheStats.detectionCalls++;

    try {
      // Strategy 1: Check calling file directly (fastest)
      const callingFile = this._getCallingFile();
      if (callingFile) {
        if (this.appDetectionCache.has(callingFile)) {
          this.cacheStats.hits++;
          return this.appDetectionCache.get(callingFile)!;
        }

        // Quick file path check
        const appFromPath = this._extractAppFromPath(callingFile);
        if (appFromPath) {
          this.appDetectionCache.set(callingFile, appFromPath);
          this.cacheStats.misses++;
          return appFromPath;
        }
      }

      // Strategy 2: Use current working directory
      return this._getFallbackApp();
    } catch (error) {
      if (this.isDevelopment) {
        console.error('❌ [AppKit] Error in app detection:', error);
      }
      return 'main';
    }
  }

  /**
   * Get the file that called the database function
   */
  private _getCallingFile(): string | null {
    try {
      const stack = new Error().stack;
      if (!stack) return null;

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
   * Extract app name from file path (respects your existing structure)
   */
  private _extractAppFromPath(filePath: string): string | null {
    // Your existing pattern: /apps/{appName}/
    const appsMatch = filePath.match(/\/apps\/([^\/]+)\//);
    return appsMatch ? appsMatch[1] : null;
  }

  /**
   * Load Prisma client for app with caching
   */
  private async _loadPrismaClientForApp(appName: string): Promise<any> {
    // Use cached app discovery
    const apps = await this.discoverApps();
    const app = apps.find((a) => a.name === appName);

    if (app) {
      try {
        const module = await import(app.clientPath);
        if (module.PrismaClient) {
          return module.PrismaClient;
        }
        if (module.default?.PrismaClient) {
          return module.default.PrismaClient;
        }
      } catch (error: any) {
        if (this.isDevelopment) {
          console.warn(`Failed to load discovered client for ${appName}:`, error.message);
        }
      }
    }

    // Fallback to path-based search (your existing relative path structure)
    return await this._loadClientWithPathSearch(appName);
  }

  /**
   * Path-based client loading fallback (respects your prisma folder structure)
   */
  private async _loadClientWithPathSearch(appName: string): Promise<any> {
    const searchPaths = [
      // Your existing structure: relative prisma folder from app directory
      './prisma/generated/client/index.js',
      '../prisma/generated/client/index.js',
      `./apps/${appName}/prisma/generated/client/index.js`,
      `../apps/${appName}/prisma/generated/client/index.js`,
      `../../apps/${appName}/prisma/generated/client/index.js`,
      '@prisma/client', // Global fallback
    ];

    let lastError: any;
    for (const clientPath of searchPaths) {
      try {
        const module = await import(clientPath);
        if (module.PrismaClient) {
          if (this.isDevelopment) {
            console.log(`✅ [AppKit] Found Prisma client at: ${clientPath}`);
          }
          return module.PrismaClient;
        }
        if (module.default?.PrismaClient) {
          return module.default.PrismaClient;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    throw createDatabaseError(
      `Prisma client not found for app '${appName}'. Tried: ${searchPaths.join(', ')}\n\n` +
        `To fix this:\n` +
        `1. Run: cd apps/${appName} && npx prisma generate\n` +
        `2. Or ensure client exists at: apps/${appName}/prisma/generated/client/`,
      500
    );
  }

  /**
   * Get fallback app with smart defaults
   */
  private _getFallbackApp(): string {
    try {
      const cwd = process.cwd();
      
      // Check if we're inside an app directory
      const appsMatch = cwd.match(/\/apps\/([^\/]+)/);
      if (appsMatch) {
        return appsMatch[1];
      }

      // Use directory name as fallback
      return path.basename(cwd).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    } catch {
      return 'main';
    }
  }

  /**
   * Search upwards for apps directory
   */
  private _findAppsDirectoryUpwards(startDir: string): string[] {
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
   */
  private _getDefaultUrl(): string {
    return (
      this.options.url ||
      process.env.DATABASE_URL ||
      process.env.VOILA_DB_URL
    );
  }

  /**
   * Get tenant registry model (handles different naming conventions)
   */
  private _getTenantRegistryModel(client: any): any {
    const possibleNames = ['tenantRegistry', 'TenantRegistry', 'tenant_registry'];
    
    for (const name of possibleNames) {
      if (client[name] && typeof client[name].findUnique === 'function') {
        return client[name];
      }
    }
    
    return null;
  }

  /**
   * Log cache performance stats
   */
  private _logCacheStats(): void {
    if (this.cacheStats.detectionCalls > 0) {
      const hitRate = (
        (this.cacheStats.hits / this.cacheStats.detectionCalls) * 100
      ).toFixed(1);
      console.log(
        `📊 [AppKit] Cache stats: ${this.cacheStats.hits} hits, ${this.cacheStats.misses} misses (${hitRate}% hit rate)`
      );
    }
  }

  /**
   * Clear caches (for testing or memory management)
   */
  private _clearCaches(): void {
    this.appDetectionCache.clear();
    this.cacheStats = { hits: 0, misses: 0, detectionCalls: 0 };
  }
}