/**
 * Organization-level database strategy implementation with enterprise URL resolution
 * @module @voilajsx/appkit/db
 * @file src/db/strategies/org.ts
 */
import { type DatabaseConfig } from '../defaults';
export interface OrgStrategyAdapter {
    createClient(config: any): Promise<any>;
    applyTenantMiddleware?(client: any, tenantId: string, options: any): Promise<any>;
    createDatabase?(name: string, systemClient?: any): Promise<void>;
    dropDatabase?(name: string, systemClient?: any): Promise<void>;
    listDatabases?(systemClient?: any): Promise<string[]>;
    getDatabaseStats?(client: any): Promise<any>;
    backupDatabase?(dbName: string, systemClient: any, options?: any): Promise<string>;
    restoreDatabase?(dbName: string, backupPath: string, systemClient: any, options?: any): Promise<void>;
}
/**
 * Organization-level strategy with enterprise-grade URL resolution
 * Each organization can have its own separate database on different servers/clouds
 * Tenants within each org use row-level isolation
 */
export declare class OrgStrategy {
    private config;
    private adapter;
    private connections;
    private systemConnection;
    private urlResolver;
    private baseUrl;
    constructor(config: DatabaseConfig, adapter: OrgStrategyAdapter);
    /**
     * Gets database connection for specific tenant within organization
     */
    getConnection(tenantId: string, orgId?: string): Promise<any>;
    /**
     * Creates a new tenant within organization
     */
    createTenant(tenantId: string, orgId?: string): Promise<void>;
    /**
     * Deletes a tenant and all its data within organization
     */
    deleteTenant(tenantId: string, orgId?: string): Promise<void>;
    /**
     * Checks if tenant exists within organization
     */
    tenantExists(tenantId: string, orgId?: string): Promise<boolean>;
    /**
     * Lists all tenants within organization
     */
    listTenants(orgId?: string): Promise<string[]>;
    /**
     * Creates a new organization database
     */
    createOrg(orgId: string): Promise<void>;
    /**
     * Deletes an organization database completely
     */
    deleteOrg(orgId: string): Promise<void>;
    /**
     * Checks if organization database exists
     */
    orgExists(orgId: string): Promise<boolean>;
    /**
     * Lists all organization databases
     */
    listOrgs(): Promise<string[]>;
    /**
     * Disconnects all connections
     */
    disconnect(): Promise<void>;
    /**
     * Parses base URL for database connections (fallback only)
     */
    private _parseBaseUrl;
    /**
     * Gets organization database connection using enterprise resolver
     */
    private _getOrgConnection;
    /**
     * Gets or creates system database connection for management operations
     */
    private _getSystemConnection;
    /**
     * Builds system database URL from organization URL
     */
    private _buildSystemUrlFromOrgUrl;
    /**
     * Builds system database URL for management operations (fallback)
     */
    private _buildSystemUrl;
    /**
     * Detects database provider from base URL
     */
    private _detectProvider;
    /**
     * Detects database provider from any URL
     */
    private _detectProviderFromUrl;
    /**
     * Sanitizes database name to prevent injection
     */
    private _sanitizeDatabaseName;
    /**
     * Sets up initial schema for new organization database
     */
    private _setupOrgDatabase;
    /**
     * Filters out system databases from org list
     */
    private _filterSystemDatabases;
    /**
     * Builds cache key for connections
     */
    private _buildCacheKey;
    /**
     * Removes organization connections from cache
     */
    private _removeOrgFromCache;
    /**
     * Checks if tenant has any data in org database
     */
    private _tenantHasData;
    /**
     * Gets distinct tenant IDs from org database
     */
    private _getDistinctTenantIds;
    /**
     * Deletes all data for a tenant in org database
     */
    private _deleteAllTenantData;
    /**
     * Gets list of Prisma model names
     */
    private _getPrismaModels;
    /**
     * Closes database client connection
     */
    private _closeClient;
}
