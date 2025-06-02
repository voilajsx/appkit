/**
 * AWS S3 storage provider with essential operations and automatic multipart handling
 * @module @voilajsx/storage/providers/s3
 * @file src/storage/providers/s3.js
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './base.js';
import { createReadStream, statSync } from 'fs';

// Size constants for multipart uploads
const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100MB
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_PART_SIZE = 5 * 1024 * 1024; // 5MB minimum required by S3

/**
 * AWS S3 storage provider
 * @extends StorageProvider
 */
export class S3Provider extends StorageProvider {
  constructor(config = {}) {
    super(config);
    this.bucket = config.bucket;
    this.region = config.region || 'us-east-1';
    this.credentials = config.credentials;
    this.endpoint = config.endpoint;
    this.forcePathStyle = config.forcePathStyle || false;
    this.publicRead = config.publicRead || false;
    this.baseUrl =
      config.baseUrl ||
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.bucket) {
      throw new Error('S3 bucket name is required');
    }

    const clientConfig = {
      region: this.region,
      forcePathStyle: this.forcePathStyle,
    };

    if (this.credentials) {
      clientConfig.credentials = this.credentials;
    }

    if (this.endpoint) {
      clientConfig.endpoint = this.endpoint;
    }

    this.client = new S3Client(clientConfig);
  }

  /**
   * Uploads a file with automatic multipart handling for large files
   * @param {Buffer|Stream|string} file - File content or path to file
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @param {Function} [onProgress] - Progress callback (percent: number) => void
   * @returns {Promise<{url: string, size: number, etag: string}>} Upload result
   */
  async upload(file, path, options = {}, onProgress = null) {
    let fileSize;
    let fileData = file;

    // Determine file size and prepare data
    if (typeof file === 'string') {
      const stats = statSync(file);
      fileSize = stats.size;
      fileData = createReadStream(file);
    } else if (Buffer.isBuffer(file)) {
      fileSize = file.length;
    } else if (file.pipe) {
      fileSize = options.fileSize;
      if (!fileSize && file.headers?.['content-length']) {
        fileSize = parseInt(file.headers['content-length'], 10);
      }
    } else {
      throw new Error('File must be Buffer, Stream, or file path');
    }

    // Use multipart upload for large files
    if (fileSize && fileSize > MULTIPART_THRESHOLD) {
      return this._uploadMultipart(
        fileData,
        path,
        fileSize,
        options,
        onProgress
      );
    }

    // Regular upload for smaller files
    return this._uploadSingle(fileData, path, options, onProgress);
  }

  /**
   * Single part upload for smaller files
   * @private
   */
  async _uploadSingle(file, path, options, onProgress) {
    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: file,
      ContentType: options.contentType || 'application/octet-stream',
    };

    if (this.publicRead || options.public) {
      params.ACL = 'public-read';
    }

    if (options.metadata) {
      params.Metadata = options.metadata;
    }

    try {
      const command = new PutObjectCommand(params);
      const response = await this.client.send(command);

      if (onProgress) onProgress(100);

      // Get file size
      let size;
      if (Buffer.isBuffer(file)) {
        size = file.length;
      } else {
        const metadata = await this._getObjectSize(path);
        size = metadata;
      }

      return {
        url: this.getUrl(path),
        size,
        etag: response.ETag?.replace(/"/g, ''),
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Multipart upload for large files
   * @private
   */
  async _uploadMultipart(file, path, fileSize, options, onProgress) {
    const createParams = {
      Bucket: this.bucket,
      Key: path,
      ContentType: options.contentType || 'application/octet-stream',
    };

    if (this.publicRead || options.public) {
      createParams.ACL = 'public-read';
    }

    const multipartUpload = await this.client.send(
      new CreateMultipartUploadCommand(createParams)
    );
    const uploadId = multipartUpload.UploadId;

    const chunkSize = Math.max(
      MIN_PART_SIZE,
      options.chunkSize || DEFAULT_CHUNK_SIZE
    );
    const totalParts = Math.ceil(fileSize / chunkSize);
    const uploadedParts = [];
    let uploadedBytes = 0;

    try {
      // Handle file upload in chunks
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * chunkSize;
        const end = Math.min(partNumber * chunkSize, fileSize);

        let chunkData;
        if (typeof file === 'object' && file.path) {
          // File stream - create new stream for this chunk
          chunkData = createReadStream(file.path, { start, end: end - 1 });
        } else {
          // For simplicity, fall back to single upload for streams in this version
          return this._uploadSingle(file, path, options, onProgress);
        }

        const uploadPartResponse = await this.client.send(
          new UploadPartCommand({
            Bucket: this.bucket,
            Key: path,
            UploadId: uploadId,
            PartNumber: partNumber,
            Body: chunkData,
          })
        );

        uploadedParts.push({
          PartNumber: partNumber,
          ETag: uploadPartResponse.ETag,
        });

        uploadedBytes += end - start;
        const progressPercent = Math.min(
          Math.round((uploadedBytes / fileSize) * 100),
          99
        );

        if (onProgress) onProgress(progressPercent);
      }

      // Complete multipart upload
      const completeResponse = await this.client.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.bucket,
          Key: path,
          UploadId: uploadId,
          MultipartUpload: { Parts: uploadedParts },
        })
      );

      if (onProgress) onProgress(100);

      return {
        url: this.getUrl(path),
        size: fileSize,
        etag: completeResponse.ETag?.replace(/"/g, ''),
      };
    } catch (error) {
      // Abort multipart upload on error
      await this.client.send(
        new AbortMultipartUploadCommand({
          Bucket: this.bucket,
          Key: path,
          UploadId: uploadId,
        })
      );
      throw error;
    }
  }

  /**
   * Helper to get object size
   * @private
   */
  async _getObjectSize(path) {
    try {
      const command = new HeadObjectCommand({ Bucket: this.bucket, Key: path });
      const response = await this.client.send(command);
      return response.ContentLength;
    } catch {
      return 0;
    }
  }

  /**
   * Gets a file's content
   * @param {string} path - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async get(path) {
    try {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: path });
      const response = await this.client.send(command);

      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Deletes a file
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(path) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });
      await this.client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Gets a file URL
   * @param {string} path - Storage path
   * @param {Object} [options] - URL options
   * @returns {string|Promise<string>} File URL or signed URL promise
   */
  getUrl(path, options = {}) {
    if (options.signed) {
      return this.getSignedUrl(path, options);
    }
    return `${this.baseUrl}/${path}`;
  }

  /**
   * Gets a signed URL for temporary access (S3-specific extension)
   * @param {string} path - Storage path
   * @param {Object} [options] - Signed URL options
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(path, options = {}) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: path });

    try {
      return await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn || 3600,
      });
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Checks if a file exists
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(path) {
    try {
      const command = new HeadObjectCommand({ Bucket: this.bucket, Key: path });
      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @returns {Promise<Array<string>>} Array of file paths
   */
  async list(prefix = '') {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: 1000,
      });

      const response = await this.client.send(command);
      const files = [];

      if (response.Contents) {
        for (const item of response.Contents) {
          files.push(item.Key);
        }
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}
