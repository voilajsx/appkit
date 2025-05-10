/**
 * Creates a logger instance
 * @param {Object} [options] - Logger options
 * @param {string} [options.level='info'] - Minimum log level
 * @param {Object} [options.defaultMeta] - Default metadata
 * @param {Array} [options.transports] - Log transports
 * @param {boolean} [options.enableFileLogging=true] - Enable file logging
 * @param {string} [options.filename] - Log filename
 * @param {string} [options.dirname] - Log directory
 * @param {number} [options.retentionDays=5] - Log retention in days
 * @param {number} [options.maxSize] - Max file size before rotation
 * @returns {Logger} Logger instance
 */
export function createLogger(options?: {
    level?: string;
    defaultMeta?: any;
    transports?: any[];
    enableFileLogging?: boolean;
    filename?: string;
    dirname?: string;
    retentionDays?: number;
    maxSize?: number;
}): Logger;
/**
 * Logger class
 */
export class Logger {
    constructor(options?: {});
    level: any;
    defaultMeta: any;
    transports: any;
    levelValue: any;
    /**
     * Gets default transports based on environment
     * @private
     * @param {Object} options - Logger options
     * @returns {Array} Default transports
     */
    private getDefaultTransports;
    /**
     * Logs info message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    info(message: string, meta?: any): void;
    /**
     * Logs error message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    error(message: string, meta?: any): void;
    /**
     * Logs warning message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    warn(message: string, meta?: any): void;
    /**
     * Logs debug message
     * @param {string} message - Log message
     * @param {Object} [meta] - Additional metadata
     */
    debug(message: string, meta?: any): void;
    /**
     * Creates child logger with additional context
     * @param {Object} bindings - Additional context bindings
     * @returns {Logger} Child logger instance
     */
    child(bindings: any): Logger;
    /**
     * Core logging method
     * @private
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {Object} meta - Metadata
     */
    private log;
    /**
     * Flushes all transports
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
    /**
     * Closes all transports
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
