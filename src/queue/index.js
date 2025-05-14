/**
 * @voilajs/appkit - Queue module
 * @module @voilajs/appkit/queue
 * @description Flexible and efficient job queue system with support for
 * multiple backends (memory, Redis, database)
 */

// Core functionality
export { initQueue, getQueue, closeQueue } from './manager.js';

// Base adapter and implementations
export { QueueAdapter } from './adapters/base.js';
export { MemoryAdapter } from './adapters/memory.js';
export { RedisAdapter } from './adapters/redis.js';
export { DatabaseAdapter } from './adapters/database.js';

// Constants and utilities
export const QUEUE_ADAPTERS = {
  MEMORY: 'memory',
  REDIS: 'redis',
  DATABASE: 'database',
};

export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
  RECURRING: 'recurring',
};
