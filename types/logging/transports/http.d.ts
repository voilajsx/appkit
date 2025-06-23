/**
 * HTTP transport class for sending logs to external services with scope optimization
 */
export class HttpTransport {
    /**
     * Creates a new HTTP transport
     * @param {object} [config={}] - HTTP transport configuration
     */
    constructor(config?: object);
    config: any;
    batch: any[];
    flushTimer: any;
    parsedUrl: any;
    /**
     * Optimize log entry based on scope settings
     * @param {object} entry - Original log entry
     * @returns {object} Optimized log entry
     */
    optimizeLogEntry(entry: object): object;
    /**
     * Create minimal log entry for HTTP transmission
     * @param {object} entry - Original entry
     * @returns {object} Minimal entry
     */
    createMinimalEntry(entry: object): object;
    /**
     * Optimize error object for HTTP transmission
     * @param {object|string} error - Error object or string
     * @returns {object|string} Optimized error
     */
    optimizeError(error: object | string): object | string;
    /**
     * Filter metadata to keep only essential fields for external services
     * @param {object} meta - Original metadata
     * @returns {object} Essential metadata
     */
    filterEssentialMeta(meta: object): object;
    /**
     * Parse headers from environment variable or string
     * @param {string} headersStr - Headers string (JSON format)
     * @returns {object|null} Parsed headers object
     */
    parseHeaders(headersStr: string): object | null;
    /**
     * Validate HTTP transport configuration
     */
    validateConfig(): void;
    /**
     * Validate HTTP URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid HTTP/HTTPS URL
     */
    isValidHttpUrl(url: string): boolean;
    /**
     * Initialize HTTP transport
     */
    initialize(): void;
    /**
     * Writes log entry to HTTP endpoint (batched)
     * @param {object} entry - Log entry object
     */
    write(entry: object): void;
    /**
     * Setup automatic batch flushing
     */
    setupBatchFlush(): void;
    /**
     * Flush current batch to HTTP endpoint
     */
    flushBatch(): Promise<void>;
    /**
     * Send batch of log entries via HTTP
     * @param {Array} entries - Log entries to send
     */
    sendBatch(entries: any[]): Promise<void>;
    /**
     * Format log entries into HTTP payload based on service type and scope
     * @param {Array} entries - Log entries
     * @returns {string} Formatted JSON payload
     */
    formatPayload(entries: any[]): string;
    /**
     * Extract Datadog-specific attributes from log entry
     * @param {object} entry - Log entry
     * @returns {object} Datadog attributes
     */
    extractDatadogAttributes(entry: object): object;
    /**
     * Detect service type based on URL for format optimization
     * @returns {string} Service type
     */
    detectServiceType(): string;
    /**
     * Make HTTP request with retry logic
     * @param {string} payload - Request payload
     */
    makeHttpRequest(payload: string): Promise<void>;
    /**
     * Execute single HTTP request
     * @param {string} payload - Request payload
     * @returns {Promise<void>}
     */
    executeHttpRequest(payload: string): Promise<void>;
    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms: number): Promise<void>;
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
     * Close the HTTP transport
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
