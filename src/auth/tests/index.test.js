/**
 * Tests for main exports of @voilajsx/appkit auth module.
 * Ensures all expected functions are exported and no unexpected exports exist.
 *
 * @file src/auth/tests/index.test.js
 */

import { describe, it, expect } from 'vitest';
import * as authModule from '../index.js';

describe('Auth Module Exports', () => {
  it('should export all auth functions', () => {
    expect(authModule.generateToken).toBeDefined();
    expect(authModule.verifyToken).toBeDefined();
    expect(authModule.hashPassword).toBeDefined();
    expect(authModule.comparePassword).toBeDefined();
    expect(authModule.createAuthMiddleware).toBeDefined();
    expect(authModule.createAuthorizationMiddleware).toBeDefined();
  });

  it('should export functions with correct types', () => {
    expect(typeof authModule.generateToken).toBe('function');
    expect(typeof authModule.verifyToken).toBe('function');
    expect(typeof authModule.hashPassword).toBe('function');
    expect(typeof authModule.comparePassword).toBe('function');
    expect(typeof authModule.createAuthMiddleware).toBe('function');
    expect(typeof authModule.createAuthorizationMiddleware).toBe('function');
  });

  it('should not export any unexpected properties', () => {
    const expectedExports = [
      'generateToken',
      'verifyToken',
      'hashPassword',
      'comparePassword',
      'createAuthMiddleware',
      'createAuthorizationMiddleware',
    ];

    const actualExports = Object.keys(authModule);
    expect(actualExports.sort()).toEqual(expectedExports.sort());
  });
});
