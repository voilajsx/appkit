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
import { type DatabaseConfig } from './defaults';
/**
 * Organization Database - provides tenant and vector methods within organization
 */
declare class OrgDatabase {
    private orgId;
    private config;
    constructor(orgId: string, config: DatabaseConfig);
    /**
     * Get tenant-specific database within organization
     */
    tenant(tenantId: string): Promise<any>;
    /**
     * Get organization database (no tenant filtering)
     */
    get(): Promise<any>;
    /**
     * Get vector operations for this organization
     */
    vectors(): Promise<any>;
    private _getDatabase;
}
/**
 * Main Database API - clean and minimal
 */
export declare const database: {
    /**
     * Get database client (auto-detects current app from file path)
     */
    get(): Promise<any>;
    /**
     * Get organization database - enables tenant method
     */
    org(orgId: string): OrgDatabase;
    /**
     * Get tenant database directly (only when orgs disabled)
     */
    tenant(tenantId: string): Promise<any>;
    /**
     * Get vector operations (same database, vector tables)
     */
    vectors(): Promise<any>;
    /**
     * Health check for current app
     */
    health(): Promise<any>;
    /**
     * List discovered apps
     */
    apps(): Promise<string[]>;
    /**
     * Configure database URL (convenience method)
     */
    configure(url: string): void;
    _getDatabase(key: string, config: DatabaseConfig): DatabaseClass;
    /**
     * Clear all cached instances (for testing)
     */
    _clearCache(): void;
};
export default database;
export { DatabaseClass } from './database';
export { getSmartDefaults, validateTenantId, validateOrgId, createDatabaseError } from './defaults';
export { createMiddleware } from './middleware';
