/**
 * Cache Patterns - @voilajs/appkit Cache Module
 *
 * Example showing common caching patterns:
 * - Cache aside (lazy loading)
 * - Cache namespaces
 * - Cache invalidation
 *
 * Run: node 03-cache-patterns.js
 */

import { createCache } from '@voilajs/appkit/cache';

// Simulate a database
const db = {
  users: {
    1: { id: '1', name: 'Alice', email: 'alice@example.com' },
    2: { id: '2', name: 'Bob', email: 'bob@example.com' },
  },

  async findUserById(id) {
    console.log(`[DATABASE] Loading user ${id}...`);

    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.users[id] || null;
  },

  async updateUser(id, data) {
    console.log(`[DATABASE] Updating user ${id}...`);

    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!this.users[id]) return null;

    this.users[id] = { ...this.users[id], ...data };
    return this.users[id];
  },
};

async function demo() {
  console.log('=== Cache Patterns Demo ===\n');

  // Create a memory cache
  const cache = await createCache({
    strategy: 'memory',
    defaultTTL: 3600, // 1 hour
  });

  // Create a namespace for user data
  const userCache = cache.namespace('user');

  console.log('1. Cache Aside Pattern (Lazy Loading)\n');

  // First request - should be a cache miss
  console.log('First request for user 1:');
  let user1 = await getUserFromCache('1', userCache);
  console.log('Received:', user1);
  console.log('');

  // Second request - should be a cache hit
  console.log('Second request for user 1:');
  user1 = await getUserFromCache('1', userCache);
  console.log('Received:', user1);
  console.log('');

  console.log('2. Using getOrSet for simplification\n');

  // First request for user 2 - should be a cache miss
  console.log('First request for user 2:');
  const user2 = await userCache.getOrSet('2', async () => {
    return db.findUserById('2');
  });
  console.log('Received:', user2);
  console.log('');

  // Second request for user 2 - should be a cache hit
  console.log('Second request for user 2:');
  const user2Again = await userCache.getOrSet('2', async () => {
    return db.findUserById('2');
  });
  console.log('Received:', user2Again);
  console.log('');

  console.log('3. Cache Invalidation\n');

  // Update user 1
  console.log('Updating user 1...');
  await db.updateUser('1', { name: 'Alice Updated' });

  // Invalidate cache for user 1
  console.log('Invalidating cache for user 1...');
  await userCache.delete('1');

  // Next request should be a cache miss due to invalidation
  console.log('Request after invalidation:');
  user1 = await getUserFromCache('1', userCache);
  console.log('Received:', user1);
}

// Implement cache-aside pattern manually
async function getUserFromCache(userId, cache) {
  // Try to get from cache first
  const cached = await cache.get(userId);

  if (cached) {
    console.log(`[CACHE] Hit for user ${userId}`);
    return cached;
  }

  console.log(`[CACHE] Miss for user ${userId}`);

  // Not in cache, get from database
  const user = await db.findUserById(userId);

  if (user) {
    // Store in cache for next time
    await cache.set(userId, user);
    console.log(`[CACHE] Stored user ${userId}`);
  }

  return user;
}

demo().catch(console.error);
