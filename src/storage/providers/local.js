/**
 * Local filesystem storage provider with essential operations
 * @module @voilajsx/storage/providers/local
 * @file src/storage/providers/local.js
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { StorageProvider } from './base.js';

const pipelineAsync = promisify(pipeline);

/**
 * Local filesystem storage provider
 * @extends StorageProvider
 */
export class LocalProvider extends StorageProvider {
  constructor(config = {}) {
    super(config);
    this.basePath = config.basePath || './storage';
    this.baseUrl = config.baseUrl || '/storage';
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    await fs.promises.mkdir(this.basePath, { recursive: true });
  }

  /**
   * Uploads a file with automatic directory creation
   * @param {Buffer|Stream|string} file - File content or path to file
   * @param {string} filePath - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, path: string}>} Upload result
   */
  async upload(file, filePath, options = {}, onProgress = null) {
    const fullPath = path.join(this.basePath, filePath);
    const dir = path.dirname(fullPath);

    // Auto-create directory
    await fs.promises.mkdir(dir, { recursive: true });

    let size;

    if (typeof file === 'string') {
      // Handle file path input
      const sourceStream = fs.createReadStream(file);
      const stat = await fs.promises.stat(file);
      return this._uploadStream(sourceStream, fullPath, stat.size, onProgress);
    } else if (Buffer.isBuffer(file)) {
      // Handle Buffer
      await fs.promises.writeFile(fullPath, file);
      size = file.length;
      if (onProgress) onProgress(100);
    } else if (file.pipe) {
      // Handle Stream
      return this._uploadStream(file, fullPath, options.fileSize, onProgress);
    } else {
      throw new Error('File must be Buffer, Stream, or file path');
    }

    return {
      url: this.getUrl(filePath),
      size,
      etag: null, // Local storage doesn't have ETags
    };
  }

  /**
   * Helper method to upload streams with progress tracking
   * @private
   */
  async _uploadStream(stream, fullPath, totalBytes, onProgress) {
    const writeStream = fs.createWriteStream(fullPath);

    if (onProgress && totalBytes) {
      let processedBytes = 0;
      stream.on('data', (chunk) => {
        processedBytes += chunk.length;
        const percent = Math.min(
          Math.round((processedBytes / totalBytes) * 100),
          100
        );
        onProgress(percent);
      });
    }

    await pipelineAsync(stream, writeStream);
    const stats = await fs.promises.stat(fullPath);

    if (onProgress) onProgress(100);

    return {
      url: this.getUrl(path.basename(fullPath)),
      size: stats.size,
      etag: null,
    };
  }

  /**
   * Gets a file's content
   * @param {string} filePath - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async get(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      return await fs.promises.readFile(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Deletes a file
   * @param {string} filePath - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Gets a file URL
   * @param {string} filePath - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(filePath, options = {}) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `${this.baseUrl}/${normalizedPath}`;
  }

  /**
   * Checks if a file exists
   * @param {string} filePath - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @returns {Promise<Array<string>>} Array of file paths
   */
  async list(prefix = '') {
    const fullPath = path.join(this.basePath, prefix);
    const files = [];

    async function walkDir(dir, baseDir) {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, entryPath);

          if (entry.isFile()) {
            files.push(relativePath.replace(/\\/g, '/'));
          } else if (entry.isDirectory()) {
            await walkDir(entryPath, baseDir);
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    await walkDir(fullPath, this.basePath);
    return files;
  }
}
