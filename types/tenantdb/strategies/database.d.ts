/**
 * @voilajsx/appkit - Database-per-tenant strategy
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/strategies/database.js
 */
/**
 * Database-per-tenant strategy
 * Each tenant has their own separate database
 */
export class DatabaseStrategy {
    constructor(options: any, adapter: any);
    options: any;
    adapter: any;
    baseUrl: any;
    /**
     * Parses base URL for database connections
     * @private
     * @param {string} url - Database URL with {tenant} placeholder
     * @returns {Object} Parsed URL components
     */
    private parseBaseUrl;
    /**
     * Gets database connection for tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Database client for tenant database
     */
    getConnection(tenantId: string): Promise<any>;
    /**
     * Creates a new tenant database
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    createTenant(tenantId: string): Promise<void>;
    /**
     * Deletes a tenant database
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    deleteTenant(tenantId: string): Promise<void>;
    /**
     * Checks if tenant database exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    tenantExists(tenantId: string): Promise<boolean>;
    /**
     * Lists all tenant databases
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    listTenants(): Promise<string[]>;
    /**
     * Builds database URL for tenant
     * @private
     * @param {string} tenantId - Tenant identifier
     * @returns {string} Database URL
     */
    private buildDatabaseUrl;
    /**
     * Builds system database URL
     * @private
     * @returns {string} System database URL
     */
    private buildSystemUrl;
    /**
     * Detects database provider from URL
     * @private
     * @returns {string} Provider name
     */
    private detectProvider;
    /**
     * Sanitizes database name to prevent SQL injection
     * @private
     * @param {string} tenantId - Tenant identifier
     * @returns {string} Sanitized database name
     */
    private sanitizeDatabaseName;
    /**
     * Disconnects all connections
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
}
