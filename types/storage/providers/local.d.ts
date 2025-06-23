/**
 * Local filesystem storage provider
 * @extends StorageProvider
 */
export class LocalProvider extends StorageProvider {
    basePath: any;
    baseUrl: any;
    /**
     * Uploads a file with automatic directory creation
     * @param {Buffer|Stream|string} file - File content or path to file
     * @param {string} filePath - Storage path
     * @param {Object} [options] - Upload options
     * @param {Function} [onProgress] - Progress callback (percent: number) => void
     * @returns {Promise<{url: string, size: number, path: string}>} Upload result
     */
    upload(file: Buffer | Stream | string, filePath: string, options?: any, onProgress?: Function): Promise<{
        url: string;
        size: number;
        path: string;
    }>;
    /**
     * Helper method to upload streams with progress tracking
     * @private
     */
    private _uploadStream;
}
import { StorageProvider } from './base.js';
