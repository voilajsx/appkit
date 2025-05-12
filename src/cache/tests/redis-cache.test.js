import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCache } from '../factory.js';

// Mock the Redis client
vi.mock('redis', () => {
  const mockClient = {
    connect: vi.fn(),
    quit: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
    mGet: vi.fn(),
    multi: vi.fn(),
    keys: vi.fn(),
    ttl: vi.fn(),
    expire: vi.fn(),
    flushDb: vi.fn(),
    on: vi.fn(),
  };

  const mockMulti = {
    set: vi.fn(),
    setEx: vi.fn(),
    exec: vi.fn(),
  };

  mockClient.multi.mockReturnValue(mockMulti);

  return {
    createClient: vi.fn().mockReturnValue(mockClient),
    default: {
      createClient: vi.fn().mockReturnValue(mockClient),
    },
  };
});

describe('Redis Cache', () => {
  let cache;
  let redisClient;

  beforeEach(async () => {
    // Clear mocks
    vi.clearAllMocks();

    // Create cache
    cache = await createCache({
      strategy: 'redis',
      url: 'redis://localhost:6379',
    });

    // Get the mock Redis client
    redisClient = (await import('redis')).createClient();
  });

  afterEach(async () => {
    await cache.disconnect();
  });

  it('should connect to Redis on initialization', async () => {
    expect(redisClient.connect).toHaveBeenCalled();
  });

  it('should disconnect from Redis', async () => {
    await cache.disconnect();
    expect(redisClient.quit).toHaveBeenCalled();
  });

  it('should get values from Redis', async () => {
    // Setup mock to return serialized data
    redisClient.get.mockResolvedValue(JSON.stringify('redis-value'));

    const value = await cache.get('key');

    expect(redisClient.get).toHaveBeenCalledWith('key');
    expect(value).toBe('redis-value');
  });

  it('should set values in Redis with TTL', async () => {
    await cache.set('key', 'value', 60);

    expect(redisClient.setEx).toHaveBeenCalledWith(
      'key',
      60,
      JSON.stringify('value')
    );
  });

  it('should delete keys from Redis', async () => {
    redisClient.del.mockResolvedValue(1);

    const result = await cache.delete('key');

    expect(redisClient.del).toHaveBeenCalledWith('key');
    expect(result).toBe(true);
  });

  it('should get multiple values at once', async () => {
    redisClient.mGet.mockResolvedValue([
      JSON.stringify('value1'),
      null,
      JSON.stringify('value3'),
    ]);

    const values = await cache.getMany(['key1', 'key2', 'key3']);

    expect(redisClient.mGet).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
    expect(values).toEqual(['value1', null, 'value3']);
  });

  it('should handle pattern operations', async () => {
    redisClient.keys.mockResolvedValue(['key1', 'key2']);

    const keys = await cache.keys('key*');

    expect(redisClient.keys).toHaveBeenCalledWith('key*');
    expect(keys).toEqual(['key1', 'key2']);
  });

  it('should get TTL for a key', async () => {
    redisClient.ttl.mockResolvedValue(42);

    const ttl = await cache.ttl('key');

    expect(redisClient.ttl).toHaveBeenCalledWith('key');
    expect(ttl).toBe(42);
  });

  it('should set expiry time for a key', async () => {
    redisClient.expire.mockResolvedValue(1);

    const result = await cache.expire('key', 300);

    expect(redisClient.expire).toHaveBeenCalledWith('key', 300);
    expect(result).toBe(true);
  });
});
