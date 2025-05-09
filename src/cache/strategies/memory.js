/**
 * @voilajs/appkit - Memory cache strategy
 * @module @voilajs/appkit/cache/strategies/memory
 */

import { CacheStrategy } from './base.js';

/**
 * In-memory cache strategy implementation
 * @extends CacheStrategy
 */
export class MemoryStrategy extends CacheStrategy {
  constructor(config) {
    super(config);
    this.store = new Map();
    this.timers = new Map();
    this.maxItems = config.maxItems || 1000;
    this.defaultTTL = config.ttl || 3600;
  }

  async connect() {
    // No connection needed for memory cache
    return Promise.resolve();
  }

  async disconnect() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
    return Promise.resolve();
  }

  async get(key) {
    const item = this.store.get(key);
    
    if (!item) return null;
    
    if (item.expires && item.expires < Date.now()) {
      await this.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key, value, ttl = this.defaultTTL) {
    // Enforce max items limit
    if (!this.store.has(key) && this.store.size >= this.maxItems) {
      // Remove oldest item (first in map)
      const firstKey = this.store.keys().next().value;
      await this.delete(firstKey);
    }

    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    const item = {
      value,
      expires: ttl ? Date.now() + (ttl * 1000) : null
    };

    this.store.set(key, item);

    // Set expiration timer
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
      
      this.timers.set(key, timer);
    }

    return true;
  }

  async delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    return this.store.delete(key);
  }

  async clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
    return true;
  }

  /**
   * Get cache statistics (Memory-specific)
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: this.store.size,
      maxItems: this.maxItems,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }
}