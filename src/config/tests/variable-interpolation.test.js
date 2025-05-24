/**
 * Variable interpolation tests for the config module
 * @file src/config/tests/variable-interpolation.test.js
 */

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { loadConfig, getConfig, clearConfig } from '../index.js';

describe('Config Variable Interpolation', () => {
  // Save original environment
  const originalEnv = { ...process.env };

  // Clear config and set specific env after each test
  beforeEach(() => {
    clearConfig();
    process.env.NODE_ENV = 'testing'; // Ensure consistent env for interpolation tests
  });

  // Restore original environment
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('interpolate option', () => {
    it('should interpolate variables in configuration', async () => {
      await loadConfig(
        {
          server: {
            protocol: 'http',
            host: 'example.com',
            port: 8080,
          },
          endpoint: '${server.protocol}://${server.host}:${server.port}/api',
          database: {
            name: 'myapp',
            url: 'mongodb://localhost/${database.name}',
          },
          environment: '${env.NODE_ENV}', // Should resolve to 'testing'
        },
        {
          interpolate: true,
        }
      );

      // Check if interpolation matches expected values
      const endpoint = getConfig('endpoint');
      expect(endpoint).toBe('http://example.com:8080/api'); // Expect full resolution

      const dbUrl = getConfig('database.url');
      expect(dbUrl).toBe('mongodb://localhost/myapp'); // Expect full resolution

      // Environment variables should be strictly resolved
      const env = getConfig('environment');
      expect(env).toBe('testing'); // Stricter check
    });

    it('should not interpolate when option is disabled', async () => {
      await loadConfig(
        {
          server: {
            protocol: 'http',
            host: 'example.com',
          },
          endpoint: '${server.protocol}://${server.host}/api',
        },
        {
          interpolate: false,
        }
      );

      // Should remain as template string
      expect(getConfig('endpoint')).toBe(
        '${server.protocol}://${server.host}/api'
      );
    });

    it('should ignore interpolation for missing variables', async () => {
      await loadConfig(
        {
          url: 'https://example.com/${missing.variable}',
        },
        {
          interpolate: true,
        }
      );

      // Missing variables should remain as is
      const url = getConfig('url');
      expect(url).toBe('https://example.com/${missing.variable}'); // Expect exact string with unresolved part
    });

    it('should interpolate arrays and nested objects', async () => {
      await loadConfig(
        {
          base: 'https://example.com',
          paths: ['${base}/api', '${base}/admin'],
          nested: {
            path: '${base}/nested',
            deep: {
              path: '${nested.path}/deep',
            },
          },
        },
        {
          interpolate: true,
        }
      );

      // Check array values
      const paths = getConfig('paths');
      expect(Array.isArray(paths)).toBe(true);
      expect(paths).toEqual([
        'https://example.com/api',
        'https://example.com/admin',
      ]); // Expect full resolution

      // Check nested path (expect full resolution)
      const deepPath = getConfig('nested.deep.path');
      expect(deepPath).toBe('https://example.com/nested/deep'); // Expect full resolution
    });

    it('should handle nested interpolation', async () => {
      await loadConfig(
        {
          firstName: 'John',
          lastName: 'Doe',
          fullName: '${firstName} ${lastName}',
          greeting: 'Hello, ${fullName}!',
        },
        {
          interpolate: true,
        }
      );

      // Check if greeting contains the full resolved name
      const greeting = getConfig('greeting');
      expect(greeting).toBe('Hello, John Doe!'); // Expect full resolution
    });
  });
});
