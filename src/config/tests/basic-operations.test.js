/**
 * Environment variable tests for the config module
 */

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { loadConfig, getConfig, getEnv, clearConfig } from '../index.js';

describe('Config Environment Integration', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  // Set up test environment variables
  beforeEach(() => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'testing';
    process.env.LOG_LEVEL = 'debug';
    process.env.DATABASE_URL = 'mongodb://localhost/test';
    process.env.APP_API_KEY = 'test-api-key';
    process.env.APP_FEATURE_FLAG = 'true';
  });

  // Clean up after each test
  afterEach(() => {
    clearConfig();
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      const port = getEnv('PORT');
      expect(port).toBe('4000');
    });

    it('should return default value for missing env variable', () => {
      const value = getEnv('MISSING_VAR', 'default');
      expect(value).toBe('default');
    });
  });

  describe('loadConfig with environment integration', () => {
    it('should override config with environment variables', async () => {
      await loadConfig(
        {
          server: { port: 3000 },
          logging: { level: 'info' },
        },
        { env: true }
      );

      expect(getConfig('server.port')).toBe('4000'); // From PORT
      expect(getConfig('logging.level')).toBe('debug'); // From LOG_LEVEL
      expect(getConfig('database.url')).toBe('mongodb://localhost/test'); // From DATABASE_URL
    });

    it('should load APP_ prefixed variables into config', async () => {
      await loadConfig({}, { env: true });

      expect(getConfig('api.key')).toBe('test-api-key'); // From APP_API_KEY
      expect(getConfig('feature.flag')).toBe('true'); // From APP_FEATURE_FLAG
    });

    it('should not integrate environment when env option is false', async () => {
      await loadConfig(
        {
          server: { port: 3000 },
        },
        { env: false }
      );

      expect(getConfig('server.port')).toBe(3000); // Not overridden by PORT
      expect(getConfig('logging.level')).toBeUndefined(); // LOG_LEVEL not loaded
    });
  });
});
