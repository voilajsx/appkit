/**
 * Simplified Database API - org/tenant with auto app detection and vector support
 * 
 * Environment Variables Required:
 * - DATABASE_URL: PostgreSQL connection string
 * 
 * Environment Variables Optional:
 * - VOILA_DB_ORGS: Enable organization mode (true/false)
 * - VOILA_DB_TENANTS: Enable tenant mode (true/false)
 * - VOILA_DB_VECTORS: Enable vector operations (true/false)
 * 
 * Usage Examples:
 * - const db = await database.get()
 * - const tenantDB = await database.tenant('team-1')
 * - const orgDB = await database.org('acme').get()
 * - const vectorDB = await database.vectors()
 * 
 * @module @voilajsx/appkit/db
 * @file src/db/index.ts
 */

import { DatabaseClass } from './database';
import { 
  getSmartDefaults, 
  validateApiUsage, 
  createApiError, 
  createDatabaseError, 
  type DatabaseConfig 
} from './defaults';

// Global database instances cache
const instances = new Map<string, DatabaseClass>();

/**
 * Organization Database - provides tenant and vector methods within organization
 */
class OrgDatabase {
  constructor(
    private orgId: string,
    private config: DatabaseConfig
  ) {}

  /**
   * Get tenant-specific database within organization
   */
  async tenant(tenantId: string): Promise<any> {
    const db = this._getDatabase();
    return await db.tenant(tenantId, { orgId: this.orgId });
  }

  /**
   * Get organization database (no tenant filtering)
   */
  async get(): Promise<any> {
    const db = this._getDatabase();
    return await db.client({ orgId: this.orgId });
  }

  /**
   * Get vector operations for this organization
   */
  async vectors(): Promise<any> {
    if (!this.config.vector.enabled) {
      throw createDatabaseError(createApiError('vectors', this.config), 400);
    }

    const db = this._getDatabase();
    const orgClient = await db.client({ orgId: this.orgId });
    return orgClient; // Same database, vector tables
  }

  private _getDatabase(): DatabaseClass {
    const cacheKey = `org_${this.orgId}`;
    if (!instances.has(cacheKey)) {
      const instance = new DatabaseClass({
        ...this.config,
        orgId: this.orgId,
      });
      instances.set(cacheKey, instance);
    }
    return instances.get(cacheKey)!;
  }
}

/**
 * Main Database API - clean and minimal
 */
export const database = {
  /**
   * Get database client (auto-detects current app from file path)
   */
  async get(): Promise<any> {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.client();
  },

  /**
   * Get organization database - enables tenant method
   */
  org(orgId: string): OrgDatabase {
    const config = getSmartDefaults();

    // Validate org mode is enabled
    if (!config.database.org) {
      throw createDatabaseError(createApiError('org', config), 400);
    }

    return new OrgDatabase(orgId, config);
  },

  /**
   * Get tenant database directly (only when orgs disabled)
   */
  async tenant(tenantId: string): Promise<any> {
    const config = getSmartDefaults();
    const usage = validateApiUsage(config);

    // Validate direct tenant usage is allowed
    if (!usage.allowDirectTenant) {
      throw createDatabaseError(createApiError('tenant', config), 400);
    }

    const db = this._getDatabase('main', config);
    return await db.tenant(tenantId);
  },

  /**
   * Get vector operations (same database, vector tables)
   */
  async vectors(): Promise<any> {
    const config = getSmartDefaults();

    // Validate vector mode is enabled
    if (!config.vector.enabled) {
      throw createDatabaseError(createApiError('vectors', config), 400);
    }

    const db = this._getDatabase('main', config);
    const client = await db.client();
    return client; // Same database, vector tables
  },

  /**
   * Health check for current app
   */
  async health(): Promise<any> {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    return await db.health();
  },

  /**
   * List discovered apps
   */
  async apps(): Promise<string[]> {
    const config = getSmartDefaults();
    const db = this._getDatabase('main', config);
    
    if (db.adapter?.discoverApps) {
      const apps = await db.adapter.discoverApps();
      return apps.map((app: any) => app.name);
    }
    
    return [];
  },

  /**
   * Configure database URL (convenience method)
   */
  configure(url: string): void {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = url;
    }
  },

  // Private helper methods
  
  _getDatabase(key: string, config: DatabaseConfig): DatabaseClass {
    if (!instances.has(key)) {
      const instance = new DatabaseClass(config);
      instances.set(key, instance);
    }
    return instances.get(key)!;
  },

  /**
   * Clear all cached instances (for testing)
   */
  _clearCache(): void {
    instances.clear();
  }
};

// Default export for convenience
export default database;

// Named exports for advanced usage
export { DatabaseClass } from './database';
export { 
  getSmartDefaults, 
  validateTenantId, 
  validateOrgId, 
  createDatabaseError 
} from './defaults';
export { createMiddleware } from './middleware';