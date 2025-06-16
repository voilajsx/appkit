/**
 * Console transport with inline formatting and color support
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/console.js
 */

/**
 * Console transport class with built-in formatting
 */
export class ConsoleTransport {
  /**
   * Creates a new Console transport
   * @param {object} [config={}] - Console transport configuration
   */
  constructor(config = {}) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Transport defaults
    const defaults = {
      colorize: !isProduction,
      prettyPrint: isDevelopment,
      timestamps: true,
    };

    // Environment overrides
    const envOverrides = {
      colorize:
        process.env.VOILA_LOGGING_CONSOLE_COLORIZE !== 'false'
          ? defaults.colorize
          : false,
      prettyPrint:
        process.env.VOILA_LOGGING_CONSOLE_PRETTY !== 'false'
          ? defaults.prettyPrint
          : false,
    };

    // Merge configuration with priority: defaults < env < direct config
    this.config = {
      ...defaults,
      ...envOverrides,
      ...config,
    };
  }

  /**
   * Writes log entry to console
   * @param {object} entry - Log entry object
   */
  write(entry) {
    try {
      const { level } = entry;
      let output;

      // Format the log entry
      if (this.config.prettyPrint) {
        output = this.prettyFormat(entry);
      } else {
        output = this.standardFormat(entry);
      }

      // Apply colors if enabled
      if (this.config.colorize) {
        output = this.applyColor(output, level);
      }

      // Output to appropriate console method
      this.outputToConsole(output, level);
    } catch (error) {
      // Fallback - never let logging break the application
      console.error('Console transport error:', error.message);
    }
  }

  /**
   * Standard format for production logs
   * @param {object} entry - Log entry
   * @returns {string} Formatted entry
   */
  standardFormat(entry) {
    const { timestamp, level, message, ...meta } = entry;
    let formatted = '';

    // Add timestamp if enabled
    if (this.config.timestamps) {
      formatted += `${timestamp} `;
    }

    // Add level
    formatted += `[${level.toUpperCase()}] `;

    // Add message
    formatted += message;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      formatted += ` ${JSON.stringify(meta)}`;
    }

    return formatted;
  }

  /**
   * Pretty format for development
   * @param {object} entry - Log entry
   * @returns {string} Formatted entry
   */
  prettyFormat(entry) {
    const { timestamp, level, message, ...meta } = entry;
    let formatted = '';

    // Add timestamp if enabled
    if (this.config.timestamps) {
      formatted += `${timestamp} `;
    }

    // Add level with emoji
    formatted += `${this.getLevelLabel(level)} `;

    // Add message
    formatted += message;

    // Add pretty-printed metadata if present
    if (Object.keys(meta).length > 0) {
      formatted += '\n' + JSON.stringify(meta, null, 2);
    }

    return formatted;
  }

  /**
   * Get level label with emoji for pretty printing
   * @param {string} level - Log level
   * @returns {string} Level label with emoji
   */
  getLevelLabel(level) {
    const labels = {
      error: '❌ ERROR',
      warn: '⚠️  WARN',
      info: 'ℹ️  INFO',
      debug: '🐛 DEBUG',
    };

    return labels[level] || level.toUpperCase();
  }

  /**
   * Apply ANSI color codes to output
   * @param {string} output - Output string
   * @param {string} level - Log level
   * @returns {string} Colored output
   */
  applyColor(output, level) {
    const colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      info: '\x1b[36m', // Cyan
      debug: '\x1b[90m', // Gray
    };
    const reset = '\x1b[0m';

    const color = colors[level] || '';
    return `${color}${output}${reset}`;
  }

  /**
   * Output to appropriate console method based on level
   * @param {string} output - Formatted output
   * @param {string} level - Log level
   */
  outputToConsole(output, level) {
    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        // Use console.debug if available, fallback to console.log
        if (typeof console.debug === 'function') {
          console.debug(output);
        } else {
          console.log(output);
        }
        break;
      default:
        console.log(output);
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
   * Close the transport (no-op for console)
   * @returns {Promise<void>}
   */
  async close() {
    // Console transport doesn't need cleanup
    return Promise.resolve();
  }

  /**
   * Flush pending logs (no-op for console)
   * @returns {Promise<void>}
   */
  async flush() {
    // Console transport writes immediately
    return Promise.resolve();
  }
}
