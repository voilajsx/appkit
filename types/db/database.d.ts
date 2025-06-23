/**
 * Core database class with org/tenant support and smart connection management
 * @module @voilajsx/appkit/db
 * @file src/db/database.ts
 */
import { type DatabaseConfig } from './defaults';
export interface ClientOptions {
    orgId?: string;
    tenantId?: string;
}
export interface TenantOptions {
    orgId?: string;
}
export interface HealthStatus {
    healthy: boolean;
    strategy: string;
    adapter: string;
    org: boolean;
    tenant: boolean;
    connections: number;
    error?: string;
}
/**
 * Database class with built-in org/tenant support and connection management
 */
export declare class DatabaseClass {
    private config;
    private strategy;
    private adapter;
    private initialized;
    private connections;
    constructor(config: DatabaseConfig);
    /**
     * Gets database client (single-tenant mode or org-specific)
     */
    client(options?: ClientOptions): Promise<any>;
    /**
     * Gets database client for specific tenant
     */
    tenant(tenantId: string, options?: TenantOptions): Promise<any>;
    /**
     * Creates a new tenant
     */
    createTenant(tenantId: string, options?: TenantOptions): Promise<void>;
    /**
     * Deletes a tenant and all its data
     */
    deleteTenant(tenantId: string, options?: TenantOptions & {
        confirm?: boolean;
    }): Promise<void>;
    /**
     * Checks if tenant exists
     */
    exists(tenantId: string, options?: TenantOptions): Promise<boolean>;
    /**
     * Lists all tenants
     */
    list(options?: TenantOptions & {
        filter?: (id: string) => boolean;
        limit?: number;
    }): Promise<string[]>;
    /**
     * Creates an organization
     */
    createOrg(orgId: string, options?: {
        confirm?: boolean;
    }): Promise<void>;
    /**
     * Deletes an organization and all its data
     */
    deleteOrg(orgId: string, options?: {
        confirm?: boolean;
    }): Promise<void>;
    /**
     * Gets health status of database connections
     */
    health(): Promise<HealthStatus>;
    /**
     * Disconnects all connections and cleans up
     */
    disconnect(): Promise<void>;
    /**
     * Lazy initialization of strategy and adapter
     */
    private _initialize;
    /**
     * Gets adapter class by name
     */
    private _getAdapterClass;
    /**
     * Gets strategy class by name
     */
    private _getStrategyClass;
    /**
     * Builds connection URL for organization
     */
    private _buildConnectionUrl;
    /**
     * Builds cache key for connections
     */
    private _buildCacheKey;
    /**
     * Removes tenant connections from cache
     */
    private _removeTenantFromCache;
    /**
     * Removes organization connections from cache
     */
    private _removeOrgFromCache;
    /**
     * Closes a database connection
     */
    private _closeConnection;
    /**
     * Sets up cleanup handlers
     */
    private _setupCleanup;
}
