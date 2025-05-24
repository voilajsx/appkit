/**
 * Basic operations tests for the config module
 * @file src/config/tests/basic-operations.test.js
 */

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
// Explicitly import all functions used in this test file
import {
  loadConfig,
  getConfig,
  getEnv,
  clearConfig,
  setConfig,
  hasConfig,
} from '../index.js';

// Define a test schema for type coercion (used in environment integration tests)
const testSchema = {
  type: 'object',
  properties: {
    server: {
      type: 'object',
      properties: {
        port: { type: 'number' }, // Expect number
        host: { type: 'string' },
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

// --- Config Basic Operations (original tests from this file) ---
describe('Config Basic Operations', () => {
  afterEach(() => {
    clearConfig();
  });

  it('should load config from an object', async () => {
    const initialConfig = { app: { name: 'TestApp' } };
    await loadConfig(initialConfig);
    expect(getConfig('app.name')).toBe('TestApp');
  });

  it('should merge with defaults', async () => {
    await loadConfig(
      { server: { host: '0.0.0.0' } },
      { defaults: { server: { port: 8080, host: 'localhost' } } }
    );
    expect(getConfig('server.port')).toBe(8080);
    expect(getConfig('server.host')).toBe('0.0.0.0');
  });

  it('should return undefined for non-existent key without default', () => {
    expect(getConfig('non.existent.key')).toBeUndefined();
  });

  it('should return default value for non-existent key', () => {
    expect(getConfig('non.existent.key', 'default_value')).toBe(
      'default_value'
    );
  });

  it('should return the entire config object when no key is provided', async () => {
    const fullConfig = { app: { name: 'FullConfigApp' } };
    await loadConfig(fullConfig);
    expect(getConfig()).toEqual(fullConfig);
  });
});

// --- Config Environment Integration (moved and updated from original file, now correct) ---
describe('Config Environment Integration', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  // Set up test environment variables
  beforeEach(() => {
    // Clear any previous environment variables set by other tests
    process.env = {};
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
    it('should override config with environment variables and coerce types', async () => {
      await loadConfig(
        {
          server: { port: 3000 }, // This will be overridden
          logging: { level: 'info' }, // This will be overridden
        },
        {
          env: true,
          schema: testSchema, // Pass the schema here
          map: testEnvMap, // Pass the map here
        }
      );

      // Expectations updated to reflect type coercion (number, string, string)
      expect(getConfig('server.port')).toBe(4000); // Now a number
      expect(typeof getConfig('server.port')).toBe('number');
      expect(getConfig('logging.level')).toBe('debug');
      expect(typeof getConfig('logging.level')).toBe('string');
      expect(getConfig('database.url')).toBe('mongodb://localhost/test');
      expect(typeof getConfig('database.url')).toBe('string');
    });

    it('should load APP_ prefixed variables into config and coerce types', async () => {
      await loadConfig(
        {}, // Start with an empty config, rely on env variables and map
        {
          env: true,
          schema: testSchema, // Pass the schema here
          map: testEnvMap, // Pass the map here
          defaults: {
            // Provide defaults so the paths exist for mapping
            api: {},
            feature: {},
          },
        }
      );

      // Expectations updated to reflect type coercion (string, boolean)
      expect(getConfig('api.key')).toBe('test-api-key');
      expect(typeof getConfig('api.key')).toBe('string');
      expect(getConfig('feature.flag')).toBe(true); // Now a boolean
      expect(typeof getConfig('feature.flag')).toBe('boolean');
    });

    it('should not integrate environment when env option is false', async () => {
      await loadConfig(
        {
          server: { port: 3000 },
          logging: { level: 'info' },
        },
        {
          env: false, // Explicitly disable env integration
          schema: testSchema, // Schema is present but env:false overrides coercion
          map: testEnvMap,
        }
      );

      expect(getConfig('server.port')).toBe(3000); // Should remain the initial number
      expect(getConfig('logging.level')).toBe('info'); // Should remain the initial string
      expect(getConfig('database.url')).toBeUndefined(); // DATABASE_URL was not in initial config, not loaded from env
    });
  });
});
