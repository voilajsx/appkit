/**
 * Database transport with scope-based optimization and batch processing
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/database.js
 */
/**
 * Database transport class with built-in connection management and scope optimization
 */
export class DatabaseTransport {
    /**
     * Creates a new Database transport
     * @param {object} [config={}] - Database transport configuration
     */
    constructor(config?: object);
    config: any;
    client: any;
    connected: boolean;
    batch: any[];
    flushTimer: any;
    /**
     * Optimize log entry based on scope settings
     * @param {object} entry - Original log entry
     * @returns {object} Optimized log entry
     */
    optimizeLogEntry(entry: object): object;
    /**
     * Create minimal log entry for database storage
     * @param {object} entry - Original entry
     * @returns {object} Minimal entry
     */
    createMinimalEntry(entry: object): object;
    /**
     * Filter metadata to keep only essential fields for database storage
     * @param {object} meta - Original metadata
     * @returns {object} Essential metadata
     */
    filterEssentialMeta(meta: object): object;
    /**
     * Validate database configuration
     */
    validateConfig(): void;
    /**
     * Validate database URL format
     * @param {string} url - Database URL to validate
     * @returns {boolean} True if valid
     */
    isValidDatabaseUrl(url: string): boolean;
    /**
     * Initialize database transport
     */
    initialize(): Promise<void>;
    /**
     * Connect to database
     */
    connect(): Promise<void>;
    /**
     * Connect to PostgreSQL
     */
    connectPostgres(): Promise<void>;
    /**
     * Connect to MySQL
     */
    connectMySQL(): Promise<void>;
    /**
     * Connect to SQLite
     */
    connectSQLite(): Promise<void>;
    /**
     * Ensure logs table exists with optimized schema
     */
    ensureTableExists(): Promise<void>;
    /**
     * Get CREATE TABLE SQL for current database type with scope-optimized schema
     * @returns {string} CREATE TABLE SQL
     */
    getCreateTableSQL(): string;
    /**
     * Execute database query with retry logic
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<any>} Query result
     */
    executeQuery(sql: string, params?: any[]): Promise<any>;
    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms: number): Promise<void>;
    /**
     * Writes log entry to database (batched)
     * @param {object} entry - Log entry object
     */
    write(entry: object): void;
    /**
     * Setup automatic batch flushing
     */
    setupBatchFlush(): void;
    /**
     * Flush current batch to database
     */
    flushBatch(): Promise<void>;
    /**
     * Insert batch of log entries
     * @param {Array} entries - Log entries to insert
     */
    insertBatch(entries: any[]): Promise<void>;
    /**
     * Insert batch for PostgreSQL
     * @param {Array} entries - Log entries
     */
    insertBatchPostgres(entries: any[]): Promise<void>;
    /**
     * Insert batch for MySQL
     * @param {Array} entries - Log entries
     */
    insertBatchMySQL(entries: any[]): Promise<void>;
    /**
     * Insert batch for SQLite
     * @param {Array} entries - Log entries
     */
    insertBatchSQLite(entries: any[]): Promise<void>;
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
     * Close the database transport
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
