/**
 * @voilajsx/appkit - Common validation schemas
 * @module @voilajsx/appkit/validation/schemas
 * @file src/validation/schemas.js
 */

/**
 * Common validation schemas - only the most essential ones
 */
export const commonSchemas = {
  email: {
    type: 'string',
    required: true,
    email: true,
    trim: true,
    maxLength: 254,
  },

  password: {
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 128,
    validate(value) {
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/[^A-Za-z0-9]/.test(value)) {
        return 'Password must contain at least one special character';
      }
      return true;
    },
  },

  username: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 32,
    trim: true,
    alphanumeric: true,
  },

  url: {
    type: 'string',
    required: true,
    url: true,
    trim: true,
    maxLength: 2048,
  },

  boolean: {
    type: 'boolean',
  },

  integer: {
    type: 'number',
    integer: true,
  },
};

/**
 * Creates a new schema
 * @param {Object} definition - Schema definition
 * @returns {Object} Schema object
 */
export function createValidationSchema(definition) {
  return { ...definition };
}
