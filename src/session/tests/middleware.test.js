/**
 * Middleware functionality tests for @voilajs/appkit session module
 * Tests session middleware, authentication, and authorization
 *
 * @file src/session/tests/middleware.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
} from '../middleware.js';
import { MemoryStore } from '../stores.js';
import { TEST_SECRET, createMockRequest, createMockResponse } from './setup.js';

describe('Session Middleware Module', () => {
  describe('createSessionMiddleware', () => {
    let sessionMiddleware;

    beforeEach(() => {
      sessionMiddleware = createSessionMiddleware({
        secret: TEST_SECRET,
        maxAge: 60000, // 1 minute for tests
      });
    });

    it('should create session middleware function', () => {
      expect(sessionMiddleware).toBeDefined();
      expect(typeof sessionMiddleware).toBe('function');
    });

    it('should create new session on first request', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await sessionMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.session).toBeDefined();
      expect(req.session.id).toBeNull();
      expect(req.session.data).toEqual({});
      expect(req.session.isActive()).toBe(false);
    });

    it('should save session data', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await sessionMiddleware(req, res, next);

      const testData = { user: { id: 123, name: 'Test User' } };
      await req.session.save(testData);

      expect(req.session.data).toMatchObject(testData);
      expect(req.session.id).toBeTruthy();
      expect(req.session.isActive()).toBe(true);
      expect(res.headers['Set-Cookie']).toBeTruthy();
    });

    it('should handle invalid session cookie', async () => {
      const req = createMockRequest({
        headers: { cookie: 'sessionId=invalid.signature' },
      });
      const res = createMockResponse();
      const next = vi.fn();

      await sessionMiddleware(req, res, next);

      expect(req.session.id).toBeNull();
      expect(req.session.isActive()).toBe(false);
    });

    it('should use custom store', async () => {
      const customStore = new MemoryStore();
      const storeSpy = vi.spyOn(customStore, 'set');

      const middleware = createSessionMiddleware({
        secret: TEST_SECRET,
        store: customStore,
      });

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await middleware(req, res, next);
      await req.session.save({ test: 'data' });

      expect(storeSpy).toHaveBeenCalled();
    });

    it('should require secret in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      expect(() => createSessionMiddleware({})).toThrow(
        'Session secret is required in production'
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('createSessionAuthMiddleware', () => {
    let sessionMiddleware;
    let authMiddleware;

    beforeEach(() => {
      sessionMiddleware = createSessionMiddleware({ secret: TEST_SECRET });
      authMiddleware = createSessionAuthMiddleware();
    });

    it('should create auth middleware function', () => {
      expect(authMiddleware).toBeDefined();
      expect(typeof authMiddleware).toBe('function');
    });

    it('should allow access for authenticated user', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      // Setup session
      await sessionMiddleware(req, res, next);
      await req.session.save({ user: { id: 123, name: 'Test User' } });

      // Test auth
      await authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(2);
      expect(req.user).toEqual({ id: 123, name: 'Test User' });
    });

    it('should deny access for unauthenticated user', async () => {
      const req = createMockRequest({
        headers: { accept: 'application/json' },
      });
      const res = createMockResponse();
      const next = vi.fn();

      // Setup empty session
      await sessionMiddleware(req, res, next);
      next.mockClear();

      // Test auth - should not call next
      await authMiddleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      // The auth middleware should handle the response
    });

    it('should use custom user extraction', async () => {
      const customAuth = createSessionAuthMiddleware({
        getUser: (sessionData) => sessionData.currentUser,
      });

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      await sessionMiddleware(req, res, next);
      await req.session.save({ currentUser: { id: 456, name: 'Custom User' } });

      await customAuth(req, res, next);

      expect(next).toHaveBeenCalledTimes(2);
      expect(req.user).toEqual({ id: 456, name: 'Custom User' });
    });
  });

  describe('createSessionAuthorizationMiddleware', () => {
    let sessionMiddleware;
    let authMiddleware;

    beforeEach(() => {
      sessionMiddleware = createSessionMiddleware({ secret: TEST_SECRET });
      authMiddleware = createSessionAuthMiddleware();
    });

    it('should create authorization middleware', () => {
      const adminOnly = createSessionAuthorizationMiddleware(['admin']);
      expect(adminOnly).toBeDefined();
      expect(typeof adminOnly).toBe('function');
    });

    it('should allow access for user with required role', async () => {
      const adminOnly = createSessionAuthorizationMiddleware(['admin']);

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      // Setup authenticated session
      await sessionMiddleware(req, res, next);
      await req.session.save({ user: { id: 123, role: 'admin' } });
      await authMiddleware(req, res, next);

      // Test authorization
      await adminOnly(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
    });

    it('should deny access for user without required role', async () => {
      const adminOnly = createSessionAuthorizationMiddleware(['admin']);

      const req = createMockRequest({
        headers: { accept: 'application/json' },
      });
      const res = createMockResponse();
      const next = vi.fn();

      // Setup authenticated session with wrong role
      await sessionMiddleware(req, res, next);
      await req.session.save({ user: { id: 123, role: 'user' } });
      await authMiddleware(req, res, next);
      next.mockClear();

      // Test authorization - should not call next
      await adminOnly(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('should work with multiple allowed roles', async () => {
      const editorAccess = createSessionAuthorizationMiddleware([
        'editor',
        'admin',
      ]);

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      // Setup authenticated session
      await sessionMiddleware(req, res, next);
      await req.session.save({ user: { id: 123, role: 'editor' } });
      await authMiddleware(req, res, next);

      // Test authorization
      await editorAccess(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
    });

    it('should handle user with array of roles', async () => {
      const adminOnly = createSessionAuthorizationMiddleware(['admin'], {
        getRoles: (user) => user.roles || [],
      });

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      // Setup authenticated session with multiple roles
      await sessionMiddleware(req, res, next);
      await req.session.save({ user: { id: 123, roles: ['user', 'admin'] } });
      await authMiddleware(req, res, next);

      // Test authorization
      await adminOnly(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
    });

    it('should use custom role extraction', async () => {
      const premiumOnly = createSessionAuthorizationMiddleware(['premium'], {
        getRoles: (user) => {
          return user.subscription === 'premium' ? ['premium'] : [];
        },
      });

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      // Setup authenticated session
      await sessionMiddleware(req, res, next);
      await req.session.save({ user: { id: 123, subscription: 'premium' } });
      await authMiddleware(req, res, next);

      // Test authorization
      await premiumOnly(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration', () => {
    it('should work with complete session auth flow', async () => {
      const sessionMiddleware = createSessionMiddleware({
        secret: TEST_SECRET,
      });
      const authMiddleware = createSessionAuthMiddleware();
      const adminOnly = createSessionAuthorizationMiddleware(['admin']);

      const req = createMockRequest();
      const res = createMockResponse();
      const next = vi.fn();

      // Session middleware
      await sessionMiddleware(req, res, next);

      // Login user
      await req.session.save({ user: { id: 123, role: 'admin' } });

      // Auth middleware
      await authMiddleware(req, res, next);
      expect(req.user).toEqual({ id: 123, role: 'admin' });

      // Authorization middleware
      await adminOnly(req, res, next);
      expect(next).toHaveBeenCalledTimes(3);
    });
  });
});
