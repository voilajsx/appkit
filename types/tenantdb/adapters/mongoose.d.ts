/**
 * @voilajsx/appkit - Mongoose adapter for multi-tenant database
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/adapters/mongoose.js
 */
/**
 * Mongoose adapter implementation
 */
export class MongooseAdapter {
    constructor(options: any);
    options: any;
    client: any;
    mongoose: any;
    /**
     * Connects to the database
     * @param {Object} config - Connection configuration
     * @returns {Promise<Object>} Mongoose connection
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
     * @returns {Promise<Object>} New Mongoose connection
     */
    createClient(config: any): Promise<any>;
    /**
     * Executes a raw query
     * @param {string} query - MongoDB command
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
     * Applies middleware to connection for row-level isolation
     * @param {Object} connection - Mongoose connection
     * @param {string} tenantId - Tenant identifier
     * @returns {Object} Connection with middleware
     */
    applyTenantMiddleware(connection: any, tenantId: string): any;
    /**
     * Builds database URL for tenant
     * @private
     * @param {string} dbName - Database name
     * @returns {string} Tenant-specific MongoDB URL
     */
    private buildDatabaseUrl;
    /**
     * Sanitizes database name to prevent injection
     * @private
     * @param {string} name - Database name
     * @returns {string} Sanitized name
     */
    private sanitizeName;
}
