/**
 * Console transport with scope-based minimal mode and inline formatting
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/console.js
 */

/**
 * Console transport class with built-in formatting and scope-aware minimal mode
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
      minimal: false,
      showOnlyImportant: false,
      minimalLevel: 'warn',
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

    // Set up minimal mode filtering
    this.minimalLevelValue = this.getLevelValue(this.config.minimalLevel);
  }

  /**
   * Get numeric value for log level
   * @param {string} level - Log level
   * @returns {number} Numeric level value
   */
  getLevelValue(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] || 3;
  }

  /**
   * Check if log should be shown in minimal mode
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} meta - Log metadata
   * @returns {boolean} True if should be shown
   */
  shouldShowInMinimal(level, message, meta) {
    if (!this.config.minimal) {
      return true; // Not in minimal mode, show everything
    }

    const levelValue = this.getLevelValue(level);

    // Always show errors and warnings in minimal mode
    if (levelValue <= this.minimalLevelValue) {
      return true;
    }

    // Show important application events (startup, shutdown, etc.)
    if (this.isImportantMessage(message, meta)) {
      return true;
    }

    return false;
  }

  /**
   * Check if message is considered important for minimal mode
   * @param {string} message - Log message
   * @param {object} meta - Log metadata
   * @returns {boolean} True if important
   */
  isImportantMessage(message, meta) {
    const importantKeywords = [
      // Application lifecycle
      'starting',
      'started',
      'ready',
      'listening',
      'shutdown',
      'stopped',
      'initializing',
      'initialized',
      'complete',

      // VoilaJS specific
      '✨ voilajs',
      '🚀 voilajs',
      '👋 voilajs',
      'voilajs is ready',
      'server:',
      'apps directory:',
      'api routes:',
      'url mapping:',

      // Critical events
      'failed',
      'error',
      'warning',
      'authentication',
      'security',
      'database configured',
      'transport connected',

      // User interactions (but not every request)
      'user login',
      'authentication attempt',
      'signup',
    ];

    const messageStr = (message || '').toLowerCase();

    // Check for important keywords
    if (importantKeywords.some((keyword) => messageStr.includes(keyword))) {
      return true;
    }

    // Check component for important ones
    const component = meta.component || '';
    const importantComponents = [
      'app-init',
      'server-start',
      'shutdown',
      'bootstrap',
      'auth',
      'security',
      'database',
      'error-handler',
    ];

    if (importantComponents.includes(component)) {
      return true;
    }

    return false;
  }

  /**
   * Writes log entry to console
   * @param {object} entry - Log entry object
   */
  write(entry) {
    try {
      const { level, message, ...meta } = entry;

      // Filter in minimal mode
      if (!this.shouldShowInMinimal(level, message, meta)) {
        return;
      }

      let output;

      // Format the log entry based on mode
      if (this.config.minimal) {
        output = this.minimalFormat(entry);
      } else if (this.config.prettyPrint) {
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
   * Minimal format for clean development console
   * @param {object} entry - Log entry
   * @returns {string} Formatted entry
   */
  minimalFormat(entry) {
    const { timestamp, level, message, component, ...meta } = entry;

    // For startup messages, keep them as-is for nice display
    if (
      message &&
      (message.includes('✨') ||
        message.includes('🚀') ||
        message.includes('👋'))
    ) {
      return message;
    }

    // For errors and warnings, show more detail
    if (level === 'error' || level === 'warn') {
      let formatted = `${this.getLevelLabel(level)} ${message}`;

      if (component) {
        formatted += ` [${component}]`;
      }

      // Show error details if present
      if (meta.error) {
        const errorInfo =
          typeof meta.error === 'object'
            ? meta.error.message || meta.error
            : meta.error;
        formatted += `\n  ${errorInfo}`;
      }

      return formatted;
    }

    // For other important messages, keep them simple
    let formatted = message;
    if (component && !message.includes(component)) {
      formatted += ` [${component}]`;
    }

    return formatted;
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
   * Pretty format for development (full scope)
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
