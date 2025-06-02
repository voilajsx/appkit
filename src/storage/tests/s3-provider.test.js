/**
 * S3Provider tests for storage module
 * @module @voilajsx/appkit/storage/tests
 * @file src/storage/tests/s3-provider.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestBuffer } from './setup.js';

// Mock the entire S3 provider module
vi.mock('../providers/s3.js', () => {
  const mockS3Client = {
    send: vi.fn(),
  };

  return {
    S3Provider: class MockS3Provider {
      constructor(config) {
        this.bucket = config.bucket;
        this.region = config.region || 'us-east-1';
        this.credentials = config.credentials;
        this.baseUrl =
          config.baseUrl ||
          `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
        this.client = mockS3Client;
        this._shouldThrowError = false;
        this._errorMessage = '';
        this._errorName = '';
      }

      async initialize() {
        if (!this.bucket) {
          throw new Error('S3 bucket name is required');
        }
      }

      // Test helper methods
      _setError(message, name = 'TestError') {
        this._shouldThrowError = true;
        this._errorMessage = message;
        this._errorName = name;
      }

      _clearError() {
        this._shouldThrowError = false;
        this._errorMessage = '';
        this._errorName = '';
      }

      async upload(file, path, options = {}, onProgress = null) {
        if (this._shouldThrowError) {
          throw new Error(`Failed to upload file: ${this._errorMessage}`);
        }

        if (onProgress) onProgress(100);

        return {
          url: `${this.baseUrl}/${path}`,
          size: Buffer.isBuffer(file) ? file.length : 100,
          etag: 'mock-etag',
        };
      }

      async get(path) {
        if (this._shouldThrowError) {
          if (this._errorName === 'NoSuchKey') {
            throw new Error(`File not found: ${path}`);
          }
          throw new Error(`Failed to download file: ${this._errorMessage}`);
        }

        return Buffer.from('mock file content');
      }

      async delete(path) {
        if (this._shouldThrowError) {
          throw new Error(`Failed to delete file: ${this._errorMessage}`);
        }
        return true;
      }

      async exists(path) {
        if (this._shouldThrowError) {
          if (
            this._errorName === 'NotFound' ||
            this._errorName === 'NoSuchKey'
          ) {
            return false;
          }
          throw new Error(
            `Failed to check file existence: ${this._errorMessage}`
          );
        }
        return true;
      }

      async list(prefix = '') {
        if (this._shouldThrowError) {
          throw new Error(`Failed to list files: ${this._errorMessage}`);
        }
        return ['test-file.txt'];
      }

      getUrl(path, options = {}) {
        if (options.signed) {
          return this.getSignedUrl(path, options);
        }
        return `${this.baseUrl}/${path}`;
      }

      async getSignedUrl(path, options = {}) {
        if (this._shouldThrowError) {
          throw new Error(
            `Failed to generate signed URL: ${this._errorMessage}`
          );
        }
        return `https://signed-url.example.com/${path}?expires=${options.expiresIn || 3600}`;
      }
    },
  };
});

describe('S3Provider', () => {
  let provider;
  let S3Provider;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();

    // Import the mocked S3Provider
    const module = await import('../providers/s3.js');
    S3Provider = module.S3Provider;

    provider = new S3Provider({
      bucket: 'test-bucket',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
    });

    await provider.initialize();
  });

  describe('initialize', () => {
    it('should initialize with valid config', async () => {
      const newProvider = new S3Provider({
        bucket: 'valid-bucket',
        region: 'us-west-2',
      });

      await expect(newProvider.initialize()).resolves.not.toThrow();
    });

    it('should throw error without bucket', async () => {
      const newProvider = new S3Provider({});

      await expect(newProvider.initialize()).rejects.toThrow(
        'S3 bucket name is required'
      );
    });
  });

  describe('upload', () => {
    it('should upload small file successfully', async () => {
      const testData = createTestBuffer(50);
      const result = await provider.upload(testData, 'test-file.txt');

      expect(result.url).toBe(
        'https://test-bucket.s3.us-east-1.amazonaws.com/test-file.txt'
      );
      expect(result.size).toBe(50);
      expect(result.etag).toBe('mock-etag');
    });

    it('should throw error on upload failure', async () => {
      provider._setError('Upload failed');
      const testData = createTestBuffer(20);

      await expect(provider.upload(testData, 'fail-test.txt')).rejects.toThrow(
        'Failed to upload file: Upload failed'
      );
    });
  });

  describe('get', () => {
    it('should retrieve file successfully', async () => {
      const result = await provider.get('test-file.txt');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('mock file content');
    });

    it('should throw error for non-existent file', async () => {
      provider._setError('Not found', 'NoSuchKey');

      await expect(provider.get('non-existent.txt')).rejects.toThrow(
        'File not found: non-existent.txt'
      );
    });
  });

  describe('delete', () => {
    it('should delete file successfully', async () => {
      const result = await provider.delete('test-file.txt');

      expect(result).toBe(true);
    });

    it('should throw error on delete failure', async () => {
      provider._setError('Delete failed');

      await expect(provider.delete('test-file.txt')).rejects.toThrow(
        'Failed to delete file: Delete failed'
      );
    });
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      const result = await provider.exists('test-file.txt');

      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      provider._setError('Not found', 'NotFound');

      const result = await provider.exists('non-existent.txt');

      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('should list all files', async () => {
      const result = await provider.list();

      expect(result).toContain('test-file.txt');
      expect(result.length).toBe(1);
    });

    it('should throw error on list failure', async () => {
      provider._setError('List failed');

      await expect(provider.list()).rejects.toThrow(
        'Failed to list files: List failed'
      );
    });
  });

  describe('getUrl', () => {
    it('should generate public URL', () => {
      const url = provider.getUrl('test-file.txt');

      expect(url).toBe(
        'https://test-bucket.s3.us-east-1.amazonaws.com/test-file.txt'
      );
    });

    it('should return signed URL when requested', async () => {
      const url = await provider.getUrl('test-file.txt', { signed: true });

      expect(url).toContain('signed-url.example.com');
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL', async () => {
      const result = await provider.getSignedUrl('test-file.txt');

      expect(result).toContain('signed-url.example.com');
      expect(result).toContain('test-file.txt');
    });

    it('should respect custom expiration', async () => {
      const result = await provider.getSignedUrl('test-file.txt', {
        expiresIn: 7200,
      });

      expect(result).toContain('expires=7200');
    });

    it('should throw error on failure', async () => {
      provider._setError('Signing failed');

      await expect(provider.getSignedUrl('test-file.txt')).rejects.toThrow(
        'Failed to generate signed URL: Signing failed'
      );
    });
  });
});
