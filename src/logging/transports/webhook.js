/**
 * Webhook transport for real-time alerts with inline formatting
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/webhook.js
 */

import https from 'https';
import http from 'http';

/**
 * Webhook transport class for real-time alerts and notifications
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
    };

    // Environment overrides
    const envOverrides = {
      url: process.env.VOILA_LOGGING_WEBHOOK_URL,
      level: process.env.VOILA_LOGGING_WEBHOOK_LEVEL || defaults.level,
      timeout:
        parseInt(process.env.VOILA_LOGGING_WEBHOOK_TIMEOUT) || defaults.timeout,
      headers:
        this.parseHeaders(process.env.VOILA_LOGGING_WEBHOOK_HEADERS) ||
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

    // Webhook state
    this.parsedUrl = new URL(this.config.url);
    this.rateLimitQueue = [];

    // Initialize webhook transport
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
      console.warn('Invalid webhook headers JSON format, using defaults');
      return null;
    }
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

      // Send immediately (webhooks are for real-time alerts)
      await this.sendWebhook(entry);

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
   * Format log entry into webhook payload
   * @param {object} entry - Log entry
   * @returns {string} Formatted webhook payload
   */
  formatWebhookPayload(entry) {
    // Different webhook services expect different formats
    const serviceType = this.detectWebhookService();

    switch (serviceType) {
      case 'slack':
        return JSON.stringify(this.formatSlackPayload(entry));

      case 'discord':
        return JSON.stringify(this.formatDiscordPayload(entry));

      case 'teams':
        return JSON.stringify(this.formatTeamsPayload(entry));

      default:
        // Generic webhook format
        return JSON.stringify({
          timestamp: entry.timestamp,
          level: entry.level,
          message: entry.message,
          data: entry,
          alert: {
            severity: this.mapLevelToSeverity(entry.level),
            service: entry.service || 'unknown',
            component: entry.component || 'unknown',
          },
        });
    }
  }

  /**
   * Detect webhook service type based on URL
   * @returns {string} Service type
   */
  detectWebhookService() {
    const hostname = this.parsedUrl.hostname.toLowerCase();

    if (hostname.includes('slack.com')) return 'slack';
    if (hostname.includes('discord.com') || hostname.includes('discordapp.com'))
      return 'discord';
    if (
      hostname.includes('outlook.office.com') ||
      this.parsedUrl.pathname.includes('webhookb2')
    )
      return 'teams';

    return 'generic';
  }

  /**
   * Format payload for Slack webhook
   * @param {object} entry - Log entry
   * @returns {object} Slack-formatted payload
   */
  formatSlackPayload(entry) {
    const color = this.getSlackColor(entry.level);
    const emoji = this.getLevelEmoji(entry.level);

    return {
      text: `${emoji} *${entry.level.toUpperCase()}* Alert`,
      attachments: [
        {
          color: color,
          fields: [
            {
              title: 'Message',
              value: entry.message,
              short: false,
            },
            {
              title: 'Service',
              value: entry.service || 'unknown',
              short: true,
            },
            {
              title: 'Component',
              value: entry.component || 'unknown',
              short: true,
            },
            {
              title: 'Timestamp',
              value: new Date(entry.timestamp).toLocaleString(),
              short: true,
            },
          ],
          footer: 'VoilaJSX AppKit Logging',
          ts: Math.floor(new Date(entry.timestamp).getTime() / 1000),
        },
      ],
    };
  }

  /**
   * Format payload for Discord webhook
   * @param {object} entry - Log entry
   * @returns {object} Discord-formatted payload
   */
  formatDiscordPayload(entry) {
    const color = this.getDiscordColor(entry.level);
    const emoji = this.getLevelEmoji(entry.level);

    return {
      embeds: [
        {
          title: `${emoji} ${entry.level.toUpperCase()} Alert`,
          description: entry.message,
          color: color,
          fields: [
            {
              name: 'Service',
              value: entry.service || 'unknown',
              inline: true,
            },
            {
              name: 'Component',
              value: entry.component || 'unknown',
              inline: true,
            },
            {
              name: 'Timestamp',
              value: new Date(entry.timestamp).toISOString(),
              inline: false,
            },
          ],
          footer: {
            text: 'VoilaJSX AppKit Logging',
          },
          timestamp: entry.timestamp,
        },
      ],
    };
  }

  /**
   * Format payload for Microsoft Teams webhook
   * @param {object} entry - Log entry
   * @returns {object} Teams-formatted payload
   */
  formatTeamsPayload(entry) {
    const color = this.getTeamsColor(entry.level);
    const emoji = this.getLevelEmoji(entry.level);

    return {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: color,
      summary: `${entry.level.toUpperCase()} Alert`,
      sections: [
        {
          activityTitle: `${emoji} ${entry.level.toUpperCase()} Alert`,
          activitySubtitle: entry.message,
          facts: [
            {
              name: 'Service',
              value: entry.service || 'unknown',
            },
            {
              name: 'Component',
              value: entry.component || 'unknown',
            },
            {
              name: 'Timestamp',
              value: new Date(entry.timestamp).toLocaleString(),
            },
          ],
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
   * Get Discord color for log level
   * @param {string} level - Log level
   * @returns {number} Discord color (decimal)
   */
  getDiscordColor(level) {
    const colors = {
      error: 0xff0000, // Red
      warn: 0xffa500, // Orange
      info: 0x00ff00, // Green
      debug: 0x808080, // Gray
    };
    return colors[level] || 0x00ff00;
  }

  /**
   * Get Teams color for log level
   * @param {string} level - Log level
   * @returns {string} Teams color (hex)
   */
  getTeamsColor(level) {
    const colors = {
      error: 'FF0000', // Red
      warn: 'FFA500', // Orange
      info: '00FF00', // Green
      debug: '808080', // Gray
    };
    return colors[level] || '00FF00';
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
