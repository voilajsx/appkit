/**
 * TypeScript definitions for @voilajsx/appkit/logging
 * @module @voilajsx/appkit/logging
 * @file src/logging/index.d.ts
 */

declare module '@voilajsx/appkit/logging' {
  // ============================================================================
  // Core Types
  // ============================================================================

  /**
   * Supported log levels in order of severity
   */
  export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

  /**
   * Log metadata - any serializable object
   */
  export interface LogMeta {
    [key: string]: any;
  }

  /**
   * Log entry structure
   */
  export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    [key: string]: any;
  }

  // ============================================================================
  // Logger Interface
  // ============================================================================

  /**
   * Main logger interface with all logging methods
   */
  export interface Logger {
    /**
     * Log an informational message
     * @param message - Log message
     * @param meta - Additional metadata
     */
    info(message: string, meta?: LogMeta): void;

    /**
     * Log an error message
     * @param message - Log message  
     * @param meta - Additional metadata
     */
    error(message: string, meta?: LogMeta): void;

    /**
     * Log a warning message
     * @param message - Log message
     * @param meta - Additional metadata
     */
    warn(message: string, meta?: LogMeta): void;

    /**
     * Log a debug message
     * @param message - Log message
     * @param meta - Additional metadata
     */
    debug(message: string, meta?: LogMeta): void;

    /**
     * Create a child logger with additional context
     * @param bindings - Context to add to all log entries
     * @returns New logger instance with bound context
     */
    child(bindings: LogMeta): Logger;

    /**
     * Flush all pending log entries
     * @returns Promise that resolves when all logs are flushed
     */
    flush(): Promise<void>;

    /**
     * Close logger and all transports
     * @returns Promise that resolves when logger is closed
     */
    close(): Promise<void>;

    /**
     * Get list of active transport names
     * @returns Array of active transport names
     */
    getActiveTransports(): string[];

    /**
     * Check if a specific transport is active
     * @param name - Transport name
     * @returns True if transport is active
     */
    hasTransport(name: string): boolean;

    /**
     * Update log level at runtime
     * @param level - New log level
     */
    setLevel(level: LogLevel): void;

    /**
     * Get current log level
     * @returns Current log level
     */
    getLevel(): LogLevel;

    /**
     * Check if a specific level would be logged
     * @param level - Log level to check
     * @returns True if level would be logged
     */
    isLevelEnabled(level: LogLevel): boolean;

    /**
     * Get configuration summary for debugging
     * @returns Current configuration summary
     */
    getConfig(): LoggerConfig;

    /**
     * Get transport statistics for monitoring
     * @returns Transport statistics
     */
    getStats(): LoggerStats;

    /**
     * Perform health check on all transports
     * @returns Health check results
     */
    healthCheck(): Promise<HealthCheckResult>;
  }

  // ============================================================================
  // Configuration Types
  // ============================================================================

  /**
   * Logger configuration summary
   */
  export interface LoggerConfig {
    level: LogLevel;
    scope: 'auto' | 'minimal' | 'full';
    minimal: boolean;
    transports: string[];
    defaultMeta: LogMeta;
    environment: {
      NODE_ENV?: string;
      VOILA_LOGGING_SCOPE?: string;
      VOILA_LOGGING_CONSOLE?: string;
      VOILA_LOGGING_FILE?: string;
      hasDbUrl: boolean;
      hasHttpUrl: boolean;
      hasWebhookUrl: boolean;
    };
  }

  /**
   * Logger statistics for monitoring
   */
  export interface LoggerStats {
    logger: {
      level: LogLevel;
      levelValue: number;
      totalTransports: number;
      activeTransports: string[];
      pendingWrites: number;
      scope: 'auto' | 'minimal' | 'full';
      minimal: boolean;
    };
    transports: {
      [transportName: string]: TransportStats;
    };
    environment: {
      NODE_ENV?: string;
      CI: boolean;
      DEBUG: boolean;
      VOILA_DEBUG: boolean;
    };
  }

  /**
   * Individual transport statistics
   */
  export interface TransportStats {
    active: boolean;
    hasFlush: boolean;
    hasClose: boolean;
    config: Record<string, any>;
    stats?: Record<string, any>;
    statsError?: string;
  }

  /**
   * Health check result
   */
  export interface HealthCheckResult {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    logger: {
      level: LogLevel;
      transports: number;
      pendingWrites: number;
    };
    transports: {
      [transportName: string]: TransportHealthCheck;
    };
    error?: string;
  }

  /**
   * Individual transport health check
   */
  export interface TransportHealthCheck {
    status: 'healthy' | 'degraded' | 'unhealthy';
    name: string;
    active: boolean;
    details?: Record<string, any>;
    error?: string;
  }

  // ============================================================================
  // Transport Types
  // ============================================================================

  /**
   * Base transport interface
   */
  export interface Transport {
    /**
     * Write a log entry
     * @param entry - Log entry to write
     */
    write(entry: LogEntry): void | Promise<void>;

    /**
     * Check if transport should log this level
     * @param level - Log level to check
     * @param configLevel - Configured minimum level
     * @returns True if should log
     */
    shouldLog?(level: LogLevel, configLevel: LogLevel): boolean;

    /**
     * Flush pending logs
     * @returns Promise that resolves when flushed
     */
    flush?(): Promise<void>;

    /**
     * Close transport and cleanup
     * @returns Promise that resolves when closed
     */
    close?(): Promise<void>;

    /**
     * Get transport statistics
     * @returns Transport-specific statistics
     */
    getStats?(): Record<string, any>;

    /**
     * Perform health check
     * @returns Health check result
     */
    healthCheck?(): Promise<Record<string, any>>;
  }

  /**
   * Console transport configuration
   */
  export interface ConsoleTransportConfig {
    enabled?: boolean;
    minimal?: boolean;
    colorize?: boolean;
    prettyPrint?: boolean;
    timestamps?: boolean;
    showOnlyImportant?: boolean;
    minimalLevel?: LogLevel;
  }

  /**
   * File transport configuration
   */
  export interface FileTransportConfig {
    enabled?: boolean;
    minimal?: boolean;
    dirname?: string;
    filename?: string;
    retentionDays?: number;
    maxSize?: number;
    rotateDaily?: boolean;
    verbosity?: 'minimal' | 'full';
    compactFormat?: boolean;
    includeStackTraces?: boolean;
    includeMetadata?: boolean;
  }

  /**
   * Database transport configuration
   */
  export interface DatabaseTransportConfig {
    enabled?: boolean;
    minimal?: boolean;
    url?: string;
    table?: string;
    batchSize?: number;
    flushInterval?: number;
    retries?: number;
    retryDelay?: number;
    connectionTimeout?: number;
    includeMetadata?: boolean;
  }

  /**
   * HTTP transport configuration
   */
  export interface HttpTransportConfig {
    enabled?: boolean;
    minimal?: boolean;
    url?: string;
    headers?: Record<string, string>;
    method?: string;
    batchSize?: number;
    flushInterval?: number;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    includeMetadata?: boolean;
  }

  /**
   * Webhook transport configuration
   */
  export interface WebhookTransportConfig {
    enabled?: boolean;
    minimal?: boolean;
    url?: string;
    level?: LogLevel;
    headers?: Record<string, string>;
    method?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    rateLimit?: number;
    rateLimitWindow?: number;
    includeMetadata?: boolean;
  }

  // ============================================================================
  // Main API
  // ============================================================================

  /**
   * Main logger object providing the core API
   */
  export interface LoggerAPI {
    /**
     * Get a logger instance
     * @param component - Optional component name for scoped logging
     * @returns Logger instance ready for use
     * 
     * @example
     * ```typescript
     * // Global logger
     * const log = logger.get();
     * log.info('App started');
     * 
     * // Component logger
     * const authLog = logger.get('auth');
     * authLog.error('Login failed', { userId: 123 });
     * ```
     */
    get(component?: string): Logger;

    /**
     * Clear all logger instances and close transports
     * Essential for testing to prevent memory leaks
     * @returns Promise that resolves when cleared
     * 
     * @example
     * ```typescript
     * // In test files
     * afterEach(async () => {
     *   await logger.clear();
     * });
     * ```
     */
    clear(): Promise<void>;
  }

  /**
   * The main logger export
   */
  export const logger: LoggerAPI;

  /**
   * Default export (same as logger)
   */
  export default logger;

  // ============================================================================
  // Environment Variables (for documentation)
  // ============================================================================

  /**
   * Environment variables that configure the logging system
   * These are automatically detected and used by the logger
   */
  export interface LoggingEnvironment {
    /**
     * Log level: 'debug' | 'info' | 'warn' | 'error'
     * @default Auto-detected based on NODE_ENV
     */
    VOILA_LOGGING_LEVEL?: LogLevel;

    /**
     * Logging scope: 'auto' | 'minimal' | 'full'
     * @default 'auto' (smart detection)
     */
    VOILA_LOGGING_SCOPE?: 'auto' | 'minimal' | 'full';

    /**
     * Enable console transport: 'true' | 'false'
     * @default 'true' (except in test environment)
     */
    VOILA_LOGGING_CONSOLE?: 'true' | 'false';

    /**
     * Enable file transport: 'true' | 'false'
     * @default 'true' (except in test environment)
     */
    VOILA_LOGGING_FILE?: 'true' | 'false';

    /**
     * Enable database transport: 'true' | 'false'
     * @default Auto-enabled if DATABASE_URL exists
     */
    VOILA_LOGGING_DATABASE?: 'true' | 'false';

    /**
     * Log files directory
     * @default 'logs'
     */
    VOILA_LOGGING_DIR?: string;

    /**
     * Service name to include in logs
     * @default 'app'
     */
    VOILA_SERVICE_NAME?: string;

    /**
     * Database URL (auto-enables database transport)
     * @example 'postgres://user:pass@localhost/db'
     */
    DATABASE_URL?: string;

    /**
     * HTTP logging endpoint (auto-enables HTTP transport)
     * @example 'https://logs.datadog.com/api/v1/logs'
     */
    VOILA_LOGGING_HTTP_URL?: string;

    /**
     * Webhook URL for alerts (auto-enables webhook transport)
     * @example 'https://hooks.slack.com/services/xxx'
     */
    VOILA_LOGGING_WEBHOOK_URL?: string;
  }

  // ============================================================================
  // Utility Types
  // ============================================================================

  /**
   * Type for log context bindings
   */
  export type LogContext = Record<string, any>;

  /**
   * Type for component logger names
   */
  export type ComponentName = string;

  /**
   * Type for transport names
   */
  export type TransportName = 'console' | 'file' | 'database' | 'http' | 'webhook';

  /**
   * Union type for all transport configurations
   */
  export type TransportConfig = 
    | ConsoleTransportConfig
    | FileTransportConfig
    | DatabaseTransportConfig
    | HttpTransportConfig
    | WebhookTransportConfig;
}