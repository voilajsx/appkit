/**
 * Module exports tests for @voilajsx/appkit session module
 * Tests that all exports are available and working correctly
 *
 * @file src/session/tests/index.test.js
 */

import { describe, it, expect } from 'vitest';
import * as SessionModule from '../index.js';

describe('Session Module Exports', () => {
  it('should export all middleware functions', () => {
    expect(SessionModule.createSessionMiddleware).toBeDefined();
    expect(SessionModule.createSessionAuthMiddleware).toBeDefined();
    expect(SessionModule.createSessionAuthorizationMiddleware).toBeDefined();

    expect(typeof SessionModule.createSessionMiddleware).toBe('function');
    expect(typeof SessionModule.createSessionAuthMiddleware).toBe('function');
    expect(typeof SessionModule.createSessionAuthorizationMiddleware).toBe(
      'function'
    );
  });

  it('should export all store classes', () => {
    expect(SessionModule.MemoryStore).toBeDefined();
    expect(SessionModule.FileStore).toBeDefined();
    expect(SessionModule.RedisStore).toBeDefined();

    expect(typeof SessionModule.MemoryStore).toBe('function');
    expect(typeof SessionModule.FileStore).toBe('function');
    expect(typeof SessionModule.RedisStore).toBe('function');
  });

  it('should export all utility functions', () => {
    expect(SessionModule.SessionManager).toBeDefined();
    expect(SessionModule.createSessionSecret).toBeDefined();
    expect(SessionModule.validateSessionConfig).toBeDefined();
    expect(SessionModule.sanitizeSessionData).toBeDefined();

    expect(typeof SessionModule.SessionManager).toBe('function');
    expect(typeof SessionModule.createSessionSecret).toBe('function');
    expect(typeof SessionModule.validateSessionConfig).toBe('function');
    expect(typeof SessionModule.sanitizeSessionData).toBe('function');
  });

  it('should create functional instances of store classes', () => {
    const memoryStore = new SessionModule.MemoryStore();
    const fileStore = new SessionModule.FileStore('./test-sessions');

    expect(memoryStore).toBeInstanceOf(SessionModule.MemoryStore);
    expect(fileStore).toBeInstanceOf(SessionModule.FileStore);

    // Test that stores have required methods
    expect(typeof memoryStore.get).toBe('function');
    expect(typeof memoryStore.set).toBe('function');
    expect(typeof memoryStore.destroy).toBe('function');
    expect(typeof memoryStore.touch).toBe('function');

    expect(typeof fileStore.get).toBe('function');
    expect(typeof fileStore.set).toBe('function');
    expect(typeof fileStore.destroy).toBe('function');
    expect(typeof fileStore.touch).toBe('function');
  });

  it('should create functional middleware instances', () => {
    const sessionMiddleware = SessionModule.createSessionMiddleware({
      secret: 'test-secret',
    });

    const authMiddleware = SessionModule.createSessionAuthMiddleware();
    const authzMiddleware = SessionModule.createSessionAuthorizationMiddleware([
      'admin',
    ]);

    expect(typeof sessionMiddleware).toBe('function');
    expect(typeof authMiddleware).toBe('function');
    expect(typeof authzMiddleware).toBe('function');
  });

  it('should create functional utility instances', () => {
    const sessionManager = new SessionModule.SessionManager({
      secret: 'test-secret',
    });

    const secret = SessionModule.createSessionSecret();
    const validation = SessionModule.validateSessionConfig({
      secret: 'test-secret',
    });
    const sanitized = SessionModule.sanitizeSessionData({ test: 'data' });

    expect(sessionManager).toBeInstanceOf(SessionModule.SessionManager);
    expect(typeof secret).toBe('string');
    expect(validation).toHaveProperty('valid');
    expect(sanitized).toEqual({ test: 'data' });
  });

  it('should have consistent naming convention', () => {
    // All middleware functions should start with 'create' and end with 'Middleware'
    expect(SessionModule.createSessionMiddleware.name).toBe(
      'createSessionMiddleware'
    );
    expect(SessionModule.createSessionAuthMiddleware.name).toBe(
      'createSessionAuthMiddleware'
    );
    expect(SessionModule.createSessionAuthorizationMiddleware.name).toBe(
      'createSessionAuthorizationMiddleware'
    );

    // Store classes should end with 'Store'
    expect(SessionModule.MemoryStore.name).toBe('MemoryStore');
    expect(SessionModule.FileStore.name).toBe('FileStore');
    expect(SessionModule.RedisStore.name).toBe('RedisStore');

    // Utility functions should have descriptive names
    expect(SessionModule.createSessionSecret.name).toBe('createSessionSecret');
    expect(SessionModule.validateSessionConfig.name).toBe(
      'validateSessionConfig'
    );
    expect(SessionModule.sanitizeSessionData.name).toBe('sanitizeSessionData');
  });

  it('should not export any deprecated function names', () => {
    // Ensure old names are not exported
    expect(SessionModule.createSessionAuth).toBeUndefined();
    expect(SessionModule.createSessionRoleAuth).toBeUndefined();
  });

  it('should export the correct number of functions', () => {
    const exports = Object.keys(SessionModule);

    // Should have exactly these exports:
    // - 3 middleware functions
    // - 3 store classes
    // - 4 utility functions
    expect(exports).toHaveLength(10);

    const expectedExports = [
      'createSessionMiddleware',
      'createSessionAuthMiddleware',
      'createSessionAuthorizationMiddleware',
      'MemoryStore',
      'FileStore',
      'RedisStore',
      'SessionManager',
      'createSessionSecret',
      'validateSessionConfig',
      'sanitizeSessionData',
    ];

    expectedExports.forEach((name) => {
      expect(exports).toContain(name);
    });
  });
});
