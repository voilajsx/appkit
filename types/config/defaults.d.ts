/**
 * Smart defaults and environment validation for configuration management
 * @module @voilajsx/appkit/config
 * @file src/config/defaults.ts
 *
 * @llm-rule WHEN: App startup - need to parse UPPER_SNAKE__CASE environment variables
 * @llm-rule AVOID: Calling multiple times - expensive parsing, use lazy loading in get()
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 */
export interface ConfigValue {
    [key: string]: string | number | boolean | ConfigValue;
}
export interface AppConfig extends ConfigValue {
    app: {
        name: string;
        environment: string;
        port?: number;
        host?: string;
    };
    [key: string]: any;
}
/**
 * Builds the entire configuration object from process.env
 * @llm-rule WHEN: App startup to get production-ready configuration from environment
 * @llm-rule AVOID: Calling repeatedly - validates environment each time, expensive operation
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 * @llm-rule CONVENTION: Only processes variables with double underscores (__) for user config
 * @llm-rule CONVENTION: Variables with single underscore (VOILA_*, FLUX_*) are AppKit internal
 */
export declare function buildConfigFromEnv(): AppConfig;
/**
 * Validates critical configuration at startup
 * @llm-rule WHEN: App startup to ensure required config is present
 * @llm-rule AVOID: Skipping validation - missing config causes runtime errors
 * @llm-rule NOTE: Add your app-specific required config here
 */
export declare function validateConfig(config: AppConfig): void;
/**
 * Gets smart defaults with validation
 * @llm-rule WHEN: App startup to get production-ready configuration
 * @llm-rule AVOID: Calling repeatedly - expensive validation, cache the result
 */
export declare function getSmartDefaults(): AppConfig;
