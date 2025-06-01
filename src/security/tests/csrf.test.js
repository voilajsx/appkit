/**
 * CSRF Protection Tests - @voilajsx/appkit Security Module
 *
 * These tests verify that the CSRF protection functions
 * correctly generate and validate tokens.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateCsrfToken, verifyCsrfToken } from '../csrf.js';

describe('CSRF Protection', () => {
  let sessionMock;

  beforeEach(() => {
    // Create a mock session object for testing
    sessionMock = {};
  });

  describe('generateCsrfToken()', () => {
    it('should generate a token and store it in the session', () => {
      const token = generateCsrfToken(sessionMock);

      expect(typeof token).toBe('string');
      expect(token.length).toBe(32); // Default token length
      expect(sessionMock.csrfToken).toBe(token);
    });

    it('should generate a new token each time it is called', () => {
      const token1 = generateCsrfToken(sessionMock);
      const token2 = generateCsrfToken(sessionMock);

      expect(token1).not.toBe(token2);
    });

    it('should store expiry time in session when given expiry minutes', () => {
      const before = Date.now();
      generateCsrfToken(sessionMock, 60); // 60 minutes
      const after = Date.now();

      expect(typeof sessionMock.csrfTokenExpiry).toBe('number');

      // Expiry should be roughly 60 minutes in the future
      const expectedMin = before + 59 * 60 * 1000;
      const expectedMax = after + 61 * 60 * 1000;

      expect(sessionMock.csrfTokenExpiry).toBeGreaterThan(expectedMin);
      expect(sessionMock.csrfTokenExpiry).toBeLessThan(expectedMax);
    });

    it('should throw an error if session is missing', () => {
      expect(() => generateCsrfToken(null)).toThrow(
        'Session object is required'
      );
      expect(() => generateCsrfToken(undefined)).toThrow(
        'Session object is required'
      );
      expect(() => generateCsrfToken('string')).toThrow(
        'Session object is required'
      );
    });
  });

  describe('verifyCsrfToken()', () => {
    it('should validate a token that matches the session token', () => {
      const token = generateCsrfToken(sessionMock);
      const isValid = verifyCsrfToken(token, sessionMock);

      expect(isValid).toBe(true);
    });

    it('should reject a token that does not match the session token', () => {
      generateCsrfToken(sessionMock);
      const isValid = verifyCsrfToken('invalid-token', sessionMock);

      expect(isValid).toBe(false);
    });

    it('should reject an expired token', () => {
      const token = generateCsrfToken(sessionMock);

      // Set expiry to a time in the past
      sessionMock.csrfTokenExpiry = Date.now() - 1000;

      const isValid = verifyCsrfToken(token, sessionMock);
      expect(isValid).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      expect(verifyCsrfToken(null, sessionMock)).toBe(false);
      expect(verifyCsrfToken(undefined, sessionMock)).toBe(false);
      expect(verifyCsrfToken('', sessionMock)).toBe(false);
      expect(verifyCsrfToken(123, sessionMock)).toBe(false);
      expect(verifyCsrfToken('token', null)).toBe(false);
      expect(verifyCsrfToken('token', 'string')).toBe(false);
    });
  });
});
