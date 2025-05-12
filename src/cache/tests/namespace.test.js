import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createCache } from '../src/factory.js';

describe('Cache Namespace', () => {
  let cache;
  let userCache;
  let adminCache;

  beforeEach(async () => {
    cache = await createCache({ strategy: 'memory' });
    userCache = cache.namespace('user');
    adminCache = userCache.namespace('admin');
  });

  afterEach(async () => {
    await cache.disconnect();
  });

  it('should use prefixed keys', async () => {
    await userCache.set('123', { name: 'Alice' });
    await adminCache.set('456', { name: 'Bob', role: 'admin' });

    // Check root cache with prefixed keys
    expect(await cache.get('user:123')).toEqual({ name: 'Alice' });
    expect(await cache.get('user:admin:456')).toEqual({
      name: 'Bob',
      role: 'admin',
    });

    // Check from namespaced caches
    expect(await userCache.get('123')).toEqual({ name: 'Alice' });
    expect(await adminCache.get('456')).toEqual({ name: 'Bob', role: 'admin' });

    // Keys should be namespaced properly
    expect(await cache.get('123')).toBeNull();
    expect(await userCache.get('admin:456')).toBeNull();
  });

  it('should handle batch operations', async () => {
    // Set multiple items with namespace
    await userCache.setMany({
      1: { id: 1, name: 'User 1' },
      2: { id: 2, name: 'User 2' },
    });

    // Get multiple items with namespace
    const users = await userCache.getMany(['1', '2', '3']);
    expect(users).toEqual([
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
      null,
    ]);

    // Delete multiple items with namespace
    await userCache.deleteMany(['1', '2']);

    // Check that they're gone
    expect(await userCache.get('1')).toBeNull();
    expect(await userCache.get('2')).toBeNull();
  });

  it('should clear only namespace keys', async () => {
    // Set keys in different namespaces
    await cache.set('root-key', 'root');
    await userCache.set('user-key', 'user');
    await adminCache.set('admin-key', 'admin');

    // Clear only user namespace
    await userCache.clear();

    // Check what was cleared
    expect(await cache.get('root-key')).toBe('root');
    expect(await userCache.get('user-key')).toBeNull();
    expect(await cache.get('user:user-key')).toBeNull();

    // Admin namespace is under user, so it should also be cleared
    expect(await adminCache.get('admin-key')).toBeNull();
    expect(await cache.get('user:admin:admin-key')).toBeNull();
  });

  it('should support getOrSet with namespacing', async () => {
    const value = await userCache.getOrSet('lazy', () => 'generated');

    expect(value).toBe('generated');
    expect(await cache.get('user:lazy')).toBe('generated');
  });

  it('should support pattern operations with namespacing', async () => {
    // Set several keys
    await userCache.set('profile:1', 'profile 1');
    await userCache.set('profile:2', 'profile 2');
    await userCache.set('setting:1', 'setting 1');

    // Get keys matching pattern
    const profileKeys = await userCache.keys('profile:*');
    expect(profileKeys).toContain('profile:1');
    expect(profileKeys).toContain('profile:2');
    expect(profileKeys).not.toContain('setting:1');

    // Delete keys matching pattern
    await userCache.deletePattern('profile:*');

    // Verify they were deleted
    expect(await userCache.get('profile:1')).toBeNull();
    expect(await userCache.get('profile:2')).toBeNull();
    expect(await userCache.get('setting:1')).toBe('setting 1');
  });
});
