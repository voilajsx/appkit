/**
 * Store functionality tests for @voilajsx/appkit session module
 * Tests MemoryStore, FileStore, and RedisStore
 *
 * @file src/session/tests/stores.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryStore, FileStore, RedisStore } from '../stores.js';
import { createMockRedisClient, wait } from './setup.js';
import fs from 'fs/promises';
import path from 'path';

describe('Session Stores', () => {
  describe('MemoryStore', () => {
    let store;

    beforeEach(() => {
      store = new MemoryStore();
    });

    afterEach(() => {
      store.clear();
    });

    it('should create memory store', () => {
      expect(store).toBeDefined();
      expect(store.length()).toBe(0);
    });

    it('should store and retrieve session data', async () => {
      const sessionId = 'test-session-1';
      const data = { user: { id: 123, name: 'Test User' } };

      await store.set(sessionId, data);
      const retrieved = await store.get(sessionId);

      expect(retrieved).toEqual(data);
      expect(store.length()).toBe(1);
    });

    it('should return null for non-existent session', async () => {
      const result = await store.get('non-existent');
      expect(result).toBeNull();
    });

    it('should destroy session', async () => {
      const sessionId = 'test-session-2';
      await store.set(sessionId, { test: 'data' });

      expect(await store.get(sessionId)).toBeTruthy();

      await store.destroy(sessionId);

      expect(await store.get(sessionId)).toBeNull();
      expect(store.length()).toBe(0);
    });

    it('should handle session expiration', async () => {
      const sessionId = 'test-session-3';
      const data = { user: { id: 123 } };
      const shortMaxAge = 50; // 50ms

      await store.set(sessionId, data, shortMaxAge);

      // Should exist immediately
      expect(await store.get(sessionId)).toEqual(data);

      // Wait for expiration
      await wait(100);

      // Should be expired and removed
      expect(await store.get(sessionId)).toBeNull();
      expect(store.length()).toBe(0);
    });

    it('should touch session to extend expiry', async () => {
      const sessionId = 'test-session-4';
      const data = { user: { id: 123 } };
      const maxAge = 100; // 100ms

      await store.set(sessionId, data, maxAge);

      // Wait almost to expiration
      await wait(80);

      // Touch to extend
      await store.touch(sessionId, maxAge);

      // Wait original time - should still exist
      await wait(50);
      expect(await store.get(sessionId)).toEqual(data);

      // Wait for new expiration
      await wait(80);
      expect(await store.get(sessionId)).toBeNull();
    });

    it('should clear all sessions', async () => {
      await store.set('session1', { data: 1 });
      await store.set('session2', { data: 2 });
      await store.set('session3', { data: 3 });

      expect(store.length()).toBe(3);

      await store.clear();

      expect(store.length()).toBe(0);
      expect(await store.get('session1')).toBeNull();
    });

    it('should handle concurrent operations', async () => {
      const promises = [];

      // Create multiple sessions concurrently
      for (let i = 0; i < 10; i++) {
        promises.push(store.set(`session${i}`, { id: i }));
      }

      await Promise.all(promises);
      expect(store.length()).toBe(10);

      // Retrieve all concurrently
      const retrievePromises = [];
      for (let i = 0; i < 10; i++) {
        retrievePromises.push(store.get(`session${i}`));
      }

      const results = await Promise.all(retrievePromises);
      results.forEach((result, index) => {
        expect(result).toEqual({ id: index });
      });
    });
  });

  describe('FileStore', () => {
    let store;
    const testDir = './test-sessions';

    beforeEach(() => {
      store = new FileStore(testDir, {
        cleanupInterval: 10000, // Disable auto-cleanup for tests
      });
    });

    afterEach(async () => {
      store.stopCleanup();
      try {
        await store.clear();
        await fs.rmdir(testDir);
      } catch (e) {
        // Directory might not exist
      }
    });

    it('should create file store and directory', async () => {
      expect(store).toBeDefined();

      // Wait for initialization
      await wait(100);

      // Check if directory was created
      try {
        const stats = await fs.stat(testDir);
        expect(stats.isDirectory()).toBe(true);
      } catch (e) {
        // Directory creation might be async
        await wait(200);
        const stats = await fs.stat(testDir);
        expect(stats.isDirectory()).toBe(true);
      }
    });

    it('should store and retrieve session data from files', async () => {
      const sessionId = 'file-test-session-1';
      const data = { user: { id: 123, name: 'File Test User' } };

      await store.set(sessionId, data);
      const retrieved = await store.get(sessionId);

      expect(retrieved).toEqual(data);

      // Check if file was created
      const filePath = path.join(testDir, `${sessionId}.json`);
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should handle file not found', async () => {
      const result = await store.get('non-existent-file-session');
      expect(result).toBeNull();
    });

    it('should handle session expiration in files', async () => {
      const sessionId = 'file-test-session-3';
      const data = { user: { id: 123 } };
      const shortMaxAge = 50; // 50ms

      await store.set(sessionId, data, shortMaxAge);

      // Should exist immediately
      expect(await store.get(sessionId)).toEqual(data);

      // Wait for expiration
      await wait(100);

      // Should be expired
      expect(await store.get(sessionId)).toBeNull();
    });

    it('should touch session file to extend expiry', async () => {
      const sessionId = 'file-test-session-4';
      const data = { user: { id: 123 } };
      const maxAge = 200; // 200ms

      await store.set(sessionId, data, maxAge);

      // Wait and touch
      await wait(100);
      await store.touch(sessionId, maxAge);

      // Should still exist after original expiry time
      await wait(150);
      expect(await store.get(sessionId)).toEqual(data);
    });

    it('should clear all session files', async () => {
      await store.set('file-session1', { data: 1 });
      await store.set('file-session2', { data: 2 });
      await store.set('file-session3', { data: 3 });

      // Files should exist
      const files = await fs.readdir(testDir);
      expect(files.length).toBe(3);

      await store.clear();

      // Directory should be empty
      const filesAfter = await fs.readdir(testDir);
      expect(filesAfter.length).toBe(0);
    });

    it('should sanitize session IDs for filenames', async () => {
      const dangerousId = 'session/../../../etc/passwd';
      const data = { test: 'data' };

      await store.set(dangerousId, data);

      // Should sanitize the ID and create a safe filename
      const files = await fs.readdir(testDir);
      expect(files.length).toBe(1);
      // The actual sanitization logic will determine the exact filename
      expect(files[0]).toMatch(/\.json$/);
      expect(files[0]).not.toContain('..');
      expect(files[0]).not.toContain('/');
    });

    it('should handle corrupted session files', async () => {
      const sessionId = 'corrupted-session';
      const filePath = path.join(testDir, `${sessionId}.json`);

      // Create corrupted file
      await fs.mkdir(testDir, { recursive: true });
      await fs.writeFile(filePath, 'invalid json content');

      // Should return null for corrupted file
      const result = await store.get(sessionId);
      expect(result).toBeNull();
    });
  });

  describe('RedisStore', () => {
    let store;
    let mockClient;

    beforeEach(() => {
      mockClient = createMockRedisClient();
      store = new RedisStore(mockClient, {
        prefix: 'test:sess:',
      });
    });

    it('should create redis store', () => {
      expect(store).toBeDefined();
      expect(store.prefix).toBe('test:sess:');
    });

    it('should store and retrieve session data from Redis', async () => {
      const sessionId = 'redis-test-session-1';
      const data = { user: { id: 123, name: 'Redis Test User' } };

      await store.set(sessionId, data);
      const retrieved = await store.get(sessionId);

      expect(retrieved).toEqual(data);
      expect(mockClient.set).toHaveBeenCalledWith(
        'test:sess:redis-test-session-1',
        JSON.stringify(data)
      );
    });

    it('should return null for non-existent session', async () => {
      const result = await store.get('non-existent-redis-session');
      expect(result).toBeNull();
      expect(mockClient.get).toHaveBeenCalledWith(
        'test:sess:non-existent-redis-session'
      );
    });

    it('should destroy session in Redis', async () => {
      const sessionId = 'redis-test-session-2';
      await store.set(sessionId, { test: 'data' });

      await store.destroy(sessionId);

      expect(mockClient.del).toHaveBeenCalledWith(
        'test:sess:redis-test-session-2'
      );
    });

    it('should set session with expiration', async () => {
      const sessionId = 'redis-test-session-3';
      const data = { user: { id: 123 } };
      const maxAge = 3600000; // 1 hour in ms

      await store.set(sessionId, data, maxAge);

      // Should use setEx for expiration (3600 seconds)
      // Check if either setEx or setex was called (depending on client type)
      const setExCalled = mockClient.setEx?.mock?.calls?.length > 0;
      const setexCalled = mockClient.setex?.mock?.calls?.length > 0;

      expect(setExCalled || setexCalled).toBe(true);

      if (setExCalled) {
        expect(mockClient.setEx).toHaveBeenCalledWith(
          'test:sess:redis-test-session-3',
          3600,
          JSON.stringify(data)
        );
      } else {
        expect(mockClient.setex).toHaveBeenCalledWith(
          'test:sess:redis-test-session-3',
          3600,
          JSON.stringify(data)
        );
      }
    });

    it('should touch session to extend expiry', async () => {
      const sessionId = 'redis-test-session-4';
      const maxAge = 3600000; // 1 hour

      await store.touch(sessionId, maxAge);

      expect(mockClient.expire).toHaveBeenCalledWith(
        'test:sess:redis-test-session-4',
        3600
      );
    });

    it('should count active sessions', async () => {
      mockClient.keys.mockResolvedValue([
        'test:sess:session1',
        'test:sess:session2',
        'test:sess:session3',
      ]);

      const count = await store.length();

      expect(count).toBe(3);
      expect(mockClient.keys).toHaveBeenCalledWith('test:sess:*');
    });

    it('should clear all sessions', async () => {
      const sessionKeys = [
        'test:sess:session1',
        'test:sess:session2',
        'test:sess:session3',
      ];
      mockClient.keys.mockResolvedValue(sessionKeys);

      await store.clear();

      expect(mockClient.keys).toHaveBeenCalledWith('test:sess:*');
      expect(mockClient.del).toHaveBeenCalledWith(...sessionKeys);
    });

    it('should ping Redis connection', async () => {
      const result = await store.ping();

      expect(result).toBe(true);
      expect(mockClient.ping).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockClient.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await store.get('test-session');

      expect(result).toBeNull();
    });

    it('should detect different Redis client types', () => {
      // Test ioredis client detection
      const ioredisClient = { constructor: { name: 'Redis' }, status: 'ready' };
      const ioredisStore = new RedisStore(ioredisClient);
      expect(ioredisStore.clientType).toBe('ioredis');

      // Test node_redis client detection
      const nodeRedisClient = { constructor: { name: 'RedisClient' }, v4: {} };
      const nodeRedisStore = new RedisStore(nodeRedisClient);
      expect(nodeRedisStore.clientType).toBe('node_redis');
    });

    it('should use custom serializer', async () => {
      const customSerializer = {
        stringify: vi.fn((data) => `custom:${JSON.stringify(data)}`),
        parse: vi.fn((str) => JSON.parse(str.replace('custom:', ''))),
      };

      const customStore = new RedisStore(mockClient, {
        serializer: customSerializer,
      });

      const sessionId = 'custom-serializer-test';
      const data = { test: 'data' };

      await customStore.set(sessionId, data);

      expect(customSerializer.stringify).toHaveBeenCalledWith(data);
      expect(mockClient.set).toHaveBeenCalledWith(
        'sess:custom-serializer-test',
        'custom:{"test":"data"}'
      );
    });
  });

  describe('Store Interface Compliance', () => {
    const stores = [
      () => new MemoryStore(),
      () => new RedisStore(createMockRedisClient()),
    ];

    stores.forEach((createStore, index) => {
      const storeName = ['MemoryStore', 'RedisStore'][index];

      describe(storeName, () => {
        let store;

        beforeEach(() => {
          store = createStore();
        });

        afterEach(async () => {
          try {
            await store.clear?.();
            if (store.stopCleanup) store.stopCleanup();
          } catch (e) {
            // Ignore cleanup errors
          }
        });

        it('should implement required interface methods', () => {
          expect(typeof store.get).toBe('function');
          expect(typeof store.set).toBe('function');
          expect(typeof store.destroy).toBe('function');
          expect(typeof store.touch).toBe('function');
        });

        it('should handle basic session lifecycle', async () => {
          const sessionId = `interface-test-${storeName}`;
          const data = { test: 'interface-data' };

          // Set
          await store.set(sessionId, data);

          // Get
          const retrieved = await store.get(sessionId);
          expect(retrieved).toEqual(data);

          // Touch
          await store.touch(sessionId, 60000);

          // Still exists after touch
          const afterTouch = await store.get(sessionId);
          expect(afterTouch).toEqual(data);

          // Destroy
          await store.destroy(sessionId);

          // Wait a bit for deletion to complete
          await new Promise((resolve) => setTimeout(resolve, 10));

          // Should be gone
          const afterDestroy = await store.get(sessionId);
          expect(afterDestroy).toBeNull();
        });
      });
    });
  });
});
