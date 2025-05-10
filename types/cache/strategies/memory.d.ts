/**
 * In-memory cache strategy implementation
 * @extends CacheStrategy
 */
export class MemoryStrategy extends CacheStrategy {
    store: any;
    timers: any;
    maxItems: any;
    defaultTTL: any;
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    get(key: any): Promise<any>;
    set(key: any, value: any, ttl?: any): Promise<boolean>;
    delete(key: any): Promise<any>;
    /**
     * Get cache statistics (Memory-specific)
     * @returns {Object} Cache statistics
     */
    getStats(): any;
}
import { CacheStrategy } from './base.js';
