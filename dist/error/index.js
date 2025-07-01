/**
 * Core error class with semantic HTTP status codes and middleware
 * @module @voilajsx/appkit/error
 * @file src/error/index.ts
 *
 * @llm-rule WHEN: Building apps that need semantic HTTP error handling
 * @llm-rule AVOID: Using directly - always get instance via error.get()
 * @llm-rule NOTE: Provides semantic error creation (badRequest, unauthorized) and Express middleware
 */
import { ErrorClass } from './error';
import { getSmartDefaults } from './defaults';
// Global error instance for performance
let globalError = null;
/**
 * Get error instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @llm-rule WHEN: Starting any error operation - this is your main entry point
 * @llm-rule AVOID: Calling new ErrorClass() directly - always use this function
 * @llm-rule NOTE: Typical flow - get() → badRequest() → handleErrors()
 */
function get(overrides = {}) {
    // Lazy initialization - parse environment once
    if (!globalError) {
        const defaults = getSmartDefaults();
        const config = { ...defaults, ...overrides };
        globalError = new ErrorClass(config);
    }
    return globalError;
}
/**
 * Reset global instance (useful for testing or config changes)
 * @llm-rule WHEN: Testing error logic with different configurations
 * @llm-rule AVOID: Using in production - only for tests and development
 */
function reset(newConfig = {}) {
    const defaults = getSmartDefaults();
    const config = { ...defaults, ...newConfig };
    globalError = new ErrorClass(config);
    return globalError;
}
/**
 * Single error export with minimal functionality
 */
export const error = {
    // Core method
    get,
    // Utility methods
    reset,
    // Error creation methods
    badRequest: (message) => get().badRequest(message),
    unauthorized: (message) => get().unauthorized(message),
    forbidden: (message) => get().forbidden(message),
    notFound: (message) => get().notFound(message),
    conflict: (message) => get().conflict(message),
    serverError: (message) => get().serverError(message),
    createError: (statusCode, message, type) => get().createError(statusCode, message, type),
    // Middleware and utility methods
    handleErrors: (options) => get().handleErrors(options),
    asyncRoute: (fn) => get().asyncRoute(fn),
    isClientError: (err) => get().isClientError(err),
    isServerError: (err) => get().isServerError(err),
};
export { ErrorClass } from './error';
