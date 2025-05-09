/**
 * @voilajs/appkit - Base transport interface
 * @module @voilajs/appkit/logging/transports/base
 */

/**
 * Base transport class
 * @abstract
 */
export class BaseTransport {
    constructor(options = {}) {
      this.options = options;
    }
  
    /**
     * Logs an entry
     * @abstract
     * @param {Object} entry - Log entry
     */
    log(entry) {
      throw new Error('log() must be implemented by transport');
    }
  
    /**
     * Formats log entry
     * @param {Object} entry - Log entry
     * @returns {string} Formatted entry
     */
    format(entry) {
      const { timestamp, level, message, ...meta } = entry;
      let formatted = `${timestamp} [${level.toUpperCase()}] ${message}`;
      
      if (Object.keys(meta).length > 0) {
        formatted += ` ${JSON.stringify(meta)}`;
      }
      
      return formatted;
    }
  }