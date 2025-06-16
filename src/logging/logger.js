/**
 * Core logger class with transport manager and built-in functionality
 * @module @voilajsx/appkit/logging
 * @file src/logging/logger.js
 */

import { ConsoleTransport } from './transports/console.js';
import { FileTransport } from './transports/file.js';
import { DatabaseTransport } from './transports/database.js';
import { HttpTransport } from './transports/http.js';
import { WebhookTransport } from './transports/webhook.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Logger class with built-in transport management
 */
export class LoggerClass {
  /**
   * Creates a new Logger instance
   * @param {object} [options={}] - Logger configuration
   */
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.defaultMeta = options.defaultMeta || {};
    this.levelValue = LOG_LEVELS[this.level];
    this.config = options;

    // Initialize transports
    this.transports = new Map();
    this.initializeTransports();
  }

  /**
   * Initialize all enabled transports
   */
  initializeTransports() {
    const enabledTransports = this.config.transports || ['console', 'file'];

    for (const transportName of enabledTransports) {
      try {
        const transport = this.createTransport(transportName);
        if (transport) {
          this.transports.set(transportName, transport);
        }
      } catch (error) {
        console.error(
          `Failed to initialize ${transportName} transport:`,
          error.message
        );
      }
    }

    if (this.transports.size === 0) {
      console.warn('No transports initialized, falling back to console');
      this.transports.set('console', new ConsoleTransport());
    }
  }

  /**
   * Create transport instance based on name
   * @param {string} name - Transport name
   * @returns {object|null} Transport instance
   */
  createTransport(name) {
    const transportConfig = this.config[name] || {};

    // Skip disabled transports
    if (transportConfig.enabled === false) {
      return null;
    }

    switch (name) {
      case 'console':
        return new ConsoleTransport(transportConfig);

      case 'file':
        return new FileTransport(transportConfig);

      case 'database':
        if (!transportConfig.url) {
          console.warn('Database transport skipped: no URL configured');
          return null;
        }
        return new DatabaseTransport(transportConfig);

      case 'http':
        if (!transportConfig.url) {
          console.warn('HTTP transport skipped: no URL configured');
          return null;
        }
        return new HttpTransport(transportConfig);

      case 'webhook':
        if (!transportConfig.url) {
          console.warn('Webhook transport skipped: no URL configured');
          return null;
        }
        return new WebhookTransport(transportConfig);

      default:
        console.warn(`Unknown transport: ${name}`);
        return null;
    }
  }

  /**
   * Logs info message
   * @param {string} message - Log message
   * @param {object} [meta={}] - Additional metadata
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Logs error message
   * @param {string} message - Log message
   * @param {object} [meta={}] - Additional metadata
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Logs warning message
   * @param {string} message - Log message
   * @param {object} [meta={}] - Additional metadata
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Logs debug message
   * @param {string} message - Log message
   * @param {object} [meta={}] - Additional metadata
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Creates child logger with additional context
   * @param {object} bindings - Additional context bindings
   * @returns {LoggerClass} Child logger instance
   */
  child(bindings) {
    const child = Object.create(this);
    child.defaultMeta = { ...this.defaultMeta, ...bindings };
    return child;
  }

  /**
   * Core logging method
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} meta - Metadata
   */
  log(level, message, meta) {
    // Skip if level is too low
    if (LOG_LEVELS[level] > this.levelValue) {
      return;
    }

    // Normalize inputs
    if (message === undefined) {
      message = '';
    }

    if (meta === null) {
      meta = {};
    }

    // Create log entry
    const entry = this.createLogEntry(level, message, meta);

    // Send to all transports
    this.writeToTransports(entry);
  }

  /**
   * Create standardized log entry
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} meta - Metadata
   * @returns {object} Log entry object
   */
  createLogEntry(level, message, meta) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.defaultMeta,
      ...meta,
    };
  }

  /**
   * Write log entry to all transports
   * @param {object} entry - Log entry
   */
  writeToTransports(entry) {
    const writePromises = [];

    for (const [name, transport] of this.transports) {
      try {
        // Check if transport should handle this level
        if (
          transport.shouldLog &&
          !transport.shouldLog(entry.level, this.level)
        ) {
          continue;
        }

        // Write to transport (may be async)
        const writeResult = transport.write(entry);

        // Collect promises for potential waiting
        if (writeResult && typeof writeResult.then === 'function') {
          writePromises.push(
            writeResult.catch((error) => {
              console.error(`Transport ${name} write failed:`, error.message);
            })
          );
        }
      } catch (error) {
        console.error(`Transport ${name} write error:`, error.message);
      }
    }

    // Store promises for potential flushing
    this._pendingWrites = writePromises;
  }

  /**
   * Wait for all pending writes to complete
   * @returns {Promise<void>}
   */
  async waitForWrites() {
    if (this._pendingWrites && this._pendingWrites.length > 0) {
      try {
        await Promise.all(this._pendingWrites);
      } catch (error) {
        // Errors already handled in writeToTransports
      }
      this._pendingWrites = [];
    }
  }

  /**
   * Flushes all pending logs across all transports
   * @returns {Promise<void>}
   */
  async flush() {
    // Wait for any pending writes first
    await this.waitForWrites();

    // Flush all transports
    const flushPromises = [];

    for (const [name, transport] of this.transports) {
      if (transport.flush && typeof transport.flush === 'function') {
        try {
          const flushResult = transport.flush();
          if (flushResult && typeof flushResult.then === 'function') {
            flushPromises.push(
              flushResult.catch((error) => {
                console.error(`Transport ${name} flush failed:`, error.message);
              })
            );
          }
        } catch (error) {
          console.error(`Transport ${name} flush error:`, error.message);
        }
      }
    }

    if (flushPromises.length > 0) {
      await Promise.all(flushPromises);
    }
  }

  /**
   * Closes all transports and cleans up resources
   * @returns {Promise<void>}
   */
  async close() {
    // Wait for pending writes
    await this.waitForWrites();

    // Flush all transports first
    await this.flush();

    // Close all transports
    const closePromises = [];

    for (const [name, transport] of this.transports) {
      if (transport.close && typeof transport.close === 'function') {
        try {
          const closeResult = transport.close();
          if (closeResult && typeof closeResult.then === 'function') {
            closePromises.push(
              closeResult.catch((error) => {
                console.error(`Transport ${name} close failed:`, error.message);
              })
            );
          }
        } catch (error) {
          console.error(`Transport ${name} close error:`, error.message);
        }
      }
    }

    if (closePromises.length > 0) {
      await Promise.all(closePromises);
    }

    // Clear transports
    this.transports.clear();
  }

  /**
   * Get list of active transport names
   * @returns {string[]} Array of active transport names
   */
  getActiveTransports() {
    return Array.from(this.transports.keys());
  }

  /**
   * Check if a specific transport is active
   * @param {string} name - Transport name
   * @returns {boolean} True if transport is active
   */
  hasTransport(name) {
    return this.transports.has(name);
  }

  /**
   * Get transport instance by name (for advanced usage)
   * @param {string} name - Transport name
   * @returns {object|null} Transport instance or null
   */
  getTransport(name) {
    return this.transports.get(name) || null;
  }

  /**
   * Add a custom transport at runtime
   * @param {string} name - Transport name
   * @param {object} transport - Transport instance
   */
  addTransport(name, transport) {
    if (!transport || typeof transport.write !== 'function') {
      throw new Error('Transport must have a write method');
    }

    this.transports.set(name, transport);
  }

  /**
   * Remove a transport at runtime
   * @param {string} name - Transport name
   * @returns {Promise<void>}
   */
  async removeTransport(name) {
    const transport = this.transports.get(name);
    if (transport) {
      // Flush and close the transport
      if (transport.flush && typeof transport.flush === 'function') {
        try {
          await transport.flush();
        } catch (error) {
          console.error(`Error flushing transport ${name}:`, error.message);
        }
      }

      if (transport.close && typeof transport.close === 'function') {
        try {
          await transport.close();
        } catch (error) {
          console.error(`Error closing transport ${name}:`, error.message);
        }
      }

      this.transports.delete(name);
    }
  }

  /**
   * Update log level at runtime
   * @param {string} level - New log level
   */
  setLevel(level) {
    if (!LOG_LEVELS.hasOwnProperty(level)) {
      throw new Error(
        `Invalid log level: ${level}. Must be one of: ${Object.keys(LOG_LEVELS).join(', ')}`
      );
    }

    this.level = level;
    this.levelValue = LOG_LEVELS[level];
  }

  /**
   * Get current log level
   * @returns {string} Current log level
   */
  getLevel() {
    return this.level;
  }

  /**
   * Check if a specific level would be logged
   * @param {string} level - Log level to check
   * @returns {boolean} True if level would be logged
   */
  isLevelEnabled(level) {
    return LOG_LEVELS[level] <= this.levelValue;
  }
}
