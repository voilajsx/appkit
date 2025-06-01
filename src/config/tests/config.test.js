/**
 * Core configuration functionality tests
 * @file src/config/tests/config.test.js
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, getConfig, hasConfig } from '../index.js';
import fs from 'fs/promises';
import path from 'path';

describe('Config Core Functionality', () => {
  beforeEach(() => {
    // Clear any previous config state
    delete process.env.TEST_VAR;
  });

  describe('loadConfig()', () => {
    it('should load configuration from object', async () => {
      const config = {
        server: { port: 3000, host: 'localhost' },
        database: { url: 'mongodb://localhost/test' },
      };

      await loadConfig(config, { env: false });

      expect(getConfig('server.port')).toBe(3000);
      expect(getConfig('server.host')).toBe('localhost');
      expect(getConfig('database.url')).toBe('mongodb://localhost/test');
    });

    it('should merge defaults with config', async () => {
      const config = { server: { port: 8080 } };
      const defaults = {
        server: { host: 'localhost', timeout: 5000 },
        database: { url: 'mongodb://localhost/default' },
      };

      await loadConfig(config, { defaults, env: false });

      expect(getConfig('server.port')).toBe(8080); // from config
      expect(getConfig('server.host')).toBe('localhost'); // from defaults
      expect(getConfig('server.timeout')).toBe(5000); // from defaults
      expect(getConfig('database.url')).toBe('mongodb://localhost/default'); // from defaults
    });

    it('should load configuration from JSON file', async () => {
      // Create temporary JSON file
      const tempFile = path.join(process.cwd(), 'temp-config.json');
      const config = { app: { name: 'Test App', port: 4000 } };

      await fs.writeFile(tempFile, JSON.stringify(config));

      try {
        await loadConfig(tempFile, { env: false });

        expect(getConfig('app.name')).toBe('Test App');
        expect(getConfig('app.port')).toBe(4000);
      } finally {
        // Cleanup
        await fs.unlink(tempFile).catch(() => {});
      }
    });

    it('should load configuration from JavaScript file', async () => {
      // Create temporary JS file
      const tempFile = path.join(process.cwd(), 'temp-config.js');
      const configContent = `export default { 
        app: { name: 'JS App', version: '1.0.0' },
        features: { enabled: true }
      };`;

      await fs.writeFile(tempFile, configContent);

      try {
        await loadConfig(tempFile, { env: false });

        expect(getConfig('app.name')).toBe('JS App');
        expect(getConfig('app.version')).toBe('1.0.0');
        expect(getConfig('features.enabled')).toBe(true);
      } finally {
        // Cleanup
        await fs.unlink(tempFile).catch(() => {});
      }
    });

    it('should throw error for missing file', async () => {
      await expect(loadConfig('./non-existent-file.json')).rejects.toThrow(
        'Configuration file not found'
      );
    });

    it('should throw error for invalid JSON', async () => {
      const tempFile = path.join(process.cwd(), 'invalid.json');
      await fs.writeFile(tempFile, '{ invalid json }');

      try {
        await expect(loadConfig(tempFile)).rejects.toThrow('Invalid JSON');
      } finally {
        await fs.unlink(tempFile).catch(() => {});
      }
    });
  });

  describe('getConfig()', () => {
    beforeEach(async () => {
      await loadConfig(
        {
          server: { port: 3000, host: 'localhost' },
          database: {
            url: 'mongodb://localhost/test',
            pool: { min: 2, max: 10 },
          },
          features: { analytics: true, cache: false },
        },
        { env: false }
      );
    });

    it('should get single values', () => {
      expect(getConfig('server.port')).toBe(3000);
      expect(getConfig('server.host')).toBe('localhost');
      expect(getConfig('features.analytics')).toBe(true);
    });

    it('should get nested objects', () => {
      const server = getConfig('server');
      expect(server).toEqual({ port: 3000, host: 'localhost' });

      const pool = getConfig('database.pool');
      expect(pool).toEqual({ min: 2, max: 10 });
    });

    it('should return entire config when no path provided', () => {
      const allConfig = getConfig();
      expect(allConfig).toEqual({
        server: { port: 3000, host: 'localhost' },
        database: {
          url: 'mongodb://localhost/test',
          pool: { min: 2, max: 10 },
        },
        features: { analytics: true, cache: false },
      });
    });

    it('should return fallback for missing paths', () => {
      expect(getConfig('missing.path', 'default')).toBe('default');
      expect(getConfig('server.missing', 'fallback')).toBe('fallback');
      expect(getConfig('completely.missing.path', null)).toBe(null);
    });

    it('should return undefined for missing paths without fallback', () => {
      expect(getConfig('missing.path')).toBeUndefined();
    });

    it('should return deep cloned values (immutable)', () => {
      const server1 = getConfig('server');
      const server2 = getConfig('server');

      // Should be equal but not same reference
      expect(server1).toEqual(server2);
      expect(server1).not.toBe(server2);

      // Modifying one shouldn't affect the other
      server1.port = 9999;
      expect(getConfig('server.port')).toBe(3000);
    });
  });

  describe('hasConfig()', () => {
    beforeEach(async () => {
      await loadConfig(
        {
          server: { port: 3000 },
          database: { url: 'mongodb://localhost/test' },
          features: { analytics: true, cache: false },
        },
        { env: false }
      );
    });

    it('should return true for existing paths', () => {
      expect(hasConfig('server')).toBe(true);
      expect(hasConfig('server.port')).toBe(true);
      expect(hasConfig('database.url')).toBe(true);
      expect(hasConfig('features.analytics')).toBe(true);
      expect(hasConfig('features.cache')).toBe(true);
    });

    it('should return false for missing paths', () => {
      expect(hasConfig('missing')).toBe(false);
      expect(hasConfig('server.missing')).toBe(false);
      expect(hasConfig('completely.missing.path')).toBe(false);
    });

    it('should handle false/null values correctly', () => {
      expect(hasConfig('features.cache')).toBe(true); // false is still a value
    });
  });

  describe('Configuration isolation', () => {
    it('should isolate multiple loadConfig calls', async () => {
      // Load first config
      await loadConfig({ app: { name: 'App1' } }, { env: false });
      expect(getConfig('app.name')).toBe('App1');

      // Load second config (should replace first)
      await loadConfig({ app: { name: 'App2' } }, { env: false });
      expect(getConfig('app.name')).toBe('App2');
      expect(hasConfig('app.name')).toBe(true);
    });
  });
});
