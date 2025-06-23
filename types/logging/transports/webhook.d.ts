/**
 * Webhook transport class for real-time alerts and notifications with scope optimization
 */
export class WebhookTransport {
    /**
     * Creates a new Webhook transport
     * @param {object} [config={}] - Webhook transport configuration
     */
    constructor(config?: object);
    config: any;
    parsedUrl: any;
    rateLimitQueue: any[];
    /**
     * Optimize log entry based on scope settings
     * @param {object} entry - Original log entry
     * @returns {object} Optimized log entry for webhook
     */
    optimizeLogEntry(entry: object): object;
    /**
     * Create minimal log entry for webhook alerts
     * @param {object} entry - Original entry
     * @returns {object} Minimal entry optimized for alerts
     */
    createMinimalEntry(entry: object): object;
    /**
     * Optimize error object for webhook alerts
     * @param {object|string} error - Error object or string
     * @returns {object|string} Optimized error for alerts
     */
    optimizeError(error: object | string): object | string;
    /**
     * Filter metadata to keep only critical fields for alerts
     * @param {object} meta - Original metadata
     * @returns {object} Critical metadata for alerts
     */
    filterCriticalMeta(meta: object): object;
    /**
     * Validate webhook transport configuration
     */
    validateConfig(): void;
    /**
     * Validate HTTP URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid HTTP/HTTPS URL
     */
    isValidHttpUrl(url: string): boolean;
    /**
     * Initialize webhook transport
     */
    initialize(): void;
    /**
     * Setup rate limit cleanup
     */
    setupRateLimitCleanup(): void;
    /**
     * Writes log entry to webhook (immediate, level-filtered)
     * @param {object} entry - Log entry object
     */
    write(entry: object): Promise<void>;
    /**
     * Check if log level should be sent to webhook
     * @param {string} level - Log level to check
     * @returns {boolean} True if level should be sent
     */
    shouldSendLevel(level: string): boolean;
    /**
     * Check rate limiting
     * @returns {boolean} True if within rate limit
     */
    checkRateLimit(): boolean;
    /**
     * Send log entry via webhook
     * @param {object} entry - Log entry to send
     */
    sendWebhook(entry: object): Promise<void>;
    /**
     * Format log entry into webhook payload (Slack + Generic only)
     * @param {object} entry - Log entry
     * @returns {string} Formatted webhook payload
     */
    formatWebhookPayload(entry: object): string;
    /**
     * Detect webhook service type based on URL (Slack only)
     * @returns {string} Service type
     */
    detectWebhookService(): string;
    /**
     * Format payload for Slack webhook with scope optimization
     * @param {object} entry - Log entry
     * @returns {object} Slack-formatted payload
     */
    formatSlackPayload(entry: object): object;
    /**
     * Get Slack color for log level
     * @param {string} level - Log level
     * @returns {string} Slack color
     */
    getSlackColor(level: string): string;
    /**
     * Get emoji for log level
     * @param {string} level - Log level
     * @returns {string} Emoji
     */
    getLevelEmoji(level: string): string;
    /**
     * Map log level to alert severity
     * @param {string} level - Log level
     * @returns {string} Severity level
     */
    mapLevelToSeverity(level: string): string;
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
     * Flush any pending logs (no-op for webhook - immediate sending)
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
    /**
     * Close the webhook transport
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
