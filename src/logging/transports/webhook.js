/**
 * Webhook transport with scope-based optimization for real-time alerts
 * Supports: Slack and Generic webhooks only
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/webhook.js
 */

import https from 'https';
import http from 'http';

/**
 * Webhook transport class for real-time alerts and notifications with scope optimization
 */
export class WebhookTransport {
  /**
   * Creates a new Webhook transport
   * @param {object} [config={}] - Webhook transport configuration
   */
  constructor(config = {}) {
    // Transport defaults
    const defaults = {
      level: 'error', // Only send errors by default
      timeout: 10000,
      retries: 2,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VoilaJSX-AppKit-Logging/1.0.0',
      },
      method: 'POST',
      rateLimit: 10, // Max 10 webhooks per minute
      rateLimitWindow: 60000, // 1 minute window

      // Scope-based optimization
      minimal: false,
      includeMetadata: true,
    };

    // Environment overrides (simplified)
    const envOverrides = {
      url: process.env.VOILA_LOGGING_WEBHOOK_URL,
    };

    // Merge configuration with priority: defaults < env < direct config
    this.config = {
      ...defaults,
      ...envOverrides,
      ...config,
    };

    // Adjust level based on scope - minimal mode is more restrictive
    if (this.config.minimal && this.config.level !== 'error') {
      this.config.level = 'error'; // Force error-only in minimal mode
    }

    // Adjust rate limiting based on scope
    if (this.config.minimal) {
      this.config.rateLimit = Math.min(this.config.rateLimit, 5); // Max 5 webhooks in minimal
    }

    // Validate required configuration
    this.validateConfig();

    // Webhook state
    this.parsedUrl = new URL(this.config.url);
    this.rateLimitQueue = [];

    // Initialize webhook transport
    this.initialize();
  }

  /**
   * Optimize log entry based on scope settings
   * @param {object} entry - Original log entry
   * @returns {object} Optimized log entry for webhook
   */
  optimizeLogEntry(entry) {
    if (!this.config.minimal) {
      return entry; // Full scope - keep everything
    }

    // Minimal scope optimization for webhooks
    return this.createMinimalEntry(entry);
  }

  /**
   * Create minimal log entry for webhook alerts
   * @param {object} entry - Original entry
   * @returns {object} Minimal entry optimized for alerts
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
      ...rest
    } = entry;

    const minimal = {
      timestamp,
      level,
      message,
    };

    // Add essential context for alerts
    if (component) minimal.component = component;
    if (requestId) minimal.requestId = requestId;
    if (userId) minimal.userId = userId;

    // Add HTTP context if it's an error (important for debugging)
    if (level === 'error' && method) minimal.method = method;
    if (level === 'error' && url) minimal.url = url;
    if (level === 'error' && statusCode) minimal.statusCode = statusCode;

    // Add error information (critical for alerts)
    if (error) {
      minimal.error = this.optimizeError(error);
    }

    // Add only critical metadata for alerts
    if (this.config.includeMetadata) {
      const criticalMeta = this.filterCriticalMeta(rest);
      if (Object.keys(criticalMeta).length > 0) {
        minimal.meta = criticalMeta;
      }
    }

    return minimal;
  }

  /**
   * Optimize error object for webhook alerts
   * @param {object|string} error - Error object or string
   * @returns {object|string} Optimized error for alerts
   */
  optimizeError(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'object') {
      const optimized = {
        message: error.message,
      };

      // Add important error fields for debugging alerts
      if (error.name && error.name !== 'Error') {
        optimized.name = error.name;
      }

      if (error.code) {
        optimized.code = error.code;
      }

      if (error.statusCode) {
        optimized.statusCode = error.statusCode;
      }

      // Don't include stack traces in webhooks for security and brevity
      return optimized;
    }

    return error;
  }

  /**
   * Filter metadata to keep only critical fields for alerts
   * @param {object} meta - Original metadata
   * @returns {object} Critical metadata for alerts
   */
  filterCriticalMeta(meta) {
    const critical = {};

    // Keep only the most critical fields for alerts
    const criticalKeys = [
      'service',
      'environment',
      'version',
      'tenantId',
      'appName',
    ];

    for (const key of criticalKeys) {
      if (meta[key] !== undefined) {
        critical[key] = meta[key];
      }
    }

    return critical;
  }

  /**
   * Validate webhook transport configuration
   */
  validateConfig() {
    if (!this.config.url) {
      throw new Error('Webhook URL is required for webhook transport');
    }

    if (!this.isValidHttpUrl(this.config.url)) {
      throw new Error(`Invalid webhook URL: ${this.config.url}`);
    }

    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLevels.includes(this.config.level)) {
      throw new Error(
        `Invalid webhook level: ${this.config.level}. Must be one of: ${validLevels.join(', ')}`
      );
    }

    if (this.config.timeout < 1000 || this.config.timeout > 60000) {
      throw new Error(
        `Invalid timeout: ${this.config.timeout}. Must be between 1000ms and 60000ms`
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
   * Initialize webhook transport
   */
  initialize() {
    this.setupRateLimitCleanup();
  }

  /**
   * Setup rate limit cleanup
   */
  setupRateLimitCleanup() {
    setInterval(() => {
      const now = Date.now();
      this.rateLimitQueue = this.rateLimitQueue.filter(
        (timestamp) => now - timestamp < this.config.rateLimitWindow
      );
    }, this.config.rateLimitWindow);
  }

  /**
   * Writes log entry to webhook (immediate, level-filtered)
   * @param {object} entry - Log entry object
   */
  async write(entry) {
    try {
      // Check if this level should be sent
      if (!this.shouldSendLevel(entry.level)) {
        return;
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        console.warn('Webhook rate limit exceeded, dropping log entry');
        return;
      }

      // Optimize entry based on scope settings
      const optimizedEntry = this.optimizeLogEntry(entry);

      // Send immediately (webhooks are for real-time alerts)
      await this.sendWebhook(optimizedEntry);

      // Track rate limit
      this.rateLimitQueue.push(Date.now());
    } catch (error) {
      console.error('Webhook transport write error:', error.message);
    }
  }

  /**
   * Check if log level should be sent to webhook
   * @param {string} level - Log level to check
   * @returns {boolean} True if level should be sent
   */
  shouldSendLevel(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const configLevel = levels[this.config.level];
    const entryLevel = levels[level];

    return entryLevel <= configLevel;
  }

  /**
   * Check rate limiting
   * @returns {boolean} True if within rate limit
   */
  checkRateLimit() {
    const now = Date.now();
    const recentWebhooks = this.rateLimitQueue.filter(
      (timestamp) => now - timestamp < this.config.rateLimitWindow
    );

    return recentWebhooks.length < this.config.rateLimit;
  }

  /**
   * Send log entry via webhook
   * @param {object} entry - Log entry to send
   */
  async sendWebhook(entry) {
    const payload = this.formatWebhookPayload(entry);
    await this.makeHttpRequest(payload);
  }

  /**
   * Format log entry into webhook payload (Slack + Generic only)
   * @param {object} entry - Log entry
   * @returns {string} Formatted webhook payload
   */
  formatWebhookPayload(entry) {
    // Detect service type: slack or generic
    const serviceType = this.detectWebhookService();

    switch (serviceType) {
      case 'slack':
        return JSON.stringify(this.formatSlackPayload(entry));

      default:
        // Generic webhook format with scope indication
        return JSON.stringify({
          timestamp: entry.timestamp,
          level: entry.level,
          message: entry.message,
          scope: this.config.minimal ? 'minimal' : 'full',
          data: entry,
          alert: {
            severity: this.mapLevelToSeverity(entry.level),
            service: entry.service || entry.meta?.service || 'unknown',
            component: entry.component || 'unknown',
          },
        });
    }
  }

  /**
   * Detect webhook service type based on URL (Slack only)
   * @returns {string} Service type
   */
  detectWebhookService() {
    const hostname = this.parsedUrl.hostname.toLowerCase();

    if (hostname.includes('slack.com')) return 'slack';

    return 'generic';
  }

  /**
   * Format payload for Slack webhook with scope optimization
   * @param {object} entry - Log entry
   * @returns {object} Slack-formatted payload
   */
  formatSlackPayload(entry) {
    const color = this.getSlackColor(entry.level);
    const emoji = this.getLevelEmoji(entry.level);
    const scopeLabel = this.config.minimal ? '🔹' : '🔸';

    const fields = [
      {
        title: 'Message',
        value: entry.message,
        short: false,
      },
    ];

    // Add essential fields based on scope
    if (entry.component) {
      fields.push({
        title: 'Component',
        value: entry.component,
        short: true,
      });
    }

    if (entry.service || entry.meta?.service) {
      fields.push({
        title: 'Service',
        value: entry.service || entry.meta?.service,
        short: true,
      });
    }

    // Add error details if present
    if (entry.error) {
      const errorText =
        typeof entry.error === 'object' ? entry.error.message : entry.error;
      fields.push({
        title: 'Error',
        value: errorText,
        short: false,
      });
    }

    // Add HTTP context for errors
    if (
      entry.level === 'error' &&
      (entry.method || entry.url || entry.statusCode)
    ) {
      let httpInfo = '';
      if (entry.method && entry.url) httpInfo += `${entry.method} ${entry.url}`;
      if (entry.statusCode) httpInfo += ` (${entry.statusCode})`;

      if (httpInfo) {
        fields.push({
          title: 'HTTP',
          value: httpInfo,
          short: true,
        });
      }
    }

    return {
      text: `${scopeLabel} ${emoji} *${entry.level.toUpperCase()}* Alert`,
      attachments: [
        {
          color: color,
          fields: fields,
          footer: 'VoilaJSX AppKit Logging',
          ts: Math.floor(new Date(entry.timestamp).getTime() / 1000),
        },
      ],
    };
  }

  /**
   * Get Slack color for log level
   * @param {string} level - Log level
   * @returns {string} Slack color
   */
  getSlackColor(level) {
    const colors = {
      error: 'danger',
      warn: 'warning',
      info: 'good',
      debug: '#36a64f',
    };
    return colors[level] || 'good';
  }

  /**
   * Get emoji for log level
   * @param {string} level - Log level
   * @returns {string} Emoji
   */
  getLevelEmoji(level) {
    const emojis = {
      error: '🚨',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🐛',
    };
    return emojis[level] || 'ℹ️';
  }

  /**
   * Map log level to alert severity
   * @param {string} level - Log level
   * @returns {string} Severity level
   */
  mapLevelToSeverity(level) {
    const severityMap = {
      error: 'critical',
      warn: 'warning',
      info: 'info',
      debug: 'low',
    };
    return severityMap[level] || 'info';
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
          const delay = this.config.retryDelay * attempt;
          console.warn(
            `Webhook attempt ${attempt} failed, retrying in ${delay}ms:`,
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
            reject(
              new Error(`Webhook HTTP ${res.statusCode}: ${responseData}`)
            );
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Webhook timeout after ${this.config.timeout}ms`));
      });

      req.on('error', (error) => {
        reject(new Error(`Webhook request failed: ${error.message}`));
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
    // Webhook uses its own level filtering
    return this.shouldSendLevel(level);
  }

  /**
   * Flush any pending logs (no-op for webhook - immediate sending)
   * @returns {Promise<void>}
   */
  async flush() {
    // Webhooks send immediately, no batching
    return Promise.resolve();
  }

  /**
   * Close the webhook transport
   * @returns {Promise<void>}
   */
  async close() {
    // Webhook transport doesn't need cleanup
    return Promise.resolve();
  }
}
