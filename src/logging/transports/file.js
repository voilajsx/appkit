/**
 * File transport with rotation, retention and inline utilities
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/file.js
 */

import fs from 'fs';
import path from 'path';

/**
 * File transport class with built-in rotation and retention
 */
export class FileTransport {
  /**
   * Creates a new File transport
   * @param {object} [config={}] - File transport configuration
   */
  constructor(config = {}) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Transport defaults
    const defaults = {
      dirname: 'logs',
      filename: 'app.log',
      retentionDays: isProduction ? 30 : 7,
      maxSize: isProduction ? 50 * 1024 * 1024 : 10 * 1024 * 1024,
      rotateDaily: true,
    };

    // Environment overrides
    const envOverrides = {
      dirname: process.env.VOILA_LOGGING_DIR || defaults.dirname,
      maxSize:
        parseInt(process.env.VOILA_LOGGING_FILE_MAX_SIZE) || defaults.maxSize,
      retentionDays:
        parseInt(process.env.VOILA_LOGGING_FILE_RETENTION_DAYS) ||
        defaults.retentionDays,
    };

    // Merge configuration with priority: defaults < env < direct config
    this.config = {
      ...defaults,
      ...envOverrides,
      ...config,
    };

    // File state
    this.currentSize = 0;
    this.currentDate = this.getCurrentDate();
    this.stream = null;

    // Initialize file logging
    this.initialize();
  }

  /**
   * Initialize file transport
   */
  initialize() {
    try {
      this.ensureDirectoryExists();
      this.createStream();
      this.setupRetentionCleanup();
    } catch (error) {
      console.error('File transport initialization failed:', error.message);
    }
  }

  /**
   * Writes log entry to file
   * @param {object} entry - Log entry object
   */
  async write(entry) {
    try {
      await this.checkRotation();

      if (!this.stream || !this.stream.writable) {
        this.createStream();
      }

      // Always write structured JSON to files
      const line = JSON.stringify(entry) + '\n';
      const size = Buffer.byteLength(line);

      await this.writeToStream(line);
      this.currentSize += size;
    } catch (error) {
      console.error('File transport write error:', error.message);
    }
  }

  /**
   * Write line to stream with timeout protection
   * @param {string} line - Log line to write
   * @returns {Promise<void>}
   */
  writeToStream(line) {
    return new Promise((resolve) => {
      if (!this.stream || !this.stream.writable) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        console.warn('File write timed out after 5000ms');
        resolve();
      }, 5000);

      this.stream.write(line, (error) => {
        clearTimeout(timeout);
        if (error) {
          console.error('Error writing to log file:', error.message);
          this.stream = null;
        }
        resolve();
      });
    });
  }

  /**
   * Check if rotation is needed and perform it
   */
  async checkRotation() {
    const currentDate = this.getCurrentDate();

    // Daily rotation
    if (this.config.rotateDaily && currentDate !== this.currentDate) {
      await this.rotateDateBased();
      return;
    }

    // Size-based rotation
    if (this.currentSize >= this.config.maxSize) {
      await this.rotateSizeBased();
    }
  }

  /**
   * Perform date-based rotation
   */
  async rotateDateBased() {
    await this.closeStream();
    this.currentDate = this.getCurrentDate();
    this.currentSize = 0;
    this.createStream();
  }

  /**
   * Perform size-based rotation
   */
  async rotateSizeBased() {
    await this.closeStream();

    const currentFilepath = this.getCurrentFilepath();

    try {
      if (!fs.existsSync(currentFilepath)) {
        this.currentSize = 0;
        this.createStream();
        return;
      }

      // Find next rotation number
      let rotation = 1;
      while (fs.existsSync(`${currentFilepath}.${rotation}`)) {
        rotation++;
      }

      // Rename current file
      await fs.promises.rename(
        currentFilepath,
        `${currentFilepath}.${rotation}`
      );
    } catch (error) {
      console.error('Error during file rotation:', error.message);
    }

    this.currentSize = 0;
    this.createStream();
  }

  /**
   * Create write stream for current log file
   */
  createStream() {
    const filepath = this.getCurrentFilepath();

    try {
      // Get current file size if it exists
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        this.currentSize = stats.size;
      } else {
        this.currentSize = 0;
      }

      // Close existing stream
      if (this.stream) {
        this.stream.end();
      }

      // Create new write stream
      this.stream = fs.createWriteStream(filepath, { flags: 'a' });

      this.stream.on('error', (error) => {
        console.error('Log file write error:', error.message);
        this.stream = null;
      });
    } catch (error) {
      console.error('Error creating write stream:', error.message);
      this.stream = null;
    }
  }

  /**
   * Close the current stream
   * @returns {Promise<void>}
   */
  closeStream() {
    return new Promise((resolve) => {
      if (!this.stream) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        console.warn('Stream close timed out after 5000ms');
        this.stream = null;
        resolve();
      }, 5000);

      this.stream.on('error', (error) => {
        console.error('Stream error during close:', error.message);
        clearTimeout(timeout);
        this.stream = null;
        resolve();
      });

      this.stream.end(() => {
        clearTimeout(timeout);
        this.stream = null;
        resolve();
      });
    });
  }

  /**
   * Get current date string for file naming
   * @returns {string} Date string in YYYY-MM-DD format
   */
  getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Get current log file path
   * @returns {string} Full file path
   */
  getCurrentFilepath() {
    const base = path.basename(
      this.config.filename,
      path.extname(this.config.filename)
    );
    const ext = path.extname(this.config.filename);
    const filename = this.config.rotateDaily
      ? `${base}-${this.currentDate}${ext}`
      : this.config.filename;
    return path.join(this.config.dirname, filename);
  }

  /**
   * Ensure log directory exists
   */
  ensureDirectoryExists() {
    try {
      if (!fs.existsSync(this.config.dirname)) {
        fs.mkdirSync(this.config.dirname, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating log directory:', error.message);
    }
  }

  /**
   * Setup automatic cleanup of old log files
   */
  setupRetentionCleanup() {
    // Clean old logs immediately
    this.cleanOldLogs();

    // Setup daily cleanup interval
    this.cleanupInterval = setInterval(
      () => {
        this.cleanOldLogs();
      },
      24 * 60 * 60 * 1000
    ); // Daily
  }

  /**
   * Clean old log files based on retention policy
   */
  async cleanOldLogs() {
    if (this.config.retentionDays <= 0) return;

    try {
      const files = await fs.promises.readdir(this.config.dirname);
      const now = Date.now();
      const maxAge = this.config.retentionDays * 24 * 60 * 60 * 1000;
      const base = path.basename(
        this.config.filename,
        path.extname(this.config.filename)
      );

      for (const file of files) {
        // Only clean files that match our log file pattern
        if (!file.startsWith(base)) {
          continue;
        }

        const filepath = path.join(this.config.dirname, file);

        try {
          const stats = await fs.promises.stat(filepath);
          if (now - stats.mtimeMs > maxAge) {
            await fs.promises.unlink(filepath);
            console.log(`Deleted old log file: ${file}`);
          }
        } catch (error) {
          console.error(`Error processing log file ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error.message);
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
   * Flush any pending logs
   * @returns {Promise<void>}
   */
  async flush() {
    return new Promise((resolve) => {
      if (!this.stream || !this.stream.writable) {
        resolve();
        return;
      }

      if (this.stream.writableLength === 0) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        console.warn('File flush timed out after 5000ms');
        resolve();
      }, 5000);

      this.stream.once('drain', () => {
        clearTimeout(timeout);
        resolve();
      });

      // Trigger drain event
      this.stream.write('');
    });
  }

  /**
   * Close the file transport
   * @returns {Promise<void>}
   */
  async close() {
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Close stream
    await this.closeStream();
  }
}
