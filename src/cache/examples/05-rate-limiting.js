/**
 * Rate Limiting - @voilajs/appkit Cache Module
 *
 * Example showing how to implement rate limiting using the cache module
 *
 * Prerequisites:
 * - npm install express
 *
 * Run: node 05-rate-limiting.js
 * Test:
 * - Make multiple requests: curl http://localhost:3000/api/test
 * - After several requests, you will get rate limited
 */

import { createCache } from '@voilajs/appkit/cache';
import express from 'express';

async function startServer() {
  console.log('=== Rate Limiting Demo ===\n');

  // Create a memory cache
  const cache = await createCache({ strategy: 'memory' });

  // Create Express app
  const app = express();

  // Create a rate limiter middleware
  function rateLimiter(options = {}) {
    const {
      // Max requests allowed in the time window
      max = 5,

      // Time window in seconds
      windowSeconds = 60,

      // Function to generate unique client identifier
      keyGenerator = (req) => req.ip || 'anonymous',

      // Message when rate limited
      message = 'Too many requests, please try again later.',
    } = options;

    return async (req, res, next) => {
      // Generate a unique key for this client
      const key = `ratelimit:${keyGenerator(req)}`;

      try {
        // Get current request count for this client
        const currentCount = (await cache.get(key)) || 0;

        // Get remaining TTL to reset
        const ttl = await cache.ttl(key);
        const timeToReset = ttl > 0 ? ttl : windowSeconds;

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - currentCount));
        res.setHeader(
          'X-RateLimit-Reset',
          Math.floor(Date.now() / 1000) + timeToReset
        );

        // Check if client has exceeded rate limit
        if (currentCount >= max) {
          console.log(`[RATE LIMIT] Client ${key} exceeded limit`);

          // 429 Too Many Requests
          return res.status(429).json({
            error: message,
            retryAfter: timeToReset,
          });
        }

        // Increment request count
        await cache.set(key, currentCount + 1, windowSeconds);

        next();
      } catch (error) {
        console.error('[RATE LIMIT] Error:', error);
        // Don't block the request on errors
        next();
      }
    };
  }

  // Apply rate limiting to all routes (5 requests per minute)
  app.use(
    rateLimiter({
      max: 5,
      windowSeconds: 60,
    })
  );

  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.json({
      message: 'Request successful',
      timestamp: new Date().toISOString(),
    });
  });

  // Stricter rate limit for login
  app.post(
    '/api/login',
    rateLimiter({
      max: 3, // Only 3 attempts
      windowSeconds: 300, // In a 5 minute window
      message: 'Too many login attempts. Please try again later.',
    }),
    (req, res) => {
      res.json({ message: 'Login endpoint' });
    }
  );

  // Cache stats endpoint (not rate limited)
  app.get('/api/stats', async (req, res) => {
    const keys = await cache.keys('ratelimit:*');
    const clients = [];

    for (const key of keys) {
      const count = await cache.get(key);
      const ttl = await cache.ttl(key);
      clients.push({
        client: key.replace('ratelimit:', ''),
        count,
        resetsIn: ttl,
      });
    }

    res.json({ clients });
  });

  // Start the server
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('\nTest with:');
    console.log(
      '- Make multiple requests: curl http://localhost:3000/api/test'
    );
    console.log('- After 5 requests, you will get rate limited');
    console.log('- View stats: curl http://localhost:3000/api/stats');
    console.log(
      '- Login (stricter limit): curl -X POST http://localhost:3000/api/login'
    );
  });
}

startServer().catch(console.error);
