/**
 * Production-ready Prisma adapter with app isolation and tenant middleware
 * @module @voilajsx/appkit/db
 * @file src/db/adapters/prisma.ts
 */
export interface DiscoveredApp {
    name: string;
    clientPath: string;
}
export interface PrismaClientConfig {
    url?: string;
    appName?: string;
    options?: any;
}
/**
 * Enhanced Prisma adapter with app-level schema isolation and tenant middleware
 */
export declare class PrismaAdapter {
    private options;
    private clients;
    private discoveredApps;
    private isDevelopment;
    private appDetectionCache;
    private cacheStats;
    constructor(options?: any);
    /**
     * Creates Prisma client with cached auto-discovery
     */
    createClient(config?: PrismaClientConfig): Promise<any>;
    /**
     * Apply tenant filtering middleware to Prisma client
     */
    applyTenantMiddleware(client: any, tenantId: string, options?: {
        fieldName?: string;
        orgId?: string;
    }): Promise<any>;
    /**
     * Auto-discover apps with Prisma clients (cached)
     */
    discoverApps(): Promise<DiscoveredApp[]>;
    /**
     * Check if tenant registry exists (simplified for Prisma)
     */
    hasTenantRegistry(client: any): Promise<boolean>;
    /**
     * Create tenant registry entry
     */
    createTenantRegistryEntry(client: any, tenantId: string): Promise<void>;
    /**
     * Delete tenant registry entry
     */
    deleteTenantRegistryEntry(client: any, tenantId: string): Promise<void>;
    /**
     * Check if tenant exists in registry
     */
    tenantExistsInRegistry(client: any, tenantId: string): Promise<boolean>;
    /**
     * Get all tenants from registry
     */
    getTenantsFromRegistry(client: any): Promise<string[]>;
    /**
     * Disconnect all cached clients and cleanup
     */
    disconnect(): Promise<void>;
    /**
     * OPTIMIZED: Cached app detection with multiple strategies
     */
    private _detectAppFromCallStackCached;
    /**
     * Get the file that called the database function
     */
    private _getCallingFile;
    /**
     * Extract app name from file path (respects your existing structure)
     */
    private _extractAppFromPath;
    /**
     * Load Prisma client for app with caching
     */
    private _loadPrismaClientForApp;
    /**
     * Path-based client loading fallback (respects your prisma folder structure)
     */
    private _loadClientWithPathSearch;
    /**
     * Get fallback app with smart defaults
     */
    private _getFallbackApp;
    /**
     * Search upwards for apps directory
     */
    private _findAppsDirectoryUpwards;
    /**
     * Get default database URL with environment fallbacks
     */
    private _getDefaultUrl;
    /**
     * Get tenant registry model (handles different naming conventions)
     */
    private _getTenantRegistryModel;
    /**
     * Log cache performance stats
     */
    private _logCacheStats;
    /**
     * Clear caches (for testing or memory management)
     */
    private _clearCaches;
}
