# Cache Module - Developer REFERENCE 🛠️

The cache module provides a unified caching interface for Node.js applications
with support for multiple backends including in-memory, Redis, and Memcached. It
offers a consistent API to store and retrieve data with automatic serialization
and TTL (time-to-live) functionality.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 💾 [Cache Strategies](#cache-strategies)
  - [In-Memory Cache](#in-memory-cache)
  - [Redis Cache](#redis-cache)
  - [Memcached](#memcached)
  - [Strategy Comparison](#strategy-comparison)
- 🔍 [Basic Operations](#basic-operations)
  - [Setting Values](#setting-values)
  - [Getting Values](#getting-values)
  - [Deleting Values](#deleting-values)
  - [Complete Basic Example](#complete-basic-example)
- 🧰 [Advanced Features](#advanced-features)
  - [Multi-Key Operations](#multi-key-operations)
  - [Pattern Operations](#pattern-operations)
  - [TTL Management](#ttl-management)
  - [Namespace Support](#namespace-support)
  - [Cache Aside Pattern](#cache-aside-pattern)
- 🏭 [Common Patterns](#common-patterns)
  - [Database Query Caching](#database-query-caching)
  - [API Response Caching](#api-response-caching)
  - [Session Storage](#session-storage)
  - [Rate Limiting](#rate-limiting)
  - [Memoization](#memoization)
- 🧩 [Architecture & Best Practices](#architecture--best-practices)
  - [Key Design](#key-design)
  - [Error Handling](#error-handling)
  - [Cache Invalidation](#cache-invalidation)
  - [Performance Optimization](#performance-optimization)
- 📚 [Additional Resources](#additional-resources)

## Getting Started

### Installation

```bash
npm install @voilajs/appkit

# Optional: Install specific cache backends
npm install redis         # For Redis cache
npm install memcached     # For Memcached
```

### Basic Import

```javascript
import { createCache } from '@voilajs/appkit/cache';
```

### Creating a Cache Instance

```javascript
// Basic memory cache (perfect for development)
const cache = await createCache();

// Redis cache (recommended for production)
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
});

// Memcached with multiple servers
const memcachedCache = await createCache({
  strategy: 'memcached',
  servers: ['localhost:11211'],
});
```

## Cache Strategies

The module supports multiple cache storage backends, each with its own
advantages and use cases.

### In-Memory Cache

In-memory caching stores data directly in your Node.js application's memory
space.

```javascript
const memoryCache = await createCache({
  strategy: 'memory',
  maxItems: 1000, // Maximum number of items
  maxSize: '100mb', // Maximum size
  defaultTTL: 3600, // Default TTL in seconds
});
```

**When to use:**

- **Development Environment**: Fast setup with no external dependencies
- **Single-Server Applications**: When data doesn't need to be shared between
  servers
- **Small Data Sets**: When memory usage is not a concern

### Redis Cache

Redis is an in-memory data structure store that can be used as a cache,
database, or message broker.

```javascript
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379', // Connection URL
  password: 'secret', // Redis password (optional)
  keyPrefix: 'myapp:', // Prefix for all keys (optional)
  defaultTTL: 3600, // Default TTL in seconds (optional)
});
```

**When to use:**

- **Production Environments**: For reliable, persistent caching
- **Multi-Server Deployments**: When cache needs to be shared across instances
- **Rich Features**: When you need pub/sub, transactions, or complex data
  structures

### Memcached

Memcached is a distributed memory object caching system designed for simplicity
and speed.

```javascript
const memcachedCache = await createCache({
  strategy: 'memcached',
  servers: ['localhost:11211'], // Array of server addresses
  defaultTTL: 3600, // Default TTL in seconds
  keyPrefix: 'myapp:', // Prefix for all keys
});
```

**When to use:**

- **Simple Key-Value Caching**: When you need basic caching without complexity
- **High-Traffic Applications**: Optimized for GET/SET operations at scale
- **Legacy Systems**: Many systems already have Memcached infrastructure

### Strategy Comparison

| Feature                | Memory                  | Redis                      | Memcached                  |
| ---------------------- | ----------------------- | -------------------------- | -------------------------- |
| **Performance**        | Fastest                 | Fast                       | Fast                       |
| **Persistence**        | No                      | Yes                        | No                         |
| **Shared Cache**       | No                      | Yes                        | Yes                        |
| **Data Structures**    | Basic                   | Rich                       | Basic                      |
| **Pattern Operations** | Yes                     | Yes                        | Limited                    |
| **Best For**           | Development, Small apps | Production, Most use cases | High traffic, Simple needs |

## Basic Operations

The cache module provides a consistent interface for common operations across
all cache strategies.

### Setting Values

Use `set` to store values in the cache, with optional time-to-live (TTL).

```javascript
// Basic usage (stores indefinitely)
await cache.set('user:123', { name: 'Alice', email: 'alice@example.com' });

// With explicit TTL (expires after 1 hour)
await cache.set('session:abc', { userId: 123 }, 3600);
```

**When to use:**

- **User Data**: Cache user profiles, settings, or preferences
- **API Results**: Store results from external API calls
- **Computed Data**: Store results of expensive computations

### Getting Values

Use `get` to retrieve values from the cache.

```javascript
// Basic retrieval
const user = await cache.get('user:123');

// Handling cache misses
const session = await cache.get('expired-session');
if (session === null) {
  console.log('Cache miss - session not found or expired');
}

// Check if key exists
const exists = await cache.has('user:123');
```

**When to use:**

- **Before Database Queries**: Check cache before hitting database
- **API Response Caching**: Check for cached responses before processing
- **Computed Results**: Retrieve previously computed results

### Deleting Values

Use `delete` to remove values from the cache.

```javascript
// Delete a single key
await cache.delete('user:123');

// Clear entire cache
await cache.clear();
```

**When to use:**

- **User Logout**: Clear user session and data
- **Data Updates**: Remove cached item when source data changes
- **Security Actions**: Clear sensitive data when access changes

### Complete Basic Example

```javascript
import { createCache } from '@voilajs/appkit/cache';

async function main() {
  // Create cache instance
  const cache = await createCache({
    strategy: 'redis',
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultTTL: 3600, // 1 hour default TTL
  });

  // Store user data
  await cache.set('user:123', {
    id: 123,
    name: 'Alice',
    email: 'alice@example.com',
  });

  // Retrieve user data
  const user = await cache.get('user:123');
  console.log('User:', user);

  // Delete session
  await cache.delete('session:xyz');
}

main().catch(console.error);
```

## Advanced Features

The cache module provides several advanced features for more complex caching
scenarios.

### Multi-Key Operations

Batch operations for better performance when working with multiple keys.

```javascript
// Store multiple values at once
await cache.setMany(
  {
    'user:123': { name: 'Alice' },
    'user:456': { name: 'Bob' },
  },
  3600
); // All with 1 hour TTL

// Retrieve multiple values at once
const users = await cache.getMany(['user:123', 'user:456']);

// Delete multiple keys at once
const deletedCount = await cache.deleteMany(['user:123', 'user:456']);
```

**When to use:**

- **Bulk Data Loading**: When populating cache with multiple items
- **Related Data**: When fetching groups of related items

### Pattern Operations

Work with groups of keys using pattern matching (primarily for Redis).

```javascript
// Get all keys matching a pattern
const userKeys = await cache.keys('user:*');

// Delete all keys matching a pattern
const deletedCount = await cache.deletePattern('session:*');

// Get remaining TTL for a key
const ttl = await cache.ttl('user:123');

// Update TTL for existing key
await cache.expire('user:123', 7200); // Extend to 2 hours
```

**When to use:**

- **Cache Invalidation**: When invalidating groups of related items
- **Maintenance**: When clearing certain types of cached data
- **TTL Management**: When managing expiration of existing items

### TTL Management

Control cache item expiration for different data types.

```javascript
// Different TTLs for different types of data
await cache.set('user:profile:123', profileData, 86400); // 1 day
await cache.set('user:session:123', sessionData, 1800); // 30 minutes

// Store with no expiration
await cache.set('app:version', '1.2.3', 0); // Never expires
```

**When to use:**

- **User Sessions**: Short TTL (minutes to hours)
- **User Profiles**: Longer TTL (days)
- **Configuration**: Long TTL or no expiration

### Namespace Support

Create isolated cache spaces with automatic key prefixing.

```javascript
// Create namespaced cache instances
const userCache = cache.namespace('user');
const productCache = cache.namespace('product');

// Use namespaced caches normally
await userCache.set('123', userData); // Actually sets 'user:123'
await productCache.set('456', productData); // Actually sets 'product:456'

// Clear only user cache
await userCache.clear(); // Only clears keys with 'user:' prefix
```

**When to use:**

- **Module Isolation**: Separate cache keys by module
- **Multi-tenant Applications**: Isolate data between tenants
- **Feature Segregation**: Keep feature data separate

### Cache Aside Pattern

Simplified implementation of the cache aside pattern for streamlined data
retrieval.

```javascript
// Using getOrSet for atomic cache aside pattern
const user = await cache.getOrSet(
  'user:123',
  async () => {
    // This function only runs on cache miss
    console.log('Cache miss - fetching from database');
    return await database.findUserById('123');
  },
  3600 // 1 hour TTL
);
```

**When to use:**

- **Database Queries**: Streamline database access
- **API Calls**: Simplify API response caching
- **Expensive Computations**: Cache computation results

## Common Patterns

### Database Query Caching

Cache database query results to reduce database load and improve response times.

```javascript
async function getUserWithPosts(userId) {
  // Try cache first for user
  const cacheKey = `user:${userId}`;
  let user = await cache.get(cacheKey);

  if (!user) {
    // Cache miss - query database
    user = await db.findUserById(userId);

    // Store in cache for future requests
    if (user) {
      await cache.set(cacheKey, user, 3600); // 1 hour cache
    }
  }

  return user;
}

// Alternative using getOrSet
async function getUserById(userId) {
  return cache.getOrSet(
    `user:${userId}`,
    async () => db.findUserById(userId),
    3600 // 1 hour cache
  );
}
```

### API Response Caching

Cache external API responses to reduce latency and API usage.

```javascript
// Express middleware for response caching
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = `api:${req.originalUrl}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function (body) {
      cache.set(cacheKey, body, ttl);
      return originalJson.call(this, body);
    };

    next();
  };
}

// Usage
app.get('/api/products', cacheMiddleware(600), async (req, res) => {
  const products = await db.product.findMany();
  res.json(products);
});
```

### Session Storage

Use cache as a session store for web applications.

```javascript
import session from 'express-session';

// Simple session store implementation
class CacheSessionStore extends session.Store {
  constructor(cache, ttl = 86400) {
    super();
    this.cache = cache;
    this.ttl = ttl;
  }

  async get(sid, callback) {
    try {
      const data = await this.cache.get(`session:${sid}`);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, session, callback) {
    try {
      await this.cache.set(`session:${sid}`, session, this.ttl);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await this.cache.delete(`session:${sid}`);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

// Usage
const sessionStore = new CacheSessionStore(cache, 3600); // 1 hour

app.use(
  session({
    store: sessionStore,
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false,
  })
);
```

### Rate Limiting

Implement rate limiting to protect APIs and endpoints.

```javascript
async function rateLimit(req, limit = 100, window = 60) {
  const key = `ratelimit:${req.ip}`;

  // Get current count
  const count = (await cache.get(key)) || 0;

  if (count >= limit) {
    return false; // Rate limit exceeded
  }

  // Increment count
  await cache.set(key, count + 1, window);
  return true;
}

// Usage in Express middleware
async function rateLimiter(req, res, next) {
  const allowed = await rateLimit(req, 100, 60); // 100 requests per minute

  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  next();
}
```

### Memoization

Cache function results for expensive operations.

```javascript
function memoize(fn, ttl = 3600) {
  return async function (...args) {
    const key = `memo:${fn.name}:${JSON.stringify(args)}`;

    return cache.getOrSet(
      key,
      async () => {
        return fn(...args);
      },
      ttl
    );
  };
}

// Example usage
async function fetchUserData(userId) {
  // Expensive operation...
  return { id: userId, name: 'User ' + userId };
}

const memoizedFetchUser = memoize(fetchUserData, 300); // 5 minutes cache

// First call: executes function
const user1 = await memoizedFetchUser(123);

// Second call: returns from cache
const user2 = await memoizedFetchUser(123);
```

## Architecture & Best Practices

### Key Design

Designing effective cache keys is crucial for maintainability and performance.

```javascript
// Hierarchical keys
const userKey = `user:${userId}`;
const userProfileKey = `user:${userId}:profile`;
const userPostsKey = `user:${userId}:posts`;

// Versioned keys for cache invalidation
const API_VERSION = 'v1';
const versionedKey = `${API_VERSION}:${key}`;

// Context-aware keys
const contextKey = `product:${id}:lang:${language}:region:${region}`;
```

Key design best practices:

1. **Hierarchical Keys**: Use colons to separate hierarchical components
2. **Versioning**: Include version in keys for easy invalidation
3. **Consistent Formatting**: Use consistent patterns across your application
4. **Namespacing**: Use prefixes to separate different parts of your application
5. **Keep It Short**: Avoid unnecessarily long keys to reduce memory usage

### Error Handling

Robust error handling ensures your application remains functional even when
cache failures occur.

```javascript
// Graceful degradation
async function getUserWithFallback(userId) {
  try {
    const cached = await cache.get(`user:${userId}`);
    if (cached) return cached;
  } catch (error) {
    console.error('Cache error:', error);
    // Continue to fallback
  }

  // Cache miss or error, fetch from database
  return db.findUserById(userId);
}
```

Error handling best practices:

1. **Graceful Degradation**: Continue without cache on failures
2. **Logging**: Log cache failures but don't let them affect user experience
3. **Fallbacks**: Always have a fallback data source
4. **Non-blocking Cache Operations**: Don't let cache writes block your
   application

### Cache Invalidation

Effective cache invalidation strategies help maintain data freshness.

```javascript
// Direct invalidation on update
async function updateUser(userId, data) {
  // Update database
  await db.updateUser(userId, data);

  // Invalidate specific cache entry
  await cache.delete(`user:${userId}`);
}

// Pattern invalidation
async function updateCategory(categoryId) {
  // Invalidate all related cache entries
  await cache.deletePattern(`category:${categoryId}*`);
}

// Time-based expiration
await cache.set('volatile:data', data, 300); // 5 minutes

// Version-based invalidation
const CACHE_VERSION = '2';
function getVersionedKey(key) {
  return `v${CACHE_VERSION}:${key}`;
}
```

Invalidation strategies:

1. **Direct Invalidation**: Delete specific keys when data changes
2. **Pattern Invalidation**: Delete groups of related keys
3. **Time-Based Expiration**: Set appropriate TTLs based on data volatility
4. **Version-Based Invalidation**: Include version in keys and change version to
   invalidate
5. **Batch Invalidation**: Delete multiple related keys in one operation

### Performance Optimization

Optimize cache usage for better application performance.

```javascript
// Use batch operations
const users = await cache.getMany(['user:1', 'user:2', 'user:3']);

// Use namespaces for organization
const userCache = cache.namespace('user');
const productCache = cache.namespace('product');

// Set appropriate TTLs
await cache.set('static:data', data, 86400); // 1 day
await cache.set('dynamic:data', data, 300); // 5 minutes

// Use compression for large values
const compressed = await compress(JSON.stringify(largeData));
await cache.set('large:data', compressed);
```

Optimization best practices:

1. **Batch Operations**: Use getMany/setMany for multiple operations
2. **Appropriate TTLs**: Balance freshness with performance
3. **Selective Caching**: Cache only what provides performance benefits
4. **Compression**: Consider compressing large values
5. **Monitoring**: Track cache hit/miss rates and adjust strategy

## Additional Resources

- 📘
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/API_REFERENCE.md) -
  Complete API documentation
- 📗
  [Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation
- 📙
  [Examples](https://github.com/voilajs/appkit/blob/main/src/cache/examples) -
  Code examples and patterns

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
