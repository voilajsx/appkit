/**
 * Base storage provider interface with essential methods only
 * @module @voilajsx/storage/providers/base
 * @file src/storage/providers/base.js
 */
/**
 * Base storage provider interface
 */
export class StorageProvider {
    constructor(config?: {});
    config: {};
    /**
     * Initializes the storage provider
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Uploads a file with automatic large file handling
     * @param {Buffer|Stream|string} file - File content or path to file
     * @param {string} path - Storage path
     * @param {Object} [options] - Upload options
     * @param {Function} [onProgress] - Progress callback (percent: number) => void
     * @returns {Promise<{url: string, size: number, etag?: string}>} Upload result
     */
    upload(file: Buffer | Stream | string, path: string, options?: any, onProgress?: Function): Promise<{
        url: string;
        size: number;
        etag?: string;
    }>;
    /**
     * Gets a file's content
     * @param {string} path - Storage path
     * @returns {Promise<Buffer>} File content
     */
    get(path: string): Promise<Buffer>;
    /**
     * Deletes a file
     * @param {string} path - Storage path
     * @returns {Promise<boolean>} Success status
     */
    delete(path: string): Promise<boolean>;
    /**
     * Gets a file URL
     * @param {string} path - Storage path
     * @param {Object} [options] - URL options
     * @returns {string} File URL
     */
    getUrl(path: string, options?: any): string;
    /**
     * Checks if a file exists
     * @param {string} path - Storage path
     * @returns {Promise<boolean>} Existence status
     */
    exists(path: string): Promise<boolean>;
    /**
     * Lists files in a directory
     * @param {string} [prefix] - Path prefix
     * @returns {Promise<Array<string>>} Array of file paths
     */
    list(prefix?: string): Promise<Array<string>>;
}
