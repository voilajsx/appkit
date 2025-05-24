/**
 * Environment variable tests for the config module
 * @file src/config/tests/environment-integration.test.js
 */

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { loadConfig, getConfig, getEnv, clearConfig } from '../index.js'; // Assuming 'index.js' points to your config module functions

describe('Config Environment Integration', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  // Define a test schema for type coercion
  const testSchema = {
    type: 'object',
    properties: {
      server: {
        type: 'object',
        properties: {
          port: { type: 'number' },
        },
      },
      logging: {
        type: 'object',
        properties: {
          level: { type: 'string' },
        },
      },
      database: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
      },
      api: {
        type: 'object',
        properties: {
          key: { type: 'string' },
        },
      },
      feature: {
        type: 'object',
        properties: {
          flag: { type: 'boolean' }, // Expect boolean
        },
      },
      app: {
        // Added for NODE_ENV mapping
        type: 'object',
        properties: {
          environment: { type: 'string' },
        },
      },
    },
  };

  // Define an env map for relevant variables
  const testEnvMap = {
    PORT: 'server.port',
    NODE_ENV: 'app.environment',
    LOG_LEVEL: 'logging.level',
    DATABASE_URL: 'database.url',
    APP_API_KEY: 'api.key',
    APP_FEATURE_FLAG: 'feature.flag',
  };

  // Set up test environment variables
  beforeEach(() => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'testing';
    process.env.LOG_LEVEL = 'debug';
    process.env.DATABASE_URL = 'mongodb://localhost/test';
    process.env.APP_API_KEY = 'test-api-key';
    process.env.APP_FEATURE_FLAG = 'true'; // This will be coerced to boolean
  });

  // Clean up after each test
  afterEach(() => {
    clearConfig();
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('getEnv', () => {
    it('should return environment variable value (as string)', () => {
      const port = getEnv('PORT');
      expect(port).toBe('4000');
    });

    it('should return default value for missing env variable', () => {
      const value = getEnv('MISSING_VAR', 'default');
      expect(value).toBe('default');
    });
  });

  describe('loadConfig with environment integration and schema coercion', () => {
    it('should override config with environment variables and coerce types', async () => {
      await loadConfig(
        {
          server: { port: 3000 },
          logging: { level: 'info' },
        },
        {
          env: true,
          schema: testSchema, // Provide schema
          map: testEnvMap, // Provide map
        }
      );

      // Expect coerced number type for port
      expect(getConfig('server.port')).toBe(4000);
      expect(typeof getConfig('server.port')).toBe('number');

      // Expect string type for logging.level (as defined in schema)
      expect(getConfig('logging.level')).toBe('debug');
      expect(typeof getConfig('logging.level')).toBe('string');

      // Expect string type for database.url (as defined in schema)
      expect(getConfig('database.url')).toBe('mongodb://localhost/test');
      expect(typeof getConfig('database.url')).toBe('string');
    });

    it('should load APP_ prefixed variables into config and coerce types', async () => {
      await loadConfig(
        {}, // Start with empty config, rely on env and defaults
        {
          env: true,
          schema: testSchema, // Provide schema
          map: testEnvMap, // Provide map
          defaults: {
            // Ensure base structure for test
            api: { key: 'default' },
            feature: { flag: false },
            app: { environment: 'default' },
          },
        }
      );

      // Expect string type for api.key
      expect(getConfig('api.key')).toBe('test-api-key');
      expect(typeof getConfig('api.key')).toBe('string');

      // Expect coerced boolean type for feature.flag
      expect(getConfig('feature.flag')).toBe(true);
      expect(typeof getConfig('feature.flag')).toBe('boolean');

      // Expect string type for app.environment
      expect(getConfig('app.environment')).toBe('testing');
      expect(typeof getConfig('app.environment')).toBe('string');
    });

    it('should not integrate environment when env option is false', async () => {
      await loadConfig(
        {
          server: { port: 3000 },
          logging: { level: 'info' },
        },
        {
          env: false, // Explicitly disable env integration
          schema: testSchema, // Schema won't apply coercion without env: true
          map: testEnvMap,
        }
      );

      // Should not be overridden by PORT env var
      expect(getConfig('server.port')).toBe(3000);
      expect(typeof getConfig('server.port')).toBe('number'); // Still number from initial object

      // LOG_LEVEL from env should not be loaded
      expect(getConfig('logging.level')).toBe('info');
      expect(typeof getConfig('logging.level')).toBe('string');
    });
  });
});
