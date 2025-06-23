/**
 * AWS S3 storage provider
 * @extends StorageProvider
 */
export class S3Provider extends StorageProvider {
    bucket: any;
    region: any;
    credentials: any;
    endpoint: any;
    forcePathStyle: any;
    publicRead: any;
    baseUrl: any;
    client: S3Client;
    /**
     * Uploads a file with automatic multipart handling for large files
     * @param {Buffer|Stream|string} file - File content or path to file
     * @param {string} path - Storage path
     * @param {Object} [options] - Upload options
     * @param {Function} [onProgress] - Progress callback (percent: number) => void
     * @returns {Promise<{url: string, size: number, etag: string}>} Upload result
     */
    upload(file: Buffer | Stream | string, path: string, options?: any, onProgress?: Function): Promise<{
        url: string;
        size: number;
        etag: string;
    }>;
    /**
     * Single part upload for smaller files
     * @private
     */
    private _uploadSingle;
    /**
     * Multipart upload for large files
     * @private
     */
    private _uploadMultipart;
    /**
     * Helper to get object size
     * @private
     */
    private _getObjectSize;
    /**
     * Gets a file URL
     * @param {string} path - Storage path
     * @param {Object} [options] - URL options
     * @returns {string|Promise<string>} File URL or signed URL promise
     */
    getUrl(path: string, options?: any): string | Promise<string>;
    /**
     * Gets a signed URL for temporary access (S3-specific extension)
     * @param {string} path - Storage path
     * @param {Object} [options] - Signed URL options
     * @returns {Promise<string>} Signed URL
     */
    getSignedUrl(path: string, options?: any): Promise<string>;
}
import { StorageProvider } from './base.js';
import { S3Client } from '@aws-sdk/client-s3';
