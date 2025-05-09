## Cache Module

The Cache module of the `@voilajs/appkit` package provides a unified caching
interface to improve application performance by storing frequently accessed
data. It supports multiple backend strategies including Redis, Memcached, and
in-memory storage with consistent APIs.

### Snapshot of Methods

| S.No. | Method                            | Description                                     |
| ----- | --------------------------------- | ----------------------------------------------- |
| 1     | [`createCache`](#createcache)     | Creates a new cache instance with configuration |
| 2     | [`get`](#get)                     | Retrieves a value from cache by key             |
| 3     | [`set`](#set)                     | Stores a value in cache with optional TTL       |
| 4     | [`has`](#has)                     | Checks if a key exists in cache                 |
| 5     | [`delete`](#delete)               | Removes a key from cache                        |
| 6     | [`clear`](#clear)                 | Clears all keys from cache                      |
| 7     | [`getMany`](#getmany)             | Retrieves multiple values by keys               |
| 8     | [`setMany`](#setmany)             | Stores multiple key-value pairs                 |
| 9     | [`deleteMany`](#deletemany)       | Removes multiple keys from cache                |
| 10    | [`deletePattern`](#deletepattern) | Removes keys matching a pattern                 |
| 11    | [`keys`](#keys)                   | Gets keys matching a pattern                    |
| 12    | [`ttl`](#ttl)                     | Gets remaining time-to-live for a key           |
| 13    | [`expire`](#expire)               | Sets expiration for an existing key             |
| 14    | [`namespace`](#namespace)         | Creates a namespaced cache instance             |
| 15    | [`getOrSet`](#getorset)           | Gets a value or sets it if not found            |

### Use Cases

| S.No. | Method                            | Use Cases                                                                                                                                                                                                                                                                                                                        |
| ----- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | [`createCache`](#createcache)     | <ul><li>Configuring cache strategy based on environment</li><li>Setting up Redis for production environments</li><li>Creating in-memory cache for development</li><li>Establishing distributed cache for microservices</li><li>Configuring cache with custom serializers</li><li>Setting up caching with memory limits</li></ul> |
| 2     | [`get`](#get)                     | <ul><li>Retrieving cached user profiles</li><li>Accessing stored API responses</li><li>Reading cached database query results</li><li>Looking up session data</li><li>Fetching cached configuration settings</li><li>Retrieving cached rendered templates</li></ul>                                                               |
| 3     | [`set`](#set)                     | <ul><li>Caching database query results</li><li>Storing API responses</li><li>Caching rendered HTML templates</li><li>Setting temporary session data</li><li>Storing user preferences</li><li>Saving computed values</li></ul>                                                                                                    |
| 4     | [`has`](#has)                     | <ul><li>Checking if cache needs to be refreshed</li><li>Validating cache availability before operations</li><li>Determining if a heavy computation is needed</li><li>Checking for cached assets</li><li>Verifying session existence</li></ul>                                                                                    |
| 5     | [`delete`](#delete)               | <ul><li>Invalidating stale data</li><li>Removing sensitive information</li><li>Clearing user-specific cache</li><li>Resetting cached values after updates</li><li>Removing expired sessions</li><li>Clearing cached permissions after role changes</li></ul>                                                                     |
| 6     | [`clear`](#clear)                 | <ul><li>Clearing cache during deployment</li><li>Resetting application state</li><li>Flushing all caches after major updates</li><li>Clearing during maintenance mode</li><li>Purging cache when data structure changes</li></ul>                                                                                                |
| 7     | [`getMany`](#getmany)             | <ul><li>Batch retrieving multiple user profiles</li><li>Loading related data in single operation</li><li>Retrieving collections of items</li><li>Fetching dashboard widgets data</li><li>Loading multiple configuration settings</li></ul>                                                                                       |
| 8     | [`setMany`](#setmany)             | <ul><li>Bulk caching database query results</li><li>Storing related data in one operation</li><li>Setting multiple configuration values</li><li>Caching collections of items</li><li>Populating cache during initialization</li></ul>                                                                                            |
| 9     | [`deletePattern`](#deletepattern) | <ul><li>Invalidating all user-related cache</li><li>Clearing category-specific products</li><li>Removing all cache for a specific tenant</li><li>Purging cached API responses by endpoint</li><li>Removing all temporary files</li></ul>                                                                                         |
| 10    | [`namespace`](#namespace)         | <ul><li>Isolating cache for different services</li><li>Separating user-specific data</li><li>Creating tenant-specific cache spaces</li><li>Organizing cache by feature area</li><li>Partitioning cache for different environments</li></ul>                                                                                      |
| 11    | [`getOrSet`](#getorset)           | <ul><li>Implementing cache-aside pattern</li><li>Loading data with automatic caching</li><li>Managing expensive computations</li><li>Optimizing repetitive database queries</li><li>Building self-healing cache systems</li></ul>                                                                                                |

### Basic Usage Examples

#### createCache

```javascript
import { createCache } from '@voilajs/appkit/cache';

// In-memory cache for development
const devCache = await createCache({
  strategy: 'memory',
  maxItems: 1000,
});

// Redis cache for production
const prodCache = await createCache({
  strategy: 'redis',
  url: process.env.REDIS_URL,
  keyPrefix: 'myapp:',
});
```

#### get

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
const user = await cache.get('user:123');

if (user) {
  console.log('Cache hit:', user.name);
} else {
  console.log('Cache miss');
}
```

#### set

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });

// Set with default TTL
await cache.set('user:123', { name: 'John', email: 'john@example.com' });

// Set with 1 hour TTL
await cache.set('session:abc', { userId: 123 }, 3600);
```

#### has

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
const exists = await cache.has('user:123');

if (exists) {
  console.log('Key exists in cache');
}
```

#### delete

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
await cache.delete('user:123');
console.log('User cache cleared');
```

#### clear

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
await cache.clear();
console.log('All cache cleared');
```

#### getMany

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
const users = await cache.getMany(['user:123', 'user:456']);
console.log(`Retrieved ${users.length} users`);
```

#### setMany

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
await cache.setMany(
  {
    'user:123': { name: 'John' },
    'user:456': { name: 'Jane' },
  },
  3600
); // 1 hour TTL
```

#### deletePattern

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
// Clear all user-related cache
const removedCount = await cache.deletePattern('user:*');
console.log(`Removed ${removedCount} keys`);
```

#### namespace

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });
const userCache = cache.namespace('user');
const productCache = cache.namespace('product');

// These operate on different namespaces
await userCache.set('123', userData); // Sets 'user:123'
await productCache.set('456', productData); // Sets 'product:456'
```

#### getOrSet

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });

// Cache-aside pattern made simple
const user = await cache.getOrSet(
  'user:123',
  async () => {
    // This only runs on cache miss
    return await db.user.findUnique({ where: { id: 123 } });
  },
  3600 // 1 hour TTL
);
```

### Advanced Examples

#### Database Query Caching

```javascript
import { createCache } from '@voilajs/appkit/cache';

const cache = await createCache({ strategy: 'redis' });

async function getUserById(id) {
  return cache.getOrSet(
    `user:${id}`,
    async () => db.user.findUnique({ where: { id } }),
    3600 // 1 hour TTL
  );
}

async function updateUser(id, data) {
  await db.user.update({ where: { id }, data });
  // Invalidate cache
  await cache.delete(`user:${id}`);
}
```

#### API Response Caching

```javascript
import { createCache } from '@voilajs/appkit/cache';
import express from 'express';

const cache = await createCache({ strategy: 'redis' });
const app = express();

// Cache middleware
function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const cacheKey = `api:${req.originalUrl}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // Store original json function
    const originalJson = res.json;

    // Override json function to cache response
    res.json = function (body) {
      cache.set(cacheKey, body, ttl);
      return originalJson.call(this, body);
    };

    next();
  };
}

app.get('/api/products', cacheMiddleware(600), async (req, res) => {
  const products = await db.product.findMany();
  res.json(products);
});
```

#### Session Storage

```javascript
import { createCache } from '@voilajs/appkit/cache';
import express from 'express';
import session from 'express-session';

const cache = await createCache({ strategy: 'redis' });

class CacheSessionStore {
  constructor(cache) {
    this.cache = cache.namespace('session');
    this.ttl = 86400; // 24 hours
  }

  async get(sid, callback) {
    try {
      const session = await this.cache.get(sid);
      callback(null, session);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid, session, callback) {
    try {
      await this.cache.set(sid, session, this.ttl);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid, callback) {
    try {
      await this.cache.delete(sid);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }
}

const app = express();
app.use(
  session({
    store: new CacheSessionStore(cache),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);
```

### Detailed Note

To explore advanced features, configuration options, and detailed API
specifications, refer to the developer reference at
[https://github.com/voilajs/appkit/src/cache/DEV_REF.md](https://github.com/voilajs/appkit/src/cache/DEV_REF.md)
and the API documentation at
[https://github.com/voilajs/appkit/src/cache/API.md](https://github.com/voilajs/appkit/src/cache/API.md).
