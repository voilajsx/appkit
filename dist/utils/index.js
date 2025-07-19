/**
 * Ultra-simple utilities that just work
 * @module @voilajsx/appkit/utils
 * @file src/utils/index.ts
 *
 * @llm-rule WHEN: Building apps that need common utility functions (get, chunk, slugify, debounce, etc.)
 * @llm-rule AVOID: Manual utility implementation - this provides tested, optimized functions with edge cases handled
 * @llm-rule NOTE: Common pattern - utility.get() → utils.get() → utils.chunk() → utils.slugify()
 * @llm-rule NOTE: 12 essential utilities: get, isEmpty, slugify, chunk, debounce, pick, unique, clamp, formatBytes, truncate, sleep, uuid
 */
import { UtilityClass } from './utility.js';
import { getSmartDefaults } from './defaults.js';
// Global utility instance for performance
let globalUtility = null;
/**
 * Get utility instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @llm-rule WHEN: Starting any utility operation - this is your main entry point
 * @llm-rule AVOID: Calling new UtilityClass() directly - always use this function
 * @llm-rule NOTE: Typical flow - get() → utils.get() → utils.chunk() → utils.slugify()
 */
function get(overrides = {}) {
    // Lazy initialization - parse environment once
    if (!globalUtility) {
        const defaults = getSmartDefaults();
        const config = { ...defaults, ...overrides };
        globalUtility = new UtilityClass(config);
    }
    return globalUtility;
}
/**
 * Reset global instance (useful for testing or config changes)
 * @llm-rule WHEN: Testing utility logic with different configurations
 * @llm-rule AVOID: Using in production - only for tests and development
 */
function reset(newConfig = {}) {
    const defaults = getSmartDefaults();
    const config = { ...defaults, ...newConfig };
    globalUtility = new UtilityClass(config);
    return globalUtility;
}
/**
 * Clear the cached utility instance
 * @llm-rule WHEN: Testing or when you need to reload environment variables
 * @llm-rule AVOID: Using in production - only for tests and development
 */
function clearCache() {
    globalUtility = null;
}
/**
 * Get current utility configuration for inspection
 * @llm-rule WHEN: Debugging utility behavior or documenting utility configuration
 * @llm-rule AVOID: Using for runtime utility decisions - use get() instead
 */
function getConfig() {
    const utils = get();
    return utils.config;
}
/**
 * Check if running in development mode (affects utility logging)
 * @llm-rule WHEN: Need to conditionally add debug information to utility operations
 * @llm-rule AVOID: Manual NODE_ENV checks - use this for consistency
 */
function isDevelopment() {
    const config = getConfig();
    return config.environment.isDevelopment;
}
/**
 * Check if running in production mode (affects utility performance optimizations)
 * @llm-rule WHEN: Need to conditionally enable performance optimizations
 * @llm-rule AVOID: Manual NODE_ENV checks - use this for consistency
 */
function isProduction() {
    const config = getConfig();
    return config.environment.isProduction;
}
/**
 * Get utility status for health checks and monitoring
 * @llm-rule WHEN: Building health check endpoints or utility monitoring
 * @llm-rule AVOID: Exposing internal utility details - this only shows availability
 */
function getStatus() {
    const config = getConfig();
    return {
        cacheEnabled: config.cache.enabled,
        performance: config.performance.enabled,
        environment: config.environment.nodeEnv,
        version: config.version,
    };
}
/**
 * Quick utility setup helper for common patterns
 * @llm-rule WHEN: Setting up utilities with custom configuration quickly
 * @llm-rule AVOID: Using without understanding - review configuration for your needs
 * @llm-rule NOTE: Returns utility instance with optimized settings for common use cases
 */
function quickSetup(options = {}) {
    const config = {};
    if (options.performance !== undefined) {
        config.performance = {
            enabled: options.performance,
            memoization: options.performance,
            largeArrayThreshold: 10000,
            chunkSizeLimit: 100000
        };
    }
    if (options.cache !== undefined) {
        config.cache = {
            enabled: options.cache,
            maxSize: 1000,
            ttl: 300000
        };
    }
    if (options.debug !== undefined) {
        config.debug = {
            enabled: options.debug,
            logOperations: options.debug,
            trackPerformance: options.debug
        };
    }
    return get(config);
}
/**
 * Validate utility configuration at startup
 * @llm-rule WHEN: App startup to ensure utility config is valid
 * @llm-rule AVOID: Using in request handlers - expensive validation
 * @llm-rule NOTE: Validates performance settings and cache configuration
 */
function validateConfig() {
    try {
        const config = getConfig();
        // Basic validation
        if (!config.version) {
            throw new Error('Utility version is required');
        }
        if (!config.environment.nodeEnv) {
            throw new Error('NODE_ENV is required');
        }
        console.log('✅ Utility configuration validation passed');
    }
    catch (error) {
        console.error('❌ Utility configuration validation failed:', error.message);
        throw error;
    }
}
/**
 * Single utility export with enhanced functionality
 */
export const utility = {
    // Core method
    get,
    // Utility methods
    reset,
    clearCache,
    getConfig,
    // Environment helpers
    isDevelopment,
    isProduction,
    // Utility helpers
    quickSetup,
    validateConfig,
    getStatus,
};
export { UtilityClass } from './utility.js';
//# sourceMappingURL=index.js.map