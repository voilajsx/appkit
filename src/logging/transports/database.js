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
  constructor(config = {}) {
    // Transport defaults
    const defaults = {
      table: 'logs',
      batchSize: 100,
      flushInterval: 5000,
      retries: 3,
      retryDelay: 1000,
      connectionTimeout: 10000,

      // Scope-based optimization
      minimal: false,
      includeMetadata: true,
    };

    // Environment overrides
    const envOverrides = {
      url: process.env.VOILA_LOGGING_DB_URL || process.env.DATABASE_URL,
      table: process.env.VOILA_LOGGING_DB_TABLE || defaults.table,
      batchSize:
        parseInt(process.env.VOILA_LOGGING_DB_BATCH_SIZE) || defaults.batchSize,
      flushInterval:
        parseInt(process.env.VOILA_LOGGING_DB_FLUSH_INTERVAL) ||
        defaults.flushInterval,
    };

    // Merge configuration with priority: defaults < env < direct config
    this.config = {
      ...defaults,
      ...envOverrides,
      ...config,
    };

    // Validate required configuration
    this.validateConfig();

    // Database state
    this.client = null;
    this.connected = false;
    this.batch = [];
    this.flushTimer = null;

    // Initialize database connection
    this.initialize();
  }

  /**
   * Optimize log entry based on scope settings
   * @param {object} entry - Original log entry
   * @returns {object} Optimized log entry
   */
  optimizeLogEntry(entry) {
    if (!this.config.minimal) {
      return entry; // Full scope - keep everything
    }

    // Minimal scope optimization
    return this.createMinimalEntry(entry);
  }

  /**
   * Create minimal log entry for database storage
   * @param {object} entry - Original entry
   * @returns {object} Minimal entry
   */
  createMinimalEntry(entry) {
    const {
      timestamp,
      level,
      message,
      component,
      requestId,
      error,
      userId,
      method,
      url,
      statusCode,
      durationMs,
      ...rest
    } = entry;

    const minimal = {
      timestamp,
      level,
      message,
    };

    // Add essential fields for correlation
    if (component) minimal.component = component;
    if (requestId) minimal.request_id = requestId;
    if (userId) minimal.user_id = userId;

    // Add HTTP context if present
    if (method) minimal.method = method;
    if (url) minimal.url = url;
    if (statusCode) minimal.status_code = statusCode;
    if (durationMs) minimal.duration_ms = durationMs;

    // Add error information if present
    if (error) {
      minimal.error_message = typeof error === 'object' ? error.message : error;
      if (typeof error === 'object' && error.code) {
        minimal.error_code = error.code;
      }
    }

    // Add only essential metadata in minimal mode
    if (this.config.includeMetadata) {
      const essentialMeta = this.filterEssentialMeta(rest);
      if (Object.keys(essentialMeta).length > 0) {
        minimal.meta = essentialMeta;
      }
    }

    return minimal;
  }

  /**
   * Filter metadata to keep only essential fields for database storage
   * @param {object} meta - Original metadata
   * @returns {object} Essential metadata
   */
  filterEssentialMeta(meta) {
    const essential = {};

    // Keep correlation IDs and important context
    const essentialKeys = [
      'traceId',
      'spanId',
      'sessionId',
      'tenantId',
      'appName',
      'ip',
      'userAgent',
    ];

    for (const key of essentialKeys) {
      if (meta[key] !== undefined) {
        essential[key] = meta[key];
      }
    }

    // Include any field ending with 'Id' (correlation)
    for (const [key, value] of Object.entries(meta)) {
      if (key.endsWith('Id') && !essential[key]) {
        essential[key] = value;
      }
    }

    return essential;
  }

  /**
   * Validate database configuration
   */
  validateConfig() {
    if (!this.config.url) {
      throw new Error('Database URL is required for database transport');
    }

    if (!this.isValidDatabaseUrl(this.config.url)) {
      throw new Error(`Invalid database URL: ${this.config.url}`);
    }

    if (this.config.batchSize < 1 || this.config.batchSize > 1000) {
      throw new Error(
        `Invalid batch size: ${this.config.batchSize}. Must be between 1 and 1000`
      );
    }
  }

  /**
   * Validate database URL format
   * @param {string} url - Database URL to validate
   * @returns {boolean} True if valid
   */
  isValidDatabaseUrl(url) {
    try {
      const parsed = new URL(url);
      const validProtocols = ['postgres:', 'postgresql:', 'mysql:', 'sqlite:'];
      return validProtocols.includes(parsed.protocol);
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize database transport
   */
  async initialize() {
    try {
      await this.connect();
      await this.ensureTableExists();
      this.setupBatchFlush();
    } catch (error) {
      console.error('Database transport initialization failed:', error.message);
    }
  }

  /**
   * Connect to database
   */
  async connect() {
    try {
      const url = new URL(this.config.url);

      // Dynamically import appropriate database client
      if (url.protocol.startsWith('postgres')) {
        await this.connectPostgres();
      } else if (url.protocol.startsWith('mysql')) {
        await this.connectMySQL();
      } else if (url.protocol.startsWith('sqlite')) {
        await this.connectSQLite();
      } else {
        throw new Error(`Unsupported database protocol: ${url.protocol}`);
      }

      this.connected = true;
      console.log('Database transport connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      this.connected = false;
    }
  }

  /**
   * Connect to PostgreSQL
   */
  async connectPostgres() {
    try {
      const { default: pg } = await import('pg');
      this.client = new pg.Client({
        connectionString: this.config.url,
        connectionTimeoutMillis: this.config.connectionTimeout,
      });
      await this.client.connect();
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${error.message}`);
    }
  }

  /**
   * Connect to MySQL
   */
  async connectMySQL() {
    try {
      const { default: mysql } = await import('mysql2/promise');
      this.client = await mysql.createConnection(this.config.url);
    } catch (error) {
      throw new Error(`MySQL connection failed: ${error.message}`);
    }
  }

  /**
   * Connect to SQLite
   */
  async connectSQLite() {
    try {
      const { default: sqlite3 } = await import('sqlite3');
      const { open } = await import('sqlite');

      const url = new URL(this.config.url);
      const dbPath = url.pathname || ':memory:';

      this.client = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
    } catch (error) {
      throw new Error(`SQLite connection failed: ${error.message}`);
    }
  }

  /**
   * Ensure logs table exists with optimized schema
   */
  async ensureTableExists() {
    if (!this.connected) return;

    try {
      const createTableSQL = this.getCreateTableSQL();
      await this.executeQuery(createTableSQL);
    } catch (error) {
      console.error('Error creating logs table:', error.message);
    }
  }

  /**
   * Get CREATE TABLE SQL for current database type with scope-optimized schema
   * @returns {string} CREATE TABLE SQL
   */
  getCreateTableSQL() {
    const url = new URL(this.config.url);

    if (url.protocol.startsWith('postgres')) {
      return `
        CREATE TABLE IF NOT EXISTS ${this.config.table} (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL,
          level VARCHAR(10) NOT NULL,
          message TEXT,
          component VARCHAR(100),
          request_id VARCHAR(100),
          user_id VARCHAR(100),
          method VARCHAR(10),
          url TEXT,
          status_code INTEGER,
          duration_ms INTEGER,
          error_message TEXT,
          error_code VARCHAR(50),
          meta JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_timestamp ON ${this.config.table}(timestamp);
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_level ON ${this.config.table}(level);
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_request_id ON ${this.config.table}(request_id);
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_user_id ON ${this.config.table}(user_id);
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_component ON ${this.config.table}(component);
      `;
    } else if (url.protocol.startsWith('mysql')) {
      return `
        CREATE TABLE IF NOT EXISTS ${this.config.table} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          timestamp DATETIME NOT NULL,
          level VARCHAR(10) NOT NULL,
          message TEXT,
          component VARCHAR(100),
          request_id VARCHAR(100),
          user_id VARCHAR(100),
          method VARCHAR(10),
          url TEXT,
          status_code INT,
          duration_ms INT,
          error_message TEXT,
          error_code VARCHAR(50),
          meta JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_timestamp (timestamp),
          INDEX idx_level (level),
          INDEX idx_request_id (request_id),
          INDEX idx_user_id (user_id),
          INDEX idx_component (component)
        );
      `;
    } else {
      return `
        CREATE TABLE IF NOT EXISTS ${this.config.table} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          level TEXT NOT NULL,
          message TEXT,
          component TEXT,
          request_id TEXT,
          user_id TEXT,
          method TEXT,
          url TEXT,
          status_code INTEGER,
          duration_ms INTEGER,
          error_message TEXT,
          error_code TEXT,
          meta TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_timestamp ON ${this.config.table}(timestamp);
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_level ON ${this.config.table}(level);
        CREATE INDEX IF NOT EXISTS idx_${this.config.table}_request_id ON ${this.config.table}(request_id);
      `;
    }
  }

  /**
   * Execute database query with retry logic
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>} Query result
   */
  async executeQuery(sql, params = []) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        if (!this.connected) {
          await this.connect();
        }

        const url = new URL(this.config.url);

        if (url.protocol.startsWith('postgres')) {
          return await this.client.query(sql, params);
        } else if (url.protocol.startsWith('mysql')) {
          return await this.client.execute(sql, params);
        } else {
          return await this.client.run(sql, params);
        }
      } catch (error) {
        lastError = error;
        this.connected = false;

        if (attempt < this.config.retries) {
          const delay = this.config.retryDelay * attempt;
          console.warn(
            `Database query attempt ${attempt} failed, retrying in ${delay}ms:`,
            error.message
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Writes log entry to database (batched)
   * @param {object} entry - Log entry object
   */
  write(entry) {
    try {
      // Optimize entry based on scope settings
      const optimizedEntry = this.optimizeLogEntry(entry);

      // Add to batch
      this.batch.push(optimizedEntry);

      // Flush if batch is full
      if (this.batch.length >= this.config.batchSize) {
        this.flushBatch();
      }
    } catch (error) {
      console.error('Database transport write error:', error.message);
    }
  }

  /**
   * Setup automatic batch flushing
   */
  setupBatchFlush() {
    this.flushTimer = setInterval(() => {
      if (this.batch.length > 0) {
        this.flushBatch();
      }
    }, this.config.flushInterval);
  }

  /**
   * Flush current batch to database
   */
  async flushBatch() {
    if (this.batch.length === 0 || !this.connected) {
      return;
    }

    const currentBatch = [...this.batch];
    this.batch = [];

    try {
      await this.insertBatch(currentBatch);
    } catch (error) {
      console.error('Database batch flush failed:', error.message);

      // Re-add failed entries to batch for retry
      this.batch.unshift(...currentBatch);
    }
  }

  /**
   * Insert batch of log entries
   * @param {Array} entries - Log entries to insert
   */
  async insertBatch(entries) {
    if (entries.length === 0) return;

    const url = new URL(this.config.url);

    if (url.protocol.startsWith('postgres')) {
      await this.insertBatchPostgres(entries);
    } else if (url.protocol.startsWith('mysql')) {
      await this.insertBatchMySQL(entries);
    } else {
      await this.insertBatchSQLite(entries);
    }
  }

  /**
   * Insert batch for PostgreSQL
   * @param {Array} entries - Log entries
   */
  async insertBatchPostgres(entries) {
    const fields = [
      'timestamp',
      'level',
      'message',
      'component',
      'request_id',
      'user_id',
      'method',
      'url',
      'status_code',
      'duration_ms',
      'error_message',
      'error_code',
      'meta',
    ];
    const placeholders = entries
      .map((_, index) => {
        const startIndex = index * fields.length;
        return `(${fields.map((_, fieldIndex) => `$${startIndex + fieldIndex + 1}`).join(', ')})`;
      })
      .join(', ');

    const params = entries.flatMap((entry) => [
      entry.timestamp,
      entry.level,
      entry.message || '',
      entry.component || null,
      entry.request_id || null,
      entry.user_id || null,
      entry.method || null,
      entry.url || null,
      entry.status_code || null,
      entry.duration_ms || null,
      entry.error_message || null,
      entry.error_code || null,
      entry.meta ? JSON.stringify(entry.meta) : null,
    ]);

    const sql = `
      INSERT INTO ${this.config.table} 
      (${fields.join(', ')})
      VALUES ${placeholders}
    `;

    await this.executeQuery(sql, params);
  }

  /**
   * Insert batch for MySQL
   * @param {Array} entries - Log entries
   */
  async insertBatchMySQL(entries) {
    const fields = [
      'timestamp',
      'level',
      'message',
      'component',
      'request_id',
      'user_id',
      'method',
      'url',
      'status_code',
      'duration_ms',
      'error_message',
      'error_code',
      'meta',
    ];
    const placeholders = entries
      .map(() => `(${fields.map(() => '?').join(', ')})`)
      .join(', ');

    const params = entries.flatMap((entry) => [
      entry.timestamp,
      entry.level,
      entry.message || '',
      entry.component || null,
      entry.request_id || null,
      entry.user_id || null,
      entry.method || null,
      entry.url || null,
      entry.status_code || null,
      entry.duration_ms || null,
      entry.error_message || null,
      entry.error_code || null,
      entry.meta ? JSON.stringify(entry.meta) : null,
    ]);

    const sql = `
      INSERT INTO ${this.config.table} 
      (${fields.join(', ')})
      VALUES ${placeholders}
    `;

    await this.executeQuery(sql, params);
  }

  /**
   * Insert batch for SQLite
   * @param {Array} entries - Log entries
   */
  async insertBatchSQLite(entries) {
    const fields = [
      'timestamp',
      'level',
      'message',
      'component',
      'request_id',
      'user_id',
      'method',
      'url',
      'status_code',
      'duration_ms',
      'error_message',
      'error_code',
      'meta',
    ];
    const sql = `
      INSERT INTO ${this.config.table} 
      (${fields.join(', ')})
      VALUES (${fields.map(() => '?').join(', ')})
    `;

    for (const entry of entries) {
      const params = [
        entry.timestamp,
        entry.level,
        entry.message || '',
        entry.component || null,
        entry.request_id || null,
        entry.user_id || null,
        entry.method || null,
        entry.url || null,
        entry.status_code || null,
        entry.duration_ms || null,
        entry.error_message || null,
        entry.error_code || null,
        entry.meta ? JSON.stringify(entry.meta) : null,
      ];

      await this.executeQuery(sql, params);
    }
  }

  /**
   * Check if this transport can handle the given log level
   * @param {string} level - Log level to check
   * @param {string} configLevel - Configured minimum level
   * @returns {boolean} True if level should be logged
   */
  shouldLog(level, configLevel) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[configLevel];
  }

  /**
   * Flush any pending logs
   * @returns {Promise<void>}
   */
  async flush() {
    await this.flushBatch();
  }

  /**
   * Close the database transport
   * @returns {Promise<void>}
   */
  async close() {
    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining logs
    await this.flushBatch();

    // Close database connection
    if (this.client && this.connected) {
      try {
        const url = new URL(this.config.url);

        if (
          url.protocol.startsWith('postgres') ||
          url.protocol.startsWith('mysql')
        ) {
          await this.client.end();
        } else {
          await this.client.close();
        }
      } catch (error) {
        console.error('Error closing database connection:', error.message);
      }
    }

    this.connected = false;
    this.client = null;
  }
}
