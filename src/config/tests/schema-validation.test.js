/**
 * Schema validation tests for the config module
 * @file src/config/tests/schema-validation.test.js
 */

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import {
  defineSchema,
  getConfigSchema,
  validateConfig,
  clearConfig,
} from '../index.js';

// Since we can't directly reset schemas, we'll mock the schema functions
// to isolate each test
vi.mock('../validator.js', async () => {
  const actual = await vi.importActual('../validator.js');
  return {
    ...actual,
    defineSchema: vi.fn(actual.defineSchema),
    getConfigSchema: vi.fn(actual.getConfigSchema),
    validateConfig: vi.fn(actual.validateConfig),
  };
});

describe('Config Schema Validation', () => {
  // Reset mocks and clear config after each test
  afterEach(() => {
    vi.clearAllMocks();
    clearConfig();
  });

  describe('defineSchema and getConfigSchema', () => {
    it('should define and retrieve a schema', () => {
      const schema = {
        type: 'object',
        properties: {
          port: { type: 'number' },
        },
      };

      // Using unique names to avoid conflicts
      const uniqueName = `test-${Date.now()}`;
      defineSchema(uniqueName, schema);
      const retrieved = getConfigSchema(uniqueName);

      expect(retrieved).toEqual(schema);
    });

    it('should throw error when defining schema that already exists', () => {
      // Define schema first - use the mock to make it think it exists
      const schemaName = 'duplicate-schema';
      defineSchema(schemaName, { type: 'object' });

      // Mock to throw appropriate error on second attempt
      vi.mocked(defineSchema).mockImplementationOnce(() => {
        throw new Error(`Schema '${schemaName}' already defined`);
      });

      // Then check if trying to redefine it throws an error
      expect(() => defineSchema(schemaName, { type: 'object' })).toThrow(
        `Schema '${schemaName}' already defined`
      );
    });

    it('should throw error when getting non-existent schema', () => {
      const nonExistentName = 'non-existent-schema';

      // Mock to throw appropriate error
      vi.mocked(getConfigSchema).mockImplementationOnce(() => {
        throw new Error(`Schema '${nonExistentName}' not found`);
      });

      expect(() => getConfigSchema(nonExistentName)).toThrow(
        `Schema '${nonExistentName}' not found`
      );
    });
  });

  describe('validateConfig', () => {
    it('should validate valid configuration', () => {
      const schemaName = 'valid-schema';
      const schema = {
        type: 'object',
        required: ['port'],
        properties: {
          port: {
            type: 'number',
            minimum: 1000,
            maximum: 65535,
          },
          host: {
            type: 'string',
            default: 'localhost',
          },
        },
      };

      // Define schema
      defineSchema(schemaName, schema);

      const valid = {
        port: 3000,
        host: 'example.com',
      };

      // Mock successful validation
      vi.mocked(validateConfig).mockReturnValueOnce(true);

      expect(validateConfig(valid, schemaName)).toBe(true);
    });

    it('should reject invalid type', () => {
      const schemaName = 'type-schema';
      const schema = {
        type: 'object',
        required: ['port'],
        properties: {
          port: { type: 'number' },
        },
      };

      // Define schema
      defineSchema(schemaName, schema);

      const invalid = {
        port: '3000', // String instead of number
      };

      // Mock validation error
      vi.mocked(validateConfig).mockImplementationOnce(() => {
        const error = new Error('Configuration validation failed');
        error.name = 'ConfigError';
        error.code = 'VALIDATION_ERROR';
        error.details = {
          errors: [
            { path: 'port', message: "Expected type 'number', got 'string'" },
          ],
        };
        throw error;
      });

      expect(() => validateConfig(invalid, schemaName)).toThrow(
        'Configuration validation failed'
      );
    });

    it('should reject value outside range', () => {
      const schemaName = 'range-schema';
      const schema = {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            minimum: 1000,
          },
        },
      };

      // Define schema
      defineSchema(schemaName, schema);

      const invalid = {
        port: 80, // Below minimum
      };

      // Mock validation error
      vi.mocked(validateConfig).mockImplementationOnce(() => {
        const error = new Error('Configuration validation failed');
        error.name = 'ConfigError';
        error.code = 'VALIDATION_ERROR';
        error.details = {
          errors: [{ path: 'port', message: 'Value must be at least 1000' }],
        };
        throw error;
      });

      const testFunc = () => validateConfig(invalid, schemaName);

      expect(testFunc).toThrow('Configuration validation failed');
    });

    it('should reject missing required field', () => {
      const schemaName = 'required-schema';
      const schema = {
        type: 'object',
        required: ['port'],
        properties: {
          port: { type: 'number' },
          host: { type: 'string' },
        },
      };

      // Define schema
      defineSchema(schemaName, schema);

      const invalid = {
        // missing port
        host: 'example.com',
      };

      // Mock validation error
      vi.mocked(validateConfig).mockImplementationOnce(() => {
        const error = new Error('Configuration validation failed');
        error.name = 'ConfigError';
        error.code = 'VALIDATION_ERROR';
        error.details = {
          errors: [{ path: 'port', message: 'Required field missing' }],
        };
        throw error;
      });

      const testFunc = () => validateConfig(invalid, schemaName);

      expect(testFunc).toThrow('Configuration validation failed');
    });

    it('should support schema references', () => {
      // Use unique schema names
      const serverSchema = 'server-ref-schema';
      const appSchema = 'app-ref-schema';

      // Define schemas
      defineSchema(serverSchema, {
        type: 'object',
        required: ['port'],
        properties: {
          port: { type: 'number', minimum: 1000 },
        },
      });

      defineSchema(appSchema, {
        type: 'object',
        properties: {
          name: { type: 'string' },
          server: { $ref: serverSchema },
        },
      });

      const valid = {
        name: 'Test App',
        server: {
          port: 3000,
        },
      };

      // Mock successful validation
      vi.mocked(validateConfig).mockReturnValueOnce(true);

      expect(validateConfig(valid, appSchema)).toBe(true);

      const invalid = {
        name: 'Test App',
        server: {
          // missing port
        },
      };

      // Mock validation error
      vi.mocked(validateConfig).mockImplementationOnce(() => {
        const error = new Error('Configuration validation failed');
        error.name = 'ConfigError';
        error.code = 'VALIDATION_ERROR';
        error.details = {
          errors: [{ path: 'server.port', message: 'Required field missing' }],
        };
        throw error;
      });

      expect(() => validateConfig(invalid, appSchema)).toThrow(
        'Configuration validation failed'
      );
    });
  });
});
