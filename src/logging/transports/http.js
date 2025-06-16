/**
 * HTTP transport with batching, retry logic and inline utilities
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/http.js
 */

import https from 'https';
import http from 'http';

/**
 * HTTP transport class for sending logs to external services
 */
export class HttpTransport {
  /**
   * Creates a new HTTP transport
   * @param {object} [config={}] - HTTP transport configuration
   */
  constructor(config = {}) {
    // Transport defaults
    const defaults = {
      batchSize: 50,
      flushInterval: 10000,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VoilaJSX-AppKit-Logging/1.0.0',
      },
      method: 'POST',
    };

    // Environment overrides
    const envOverrides = {
      url: process.env.VOILA_LOGGING_HTTP_URL,
      batchSize:
        parseInt(process.env.VOILA_LOGGING_HTTP_BATCH_SIZE) ||
        defaults.batchSize,
      flushInterval:
        parseInt(process.env.VOILA_LOGGING_HTTP_FLUSH_INTERVAL) ||
        defaults.flushInterval,
      timeout:
        parseInt(process.env.VOILA_LOGGING_HTTP_TIMEOUT) || defaults.timeout,
      headers:
        this.parseHeaders(process.env.VOILA_LOGGING_HTTP_HEADERS) ||
        defaults.headers,
    };

    // Merge configuration with priority: defaults < env < direct config
    this.config = {
      ...defaults,
      ...envOverrides,
      ...config,
    };

    // Validate required configuration
    this.validateConfig();

    // HTTP state
    this.batch = [];
    this.flushTimer = null;
    this.parsedUrl = new URL(this.config.url);

    // Initialize HTTP transport
    this.initialize();
  }

  /**
   * Parse headers from environment variable or string
   * @param {string} headersStr - Headers string (JSON format)
   * @returns {object|null} Parsed headers object
   */
  parseHeaders(headersStr) {
    if (!headersStr) return null;

    try {
      return JSON.parse(headersStr);
    } catch (error) {
      console.warn('Invalid HTTP headers JSON format, using defaults');
      return null;
    }
  }

  /**
   * Validate HTTP transport configuration
   */
  validateConfig() {
    if (!this.config.url) {
      throw new Error('HTTP URL is required for HTTP transport');
    }

    if (!this.isValidHttpUrl(this.config.url)) {
      throw new Error(`Invalid HTTP URL: ${this.config.url}`);
    }

    if (this.config.batchSize < 1 || this.config.batchSize > 1000) {
      throw new Error(
        `Invalid batch size: ${this.config.batchSize}. Must be between 1 and 1000`
      );
    }

    if (this.config.timeout < 1000 || this.config.timeout > 300000) {
      throw new Error(
        `Invalid timeout: ${this.config.timeout}. Must be between 1000ms and 300000ms`
      );
    }
  }

  /**
   * Validate HTTP URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid HTTP/HTTPS URL
   */
  isValidHttpUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize HTTP transport
   */
  initialize() {
    this.setupBatchFlush();
  }

  /**
   * Writes log entry to HTTP endpoint (batched)
   * @param {object} entry - Log entry object
   */
  write(entry) {
    try {
      // Add to batch
      this.batch.push(entry);

      // Flush if batch is full
      if (this.batch.length >= this.config.batchSize) {
        this.flushBatch();
      }
    } catch (error) {
      console.error('HTTP transport write error:', error.message);
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
   * Flush current batch to HTTP endpoint
   */
  async flushBatch() {
    if (this.batch.length === 0) {
      return;
    }

    const currentBatch = [...this.batch];
    this.batch = [];

    try {
      await this.sendBatch(currentBatch);
    } catch (error) {
      console.error('HTTP batch flush failed:', error.message);

      // Re-add failed entries to batch for retry (up to original batch size)
      const retryEntries = currentBatch.slice(0, this.config.batchSize);
      this.batch.unshift(...retryEntries);
    }
  }

  /**
   * Send batch of log entries via HTTP
   * @param {Array} entries - Log entries to send
   */
  async sendBatch(entries) {
    if (entries.length === 0) return;

    const payload = this.formatPayload(entries);
    await this.makeHttpRequest(payload);
  }

  /**
   * Format log entries into HTTP payload
   * @param {Array} entries - Log entries
   * @returns {string} Formatted JSON payload
   */
  formatPayload(entries) {
    // Different services expect different formats
    const serviceType = this.detectServiceType();

    switch (serviceType) {
      case 'datadog':
        return JSON.stringify({
          logs: entries.map((entry) => ({
            timestamp: entry.timestamp,
            level: entry.level,
            message: entry.message,
            attributes: { ...entry },
          })),
        });

      case 'elasticsearch':
        return (
          entries
            .map(
              (entry) =>
                JSON.stringify({ index: {} }) + '\n' + JSON.stringify(entry)
            )
            .join('\n') + '\n'
        );

      case 'splunk':
        return entries
          .map((entry) =>
            JSON.stringify({
              time: new Date(entry.timestamp).getTime() / 1000,
              event: entry,
            })
          )
          .join('\n');

      default:
        // Generic format - array of log entries
        return JSON.stringify({ logs: entries });
    }
  }

  /**
   * Detect service type based on URL for format optimization
   * @returns {string} Service type
   */
  detectServiceType() {
    const hostname = this.parsedUrl.hostname.toLowerCase();

    if (hostname.includes('datadog')) return 'datadog';
    if (
      hostname.includes('elastic') ||
      this.parsedUrl.pathname.includes('_bulk')
    )
      return 'elasticsearch';
    if (hostname.includes('splunk')) return 'splunk';

    return 'generic';
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} payload - Request payload
   */
  async makeHttpRequest(payload) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        await this.executeHttpRequest(payload);
        return; // Success
      } catch (error) {
        lastError = error;

        if (attempt < this.config.retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(
            `HTTP request attempt ${attempt} failed, retrying in ${delay}ms:`,
            error.message
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute single HTTP request
   * @param {string} payload - Request payload
   * @returns {Promise<void>}
   */
  executeHttpRequest(payload) {
    return new Promise((resolve, reject) => {
      const isHttps = this.parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: this.parsedUrl.hostname,
        port: this.parsedUrl.port || (isHttps ? 443 : 80),
        path: this.parsedUrl.pathname + this.parsedUrl.search,
        method: this.config.method,
        headers: {
          ...this.config.headers,
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: this.config.timeout,
      };

      const req = httpModule.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(
          new Error(`HTTP request timeout after ${this.config.timeout}ms`)
        );
      });

      req.on('error', (error) => {
        reject(new Error(`HTTP request failed: ${error.message}`));
      });

      // Write payload and end request
      req.write(payload);
      req.end();
    });
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
   * Close the HTTP transport
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
  }
}
