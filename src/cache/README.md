# @voilajsx/appkit - Cache Module ⚡

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple caching that just works - One function, automatic Redis/Memory
> strategy, zero configuration

**One function** returns a cache object with automatic strategy selection. Zero
configuration needed, production-ready performance by default.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `caching.get(namespace)`, everything else is
  automatic
- **🎯 Auto-Strategy** - REDIS_URL = Redis, no URL = Memory
- **🔧 Zero Configuration** - Smart defaults for everything
- **🏠 Namespace Isolation** - `users`, `sessions` - completely separate
- **⏰ TTL Management** - Automatic expiration
- **🤖 AI-Ready** - Optimized for LLM code generation

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

```typescript
import { caching } from '@voilajsx/appkit/cache';

const cache = caching.get('users');

// Set data with 1 hour expiration
await cache.set('user:123', { name: 'John' }, 3600);

// Get data
const user = await cache.get('user:123');
console.log(user); // { name: 'John' }

// Delete data
await cache.delete('user:123');
```

## 🌍 Environment Variables

```bash
# Development (automatic Memory cache)
# No environment variables needed!

# Production (automatic Redis cache)
REDIS_URL=redis://localhost:6379
```

## 📖 Complete API

### Core Function

```typescript
const cache = caching.get(namespace); // One function, everything you need
```

### Cache Operations

```typescript
await cache.get(key);                    // Get value (null if not found)
await cache.set(key, value, ttl?);       // Set value with TTL in seconds
await cache.delete(key);                 // Remove key
await cache.clear();                     // Clear entire namespace
await cache.getOrSet(key, factory, ttl?); // Get cached or compute and cache
```

### Utility Methods

```typescript
cache.getStrategy(); // 'redis' or 'memory'
caching.hasRedis(); // true if REDIS_URL is set
```

## 💡 Simple Examples

### **Basic User Caching**

```typescript
import { caching } from '@voilajsx/appkit/cache';

const userCache = caching.get('users');

async function getUser(id) {
  // Try cache first
  let user = await userCache.get(`user:${id}`);

  if (!user) {
    // Get from database
    user = await db.users.findById(id);

    // Cache for 1 hour
    await userCache.set(`user:${id}`, user, 3600);
  }

  return user;
}
```

### **API Response Caching**

```typescript
import { caching } from '@voilajsx/appkit/cache';

const apiCache = caching.get('external-api');

async function getWeather(city) {
  return await apiCache.getOrSet(
    `weather:${city}`,
    async () => {
      // This only runs on cache miss
      const response = await fetch(
        `https://api.weather.com/v1/weather?q=${city}`
      );
      return await response.json();
    },
    1800 // Cache for 30 minutes
  );
}

// First call: hits API
const weather1 = await getWeather('london');

// Second call: returns cached result (fast!)
const weather2 = await getWeather('london');
```

### **Session Management**

```typescript
import { caching } from '@voilajsx/appkit/cache';

const sessionCache = caching.get('sessions');

// Store session
async function createSession(userId) {
  const sessionId = crypto.randomUUID();
  const sessionData = { userId, loginTime: Date.now() };

  // Store for 2 hours
  await sessionCache.set(`session:${sessionId}`, sessionData, 7200);

  return sessionId;
}

// Get session
async function getSession(sessionId) {
  return await sessionCache.get(`session:${sessionId}`);
}

// Remove session
async function logout(sessionId) {
  await sessionCache.delete(`session:${sessionId}`);
}
```

### **Shopping Cart**

```typescript
import { caching } from '@voilajsx/appkit/cache';

const cartCache = caching.get('shopping-carts');

// Add item to cart
async function addToCart(userId, item) {
  const cart = (await cartCache.get(`cart:${userId}`)) || [];
  cart.push(item);

  // Cart expires in 24 hours
  await cartCache.set(`cart:${userId}`, cart, 86400);
}

// Get cart
async function getCart(userId) {
  return (await cartCache.get(`cart:${userId}`)) || [];
}

// Clear cart
async function clearCart(userId) {
  await cartCache.delete(`cart:${userId}`);
}
```

## 🔧 Platform Setup

### **Local Development**

```bash
# No setup needed - uses memory automatically
npm start
```

### **Production with Docker**

```yaml
version: '3.8'
services:
  app:
    image: my-app
    environment:
      REDIS_URL: redis://redis:6379
  redis:
    image: redis:alpine
```

### **Vercel/Railway/Heroku**

```bash
# Just add Redis URL in dashboard
REDIS_URL=redis://your-redis-provider.com:6379
```

## 🧪 Testing

```typescript
import { caching } from '@voilajsx/appkit/cache';

describe('Cache Tests', () => {
  afterEach(async () => {
    await caching.clear(); // Clean up between tests
  });

  test('basic caching', async () => {
    const cache = caching.get('test');

    await cache.set('key', 'value', 60);
    const result = await cache.get('key');

    expect(result).toBe('value');
  });
});
```

## 🤖 LLM Guidelines

### **Essential Patterns**

```typescript
// ✅ ALWAYS use these patterns
import { caching } from '@voilajsx/appkit/cache';
const cache = caching.get('namespace');

// ✅ Correct operations
await cache.set('key', data, 3600); // Set with TTL
const data = await cache.get('key'); // Get (null if not found)
await cache.delete('key'); // Delete key
await cache.clear(); // Clear namespace

// ✅ Cache-aside pattern
const data = await cache.getOrSet(
  'key',
  async () => {
    return await fetchFromDatabase();
  },
  3600
);
```

### **Anti-Patterns to Avoid**

```typescript
// ❌ DON'T access strategies directly
const redis = new RedisStrategy(); // Use caching.get() instead

// ❌ DON'T forget TTL for temporary data
await cache.set('temp', data); // Always set TTL for temp data

// ❌ DON'T use same namespace for different data types
const cache = caching.get('data'); // Be specific: 'users', 'sessions'
await cache.set('user:123', userData);
await cache.set('session:456', sessionData); // Use separate namespaces

// ❌ DON'T ignore cache misses
const user = await cache.get('user:123');
console.log(user.name); // Will crash if user is null
```

### **Common Patterns**

```typescript
// Get with fallback
const user = (await cache.get('user:123')) || (await db.getUser(123));

// Set after database update
await db.updateUser(123, data);
await cache.delete('user:123'); // Invalidate cache

// Bulk operations
await cache.clear(); // Clear entire namespace

// Check strategy
if (caching.hasRedis()) {
  // Redis-specific logic
}
```

## 📈 Performance

- **Memory Strategy**: ~0.1ms per operation
- **Redis Strategy**: ~1-5ms per operation
- **Automatic Strategy**: Zero overhead detection
- **TTL Cleanup**: Automatic background cleanup
- **Memory Usage**: Configurable limits with LRU eviction

## 🔍 TypeScript Support

```typescript
import type { Cache } from '@voilajsx/appkit/cache';

// Strongly typed cache operations
const cache: Cache = caching.get('users');
const user: User | null = await cache.get('user:123');
```

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a>
</p>
