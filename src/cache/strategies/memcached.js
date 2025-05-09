/**
 * @voilajs/appkit - Memcached cache strategy
 * @module @voilajs/appkit/cache/strategies/memcached
 */

import { CacheStrategy } from './base.js';
import { createSerializer } from '../serializer.js';

/**
 * Memcached cache strategy implementation
 * @extends CacheStrategy
 */
export class MemcachedStrategy extends CacheStrategy {
  constructor(config) {
    super(config);
    this.client = null;
    this.serializer = createSerializer(config.serializer);
    this.defaultTTL = config.ttl || 3600;
  }

  async connect() {
    const Memcached = await import('memcached');
    
    this.client = new Memcached.default(
      this.config.servers || 'localhost:11211',
      this.config.options || {}
    );

    // Promisify memcached methods
    this.client.getAsync = this.promisify(this.client.get);
    this.client.setAsync = this.promisify(this.client.set);
    this.client.delAsync = this.promisify(this.client.del);
    this.client.flushAsync = this.promisify(this.client.flush);
  }

  async disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  async get(key) {
    try {
      const data = await this.client.getAsync(key);
      if (!data) return null;
      
      return this.serializer.deserialize(data);
    } catch (error) {
      console.error(`Failed to get cache value for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    const serialized = this.serializer.serialize(value);
    
    try {
      await this.client.setAsync(key, serialized, ttl);
      return true;
    } catch (error) {
      console.error(`Failed to set cache value for key ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.client.delAsync(key);
      return true;
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  async clear() {
    try {
      await this.client.flushAsync();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Promisify a memcached method
   * @private
   */
  promisify(method) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        method.call(this.client, ...args, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };
  }
}