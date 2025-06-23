/**
 * Logger class with built-in transport management
 */
export class LoggerClass {
    /**
     * Creates a new Logger instance
     * @param {object} [options={}] - Logger configuration
     */
    constructor(options?: object);
    level: any;
    defaultMeta: any;
    levelValue: any;
    config: any;
    transports: Map<any, any>;
    /**
     * Initialize all enabled transports
     */
    initializeTransports(): void;
    /**
     * Create transport instance based on name
     * @param {string} name - Transport name
     * @returns {object|null} Transport instance
     */
    createTransport(name: string): object | null;
    /**
     * Logs info message
     * @param {string} message - Log message
     * @param {object} [meta={}] - Additional metadata
     */
    info(message: string, meta?: object): void;
    /**
     * Logs error message
     * @param {string} message - Log message
     * @param {object} [meta={}] - Additional metadata
     */
    error(message: string, meta?: object): void;
    /**
     * Logs warning message
     * @param {string} message - Log message
     * @param {object} [meta={}] - Additional metadata
     */
    warn(message: string, meta?: object): void;
    /**
     * Logs debug message
     * @param {string} message - Log message
     * @param {object} [meta={}] - Additional metadata
     */
    debug(message: string, meta?: object): void;
    /**
     * Creates child logger with additional context
     * @param {object} bindings - Additional context bindings
     * @returns {LoggerClass} Child logger instance
     */
    child(bindings: object): LoggerClass;
    /**
     * Core logging method
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {object} meta - Metadata
     */
    log(level: string, message: string, meta: object): void;
    /**
     * Create standardized log entry
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {object} meta - Metadata
     * @returns {object} Log entry object
     */
    createLogEntry(level: string, message: string, meta: object): object;
    /**
     * Write log entry to all transports
     * @param {object} entry - Log entry
     */
    writeToTransports(entry: object): void;
    _pendingWrites: any[];
    /**
     * Wait for all pending writes to complete
     * @returns {Promise<void>}
     */
    waitForWrites(): Promise<void>;
    /**
     * Flushes all pending logs across all transports
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
    /**
     * Closes all transports and cleans up resources
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Get list of active transport names
     * @returns {string[]} Array of active transport names
     */
    getActiveTransports(): string[];
    /**
     * Check if a specific transport is active
     * @param {string} name - Transport name
     * @returns {boolean} True if transport is active
     */
    hasTransport(name: string): boolean;
    /**
     * Get transport instance by name (for advanced usage)
     * @param {string} name - Transport name
     * @returns {object|null} Transport instance or null
     */
    getTransport(name: string): object | null;
    /**
     * Add a custom transport at runtime
     * @param {string} name - Transport name
     * @param {object} transport - Transport instance
     */
    addTransport(name: string, transport: object): void;
    /**
     * Remove a transport at runtime
     * @param {string} name - Transport name
     * @returns {Promise<void>}
     */
    removeTransport(name: string): Promise<void>;
    /**
     * Update log level at runtime
     * @param {string} level - New log level
     */
    setLevel(level: string): void;
    /**
     * Get current log level
     * @returns {string} Current log level
     */
    getLevel(): string;
    /**
     * Check if a specific level would be logged
     * @param {string} level - Log level to check
     * @returns {boolean} True if level would be logged
     */
    isLevelEnabled(level: string): boolean;
    /**
     * Get configuration summary for debugging
     * @returns {object} Current configuration summary
     */
    getConfig(): object;
    /**
     * Get transport statistics for monitoring
     * @returns {object} Transport statistics
     */
    getStats(): object;
    /**
     * Perform health check on all transports
     * @returns {Promise<object>} Health check results
     */
    healthCheck(): Promise<object>;
}
