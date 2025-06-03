/**
 * @voilajsx/appkit - File transport for logging
 * @module @voilajsx/appkit/logging/transports/file
 */

import fs from 'fs';
import path from 'path';
import { BaseTransport } from './base.js';

/**
 * @typedef {import('./base.js').TransportOptions} TransportOptions
 * @typedef {import('./base.js').LogEntry} LogEntry
 */

/**
 * @typedef {Object} FileTransportOptions
 * @property {string} [dirname='logs'] - Directory for log files
 * @property {string} [filename='app.log'] - Base filename for logs
 * @property {number} [maxSize=10485760] - Maximum file size before rotation (10MB default)
 * @property {number} [retentionDays=7] - Days to retain log files
 * @property {string} [datePattern='YYYY-MM-DD'] - Date pattern for filename
 */

/**
 * File transport implementation with rotation and retention
 * @extends BaseTransport
 */
export class FileTransport extends BaseTransport {
  constructor(options = {}) {
    super(options);
    this.dirname = options.dirname || 'logs';
    this.filename = options.filename || 'app.log';
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.retentionDays = options.retentionDays ?? 7;
    this.datePattern = options.datePattern || 'YYYY-MM-DD';
    this.currentSize = 0;
    this.currentDate = this.getCurrentDate();
    this.stream = null;
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
      for (const file of files) {
        const base = path.basename(this.filename, path.extname(this.filename));
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

  async log(entry) {
    try {
      await this.checkRotation();
      if (!this.stream || !this.stream.writable) {
        console.warn('No writable stream, recreating...');
        this.createStream();
      }
      const line = JSON.stringify(entry) + '\n';
      const size = Buffer.byteLength(line);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('Log write timed out after 5000ms');
          resolve();
        }, 5000);
        this.stream.write(line, (error) => {
          clearTimeout(timeout);
          if (error) {
            console.error('Error writing to log file:', error);
            this.stream = null;
            resolve();
          } else {
            this.currentSize += size;
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error logging to file:', error);
    }
  }

  flush() {
    return new Promise((resolve) => {
      if (this.stream && this.stream.writable) {
        if (this.stream.writableLength === 0) {
          console.log(
            'FileTransport flush: write buffer empty, no flush needed'
          );
          resolve();
        } else {
          const timeout = setTimeout(() => {
            console.warn('FileTransport flush timed out after 5000ms');
            resolve();
          }, 5000);
          this.stream.once('drain', () => {
            console.log('FileTransport flush: drain event emitted');
            clearTimeout(timeout);
            resolve();
          });
          this.stream.write('');
        }
      } else {
        console.log('FileTransport flush: no stream or not writable');
        resolve();
      }
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.cleanupInterval) {
        console.log('FileTransport close: clearing cleanup interval');
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      if (this.stream) {
        const timeout = setTimeout(() => {
          console.warn('FileTransport close timed out after 5000ms');
          this.stream = null;
          resolve();
        }, 5000);
        this.stream.on('error', (error) => {
          console.error('FileTransport stream error during close:', error);
          clearTimeout(timeout);
          this.stream = null;
          resolve();
        });
        this.stream.end(() => {
          console.log('FileTransport close: end event emitted');
          clearTimeout(timeout);
          this.stream = null;
          resolve();
        });
      } else {
        console.log('FileTransport close: no stream');
        resolve();
      }
    });
  }
}

// Default export for convenience
export default FileTransport;
