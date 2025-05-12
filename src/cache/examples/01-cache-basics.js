/**
 * Cache Basics - @voilajs/appkit Cache Module
 *
 * Simple example showing basic cache operations
 * No external dependencies needed - just run it!
 *
 * Run: node 01-cache-basics.js
 */

import { createCache } from '@voilajs/appkit/cache';

async function demo() {
  console.log('=== Cache Basics Demo ===\n');

  // Create a memory cache (in-memory, no external dependencies)
  console.log('1. Creating memory cache...');
  const cache = await createCache({ strategy: 'memory' });
  console.log('Cache created\n');

  // Set a value in cache
  console.log('2. Setting values in cache...');
  await cache.set('greeting', 'Hello World');
  await cache.set('number', 42);
  await cache.set('user', { name: 'Alice', role: 'admin' });
  console.log('Values stored in cache\n');

  // Get values from cache
  console.log('3. Getting values from cache...');
  const greeting = await cache.get('greeting');
  const number = await cache.get('number');
  const user = await cache.get('user');

  console.log('greeting:', greeting);
  console.log('number:', number);
  console.log('user:', user);
  console.log('');

  // Check if key exists
  console.log('4. Checking if keys exist...');
  const hasGreeting = await cache.has('greeting');
  const hasMissing = await cache.has('missing');

  console.log('Has greeting?', hasGreeting);
  console.log('Has missing?', hasMissing);
  console.log('');

  // Delete a value
  console.log('5. Deleting a value...');
  await cache.delete('number');

  const numberAfterDelete = await cache.get('number');
  console.log('number after delete:', numberAfterDelete);
  console.log('');

  // Set with expiration (TTL - Time To Live)
  console.log('6. Setting value with expiration...');
  await cache.set('temporary', 'I will expire soon', 2); // 2 seconds TTL

  console.log('Waiting for expiration...');
  await new Promise((resolve) => setTimeout(resolve, 2100));

  const expiredValue = await cache.get('temporary');
  console.log('temporary after expiration:', expiredValue);
}

demo().catch(console.error);
