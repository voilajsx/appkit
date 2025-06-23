/**
 * Mongoose adapter for multi-tenant MongoDB operations
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/mongoose.ts
 */
export interface MongooseClientConfig {
    url: string;
    maxPoolSize?: number;
    timeout?: number;
    connectionOptions?: any;
}
export interface TenantMiddlewareOptions {
    fieldName?: string;
    orgId?: string;
}
/**
 * Mongoose adapter implementation for MongoDB
 * Supports both database-per-tenant and collection-level isolation
 */
export declare class MongooseAdapter {
    private options;
    private mongoose;
    private connections;
    private isDevelopment;
    constructor(options?: any);
    /**
     * Creates a new Mongoose connection instance
     */
    createClient(config: MongooseClientConfig): Promise<any>;
    /**
     * Applies tenant middleware to Mongoose connection for automatic isolation
     */
    applyTenantMiddleware(connection: any, tenantId: string, options?: TenantMiddlewareOptions): Promise<any>;
    /**
     * Creates a new database
     */
    createDatabase(name: string, systemClient?: any): Promise<void>;
    /**
     * Drops a database
     */
    dropDatabase(name: string, systemClient?: any): Promise<void>;
    /**
     * Lists all databases
     */
    listDatabases(systemClient?: any): Promise<string[]>;
    /**
     * Gets database statistics
     */
    getDatabaseStats(client: any): Promise<any>;
    /**
     * Checks if tenant registry collection exists
     */
    hasTenantRegistry(client: any): Promise<boolean>;
    /**
     * Creates tenant registry entry
     */
    createTenantRegistryEntry(client: any, tenantId: string): Promise<void>;
    /**
     * Deletes tenant registry entry
     */
    deleteTenantRegistryEntry(client: any, tenantId: string): Promise<void>;
    /**
     * Checks if tenant exists in registry
     */
    tenantExistsInRegistry(client: any, tenantId: string): Promise<boolean>;
    /**
     * Gets all tenants from registry
     */
    getTenantsFromRegistry(client: any): Promise<string[]>;
    /**
     * Disconnects the adapter
     */
    disconnect(): Promise<void>;
    /**
     * Builds cache key for connections
     */
    private _buildCacheKey;
    /**
     * Builds database URL for specific tenant/org
     */
    private _buildDatabaseUrl;
    /**
     * Builds admin database URL
     */
    private _buildAdminUrl;
    /**
     * Checks if database name is a system database
     */
    private _isSystemDatabase;
    /**
     * Sanitizes database name to prevent injection
     */
    private _sanitizeName;
    /**
     * Formats bytes to human readable format
     */
    private _formatBytes;
    /**
     * Masks URL for logging (hides credentials)
     */
    private _maskUrl;
    /**
     * Sets up connection event handlers
     */
    private _setupConnectionEvents;
}
