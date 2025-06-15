/**
 * Middleware functionality tests for @voilajsx/appkit auth module
 * Tests authentication and authorization middleware including environment variables
 *
 * @file src/auth/tests/middleware.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '../middleware.js';
import { generateToken } from '../jwt.js';
import {
  TEST_SECRET,
  TEST_PAYLOAD,
  createMockRequest,
  createMockResponse,
} from './setup.js';

describe('Middleware Module', () => {
  // Store original environment variables
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear environment variables before each test
    delete process.env.VOILA_AUTH_SECRET;
    delete process.env.VOILA_AUTH_TOKEN_HEADER;
    delete process.env.VOILA_AUTH_COOKIE_NAME;
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('createAuthMiddleware', () => {
    let auth;
    let validToken;

    beforeEach(() => {
      validToken = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
    });

    it('should create middleware function with explicit secret', () => {
      auth = createAuthMiddleware({ secret: TEST_SECRET });
      expect(auth).toBeDefined();
      expect(typeof auth).toBe('function');
    });

    it('should create middleware function with environment secret', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      auth = createAuthMiddleware();
      expect(auth).toBeDefined();
      expect(typeof auth).toBe('function');
    });

    it('should authenticate valid token from Authorization header with explicit secret', async () => {
      auth = createAuthMiddleware({ secret: TEST_SECRET });

      const req = createMockRequest({
        headers: { authorization: `Bearer ${validToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
      expect(res.statusCode).toBe(200);
    });

    it('should authenticate valid token using environment secret', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      auth = createAuthMiddleware();

      const req = createMockRequest({
        headers: { authorization: `Bearer ${validToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should use custom header name from environment', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-auth-token';

      auth = createAuthMiddleware();

      const req = createMockRequest({
        headers: { 'x-auth-token': `Bearer ${validToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should use custom cookie name from environment', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_COOKIE_NAME = 'sessionToken';

      auth = createAuthMiddleware();

      const req = createMockRequest({
        cookies: { sessionToken: validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should prioritize explicit options over environment variables', async () => {
      process.env.VOILA_AUTH_SECRET = 'env-secret';
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-env-header';
      process.env.VOILA_AUTH_COOKIE_NAME = 'envCookie';

      // Create middleware with explicit options
      auth = createAuthMiddleware({
        secret: TEST_SECRET, // Override env secret
        getToken: (req) => {
          // Custom token extraction overrides env header/cookie names
          return req.headers['x-custom-header'] || null;
        },
      });

      const req = createMockRequest({
        headers: { 'x-custom-header': validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should authenticate valid token from cookie with environment config', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_COOKIE_NAME = 'authToken';

      auth = createAuthMiddleware();

      const req = createMockRequest({
        cookies: { authToken: validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should authenticate valid token from query parameter', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      auth = createAuthMiddleware();

      const req = createMockRequest({
        query: { token: validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should handle missing token', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      auth = createAuthMiddleware();

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Authentication required');
    });

    it('should handle invalid token with environment secret', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      auth = createAuthMiddleware();

      const req = createMockRequest({
        headers: { authorization: 'Bearer invalid.token' },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe(
        'Invalid authentication. Please sign in again.'
      );
    });

    it('should handle expired token', async () => {
      const expiredToken = generateToken(TEST_PAYLOAD, {
        secret: TEST_SECRET,
        expiresIn: '1ms',
      });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      auth = createAuthMiddleware();

      const req = createMockRequest({
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe(
        'Your session has expired. Please sign in again.'
      );
    });

    it('should use custom token extraction with environment fallback', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-fallback-header';

      auth = createAuthMiddleware({
        getToken: (req) => {
          // Custom extraction that can still use environment header as fallback
          return (
            req.headers['x-custom-token'] ||
            req.headers[process.env.VOILA_AUTH_TOKEN_HEADER?.toLowerCase()] ||
            null
          );
        },
      });

      const req = createMockRequest({
        headers: { 'x-fallback-header': validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should use custom error handler', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      const customErrorHandler = vi.fn();

      auth = createAuthMiddleware({
        onError: customErrorHandler,
      });

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(customErrorHandler).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw error for missing secret in both options and environment', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => createAuthMiddleware({})).toThrow(
        'JWT secret is required for authentication middleware'
      );
      expect(() => createAuthMiddleware()).toThrow(
        'JWT secret is required for authentication middleware'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ JWT Secret Missing: No secret provided via options.secret or VOILA_AUTH_SECRET environment variable'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('createAuthorizationMiddleware', () => {
    let authMiddleware;
    let adminToken;
    let userToken;

    beforeEach(() => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      authMiddleware = createAuthMiddleware();

      adminToken = generateToken(
        { userId: '1', roles: ['admin', 'user'] },
        { secret: TEST_SECRET }
      );

      userToken = generateToken(
        { userId: '2', roles: ['user'] },
        { secret: TEST_SECRET }
      );
    });

    it('should create authorization middleware', () => {
      const adminOnly = createAuthorizationMiddleware(['admin']);
      expect(adminOnly).toBeDefined();
      expect(typeof adminOnly).toBe('function');
    });

    it('should allow access for user with required role', async () => {
      const adminOnly = createAuthorizationMiddleware(['admin']);

      const req = createMockRequest({
        headers: { authorization: `Bearer ${adminToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      // First authenticate
      await authMiddleware(req, res, next);

      // Then authorize
      await adminOnly(req, res, next);

      expect(next).toHaveBeenCalledTimes(2);
      expect(res.statusCode).toBe(200);
    });

    it('should deny access for user without required role', async () => {
      const adminOnly = createAuthorizationMiddleware(['admin']);

      const req = createMockRequest({
        headers: { authorization: `Bearer ${userToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      // First authenticate
      await authMiddleware(req, res, next);
      next.mockClear();

      // Then authorize
      await adminOnly(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Insufficient permissions');
    });

    it('should work with multiple allowed roles', async () => {
      const editorAccess = createAuthorizationMiddleware(['editor', 'admin']);

      const req = createMockRequest({
        headers: { authorization: `Bearer ${adminToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await authMiddleware(req, res, next);
      await editorAccess(req, res, next);

      expect(next).toHaveBeenCalledTimes(2);
    });

    it('should handle missing authentication', async () => {
      const adminOnly = createAuthorizationMiddleware(['admin']);

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await adminOnly(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Authentication required');
    });

    it('should use custom role extraction', async () => {
      const premiumOnly = createAuthorizationMiddleware(['premium'], {
        getRoles: (req) => {
          return req.user.subscription === 'premium' ? ['premium'] : [];
        },
      });

      const premiumToken = generateToken(
        { userId: '3', subscription: 'premium' },
        { secret: TEST_SECRET }
      );

      const req = createMockRequest({
        headers: { authorization: `Bearer ${premiumToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await authMiddleware(req, res, next);
      await premiumOnly(req, res, next);

      expect(next).toHaveBeenCalledTimes(2);
    });

    it('should handle user with no roles', async () => {
      const noRolesToken = generateToken(
        { userId: '4' }, // No roles property
        { secret: TEST_SECRET }
      );

      const adminOnly = createAuthorizationMiddleware(['admin']);

      const req = createMockRequest({
        headers: { authorization: `Bearer ${noRolesToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await authMiddleware(req, res, next);
      next.mockClear();

      await adminOnly(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('No roles found for user');
    });

    it('should throw error for invalid allowed roles', () => {
      expect(() => createAuthorizationMiddleware(null)).toThrow(
        'allowedRoles must be a non-empty array'
      );
      expect(() => createAuthorizationMiddleware([])).toThrow(
        'allowedRoles must be a non-empty array'
      );
      expect(() => createAuthorizationMiddleware('admin')).toThrow(
        'allowedRoles must be a non-empty array'
      );
    });
  });

  describe('Environment Variable Integration', () => {
    it('should work with complete auth flow using environment variables', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-custom-auth';
      process.env.VOILA_AUTH_COOKIE_NAME = 'customToken';

      const auth = createAuthMiddleware();
      const adminOnly = createAuthorizationMiddleware(['admin']);

      const adminPayload = { userId: '1', roles: ['admin'] };
      const adminToken = generateToken(adminPayload, { secret: TEST_SECRET });

      const req = createMockRequest({
        headers: { 'x-custom-auth': `Bearer ${adminToken}` },
      });
      const res = createMockResponse();
      const next = vi.fn();

      // Auth middleware
      await auth(req, res, next);
      expect(req.user).toMatchObject(adminPayload);

      // Authorization middleware
      await adminOnly(req, res, next);
      expect(next).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple token sources with environment configuration', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-mobile-token';
      process.env.VOILA_AUTH_COOKIE_NAME = 'mobileAuth';

      const auth = createAuthMiddleware();
      const validToken = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });

      // Test custom header
      const req1 = createMockRequest({
        headers: { 'x-mobile-token': `Bearer ${validToken}` },
      });
      const res1 = createMockResponse();
      const next1 = vi.fn();

      await auth(req1, res1, next1);
      expect(next1).toHaveBeenCalled();
      expect(req1.user).toMatchObject(TEST_PAYLOAD);

      // Test custom cookie
      const req2 = createMockRequest({
        cookies: { mobileAuth: validToken },
      });
      const res2 = createMockResponse();
      const next2 = vi.fn();

      await auth(req2, res2, next2);
      expect(next2).toHaveBeenCalled();
      expect(req2.user).toMatchObject(TEST_PAYLOAD);

      // Test query parameter (default fallback)
      const req3 = createMockRequest({
        query: { token: validToken },
      });
      const res3 = createMockResponse();
      const next3 = vi.fn();

      await auth(req3, res3, next3);
      expect(next3).toHaveBeenCalled();
      expect(req3.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should handle mixed environment and explicit configuration in middleware', async () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-env-header';

      // Create middleware that uses environment secret but custom token extraction
      const auth = createAuthMiddleware({
        // Uses VOILA_AUTH_SECRET from environment
        getToken: (req) => {
          // Custom extraction that overrides environment header setting
          return (
            req.headers['x-explicit-header'] ||
            req.headers['authorization']?.slice(7) ||
            null
          );
        },
      });

      const validToken = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });

      const req = createMockRequest({
        headers: { 'x-explicit-header': validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });
  });
});
