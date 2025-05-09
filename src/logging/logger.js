/**
 * @voilajs/appkit - Logger implementation
 * @module @voilajs/appkit/logging/logger
 */

import { ConsoleTransport } from './transports/console.js';
import { FileTransport } from './transports/file.js';

/**
 * Log levels enumeration
 */
const LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

/**
 * Logger class
 */
export class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.defaultMeta = options.defaultMeta || {};
    this.transports = options.transports || this.getDefaultTransports(options);
    this.levelValue = LogLevels[this.level];
  }

  /**
   * Gets default transports based on environment
   * @private
   * @param {Object} options - Logger options
   * @returns {Array} Default transports
   */
  getDefaultTransports(options) {
    const transports = [];
    
    // Always include console transport
    transports.push(new ConsoleTransport({
      colorize: process.env.NODE_ENV !== 'production',
      prettyPrint: process.env.NODE_ENV === 'development'
    }));
    
    // Add file transport unless explicitly disabled
    if (options.enableFileLogging !== false) {
      transports.push(new FileTransport({
        filename: options.filename,
        dirname: options.dirname,
        retentionDays: options.retentionDays,
        maxSize: options.maxSize
      }));
    }
    
    return transports;
  }

  /**
   * Logs info message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Logs error message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Logs warning message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Logs debug message
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Creates child logger with additional context
   * @param {Object} bindings - Additional context bindings
   * @returns {Logger} Child logger instance
   */
  child(bindings) {
    return new Logger({
      level: this.level,
      defaultMeta: { ...this.defaultMeta, ...bindings },
      transports: this.transports
    });
  }

  /**
   * Core logging method
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Metadata
   */
  log(level, message, meta) {
    // Check if this level should be logged
    if (LogLevels[level] > this.levelValue) {
      return;
    }

    // Create log entry
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.defaultMeta,
      ...meta
    };

    // Send to all transports
    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (error) {
        console.error('Transport error:', error);
      }
    });
  }

  /**
   * Flushes all transports
   * @returns {Promise<void>}
   */
  async flush() {
    await Promise.all(
      this.transports.map(transport => 
        transport.flush ? transport.flush() : Promise.resolve()
      )
    );
  }

  /**
   * Closes all transports
   * @returns {Promise<void>}
   */
  async close() {
    await Promise.all(
      this.transports.map(transport => 
        transport.close ? transport.close() : Promise.resolve()
      )
    );
  }
}

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
export function createLogger(options = {}) {
  return new Logger(options);
}