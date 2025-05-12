# Cache Module API Reference

## Overview

The `@voilajs/appkit/cache` module provides flexible and powerful caching
capabilities for Node.js applications, supporting multiple cache strategies
including in-memory, Redis, and Memcached. It offers a consistent interface
across different storage backends with features like TTL management,
pattern-based operations, and namespace support.

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { createCache } from '@voilajs/appkit/cache';

// Create a memory cache
const cache = await createCache({ strategy: 'memory' });

// Store data
await cache.set('user:123', { name: 'Alice', role: 'admin' }, 3600); // 1 hour TTL

// Retrieve data
const user = await cache.get('user:123');
```

## API Reference

### Cache Factory

#### createCache(options)

Creates a new cache instance with the specified options.

##### Parameters

| Name                             | Type                 | Required | Default    | Description                                               |
| -------------------------------- | -------------------- | -------- | ---------- | --------------------------------------------------------- |
| `options`                        | `Object`             | Yes      | -          | Configuration options for the cache                       |
| `options.strategy`               | `string`             | No       | `'memory'` | Cache strategy to use ('memory', 'redis', or 'memcached') |
| `options.url`                    | `string`             | No       | -          | Connection URL for Redis                                  |
| `options.servers`                | `string[]`           | No       | -          | Array of server addresses for Memcached                   |
| `options.maxItems`               | `number`             | No       | -          | Maximum number of items for memory cache                  |
| `options.maxSize`                | `string` \| `number` | No       | -          | Maximum cache size (bytes for number, parsed for string)  |
| `options.keyPrefix`              | `string`             | No       | -          | Prefix to add to all cache keys                           |
| `options.defaultTTL`             | `number`             | No       | `null`     | Default time-to-live in seconds (null = no expiration)    |
| `options.serializer`             | `Object`             | No       | -          | Custom serializer for cache values                        |
| `options.serializer.serialize`   | `Function`           | No       | -          | Function to convert values to strings                     |
| `options.serializer.deserialize` | `Function`           | No       | -          | Function to convert strings back to values                |

##### Returns

- `Promise<CacheInterface>` - A Promise that resolves to a cache instance

##### Throws

- `Error` - If an invalid strategy is specified
- `Error` - If required connection parameters are missing
- `Error` - If connection to Redis or Memcached fails

##### Example

```javascript
// Memory cache with limits
const memoryCache = await createCache({
  strategy: 'memory',
  maxItems: 1000,
  defaultTTL: 600, // 10 minutes
});

// Redis cache with custom serializer
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
  keyPrefix: 'myapp:',
  serializer: {
    serialize: (value) => JSON.stringify(value),
    deserialize: (data) => JSON.parse(data),
  },
});

// Memcached with multiple servers
const memcachedCache = await createCache({
  strategy: 'memcached',
  servers: ['localhost:11211', 'cache2.example.com:11211'],
  defaultTTL: 3600, // 1 hour
});
```

---

### Cache Methods

#### get(key)

Retrieves a value from the cache by key.

##### Parameters

| Name  | Type     | Required | Description     |
| ----- | -------- | -------- | --------------- |
| `key` | `string` | Yes      | Key to retrieve |

##### Returns

- `Promise<any|null>` - The cached value, or null if not found

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
const value = await cache.get('user:123');
if (value) {
  console.log('Cache hit:', value);
} else {
  console.log('Cache miss');
}
```

---

#### set(key, value, ttl)

Stores a value in the cache with an optional TTL.

##### Parameters

| Name    | Type     | Required | Default      | Description                  |
| ------- | -------- | -------- | ------------ | ---------------------------- |
| `key`   | `string` | Yes      | -            | Key to store the value under |
| `value` | `any`    | Yes      | -            | Value to store               |
| `ttl`   | `number` | No       | `defaultTTL` | Time-to-live in seconds      |

##### Returns

- `Promise<boolean>` - True if the operation was successful

##### Throws

- `Error` - If the operation fails due to connectivity or serialization issues

##### Example

```javascript
// Store with explicit TTL
await cache.set('session:token', 'abc123', 1800); // 30 minutes

// Store with default TTL
await cache.set('config:settings', { theme: 'dark' });

// Store permanently (no expiration)
await cache.set('app:version', '1.2.3', 0);
```

---

#### has(key)

Checks if a key exists in the cache.

##### Parameters

| Name  | Type     | Required | Description  |
| ----- | -------- | -------- | ------------ |
| `key` | `string` | Yes      | Key to check |

##### Returns

- `Promise<boolean>` - True if the key exists in the cache

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
if (await cache.has('user:123')) {
  console.log('User is cached');
} else {
  console.log('User not in cache');
}
```

---

#### delete(key)

Removes a value from the cache.

##### Parameters

| Name  | Type     | Required | Description   |
| ----- | -------- | -------- | ------------- |
| `key` | `string` | Yes      | Key to remove |

##### Returns

- `Promise<boolean>` - True if the key was removed, false if not found

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
const wasRemoved = await cache.delete('user:123');
console.log(wasRemoved ? 'User removed from cache' : 'User not in cache');
```

---

#### clear()

Removes all values from the cache.

##### Returns

- `Promise<void>` - Resolves when the operation is complete

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
// Clear the entire cache
await cache.clear();
console.log('Cache cleared');
```

---

#### getMany(keys)

Retrieves multiple values from the cache in a single operation.

##### Parameters

| Name   | Type       | Required | Description               |
| ------ | ---------- | -------- | ------------------------- |
| `keys` | `string[]` | Yes      | Array of keys to retrieve |

##### Returns

- `Promise<Array<any|null>>` - Array of values in the same order as the keys
  (null for cache misses)

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
const keys = ['user:123', 'user:456', 'user:789'];
const values = await cache.getMany(keys);

values.forEach((value, index) => {
  if (value) {
    console.log(`${keys[index]}: Cache hit`);
  } else {
    console.log(`${keys[index]}: Cache miss`);
  }
});
```

---

#### setMany(items, ttl)

Stores multiple key-value pairs in the cache in a single operation.

##### Parameters

| Name    | Type                  | Required | Default      | Description                 |
| ------- | --------------------- | -------- | ------------ | --------------------------- |
| `items` | `Record<string, any>` | Yes      | -            | Object with key-value pairs |
| `ttl`   | `number`              | No       | `defaultTTL` | Time-to-live in seconds     |

##### Returns

- `Promise<boolean>` - True if the operation was successful

##### Throws

- `Error` - If the operation fails due to connectivity or serialization issues

##### Example

```javascript
await cache.setMany(
  {
    'user:123': { name: 'Alice', role: 'admin' },
    'user:456': { name: 'Bob', role: 'user' },
    'user:789': { name: 'Charlie', role: 'editor' },
  },
  3600
); // 1 hour TTL
```

---

#### deleteMany(keys)

Removes multiple values from the cache in a single operation.

##### Parameters

| Name   | Type       | Required | Description             |
| ------ | ---------- | -------- | ----------------------- |
| `keys` | `string[]` | Yes      | Array of keys to remove |

##### Returns

- `Promise<number>` - Number of keys that were removed

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
const removedCount = await cache.deleteMany(['user:123', 'user:456']);
console.log(`Removed ${removedCount} items from cache`);
```

---

#### deletePattern(pattern)

Removes all values with keys matching a pattern (using glob-style patterns).

##### Parameters

| Name      | Type     | Required | Description           |
| --------- | -------- | -------- | --------------------- |
| `pattern` | `string` | Yes      | Pattern to match keys |

##### Returns

- `Promise<number>` - Number of keys that were removed

##### Throws

- `Error` - If the operation fails due to connectivity issues
- `Error` - If pattern matching is not supported by the cache strategy

##### Example

```javascript
// Remove all user keys
const removedCount = await cache.deletePattern('user:*');
console.log(`Removed ${removedCount} user items from cache`);

// Remove all temporary keys
await cache.deletePattern('temp:*');
```

---

#### keys(pattern)

Retrieves all keys matching a pattern.

##### Parameters

| Name      | Type     | Required | Default | Description           |
| --------- | -------- | -------- | ------- | --------------------- |
| `pattern` | `string` | No       | `'*'`   | Pattern to match keys |

##### Returns

- `Promise<string[]>` - Array of matching keys

##### Throws

- `Error` - If the operation fails due to connectivity issues
- `Error` - If pattern matching is not supported by the cache strategy

##### Example

```javascript
// Get all user keys
const userKeys = await cache.keys('user:*');
console.log(`Found ${userKeys.length} user keys`);

// Get all keys
const allKeys = await cache.keys();
console.log(`Cache contains ${allKeys.length} keys`);
```

---

#### ttl(key)

Gets the remaining time-to-live for a key in seconds.

##### Parameters

| Name  | Type     | Required | Description  |
| ----- | -------- | -------- | ------------ |
| `key` | `string` | Yes      | Key to check |

##### Returns

- `Promise<number>` - Remaining TTL in seconds, -1 if no expiry, -2 if key
  doesn't exist

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
const remainingTTL = await cache.ttl('session:token');
if (remainingTTL > 0) {
  console.log(`Session expires in ${remainingTTL} seconds`);
} else if (remainingTTL === -1) {
  console.log('Session has no expiration');
} else {
  console.log('Session not found');
}
```

---

#### expire(key, ttl)

Updates the expiration time for an existing key.

##### Parameters

| Name  | Type     | Required | Description                 |
| ----- | -------- | -------- | --------------------------- |
| `key` | `string` | Yes      | Key to update               |
| `ttl` | `number` | Yes      | New time-to-live in seconds |

##### Returns

- `Promise<boolean>` - True if the operation was successful, false if key
  doesn't exist

##### Throws

- `Error` - If the operation fails due to connectivity issues

##### Example

```javascript
// Extend session TTL to 1 hour
const success = await cache.expire('session:token', 3600);
if (success) {
  console.log('Session extended');
} else {
  console.log('Session not found');
}
```

---

#### namespace(prefix)

Creates a new cache instance that automatically prefixes all keys.

##### Parameters

| Name     | Type     | Required | Description         |
| -------- | -------- | -------- | ------------------- |
| `prefix` | `string` | Yes      | Prefix for all keys |

##### Returns

- `CacheInterface` - A new cache instance with namespaced keys

##### Example

```javascript
// Create namespaced cache for user data
const userCache = cache.namespace('user:');

// Key will be 'user:123' in the underlying cache
await userCache.set('123', { name: 'Alice' });

// Create nested namespace
const adminCache = userCache.namespace('admin:');
// Key will be 'user:admin:1' in the underlying cache
await adminCache.set('1', { permissions: ['all'] });
```

---

#### getOrSet(key, factory, ttl)

Retrieves a value from cache or generates and stores it if not found.

##### Parameters

| Name      | Type                 | Required | Default      | Description                              |
| --------- | -------------------- | -------- | ------------ | ---------------------------------------- |
| `key`     | `string`             | Yes      | -            | Key to retrieve or store under           |
| `factory` | `() => Promise<any>` | Yes      | -            | Function to generate value on cache miss |
| `ttl`     | `number`             | No       | `defaultTTL` | Time-to-live in seconds                  |

##### Returns

- `Promise<any>` - The cached or newly generated value

##### Throws

- `Error` - If the operation fails due to connectivity issues
- `Error` - If the factory function throws an error

##### Example

```javascript
// Get user from cache or database
const user = await cache.getOrSet(
  'user:123',
  async () => {
    return await db.findUserById('123');
  },
  3600
); // 1 hour TTL

// Expensive calculation with default TTL
const result = await cache.getOrSet('calculation:complex', async () => {
  return await performExpensiveCalculation();
});
```

## Error Handling

All functions in this module throw errors with descriptive messages. It's
recommended to wrap calls in try-catch blocks:

```javascript
try {
  const value = await cache.get('key');
} catch (error) {
  console.error('Cache operation failed:', error.message);
}
```

### Common Error Messages

| Function        | Error Message                         | Cause                               |
| --------------- | ------------------------------------- | ----------------------------------- |
| `createCache`   | "Invalid cache strategy"              | Unknown strategy specified          |
| `createCache`   | "Redis URL is required"               | Missing Redis connection URL        |
| `createCache`   | "Memcached servers array is required" | Missing Memcached servers           |
| `set`/`setMany` | "Serialization failed"                | Value could not be serialized       |
| `get`/`getMany` | "Deserialization failed"              | Value could not be deserialized     |
| `deletePattern` | "Pattern matching not supported"      | Using patterns with memory strategy |
| Any method      | "Redis connection error"              | Redis connectivity issue            |
| Any method      | "Memcached connection error"          | Memcached connectivity issue        |

## Security Considerations

1. **Sensitive Data**: Avoid storing sensitive data in cache without encryption
2. **TTL Management**: Always use appropriate TTL values to prevent stale data
3. **Redis Security**: Use Redis AUTH and protected mode for production
   deployments
4. **Network Security**: Only connect to cache servers through secure networks
5. **Key Management**: Use namespaces to avoid key collisions between
   applications
6. **Serialization**: Be careful with custom serializers that may introduce
   vulnerabilities

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create declaration files or
use JSDoc type annotations.

```typescript
// Example type declarations
interface CacheOptions {
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
}

interface CacheInterface {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl?: number): Promise<boolean>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getMany(keys: string[]): Promise<Array<any | null>>;
  setMany(items: Record<string, any>, ttl?: number): Promise<boolean>;
  deleteMany(keys: string[]): Promise<number>;
  deletePattern(pattern: string): Promise<number>;
  keys(pattern?: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
  expire(key: string, ttl: number): Promise<boolean>;
  namespace(prefix: string): CacheInterface;
  getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>;
}
```

## Performance Tips

1. **Strategy Selection**: Use memory cache for small, frequently accessed data
   and Redis/Memcached for larger datasets or when multiple servers need to
   share cache
2. **TTL Optimization**: Set shorter TTLs for frequently changing data and
   longer TTLs for stable data
3. **Batch Operations**: Use `getMany` and `setMany` for better performance when
   operating on multiple keys
4. **Key Design**: Keep keys short and consistent for better performance
5. **Connection Pooling**: For Redis, reuse the same connection across your
   application

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
