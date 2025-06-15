/**
 * Core logger class with built-in console and file logging
 * @module @voilajsx/appkit/logging
 * @file src/logging/logger.js
 */

import fs from 'fs';
import path from 'path';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Logger class with built-in console and file support
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

    // Console options
    this.colorize = options.colorize !== false;
    this.prettyPrint = options.prettyPrint || false;

    // File options
    this.enableFileLogging = options.enableFileLogging !== false;
    this.dirname = options.dirname || 'logs';
    this.filename = options.filename || 'app.log';
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.retentionDays = options.retentionDays ?? 7;

    // File state
    this.currentSize = 0;
    this.currentDate = this.getCurrentDate();
    this.stream = null;

    if (this.enableFileLogging) {
      this.setupFileLogging();
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
    if (LOG_LEVELS[level] > this.levelValue) {
      return;
    }

    if (message === undefined) {
      message = '';
    }

    if (meta === null) {
      meta = {};
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.defaultMeta,
      ...meta,
    };

    try {
      this.writeToConsole(entry);

      if (this.enableFileLogging && this.stream) {
        this.writeToFile(entry);
      }
    } catch (error) {
      console.error('Logging error:', error);
    }
  }

  /**
   * Writes log entry to console
   * @param {object} entry - Log entry
   */
  writeToConsole(entry) {
    const { level } = entry;
    let output;

    if (this.prettyPrint) {
      output = this.prettyFormat(entry);
    } else {
      output = this.format(entry);
    }

    if (this.colorize) {
      output = this.applyColor(output, level);
    }

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
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
   * Writes log entry to file
   * @param {object} entry - Log entry
   */
  async writeToFile(entry) {
    try {
      await this.checkRotation();

      if (!this.stream || !this.stream.writable) {
        this.createStream();
      }

      const line = JSON.stringify(entry) + '\n';
      const size = Buffer.byteLength(line);

      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Log write timed out after 5000ms');
          resolve();
        }, 5000);

        this.stream.write(line, (error) => {
          clearTimeout(timeout);
          if (error) {
            console.error('Error writing to log file:', error);
            this.stream = null;
          } else {
            this.currentSize += size;
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('Error logging to file:', error);
    }
  }

  /**
   * Formats log entry into human-readable string
   * @param {object} entry - Log entry
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

  /**
   * Pretty format for development
   * @param {object} entry - Log entry
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
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[90m',
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
      debug: '🐛 DEBUG',
    };

    return labels[level] || String(level).toUpperCase();
  }

  setupFileLogging() {
    this.ensureDirectoryExists();
    this.createStream();
    this.setupRetentionCleanup();
  }

  ensureDirectoryExists() {
    try {
      if (!fs.existsSync(this.dirname)) {
        fs.mkdirSync(this.dirname, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }

  getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getCurrentFilename() {
    const base = path.basename(this.filename, path.extname(this.filename));
    const ext = path.extname(this.filename);
    return `${base}-${this.currentDate}${ext}`;
  }

  createStream() {
    const filename = this.getCurrentFilename();
    const filepath = path.join(this.dirname, filename);

    try {
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        this.currentSize = stats.size;
      } else {
        this.currentSize = 0;
      }
    } catch (error) {
      console.error('Error checking file size:', error);
      this.currentSize = 0;
    }

    if (this.stream) {
      try {
        this.stream.end();
      } catch (error) {
        console.error('Error closing existing stream:', error);
      }
    }

    try {
      this.stream = fs.createWriteStream(filepath, { flags: 'a' });
      this.stream.on('error', (error) => {
        console.error('Log file write error:', error);
        this.stream = null;
      });
    } catch (error) {
      console.error('Error creating write stream:', error);
      this.stream = null;
    }
  }

  async checkRotation() {
    const currentDate = this.getCurrentDate();
    if (currentDate !== this.currentDate) {
      await this.rotate();
      return;
    }
    if (this.currentSize >= this.maxSize) {
      await this.rotateSizeBased();
    }
  }

  async rotate() {
    if (this.stream) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Stream close during rotate timed out after 5000ms');
          resolve();
        }, 5000);

        this.stream.on('error', (error) => {
          console.error('Stream error during rotate:', error);
          clearTimeout(timeout);
          resolve();
        });

        this.stream.end(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }

    this.currentDate = this.getCurrentDate();
    this.currentSize = 0;
    this.createStream();
  }

  async rotateSizeBased() {
    if (this.stream) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn(
            'Stream close during size-based rotate timed out after 5000ms'
          );
          resolve();
        }, 5000);

        this.stream.on('error', (error) => {
          console.error('Stream error during size-based rotate:', error);
          clearTimeout(timeout);
          resolve();
        });

        this.stream.end(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }

    const filename = this.getCurrentFilename();
    const filepath = path.join(this.dirname, filename);

    try {
      if (!fs.existsSync(filepath)) {
        this.currentSize = 0;
        this.createStream();
        return;
      }

      let rotation = 1;
      while (fs.existsSync(`${filepath}.${rotation}`)) {
        rotation++;
      }

      await fs.promises.rename(filepath, `${filepath}.${rotation}`);
    } catch (error) {
      console.error('Error during file rotation:', error);
    }

    this.currentSize = 0;
    this.createStream();
  }

  setupRetentionCleanup() {
    this.cleanOldLogs();
    this.cleanupInterval = setInterval(
      () => {
        this.cleanOldLogs();
      },
      24 * 60 * 60 * 1000
    );
  }

  async cleanOldLogs() {
    if (this.retentionDays <= 0) return;

    try {
      const files = await fs.promises.readdir(this.dirname);
      const now = Date.now();
      const maxAge = this.retentionDays * 24 * 60 * 60 * 1000;
      const base = path.basename(this.filename, path.extname(this.filename));

      for (const file of files) {
        if (!file.startsWith(base)) {
          continue;
        }

        const filepath = path.join(this.dirname, file);

        try {
          const stats = await fs.promises.stat(filepath);
          if (now - stats.mtimeMs > maxAge) {
            await fs.promises.unlink(filepath);
            console.log(`Deleted old log file: ${file}`);
          }
        } catch (error) {
          console.error(`Error processing log file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error);
    }
  }

  /**
   * Flushes any pending logs
   * @returns {Promise<void>}
   */
  async flush() {
    return new Promise((resolve) => {
      if (this.stream && this.stream.writable) {
        if (this.stream.writableLength === 0) {
          resolve();
        } else {
          const timeout = setTimeout(() => {
            console.warn('Logger flush timed out after 5000ms');
            resolve();
          }, 5000);

          this.stream.once('drain', () => {
            clearTimeout(timeout);
            resolve();
          });

          this.stream.write('');
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Closes the logger
   * @returns {Promise<void>}
   */
  async close() {
    return new Promise((resolve) => {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      if (this.stream) {
        const timeout = setTimeout(() => {
          console.warn('Logger close timed out after 5000ms');
          this.stream = null;
          resolve();
        }, 5000);

        this.stream.on('error', (error) => {
          console.error('Logger stream error during close:', error);
          clearTimeout(timeout);
          this.stream = null;
          resolve();
        });

        this.stream.end(() => {
          clearTimeout(timeout);
          this.stream = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
