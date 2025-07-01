/**
 * Core logger class with simplified transport management and built-in functionality
 * @module @voilajsx/appkit/logging
 * @file src/logging/logger.ts
 *
 * @llm-rule WHEN: Building logger instances - called via logger.get(), not directly
 * @llm-rule AVOID: Creating LoggerClass directly - always use logger.get() for proper setup
 * @llm-rule NOTE: Handles all transports automatically based on environment detection
 */
import type { LoggingConfig } from './defaults';
import type { LogMeta, Logger } from './index';
export interface LogEntry {
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    [key: string]: any;
}
export interface Transport {
    write(entry: LogEntry): void | Promise<void>;
    shouldLog?(level: string, configLevel: string): boolean;
    flush?(): Promise<void>;
    close?(): Promise<void>;
}
/**
 * Logger class with automatic transport management (like auth class pattern)
 */
export declare class LoggerClass implements Logger {
    private level;
    private levelValue;
    private defaultMeta;
    private config;
    private transports;
    private pendingWrites;
    /**
     * Creates logger with simplified constructor (like auth module)
     * @llm-rule WHEN: Called by logger.get() - environment config already parsed
     * @llm-rule AVOID: Complex config objects - uses direct environment values
     */
    constructor(config: LoggingConfig);
    /**
     * Initialize enabled transports automatically
     * @llm-rule WHEN: Logger startup - creates transports based on environment
     * @llm-rule AVOID: Manual transport setup - environment detection handles this
     */
    private initializeTransports;
    /**
     * Log informational message
     * @llm-rule WHEN: Normal application events, user actions, business logic flow
     * @llm-rule AVOID: Sensitive data in meta - passwords, tokens, full card numbers
     */
    info(message: string, meta?: LogMeta): void;
    /**
     * Log error message
     * @llm-rule WHEN: Exceptions, failures, critical issues requiring attention
     * @llm-rule AVOID: Using for warnings - errors should indicate actual problems
     */
    error(message: string, meta?: LogMeta): void;
    /**
     * Log warning message
     * @llm-rule WHEN: Potential issues, deprecated usage, performance concerns
     * @llm-rule AVOID: Using for normal recoverable errors - use error() for those
     */
    warn(message: string, meta?: LogMeta): void;
    /**
     * Log debug message
     * @llm-rule WHEN: Development debugging, detailed flow information
     * @llm-rule AVOID: Production debug spam - automatically filtered in production
     */
    debug(message: string, meta?: LogMeta): void;
    /**
     * Create child logger with additional context (like auth pattern)
     * @llm-rule WHEN: Adding component context or request-specific data
     * @llm-rule AVOID: Creating many child loggers - reuse component loggers
     */
    child(bindings: LogMeta): LoggerClass;
    /**
     * Core logging method with automatic transport routing
     * @llm-rule WHEN: Called by info/error/warn/debug methods
     * @llm-rule AVOID: Calling directly - use specific level methods instead
     */
    private log;
    /**
     * Write log entry to all active transports
     * @llm-rule WHEN: Distributing log entries across console, file, database, etc
     * @llm-rule AVOID: Manual transport selection - automatic routing is better
     */
    private writeToTransports;
    /**
     * Flush all pending logs across all transports
     * @llm-rule WHEN: App shutdown, test cleanup, ensuring logs are written
     * @llm-rule AVOID: Calling frequently - only needed for cleanup
     */
    flush(): Promise<void>;
    /**
     * Close all transports and cleanup resources
     * @llm-rule WHEN: App shutdown, test cleanup, logger reset
     * @llm-rule AVOID: Calling without flush() first - may lose pending logs
     */
    close(): Promise<void>;
    /**
     * Get list of active transport names
     * @llm-rule WHEN: Debugging transport setup or checking configuration
     * @llm-rule AVOID: Using for business logic - transport selection is automatic
     */
    getActiveTransports(): string[];
    /**
     * Check if specific transport is active
     * @llm-rule WHEN: Conditional logic based on transport availability
     * @llm-rule AVOID: Complex transport detection - just log normally
     */
    hasTransport(name: string): boolean;
    /**
     * Set log level at runtime
     * @llm-rule WHEN: Dynamic log level changes based on debug flags
     * @llm-rule AVOID: Frequent level changes - set once at startup usually
     */
    setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void;
    /**
     * Get current log level
     * @llm-rule WHEN: Checking current log level for conditional logging
     * @llm-rule AVOID: Using for level filtering - logger handles this automatically
     */
    getLevel(): string;
    /**
     * Check if specific level would be logged
     * @llm-rule WHEN: Expensive log message computation - check before building
     * @llm-rule AVOID: Regular usage - just call log methods, they filter automatically
     */
    isLevelEnabled(level: 'debug' | 'info' | 'warn' | 'error'): boolean;
    /**
     * Get configuration summary for debugging
     * @llm-rule WHEN: Debugging logger setup or environment detection issues
     * @llm-rule AVOID: Using for runtime decisions - config is set at startup
     */
    getConfig(): {
        level: "error" | "warn" | "debug" | "info";
        scope: "minimal" | "full";
        minimal: boolean;
        transports: string[];
        service: {
            name: string;
            version: string;
            environment: string;
        };
        environment: {
            NODE_ENV: string | undefined;
            hasDbUrl: boolean;
            hasHttpUrl: boolean;
            hasWebhookUrl: boolean;
        };
    };
}
