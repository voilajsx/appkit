/**
 * @voilajsx/appkit - Validators
 * @module @voilajsx/appkit/validation/validators
 * @file src/validation/validators.js
 */

import { ValidationError } from './errors.js';

/**
 * Validates data against schema
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {{valid: boolean, errors: Array, value: *}} Validation result
 */
export function validate(data, schema, options = {}) {
  const context = {
    data,
    path: '',
    errors: [],
    options: {
      abortEarly: options.abortEarly || false,
      ...options,
    },
  };

  let result;
  try {
    result = validateValue(data, schema, context);
  } catch (error) {
    context.errors.push({
      path: context.path,
      message: error.message,
      type: 'exception',
      value: data,
    });
  }

  return {
    valid: context.errors.length === 0,
    errors: context.errors,
    value: result,
  };
}

/**
 * Creates a reusable validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Validator function
 */
export function createValidator(schema, options = {}) {
  return (data, overrideOptions = {}) => {
    return validate(data, schema, { ...options, ...overrideOptions });
  };
}

/**
 * Validates data asynchronously
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {Promise<{valid: boolean, errors: Array, value: *}>} Validation result
 */
export async function validateAsync(data, schema, options = {}) {
  const context = {
    data,
    path: '',
    errors: [],
    options: {
      abortEarly: options.abortEarly || false,
      ...options,
    },
  };

  let result;
  try {
    result = await validateValueAsync(data, schema, context);
  } catch (error) {
    context.errors.push({
      path: context.path,
      message: error.message,
      type: 'exception',
      value: data,
    });
  }

  return {
    valid: context.errors.length === 0,
    errors: context.errors,
    value: result,
  };
}

/**
 * Creates a reusable async validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Async validator function
 */
export function createAsyncValidator(schema, options = {}) {
  return async (data, overrideOptions = {}) => {
    return validateAsync(data, schema, { ...options, ...overrideOptions });
  };
}

/**
 * Validates a value against schema
 * @private
 */
function validateValue(value, schema, context) {
  // Check if required
  if (value === undefined || value === null) {
    if (schema.required) {
      addError(context, 'Value is required', 'required');
      return value;
    }
    if ('default' in schema) {
      return typeof schema.default === 'function'
        ? schema.default()
        : schema.default;
    }
    return value;
  }

  // Type validation
  if (schema.type) {
    validateType(value, schema.type, context);
    if (context.errors.length > 0 && context.options.abortEarly) {
      return value;
    }
  }

  // Custom validation
  if (schema.validate) {
    try {
      const result = schema.validate(value, context);
      if (result !== true) {
        addError(context, result || 'Validation failed', 'custom');
      }
    } catch (error) {
      addError(context, error.message, 'custom');
    }
  }

  // Type-specific validation
  let processedValue = value;
  const type = getType(value);

  switch (type) {
    case 'string':
      processedValue = validateString(value, schema, context);
      break;
    case 'number':
      processedValue = validateNumber(value, schema, context);
      break;
    case 'object':
      processedValue = validateObject(value, schema, context);
      break;
  }

  return processedValue;
}

/**
 * Validates a value asynchronously
 * @private
 */
async function validateValueAsync(value, schema, context) {
  // Same as sync version but with async custom validation
  if (value === undefined || value === null) {
    if (schema.required) {
      addError(context, 'Value is required', 'required');
      return value;
    }
    if ('default' in schema) {
      return typeof schema.default === 'function'
        ? schema.default()
        : schema.default;
    }
    return value;
  }

  if (schema.type) {
    validateType(value, schema.type, context);
    if (context.errors.length > 0 && context.options.abortEarly) {
      return value;
    }
  }

  // Async custom validation
  if (schema.validateAsync) {
    try {
      const result = await schema.validateAsync(value, context);
      if (result !== true) {
        addError(context, result || 'Async validation failed', 'asyncCustom');
      }
    } catch (error) {
      addError(context, error.message, 'asyncCustom');
    }
  }

  // Sync custom validation
  if (schema.validate) {
    try {
      const result = schema.validate(value, context);
      if (result !== true) {
        addError(context, result || 'Validation failed', 'custom');
      }
    } catch (error) {
      addError(context, error.message, 'custom');
    }
  }

  let processedValue = value;
  const type = getType(value);

  switch (type) {
    case 'string':
      processedValue = validateString(value, schema, context);
      break;
    case 'number':
      processedValue = validateNumber(value, schema, context);
      break;
    case 'object':
      processedValue = await validateObjectAsync(value, schema, context);
      break;
  }

  return processedValue;
}

/**
 * Validates string value
 * @private
 */
function validateString(value, schema, context) {
  if (schema.trim) {
    value = value.trim();
  }

  if (schema.minLength !== undefined && value.length < schema.minLength) {
    addError(
      context,
      `String must be at least ${schema.minLength} characters long`,
      'minLength'
    );
  }

  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    addError(
      context,
      `String must not exceed ${schema.maxLength} characters`,
      'maxLength'
    );
  }

  if (schema.pattern) {
    const regex =
      schema.pattern instanceof RegExp
        ? schema.pattern
        : new RegExp(schema.pattern);
    if (!regex.test(value)) {
      addError(context, `String does not match required pattern`, 'pattern');
    }
  }

  if (schema.email && !isEmail(value)) {
    addError(context, 'Invalid email address', 'email');
  }

  if (schema.url && !isUrl(value)) {
    addError(context, 'Invalid URL', 'url');
  }

  if (schema.alphanumeric && !isAlphanumeric(value)) {
    addError(
      context,
      'String must contain only letters and numbers',
      'alphanumeric'
    );
  }

  return value;
}

/**
 * Validates number value
 * @private
 */
function validateNumber(value, schema, context) {
  if (schema.min !== undefined && value < schema.min) {
    addError(context, `Value must be at least ${schema.min}`, 'min');
  }

  if (schema.max !== undefined && value > schema.max) {
    addError(context, `Value must not exceed ${schema.max}`, 'max');
  }

  if (schema.integer && !Number.isInteger(value)) {
    addError(context, 'Value must be an integer', 'integer');
  }

  return value;
}

/**
 * Validates object value
 * @private
 */
function validateObject(value, schema, context) {
  const result = {};

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const propContext = {
        ...context,
        path: context.path ? `${context.path}.${key}` : key,
      };

      if (key in value) {
        result[key] = validateValue(value[key], propSchema, propContext);
      } else if (propSchema.required) {
        addError(propContext, 'Value is required', 'required');
      } else if ('default' in propSchema) {
        result[key] =
          typeof propSchema.default === 'function'
            ? propSchema.default()
            : propSchema.default;
      }
    }
  }

  return result;
}

/**
 * Validates object value asynchronously
 * @private
 */
async function validateObjectAsync(value, schema, context) {
  const result = {};

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const propContext = {
        ...context,
        path: context.path ? `${context.path}.${key}` : key,
      };

      if (key in value) {
        result[key] = await validateValueAsync(
          value[key],
          propSchema,
          propContext
        );
      } else if (propSchema.required) {
        addError(propContext, 'Value is required', 'required');
      } else if ('default' in propSchema) {
        result[key] =
          typeof propSchema.default === 'function'
            ? propSchema.default()
            : propSchema.default;
      }
    }
  }

  return result;
}

/**
 * Validates value type
 * @private
 */
function validateType(value, type, context) {
  const types = Array.isArray(type) ? type : [type];
  const actualType = getType(value);

  if (!types.includes(actualType)) {
    addError(
      context,
      `Expected type '${types.join(' or ')}', got '${actualType}'`,
      'type'
    );
    return false;
  }

  return true;
}

/**
 * Gets the type of a value
 * @private
 */
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}

/**
 * Adds an error to context
 * @private
 */
function addError(context, message, type = 'validation') {
  context.errors.push({
    path: context.path,
    message,
    type,
    value: context.data,
  });
}

// Essential validators only

/**
 * Validates email format
 * @param {string} value - Email to validate
 * @returns {boolean} Is valid email
 */
export function isEmail(value) {
  if (typeof value !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return false;

  const [localPart, domain] = value.split('@');

  // Basic validation
  if (localPart.length > 64 || domain.length > 253) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;

  return true;
}

/**
 * Validates URL format
 * @param {string} value - URL to validate
 * @returns {boolean} Is valid URL
 */
export function isUrl(value) {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates alphanumeric string
 * @param {string} value - String to validate
 * @returns {boolean} Is alphanumeric
 */
export function isAlphanumeric(value) {
  if (typeof value !== 'string') return false;
  return /^[a-zA-Z0-9]+$/.test(value);
}
