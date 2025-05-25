/**
 * JWT functionality tests for @voilajsx/appkit auth module
 * Tests token generation and verification features
 */

import { describe, it, expect, vi } from 'vitest';
import { generateToken, verifyToken } from '../jwt.js';
import { TEST_SECRET, TEST_PAYLOAD } from './setup.js';

describe('JWT Module', () => {
  describe('generateToken', () => {
    it('should generate a token successfully', () => {
      const token = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT structure
    });

    it('should generate token with default expiration', () => {
      const token = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
      const decoded = verifyToken(token, { secret: TEST_SECRET });

      // Check default 7 days expiration
      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });

    it('should generate token with custom expiration', () => {
      const token = generateToken(TEST_PAYLOAD, {
        secret: TEST_SECRET,
        expiresIn: '1h',
      });
      const decoded = verifyToken(token, { secret: TEST_SECRET });

      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(60 * 60); // 1 hour in seconds
    });

    it('should generate token with custom algorithm', () => {
      const token = generateToken(TEST_PAYLOAD, {
        secret: TEST_SECRET,
        algorithm: 'HS512',
      });
      expect(token).toBeDefined();

      // Should fail with wrong algorithm
      expect(() => {
        verifyToken(token, { secret: TEST_SECRET, algorithms: ['HS256'] });
      }).toThrow();

      // Should work with correct algorithm
      const decoded = verifyToken(token, {
        secret: TEST_SECRET,
        algorithms: ['HS512'],
      });
      expect(decoded).toMatchObject(TEST_PAYLOAD);
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

    it('should throw error for missing secret', () => {
      expect(() => generateToken(TEST_PAYLOAD, {})).toThrow(
        'JWT secret is required'
      );
      expect(() => generateToken(TEST_PAYLOAD, { secret: null })).toThrow(
        'JWT secret is required'
      );
      expect(() => generateToken(TEST_PAYLOAD, { secret: '' })).toThrow(
        'JWT secret is required'
      );
    });
  });

  describe('verifyToken', () => {
    let validToken;

    beforeEach(() => {
      validToken = generateToken(TEST_PAYLOAD, { secret: TEST_SECRET });
    });

    it('should verify valid token successfully', () => {
      const decoded = verifyToken(validToken, { secret: TEST_SECRET });
      expect(decoded).toMatchObject(TEST_PAYLOAD);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
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

    it('should verify token with custom algorithms', () => {
      const hs512Token = generateToken(TEST_PAYLOAD, {
        secret: TEST_SECRET,
        algorithm: 'HS512',
      });

      const decoded = verifyToken(hs512Token, {
        secret: TEST_SECRET,
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

    it('should throw error for missing secret', () => {
      expect(() => verifyToken(validToken, {})).toThrow(
        'JWT secret is required'
      );
      expect(() => verifyToken(validToken, { secret: null })).toThrow(
        'JWT secret is required'
      );
    });
  });

  describe('Integration', () => {
    it('should handle complete token lifecycle', () => {
      const payload = {
        userId: '456',
        email: 'user@example.com',
        roles: ['admin', 'user'],
      };

      // Generate token
      const token = generateToken(payload, {
        secret: TEST_SECRET,
        expiresIn: '2h',
      });

      // Verify token
      const decoded = verifyToken(token, { secret: TEST_SECRET });

      // Check payload
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.roles).toEqual(payload.roles);

      // Check timestamps
      expect(decoded.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should handle token with complex payload', () => {
      const complexPayload = {
        user: {
          id: '789',
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        permissions: ['read', 'write', 'delete'],
        metadata: {
          loginTime: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        },
      };

      const token = generateToken(complexPayload, { secret: TEST_SECRET });
      const decoded = verifyToken(token, { secret: TEST_SECRET });

      expect(decoded.user).toEqual(complexPayload.user);
      expect(decoded.permissions).toEqual(complexPayload.permissions);
      expect(decoded.metadata).toEqual(complexPayload.metadata);
    });

    it('should handle various expiration formats', () => {
      const expirations = ['1m', '1h', '1d', '7d', '30d'];

      expirations.forEach((expiresIn) => {
        const token = generateToken(TEST_PAYLOAD, {
          secret: TEST_SECRET,
          expiresIn,
        });
        const decoded = verifyToken(token, { secret: TEST_SECRET });
        expect(decoded.exp).toBeGreaterThan(decoded.iat);
      });
    });
  });
});
