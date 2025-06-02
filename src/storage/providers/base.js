/**
 * Base storage provider interface with essential methods only
 * @module @voilajsx/storage/providers/base
 * @file src/storage/providers/base.js
 */

/**
 * Base storage provider interface
 */
export class StorageProvider {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Uploads a file with automatic large file handling
   * @param {Buffer|Stream|string} file - File content or path to file
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, etag?: string}>} Upload result
   */
  async upload(file, path, options = {}, onProgress = null) {
    throw new Error('upload() must be implemented by subclass');
  }

  /**
   * Gets a file's content
   * @param {string} path - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async get(path) {
    throw new Error('get() must be implemented by subclass');
  }

  /**
   * Deletes a file
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(path) {
    throw new Error('delete() must be implemented by subclass');
  }

  /**
   * Gets a file URL
   * @param {string} path - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(path, options = {}) {
    throw new Error('getUrl() must be implemented by subclass');
  }

  /**
   * Checks if a file exists
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(path) {
    throw new Error('exists() must be implemented by subclass');
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @returns {Promise<Array<string>>} Array of file paths
   */
  async list(prefix = '') {
    throw new Error('list() must be implemented by subclass');
  }
}
