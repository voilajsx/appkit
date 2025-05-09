## @voilajs/appkit/cache LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

### LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM, single quotes, 2-space indentation, semicolons, JSDoc.

2. **Always include JSDoc comments** with all functions using this format:

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error handling patterns**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Return standardized error objects

4. **Framework agnostic**:
   - Implementation should work with any framework
   - Middleware patterns should be adaptable

### Function Signatures

#### 1. `createCache`

```typescript
async function createCache(options: {
  strategy: 'memory' | 'redis' | 'memcached';
  url?: string;
  servers?: string[];
  maxItems?: number;
  maxSize?: string | number;
  keyPrefix?: string;
  defaultTTL?: number;
  serializer?: {
    serialize: (value: any) => string;
    deserialize: (data: string) => any;
  };
  [key: string]: any;
}): Promise<CacheInterface>;
```

- Default `strategy`: `'memory'`
- Default `defaultTTL`: `null` (no expiration)

#### 2. `get`

```typescript
async function get(key: string): Promise<any | null>;
```

#### 3. `set`

```typescript
async function set(key: string, value: any, ttl?: number): Promise<boolean>;
```

- Default `ttl`: Uses instance defaultTTL or no expiration

#### 4. `has`

```typescript
async function has(key: string): Promise<boolean>;
```

#### 5. `delete`

```typescript
async function delete(key: string): Promise<boolean>;
```

#### 6. `clear`

```typescript
async function clear(): Promise<void>;
```

#### 7. `getMany`

```typescript
async function getMany(keys: string[]): Promise<Array<any | null>>;
```

#### 8. `setMany`

```typescript
async function setMany(
  items: Record<string, any>,
  ttl?: number
): Promise<boolean>;
```

- Default `ttl`: Uses instance defaultTTL or no expiration

#### 9. `deleteMany`

```typescript
async function deleteMany(keys: string[]): Promise<number>;
```

#### 10. `deletePattern`

```typescript
async function deletePattern(pattern: string): Promise<number>;
```

#### 11. `keys`

```typescript
async function keys(pattern?: string): Promise<string[]>;
```

- Default `pattern`: `'*'`

#### 12. `ttl`

```typescript
async function ttl(key: string): Promise<number>;
```

#### 13. `expire`

```typescript
async function expire(key: string, ttl: number): Promise<boolean>;
```

#### 14. `namespace`

```typescript
function namespace(prefix: string): CacheInterface;
```

#### 15. `getOrSet`

```typescript
async function getOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T>;
```

- Default `ttl`: Uses instance defaultTTL or no expiration

### Example Implementations

#### Basic Cache Operations

```javascript
/**
 * Retrieves a user from cache or database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
async function getUser(userId) {
  const cache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
  });

  const cacheKey = `user:${userId}`;
  let user = await cache.get(cacheKey);

  if (!user) {
    // Cache miss, fetch from database
    user = await db.users.findOne({ id: userId });

    if (user) {
      // Store in cache for 1 hour
      await cache.set(cacheKey, user, 3600);
    }
  }

  return user;
}

/**
 * Stores user data in cache
 * @param {string} userId - User ID
 * @param {Object} userData - User data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success indicator
 */
async function cacheUser(userId, userData, ttl = 3600) {
  const cache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
  });

  return cache.set(`user:${userId}`, userData, ttl);
}
```

#### Cache-Aside Pattern

```javascript
/**
 * Implements cache-aside pattern for data retrieval
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data on cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Retrieved data
 */
async function cacheAside(key, fetchFunction, ttl = 3600) {
  const cache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
  });

  // Try cache first
  const cachedData = await cache.get(key);
  if (cachedData) {
    return cachedData;
  }

  // Cache miss, fetch data
  const freshData = await fetchFunction();

  // Store in cache if we got valid data
  if (freshData) {
    await cache.set(key, freshData, ttl);
  }

  return freshData;
}
```

#### Multi-Level Cache

```javascript
/**
 * Creates a multi-level cache with local memory and Redis
 * @returns {Object} Multi-level cache interface
 */
async function createMultiLevelCache() {
  const localCache = await createCache({
    strategy: 'memory',
    maxItems: 1000,
    defaultTTL: 300, // 5 minutes
  });

  const remoteCache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
    defaultTTL: 3600, // 1 hour
  });

  return {
    /**
     * Gets a value from cache (local first, then remote)
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value or null
     */
    async get(key) {
      // Try local cache first
      const localValue = await localCache.get(key);
      if (localValue !== null) {
        return localValue;
      }

      // Try remote cache next
      const remoteValue = await remoteCache.get(key);
      if (remoteValue !== null) {
        // Update local cache
        await localCache.set(key, remoteValue);
      }

      return remoteValue;
    },

    /**
     * Sets a value in both local and remote cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>} Success indicator
     */
    async set(key, value, ttl) {
      const localTtl = Math.min(ttl || 300, 300); // Cap local TTL at 5 minutes

      // Update both caches
      await Promise.all([
        localCache.set(key, value, localTtl),
        remoteCache.set(key, value, ttl),
      ]);

      return true;
    },

    /**
     * Removes a value from both caches
     * @param {string} key - Cache key to delete
     * @returns {Promise<boolean>} Success indicator
     */
    async delete(key) {
      await Promise.all([localCache.delete(key), remoteCache.delete(key)]);

      return true;
    },
  };
}
```

#### Cache Middleware

```javascript
/**
 * Creates middleware for HTTP response caching
 * @param {Object} options - Middleware options
 * @param {number} options.ttl - Cache TTL in seconds
 * @param {Function} options.keyGenerator - Function to generate cache key
 * @returns {Function} Express middleware
 */
async function createCacheMiddleware(options = {}) {
  const {
    ttl = 300,
    keyGenerator = (req) => `http:${req.method}:${req.originalUrl}`,
  } = options;

  const cache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
  });

  return async function cacheMiddleware(req, res, next) {
    // Skip for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Check cache first
      const cachedResponse = await cache.get(cacheKey);

      if (cachedResponse) {
        // Cache hit, send response
        res.set('X-Cache', 'HIT');
        return res.json(cachedResponse);
      }

      // Cache miss, continue processing
      res.set('X-Cache', 'MISS');

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function (body) {
        // Store in cache before sending
        cache.set(cacheKey, body, ttl).catch((err) => {
          console.error('Cache error:', err);
        });

        // Call original method
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      // On cache error, continue without caching
      console.error('Cache middleware error:', error);
      next();
    }
  };
}
```

#### Cache Tags and Invalidation

```javascript
/**
 * Cache manager with tag-based invalidation
 */
async function createTaggableCache() {
  const cache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
  });

  return {
    /**
     * Sets a value with associated tags
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - TTL in seconds
     * @param {string[]} tags - Associated tags
     * @returns {Promise<boolean>} Success indicator
     */
    async set(key, value, ttl = 3600, tags = []) {
      // Store the value
      await cache.set(key, value, ttl);

      // Associate key with tags
      for (const tag of tags) {
        await cache.setMany({
          [`tag:${tag}:keys`]: key,
        });
      }

      // Store tags used for this key
      await cache.set(`key:${key}:tags`, tags);

      return true;
    },

    /**
     * Gets a cached value
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value
     */
    async get(key) {
      return cache.get(key);
    },

    /**
     * Invalidates all keys associated with tags
     * @param {string[]} tags - Tags to invalidate
     * @returns {Promise<number>} Number of invalidated keys
     */
    async invalidateTags(tags) {
      let invalidatedCount = 0;

      for (const tag of tags) {
        // Get all keys for this tag
        const keys = await cache.get(`tag:${tag}:keys`);

        if (keys) {
          // Delete each key
          if (Array.isArray(keys)) {
            await Promise.all(keys.map((key) => cache.delete(key)));
            invalidatedCount += keys.length;
          } else {
            await cache.delete(keys);
            invalidatedCount += 1;
          }
        }

        // Delete the tag entry itself
        await cache.delete(`tag:${tag}:keys`);
      }

      return invalidatedCount;
    },
  };
}
```

#### Rate Limiting with Cache

```javascript
/**
 * Creates rate limiting middleware using cache
 * @param {Object} options - Rate limiting options
 * @param {number} options.limit - Maximum requests per window
 * @param {number} options.window - Time window in seconds
 * @param {Function} options.keyGenerator - Function to generate client key
 * @returns {Function} Express middleware
 */
async function createRateLimiter(options = {}) {
  const {
    limit = 100,
    window = 3600,
    keyGenerator = (req) => req.ip,
  } = options;

  const cache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
  });

  return async function rateLimiter(req, res, next) {
    try {
      const clientKey = `ratelimit:${keyGenerator(req)}`;

      // Get current count
      const current = (await cache.get(clientKey)) || 0;

      // Check if limit exceeded
      if (current >= limit) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: window,
        });
      }

      // Increment counter
      await cache.set(clientKey, current + 1, window);

      // Set headers
      res.set({
        'X-RateLimit-Limit': limit,
        'X-RateLimit-Remaining': limit - current - 1,
        'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + window,
      });

      next();
    } catch (error) {
      // On error, allow request
      console.error('Rate limit error:', error);
      next();
    }
  };
}
```
