/**
 * @voilajsx/appkit - Row-level multi-tenancy strategy
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/strategies/row.js
 */
/**
 * Row-level multi-tenancy strategy
 * All tenants share the same database and tables, with tenant isolation via a tenantId column
 */
export class RowStrategy {
    constructor(options: any, adapter: any);
    options: any;
    adapter: any;
    /**
     * Gets database connection for tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Database client with tenant middleware
     */
    getConnection(tenantId: string): Promise<any>;
    /**
     * Creates a new tenant (no-op for row-level strategy)
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    createTenant(tenantId: string): Promise<void>;
    /**
     * Deletes a tenant's data
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    deleteTenant(tenantId: string): Promise<void>;
    /**
     * Checks if tenant exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    tenantExists(tenantId: string): Promise<boolean>;
    /**
     * Lists all tenants
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    listTenants(): Promise<string[]>;
    /**
     * Disconnects all connections
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
}
