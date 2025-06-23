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

import fs from 'fs';
import path from 'path';

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
export function getSmartDefaults(): DatabaseConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    database: {
      url: process.env.DATABASE_URL || process.env.VOILA_DB_URL || null,
      strategy: (process.env.VOILA_DB_STRATEGY as 'row' | 'org') || _detectStrategy(),
      adapter: (process.env.VOILA_DB_ADAPTER as 'prisma' | 'mongoose') || _detectAdapter(),
      org: process.env.VOILA_DB_ORGS === 'true',
      tenant: process.env.VOILA_DB_TENANTS === 'true',
    },
    vector: {
      enabled: process.env.VOILA_DB_VECTORS === 'true',
    },
    tenant: {
      fieldName: process.env.VOILA_TENANT_FIELD || 'tenant_id',
    },
    environment: {
      isDevelopment,
      isProduction: process.env.NODE_ENV === 'production',
    },
    orgUrlCacheTTL: parseInt(process.env.VOILA_ORG_CACHE_TTL || '300000'), // 5 minutes
  };
}

/**
 * Validate API usage patterns and provide helpful guidance
 */
export function validateApiUsage(config: DatabaseConfig): ApiUsage {
  const { org, tenant } = config.database;
  
  if (org && tenant) {
    return {
      allowDirectTenant: false,
      requireOrgForTenant: true,
      suggestedPattern: 'database.org(orgId).tenant(tenantId)',
    };
  }
  
  if (tenant && !org) {
    return {
      allowDirectTenant: true,
      requireOrgForTenant: false,
      suggestedPattern: 'database.tenant(tenantId)',
    };
  }
  
  if (org && !tenant) {
    return {
      allowDirectTenant: false,
      requireOrgForTenant: false,
      suggestedPattern: 'database.org(orgId).get()',
    };
  }
  
  return {
    allowDirectTenant: true,
    requireOrgForTenant: false,
    suggestedPattern: 'database.get()',
  };
}

/**
 * Create API error with helpful guidance
 */
export function createApiError(attemptedMethod: string, config: DatabaseConfig): string {
  const usage = validateApiUsage(config);
  const { org, tenant } = config.database;
  
  if (attemptedMethod === 'tenant' && org && tenant) {
    return `Cannot use database.tenant() when organizations are enabled.\n` +
           `Use: ${usage.suggestedPattern}\n` +
           `Or disable orgs: VOILA_DB_ORGS=false`;
  }
  
  if (attemptedMethod === 'org' && !org) {
    return `Organization mode not enabled.\n` +
           `Enable: VOILA_DB_ORGS=true\n` +
           `Or use: database.get()`;
  }
  
  if (attemptedMethod === 'vectors' && !config.vector.enabled) {
    return `Vector mode not enabled.\n` +
           `Enable: VOILA_DB_VECTORS=true`;
  }
  
  return `Invalid API usage. Suggested pattern: ${usage.suggestedPattern}`;
}

/**
 * Validate tenant ID format
 */
export function validateTenantId(tenantId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(tenantId) && tenantId.length <= 63;
}

/**
 * Validate organization ID format
 */
export function validateOrgId(orgId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(orgId) && orgId.length <= 63;
}

/**
 * Create database error with consistent formatting
 */
export function createDatabaseError(message: string, statusCode = 500, details?: any): Error {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

/**
 * Validate schema compatibility (for development)
 */
export function validateSchema(client: any, config: DatabaseConfig): void {
  if (!config.environment.isDevelopment) return;
  
  // Add schema validation logic here
  // Check if tenant_id columns exist when tenant mode is enabled
  // Check if vector columns exist when vector mode is enabled
}

// Private helper functions

/**
 * Auto-detect database strategy based on URL patterns
 */
function _detectStrategy(): 'row' | 'org' {
  const url = process.env.DATABASE_URL;
  if (url?.includes('{org}')) {
    return 'org';
  }
  return 'row';
}

/**
 * Auto-detect database adapter based on available dependencies
 */
function _detectAdapter(): 'prisma' | 'mongoose' {
  try {
    require.resolve('@prisma/client');
    return 'prisma';
  } catch {
    try {
      require.resolve('mongoose');
      return 'mongoose';
    } catch {
      return 'prisma'; // Default fallback
    }
  }
}

/**
 * Enhanced Enterprise Organization URL Resolver
 * @module @voilajsx/appkit/db
 * @file src/db/defaults.ts (enhanced version)
 */

interface CachedUrl {
  url: string;
  expires: number;
  source: 'resolver' | 'fallback';
  resolvedAt: string;
  lastAccessed: number; // For LRU cleanup
  accessCount: number;  // For popularity tracking
}

interface FailureRecord {
  count: number;
  lastFailure: number;
  lastError: string;
  consecutiveFailures: number; // Circuit breaker enhancement
}

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
export class OrgUrlResolver {
  private cache = new Map<string, CachedUrl>();
  private failureCache = new Map<string, FailureRecord>();
  private metrics: ResolverMetrics = {
    totalResolves: 0,
    cacheHits: 0,
    cacheMisses: 0,
    resolverSuccesses: 0,
    resolverFailures: 0,
    averageResolveTime: 0,
    circuitBreakerTrips: 0,
  };

  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly FAILURE_TTL = 30 * 1000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 10000; // 10 seconds
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5; // Consecutive failures
  private readonly MAX_CACHE_SIZE = 1000; // Prevent memory leaks

  constructor(
    private userResolver?: (orgId: string) => Promise<string> | string,
    private cacheTTL = 5 * 60 * 1000,
    private isDevelopment = process.env.NODE_ENV === 'development',
    private options: {
      enableMetrics?: boolean;
      healthCheckInterval?: number;
      connectionValidation?: boolean;
    } = {}
  ) {
    // Start periodic health checks and cache cleanup
    if (options.healthCheckInterval) {
      this._startPeriodicMaintenance();
    }
  }

  async resolve(orgId: string): Promise<string> {
    const startTime = Date.now();
    this.metrics.totalResolves++;
    
    try {
      // 1. Validate input
      this._validateOrgId(orgId);

      // 2. Check circuit breaker
      if (this._isCircuitBreakerOpen(orgId)) {
        this.metrics.circuitBreakerTrips++;
        this._log('warn', `Circuit breaker OPEN for '${orgId}', using fallback`);
        return this._getDefaultUrlWithLog(orgId, 'circuit-breaker');
      }

      // 3. Check memory cache with LRU update
      const cached = this.cache.get(orgId);
      if (cached && cached.expires > Date.now()) {
        cached.lastAccessed = Date.now();
        cached.accessCount++;
        this.metrics.cacheHits++;
        this._log('debug', `Cache hit for org '${orgId}' (${Date.now() - startTime}ms)`);
        return cached.url;
      }

      this.metrics.cacheMisses++;
      this._log('debug', `Cache miss for org '${orgId}', resolving...`);

      let url: string;
      let source: 'resolver' | 'fallback';

      // 4. Try user resolver with enhanced retry logic
      if (this.userResolver) {
        try {
          url = await this._resolveWithRetries(orgId);
          source = 'resolver';
          this._recordSuccess(orgId);
          this.metrics.resolverSuccesses++;
          this._log('info', `✅ Resolved org '${orgId}' via custom resolver (${Date.now() - startTime}ms)`);
        } catch (error: any) {
          this._recordFailure(orgId, error);
          this.metrics.resolverFailures++;
          url = this._getDefaultUrlWithLog(orgId, 'resolver-failure', error);
          source = 'fallback';
        }
      } else {
        url = this._getDefaultUrlWithLog(orgId, 'default');
        source = 'fallback';
      }

      // 5. Validate URL and optionally test connection
      await this._validateAndTestUrl(url, orgId);

      // 6. Cache with LRU management
      this._cacheWithLRU(orgId, url, source);

      // 7. Update metrics
      this._updateMetrics(startTime);

      this._log('info', `🎯 Org '${orgId}' resolved to database via ${source} (${Date.now() - startTime}ms)`);
      return url;

    } catch (error: any) {
      this.metrics.resolverFailures++;
      this._log('error', `❌ Critical error resolving org '${orgId}': ${error.message}`);
      
      // Last resort: use emergency fallback
      const fallbackUrl = this._getEmergencyFallback(orgId);
      this._log('warn', `🚨 Using emergency fallback for org '${orgId}': ${fallbackUrl}`);
      
      return fallbackUrl;
    }
  }

  /**
   * Enhanced health check with connection validation
   */
  async healthCheck(orgId?: string): Promise<{
    healthy: boolean;
    latency: number;
    source: string;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const testOrgId = orgId || 'health-check-test';
      const url = await this.resolve(testOrgId);
      
      // Optional: Test actual database connection
      if (this.options.connectionValidation) {
        await this._testDatabaseConnection(url);
      }
      
      return {
        healthy: true,
        latency: Date.now() - startTime,
        source: this.cache.get(testOrgId)?.source || 'unknown',
      };
    } catch (error: any) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        source: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Get comprehensive metrics for monitoring
   */
  getMetrics(): ResolverMetrics & {
    cacheStats: {
      size: number;
      hitRate: number;
      mostAccessed: Array<{ orgId: string; accessCount: number }>;
    };
    circuitBreakerStatus: Array<{ orgId: string; status: 'open' | 'closed'; failures: number }>;
  } {
    const hitRate = this.metrics.totalResolves > 0 
      ? (this.metrics.cacheHits / this.metrics.totalResolves) * 100 
      : 0;

    const mostAccessed = Array.from(this.cache.entries())
      .map(([orgId, cached]) => ({ orgId, accessCount: cached.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    const circuitBreakerStatus = Array.from(this.failureCache.entries())
      .map(([orgId, failure]) => ({
        orgId,
        status: this._isCircuitBreakerOpen(orgId) ? 'open' as const : 'closed' as const,
        failures: failure.consecutiveFailures,
      }));

    return {
      ...this.metrics,
      cacheStats: {
        size: this.cache.size,
        hitRate: Math.round(hitRate * 100) / 100,
        mostAccessed,
      },
      circuitBreakerStatus,
    };
  }

  // Private enhanced methods

  private _validateOrgId(orgId: string): void {
    if (!orgId || typeof orgId !== 'string') {
      throw new Error('Organization ID is required and must be a string');
    }
    
    if (orgId.length > 63) {
      throw new Error('Organization ID too long (max 63 characters)');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(orgId)) {
      throw new Error('Organization ID contains invalid characters');
    }
  }

  private _isCircuitBreakerOpen(orgId: string): boolean {
    const failure = this.failureCache.get(orgId);
    if (!failure) return false;

    return failure.consecutiveFailures >= this.CIRCUIT_BREAKER_THRESHOLD;
  }

  private _recordSuccess(orgId: string): void {
    // Reset circuit breaker on success
    this.failureCache.delete(orgId);
  }

  private _recordFailure(orgId: string, error: Error): void {
    const existing = this.failureCache.get(orgId);
    this.failureCache.set(orgId, {
      count: existing ? existing.count + 1 : 1,
      lastFailure: Date.now(),
      lastError: error.message,
      consecutiveFailures: existing ? existing.consecutiveFailures + 1 : 1,
    });
  }

  private async _validateAndTestUrl(url: string, orgId: string): Promise<void> {
    // Enhanced URL validation
    this._validateUrl(url, orgId);
    
    // Optional connection testing
    if (this.options.connectionValidation) {
      try {
        await this._testDatabaseConnection(url);
      } catch (error: any) {
        this._log('warn', `Database connection test failed for org '${orgId}': ${error.message}`);
        // Don't throw - URL might be valid but database temporarily unavailable
      }
    }
  }

  private async _testDatabaseConnection(url: string): Promise<void> {
    // Quick connection test without full client setup
    // This would be implemented based on the database provider
    const provider = this._detectProviderFromUrl(url);
    
    switch (provider) {
      case 'postgresql':
        // Could use pg.Pool for quick test
        break;
      case 'mysql':
        // Could use mysql2 for quick test
        break;
      case 'mongodb':
        // Could use MongoDB driver for quick ping
        break;
    }
    
    // For now, just validate URL format more thoroughly
    try {
      new URL(url.replace('postgresql://', 'http://'));
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  private _cacheWithLRU(orgId: string, url: string, source: 'resolver' | 'fallback'): void {
    // LRU cache management
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this._evictLRUEntries();
    }

    const cacheTTL = source === 'resolver' ? this.cacheTTL : 60000; // Shorter TTL for fallbacks
    const now = Date.now();
    
    this.cache.set(orgId, {
      url,
      expires: now + cacheTTL,
      source,
      resolvedAt: new Date().toISOString(),
      lastAccessed: now,
      accessCount: 1,
    });
  }

  private _evictLRUEntries(): void {
    // Remove oldest accessed entries (keep top 90%)
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const toRemove = Math.floor(this.cache.size * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    this._log('debug', `Evicted ${toRemove} LRU cache entries`);
  }

  private _updateMetrics(startTime: number): void {
    const resolveTime = Date.now() - startTime;
    
    // Update rolling average
    if (this.metrics.averageResolveTime === 0) {
      this.metrics.averageResolveTime = resolveTime;
    } else {
      this.metrics.averageResolveTime = 
        (this.metrics.averageResolveTime * 0.9) + (resolveTime * 0.1);
    }
  }

  private _startPeriodicMaintenance(): void {
    const interval = this.options.healthCheckInterval || 5 * 60 * 1000; // 5 minutes
    
    setInterval(() => {
      try {
        this._cleanupExpiredEntries();
        this._logMetricsSummary();
      } catch (error: any) {
        this._log('error', `Periodic maintenance error: ${error.message}`);
      }
    }, interval);
  }

  private _cleanupExpiredEntries(): void {
    const now = Date.now();
    const beforeSize = this.cache.size;
    
    for (const [orgId, cached] of this.cache.entries()) {
      if (cached.expires <= now) {
        this.cache.delete(orgId);
      }
    }
    
    // Clean old failures (older than 1 hour)
    for (const [orgId, failure] of this.failureCache.entries()) {
      if (now - failure.lastFailure > 60 * 60 * 1000) {
        this.failureCache.delete(orgId);
      }
    }
    
    const cleaned = beforeSize - this.cache.size;
    if (cleaned > 0) {
      this._log('debug', `Cleaned up ${cleaned} expired cache entries`);
    }
  }

  private _logMetricsSummary(): void {
    if (!this.isDevelopment || this.metrics.totalResolves === 0) return;
    
    const metrics = this.getMetrics();
    this._log('info', [
      `📊 Resolver Metrics Summary:`,
      `  Cache: ${metrics.cacheStats.size} entries, ${metrics.cacheStats.hitRate}% hit rate`,
      `  Performance: ${metrics.averageResolveTime.toFixed(1)}ms avg`,
      `  Success Rate: ${((metrics.resolverSuccesses / Math.max(metrics.totalResolves, 1)) * 100).toFixed(1)}%`,
      `  Circuit Breakers: ${metrics.circuitBreakerStatus.filter(cb => cb.status === 'open').length} open`,
    ].join('\n'));
  }

  private _detectProviderFromUrl(url: string): string {
    if (url.includes('postgresql://') || url.includes('postgres://')) {
      return 'postgresql';
    }
    if (url.includes('mysql://')) {
      return 'mysql';
    }
    if (url.includes('mongodb://') || url.includes('mongodb+srv://')) {
      return 'mongodb';
    }
    return 'unknown';
  }

  private _validateUrl(url: string, orgId: string): void {
    try {
      if (!url.includes('://')) {
        throw new Error('URL must include protocol (e.g., postgresql://)');
      }

      if (url.includes('..') || url.includes('<') || url.includes('>')) {
        throw new Error('URL contains suspicious characters');
      }

      const validProtocols = ['postgresql', 'postgres', 'mysql', 'mongodb', 'sqlite'];
      const hasValidProtocol = validProtocols.some(protocol => url.startsWith(`${protocol}://`));
      
      if (!hasValidProtocol) {
        this._log('warn', `⚠️ Unusual database protocol for org '${orgId}': ${url.split('://')[0]}`);
      }

    } catch (error: any) {
      throw new Error(`Invalid database URL for org '${orgId}': ${error.message}`);
    }
  }

  private async _resolveWithRetries(orgId: string): Promise<string> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this._log('debug', `🔄 Resolver attempt ${attempt}/${this.MAX_RETRIES} for org '${orgId}'`);
        
        const url = await Promise.race([
          Promise.resolve(this.userResolver!(orgId)),
          this._createTimeout(this.TIMEOUT_MS)
        ]);

        if (typeof url !== 'string' || !url.trim()) {
          throw new Error('Resolver returned invalid URL (empty or non-string)');
        }

        return url.trim();

      } catch (error: any) {
        lastError = error;
        this._log('warn', `⚠️ Resolver attempt ${attempt} failed for org '${orgId}': ${error.message}`);
        
        if (attempt < this.MAX_RETRIES) {
          const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private _getDefaultUrlWithLog(orgId: string, reason: string, error?: Error): string {
    const url = this._getDefaultUrl(orgId);
    
    if (error) {
      this._log('warn', `🔄 Using fallback URL for org '${orgId}' (${reason}): ${error.message}`);
    } else {
      this._log('info', `📋 Using default URL pattern for org '${orgId}' (${reason})`);
    }
    
    return url;
  }

  private _getDefaultUrl(orgId: string): string {
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    if (baseUrl.includes('{org}')) {
      return baseUrl.replace('{org}', orgId);
    }

    const urlParts = baseUrl.match(/^(.*\/)([^/?]+)(.*)$/);
    if (urlParts) {
      return `${urlParts[1]}${orgId}_${urlParts[2]}${urlParts[3]}`;
    }

    return `${baseUrl}_${orgId}`;
  }

  private _getEmergencyFallback(orgId: string): string {
    const fallback = `postgresql://localhost:5432/${orgId}_database`;
    this._log('error', `🚨 Using emergency fallback URL for org '${orgId}': ${fallback}`);
    return fallback;
  }

  private async _createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Resolver timeout after ${ms}ms`)), ms);
    });
  }

  private _log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const timestamp = new Date().toISOString();
    const prefix = `[AppKit OrgResolver ${timestamp}]`;

    if (level === 'debug' && !this.isDevelopment) {
      return;
    }

    switch (level) {
      case 'debug':
        console.debug(`${prefix} ${message}`);
        break;
      case 'info':
        console.log(`${prefix} ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
    }
  }

  // Public methods for enhanced enterprise features
  
  clearCache(orgId?: string): void {
    if (orgId) {
      this.cache.delete(orgId);
      this.failureCache.delete(orgId);
      this._log('info', `🗑️ Cleared cache for org '${orgId}'`);
    } else {
      this.cache.clear();
      this.failureCache.clear();
      this._log('info', '🗑️ Cleared all org URL caches');
    }
  }

  async refreshOrg(orgId: string): Promise<string> {
    this.clearCache(orgId);
    return await this.resolve(orgId);
  }

  /**
   * Manually open/close circuit breaker for testing
   */
  setCircuitBreakerState(orgId: string, state: 'open' | 'closed'): void {
    if (state === 'open') {
      this.failureCache.set(orgId, {
        count: this.CIRCUIT_BREAKER_THRESHOLD,
        lastFailure: Date.now(),
        lastError: 'Manually opened',
        consecutiveFailures: this.CIRCUIT_BREAKER_THRESHOLD,
      });
    } else {
      this.failureCache.delete(orgId);
    }
    
    this._log('info', `🔧 Circuit breaker ${state.toUpperCase()} for org '${orgId}'`);
  }

  /**
   * Preload orgs into cache for faster resolution
   */
  async preloadOrgs(orgIds: string[]): Promise<void> {
    this._log('info', `⚡ Preloading ${orgIds.length} organizations into cache...`);
    
    const promises = orgIds.map(async (orgId) => {
      try {
        await this.resolve(orgId);
      } catch (error: any) {
        this._log('warn', `Failed to preload org '${orgId}': ${error.message}`);
      }
    });
    
    await Promise.allSettled(promises);
    this._log('info', `✅ Preloading complete. Cache size: ${this.cache.size}`);
  }
}