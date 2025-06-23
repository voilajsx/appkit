/**
 * Row-level multi-tenancy strategy implementation
 * @module @voilajsx/appkit/db
 * @file src/db/strategies/row.ts
 */
import { type DatabaseConfig } from '../defaults';
export interface RowStrategyAdapter {
    createClient(config: any): Promise<any>;
    applyTenantMiddleware(client: any, tenantId: string, options: any): Promise<any>;
    hasTenantRegistry?(client: any): Promise<boolean>;
    createTenantRegistryEntry?(client: any, tenantId: string): Promise<void>;
    deleteTenantRegistryEntry?(client: any, tenantId: string): Promise<void>;
    tenantExistsInRegistry?(client: any, tenantId: string): Promise<boolean>;
    getTenantsFromRegistry?(client: any): Promise<string[]>;
}
/**
 * Row-level multi-tenancy strategy
 * All tenants share the same database and tables, with tenant isolation via tenant_id column
 */
export declare class RowStrategy {
    private config;
    private adapter;
    private connections;
    private baseClient;
    constructor(config: DatabaseConfig, adapter: RowStrategyAdapter);
    /**
     * Gets database connection for tenant with automatic filtering
     */
    getConnection(tenantId: string, orgId?: string): Promise<any>;
    /**
     * Creates a new tenant (implicit creation for row-level strategy)
     * Tenant is created when first record is inserted with tenant_id
     */
    createTenant(tenantId: string, orgId?: string): Promise<void>;
    /**
     * Deletes all data for a tenant
     */
    deleteTenant(tenantId: string, orgId?: string): Promise<void>;
    /**
     * Checks if tenant exists by looking for any records with the tenant ID
     */
    tenantExists(tenantId: string, orgId?: string): Promise<boolean>;
    /**
     * Lists all tenants by finding distinct tenant IDs across all tables
     */
    listTenants(orgId?: string): Promise<string[]>;
    /**
     * Disconnects all cached connections
     */
    disconnect(): Promise<void>;
    /**
     * Gets or creates base client for non-tenant operations
     */
    private _getBaseClient;
    /**
     * Builds connection URL for organization
     */
    private _buildConnectionUrl;
    /**
     * Builds cache key for tenant connections
     */
    private _buildCacheKey;
    /**
     * Checks if tenant has any data in database
     */
    private _tenantHasData;
    /**
     * Gets distinct tenant IDs from all tables
     */
    private _getDistinctTenantIds;
    /**
     * Deletes all data for a tenant
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
