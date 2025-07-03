/**
 * Smart defaults with direct environment access and auto transport detection
 * @module @voilajsx/appkit/logging
 * @file src/logging/defaults.ts
 *
 * @llm-rule WHEN: App startup - need production-ready logging configuration
 * @llm-rule AVOID: Calling multiple times - expensive environment parsing, cache results
 * @llm-rule NOTE: Called once at startup, cached globally for performance like auth module
 * @llm-rule NOTE: Now includes visual error configuration for enhanced developer experience
 */
export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    scope: 'minimal' | 'full';
    minimal: boolean;
    transports: {
        console: boolean;
        file: boolean;
        database: boolean;
        http: boolean;
        webhook: boolean;
    };
    console: {
        colorize: boolean;
        timestamps: boolean;
        prettyPrint: boolean;
    };
    file: {
        dir: string;
        filename: string;
        maxSize: number;
        retentionDays: number;
    };
    database: {
        url: string | null;
        table: string;
        batchSize: number;
    };
    http: {
        url: string | null;
        batchSize: number;
        timeout: number;
    };
    webhook: {
        url: string | null;
        level: 'debug' | 'info' | 'warn' | 'error';
        rateLimit: number;
    };
    service: {
        name: string;
        version: string;
        environment: string;
    };
}
/**
 * Get smart defaults using direct VOILA_LOGGING_* environment access
 * @llm-rule WHEN: App startup to get production-ready logging configuration
 * @llm-rule AVOID: Calling repeatedly - validates environment each time, expensive operation
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 * @llm-rule NOTE: Now includes VOILA_VISUAL_ERRORS support for enhanced error display
 */
export declare function getSmartDefaults(): LoggingConfig;
/**
 * Validate environment variables (like auth module validation)
 * @llm-rule WHEN: App startup to catch configuration errors early
 * @llm-rule AVOID: Skipping validation - invalid config causes silent failures
 * @llm-rule NOTE: Now includes validation for VOILA_VISUAL_ERRORS
 */
export declare function validateEnvironment(): void;
//# sourceMappingURL=defaults.d.ts.map