/**
 * @voilajs/appkit - Cache connection manager
 * @module @voilajs/appkit/cache/manager
 */

import { RedisStrategy } from './strategies/redis.js';
import { MemcachedStrategy } from './strategies/memcached.js';
import { MemoryStrategy } from './strategies/memory.js';

let instance = null;

const strategies = {
  redis: RedisStrategy,
  memcached: MemcachedStrategy,
  memory: MemoryStrategy
};

/**
 * Initializes cache with specified strategy
 * @param {string} strategy - Cache strategy ('redis', 'memcached', 'memory')
 * @param {Object} config - Cache configuration
 * @returns {Promise<CacheStrategy>} Cache strategy instance
 */
export async function initCache(strategy, config) {
  if (instance) {
    throw new Error('Cache already initialized');
  }

  const StrategyClass = strategies[strategy];
  if (!StrategyClass) {
    throw new Error(`Unknown cache strategy: ${strategy}`);
  }

  instance = new StrategyClass(config);
  await instance.connect();
  
  return instance;
}

/**
 * Gets current cache instance
 * @returns {CacheStrategy} Cache strategy instance
 */
export function getCache() {
  if (!instance) {
    throw new Error('Cache not initialized. Call initCache() first.');
  }
  return instance;
}

/**
 * Closes cache connection
 * @returns {Promise<void>}
 */
export async function closeCache() {
  if (instance) {
    await instance.disconnect();
    instance = null;
  }
}