import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache } from '../factory.js';

describe('Memory Cache', () => {
  let cache;

  beforeEach(async () => {
    cache = await createCache({ strategy: 'memory' });
  });

  afterEach(async () => {
    await cache.disconnect();
  });

  it('should store and retrieve values', async () => {
    await cache.set('key1', 'value1');
    const value = await cache.get('key1');
    expect(value).toBe('value1');
  });

  it('should handle complex objects', async () => {
    const object = { a: 1, b: { c: 'test' }, d: [1, 2, 3] };
    await cache.set('object', object);
    const retrieved = await cache.get('object');
    expect(retrieved).toEqual(object);
  });

  it('should return null for non-existent keys', async () => {
    const value = await cache.get('non-existent');
    expect(value).toBeNull();
  });

  it('should support checking if a key exists', async () => {
    await cache.set('exists', 'yes');
    expect(await cache.has('exists')).toBe(true);
    expect(await cache.has('does-not-exist')).toBe(false);
  });

  it('should delete keys', async () => {
    await cache.set('to-delete', 'delete me');
    expect(await cache.get('to-delete')).toBe('delete me');

    await cache.delete('to-delete');
    expect(await cache.get('to-delete')).toBeNull();
  });

  it('should clear all keys', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');

    await cache.clear();

    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
  });

  it('should support TTL expiration', async () => {
    vi.useFakeTimers();

    await cache.set('expires', 'soon', 1); // 1 second TTL
    expect(await cache.get('expires')).toBe('soon');

    // Advance time
    vi.advanceTimersByTime(1100); // 1.1 seconds

    expect(await cache.get('expires')).toBeNull();

    vi.useRealTimers();
  });

  it('should support getMany and setMany operations', async () => {
    await cache.setMany({
      multi1: 'value1',
      multi2: 'value2',
      multi3: 'value3',
    });

    const values = await cache.getMany(['multi1', 'multi2', 'non-existent']);
    expect(values).toEqual(['value1', 'value2', null]);
  });

  it('should support getOrSet pattern', async () => {
    const factory = vi.fn().mockResolvedValue('generated-value');

    // First call should use the factory
    const value1 = await cache.getOrSet('lazy-key', factory);
    expect(value1).toBe('generated-value');
    expect(factory).toHaveBeenCalledTimes(1);

    // Second call should use the cached value
    const value2 = await cache.getOrSet('lazy-key', factory);
    expect(value2).toBe('generated-value');
    expect(factory).toHaveBeenCalledTimes(1); // Still 1, not called again
  });
});
