/**
 * Rate Limiter Tests - @voilajsx/appkit Security Module
 *
 * FINAL FIXED VERSION - Handles global store cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRateLimiter } from '../rateLimiter.js';

describe('Rate Limiter (Unit Tests)', () => {
  let clock;

  beforeEach(() => {
    clock = vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMocks = () => ({
    req: {
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      headers: {},
    },
    res: {
      statusCode: null,
      json: vi.fn(),
      send: vi.fn(),
      setHeader: vi.fn(),
      end: vi.fn(),
    },
    next: vi.fn(),
  });

  describe('createRateLimiter()', () => {
    it('should throw error when required options are missing or invalid', () => {
      const expectedError =
        'createRateLimiter: `windowMs` (positive number) and `max` (non-negative number) are required options.';

      expect(() => createRateLimiter()).toThrow(expectedError);
      expect(() => createRateLimiter({})).toThrow(expectedError);
      expect(() => createRateLimiter({ windowMs: 1000 })).toThrow(
        expectedError
      );
      expect(() => createRateLimiter({ max: 5 })).toThrow(expectedError);
    });

    it('should create middleware function when options are valid', () => {
      const middleware = createRateLimiter({ windowMs: 1000, max: 5 });
      expect(typeof middleware).toBe('function');
    });

    it('should allow requests within the rate limit', () => {
      // Use custom store to avoid global pollution
      const store = new Map();
      const middleware = createRateLimiter({ windowMs: 1000, max: 2, store });

      // First request
      const mocks1 = createMocks();
      middleware(mocks1.req, mocks1.res, mocks1.next);
      expect(mocks1.next).toHaveBeenCalledTimes(1);
      expect(mocks1.res.statusCode).toBeNull();
      expect(mocks1.res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 2);
      expect(mocks1.res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        1
      );

      // Second request (still within limit)
      const mocks2 = createMocks();
      middleware(mocks2.req, mocks2.res, mocks2.next);
      expect(mocks2.next).toHaveBeenCalledTimes(1);
      expect(mocks2.res.statusCode).toBeNull();
      expect(mocks2.res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        0
      );
    });

    it('should block requests that exceed the rate limit', () => {
      // Use custom store to avoid global pollution
      const store = new Map();
      const middleware = createRateLimiter({ windowMs: 1000, max: 1, store });

      // First request - should be allowed
      const mocks1 = createMocks();
      middleware(mocks1.req, mocks1.res, mocks1.next);
      expect(mocks1.next).toHaveBeenCalledTimes(1);
      expect(mocks1.res.statusCode).toBeNull();
      expect(mocks1.res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        0
      );

      // Second request - should be blocked
      const mocks2 = createMocks();
      middleware(mocks2.req, mocks2.res, mocks2.next);
      expect(mocks2.next).not.toHaveBeenCalled();
      expect(mocks2.res.statusCode).toBe(429);
      expect(mocks2.res.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: 'Too many requests, please try again later.',
        retryAfter: expect.any(Number),
      });
    });

    it('should reset counter after window expires', () => {
      // Use custom store to avoid global pollution
      const store = new Map();
      const middleware = createRateLimiter({ windowMs: 1000, max: 1, store });

      // First request - allowed
      const mocks1 = createMocks();
      middleware(mocks1.req, mocks1.res, mocks1.next);
      expect(mocks1.next).toHaveBeenCalledTimes(1);

      // Second request - blocked
      const mocks2 = createMocks();
      middleware(mocks2.req, mocks2.res, mocks2.next);
      expect(mocks2.res.statusCode).toBe(429);

      // Advance time past window
      clock.advanceTimersByTime(1001);

      // Third request after reset - should be allowed
      const mocks3 = createMocks();
      middleware(mocks3.req, mocks3.res, mocks3.next);
      expect(mocks3.next).toHaveBeenCalledTimes(1);
      expect(mocks3.res.statusCode).toBeNull();
    });

    it('should use custom key generator for different clients', () => {
      const keyGenerator = vi.fn((req) => req.headers['x-custom-id'] || req.ip);
      const store = new Map();
      const middleware = createRateLimiter({
        windowMs: 1000,
        max: 1,
        keyGenerator,
        store,
      });

      // Client A - first request (allowed)
      const mocksA1 = createMocks();
      mocksA1.req.headers['x-custom-id'] = 'clientA';
      middleware(mocksA1.req, mocksA1.res, mocksA1.next);
      expect(mocksA1.next).toHaveBeenCalledTimes(1);

      // Client B - first request (should also be allowed, different client)
      const mocksB1 = createMocks();
      mocksB1.req.headers['x-custom-id'] = 'clientB';
      middleware(mocksB1.req, mocksB1.res, mocksB1.next);
      expect(mocksB1.next).toHaveBeenCalledTimes(1);

      // Client A - second request (should be blocked)
      const mocksA2 = createMocks();
      mocksA2.req.headers['x-custom-id'] = 'clientA';
      middleware(mocksA2.req, mocksA2.res, mocksA2.next);
      expect(mocksA2.next).not.toHaveBeenCalled();
      expect(mocksA2.res.statusCode).toBe(429);
    });

    it('should use custom message when limit is exceeded', () => {
      const customMessage = 'Custom rate limit message';
      const store = new Map();
      const middleware = createRateLimiter({
        windowMs: 1000,
        max: 1,
        message: customMessage,
        store,
      });

      // First request - allowed
      const mocks1 = createMocks();
      middleware(mocks1.req, mocks1.res, mocks1.next);

      // Second request - blocked with custom message
      const mocks2 = createMocks();
      middleware(mocks2.req, mocks2.res, mocks2.next);
      expect(mocks2.res.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: customMessage,
        retryAfter: expect.any(Number),
      });
    });

    it('should use custom store', () => {
      const customStore = new Map();
      const middleware = createRateLimiter({
        windowMs: 1000,
        max: 2,
        store: customStore,
      });

      const { req, res, next } = createMocks();
      middleware(req, res, next);

      expect(customStore.size).toBe(1);
      expect(customStore.has('127.0.0.1')).toBe(true);

      const record = customStore.get('127.0.0.1');
      expect(record.count).toBe(1);
      expect(record.resetTime).toBeGreaterThan(Date.now());
    });

    it('should handle max: 0 (block all requests)', () => {
      const store = new Map();
      const middleware = createRateLimiter({ windowMs: 1000, max: 0, store });

      const { req, res, next } = createMocks();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: 'Too many requests, please try again later.',
        retryAfter: expect.any(Number),
      });
    });

    it('should set proper rate limit headers', () => {
      const store = new Map();
      const middleware = createRateLimiter({ windowMs: 5000, max: 3, store });
      const { req, res, next } = createMocks();

      middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 3);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 2);
      expect(res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(Number)
      );
    });
  });
});
