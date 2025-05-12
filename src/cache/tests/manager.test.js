import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createNamedCache,
  getNamedCache,
  removeNamedCache,
  hasNamedCache,
  clearAllCaches,
  getCacheNames,
} from '../src/manager.js';

// Mock factory module
vi.mock('../src/factory.js', () => ({
  createCache: vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

describe('Cache Manager', () => {
  afterEach(async () => {
    await clearAllCaches();
  });

  it('should create and retrieve named caches', async () => {
    // Create a named cache
    const userCache = await createNamedCache('users', { strategy: 'memory' });

    // Get the same cache by name
    const retrievedCache = getNamedCache('users');

    // Should be the same instance
    expect(retrievedCache).toBe(userCache);
  });

  it('should check if named cache exists', async () => {
    // Initially no cache exists
    expect(hasNamedCache('users')).toBe(false);

    // Create a cache
    await createNamedCache('users', { strategy: 'memory' });

    // Now it should exist
    expect(hasNamedCache('users')).toBe(true);
  });

  it('should throw when getting non-existent cache', () => {
    expect(() => getNamedCache('non-existent')).toThrow(/not found/);
  });

  it('should throw when creating duplicate cache', async () => {
    await createNamedCache('users', { strategy: 'memory' });

    // Try to create another with same name
    await expect(
      createNamedCache('users', { strategy: 'memory' })
    ).rejects.toThrow(/already exists/);
  });

  it('should remove named cache', async () => {
    // Create a cache
    const cache = await createNamedCache('users', { strategy: 'memory' });

    // Remove it
    const removed = await removeNamedCache('users');

    // Should be removed
    expect(removed).toBe(true);
    expect(hasNamedCache('users')).toBe(false);

    // Should have called disconnect
    expect(cache.disconnect).toHaveBeenCalled();
  });

  it('should handle removing non-existent cache', async () => {
    const removed = await removeNamedCache('non-existent');
    expect(removed).toBe(false);
  });

  it('should get all cache names', async () => {
    // Create some caches
    await createNamedCache('users', { strategy: 'memory' });
    await createNamedCache('products', { strategy: 'memory' });
    await createNamedCache('sessions', { strategy: 'memory' });

    // Get all names
    const names = getCacheNames();

    // Should contain all caches
    expect(names).toHaveLength(3);
    expect(names).toContain('users');
    expect(names).toContain('products');
    expect(names).toContain('sessions');
  });

  it('should clear all caches', async () => {
    // Create some caches
    const cache1 = await createNamedCache('cache1', { strategy: 'memory' });
    const cache2 = await createNamedCache('cache2', { strategy: 'memory' });

    // Clear all
    await clearAllCaches();

    // All should be removed
    expect(hasNamedCache('cache1')).toBe(false);
    expect(hasNamedCache('cache2')).toBe(false);

    // Disconnect should have been called on each
    expect(cache1.disconnect).toHaveBeenCalled();
    expect(cache2.disconnect).toHaveBeenCalled();
  });
});
