/**
 * Ultra-simple database API with org/tenant support and smart connection management
 * @module @voilajsx/appkit/database
 * @file src/database/index.ts
 *
 * @llm-rule WHEN: ALWAYS add tenant_id text field to ALL tables (nullable for future compatibility)
 * @llm-rule NOTE: tenant_id = null (single tenant) or "team-1" (multi-tenant)
 * @llm-rule VARIABLE: const db = await database.get() - user's data (single or tenant-filtered)
 * @llm-rule VARIABLE: const dbTenants = await database.getTenants() - all tenants (admin access)
 * @llm-rule VARIABLE: const {orgName}Db = await database.org('{orgName}').get() - org-specific data
 * @llm-rule VARIABLE: const {orgName}DbTenants = await database.org('{orgName}').getTenants() - all tenants in org
 */
interface DatabaseClient {
    _appKit?: boolean;
    _orgId?: string;
    _tenantId?: string;
    _url?: string;
    [key: string]: any;
}
interface PrismaClient extends DatabaseClient {
    $queryRaw?: any;
    $disconnect: () => Promise<void>;
    $connect: () => Promise<void>;
    $use?: (middleware: any) => void;
}
interface MongooseConnection extends DatabaseClient {
    db: any;
    close: () => Promise<void>;
    model: (name: string, schema?: any, collection?: string) => any;
    models: Record<string, any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
}
type DatabaseClientUnion = PrismaClient | MongooseConnection;
/**
 * Organization database builder
 */
declare class OrgDatabase {
    private orgId;
    constructor(orgId: string);
    /**
     * Get organization database (tenant-filtered if tenant mode enabled)
     */
    get(req?: any): Promise<DatabaseClientUnion>;
    /**
     * Get all tenants in organization (admin access)
     */
    getTenants(req?: any): Promise<DatabaseClientUnion>;
}
/**
 * Main database API - ultra-simple like auth module
 */
export declare const database: {
    /**
     * Get database client - main function that handles all contexts
     * @param {Object} [req] - Request object for context detection
     * @returns {Promise<DatabaseClientUnion>} Database client
     */
    get(req?: any): Promise<DatabaseClientUnion>;
    /**
     * Get all tenants data (admin access - no tenant filtering)
     * @param {Object} [req] - Request object for org context
     * @returns {Promise<DatabaseClientUnion>} Database client with no tenant filtering
     */
    getTenants(req?: any): Promise<DatabaseClientUnion>;
    /**
     * Get organization-specific database
     * @param {string} orgId - Organization ID
     * @returns {OrgDatabase} Organization database instance
     */
    org(orgId: string): OrgDatabase;
    /**
     * Health check for database connections
     * @returns {Promise<Object>} Health status
     */
    health(): Promise<any>;
    /**
     * List tenants in current context
     * @param {Object} [req] - Request object for org context
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    list(req?: any): Promise<string[]>;
    /**
     * Check if tenant exists
     * @param {string} tenantId - Tenant ID
     * @param {Object} [req] - Request object for org context
     * @returns {Promise<boolean>} Whether tenant exists
     */
    exists(tenantId: string, req?: any): Promise<boolean>;
    /**
     * Create tenant (registers tenant for future use)
     * @param {string} tenantId - Tenant ID
     * @param {Object} [req] - Request object for org context
     * @returns {Promise<void>}
     */
    create(tenantId: string, req?: any): Promise<void>;
    /**
     * Delete all tenant data (requires confirmation)
     * @param {string} tenantId - Tenant ID
     * @param {Object} options - Options object
     * @param {boolean} options.confirm - Confirmation flag (required)
     * @param {Object} [req] - Request object for org context
     * @returns {Promise<void>}
     */
    delete(tenantId: string, options: any, req?: any): Promise<void>;
    /**
     * Disconnect all connections and cleanup
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * Get distinct tenant IDs from database
     * @private
     */
    _getDistinctTenantIds(client: any): Promise<string[]>;
    /**
     * Check if tenant has data
     * @private
     */
    _tenantHasData(client: any, tenantId: string): Promise<boolean>;
    /**
     * Delete all tenant data
     * @private
     */
    _deleteAllTenantData(client: any, tenantId: string): Promise<void>;
    /**
     * Clear tenant-specific cached connections
     * @private
     */
    _clearTenantCache(tenantId: string): void;
    /**
     * Close database connection
     * @private
     */
    _closeConnection(connection: any): Promise<void>;
};
export default database;
