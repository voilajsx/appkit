/**
 * @voilajs/appkit - Session stores
 * @module @voilajs/appkit/session/stores
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Session Store Interface
 * All stores must implement these methods:
 * - async get(sessionId): Promise<Object|null>
 * - async set(sessionId, data, maxAge): Promise<void>
 * - async destroy(sessionId): Promise<void>
 * - async touch(sessionId, maxAge): Promise<void>
 */

/**
 * In-memory session store (default)
 * Best for: Development, testing, single-process applications
 */
export class MemoryStore {
  constructor() {
    this.sessions = new Map();
    this.timers = new Map();
  }

  /**
   * Gets a session by ID
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object|null>} Session data or null if not found/expired
   */
  async get(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      await this.destroy(sessionId);
      return null;
    }

    return session.data;
  }

  /**
   * Sets session data
   * @param {string} sessionId - Session identifier
   * @param {Object} sessionData - Data to store
   * @param {number} [maxAge] - Session max age in milliseconds
   * @returns {Promise<void>}
   */
  async set(sessionId, sessionData, maxAge) {
    const expiresAt = maxAge ? Date.now() + maxAge : null;

    // Clear existing timer
    const existingTimer = this.timers.get(sessionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    this.sessions.set(sessionId, {
      data: sessionData,
      expiresAt,
      updatedAt: Date.now(),
    });

    // Set cleanup timer
    if (maxAge) {
      const timer = setTimeout(() => {
        this.destroy(sessionId);
      }, maxAge);
      this.timers.set(sessionId, timer);
    }
  }

  /**
   * Destroys a session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<void>}
   */
  async destroy(sessionId) {
    this.sessions.delete(sessionId);
    const timer = this.timers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(sessionId);
    }
  }

  /**
   * Extends session expiration
   * @param {string} sessionId - Session identifier
   * @param {number} maxAge - New max age in milliseconds
   * @returns {Promise<void>}
   */
  async touch(sessionId, maxAge) {
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.set(sessionId, session.data, maxAge);
    }
  }

  /**
   * Gets session count (useful for monitoring)
   * @returns {number} Number of active sessions
   */
  length() {
    return this.sessions.size;
  }

  /**
   * Clears all sessions
   * @returns {Promise<void>}
   */
  async clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.sessions.clear();
    this.timers.clear();
  }
}

/**
 * File-based session store
 * Best for: Simple production deployments, single-server applications
 */
export class FileStore {
  constructor(directory = './sessions', options = {}) {
    this.directory = directory;
    this.extension = options.extension || '.json';
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute
    this.encoding = options.encoding || 'utf8';
    this.initialized = false;
    this.cleanupTimer = null;

    // Initialize asynchronously
    this.init().catch((error) => {
      console.warn('Session FileStore initialization error:', error.message);
    });
  }

  /**
   * Initialize store
   * @private
   */
  async init() {
    if (this.initialized) return;

    await this.ensureDirectory();
    this.startCleanup();
    this.initialized = true;
  }

  /**
   * Ensures session directory exists
   * @private
   */
  async ensureDirectory() {
    try {
      await fs.mkdir(this.directory, { recursive: true });
    } catch (error) {
      console.warn('Could not create sessions directory:', error.message);
      throw error;
    }
  }

  /**
   * Gets file path for session
   * @private
   */
  getFilePath(sessionId) {
    // Sanitize session ID for file system
    const sanitized = sessionId.replace(/[^a-zA-Z0-9\-_]/g, '');
    return path.join(this.directory, `${sanitized}${this.extension}`);
  }

  /**
   * Gets a session by ID
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object|null>} Session data or null if not found/expired
   */
  async get(sessionId) {
    // Ensure store is initialized
    if (!this.initialized) {
      await this.init();
    }

    try {
      const filePath = this.getFilePath(sessionId);
      const data = await fs.readFile(filePath, this.encoding);
      const session = JSON.parse(data);

      if (session.expiresAt && Date.now() > session.expiresAt) {
        await this.destroy(sessionId);
        return null;
      }

      return session.data;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      console.warn('Session read error:', error.message);
      return null;
    }
  }

  /**
   * Sets session data
   * @param {string} sessionId - Session identifier
   * @param {Object} sessionData - Data to store
   * @param {number} [maxAge] - Session max age in milliseconds
   * @returns {Promise<void>}
   */
  async set(sessionId, sessionData, maxAge) {
    // Ensure store is initialized
    if (!this.initialized) {
      await this.init();
    }

    const expiresAt = maxAge ? Date.now() + maxAge : null;
    const session = {
      data: sessionData,
      expiresAt,
      updatedAt: Date.now(),
    };

    try {
      const filePath = this.getFilePath(sessionId);
      await fs.writeFile(
        filePath,
        JSON.stringify(session, null, 2),
        this.encoding
      );
    } catch (error) {
      console.warn('Session write error:', error.message);
      throw new Error('Failed to save session');
    }
  }

  /**
   * Destroys a session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<void>}
   */
  async destroy(sessionId) {
    try {
      const filePath = this.getFilePath(sessionId);
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('Session destroy error:', error.message);
      }
    }
  }

  /**
   * Extends session expiration
   * @param {string} sessionId - Session identifier
   * @param {number} maxAge - New max age in milliseconds
   * @returns {Promise<void>}
   */
  async touch(sessionId, maxAge) {
    const sessionData = await this.get(sessionId);
    if (sessionData) {
      await this.set(sessionId, sessionData, maxAge);
    }
  }

  /**
   * Starts background cleanup of expired sessions
   * @private
   */
  startCleanup() {
    const cleanup = async () => {
      try {
        const files = await fs.readdir(this.directory);
        const now = Date.now();
        const cleanupPromises = [];

        for (const file of files) {
          if (file.endsWith(this.extension)) {
            const filePath = path.join(this.directory, file);

            cleanupPromises.push(
              (async () => {
                try {
                  const data = await fs.readFile(filePath, this.encoding);
                  const session = JSON.parse(data);

                  if (session.expiresAt && now > session.expiresAt) {
                    await fs.unlink(filePath);
                  }
                } catch (error) {
                  // Skip invalid files or files that couldn't be processed
                }
              })()
            );
          }
        }

        await Promise.allSettled(cleanupPromises);
      } catch (error) {
        console.warn('Session cleanup error:', error.message);
      }
    };

    // Initial cleanup
    cleanup();

    // Schedule regular cleanup
    this.cleanupTimer = setInterval(cleanup, this.cleanupInterval);
  }

  /**
   * Stops cleanup timer
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Clears all sessions
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      const files = await fs.readdir(this.directory);
      const unlinkPromises = files
        .filter((file) => file.endsWith(this.extension))
        .map((file) => fs.unlink(path.join(this.directory, file)));

      await Promise.allSettled(unlinkPromises);
    } catch (error) {
      console.warn('Session clear error:', error.message);
    }
  }

  /**
   * Cleanup resources when store is no longer needed
   */
  destroy() {
    this.stopCleanup();
  }
}

/**
 * Redis session store
 * Best for: Production applications, multi-server deployments
 */
export class RedisStore {
  constructor(client, options = {}) {
    this.client = client;
    this.prefix = options.prefix || 'sess:';
    this.serializer = options.serializer || JSON;
    this.clientType = this.detectClientType(client);
  }

  /**
   * Detect Redis client type for better compatibility
   * @private
   */
  detectClientType(client) {
    if (client.constructor.name === 'Redis' || client.status !== undefined) {
      return 'ioredis';
    } else if (client.constructor.name === 'RedisClient' || client.v4) {
      return 'node_redis';
    } else {
      console.warn('Unknown Redis client type, using ioredis mode');
      return 'ioredis';
    }
  }

  /**
   * Gets Redis key for session
   * @private
   */
  getKey(sessionId) {
    return `${this.prefix}${sessionId}`;
  }

  /**
   * Gets a session by ID
   * @param {string} sessionId - Session identifier
   * @returns {Promise<Object|null>} Session data or null if not found/expired
   */
  async get(sessionId) {
    try {
      const key = this.getKey(sessionId);
      const data = await this.client.get(key);

      if (!data) return null;

      return this.serializer.parse(data);
    } catch (error) {
      console.warn('Redis session get error:', error.message);
      return null;
    }
  }

  /**
   * Sets session data
   * @param {string} sessionId - Session identifier
   * @param {Object} sessionData - Data to store
   * @param {number} [maxAge] - Session max age in milliseconds
   * @returns {Promise<void>}
   */
  async set(sessionId, sessionData, maxAge) {
    try {
      const key = this.getKey(sessionId);
      const data = this.serializer.stringify(sessionData);

      if (maxAge) {
        // Set with expiration
        const ttl = Math.ceil(maxAge / 1000); // Convert to seconds

        if (this.clientType === 'ioredis') {
          await this.client.setex(key, ttl, data);
        } else {
          // node_redis v4+
          await this.client.setEx(key, ttl, data);
        }
      } else {
        // Set without expiration
        await this.client.set(key, data);
      }
    } catch (error) {
      console.warn('Redis session set error:', error.message);
      throw new Error('Failed to save session');
    }
  }

  /**
   * Destroys a session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<void>}
   */
  async destroy(sessionId) {
    try {
      const key = this.getKey(sessionId);
      await this.client.del(key);
    } catch (error) {
      console.warn('Redis session destroy error:', error.message);
    }
  }

  /**
   * Extends session expiration
   * @param {string} sessionId - Session identifier
   * @param {number} maxAge - New max age in milliseconds
   * @returns {Promise<void>}
   */
  async touch(sessionId, maxAge) {
    if (maxAge) {
      try {
        const key = this.getKey(sessionId);
        const ttl = Math.ceil(maxAge / 1000);
        await this.client.expire(key, ttl);
      } catch (error) {
        console.warn('Redis session touch error:', error.message);
      }
    }
  }

  /**
   * Gets session count (useful for monitoring)
   * @returns {Promise<number>} Number of active sessions
   */
  async length() {
    try {
      const keys = await this.client.keys(`${this.prefix}*`);
      return keys.length;
    } catch (error) {
      console.warn('Redis session count error:', error.message);
      return 0;
    }
  }

  /**
   * Clears all sessions
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      const keys = await this.client.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.warn('Redis session clear error:', error.message);
    }
  }

  /**
   * Test Redis connection
   * @returns {Promise<boolean>} True if connected
   */
  async ping() {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.warn('Redis ping error:', error.message);
      return false;
    }
  }
}

/**
 * Default export for convenience
 */
export default {
  MemoryStore,
  FileStore,
  RedisStore,
};
