/**
 * API Response Caching - @voilajs/appkit Cache Module
 *
 * Example showing how to cache API responses with Express
 *
 * Prerequisites:
 * - npm install express
 *
 * Run: node 04-api-caching.js
 * Test: curl http://localhost:3000/api/users
 */

import { createCache } from '@voilajs/appkit/cache';
import express from 'express';

// Simulate an API or database with slow responses
const api = {
  async getUsers() {
    console.log('[API] Fetching users... (slow operation)');

    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return [
      { id: 1, name: 'Alice', role: 'admin' },
      { id: 2, name: 'Bob', role: 'user' },
      { id: 3, name: 'Charlie', role: 'user' },
    ];
  },

  async getUser(id) {
    console.log(`[API] Fetching user ${id}... (slow operation)`);

    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const users = {
      1: { id: 1, name: 'Alice', role: 'admin' },
      2: { id: 2, name: 'Bob', role: 'user' },
      3: { id: 3, name: 'Charlie', role: 'user' },
    };

    return users[id] || null;
  },
};

async function startServer() {
  console.log('=== API Caching Demo ===\n');

  // Create a memory cache
  const cache = await createCache({ strategy: 'memory' });

  // Create Express app
  const app = express();

  // Create a caching middleware
  function cacheMiddleware(ttl = 60) {
    // 60 seconds default
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Create a cache key from the request URL
      const cacheKey = `api:${req.originalUrl}`;

      try {
        // Try to get from cache
        const cachedResponse = await cache.get(cacheKey);

        if (cachedResponse) {
          console.log(`[CACHE] Hit for ${req.originalUrl}`);

          // Add cache header
          res.setHeader('X-Cache', 'HIT');

          // Send the cached response
          return res.json(cachedResponse);
        }

        console.log(`[CACHE] Miss for ${req.originalUrl}`);
        res.setHeader('X-Cache', 'MISS');

        // Store original res.json method
        const originalJson = res.json;

        // Override res.json method to cache the response
        res.json = function (data) {
          // Store in cache
          cache
            .set(cacheKey, data, ttl)
            .then(() => console.log(`[CACHE] Stored ${req.originalUrl}`))
            .catch((err) => console.error('[CACHE] Error:', err));

          // Call the original json method
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('[CACHE] Error:', error);
        next();
      }
    };
  }

  // Set up routes

  // List users (cached for 30 seconds)
  app.get('/api/users', cacheMiddleware(30), async (req, res) => {
    try {
      const users = await api.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Get user by ID (cached for 60 seconds)
  app.get('/api/users/:id', cacheMiddleware(60), async (req, res) => {
    try {
      const user = await api.getUser(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Cache admin route
  app.post('/api/cache/clear', async (req, res) => {
    try {
      await cache.deletePattern('api:*');
      res.json({ message: 'Cache cleared' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

  // Start the server
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('\nTest with:');
    console.log('- First request: curl http://localhost:3000/api/users');
    console.log('- Second request: curl http://localhost:3000/api/users');
    console.log('- Get user: curl http://localhost:3000/api/users/1');
    console.log(
      '- Clear cache: curl -X POST http://localhost:3000/api/cache/clear'
    );
  });
}

startServer().catch(console.error);
