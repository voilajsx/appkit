# @voilajs/appkit - Cache Module 🚀

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A unified caching interface with support for multiple backends to boost
> application performance

The Cache module provides a flexible, powerful caching solution for Node.js
applications with support for in-memory, Redis, and Memcached backends. It
offers a consistent API to store, retrieve, and manage cached data with
automatic serialization and TTL management.

## 🚀 Features

- **💾 Multiple Backend Support** - In-memory, Redis, and Memcached
  implementations
- **⏱️ TTL Management** - Automatic expiration of cached items
- **🗂️ Namespaces** - Organize cache keys with logical grouping
- **🔄 Batch Operations** - Efficient bulk access and manipulation
- **🧠 Smart Patterns** - Built-in cache-aside pattern with `getOrSet`
- **🔍 Pattern Matching** - Find and delete keys using glob patterns
- **🧩 Consistent API** - Same interface across all backends
- **🔌 Framework Agnostic** - Works with any Node.js application

## 📦 Installation

```bash
npm install @voilajs/appkit

# Optional: Install backend-specific dependencies
npm install redis       # For Redis support
npm install memcached   # For Memcached support
```

## 🏃‍♂️ Quick Start

```javascript
import { createCache } from '@voilajs/appkit/cache';

// Create a cache instance
const cache = await createCache({
  strategy: 'memory', // or 'redis', 'memcached'
  // strategy-specific options
});

// Store a value (with optional TTL)
await cache.set('user:123', { name: 'Alice', role: 'admin' }, 3600); // 1 hour TTL

// Retrieve a value
const user = await cache.get('user:123');
console.log(user.name); // 'Alice'

// Store multiple values
await cache.setMany({
  'product:1': { name: 'Laptop', price: 999 },
  'product:2': { name: 'Phone', price: 699 },
});

// Use cache-aside pattern
const product = await cache.getOrSet(
  'product:3',
  async () => {
    // This only runs on cache miss
    return { name: 'Tablet', price: 499 };
  },
  1800 // 30 minutes TTL
);
```

## 📋 Examples

### Cache Strategies

```javascript
// In-memory cache (perfect for development)
const memoryCache = await createCache({
  strategy: 'memory',
  maxItems: 1000, // Limit number of items
  defaultTTL: 3600, // Default TTL in seconds
});

// Redis cache (recommended for production)
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
  keyPrefix: 'myapp:', // Prefix for all keys
  defaultTTL: 3600, // Default TTL in seconds
});

// Memcached with multiple servers
const memcachedCache = await createCache({
  strategy: 'memcached',
  servers: ['localhost:11211', 'cache2.example.com:11211'],
  keyPrefix: 'myapp:',
  defaultTTL: 3600,
});
```

### Cache Namespaces

```javascript
// Create namespaced caches for different data types
const userCache = cache.namespace('user');
const productCache = cache.namespace('product');

// These operations use the appropriate namespace
await userCache.set('123', userData); // Actual key: 'user:123'
await productCache.set('456', productData); // Actual key: 'product:456'

// Nested namespaces
const adminCache = userCache.namespace('admin');
await adminCache.set('789', adminData); // Actual key: 'user:admin:789'

// Clear only products
await productCache.clear(); // Only clears keys with 'product:' prefix
```

### Database Query Caching

```javascript
import { createCache } from '@voilajs/appkit/cache';
import { db } from './database';

const cache = await createCache({ strategy: 'redis' });

// Cache function to retrieve user with posts
async function getUserWithPosts(userId) {
  // Get user data with cache-aside pattern
  const user = await cache.getOrSet(
    `user:${userId}`,
    async () => db.findUserById(userId),
    3600 // 1 hour cache
  );

  // Get user posts with cache-aside pattern
  const posts = await cache.getOrSet(
    `user:${userId}:posts`,
    async () => db.findPostsByUserId(userId),
    1800 // 30 minutes cache
  );

  return { user, posts };
}

// Clear cache when user is updated
async function updateUser(userId, data) {
  // Update database
  await db.updateUser(userId, data);

  // Invalidate user-related cache
  await cache.deletePattern(`user:${userId}*`);
}
```

### API Response Caching

```javascript
import { createCache } from '@voilajs/appkit/cache';
import express from 'express';

const app = express();
const cache = await createCache({ strategy: 'redis' });

// Express middleware for caching API responses
function cacheMiddleware(ttl = 300) {
  // Default: 5 minutes
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = `api:${req.originalUrl}`;

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
        cache.set(cacheKey, body, ttl);

        // Call original method
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      // Continue without caching on error
      next();
    }
  };
}

// Apply middleware to routes
app.get('/api/products', cacheMiddleware(600), (req, res) => {
  // This response will be cached for 10 minutes
  res.json(products);
});
```

## 🔍 Core Functions

### Cache Creation

| Method                 | Description                  | Use Cases                                    |
| ---------------------- | ---------------------------- | -------------------------------------------- |
| `createCache(options)` | Creates a new cache instance | Configuring cache for different environments |

```javascript
const cache = await createCache({
  strategy: 'redis', // 'memory', 'redis', or 'memcached'
  url: process.env.REDIS_URL,
  keyPrefix: 'myapp:',
  defaultTTL: 3600,
});
```

### Basic Operations

| Method                  | Description          | Use Cases                                       |
| ----------------------- | -------------------- | ----------------------------------------------- |
| `get(key)`              | Retrieves a value    | Loading cached user data, API responses         |
| `set(key, value, ttl?)` | Stores a value       | Caching query results, responses, computed data |
| `has(key)`              | Checks if key exists | Validating cache before operations              |
| `delete(key)`           | Removes a key        | Invalidating data after updates                 |
| `clear()`               | Clears entire cache  | Resetting cache during deployments              |

### Batch Operations

| Method                 | Description                | Use Cases                    |
| ---------------------- | -------------------------- | ---------------------------- |
| `getMany(keys)`        | Retrieves multiple values  | Batch loading related data   |
| `setMany(items, ttl?)` | Stores multiple key-values | Caching collections of items |
| `deleteMany(keys)`     | Removes multiple keys      | Batch invalidation           |

### Pattern Operations

| Method                   | Description                   | Use Cases                    |
| ------------------------ | ----------------------------- | ---------------------------- |
| `deletePattern(pattern)` | Removes keys matching pattern | Clearing user-specific cache |
| `keys(pattern)`          | Gets keys matching pattern    | Finding related cache keys   |

### TTL Management

| Method             | Description                 | Use Cases                  |
| ------------------ | --------------------------- | -------------------------- |
| `ttl(key)`         | Gets remaining time-to-live | Checking expiration time   |
| `expire(key, ttl)` | Updates expiration time     | Extending session lifetime |

### Advanced Features

| Method                         | Description              | Use Cases                        |
| ------------------------------ | ------------------------ | -------------------------------- |
| `namespace(prefix)`            | Creates namespaced cache | Organizing cache by feature area |
| `getOrSet(key, factory, ttl?)` | Gets or sets if missing  | Implementing cache-aside pattern |

## 🛡️ Best Practices

1. **Choose the right strategy**: Use memory cache for development and
   Redis/Memcached for production
2. **Set appropriate TTLs**: Balance freshness with performance based on data
   volatility
3. **Use namespaces**: Organize your cache keys to avoid collisions
4. **Consider key design**: Use consistent, hierarchical keys (e.g.,
   `user:123:profile`)
5. **Invalidate properly**: Delete related cache when data changes
6. **Handle errors gracefully**: Don't let cache failures affect user experience
7. **Monitor cache usage**: Watch hit/miss ratios and memory usage

## 🔧 Performance Tips

- Use batch operations (`getMany`, `setMany`) for multiple related items
- Leverage the `getOrSet` method for implementing the cache-aside pattern
- Choose appropriate TTLs based on data volatility
- Implement a fallback mechanism when cache is unavailable
- Consider compression for large values in Redis/Memcached

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
