/**
 * Schema validation functionality tests
 * @file tests/schema.test.js
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadConfig,
  getConfig,
  createConfigSchema,
  validateConfigSchema,
} from '../index.js';

describe('Schema Validation', () => {
  let schemaCounter = 0;

  beforeEach(() => {
    // Clear any previous state
    delete process.env.TEST_VAR;
    schemaCounter++;
  });

  describe('createConfigSchema()', () => {
    it('should create a basic schema', () => {
      expect(() => {
        createConfigSchema('test', {
          type: 'object',
          properties: {
            port: { type: 'number' },
            host: { type: 'string' },
          },
        });
      }).not.toThrow();
    });

    it('should throw error for duplicate schema names', () => {
      const schemaName = `duplicate-${schemaCounter}`;
      createConfigSchema(schemaName, { type: 'object' });

      expect(() => {
        createConfigSchema(schemaName, { type: 'object' });
      }).toThrow(`Schema '${schemaName}' already defined`);
    });
  });

  describe('validateConfigSchema()', () => {
    beforeEach(() => {
      createConfigSchema(`server-${schemaCounter}`, {
        type: 'object',
        required: ['port'],
        properties: {
          port: { type: 'number', minimum: 1024, maximum: 65535 },
          host: { type: 'string', default: 'localhost' },
          ssl: { type: 'boolean', default: false },
        },
      });
    });

    it('should validate correct configuration', () => {
      const config = {
        port: 3000,
        host: 'localhost',
        ssl: true,
      };

      expect(() => {
        validateConfigSchema(config, `server-${schemaCounter}`);
      }).not.toThrow();
    });

    it('should throw error for missing required fields', () => {
      const config = { host: 'localhost' }; // missing required port

      expect(() => {
        validateConfigSchema(config, `server-${schemaCounter}`);
      }).toThrow('Required field missing');
    });

    it('should throw error for wrong types', () => {
      const config = {
        port: 'invalid', // should be number
        host: 'localhost',
      };

      expect(() => {
        validateConfigSchema(config, `server-${schemaCounter}`);
      }).toThrow("Expected type 'number', got 'string'");
    });

    it('should throw error for out of range values', () => {
      const config = {
        port: 80, // below minimum
        host: 'localhost',
      };

      expect(() => {
        validateConfigSchema(config, `server-${schemaCounter}`);
      }).toThrow('Value must be at least 1024');
    });

    it('should throw error for non-existent schema', () => {
      expect(() => {
        validateConfigSchema({}, 'nonexistent');
      }).toThrow("Schema 'nonexistent' not found");
    });

    it('should apply default values', () => {
      const config = { port: 3000 };

      validateConfigSchema(config, `server-${schemaCounter}`);

      expect(config.host).toBe('localhost');
      expect(config.ssl).toBe(false);
    });
  });

  describe('Schema with loadConfig()', () => {
    beforeEach(() => {
      createConfigSchema(`app-${schemaCounter}`, {
        type: 'object',
        required: ['server'],
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
              url: { type: 'string' },
              ssl: { type: 'boolean', default: false },
            },
          },
        },
      });
    });

    it('should validate configuration during load', async () => {
      const config = {
        server: { port: 3000, host: 'localhost' },
        database: { url: 'mongodb://localhost/test' },
      };

      await expect(
        loadConfig(config, {
          schema: `app-${schemaCounter}`,
          validate: true,
          env: false,
        })
      ).resolves.not.toThrow();

      expect(getConfig('server.port')).toBe(3000);
      expect(getConfig('database.ssl')).toBe(false); // default value
    });

    it('should reject invalid configuration during load', async () => {
      const config = {
        // missing required server
        database: { url: 'mongodb://localhost/test' },
      };

      await expect(
        loadConfig(config, {
          schema: `app-${schemaCounter}`,
          validate: true,
          env: false,
        })
      ).rejects.toThrow('Configuration validation failed');
    });

    it('should skip validation when validate is false', async () => {
      const config = {
        // missing required server - should not throw when validation disabled
        database: { url: 'mongodb://localhost/test' },
      };

      await expect(
        loadConfig(config, {
          schema: `app-${schemaCounter}`,
          validate: false,
          env: false,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Complex schema types', () => {
    beforeEach(() => {
      createConfigSchema(`complex-${schemaCounter}`, {
        type: 'object',
        properties: {
          stringField: { type: 'string' },
          numberField: { type: 'number' },
          booleanField: { type: 'boolean' },
          objectField: {
            type: 'object',
            properties: {
              nested: { type: 'string' },
            },
          },
          arrayTypes: { type: ['string', 'number'] }, // Multiple allowed types
        },
      });
    });

    it('should validate string types', () => {
      expect(() => {
        validateConfigSchema(
          { stringField: 'test' },
          `complex-${schemaCounter}`
        );
      }).not.toThrow();

      expect(() => {
        validateConfigSchema({ stringField: 123 }, `complex-${schemaCounter}`);
      }).toThrow("Expected type 'string', got 'number'");
    });

    it('should validate number types', () => {
      expect(() => {
        validateConfigSchema({ numberField: 42 }, `complex-${schemaCounter}`);
      }).not.toThrow();

      expect(() => {
        validateConfigSchema(
          { numberField: 'not a number' },
          `complex-${schemaCounter}`
        );
      }).toThrow("Expected type 'number', got 'string'");
    });

    it('should validate boolean types', () => {
      expect(() => {
        validateConfigSchema(
          { booleanField: true },
          `complex-${schemaCounter}`
        );
      }).not.toThrow();

      expect(() => {
        validateConfigSchema(
          { booleanField: 'true' },
          `complex-${schemaCounter}`
        );
      }).toThrow("Expected type 'boolean', got 'string'");
    });

    it('should validate nested objects', () => {
      expect(() => {
        validateConfigSchema(
          {
            objectField: { nested: 'value' },
          },
          `complex-${schemaCounter}`
        );
      }).not.toThrow();

      expect(() => {
        validateConfigSchema(
          {
            objectField: { nested: 123 },
          },
          `complex-${schemaCounter}`
        );
      }).toThrow("Expected type 'string', got 'number'");
    });

    it('should validate multiple allowed types', () => {
      expect(() => {
        validateConfigSchema(
          { arrayTypes: 'string value' },
          `complex-${schemaCounter}`
        );
      }).not.toThrow();

      expect(() => {
        validateConfigSchema({ arrayTypes: 42 }, `complex-${schemaCounter}`);
      }).not.toThrow();

      expect(() => {
        validateConfigSchema({ arrayTypes: true }, `complex-${schemaCounter}`);
      }).toThrow("Expected type 'string or number', got 'boolean'");
    });
  });

  describe('Schema defaults', () => {
    beforeEach(() => {
      createConfigSchema(`defaults-${schemaCounter}`, {
        type: 'object',
        properties: {
          server: {
            type: 'object',
            properties: {
              port: { type: 'number', default: 3000 },
              host: { type: 'string', default: 'localhost' },
              timeout: { type: 'number', default: 30000 },
            },
          },
          debug: { type: 'boolean', default: false },
        },
      });
    });

    it('should apply defaults for missing values', async () => {
      await loadConfig(
        {
          server: { port: 8080 }, // only port provided
        },
        {
          schema: `defaults-${schemaCounter}`,
          validate: true,
          env: false,
        }
      );

      expect(getConfig('server.port')).toBe(8080); // provided
      expect(getConfig('server.host')).toBe('localhost'); // default
      expect(getConfig('server.timeout')).toBe(30000); // default
      expect(getConfig('debug')).toBe(false); // default
    });

    it('should not override provided values with defaults', async () => {
      await loadConfig(
        {
          server: { port: 8080, host: '0.0.0.0', timeout: 60000 },
          debug: true,
        },
        {
          schema: `defaults-${schemaCounter}`,
          validate: true,
          env: false,
        }
      );

      expect(getConfig('server.port')).toBe(8080);
      expect(getConfig('server.host')).toBe('0.0.0.0');
      expect(getConfig('server.timeout')).toBe(60000);
      expect(getConfig('debug')).toBe(true);
    });
  });
});
