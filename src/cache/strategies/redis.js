/**
 * @voilajs/appkit - Redis cache strategy
 * @module @voilajs/appkit/cache/strategies/redis
 */

import { CacheStrategy } from './base.js';
import { createSerializer } from '../serializer.js';

/**
 * Redis cache strategy implementation
 * @extends CacheStrategy
 */
export class RedisStrategy extends CacheStrategy {
  constructor(config) {
    super(config);
    this.client = null;
    this.serializer = createSerializer(config.serializer);
    this.keyPrefix = config.keyPrefix || '';
    this.defaultTTL = config.ttl || 3600;
  }

  async connect() {
    const redis = await import('redis');
    
    this.client = redis.createClient({
      url: this.config.url,
      password: this.config.password,
      ...this.config.options
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await this.client.connect();
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  async get(key) {
    const prefixedKey = this.keyPrefix + key;
    const data = await this.client.get(prefixedKey);
    
    if (!data) return null;
    
    try {
      return this.serializer.deserialize(data);
    } catch (error) {
      console.error(`Failed to deserialize cache value for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    const prefixedKey = this.keyPrefix + key;
    const serialized = this.serializer.serialize(value);
    
    if (ttl) {
      await this.client.setEx(prefixedKey, ttl, serialized);
    } else {
      await this.client.set(prefixedKey, serialized);
    }
    
    return true;
  }

  async delete(key) {
    const prefixedKey = this.keyPrefix + key;
    const result = await this.client.del(prefixedKey);
    return result === 1;
  }

  async clear() {
    if (this.keyPrefix) {
      // Clear only keys with prefix
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } else {
      // Clear entire database
      await this.client.flushDb();
    }
    return true;
  }

  /**
   * Delete keys matching pattern (Redis-specific)
   * @param {string} pattern - Key pattern
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    const prefixedPattern = this.keyPrefix + pattern;
    const keys = await this.client.keys(prefixedPattern);
    
    if (keys.length === 0) return 0;
    
    const result = await this.client.del(keys);
    return result;
  }

  /**
   * Get remaining TTL for a key (Redis-specific)
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   */
  async ttl(key) {
    const prefixedKey = this.keyPrefix + key;
    return this.client.ttl(prefixedKey);
  }
}