/**
 * Middleware functionality tests for @voilajs/appkit auth module
 * Tests authentication and authorization middleware
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  describe('createAuthMiddleware', () => {
    let auth;
    let validToken;

    beforeEach(() => {
      auth = createAuthMiddleware({ secret: TEST_SECRET });
      validToken = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
    });

    it('should create middleware function', () => {
      expect(auth).toBeDefined();
      expect(typeof auth).toBe('function');
    });

    it('should authenticate valid token from Authorization header', async () => {
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

    it('should authenticate valid token from cookie', async () => {
      const req = createMockRequest({
        cookies: { token: validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should authenticate valid token from query parameter', async () => {
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
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Authentication required');
    });

    it('should handle invalid token', async () => {
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

    it('should use custom token extraction', async () => {
      const customAuth = createAuthMiddleware({
        secret: TEST_SECRET,
        getToken: (req) => req.headers['x-api-key'],
      });

      const req = createMockRequest({
        headers: { 'x-api-key': validToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await customAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toMatchObject(TEST_PAYLOAD);
    });

    it('should use custom error handler', async () => {
      const customAuth = createAuthMiddleware({
        secret: TEST_SECRET,
        onError: (error, req, res) => {
          res.status(403).json({ customError: error.message });
        },
      });

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await customAuth(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(res.body.customError).toBe('No token provided');
    });

    it('should throw error for missing secret', () => {
      expect(() => createAuthMiddleware({})).toThrow('JWT secret is required');
      expect(() => createAuthMiddleware({ secret: null })).toThrow(
        'JWT secret is required'
      );
    });
  });

  describe('createAuthorizationMiddleware', () => {
    let authMiddleware;
    let adminToken;
    let userToken;

    beforeEach(() => {
      authMiddleware = createAuthMiddleware({ secret: TEST_SECRET });

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

  describe('Integration', () => {
    it('should work with complete auth flow', async () => {
      const auth = createAuthMiddleware({ secret: TEST_SECRET });
      const adminOnly = createAuthorizationMiddleware(['admin']);

      const adminPayload = { userId: '1', roles: ['admin'] };
      const adminToken = generateToken(adminPayload, { secret: TEST_SECRET });

      const req = createMockRequest({
        headers: { authorization: `Bearer ${adminToken}` },
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
  });
});
