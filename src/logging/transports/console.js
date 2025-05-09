/**
 * @voilajs/appkit - Console transport
 * @module @voilajs/appkit/logging/transports/console
 */

import { BaseTransport } from './base.js';

/**
 * Console transport implementation
 * @extends BaseTransport
 */
export class ConsoleTransport extends BaseTransport {
  constructor(options = {}) {
    super(options);
    this.colorize = options.colorize !== false;
    this.prettyPrint = options.prettyPrint || false;
  }

  /**
   * Logs entry to console
   * @param {Object} entry - Log entry
   */
  log(entry) {
    const { level } = entry;
    let output;

    if (this.prettyPrint) {
      output = this.prettyFormat(entry);
    } else {
      output = this.format(entry);
    }

    // Apply colors if enabled
    if (this.colorize) {
      output = this.applyColor(output, level);
    }

    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  /**
   * Pretty format for development
   * @param {Object} entry - Log entry
   * @returns {string} Formatted entry
   */
  prettyFormat(entry) {
    const { timestamp, level, message, ...meta } = entry;
    let formatted = `${timestamp} ${this.getLevelLabel(level)} ${message}`;
    
    if (Object.keys(meta).length > 0) {
      formatted += '\n' + JSON.stringify(meta, null, 2);
    }
    
    return formatted;
  }

  /**
   * Apply color to output
   * @param {string} output - Output string
   * @param {string} level - Log level
   * @returns {string} Colored output
   */
  applyColor(output, level) {
    const colors = {
      error: '\x1b[31m',  // Red
      warn: '\x1b[33m',   // Yellow
      info: '\x1b[36m',   // Cyan
      debug: '\x1b[90m'   // Gray
    };
    const reset = '\x1b[0m';
    
    return `${colors[level] || ''}${output}${reset}`;
  }

  /**
   * Get level label with emoji
   * @param {string} level - Log level
   * @returns {string} Level label
   */
  getLevelLabel(level) {
    const labels = {
      error: '❌ ERROR',
      warn: '⚠️  WARN',
      info: 'ℹ️  INFO',
      debug: '🐛 DEBUG'
    };
    
    return labels[level] || level.toUpperCase();
  }
}