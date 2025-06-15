/**
 * JWT functionality tests for @voilajsx/appkit auth module
 * Tests token generation and verification features including environment variables
 *
 * @file src/auth/tests/jwt.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateToken, verifyToken } from '../jwt.js';
import { TEST_SECRET, TEST_PAYLOAD } from './setup.js';

describe('JWT Module', () => {
  // Store original environment variables
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear environment variables before each test
    delete process.env.VOILA_AUTH_SECRET;
    delete process.env.VOILA_AUTH_EXPIRES_IN;
    delete process.env.VOILA_AUTH_ALGORITHM;
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a token successfully with explicit options', () => {
      const token = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT structure
    });

    it('should generate token with environment secret', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      const token = generateToken(TEST_PAYLOAD);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate token with environment expiration', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_EXPIRES_IN = '2h';

      const token = generateToken(TEST_PAYLOAD);
      const decoded = verifyToken(token, { secret: TEST_SECRET });

      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(2 * 60 * 60); // 2 hours in seconds
    });

    it('should generate token with environment algorithm', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_ALGORITHM = 'HS512';

      const token = generateToken(TEST_PAYLOAD);
      expect(token).toBeDefined();

      // Should work with HS512 algorithm
      const decoded = verifyToken(token, {
        secret: TEST_SECRET,
        algorithms: ['HS512'],
      });
      expect(decoded).toMatchObject(TEST_PAYLOAD);
    });

    it('should prioritize explicit options over environment variables', () => {
      process.env.VOILA_AUTH_SECRET = 'env-secret';
      process.env.VOILA_AUTH_EXPIRES_IN = '1d';
      process.env.VOILA_AUTH_ALGORITHM = 'HS512';

      const token = generateToken(TEST_PAYLOAD, {
        secret: TEST_SECRET,
        expiresIn: '1h',
        algorithm: 'HS256',
      });

      // Should use explicit options, not environment
      const decoded = verifyToken(token, {
        secret: TEST_SECRET, // Uses explicit secret
        algorithms: ['HS256'], // Uses explicit algorithm
      });

      expect(decoded).toMatchObject(TEST_PAYLOAD);

      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(60 * 60); // 1 hour (explicit), not 1 day (env)
    });

    it('should generate token with default expiration when no env or explicit set', () => {
      const token = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
      const decoded = verifyToken(token, { secret: TEST_SECRET });

      // Check default 7 days expiration
      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });

    it('should throw error for invalid payload', () => {
      expect(() => generateToken(null, { secret: TEST_SECRET })).toThrow(
        'Payload must be an object'
      );
      expect(() => generateToken('string', { secret: TEST_SECRET })).toThrow(
        'Payload must be an object'
      );
      expect(() => generateToken(123, { secret: TEST_SECRET })).toThrow(
        'Payload must be an object'
      );
    });

    it('should throw error for missing secret in both options and environment', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => generateToken(TEST_PAYLOAD, {})).toThrow(
        'JWT secret is required. Provide via options.secret or VOILA_AUTH_SECRET environment variable'
      );
      expect(() => generateToken(TEST_PAYLOAD)).toThrow(
        'JWT secret is required. Provide via options.secret or VOILA_AUTH_SECRET environment variable'
      );

      consoleSpy.mockRestore();
    });

    it('should log error when secret is missing', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => generateToken(TEST_PAYLOAD, {})).toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ JWT Secret Missing: No secret provided via options.secret or VOILA_AUTH_SECRET environment variable'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('verifyToken', () => {
    let validToken;

    beforeEach(() => {
      validToken = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
    });

    it('should verify valid token successfully with explicit secret', () => {
      const decoded = verifyToken(validToken, { secret: TEST_SECRET });
      expect(decoded).toMatchObject(TEST_PAYLOAD);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should verify token with environment secret', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      const decoded = verifyToken(validToken);
      expect(decoded).toMatchObject(TEST_PAYLOAD);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should prioritize explicit secret over environment', () => {
      process.env.VOILA_AUTH_SECRET = 'wrong-secret';

      const decoded = verifyToken(validToken, { secret: TEST_SECRET });
      expect(decoded).toMatchObject(TEST_PAYLOAD);
    });

    it('should throw error for invalid token format', () => {
      expect(() =>
        verifyToken('invalid.token', { secret: TEST_SECRET })
      ).toThrow('Invalid token');
      expect(() => verifyToken('invalid', { secret: TEST_SECRET })).toThrow(
        'Invalid token'
      );
    });

    it('should throw error for wrong secret', () => {
      expect(() => verifyToken(validToken, { secret: 'wrong-secret' })).toThrow(
        'Invalid token'
      );
    });

    it('should throw error for expired token', async () => {
      // Generate token that expires immediately
      const expiredToken = generateToken(TEST_PAYLOAD, {
        secret: TEST_SECRET,
        expiresIn: '1ms',
      });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(() => verifyToken(expiredToken, { secret: TEST_SECRET })).toThrow(
        'Token has expired'
      );
    });

    it('should verify token with custom algorithms from environment', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_ALGORITHM = 'HS512';

      const hs512Token = generateToken(TEST_PAYLOAD);

      const decoded = verifyToken(hs512Token, {
        algorithms: ['HS512'],
      });
      expect(decoded).toMatchObject(TEST_PAYLOAD);
    });

    it('should throw error for invalid token parameter', () => {
      expect(() => verifyToken(null, { secret: TEST_SECRET })).toThrow(
        'Token must be a string'
      );
      expect(() => verifyToken(undefined, { secret: TEST_SECRET })).toThrow(
        'Token must be a string'
      );
      expect(() => verifyToken(123, { secret: TEST_SECRET })).toThrow(
        'Token must be a string'
      );
      expect(() => verifyToken('', { secret: TEST_SECRET })).toThrow(
        'Token must be a string'
      );
    });

    it('should throw error for missing secret in both options and environment', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => verifyToken(validToken, {})).toThrow(
        'JWT secret is required. Provide via options.secret or VOILA_AUTH_SECRET environment variable'
      );
      expect(() => verifyToken(validToken)).toThrow(
        'JWT secret is required. Provide via options.secret or VOILA_AUTH_SECRET environment variable'
      );

      consoleSpy.mockRestore();
    });

    it('should log error when secret is missing', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => verifyToken(validToken, {})).toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ JWT Secret Missing: No secret provided via options.secret or VOILA_AUTH_SECRET environment variable'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Environment Variable Integration', () => {
    it('should handle complete token lifecycle with environment variables', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_EXPIRES_IN = '4h';
      process.env.VOILA_AUTH_ALGORITHM = 'HS256';

      const payload = {
        userId: '456',
        email: 'user@example.com',
        roles: ['admin', 'user'],
      };

      // Generate token using environment config
      const token = generateToken(payload);

      // Verify token using environment config
      const decoded = verifyToken(token);

      // Check payload
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.roles).toEqual(payload.roles);

      // Check timestamps and expiration
      expect(decoded.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
      expect(decoded.exp).toBeGreaterThan(decoded.iat);

      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(4 * 60 * 60); // 4 hours
    });

    it('should handle mixed environment and explicit configuration', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;
      process.env.VOILA_AUTH_EXPIRES_IN = '1d';

      // Generate with env secret but explicit expiration
      const token = generateToken(TEST_PAYLOAD, { expiresIn: '30m' });

      // Verify with env secret
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(TEST_PAYLOAD);

      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(30 * 60); // 30 minutes (explicit), not 1 day (env)
    });

    it('should handle various expiration formats from environment', () => {
      process.env.VOILA_AUTH_SECRET = TEST_SECRET;

      const expirations = ['1m', '1h', '1d', '7d', '30d'];

      expirations.forEach((expiresIn) => {
        process.env.VOILA_AUTH_EXPIRES_IN = expiresIn;

        const token = generateToken(TEST_PAYLOAD);
        const decoded = verifyToken(token);
        expect(decoded.exp).toBeGreaterThan(decoded.iat);
      });
    });
  });
});
