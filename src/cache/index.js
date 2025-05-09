/**
 * @voilajs/appkit - Cache module
 * @module @voilajs/appkit/cache
 */

// Main exports file
export { initCache, getCache, closeCache } from './manager.js';
export { CacheStrategy } from './strategies/base.js';
export { RedisStrategy } from './strategies/redis.js';
export { MemcachedStrategy } from './strategies/memcached.js';
export { MemoryStrategy } from './strategies/memory.js';
export { generateCacheKey } from './key-generator.js';
export { createSerializer } from './serializer.js';