/**
 * Storage manager tests for storage module
 * @module @voilajsx/appkit/storage/tests
 * @file src/storage/tests/manager.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the providers
vi.mock('../providers/local.js', () => ({
  LocalProvider: class MockLocalProvider {
    constructor(config) {
      this.config = config;
      this.initialized = false;
    }

    async initialize() {
      this.initialized = true;
    }

    async upload() {
      return { url: '/local/test.txt', size: 100 };
    }
  },
}));

vi.mock('../providers/s3.js', () => ({
  S3Provider: class MockS3Provider {
    constructor(config) {
      this.config = config;
      this.initialized = false;
    }

    async initialize() {
      this.initialized = true;
    }

    async upload() {
      return { url: 'https://s3.amazonaws.com/test.txt', size: 100 };
    }
  },
}));

// Mock the manager module to control the singleton state
let mockStorageInstance = null;

vi.mock('../manager.js', async () => {
  const { LocalProvider } = await import('../providers/local.js');
  const { S3Provider } = await import('../providers/s3.js');

  return {
    initStorage: async (provider, config = {}) => {
      if (mockStorageInstance) {
        throw new Error('Storage already initialized');
      }

      switch (provider) {
        case 'local':
          mockStorageInstance = new LocalProvider(config);
          break;
        case 's3':
          mockStorageInstance = new S3Provider(config);
          break;
        default:
          throw new Error(`Unknown storage provider: ${provider}`);
      }

      await mockStorageInstance.initialize();
      return mockStorageInstance;
    },

    getStorage: () => {
      if (!mockStorageInstance) {
        throw new Error('Storage not initialized. Call initStorage() first.');
      }
      return mockStorageInstance;
    },
  };
});

describe('Storage Manager', () => {
  let initStorage, getStorage;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset the mock singleton state
    mockStorageInstance = null;

    // Import the mocked functions
    const manager = await import('../manager.js');
    initStorage = manager.initStorage;
    getStorage = manager.getStorage;
  });

  afterEach(() => {
    // Clean up after each test
    mockStorageInstance = null;
    vi.clearAllMocks();
  });

  describe('initStorage', () => {
    it('should initialize local provider', async () => {
      const storage = await initStorage('local', {
        basePath: './test-storage',
        baseUrl: '/files',
      });

      expect(storage).toBeDefined();
      expect(storage.config.basePath).toBe('./test-storage');
      expect(storage.initialized).toBe(true);
    });

    it('should initialize S3 provider', async () => {
      const storage = await initStorage('s3', {
        bucket: 'test-bucket',
        region: 'us-east-1',
      });

      expect(storage).toBeDefined();
      expect(storage.config.bucket).toBe('test-bucket');
      expect(storage.initialized).toBe(true);
    });

    it('should throw error for unknown provider', async () => {
      await expect(initStorage('unknown')).rejects.toThrow(
        'Unknown storage provider: unknown'
      );
    });

    it('should throw error if already initialized', async () => {
      await initStorage('local');

      await expect(initStorage('s3')).rejects.toThrow(
        'Storage already initialized'
      );
    });
  });

  describe('getStorage', () => {
    it('should return initialized storage instance', async () => {
      const initedStorage = await initStorage('local');
      const retrievedStorage = getStorage();

      expect(retrievedStorage).toBe(initedStorage);
    });

    it('should throw error if not initialized', () => {
      expect(() => getStorage()).toThrow(
        'Storage not initialized. Call initStorage() first.'
      );
    });
  });

  describe('integration', () => {
    it('should work end-to-end with local provider', async () => {
      await initStorage('local', { basePath: './uploads' });

      const storage = getStorage();
      const result = await storage.upload();

      expect(result.url).toBe('/local/test.txt');
    });

    it('should work end-to-end with S3 provider', async () => {
      await initStorage('s3', { bucket: 'my-bucket' });

      const storage = getStorage();
      const result = await storage.upload();

      expect(result.url).toBe('https://s3.amazonaws.com/test.txt');
    });
  });
});
