/**
 * Middleware Integration Tests - @voilajsx/appkit Security Module
 *
 * These tests verify that the middleware components correctly
 * integrate with Express applications.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import request from 'supertest';
import {
  createCsrfMiddleware,
  generateCsrfToken,
  createRateLimiter,
  sanitizeHtml,
} from '../index.js';

// Helper to create a test server with supertest
async function createTestServer(app) {
  const server = createServer(app);
  const testServer = request(server);
  return { server, testServer };
}

describe('Security Middleware Integration', () => {
  describe('CSRF Middleware', () => {
    let app;
    let sessionMock;

    beforeEach(() => {
      app = express();
      sessionMock = {};

      // Mock session middleware
      app.use((req, res, next) => {
        req.session = sessionMock;
        next();
      });

      // Add body parser
      app.use(express.urlencoded({ extended: true }));
      app.use(express.json());
    });

    it('should pass requests with valid CSRF tokens', async () => {
      // Generate a token
      const token = generateCsrfToken(sessionMock);

      // Apply CSRF middleware
      app.use(createCsrfMiddleware());

      // Create a test route
      app.post('/test', (req, res) => {
        res.status(200).json({ success: true });
      });

      const { testServer } = await createTestServer(app);

      // Make a POST request with the token
      const response = await testServer
        .post('/test')
        .set('Content-Type', 'application/json')
        .send({ _csrf: token });

      expect(response.status).toBe(200);
    });

    it('should block requests without CSRF tokens', async () => {
      // Apply CSRF middleware
      app.use(createCsrfMiddleware());

      // Create a test route
      app.post('/test', (req, res) => {
        res.status(200).json({ success: true });
      });

      const { testServer } = await createTestServer(app);

      // Make a POST request without a token
      const response = await testServer
        .post('/test')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBe(403);
    });

    it('should skip checking GET, HEAD, OPTIONS requests', async () => {
      // Apply CSRF middleware
      app.use(createCsrfMiddleware());

      // Create a test route
      app.get('/test', (req, res) => {
        res.status(200).json({ success: true });
      });

      const { testServer } = await createTestServer(app);

      // Make a GET request without a token
      const response = await testServer.get('/test');

      expect(response.status).toBe(200);
    });

    it('should check for tokens in custom field and header', async () => {
      // Generate a token
      const token = generateCsrfToken(sessionMock);

      // Apply CSRF middleware with custom options
      app.use(
        createCsrfMiddleware({
          tokenField: 'customField',
          headerField: 'x-custom-csrf',
        })
      );

      // Create a test route
      app.post('/field-test', (req, res) => {
        res.status(200).json({ success: true, source: 'field' });
      });

      app.post('/header-test', (req, res) => {
        res.status(200).json({ success: true, source: 'header' });
      });

      const { testServer } = await createTestServer(app);

      // Test custom field
      const fieldResponse = await testServer
        .post('/field-test')
        .set('Content-Type', 'application/json')
        .send({ customField: token });

      expect(fieldResponse.status).toBe(200);

      // Test custom header
      const headerResponse = await testServer
        .post('/header-test')
        .set('x-custom-csrf', token)
        .send({});

      expect(headerResponse.status).toBe(200);
    });
  });

  describe('Rate Limiter Middleware', () => {
    let app;

    beforeEach(() => {
      app = express();

      // Reset time between tests
      vi.useRealTimers();
    });

    it('should allow requests within rate limit', async () => {
      // Apply rate limiter
      app.use(createRateLimiter({ windowMs: 60000, max: 2 }));

      // Create a test route
      app.get('/test', (req, res) => {
        res.status(200).json({ success: true });
      });

      const { testServer } = await createTestServer(app);

      // Make two requests (at limit)
      const response1 = await testServer.get('/test');
      const response2 = await testServer.get('/test');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Headers should be set
      expect(response1.headers['x-ratelimit-limit']).toBe('2');
      expect(response1.headers['x-ratelimit-remaining']).toBe('1');
      expect(response2.headers['x-ratelimit-remaining']).toBe('0');
    });

    it('should block requests exceeding rate limit', async () => {
      // Apply rate limiter
      app.use(createRateLimiter({ windowMs: 60000, max: 2 }));

      // Create a test route
      app.get('/test', (req, res) => {
        res.status(200).json({ success: true });
      });

      const { testServer } = await createTestServer(app);

      // Exhaust the limit
      await testServer.get('/test');
      await testServer.get('/test');

      // Third request should be blocked
      const response3 = await testServer.get('/test');

      expect(response3.status).toBe(429);
      expect(response3.body.error).toBe('Too Many Requests');
    });
  });

  describe('Complete Integration', () => {
    let app;
    let sessionMock;

    beforeEach(() => {
      app = express();
      sessionMock = {};

      // Mock session middleware
      app.use((req, res, next) => {
        req.session = sessionMock;
        next();
      });

      // Add body parser
      app.use(express.urlencoded({ extended: true }));
      app.use(express.json());
    });

    it('should successfully integrate all security components', async () => {
      // Create a completely fresh Express app and server for this test
      const freshApp = express();

      // Apply basic middleware
      freshApp.use(express.json());
      freshApp.use(express.urlencoded({ extended: true }));

      // Create a dedicated session for this test
      const testSession = {};
      freshApp.use((req, res, next) => {
        req.session = testSession;
        next();
      });

      // Generate a CSRF token
      const token = generateCsrfToken(testSession);

      // Apply CSRF middleware (skip for /api routes)
      const csrf = createCsrfMiddleware();
      freshApp.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        csrf(req, res, next);
      });

      // Apply rate limiter to API routes - use a dedicated rate limiter for this test
      const apiLimiter = createRateLimiter({
        windowMs: 60000,
        max: 1,
        // Use a custom store to avoid shared state with other tests
        store: new Map(),
      });
      freshApp.use('/api', apiLimiter);

      // Create test routes
      freshApp.post('/protected', (req, res) => {
        // Sanitize input
        const safeContent = sanitizeHtml(req.body.content || '');
        res.status(200).json({ success: true, content: safeContent });
      });

      freshApp.get('/api/data', (req, res) => {
        res.status(200).json({ success: true, data: 'API response' });
      });

      // Create a dedicated test server
      const server = createServer(freshApp);
      const testClient = request(server);

      // Test CSRF protection with sanitization
      const csrfResponse = await testClient
        .post('/protected')
        .set('Content-Type', 'application/json')
        .send({
          _csrf: token,
          content: '<script>alert("XSS")</script>Safe content',
        });

      expect(csrfResponse.status).toBe(200);
      expect(csrfResponse.body.content).not.toContain('<script>');
      expect(csrfResponse.body.content).toContain('Safe content');

      // Test rate limiting (first request passes)
      const apiResponse1 = await testClient.get('/api/data');
      expect(apiResponse1.status).toBe(200);

      // Second request should be rate limited
      const apiResponse2 = await testClient.get('/api/data');
      expect(apiResponse2.status).toBe(429);
    });
  });
});
