/**
 * File transport class with built-in rotation, retention and scope optimization
 */
export class FileTransport {
    /**
     * Creates a new File transport
     * @param {object} [config={}] - File transport configuration
     */
    constructor(config?: object);
    config: any;
    currentSize: number;
    currentDate: string;
    stream: any;
    /**
     * Optimize log entry based on scope settings
     * @param {object} entry - Original log entry
     * @returns {object} Optimized log entry
     */
    optimizeLogEntry(entry: object): object;
    /**
     * Create minimal log entry for smaller file size
     * @param {object} entry - Original entry
     * @returns {object} Minimal entry
     */
    createMinimalEntry(entry: object): object;
    /**
     * Apply compact field naming to reduce file size
     * @param {object} entry - Log entry
     * @returns {object} Compacted entry
     */
    applyCompactFormat(entry: object): object;
    /**
     * Optimize error object to reduce size while keeping useful info
     * @param {object|string} error - Error object or string
     * @returns {object|string} Optimized error
     */
    optimizeError(error: object | string): object | string;
    /**
     * Filter metadata to keep only important fields in minimal mode
     * @param {object} meta - Original metadata
     * @returns {object} Filtered metadata
     */
    filterImportantMeta(meta: object): object;
    /**
     * Initialize file transport
     */
    initialize(): void;
    /**
     * Writes log entry to file
     * @param {object} entry - Log entry object
     */
    write(entry: object): Promise<void>;
    /**
     * Write line to stream with timeout protection
     * @param {string} line - Log line to write
     * @returns {Promise<void>}
     */
    writeToStream(line: string): Promise<void>;
    /**
     * Check if rotation is needed and perform it
     */
    checkRotation(): Promise<void>;
    /**
     * Perform date-based rotation
     */
    rotateDateBased(): Promise<void>;
    /**
     * Perform size-based rotation
     */
    rotateSizeBased(): Promise<void>;
    /**
     * Create write stream for current log file
     */
    createStream(): void;
    /**
     * Close the current stream
     * @returns {Promise<void>}
     */
    closeStream(): Promise<void>;
    /**
     * Get current date string for file naming
     * @returns {string} Date string in YYYY-MM-DD format
     */
    getCurrentDate(): string;
    /**
     * Get current log file path
     * @returns {string} Full file path
     */
    getCurrentFilepath(): string;
    /**
     * Ensure log directory exists
     */
    ensureDirectoryExists(): void;
    /**
     * Setup automatic cleanup of old log files
     */
    setupRetentionCleanup(): void;
    cleanupInterval: any;
    /**
     * Clean old log files based on retention policy
     */
    cleanOldLogs(): Promise<void>;
    /**
     * Check if this transport can handle the given log level
     * @param {string} level - Log level to check
     * @param {string} configLevel - Configured minimum level
     * @returns {boolean} True if level should be logged
     */
    shouldLog(level: string, configLevel: string): boolean;
    /**
     * Flush any pending logs
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
    /**
     * Close the file transport
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
