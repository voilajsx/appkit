/**
 * Utilities tests for @voilajsx/appkit session module
 * Tests SessionManager and utility functions
 *
 * @file src/session/tests/utils.test.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SessionManager,
  createSessionSecret,
  validateSessionConfig,
  sanitizeSessionData,
} from '../utils.js';
import { createMockRequest, createMockResponse } from './setup.js';

describe('Session Utils', () => {
  describe('SessionManager', () => {
    let manager;

    beforeEach(() => {
      manager = new SessionManager({
        secret: 'test-secret',
        cookieName: 'testSession',
        maxAge: 3600000, // 1 hour
      });
    });

    it('should create session manager with default options', () => {
      const defaultManager = new SessionManager();

      expect(defaultManager.cookieName).toBe('sessionId');
      expect(defaultManager.maxAge).toBe(24 * 60 * 60 * 1000); // 24 hours
      expect(defaultManager.httpOnly).toBe(true);
      expect(defaultManager.sameSite).toBe('strict');
      expect(defaultManager.rolling).toBe(true);
      expect(defaultManager.path).toBe('/');
    });

    it('should generate secure session secret', () => {
      const manager = new SessionManager();
      expect(manager.secret).toMatch(/^[a-f0-9]{64}$/); // 32 bytes = 64 hex chars
    });

    it('should warn about auto-generated secret in production', () => {
      const originalEnv = process.env.NODE_ENV;
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'production';

      new SessionManager(); // No secret provided

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using auto-generated session secret')
      );

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should generate unique session IDs', () => {
      const id1 = manager.generateSessionId();
      const id2 = manager.generateSessionId();

      expect(id1).toMatch(/^[a-f0-9]{64}$/);
      expect(id2).toMatch(/^[a-f0-9]{64}$/);
      expect(id1).not.toBe(id2);
    });

    it('should sign and verify session IDs', () => {
      const sessionId = manager.generateSessionId();
      const signed = manager.signSessionId(sessionId);

      expect(signed).toContain('.');
      expect(signed.startsWith(sessionId)).toBe(true);

      const verified = manager.unsignSessionId(signed);
      expect(verified).toBe(sessionId);
    });

    it('should reject tampered session IDs', () => {
      const sessionId = manager.generateSessionId();
      const signed = manager.signSessionId(sessionId);
      const tampered = signed.replace(/.$/, 'X'); // Change last character

      const verified = manager.unsignSessionId(tampered);
      expect(verified).toBeNull();
    });

    it('should reject invalid session ID formats', () => {
      expect(manager.unsignSessionId('invalid')).toBeNull();
      expect(manager.unsignSessionId('no.signature.here')).toBeNull();
      expect(manager.unsignSessionId('')).toBeNull();
      expect(manager.unsignSessionId(null)).toBeNull();
    });

    it('should parse cookies correctly', () => {
      const cookieHeader = 'sessionId=abc123; otherCookie=def456; theme=dark';
      const parsed = manager.parseCookies(cookieHeader);

      expect(parsed).toEqual({
        sessionId: 'abc123',
        otherCookie: 'def456',
        theme: 'dark',
      });
    });

    it('should handle malformed cookies', () => {
      expect(manager.parseCookies('')).toEqual({});
      expect(manager.parseCookies('malformed')).toEqual({});
      expect(manager.parseCookies('key=')).toEqual({ key: '' });
    });

    it('should get session cookie from Express-style request', () => {
      const req = createMockRequest({
        cookies: { testSession: 'cookie-value' },
      });

      const value = manager.getCookie(req);
      expect(value).toBe('cookie-value');
    });

    it('should get session cookie from headers', () => {
      const req = createMockRequest({
        headers: { cookie: 'testSession=header-value; other=123' },
      });

      const value = manager.getCookie(req);
      expect(value).toBe('header-value');
    });

    it('should return null when no cookie found', () => {
      const req = createMockRequest();
      const value = manager.getCookie(req);
      expect(value).toBeNull();
    });

    it('should build cookie string correctly', () => {
      const cookie = manager.buildCookieString('testSession', 'value123', {
        maxAge: 3600000,
        path: '/app',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      });

      expect(cookie).toBe(
        'testSession=value123; Max-Age=3600; Path=/app; Secure; HttpOnly; SameSite=lax'
      );
    });

    it('should set cookie on Express-style response', () => {
      const res = createMockResponse();
      res.cookie = vi.fn();

      manager.setCookie(res, 'test-value');

      expect(res.cookie).toHaveBeenCalledWith('testSession', 'test-value', {
        maxAge: 3600000,
        secure: manager.secure,
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        domain: undefined,
      });
    });

    it('should set cookie using headers for other frameworks', () => {
      const res = createMockResponse();
      // Remove Express-style cookie method
      delete res.cookie;

      manager.setCookie(res, 'test-value');

      expect(res.setHeader).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.arrayContaining([
          expect.stringContaining('testSession=test-value'),
        ])
      );
    });

    it('should clear session cookie', () => {
      const res = createMockResponse();
      res.cookie = vi.fn();

      manager.clearCookie(res);

      expect(res.cookie).toHaveBeenCalledWith('testSession', '', {
        maxAge: 0,
        secure: manager.secure,
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        domain: undefined,
      });
    });

    it('should handle Fastify-style cookie functions', () => {
      const req = createMockRequest();
      req.cookies = vi.fn().mockReturnValue({ testSession: 'fastify-value' });

      const value = manager.getCookie(req);
      expect(value).toBe('fastify-value');
    });

    it('should handle Koa-style cookie setting', () => {
      const res = createMockResponse();
      res.cookies = {
        set: vi.fn(),
      };
      delete res.cookie;
      delete res.setCookie;

      manager.setCookie(res, 'koa-value');

      expect(res.cookies.set).toHaveBeenCalledWith(
        'testSession',
        'koa-value',
        expect.any(Object)
      );
    });
  });

  describe('createSessionSecret', () => {
    it('should create secure random secret', () => {
      const secret = createSessionSecret();

      expect(secret).toMatch(/^[a-f0-9]{64}$/); // 32 bytes = 64 hex chars
      expect(secret.length).toBe(64);
    });

    it('should create secret with custom length', () => {
      const secret = createSessionSecret(16);

      expect(secret).toMatch(/^[a-f0-9]{32}$/); // 16 bytes = 32 hex chars
      expect(secret.length).toBe(32);
    });

    it('should create unique secrets', () => {
      const secret1 = createSessionSecret();
      const secret2 = createSessionSecret();

      expect(secret1).not.toBe(secret2);
    });
  });

  describe('validateSessionConfig', () => {
    it('should validate valid configuration', () => {
      const config = {
        secret: 'valid-secret-key',
        maxAge: 3600000,
        cookieName: 'validCookie',
        sameSite: 'strict',
      };

      const result = validateSessionConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require secret in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const result = validateSessionConfig({});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret is required in production');

      process.env.NODE_ENV = originalEnv;
    });

    it('should warn about missing secret in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = validateSessionConfig({});

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        'No secret provided, using auto-generated secret'
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should validate secret type and length', () => {
      let result = validateSessionConfig({ secret: 123 });
      expect(result.errors).toContain('Secret must be a string');

      result = validateSessionConfig({ secret: 'short' });
      expect(result.warnings).toContain(
        'Secret should be at least 16 characters for security'
      );
    });

    it('should validate maxAge', () => {
      let result = validateSessionConfig({
        secret: 'valid-secret',
        maxAge: -1,
      });
      expect(result.errors).toContain('maxAge must be a positive number');

      result = validateSessionConfig({
        secret: 'valid-secret',
        maxAge: 'invalid',
      });
      expect(result.errors).toContain('maxAge must be a positive number');

      result = validateSessionConfig({ secret: 'valid-secret', maxAge: 30000 }); // 30 seconds
      expect(result.warnings).toContain(
        'maxAge is very short (less than 1 minute)'
      );

      result = validateSessionConfig({
        secret: 'valid-secret',
        maxAge: 40 * 24 * 60 * 60 * 1000,
      }); // 40 days
      expect(result.warnings).toContain(
        'maxAge is very long (more than 30 days)'
      );
    });

    it('should validate cookie name', () => {
      let result = validateSessionConfig({
        secret: 'valid-secret',
        cookieName: 123,
      });
      expect(result.errors).toContain('cookieName must be a string');

      result = validateSessionConfig({
        secret: 'valid-secret',
        cookieName: 'invalid/name',
      });
      expect(result.errors).toContain('cookieName contains invalid characters');
    });

    it('should validate sameSite', () => {
      const result = validateSessionConfig({
        secret: 'valid-secret',
        sameSite: 'invalid',
      });
      expect(result.errors).toContain(
        'sameSite must be one of: strict, lax, none'
      );
    });

    it('should warn about security settings', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      let result = validateSessionConfig({
        secret: 'valid-secret',
        secure: false,
      });
      expect(result.warnings).toContain(
        'secure=false is not recommended in production'
      );

      result = validateSessionConfig({
        secret: 'valid-secret',
        httpOnly: false,
      });
      expect(result.warnings).toContain(
        'httpOnly=false allows JavaScript access to session cookies'
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('sanitizeSessionData', () => {
    it('should return non-object data unchanged', () => {
      expect(sanitizeSessionData('string')).toBe('string');
      expect(sanitizeSessionData(123)).toBe(123);
      expect(sanitizeSessionData(null)).toBeNull();
    });

    it('should remove specified keys', () => {
      const data = {
        user: { id: 123, password: 'secret' },
        token: 'jwt-token',
        publicData: 'keep-this',
      };

      const sanitized = sanitizeSessionData(data, {
        removeKeys: ['password', 'token'],
      });

      expect(sanitized).toEqual({
        user: { id: 123 },
        publicData: 'keep-this',
      });
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          profile: {
            name: 'John',
            password: 'secret',
          },
          settings: {
            theme: 'dark',
            apiKey: 'secret-key',
          },
        },
      };

      const sanitized = sanitizeSessionData(data, {
        removeKeys: ['password', 'apiKey'],
      });

      expect(sanitized).toEqual({
        user: {
          profile: {
            name: 'John',
          },
          settings: {
            theme: 'dark',
          },
        },
      });
    });

    it('should handle arrays', () => {
      const data = {
        users: [
          { id: 1, name: 'John', password: 'secret1' },
          { id: 2, name: 'Jane', password: 'secret2' },
        ],
        publicList: ['item1', 'item2'],
      };

      const sanitized = sanitizeSessionData(data, {
        removeKeys: ['password'],
      });

      expect(sanitized).toEqual({
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ],
        publicList: ['item1', 'item2'],
      });
    });

    it('should throw error for oversized data', () => {
      const largeData = {
        bigString: 'x'.repeat(2 * 1024 * 1024), // 2MB
      };

      expect(() => {
        sanitizeSessionData(largeData, { maxSize: 1024 * 1024 }); // 1MB limit
      }).toThrow('Session data too large');
    });

    it('should handle complex nested structures', () => {
      const data = {
        user: {
          id: 123,
          credentials: {
            password: 'secret',
            tokens: ['token1', 'token2'],
          },
          profile: {
            name: 'John',
            preferences: {
              theme: 'dark',
              apiKeys: {
                github: 'secret-key',
                google: 'another-secret',
              },
            },
          },
        },
        metadata: {
          sessionId: 'keep-this',
          secrets: {
            encryptionKey: 'very-secret',
          },
        },
      };

      const sanitized = sanitizeSessionData(data, {
        removeKeys: ['password', 'tokens', 'apiKeys', 'encryptionKey'],
      });

      expect(sanitized).toEqual({
        user: {
          id: 123,
          credentials: {},
          profile: {
            name: 'John',
            preferences: {
              theme: 'dark',
            },
          },
        },
        metadata: {
          sessionId: 'keep-this',
          secrets: {},
        },
      });
    });

    it('should preserve data types correctly', () => {
      const data = {
        string: 'text',
        number: 42,
        boolean: true,
        date: new Date('2023-01-01'),
        array: [1, 2, 3],
        nullValue: null,
        undefinedValue: undefined,
      };

      const sanitized = sanitizeSessionData(data);

      expect(sanitized.string).toBe('text');
      expect(sanitized.number).toBe(42);
      expect(sanitized.boolean).toBe(true);
      expect(sanitized.date).toBe('2023-01-01T00:00:00.000Z'); // JSON serialized
      expect(sanitized.array).toEqual([1, 2, 3]);
      expect(sanitized.nullValue).toBeNull();
      expect(sanitized.undefinedValue).toBeUndefined();
    });

    it('should handle empty objects and arrays', () => {
      const data = {
        emptyObject: {},
        emptyArray: [],
        nested: {
          empty: {},
        },
      };

      const sanitized = sanitizeSessionData(data);

      expect(sanitized).toEqual(data);
    });
  });

  describe('Integration', () => {
    it('should work together in session management flow', () => {
      // Create session manager
      const manager = new SessionManager({
        secret: createSessionSecret(),
        maxAge: 3600000,
      });

      // Validate configuration
      const validation = validateSessionConfig({
        secret: manager.secret,
        maxAge: manager.maxAge,
      });

      expect(validation.valid).toBe(true);

      // Create and sign session
      const sessionId = manager.generateSessionId();
      const signedId = manager.signSessionId(sessionId);

      // Verify session
      const verifiedId = manager.unsignSessionId(signedId);
      expect(verifiedId).toBe(sessionId);

      // Sanitize session data
      const rawData = {
        user: { id: 123, password: 'secret' },
        preferences: { theme: 'dark' },
      };

      const sanitized = sanitizeSessionData(rawData, {
        removeKeys: ['password'],
      });

      expect(sanitized).toEqual({
        user: { id: 123 },
        preferences: { theme: 'dark' },
      });
    });

    it('should handle framework-agnostic cookie operations', () => {
      const manager = new SessionManager({
        secret: 'test-secret',
        cookieName: 'testCookie',
      });

      // Test with different request styles
      const expressReq = createMockRequest({
        cookies: { testCookie: 'express-value' },
      });

      const headerReq = createMockRequest({
        headers: { cookie: 'testCookie=header-value' },
      });

      expect(manager.getCookie(expressReq)).toBe('express-value');
      expect(manager.getCookie(headerReq)).toBe('header-value');

      // Test with different response styles
      const expressRes = createMockResponse();
      expressRes.cookie = vi.fn();

      const genericRes = createMockResponse();
      delete genericRes.cookie;

      manager.setCookie(expressRes, 'test-value');
      manager.setCookie(genericRes, 'test-value');

      expect(expressRes.cookie).toHaveBeenCalled();
      expect(genericRes.setHeader).toHaveBeenCalled();
    });
  });
});
