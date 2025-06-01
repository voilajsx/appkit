/**
 * Environment variables functionality tests
 * @file tests/environment.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig, getConfig, createConfigSchema } from '../index.js';

describe('Environment Variables', () => {
  // Store original env vars to restore later
  const originalEnv = { ...process.env };
  let schemaCounter = 0;

  beforeEach(() => {
    // Clear test environment variables
    delete process.env.SERVER_PORT;
    delete process.env.SERVER_HOST;
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_POOL_SIZE;
    delete process.env.DEBUG;
    delete process.env.FEATURES_ANALYTICS;
    delete process.env.FEATURES_CACHE;
    schemaCounter++;
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('Environment variable mapping', () => {
    it('should map UPPER_SNAKE_CASE to lower.dot.notation', async () => {
      process.env.SERVER_PORT = '8080';
      process.env.SERVER_HOST = 'localhost';
      process.env.DATABASE_URL = 'mongodb://localhost/test';

      await loadConfig({}, { env: true, validate: false });

      expect(getConfig('server.port')).toBe('8080');
      expect(getConfig('server.host')).toBe('localhost');
      expect(getConfig('database.url')).toBe('mongodb://localhost/test');
    });

    it('should handle nested environment variables', async () => {
      process.env.DATABASE_POOL_SIZE = '25';
      process.env.FEATURES_ANALYTICS = 'true';
      process.env.API_RATE_LIMIT = '1000';

      await loadConfig({}, { env: true, validate: false });

      expect(getConfig('database.pool.size')).toBe('25');
      expect(getConfig('features.analytics')).toBe('true');
      expect(getConfig('api.rate.limit')).toBe('1000');
    });

    it('should skip environment variables when env option is false', async () => {
      process.env.SERVER_PORT = '8080';
      process.env.SERVER_HOST = 'localhost';

      await loadConfig(
        {
          server: { port: 3000, host: '127.0.0.1' },
        },
        { env: false }
      );

      // Should use config values, not env vars
      expect(getConfig('server.port')).toBe(3000);
      expect(getConfig('server.host')).toBe('127.0.0.1');
    });
  });

  describe('Type coercion with schemas', () => {
    beforeEach(() => {
      createConfigSchema(`envtest-${schemaCounter}`, {
        type: 'object',
        properties: {
          server: {
            type: 'object',
            properties: {
              port: { type: 'number' },
              host: { type: 'string' },
            },
          },
          database: {
            type: 'object',
            properties: {
              pool: {
                type: 'object',
                properties: {
                  size: { type: 'number' },
                },
              },
            },
          },
          debug: { type: 'boolean' },
          features: {
            type: 'object',
            properties: {
              analytics: { type: 'boolean' },
              cache: { type: 'boolean' },
            },
          },
        },
      });
    });

    it('should coerce string numbers to actual numbers', async () => {
      process.env.SERVER_PORT = '8080';
      process.env.DATABASE_POOL_SIZE = '25';

      await loadConfig({}, { env: true, schema: `envtest-${schemaCounter}` });

      expect(getConfig('server.port')).toBe(8080);
      expect(typeof getConfig('server.port')).toBe('number');

      expect(getConfig('database.pool.size')).toBe(25);
      expect(typeof getConfig('database.pool.size')).toBe('number');
    });

    it('should coerce string booleans to actual booleans', async () => {
      process.env.DEBUG = 'true';
      process.env.FEATURES_ANALYTICS = 'false';
      process.env.FEATURES_CACHE = 'true';

      await loadConfig({}, { env: true, schema: `envtest-${schemaCounter}` });

      expect(getConfig('debug')).toBe(true);
      expect(typeof getConfig('debug')).toBe('boolean');

      expect(getConfig('features.analytics')).toBe(false);
      expect(typeof getConfig('features.analytics')).toBe('boolean');

      expect(getConfig('features.cache')).toBe(true);
      expect(typeof getConfig('features.cache')).toBe('boolean');
    });

    it('should keep strings as strings', async () => {
      process.env.SERVER_HOST = 'localhost';

      await loadConfig({}, { env: true, schema: `envtest-${schemaCounter}` });

      expect(getConfig('server.host')).toBe('localhost');
      expect(typeof getConfig('server.host')).toBe('string');
    });

    it('should not coerce invalid numbers', async () => {
      process.env.SERVER_PORT = 'not-a-number';

      await loadConfig(
        {},
        { env: true, schema: `envtest-${schemaCounter}`, validate: false }
      );

      // Should remain as string since it's not a valid number
      expect(getConfig('server.port')).toBe('not-a-number');
      expect(typeof getConfig('server.port')).toBe('string');
    });

    it('should not coerce invalid booleans', async () => {
      process.env.DEBUG = 'maybe';

      await loadConfig(
        {},
        { env: true, schema: `envtest-${schemaCounter}`, validate: false }
      );

      // Should remain as string since it's not 'true' or 'false'
      expect(getConfig('debug')).toBe('maybe');
      expect(typeof getConfig('debug')).toBe('string');
    });
  });

  describe('Environment variables with config merging', () => {
    beforeEach(() => {
      createConfigSchema(`merge-${schemaCounter}`, {
        type: 'object',
        properties: {
          server: {
            type: 'object',
            properties: {
              port: { type: 'number' },
              host: { type: 'string' },
              timeout: { type: 'number' },
            },
          },
          features: {
            type: 'object',
            properties: {
              analytics: { type: 'boolean' },
            },
          },
        },
      });
    });

    it('should merge environment variables with base config', async () => {
      process.env.SERVER_PORT = '9000';
      process.env.FEATURES_ANALYTICS = 'true';

      await loadConfig(
        {
          server: { host: 'localhost', timeout: 30000 },
          features: { analytics: false },
        },
        { env: true, schema: `merge-${schemaCounter}` }
      );

      // From env (overrides)
      expect(getConfig('server.port')).toBe(9000);
      expect(getConfig('features.analytics')).toBe(true);

      // From config (not overridden)
      expect(getConfig('server.host')).toBe('localhost');
      expect(getConfig('server.timeout')).toBe(30000);
    });

    it('should merge environment variables with defaults', async () => {
      process.env.SERVER_PORT = '7000';

      await loadConfig(
        {},
        {
          env: true,
          schema: `merge-${schemaCounter}`,
          defaults: {
            server: { host: 'default-host', timeout: 5000 },
            features: { analytics: false },
          },
        }
      );

      // From env
      expect(getConfig('server.port')).toBe(7000);

      // From defaults
      expect(getConfig('server.host')).toBe('default-host');
      expect(getConfig('server.timeout')).toBe(5000);
      expect(getConfig('features.analytics')).toBe(false);
    });
  });

  describe('Environment variable filtering', () => {
    it('should skip short environment variable names', async () => {
      process.env.A = 'short';
      process.env.AB = 'short';
      process.env.ABC = 'valid';

      await loadConfig({}, { env: true, validate: false });

      expect(getConfig('a')).toBeUndefined();
      expect(getConfig('ab')).toBeUndefined();
      expect(getConfig('abc')).toBe('valid');
    });

    it('should skip environment variables with special characters', async () => {
      process.env['VAR.WITH.DOTS'] = 'invalid';
      process.env['VAR/WITH/SLASH'] = 'invalid';
      process.env.VALID_VAR = 'valid';

      await loadConfig({}, { env: true, validate: false });

      expect(getConfig('valid.var')).toBe('valid');
      // Variables with dots/slashes should be skipped
    });
  });

  describe('Real-world environment scenarios', () => {
    it('should handle typical production environment variables', async () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.DATABASE_URL = 'postgresql://prod-server/myapp';
      process.env.REDIS_URL = 'redis://prod-redis:6379';
      process.env.LOG_LEVEL = 'warn';
      process.env.ENABLE_METRICS = 'true';

      createConfigSchema(`prod-${schemaCounter}`, {
        type: 'object',
        properties: {
          port: { type: 'number' },
          database: {
            type: 'object',
            properties: {
              url: { type: 'string' },
            },
          },
          redis: {
            type: 'object',
            properties: {
              url: { type: 'string' },
            },
          },
          log: {
            type: 'object',
            properties: {
              level: { type: 'string' },
            },
          },
          enable: {
            type: 'object',
            properties: {
              metrics: { type: 'boolean' },
            },
          },
        },
      });

      await loadConfig({}, { env: true, schema: `prod-${schemaCounter}` });

      expect(getConfig('port')).toBe(8080);
      expect(getConfig('database.url')).toBe('postgresql://prod-server/myapp');
      expect(getConfig('redis.url')).toBe('redis://prod-redis:6379');
      expect(getConfig('log.level')).toBe('warn');
      expect(getConfig('enable.metrics')).toBe(true);
    });
  });
});
