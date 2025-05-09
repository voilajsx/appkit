# Cache Module

The cache module provides a unified caching interface with support for multiple backends including Redis, Memcached, and in-memory storage. It offers simple key-value operations, automatic serialization, and TTL (time-to-live) support to help improve your application's performance.

## Table of Contents

- [What is Caching?](#what-is-caching)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Caching Strategies](#caching-strategies)
  - [In-Memory Cache](#in-memory-cache)
  - [Redis Cache](#redis-cache)
  - [Memcached](#memcached)
  - [Strategy Comparison](#strategy-comparison)
- [Usage Examples](#usage-examples)
  - [Basic Operations](#basic-operations)
  - [Pattern-Based Operations](#pattern-based-operations)
  - [Cache Invalidation](#cache-invalidation)
  - [Cache Warming](#cache-warming)
- [Common Patterns](#common-patterns)
  - [Database Query Caching](#database-query-caching)
  - [API Response Caching](#api-response-caching)
  - [Session Storage](#session-storage)
  - [Rate Limiting](#rate-limiting)
- [Advanced Usage](#advanced-usage)
  - [Cache Namespaces](#cache-namespaces)
  - [Cache Decorators](#cache-decorators)
  - [Distributed Caching](#distributed-caching)
- [Best Practices](#best-practices)
- [Performance Tuning](#performance-tuning)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## What is Caching?

Caching is a technique to store frequently accessed data in a fast storage layer, reducing the need to fetch it from slower sources (like databases) repeatedly.

### Why Use Caching?

**Without Caching:**
```
Client → Server → Database → Server → Client
(Slow, high database load)
```

**With Caching:**
```
Client → Server → Cache → Server → Client
(Fast, reduced database load)
```

### Benefits

1. **Performance**: Faster response times
2. **Scalability**: Reduced database load
3. **Cost**: Lower infrastructure costs
4. **Reliability**: Better handling of traffic spikes

## Installation

```bash
npm install @voilajs/appkit

# Optional: Install specific cache backends
npm install redis        # For Redis cache
npm install memcached    # For Memcached
```

## Quick Start

```javascript
import { createCache } from '@voilajs/appkit/cache';

// Create cache instance
const cache = await createCache({
  strategy: 'redis',
  url: process.env.REDIS_URL
});

// Store data
await cache.set('user:123', { name: 'John', email: 'john@example.com' });

// Retrieve data
const user = await cache.get('user:123');
console.log(user); // { name: 'John', email: 'john@example.com' }

// Set with expiration (TTL in seconds)
await cache.set('session:abc', { userId: 123 }, 3600); // Expires in 1 hour
```

## Caching Strategies

### In-Memory Cache

Best for single-server applications and development.

```javascript
const cache = await createCache({
  strategy: 'memory',
  maxItems: 1000,    // Maximum items to store
  maxSize: '100mb'   // Maximum memory usage
});
```

**Pros:**
- No external dependencies
- Fastest performance
- Perfect for development

**Cons:**
- Data lost on restart
- Not shared between servers
- Limited by server memory

### Redis Cache

Best for production and distributed applications.

```javascript
const cache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
  password: 'your-password',
  keyPrefix: 'myapp:',  // Namespace all keys
  enableCluster: false   // For Redis Cluster
});
```

**Pros:**
- Persistent storage
- Shared between servers
- Rich feature set
- Highly scalable

**Cons:**
- External dependency
- Additional infrastructure
- Network latency

### Memcached

Best for simple key-value caching at scale.

```javascript
const cache = await createCache({
  strategy: 'memcached',
  servers: ['localhost:11211'],
  options: {
    timeout: 5000,
    retries: 2
  }
});
```

**Pros:**
- Very fast
- Simple protocol
- Multi-threaded

**Cons:**
- No persistence
- Limited data structures
- Fixed memory allocation

### Strategy Comparison

| Feature | Memory | Redis | Memcached |
|---------|---------|--------|-----------|
| **Performance** | Fastest | Fast | Fast |
| **Persistence** | No | Yes | No |
| **Scalability** | Single server | Multi-server | Multi-server |
| **Data Types** | Basic | Rich | Basic |
| **Memory Management** | Automatic | Configurable | Pre-allocated |
| **Use Case** | Dev/Small apps | Production | High-traffic |

## Usage Examples

### Basic Operations

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });

// Set a value
await cache.set('key', 'value');

// Set with TTL (expires in 1 hour)
await cache.set('temp:key', 'value', 3600);

// Get a value
const value = await cache.get('key');

// Check if key exists
const exists = await cache.has('key');

// Delete a key
await cache.delete('key');

// Set multiple values
await cache.setMany({
  'user:1': { name: 'John' },
  'user:2': { name: 'Jane' }
});

// Get multiple values
const users = await cache.getMany(['user:1', 'user:2']);

// Clear entire cache
await cache.clear();
```

### Pattern-Based Operations

```javascript
// Delete keys matching pattern
await cache.deletePattern('user:*');

// Get keys matching pattern
const keys = await cache.keys('session:*');

// Get values matching pattern
const sessions = await cache.getPattern('session:*');
```

### Cache Invalidation

```javascript
// Manual invalidation
async function updateUser(userId, data) {
  // Update database
  await db.user.update({ where: { id: userId }, data });
  
  // Invalidate cache
  await cache.delete(`user:${userId}`);
  await cache.deletePattern(`user:${userId}:*`);
}

// Tag-based invalidation
await cache.set('product:123', product, 3600, ['products', 'category:electronics']);
await cache.set('product:456', product, 3600, ['products', 'category:books']);

// Invalidate all products
await cache.invalidateTags(['products']);

// Invalidate specific category
await cache.invalidateTags(['category:electronics']);
```

### Cache Warming

```javascript
// Pre-populate cache on startup
async function warmCache() {
  const popularProducts = await db.product.findMany({
    where: { views: { gt: 1000 } },
    take: 100
  });
  
  for (const product of popularProducts) {
    await cache.set(`product:${product.id}`, product, 3600);
  }
  
  console.log('Cache warmed with popular products');
}

// Warm cache on application start
app.listen(3000, async () => {
  await warmCache();
  console.log('Server started');
});
```

## Common Patterns

### Database Query Caching

```javascript
async function getUser(userId) {
  const cacheKey = `user:${userId}`;
  
  // Try cache first
  let user = await cache.get(cacheKey);
  
  if (!user) {
    // Cache miss - fetch from database
    user = await db.user.findUnique({ where: { id: userId } });
    
    if (user) {
      // Store in cache for 1 hour
      await cache.set(cacheKey, user, 3600);
    }
  }
  
  return user;
}

// With cache-aside pattern helper
async function getUserCached(userId) {
  return cache.getOrSet(
    `user:${userId}`,
    async () => db.user.findUnique({ where: { id: userId } }),
    3600
  );
}
```

### API Response Caching

```javascript
// Cache middleware
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();
    
    const cacheKey = `api:${req.originalUrl}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Store original json function
    const originalJson = res.json;
    
    // Override json function to cache response
    res.json = function(body) {
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

```javascript
// Session store implementation
class CacheSessionStore {
  constructor(cache, options = {}) {
    this.cache = cache;
    this.ttl = options.ttl || 86400; // 24 hours
    this.prefix = options.prefix || 'session:';
  }
  
  async get(sessionId) {
    return this.cache.get(this.prefix + sessionId);
  }
  
  async set(sessionId, session) {
    return this.cache.set(this.prefix + sessionId, session, this.ttl);
  }
  
  async destroy(sessionId) {
    return this.cache.delete(this.prefix + sessionId);
  }
  
  async touch(sessionId) {
    const session = await this.get(sessionId);
    if (session) {
      await this.set(sessionId, session);
    }
  }
}

// Usage with Express session
import session from 'express-session';

const sessionStore = new CacheSessionStore(cache);

app.use(session({
  store: sessionStore,
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false
}));
```

### Rate Limiting

```javascript
async function rateLimit(key, limit = 100, window = 3600) {
  const current = await cache.get(key) || 0;
  
  if (current >= limit) {
    return false; // Rate limit exceeded
  }
  
  // Increment counter
  await cache.set(key, current + 1, window);
  return true;
}

// Rate limiting middleware
function createRateLimiter(options = {}) {
  const {
    limit = 100,
    window = 3600,
    keyGenerator = (req) => req.ip
  } = options;
  
  return async (req, res, next) => {
    const key = `rate:${keyGenerator(req)}`;
    const allowed = await rateLimit(key, limit, window);
    
    if (!allowed) {
      return res.status(429).json({ 
        error: 'Too many requests' 
      });
    }
    
    next();
  };
}

// Usage
app.use('/api', createRateLimiter({
  limit: 100,
  window: 900 // 15 minutes
}));
```

## Advanced Usage

### Cache Namespaces

```javascript
// Create namespaced cache instances
const userCache = cache.namespace('users');
const productCache = cache.namespace('products');

// Operations are automatically namespaced
await userCache.set('123', userData);    // Actually sets 'users:123'
await productCache.set('456', productData); // Actually sets 'products:456'

// Clear specific namespace
await userCache.clear(); // Only clears 'users:*' keys
```

### Cache Decorators

```javascript
// Function decorator for automatic caching
function cached(ttl = 3600) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached) return cached;
      
      // Call original method
      const result = await originalMethod.apply(this, args);
      
      // Cache result
      await cache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

// Usage
class UserService {
  @cached(3600)
  async getUser(userId) {
    return db.user.findUnique({ where: { id: userId } });
  }
  
  @cached(300)
  async searchUsers(query) {
    return db.user.findMany({ 
      where: { name: { contains: query } } 
    });
  }
}
```

### Distributed Caching

```javascript
// Distributed cache with Redis Cluster
const cache = await createCache({
  strategy: 'redis',
  enableCluster: true,
  clusterNodes: [
    { host: 'redis-node-1', port: 6379 },
    { host: 'redis-node-2', port: 6379 },
    { host: 'redis-node-3', port: 6379 }
  ],
  clusterOptions: {
    redisOptions: {
      password: 'cluster-password'
    }
  }
});

// Pub/Sub for cache invalidation
const pubsub = cache.pubsub();

// Subscribe to invalidation events
pubsub.subscribe('cache:invalidate', async (message) => {
  const { keys } = JSON.parse(message);
  await Promise.all(keys.map(key => cache.delete(key)));
});

// Publish invalidation
pubsub.publish('cache:invalidate', JSON.stringify({
  keys: ['user:123', 'user:456']
}));
```

## Best Practices

### 1. Use Appropriate TTLs

```javascript
// Short TTL for frequently changing data
await cache.set('stock:AAPL', stockData, 30); // 30 seconds

// Medium TTL for user data
await cache.set('user:123', userData, 3600); // 1 hour

// Long TTL for static content
await cache.set('config:app', config, 86400); // 24 hours

// No TTL for permanent data (be careful!)
await cache.set('static:data', data); // Never expires
```

### 2. Cache Key Design

```javascript
// Use consistent, hierarchical keys
const cacheKeys = {
  user: (id) => `user:${id}`,
  userPosts: (id) => `user:${id}:posts`,
  userProfile: (id) => `user:${id}:profile`,
  post: (id) => `post:${id}`,
  postComments: (id) => `post:${id}:comments`
};

// Include version in keys for easy invalidation
const API_VERSION = 'v2';
const versionedKey = `${API_VERSION}:${cacheKeys.user(123)}`;
```

### 3. Handle Cache Failures

```javascript
async function getDataWithFallback(key) {
  try {
    return await cache.get(key);
  } catch (error) {
    console.error('Cache error:', error);
    // Fall back to database
    return null;
  }
}

// Circuit breaker pattern
class CacheCircuitBreaker {
  constructor(cache, threshold = 5) {
    this.cache = cache;
    this.failures = 0;
    this.threshold = threshold;
    this.isOpen = false;
  }
  
  async get(key) {
    if (this.isOpen) {
      return null; // Skip cache when circuit is open
    }
    
    try {
      const result = await this.cache.get(key);
      this.failures = 0; // Reset on success
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.isOpen = true;
        // Reset circuit after 30 seconds
        setTimeout(() => {
          this.isOpen = false;
          this.failures = 0;
        }, 30000);
      }
      return null;
    }
  }
}
```

### 4. Cache Monitoring

```javascript
// Track cache metrics
const metrics = {
  hits: 0,
  misses: 0,
  errors: 0
};

// Wrapped cache with metrics
const monitoredCache = {
  async get(key) {
    try {
      const value = await cache.get(key);
      if (value !== null) {
        metrics.hits++;
      } else {
        metrics.misses++;
      }
      return value;
    } catch (error) {
      metrics.errors++;
      throw error;
    }
  },
  
  getMetrics() {
    const total = metrics.hits + metrics.misses;
    return {
      ...metrics,
      hitRate: total > 0 ? metrics.hits / total : 0
    };
  }
};

// Expose metrics endpoint
app.get('/metrics/cache', (req, res) => {
  res.json(monitoredCache.getMetrics());
});
```

### 5. Cache Warming Strategy

```javascript
// Progressive cache warming
async function warmCacheProgressive() {
  const batchSize = 100;
  let offset = 0;
  
  while (true) {
    const items = await db.product.findMany({
      skip: offset,
      take: batchSize,
      where: { popular: true }
    });
    
    if (items.length === 0) break;
    
    await Promise.all(
      items.map(item => 
        cache.set(`product:${item.id}`, item, 3600)
      )
    );
    
    offset += batchSize;
    
    // Prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Scheduled cache warming
setInterval(warmCacheProgressive, 3600000); // Every hour
```

## Performance Tuning

### Memory Optimization

```javascript
// Configure memory limits for in-memory cache
const cache = await createCache({
  strategy: 'memory',
  maxItems: 10000,
  maxSize: '500mb',
  sizeCalculation: (value) => {
    // Custom size calculation
    return Buffer.byteLength(JSON.stringify(value));
  },
  dispose: (key, value) => {
    // Cleanup when items are evicted
    console.log(`Evicted ${key}`);
  }
});
```

### Redis Optimization

```javascript
const cache = await createCache({
  strategy: 'redis',
  connectionPoolSize: 10,
  enableOfflineQueue: true,
  connectTimeout: 5000,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  }
});

// Use Redis pipelining for bulk operations
async function bulkSet(items) {
  const pipeline = cache.pipeline();
  
  for (const [key, value] of Object.entries(items)) {
    pipeline.set(key, value, 3600);
  }
  
  await pipeline.exec();
}
```

### Compression

```javascript
// Enable compression for large values
const cache = await createCache({
  strategy: 'redis',
  compression: {
    enabled: true,
    threshold: 1024, // Compress values larger than 1KB
    algorithm: 'gzip'
  }
});

// Manual compression for specific values
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const compress = promisify(gzip);
const decompress = promisify(gunzip);

async function setCompressed(key, value, ttl) {
  const json = JSON.stringify(value);
  const compressed = await compress(json);
  await cache.set(key, compressed, ttl);
}

async function getCompressed(key) {
  const compressed = await cache.get(key);
  if (!compressed) return null;
  
  const json = await decompress(compressed);
  return JSON.parse(json);
}
```

## API Reference

### createCache(options)

Creates a cache instance with the specified strategy.

**Parameters:**
- `options.strategy`: 'memory' | 'redis' | 'memcached'
- `options.url`: Connection URL (for Redis/Memcached)
- `options.keyPrefix`: Prefix for all keys
- `options.defaultTTL`: Default TTL in seconds
- `options.serializer`: Custom serialization functions

**Returns:** Cache instance

### Cache Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `get(key)` | Get value by key | `key: string` | `Promise<any>` |
| `set(key, value, ttl?)` | Set value with optional TTL | `key: string`, `value: any`, `ttl?: number` | `Promise<boolean>` |
| `has(key)` | Check if key exists | `key: string` | `Promise<boolean>` |
| `delete(key)` | Delete key | `key: string` | `Promise<boolean>` |
| `clear()` | Clear all keys | None | `Promise<void>` |
| `getMany(keys)` | Get multiple values | `keys: string[]` | `Promise<any[]>` |
| `setMany(items, ttl?)` | Set multiple values | `items: Object`, `ttl?: number` | `Promise<boolean>` |
| `deleteMany(keys)` | Delete multiple keys | `keys: string[]` | `Promise<number>` |
| `deletePattern(pattern)` | Delete keys matching pattern | `pattern: string` | `Promise<number>` |
| `keys(pattern?)` | Get keys matching pattern | `pattern?: string` | `Promise<string[]>` |
| `ttl(key)` | Get remaining TTL | `key: string` | `Promise<number>` |
| `expire(key, ttl)` | Set expiration | `key: string`, `ttl: number` | `Promise<boolean>` |

## Troubleshooting

### Common Issues

1. **Connection Errors**
```javascript
// Add retry logic
const cache = await createCache({
  strategy: 'redis',
  retryStrategy: (times) => {
    if (times > 10) return null;
    return Math.min(times * 100, 3000);
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect on READONLY error
    }
    return false;
  }
});
```

2. **Memory Issues**
```javascript
// Monitor memory usage
setInterval(async () => {
  const info = await cache.info();
  console.log('Cache memory:', info.memory);
  
  if (info.memory > 1024 * 1024 * 1024) { // 1GB
    console.warn('High cache memory usage');
    // Clear least recently used items
    await cache.evictLRU(0.2); // Evict 20% of items
  }
}, 60000);
```

3. **Serialization Errors**
```javascript
// Custom serializer for special objects
const cache = await createCache({
  serializer: {
    serialize: (value) => {
      if (value instanceof Date) {
        return JSON.stringify({ __type: 'Date', value: value.toISOString() });
      }
      return JSON.stringify(value);
    },
    deserialize: (data) => {
      const parsed = JSON.parse(data);
      if (parsed.__type === 'Date') {
        return new Date(parsed.value);
      }
      return parsed;
    }
  }
});
```

4. **Key Collisions**
```javascript
// Use namespaces to avoid collisions
const userCache = cache.namespace('user');
const productCache = cache.namespace('product');

// Or use detailed key structure
function createKey(type, id, ...parts) {
  return [type, id, ...parts].join(':');
}

const userKey = createKey('user', 123, 'profile'); // user:123:profile
```

### Debug Mode

```javascript
// Enable debug logging
const cache = await createCache({
  strategy: 'redis',
  debug: true,
  logger: {
    info: console.log,
    error: console.error,
    debug: console.debug
  }
});

// Monitor all operations
cache.on('set', (key, value, ttl) => {
  console.log(`SET ${key} (TTL: ${ttl}s)`);
});

cache.on('get', (key, hit) => {
  console.log(`GET ${key} ${hit ? 'HIT' : 'MISS'}`);
});

cache.on('delete', (key) => {
  console.log(`DELETE ${key}`);
});
```

## Support

For issues and feature requests, visit our [GitHub repository](https://github.com/voilajs/appkit).