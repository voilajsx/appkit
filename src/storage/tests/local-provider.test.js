/**
 * LocalProvider tests for storage module
 * @module @voilajsx/appkit/storage/tests
 * @file src/storage/tests/local-provider.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalProvider } from '../providers/local.js';
import { createTestBuffer } from './setup.js';
import { promises as fs } from 'fs';

describe('LocalProvider', () => {
  let provider;
  const testBasePath = './test-local-provider';

  beforeEach(async () => {
    // Clean up before each test
    try {
      await fs.rm(testBasePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }

    provider = new LocalProvider({
      basePath: testBasePath,
      baseUrl: '/test-files',
    });
    await provider.initialize();
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await fs.rm(testBasePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('initialize', () => {
    it('should create base directory', async () => {
      const newProvider = new LocalProvider({
        basePath: './test-new-dir',
      });

      await expect(newProvider.initialize()).resolves.not.toThrow();

      // Clean up
      try {
        await fs.rm('./test-new-dir', { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    });
  });

  describe('upload', () => {
    it('should upload buffer successfully', async () => {
      const testData = createTestBuffer(50);

      const result = await provider.upload(testData, 'test-file.txt');

      expect(result).toMatchObject({
        url: '/test-files/test-file.txt',
        size: 50,
        path: 'test-file.txt',
      });
    });

    it('should create directories automatically', async () => {
      const testData = createTestBuffer(30);

      const result = await provider.upload(testData, 'nested/dir/file.txt');

      expect(result.path).toBe('nested/dir/file.txt');
      expect(result.size).toBe(30);
    });
  });

  describe('get', () => {
    it('should retrieve uploaded file', async () => {
      const testData = createTestBuffer(40);
      await provider.upload(testData, 'retrieve-test.txt');

      const result = await provider.get('retrieve-test.txt');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(40);
    });

    it('should throw error for non-existent file', async () => {
      await expect(provider.get('non-existent.txt')).rejects.toThrow(
        'File not found: non-existent.txt'
      );
    });
  });

  describe('delete', () => {
    it('should delete existing file', async () => {
      const testData = createTestBuffer(20);
      await provider.upload(testData, 'delete-test.txt');

      const result = await provider.delete('delete-test.txt');

      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const result = await provider.delete('non-existent.txt');

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing file', async () => {
      const testData = createTestBuffer(15);
      await provider.upload(testData, 'exists-test.txt');

      const result = await provider.exists('exists-test.txt');

      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const result = await provider.exists('non-existent.txt');

      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('should list all files', async () => {
      const testData = createTestBuffer(10);
      await provider.upload(testData, 'file1.txt');
      await provider.upload(testData, 'file2.txt');

      const result = await provider.list();

      expect(result).toContain('file1.txt');
      expect(result).toContain('file2.txt');
      expect(result.length).toBe(2);
    });

    it('should list files with prefix', async () => {
      const testData = createTestBuffer(10);
      await provider.upload(testData, 'docs/file1.txt');
      await provider.upload(testData, 'images/file2.jpg');

      const result = await provider.list('docs/');

      expect(result).toContain('docs/file1.txt');
      expect(result).not.toContain('images/file2.jpg');
      expect(result.length).toBe(1);
    });
  });

  describe('getUrl', () => {
    it('should generate correct URL', () => {
      const url = provider.getUrl('test-file.txt');

      expect(url).toBe('/test-files/test-file.txt');
    });

    it('should handle nested paths', () => {
      const url = provider.getUrl('nested/dir/file.txt');

      expect(url).toBe('/test-files/nested/dir/file.txt');
    });
  });
});
