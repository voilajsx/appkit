/**
 * @voilajsx/appkit - Prisma adapter for multi-tenant database
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/adapters/prisma.js
 */
/**
 * Prisma adapter implementation
 */
export class PrismaAdapter {
    constructor(options: any);
    options: any;
    client: any;
    /**
     * Connects to the database
     * @param {Object} config - Connection configuration
     * @returns {Promise<Object>} Prisma client
     */
    connect(config: any): Promise<any>;
    /**
     * Disconnects from the database
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * Creates a new database client instance
     * @param {Object} config - Client configuration
     * @returns {Promise<Object>} New Prisma client instance
     */
    createClient(config: any): Promise<any>;
    /**
     * Executes a raw query
     * @param {string} query - SQL query
     * @param {Array} [params] - Query parameters
     * @returns {Promise<any>} Query result
     */
    executeQuery(query: string, params?: any[]): Promise<any>;
    /**
     * Creates a new database
     * @param {string} name - Database name
     * @returns {Promise<void>}
     */
    createDatabase(name: string): Promise<void>;
    /**
     * Drops a database
     * @param {string} name - Database name
     * @returns {Promise<void>}
     */
    dropDatabase(name: string): Promise<void>;
    /**
     * Lists all databases
     * @returns {Promise<string[]>} Array of database names
     */
    listDatabases(): Promise<string[]>;
    /**
     * Applies middleware to client for row-level isolation
     * @param {Object} client - Prisma client
     * @param {string} tenantId - Tenant identifier
     * @returns {Object} Client with middleware
     */
    applyTenantMiddleware(client: any, tenantId: string): any;
    /**
     * Detects the database provider from connection URL
     * @returns {string} Provider name
     */
    detectProvider(): string;
    /**
     * Sanitizes database name to prevent SQL injection
     * @private
     * @param {string} name - Database name
     * @returns {string} Sanitized name
     */
    private sanitizeName;
}
