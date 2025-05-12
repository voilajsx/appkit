# @voilajs/appkit/cache - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Cache implementations should be adaptable to different contexts

## Function Signatures

### 1. `createCache`

```typescript
async function createCache(options: {
  strategy?: 'memory' | 'redis' | 'memcached';
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

### 2. `get`

```typescript
async function get(key: string): Promise<any | null>;
```

### 3. `set`

```typescript
async function set(key: string, value: any, ttl?: number): Promise<boolean>;
```

- Default `ttl`: Uses instance defaultTTL or no expiration

### 4. `has`

```typescript
async function has(key: string): Promise<boolean>;
```

### 5. `delete`

```typescript
async function delete(key: string): Promise<boolean>;
```

### 6. `clear`

```typescript
async function clear(): Promise<void>;
```

### 7. `getMany`

```typescript
async function getMany(keys: string[]): Promise<Array<any | null>>;
```

### 8. `setMany`

```typescript
async function setMany(
  items: Record<string, any>,
  ttl?: number
): Promise<boolean>;
```

- Default `ttl`: Uses instance defaultTTL or no expiration

### 9. `deleteMany`

```typescript
async function deleteMany(keys: string[]): Promise<number>;
```

### 10. `deletePattern`

```typescript
async function deletePattern(pattern: string): Promise<number>;
```

### 11. `keys`

```typescript
async function keys(pattern?: string): Promise<string[]>;
```

- Default `pattern`: `'*'`

### 12. `ttl`

```typescript
async function ttl(key: string): Promise<number>;
```

### 13. `expire`

```typescript
async function expire(key: string, ttl: number): Promise<boolean>;
```

### 14. `namespace`

```typescript
function namespace(prefix: string): CacheInterface;
```

### 15. `getOrSet`

```typescript
async function getOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T>;
```

- Default `ttl`: Uses instance defaultTTL or no expiration

## Example Implementations

### Basic Cache Operations

```javascript
/**
 * Retrieves a user from cache or database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 * @throws {Error} If cache or database operations fail
 */
async function getUser(userId) {
  const cache = await createCache({
    strategy: 'redis',
    url: process.env.REDIS_URL,
    defaultTTL: 3600, // 1 hour
  });

  const cacheKey = `user:${userId}`;

  try {
    // Check cache first
    let user = await cache.get(cacheKey);

    if (!user) {
      // Cache miss, fetch from database
      user = await db.users.findOne({ id: userId });

      if (user) {
        // Store in cache
        await cache.set(cacheKey, user);
      }
    }

    return user;
  } catch (error) {
    console.error('Error retrieving user:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}
```

### Cache-Aside Pattern

```javascript
/**
 * Implements cache-aside pattern for data retrieval
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data on cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Retrieved data
 * @throws {Error} If cache operations or fetchFunction fail
 */
async function cacheAside(key, fetchFunction, ttl = 3600) {
  if (!key || typeof key !== 'string') {
    throw new Error('Cache key must be a non-empty string');
  }

  if (typeof fetchFunction !== 'function') {
    throw new Error('fetchFunction must be a function');
  }

  const cache = await createCache({
    strategy: 'redis',
    url: process.env.REDIS_URL,
  });

  try {
    // Try cache first
    const cachedData = await cache.get(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // Cache miss, fetch data
    const freshData = await fetchFunction();

    // Store in cache if we got valid data
    if (freshData !== undefined && freshData !== null) {
      await cache.set(key, freshData, ttl);
    }

    return freshData;
  } catch (error) {
    console.error('Cache-aside pattern failed:', error);
    throw new Error(`Cache operation failed: ${error.message}`);
  }
}
```

### Multi-Level Cache

```javascript
/**
 * Creates a multi-level cache with local memory and Redis
 * @param {Object} options - Cache configuration options
 * @param {number} options.localTTL - Local cache TTL in seconds
 * @param {number} options.remoteTTL - Remote cache TTL in seconds
 * @returns {Object} Multi-level cache interface
 * @throws {Error} If cache creation fails
 */
async function createMultiLevelCache(options = {}) {
  const {
    localTTL = 300, // 5 minutes
    remoteTTL = 3600, // 1 hour
  } = options;

  try {
    const localCache = await createCache({
      strategy: 'memory',
      maxItems: 1000,
      defaultTTL: localTTL,
    });

    const remoteCache = await createCache({
      strategy: 'redis',
      url: process.env.REDIS_URL,
      defaultTTL: remoteTTL,
    });

    return {
      /**
       * Gets a value from cache (local first, then remote)
       * @param {string} key - Cache key
       * @returns {Promise<any>} Cached value or null
       * @throws {Error} If cache operations fail
       */
      async get(key) {
        if (!key || typeof key !== 'string') {
          throw new Error('Cache key must be a non-empty string');
        }

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
       * @throws {Error} If cache operations fail
       */
      async set(key, value, ttl) {
        if (!key || typeof key !== 'string') {
          throw new Error('Cache key must be a non-empty string');
        }

        const remoteTtl = ttl || remoteTTL;
        const localTtl = Math.min(ttl || localTTL, localTTL);

        // Update both caches
        await Promise.all([
          localCache.set(key, value, localTtl),
          remoteCache.set(key, value, remoteTtl),
        ]);

        return true;
      },

      /**
       * Removes a value from both caches
       * @param {string} key - Cache key to delete
       * @returns {Promise<boolean>} Success indicator
       * @throws {Error} If cache operations fail
       */
      async delete(key) {
        if (!key || typeof key !== 'string') {
          throw new Error('Cache key must be a non-empty string');
        }

        await Promise.all([localCache.delete(key), remoteCache.delete(key)]);

        return true;
      },
    };
  } catch (error) {
    throw new Error(`Failed to create multi-level cache: ${error.message}`);
  }
}
```

### Cache Middleware

```javascript
/**
 * Creates middleware for HTTP response caching
 * @param {Object} options - Middleware options
 * @param {number} options.ttl - Cache TTL in seconds
 * @param {Function} options.keyGenerator - Function to generate cache key
 * @returns {Function} Express middleware
 * @throws {Error} If cache creation fails
 */
async function createCacheMiddleware(options = {}) {
  const {
    ttl = 300,
    keyGenerator = (req) => `http:${req.method}:${req.originalUrl}`,
  } = options;

  try {
    const cache = await createCache({
      strategy: 'redis',
      url: process.env.REDIS_URL,
    });

    /**
     * Express middleware function
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
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
  } catch (error) {
    throw new Error(`Failed to create cache middleware: ${error.message}`);
  }
}
```

### Using getOrSet for Memoization

```javascript
/**
 * Memoizes an expensive function using cache
 * @param {Function} fn - Function to memoize
 * @param {Object} options - Memoization options
 * @param {string} options.prefix - Key prefix for cache
 * @param {number} options.ttl - Cache TTL in seconds
 * @param {Function} options.keyGenerator - Function to generate cache key from args
 * @returns {Function} Memoized function
 * @throws {Error} If cache creation fails
 */
async function memoize(fn, options = {}) {
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }

  const {
    prefix = 'memo:',
    ttl = 3600,
    keyGenerator = (...args) => JSON.stringify(args),
  } = options;

  try {
    const cache = await createCache({
      strategy: 'memory',
      maxItems: 500,
    });

    /**
     * Memoized function
     * @param {...any} args - Original function arguments
     * @returns {Promise<any>} Function result
     * @throws {Error} If original function throws or cache fails
     */
    return async function memoized(...args) {
      const key = `${prefix}${keyGenerator(...args)}`;

      return cache.getOrSet(
        key,
        async () => {
          return await fn(...args);
        },
        ttl
      );
    };
  } catch (error) {
    throw new Error(`Failed to create memoization cache: ${error.message}`);
  }
}
```

## Code Generation Rules

1. **Always use async/await** for cache operations
2. **Include error handling** in all examples
3. **Use environment variables** for connection strings
4. **Follow JSDoc format** exactly as shown above
5. **Check parameters** before using them
6. **Always include TTL** for cache operations or use defaults
7. **Handle cache misses** gracefully
8. **Use try/catch blocks** for all async operations

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
