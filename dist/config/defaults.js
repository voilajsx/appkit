/**
 * Smart defaults and environment validation for configuration management
 * @module @voilajsx/appkit/config
 * @file src/config/defaults.ts
 *
 * @llm-rule WHEN: App startup - need to parse UPPER_SNAKE__CASE environment variables
 * @llm-rule AVOID: Calling multiple times - expensive parsing, use lazy loading in get()
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 */
/**
 * Parses a string value to its appropriate type (boolean, number, or string)
 * @llm-rule WHEN: Processing environment variables that need type conversion
 * @llm-rule AVOID: Manual string-to-type conversion - this handles edge cases properly
 * @llm-rule NOTE: Supports "true"/"false" → boolean, numeric strings → number
 */
function parseValue(value) {
    if (typeof value !== 'string')
        return value;
    const trimmed = value.trim();
    // Handle empty strings
    if (trimmed === '')
        return '';
    // Handle booleans
    const lowerValue = trimmed.toLowerCase();
    if (lowerValue === 'true')
        return true;
    if (lowerValue === 'false')
        return false;
    // Handle special values
    if (lowerValue === 'null')
        return '';
    if (lowerValue === 'undefined')
        return '';
    // Handle numbers (but not if they start with 0 - could be IDs)
    if (!trimmed.startsWith('0') && !isNaN(Number(trimmed)) && trimmed !== '') {
        const num = Number(trimmed);
        // Only convert if it's a safe integer or decimal
        if (Number.isSafeInteger(num) || (num % 1 !== 0 && num.toString() === trimmed)) {
            return num;
        }
    }
    return value;
}
/**
 * Sets a value on a nested object using a dot-notation path
 * @llm-rule WHEN: Building nested config object from flat environment variables
 * @llm-rule AVOID: Manual object nesting - this handles deep paths safely
 */
function setNestedValue(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (typeof current[segment] !== 'object' || current[segment] === null) {
            current[segment] = {};
        }
        current = current[segment];
    }
    current[path[path.length - 1]] = value;
}
/**
 * Validates the NODE_ENV for common conventions
 * @llm-rule WHEN: App startup to ensure proper environment configuration
 * @llm-rule AVOID: Skipping validation - improper NODE_ENV causes subtle bugs
 */
function validateEnvironment() {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv && !['development', 'production', 'test', 'staging'].includes(nodeEnv)) {
        console.warn(`[VoilaJSX AppKit] Unusual NODE_ENV: "${nodeEnv}". ` +
            `Expected: development, production, test, or staging.`);
    }
    // Validate common required variables in production
    if (nodeEnv === 'production') {
        const requiredProdVars = ['VOILA_SERVICE_NAME'];
        const missing = requiredProdVars.filter(varName => !process.env[varName]);
        if (missing.length > 0) {
            console.warn(`[VoilaJSX AppKit] Missing recommended production environment variables: ${missing.join(', ')}`);
        }
    }
}
/**
 * Validates environment variable format for common mistakes
 * @llm-rule WHEN: Processing custom environment variables for format validation
 * @llm-rule AVOID: Silent format errors - validates UPPER_SNAKE__CASE convention
 */
function validateEnvVarFormat(envKey) {
    // Check for proper UPPER_SNAKE__CASE format
    if (envKey.includes('__')) {
        // Should be uppercase
        if (envKey !== envKey.toUpperCase()) {
            console.warn(`[VoilaJSX AppKit] Environment variable "${envKey}" should be uppercase for consistency`);
        }
        // Check for triple underscores (common mistake)
        if (envKey.includes('___')) {
            console.warn(`[VoilaJSX AppKit] Environment variable "${envKey}" has triple underscores - did you mean double (__)?`);
            return false;
        }
        // Check for single underscore in the middle (might be a mistake)
        const parts = envKey.split('__');
        for (const part of parts) {
            if (part.includes('_') && part.length > 1) {
                // This is actually OK - single underscores within segments are allowed
                continue;
            }
        }
    }
    return true;
}
/**
 * Builds the entire configuration object from process.env
 * @llm-rule WHEN: App startup to get production-ready configuration from environment
 * @llm-rule AVOID: Calling repeatedly - validates environment each time, expensive operation
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 */
export function buildConfigFromEnv() {
    validateEnvironment();
    const config = {
        app: {
            name: process.env.VOILA_SERVICE_NAME || process.env.npm_package_name || 'voila-app',
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
            host: process.env.HOST || undefined,
        },
    };
    // Process all environment variables using the UPPER_SNAKE__CASE convention
    for (const envKey in process.env) {
        if (envKey.includes('__') && validateEnvVarFormat(envKey)) {
            const path = envKey.toLowerCase().split('__');
            const value = parseValue(process.env[envKey] || '');
            setNestedValue(config, path, value);
        }
    }
    return config;
}
/**
 * Validates critical configuration at startup
 * @llm-rule WHEN: App startup to ensure required config is present
 * @llm-rule AVOID: Skipping validation - missing config causes runtime errors
 * @llm-rule NOTE: Add your app-specific required config here
 */
export function validateConfig(config) {
    const environment = config.app.environment;
    // Production-specific validations
    if (environment === 'production') {
        if (!config.app.name || config.app.name === 'voila-app') {
            throw new Error('VOILA_SERVICE_NAME is required in production. ' +
                'Set environment variable: VOILA_SERVICE_NAME=your-app-name');
        }
    }
    // Port validation
    if (config.app.port && (config.app.port < 1 || config.app.port > 65535)) {
        throw new Error(`Invalid PORT: ${config.app.port}. Must be between 1 and 65535.`);
    }
}
/**
 * Gets smart defaults with validation
 * @llm-rule WHEN: App startup to get production-ready configuration
 * @llm-rule AVOID: Calling repeatedly - expensive validation, cache the result
 */
export function getSmartDefaults() {
    const config = buildConfigFromEnv();
    validateConfig(config);
    return config;
}
