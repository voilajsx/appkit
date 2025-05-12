/**
 * Redis Cache - @voilajs/appkit Cache Module
 *
 * Example showing Redis cache configuration and usage
 * Requires Redis server running on localhost:6379
 *
 * Prerequisites:
 * - Redis installed and running
 * - npm install redis
 *
 * Run: node 02-redis-cache.js
 */

import { createCache } from '@voilajs/appkit/cache';

async function demo() {
  console.log('=== Redis Cache Demo ===\n');

  // Create a Redis cache
  console.log('1. Creating Redis cache...');
  const cache = await createCache({
    strategy: 'redis',
    url: 'redis://localhost:6379',
    keyPrefix: 'demo:', // All keys will be prefixed with 'demo:'
  });
  console.log('Redis cache created\n');

  // Store values
  console.log('2. Setting values in Redis...');
  await cache.set('greeting', 'Hello from Redis');
  await cache.set('user', { name: 'Bob', role: 'user' });
  console.log('Values stored in Redis\n');

  // Retrieve values
  console.log('3. Getting values from Redis...');
  const greeting = await cache.get('greeting');
  const user = await cache.get('user');

  console.log('greeting:', greeting);
  console.log('user:', user);
  console.log('');

  // Set with expiration
  console.log('4. Setting value with expiration...');
  await cache.set('session', { userId: 123 }, 3600); // 1 hour TTL

  const ttl = await cache.ttl('session');
  console.log('session expires in:', ttl, 'seconds');
  console.log('');

  // Batch operations
  console.log('5. Batch operations...');

  // Set multiple values at once
  await cache.setMany({
    'product:1': { id: 1, name: 'Laptop' },
    'product:2': { id: 2, name: 'Phone' },
    'product:3': { id: 3, name: 'Tablet' },
  });

  // Get multiple values at once
  const products = await cache.getMany(['product:1', 'product:2', 'product:3']);
  console.log('Retrieved products:', products);
  console.log('');

  // Clean up demo keys
  console.log('6. Cleaning up...');
  await cache.deletePattern('demo:*');
  console.log('Cache cleared');
}

demo().catch((error) => {
  console.error('Error:', error.message);
  console.log('Make sure Redis is running on localhost:6379');
});
