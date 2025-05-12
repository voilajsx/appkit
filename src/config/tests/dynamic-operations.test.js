/**
 * Dynamic configuration tests for the config module
 */

import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { setConfig, getConfig, hasConfig, clearConfig } from '../index.js';

describe('Config Dynamic Operations', () => {
  // Clear config after each test
  afterEach(() => {
    clearConfig();
  });

  describe('setConfig', () => {
    it('should set configuration object', () => {
      const config = {
        server: { port: 3000 },
        database: { url: 'mongodb://localhost/test' },
      };

      setConfig(config);

      expect(getConfig()).toEqual(config);
    });

    it('should replace existing configuration', () => {
      setConfig({ first: 'value' });
      setConfig({ second: 'value' });

      expect(getConfig()).toEqual({ second: 'value' });
      expect(getConfig('first')).toBeUndefined();
    });

    it('should throw error for non-object configuration', () => {
      expect(() => setConfig('not an object')).toThrow(
        'Configuration must be an object'
      );

      expect(() => setConfig(null)).toThrow('Configuration must be an object');
    });
  });

  describe('hasConfig', () => {
    beforeEach(() => {
      setConfig({
        server: {
          port: 3000,
          host: 'localhost',
        },
        emptyObject: {},
        nullValue: null,
        falseValue: false,
        zeroValue: 0,
      });
    });

    it('should return true for existing path', () => {
      expect(hasConfig('server.port')).toBe(true);
      expect(hasConfig('server')).toBe(true);
    });

    it('should return false for non-existing path', () => {
      expect(hasConfig('missing.path')).toBe(false);
      expect(hasConfig('server.missing')).toBe(false);
    });

    it('should correctly handle special values', () => {
      expect(hasConfig('emptyObject')).toBe(true);
      expect(hasConfig('nullValue')).toBe(true);
      expect(hasConfig('falseValue')).toBe(true);
      expect(hasConfig('zeroValue')).toBe(true);
    });
  });

  describe('clearConfig', () => {
    it('should remove all configuration', () => {
      setConfig({
        server: { port: 3000 },
        database: { url: 'mongodb://localhost/test' },
      });

      clearConfig();

      expect(getConfig()).toEqual({});
      expect(hasConfig('server')).toBe(false);
    });
  });

  describe('dynamic updates', () => {
    it('should allow adding new sections', () => {
      // Initial config
      setConfig({
        server: { port: 3000 },
      });

      // Get current config
      const current = getConfig();

      // Add new section
      setConfig({
        ...current,
        database: { url: 'mongodb://localhost/test' },
      });

      expect(getConfig('server.port')).toBe(3000);
      expect(getConfig('database.url')).toBe('mongodb://localhost/test');
    });

    it('should allow updating nested values', () => {
      // Initial config
      setConfig({
        server: {
          port: 3000,
          host: 'localhost',
          ssl: false,
        },
      });

      // Get current server config
      const currentServer = getConfig('server');

      // Update server config
      setConfig({
        server: {
          ...currentServer,
          port: 4000,
          ssl: true,
        },
      });

      expect(getConfig('server.port')).toBe(4000);
      expect(getConfig('server.host')).toBe('localhost');
      expect(getConfig('server.ssl')).toBe(true);
    });
  });
});
