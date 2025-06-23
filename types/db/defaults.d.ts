/**
 * Smart defaults and configuration for AppKit Database
 * Supports multi-org, multi-tenant, and vector operations
 *
 * Required Environment Variables:
 * - DATABASE_URL: PostgreSQL connection string
 *
 * Optional Environment Variables:
 * - VOILA_DB_ORGS: Enable org mode (true/false)
 * - VOILA_DB_TENANTS: Enable tenant mode (true/false)
 * - VOILA_DB_VECTORS: Enable vector support (true/false)
 * - VOILA_DB_STRATEGY: Database strategy (row/org)
 * - VOILA_DB_ADAPTER: Database adapter (prisma/mongoose)
 *
 * @module @voilajsx/appkit/db
 * @file src/db/defaults.ts
 */
export interface DatabaseConfig {
    database: {
        url: string | null;
        strategy: 'row' | 'org';
        adapter: 'prisma' | 'mongoose';
        org: boolean;
        tenant: boolean;
    };
    vector: {
        enabled: boolean;
    };
    tenant: {
        fieldName: string;
    };
    environment: {
        isDevelopment: boolean;
        isProduction: boolean;
    };
    orgUrlResolver?: (orgId: string) => Promise<string> | string;
    orgUrlCacheTTL?: number;
}
export interface ApiUsage {
    allowDirectTenant: boolean;
    requireOrgForTenant: boolean;
    suggestedPattern: string;
}
/**
 * Get smart defaults with environment-based configuration
 */
export declare function getSmartDefaults(): DatabaseConfig;
/**
 * Validate API usage patterns and provide helpful guidance
 */
export declare function validateApiUsage(config: DatabaseConfig): ApiUsage;
/**
 * Create API error with helpful guidance
 */
export declare function createApiError(attemptedMethod: string, config: DatabaseConfig): string;
/**
 * Validate tenant ID format
 */
export declare function validateTenantId(tenantId: string): boolean;
/**
 * Validate organization ID format
 */
export declare function validateOrgId(orgId: string): boolean;
/**
 * Create database error with consistent formatting
 */
export declare function createDatabaseError(message: string, statusCode?: number, details?: any): Error;
/**
 * Validate schema compatibility (for development)
 */
export declare function validateSchema(client: any, config: DatabaseConfig): void;
interface ResolverMetrics {
    totalResolves: number;
    cacheHits: number;
    cacheMisses: number;
    resolverSuccesses: number;
    resolverFailures: number;
    averageResolveTime: number;
    circuitBreakerTrips: number;
}
/**
 * Enterprise-grade organization URL resolver with enhanced monitoring and resilience
 */
export declare class OrgUrlResolver {
    private userResolver?;
    private cacheTTL;
    private isDevelopment;
    private options;
    private cache;
    private failureCache;
    private metrics;
    private readonly DEFAULT_TTL;
    private readonly FAILURE_TTL;
    private readonly MAX_RETRIES;
    private readonly TIMEOUT_MS;
    private readonly CIRCUIT_BREAKER_THRESHOLD;
    private readonly MAX_CACHE_SIZE;
    constructor(userResolver?: (orgId: string) => Promise<string> | string, cacheTTL?: number, isDevelopment?: boolean, options?: {
        enableMetrics?: boolean;
        healthCheckInterval?: number;
        connectionValidation?: boolean;
    });
    resolve(orgId: string): Promise<string>;
    /**
     * Enhanced health check with connection validation
     */
    healthCheck(orgId?: string): Promise<{
        healthy: boolean;
        latency: number;
        source: string;
        error?: string;
    }>;
    /**
     * Get comprehensive metrics for monitoring
     */
    getMetrics(): ResolverMetrics & {
        cacheStats: {
            size: number;
            hitRate: number;
            mostAccessed: Array<{
                orgId: string;
                accessCount: number;
            }>;
        };
        circuitBreakerStatus: Array<{
            orgId: string;
            status: 'open' | 'closed';
            failures: number;
        }>;
    };
    private _validateOrgId;
    private _isCircuitBreakerOpen;
    private _recordSuccess;
    private _recordFailure;
    private _validateAndTestUrl;
    private _testDatabaseConnection;
    private _cacheWithLRU;
    private _evictLRUEntries;
    private _updateMetrics;
    private _startPeriodicMaintenance;
    private _cleanupExpiredEntries;
    private _logMetricsSummary;
    private _detectProviderFromUrl;
    private _validateUrl;
    private _resolveWithRetries;
    private _getDefaultUrlWithLog;
    private _getDefaultUrl;
    private _getEmergencyFallback;
    private _createTimeout;
    private _log;
    clearCache(orgId?: string): void;
    refreshOrg(orgId: string): Promise<string>;
    /**
     * Manually open/close circuit breaker for testing
     */
    setCircuitBreakerState(orgId: string, state: 'open' | 'closed'): void;
    /**
     * Preload orgs into cache for faster resolution
     */
    preloadOrgs(orgIds: string[]): Promise<void>;
}
export {};
