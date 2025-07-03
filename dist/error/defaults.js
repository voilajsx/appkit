/**
 * Smart defaults and environment validation for error handling
 * @module @voilajsx/appkit/error
 * @file src/error/defaults.ts
 *
 * @llm-rule WHEN: App startup - need to configure error handling behavior and messages
 * @llm-rule AVOID: Calling multiple times - expensive environment parsing, use lazy loading in get()
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 */
/**
 * Gets smart defaults using VOILA_ERROR_* environment variables
 * @llm-rule WHEN: App startup to get production-ready error configuration
 * @llm-rule AVOID: Calling repeatedly - expensive validation, cache the result
 * @llm-rule NOTE: Automatically configures dev vs production error behavior
 */
export function getSmartDefaults() {
    validateEnvironment();
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isDevelopment = nodeEnv === 'development';
    const isProduction = nodeEnv === 'production';
    const isTest = nodeEnv === 'test';
    return {
        // Error message defaults with environment awareness
        messages: {
            badRequest: 'Bad Request',
            unauthorized: process.env.VOILA_AUTH_MESSAGE || 'Authentication required',
            forbidden: 'Access denied',
            notFound: 'Not found',
            conflict: 'Conflict',
            serverError: isDevelopment ? 'Internal server error' : 'Server error',
        },
        // Error handling behavior with smart defaults
        middleware: {
            showStack: process.env.VOILA_ERROR_STACK === 'true' || isDevelopment,
            logErrors: process.env.VOILA_ERROR_LOG !== 'false',
        },
        // Environment information
        environment: {
            isDevelopment,
            isProduction,
            isTest,
            nodeEnv,
        },
    };
}
/**
 * Validates environment variables for error configuration
 * @llm-rule WHEN: App startup to ensure proper error environment configuration
 * @llm-rule AVOID: Skipping validation - improper config causes silent failures
 * @llm-rule NOTE: Validates boolean environment variables and NODE_ENV
 */
function validateEnvironment() {
    // Validate VOILA_ERROR_STACK
    const errorStack = process.env.VOILA_ERROR_STACK;
    if (errorStack && !['true', 'false'].includes(errorStack)) {
        throw new Error(`Invalid VOILA_ERROR_STACK: "${errorStack}". Must be "true" or "false"`);
    }
    // Validate VOILA_ERROR_LOG
    const errorLog = process.env.VOILA_ERROR_LOG;
    if (errorLog && !['true', 'false'].includes(errorLog)) {
        throw new Error(`Invalid VOILA_ERROR_LOG: "${errorLog}". Must be "true" or "false"`);
    }
    // Validate NODE_ENV
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv && !['development', 'production', 'test', 'staging'].includes(nodeEnv)) {
        console.warn(`[VoilaJSX AppKit] Unusual NODE_ENV: "${nodeEnv}". ` +
            `Expected: development, production, test, or staging`);
    }
    // Production-specific warnings
    if (nodeEnv === 'production') {
        if (process.env.VOILA_ERROR_STACK === 'true') {
            console.warn(`[VoilaJSX AppKit] VOILA_ERROR_STACK=true in production. ` +
                `Consider setting to false for security`);
        }
    }
}
//# sourceMappingURL=defaults.js.map