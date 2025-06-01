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
 * @returns {{valid: boolean, errors?: Array, value?: *}} Validation result
 */
export function validate(data, schema, options = {}) {
  const context = {
    data,
    path: '',
    errors: [],
    options: {
      abortEarly: options.abortEarly || false,
      allowUnknown: options.allowUnknown || false,
      stripUnknown: options.stripUnknown || false,
      context: options.context || {},
      locale: options.locale || 'en',
      timezone: options.timezone || null,
    },
  };

  let result;
  try {
    result = validateValue(data, schema, context);
  } catch (error) {
    if (error instanceof ValidationError) {
      context.errors.push(...error.errors);
    } else {
      context.errors.push({
        path: context.path,
        message: error.message,
        type: 'exception',
        value: data,
      });
    }
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
 * @returns {Promise<{valid: boolean, errors?: Array, value?: *}>} Validation result
 */
export async function validateAsync(data, schema, options = {}) {
  const context = {
    data,
    path: '',
    errors: [],
    options: {
      abortEarly: options.abortEarly || false,
      allowUnknown: options.allowUnknown || false,
      stripUnknown: options.stripUnknown || false,
      context: options.context || {},
      locale: options.locale || 'en',
      timezone: options.timezone || null,
    },
  };

  let result;
  try {
    result = await validateValueAsync(data, schema, context);
  } catch (error) {
    if (error instanceof ValidationError) {
      context.errors.push(...error.errors);
    } else {
      context.errors.push({
        path: context.path,
        message: error.message,
        type: 'exception',
        value: data,
      });
    }
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
 * @param {*} value - Value to validate
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {*} Processed value
 */
function validateValue(value, schema, context) {
  // Handle conditional schemas
  if (schema.when) {
    schema = resolveConditionalSchema(schema, context);
  }

  // Check if required
  if (value === undefined || value === null) {
    if (schema.required) {
      addError(context, 'Value is required', 'required');
      return value;
    }

    // Return default value if provided
    if ('default' in schema) {
      return typeof schema.default === 'function'
        ? schema.default(context)
        : schema.default;
    }

    return value;
  }

  // Type validation
  if (schema.type) {
    const typeValid = validateType(value, schema.type, context);
    if (!typeValid && context.options.abortEarly) {
      return value;
    }
  }

  // Custom validation function
  if (schema.validate) {
    try {
      const result = schema.validate(value, context);
      if (result !== true) {
        addError(context, result || 'Validation failed', 'custom');
        if (context.options.abortEarly) return value;
      }
    } catch (error) {
      addError(context, error.message, 'custom');
      if (context.options.abortEarly) return value;
    }
  }

  // Type-specific validation
  let processedValue = value;

  switch (getType(value)) {
    case 'string':
      processedValue = validateString(value, schema, context);
      break;
    case 'number':
      processedValue = validateNumber(value, schema, context);
      break;
    case 'boolean':
      processedValue = validateBoolean(value, schema, context);
      break;
    case 'array':
      processedValue = validateArray(value, schema, context);
      break;
    case 'object':
      processedValue = validateObject(value, schema, context);
      break;
    case 'date':
      processedValue = validateDate(value, schema, context);
      break;
  }

  // Transform value if specified
  if (schema.transform && typeof schema.transform === 'function') {
    try {
      processedValue = schema.transform(processedValue, context);
    } catch (error) {
      addError(context, `Transform failed: ${error.message}`, 'transform');
    }
  }

  return processedValue;
}

/**
 * Validates a value asynchronously
 * @private
 * @param {*} value - Value to validate
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Promise<*>} Processed value
 */
async function validateValueAsync(value, schema, context) {
  // Handle conditional schemas
  if (schema.when) {
    schema = resolveConditionalSchema(schema, context);
  }

  // Check if required
  if (value === undefined || value === null) {
    if (schema.required) {
      addError(context, 'Value is required', 'required');
      return value;
    }

    // Return default value if provided
    if ('default' in schema) {
      const defaultValue =
        typeof schema.default === 'function'
          ? schema.default(context)
          : schema.default;

      return Promise.resolve(defaultValue);
    }

    return value;
  }

  // Type validation
  if (schema.type) {
    const typeValid = validateType(value, schema.type, context);
    if (!typeValid && context.options.abortEarly) {
      return value;
    }
  }

  // Custom async validation function
  if (schema.validateAsync) {
    try {
      const result = await schema.validateAsync(value, context);
      if (result !== true) {
        addError(context, result || 'Async validation failed', 'asyncCustom');
        if (context.options.abortEarly) return value;
      }
    } catch (error) {
      addError(context, error.message, 'asyncCustom');
      if (context.options.abortEarly) return value;
    }
  }

  // Custom sync validation function
  if (schema.validate) {
    try {
      const result = schema.validate(value, context);
      if (result !== true) {
        addError(context, result || 'Validation failed', 'custom');
        if (context.options.abortEarly) return value;
      }
    } catch (error) {
      addError(context, error.message, 'custom');
      if (context.options.abortEarly) return value;
    }
  }

  // Type-specific validation (async where needed)
  let processedValue = value;

  switch (getType(value)) {
    case 'string':
      processedValue = await validateStringAsync(value, schema, context);
      break;
    case 'number':
      processedValue = validateNumber(value, schema, context);
      break;
    case 'boolean':
      processedValue = validateBoolean(value, schema, context);
      break;
    case 'array':
      processedValue = await validateArrayAsync(value, schema, context);
      break;
    case 'object':
      processedValue = await validateObjectAsync(value, schema, context);
      break;
    case 'date':
      processedValue = validateDate(value, schema, context);
      break;
  }

  // Transform value if specified
  if (schema.transform && typeof schema.transform === 'function') {
    try {
      processedValue = schema.transform(processedValue, context);
    } catch (error) {
      addError(context, `Transform failed: ${error.message}`, 'transform');
    }
  }

  return processedValue;
}

/**
 * Validates string value
 * @private
 * @param {string} value - String value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {string} Processed value
 */
function validateString(value, schema, context) {
  if (schema.trim) {
    value = value.trim();
  }

  if (schema.lowercase) {
    value = value.toLowerCase();
  }

  if (schema.uppercase) {
    value = value.toUpperCase();
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

  if (schema.length !== undefined && value.length !== schema.length) {
    addError(
      context,
      `String must be exactly ${schema.length} characters long`,
      'length'
    );
  }

  if (schema.pattern) {
    const regex =
      schema.pattern instanceof RegExp
        ? schema.pattern
        : new RegExp(schema.pattern);
    if (!regex.test(value)) {
      addError(
        context,
        schema.patternMessage ||
          `String does not match pattern: ${schema.pattern}`,
        'pattern'
      );
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    addError(
      context,
      `Value must be one of: ${schema.enum.join(', ')}`,
      'enum'
    );
  }

  // Common string validators
  if (schema.email && !isEmail(value)) {
    addError(context, 'Invalid email address', 'email');
  }

  if (schema.url && !isUrl(value)) {
    addError(context, 'Invalid URL', 'url');
  }

  if (schema.uuid && !isUuid(value)) {
    addError(context, 'Invalid UUID', 'uuid');
  }

  if (schema.creditCard && !isCreditCard(value)) {
    addError(context, 'Invalid credit card number', 'creditCard');
  }

  if (schema.phone && !isPhoneNumber(value)) {
    addError(context, 'Invalid phone number', 'phone');
  }

  if (schema.alphanumeric && !isAlphanumeric(value)) {
    addError(
      context,
      'String must contain only letters and numbers',
      'alphanumeric'
    );
  }

  if (schema.alpha && !isAlpha(value)) {
    addError(context, 'String must contain only letters', 'alpha');
  }

  if (schema.numeric && !isNumeric(value)) {
    addError(context, 'String must contain only numbers', 'numeric');
  }

  if (schema.hexColor && !isHexColor(value)) {
    addError(context, 'Invalid hex color', 'hexColor');
  }

  if (schema.ipAddress && !isIpAddress(value)) {
    addError(context, 'Invalid IP address', 'ipAddress');
  }

  if (schema.slug && !isSlug(value)) {
    addError(context, 'Invalid slug format', 'slug');
  }

  if (schema.strongPassword && !isStrongPassword(value)) {
    addError(
      context,
      'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
      'strongPassword'
    );
  }

  return value;
}

/**
 * Validates string value asynchronously
 * @private
 * @param {string} value - String value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Promise<string>} Processed value
 */
async function validateStringAsync(value, schema, context) {
  // First run sync validation
  const syncResult = validateString(value, schema, context);

  // Add async-specific validations here if needed
  // For example: database uniqueness checks, external API validations, etc.

  return syncResult;
}

/**
 * Validates number value
 * @private
 * @param {number} value - Number value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {number} Processed value
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

  if (schema.positive && value <= 0) {
    addError(context, 'Value must be positive', 'positive');
  }

  if (schema.negative && value >= 0) {
    addError(context, 'Value must be negative', 'negative');
  }

  if (schema.multipleOf && value % schema.multipleOf !== 0) {
    addError(
      context,
      `Value must be a multiple of ${schema.multipleOf}`,
      'multipleOf'
    );
  }

  if (schema.finite && !Number.isFinite(value)) {
    addError(context, 'Value must be finite', 'finite');
  }

  if (schema.safe && !Number.isSafeInteger(value)) {
    addError(context, 'Value must be a safe integer', 'safe');
  }

  if (schema.precision !== undefined) {
    const decimals = (value.toString().split('.')[1] || '').length;
    if (decimals > schema.precision) {
      addError(
        context,
        `Value must have at most ${schema.precision} decimal places`,
        'precision'
      );
    }
  }

  return value;
}

/**
 * Validates boolean value
 * @private
 * @param {boolean} value - Boolean value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {boolean} Processed value
 */
function validateBoolean(value, schema, context) {
  if (schema.truthy && !value) {
    addError(context, 'Value must be true', 'truthy');
  }

  if (schema.falsy && value) {
    addError(context, 'Value must be false', 'falsy');
  }

  return value;
}

/**
 * Validates array value
 * @private
 * @param {Array} value - Array value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Array} Processed value
 */
function validateArray(value, schema, context) {
  const result = [];

  if (schema.minItems !== undefined && value.length < schema.minItems) {
    addError(
      context,
      `Array must contain at least ${schema.minItems} items`,
      'minItems'
    );
  }

  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    addError(
      context,
      `Array must not contain more than ${schema.maxItems} items`,
      'maxItems'
    );
  }

  if (schema.length !== undefined && value.length !== schema.length) {
    addError(
      context,
      `Array must contain exactly ${schema.length} items`,
      'length'
    );
  }

  if (schema.unique) {
    const seen = new Set();
    const duplicates = [];

    for (let i = 0; i < value.length; i++) {
      const item = JSON.stringify(value[i]);
      if (seen.has(item)) {
        duplicates.push(i);
      }
      seen.add(item);
    }

    if (duplicates.length > 0) {
      addError(
        context,
        `Duplicate values found at indices: ${duplicates.join(', ')}`,
        'unique'
      );
    }
  }

  // Validate array items
  if (schema.items) {
    for (let i = 0; i < value.length; i++) {
      const itemContext = {
        ...context,
        path: context.path ? `${context.path}[${i}]` : `[${i}]`,
      };

      try {
        result[i] = validateValue(value[i], schema.items, itemContext);
      } catch (error) {
        // Error already added to context by validateValue
        result[i] = value[i];
      }
    }
  } else {
    result.push(...value);
  }

  // Validate contains constraint
  if (schema.contains) {
    const containsCount = result.filter((item) => {
      const tempContext = { ...context, errors: [] };
      try {
        validateValue(item, schema.contains, tempContext);
        return tempContext.errors.length === 0;
      } catch {
        return false;
      }
    }).length;

    const minContains = schema.minContains || 1;
    const maxContains = schema.maxContains || Infinity;

    if (containsCount < minContains) {
      addError(
        context,
        `Array must contain at least ${minContains} items matching the contains schema`,
        'minContains'
      );
    }

    if (containsCount > maxContains) {
      addError(
        context,
        `Array must contain at most ${maxContains} items matching the contains schema`,
        'maxContains'
      );
    }
  }

  return result;
}

/**
 * Validates array value asynchronously
 * @private
 * @param {Array} value - Array value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Promise<Array>} Processed value
 */
async function validateArrayAsync(value, schema, context) {
  const result = [];

  // Run sync validations first
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    addError(
      context,
      `Array must contain at least ${schema.minItems} items`,
      'minItems'
    );
  }

  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    addError(
      context,
      `Array must not contain more than ${schema.maxItems} items`,
      'maxItems'
    );
  }

  if (schema.length !== undefined && value.length !== schema.length) {
    addError(
      context,
      `Array must contain exactly ${schema.length} items`,
      'length'
    );
  }

  if (schema.unique) {
    const seen = new Set();
    const duplicates = [];

    for (let i = 0; i < value.length; i++) {
      const item = JSON.stringify(value[i]);
      if (seen.has(item)) {
        duplicates.push(i);
      }
      seen.add(item);
    }

    if (duplicates.length > 0) {
      addError(
        context,
        `Duplicate values found at indices: ${duplicates.join(', ')}`,
        'unique'
      );
    }
  }

  // Validate array items asynchronously
  if (schema.items) {
    const promises = value.map(async (item, i) => {
      const itemContext = {
        ...context,
        path: context.path ? `${context.path}[${i}]` : `[${i}]`,
      };

      try {
        return await validateValueAsync(item, schema.items, itemContext);
      } catch (error) {
        return item;
      }
    });

    const resolvedResults = await Promise.all(promises);
    result.push(...resolvedResults);
  } else {
    result.push(...value);
  }

  return result;
}

/**
 * Validates object value
 * @private
 * @param {Object} value - Object value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Object} Processed value
 */
function validateObject(value, schema, context) {
  const result = {};
  const processedKeys = new Set();

  // Validate defined properties
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      processedKeys.add(key);
      const propContext = {
        ...context,
        path: context.path ? `${context.path}.${key}` : key,
      };

      if (key in value) {
        try {
          result[key] = validateValue(value[key], propSchema, propContext);
        } catch (error) {
          result[key] = value[key];
        }
      } else if (propSchema.required) {
        addError(propContext, 'Value is required', 'required');
      } else if ('default' in propSchema) {
        result[key] =
          typeof propSchema.default === 'function'
            ? propSchema.default(propContext)
            : propSchema.default;
      }
    }
  }

  // Handle additional properties
  for (const [key, val] of Object.entries(value)) {
    if (!processedKeys.has(key)) {
      if (schema.additionalProperties === false) {
        if (!context.options.allowUnknown) {
          addError(
            context,
            `Unknown property: ${key}`,
            'additionalProperties',
            context.path ? `${context.path}.${key}` : key
          );
        }
        if (!context.options.stripUnknown) {
          result[key] = val;
        }
      } else if (
        schema.additionalProperties &&
        typeof schema.additionalProperties === 'object'
      ) {
        const propContext = {
          ...context,
          path: context.path ? `${context.path}.${key}` : key,
        };
        try {
          result[key] = validateValue(
            val,
            schema.additionalProperties,
            propContext
          );
        } catch (error) {
          result[key] = val;
        }
      } else {
        result[key] = val;
      }
    }
  }

  // Object-level validations
  if (schema.minProperties !== undefined) {
    const propCount = Object.keys(result).length;
    if (propCount < schema.minProperties) {
      addError(
        context,
        `Object must have at least ${schema.minProperties} properties`,
        'minProperties'
      );
    }
  }

  if (schema.maxProperties !== undefined) {
    const propCount = Object.keys(result).length;
    if (propCount > schema.maxProperties) {
      addError(
        context,
        `Object must not have more than ${schema.maxProperties} properties`,
        'maxProperties'
      );
    }
  }

  // Required properties check
  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredProp of schema.required) {
      if (!(requiredProp in result)) {
        const propContext = {
          ...context,
          path: context.path ? `${context.path}.${requiredProp}` : requiredProp,
        };
        addError(propContext, 'Value is required', 'required');
      }
    }
  }

  // Dependencies
  if (schema.dependencies) {
    for (const [key, deps] of Object.entries(schema.dependencies)) {
      if (key in result) {
        if (Array.isArray(deps)) {
          // Property dependencies
          for (const dep of deps) {
            if (!(dep in result)) {
              addError(
                context,
                `Property '${key}' requires '${dep}'`,
                'dependencies'
              );
            }
          }
        } else {
          // Schema dependencies
          try {
            validateValue(result, deps, context);
          } catch (error) {
            // Error already added by validateValue
          }
        }
      }
    }
  }

  return result;
}

/**
 * Validates object value asynchronously
 * @private
 * @param {Object} value - Object value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Promise<Object>} Processed value
 */
async function validateObjectAsync(value, schema, context) {
  const result = {};
  const processedKeys = new Set();

  // Validate defined properties asynchronously
  if (schema.properties) {
    const propertyPromises = Object.entries(schema.properties).map(
      async ([key, propSchema]) => {
        processedKeys.add(key);
        const propContext = {
          ...context,
          path: context.path ? `${context.path}.${key}` : key,
        };

        if (key in value) {
          try {
            const validatedValue = await validateValueAsync(
              value[key],
              propSchema,
              propContext
            );
            return [key, validatedValue];
          } catch (error) {
            return [key, value[key]];
          }
        } else if (propSchema.required) {
          addError(propContext, 'Value is required', 'required');
          return [key, undefined];
        } else if ('default' in propSchema) {
          const defaultValue =
            typeof propSchema.default === 'function'
              ? propSchema.default(propContext)
              : propSchema.default;
          return [key, defaultValue];
        }
        return null;
      }
    );

    const resolvedProperties = await Promise.all(propertyPromises);
    for (const prop of resolvedProperties) {
      if (prop && prop[1] !== undefined) {
        result[prop[0]] = prop[1];
      }
    }
  }

  // Handle additional properties
  const additionalPromises = Object.entries(value)
    .filter(([key]) => !processedKeys.has(key))
    .map(async ([key, val]) => {
      if (schema.additionalProperties === false) {
        if (!context.options.allowUnknown) {
          addError(
            context,
            `Unknown property: ${key}`,
            'additionalProperties',
            context.path ? `${context.path}.${key}` : key
          );
        }
        if (!context.options.stripUnknown) {
          return [key, val];
        }
        return null;
      } else if (
        schema.additionalProperties &&
        typeof schema.additionalProperties === 'object'
      ) {
        const propContext = {
          ...context,
          path: context.path ? `${context.path}.${key}` : key,
        };
        try {
          const validatedValue = await validateValueAsync(
            val,
            schema.additionalProperties,
            propContext
          );
          return [key, validatedValue];
        } catch (error) {
          return [key, val];
        }
      } else {
        return [key, val];
      }
    });

  const resolvedAdditional = await Promise.all(additionalPromises);
  for (const prop of resolvedAdditional) {
    if (prop) {
      result[prop[0]] = prop[1];
    }
  }

  // Object-level validations (sync)
  if (schema.minProperties !== undefined) {
    const propCount = Object.keys(result).length;
    if (propCount < schema.minProperties) {
      addError(
        context,
        `Object must have at least ${schema.minProperties} properties`,
        'minProperties'
      );
    }
  }

  if (schema.maxProperties !== undefined) {
    const propCount = Object.keys(result).length;
    if (propCount > schema.maxProperties) {
      addError(
        context,
        `Object must not have more than ${schema.maxProperties} properties`,
        'maxProperties'
      );
    }
  }

  // Required properties check
  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredProp of schema.required) {
      if (!(requiredProp in result)) {
        const propContext = {
          ...context,
          path: context.path ? `${context.path}.${requiredProp}` : requiredProp,
        };
        addError(propContext, 'Value is required', 'required');
      }
    }
  }

  return result;
}

/**
 * Validates date value
 * @private
 * @param {Date} value - Date value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Date} Processed value
 */
function validateDate(value, schema, context) {
  if ((!value) instanceof Date || isNaN(value.getTime())) {
    addError(context, 'Invalid date', 'invalidDate');
    return value;
  }

  if (schema.min) {
    const minDate = new Date(schema.min);
    if (value < minDate) {
      addError(context, `Date must be after ${minDate.toISOString()}`, 'min');
    }
  }

  if (schema.max) {
    const maxDate = new Date(schema.max);
    if (value > maxDate) {
      addError(context, `Date must be before ${maxDate.toISOString()}`, 'max');
    }
  }

  if (schema.future && value <= new Date()) {
    addError(context, 'Date must be in the future', 'future');
  }

  if (schema.past && value >= new Date()) {
    addError(context, 'Date must be in the past', 'past');
  }

  return value;
}

/**
 * @voilajsx/appkit - Validators (Part 2 - Continuation)
 * @module @voilajsx/appkit/validation/validators
 */

/**
 * Validates value type
 * @private
 * @param {*} value - Value to check
 * @param {string|Array<string>} type - Expected type(s)
 * @param {Object} context - Validation context
 * @returns {boolean} Type is valid
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
 * Resolves conditional schema
 * @private
 * @param {Object} schema - Schema with when clause
 * @param {Object} context - Validation context
 * @returns {Object} Resolved schema
 */
function resolveConditionalSchema(schema, context) {
  const { when, then, otherwise, ...baseSchema } = schema;

  let condition = false;

  if (typeof when === 'function') {
    condition = when(context.data, context);
  } else if (typeof when === 'object') {
    // Check if data matches when conditions
    const { is, exists, path } = when;

    let targetValue = context.data;
    if (path) {
      // Navigate to the target path
      const pathParts = path.split('.');
      for (const part of pathParts) {
        if (targetValue && typeof targetValue === 'object') {
          targetValue = targetValue[part];
        } else {
          targetValue = undefined;
          break;
        }
      }
    }

    if (exists !== undefined) {
      condition = (targetValue !== undefined) === exists;
    } else if (is !== undefined) {
      condition = targetValue === is;
    }
  }

  const appliedSchema = condition ? then : otherwise;

  return appliedSchema ? { ...baseSchema, ...appliedSchema } : baseSchema;
}

/**
 * Gets the type of a value
 * @private
 * @param {*} value - Value to check
 * @returns {string} Type name
 */
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regexp';
  if (Buffer && Buffer.isBuffer && Buffer.isBuffer(value)) return 'buffer';
  return typeof value;
}

/**
 * Adds an error to context
 * @private
 * @param {Object} context - Validation context
 * @param {string} message - Error message
 * @param {string} [type] - Error type
 * @param {string} [path] - Error path override
 */
function addError(context, message, type = 'validation', path = context.path) {
  context.errors.push({
    path,
    message,
    type,
    value: context.data,
  });
}

/**
 * Common validators
 */

/**
 * Validates email format
 * @param {string} value - Email to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid email
 */
export function isEmail(value, options = {}) {
  const { allowInternational = true, allowPunycode = true } = options;

  if (typeof value !== 'string') return false;

  // Basic email regex that handles most cases
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!basicEmailRegex.test(value)) return false;

  // More strict validation
  const [localPart, domain] = value.split('@');

  // Local part validation
  if (localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;

  // Domain validation
  if (domain.length > 253) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain.includes('..')) return false;

  // Check for valid characters
  const localRegex =
    /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
  if (!localRegex.test(localPart)) return false;

  // Domain part should contain valid characters
  const domainRegex = allowInternational
    ? /^[a-zA-Z0-9\u00a1-\uffff-]+(\.[a-zA-Z0-9\u00a1-\uffff-]+)*$/
    : /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;

  if (!domainRegex.test(domain)) {
    if (allowPunycode && domain.includes('xn--')) {
      // Basic punycode check
      return /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/.test(domain);
    }
    return false;
  }

  return true;
}

/**
 * Validates URL format
 * @param {string} value - URL to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid URL
 */
export function isUrl(value, options = {}) {
  const {
    protocols = ['http', 'https'],
    requireProtocol = true,
    allowLocalhost = true,
    allowIp = true,
  } = options;

  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);

    // Check protocol
    if (!protocols.includes(url.protocol.slice(0, -1))) {
      return false;
    }

    // Check localhost
    if (
      !allowLocalhost &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    ) {
      return false;
    }

    // Check IP addresses
    if (!allowIp && isIpAddress(url.hostname)) {
      return false;
    }

    return true;
  } catch {
    if (!requireProtocol) {
      // Try adding protocol and validating again
      try {
        return isUrl(`https://${value}`, { ...options, requireProtocol: true });
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Validates UUID format
 * @param {string} value - UUID to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid UUID
 */
export function isUuid(value, options = {}) {
  const { version = null, strict = true } = options;

  if (typeof value !== 'string') return false;

  const uuidRegexes = {
    1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    2: /^[0-9a-f]{8}-[0-9a-f]{4}-2[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  };

  const generalUuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (version && uuidRegexes[version]) {
    return uuidRegexes[version].test(value);
  }

  if (strict) {
    return generalUuidRegex.test(value);
  }

  // Less strict - any UUID-like format
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * Validates credit card number using Luhn algorithm
 * @param {string} value - Credit card number to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid credit card
 */
export function isCreditCard(value, options = {}) {
  const { types = [], strict = true } = options;

  if (typeof value !== 'string') return false;

  // Remove spaces and dashes
  const sanitized = value.replace(/[\s-]/g, '');

  // Check if all characters are digits
  if (!/^\d+$/.test(sanitized)) return false;

  // Check length
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  // Luhn algorithm check
  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const isValidLuhn = sum % 10 === 0;

  if (!isValidLuhn) return false;

  // Card type validation if specified
  if (types.length > 0) {
    const cardType = getCreditCardType(sanitized);
    return types.includes(cardType);
  }

  return true;
}

/**
 * Gets credit card type from number
 * @private
 * @param {string} number - Credit card number
 * @returns {string} Card type
 */
function getCreditCardType(number) {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3[068]/,
    jcb: /^35/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(number)) return type;
  }

  return 'unknown';
}

/**
 * Validates phone number format
 * @param {string} value - Phone number to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid phone number
 */
export function isPhoneNumber(value, options = {}) {
  const { country = null, format = 'international' } = options;

  if (typeof value !== 'string') return false;

  // Remove common formatting characters
  const cleaned = value.replace(/[\s\-\(\)\+\.]/g, '');

  // Basic validation - should be digits only after cleaning
  if (!/^\d+$/.test(cleaned)) return false;

  // Length check - international numbers are typically 7-15 digits
  if (cleaned.length < 7 || cleaned.length > 15) return false;

  // Country-specific validation
  if (country) {
    return validatePhoneForCountry(cleaned, country);
  }

  // Format-specific validation
  switch (format) {
    case 'international':
      // E.164 format allows 1-15 digits after country code
      return /^\d{1,15}$/.test(cleaned);
    case 'national':
      // National format varies by country, basic check
      return /^\d{7,14}$/.test(cleaned);
    default:
      return true;
  }
}

/**
 * Validates phone number for specific country
 * @private
 * @param {string} number - Cleaned phone number
 * @param {string} country - Country code
 * @returns {boolean} Is valid for country
 */
function validatePhoneForCountry(number, country) {
  const patterns = {
    US: /^\d{10}$/, // US phone numbers are 10 digits
    CA: /^\d{10}$/, // Canadian phone numbers are 10 digits
    GB: /^\d{10,11}$/, // UK phone numbers are 10-11 digits
    DE: /^\d{11,12}$/, // German phone numbers are 11-12 digits
    FR: /^\d{10}$/, // French phone numbers are 10 digits
    IN: /^\d{10}$/, // Indian mobile numbers are 10 digits
    AU: /^\d{9,10}$/, // Australian phone numbers are 9-10 digits
    JP: /^\d{10,11}$/, // Japanese phone numbers are 10-11 digits
  };

  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(number) : true;
}

/**
 * Validates alphanumeric string
 * @param {string} value - String to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is alphanumeric
 */
export function isAlphanumeric(value, options = {}) {
  const {
    allowUnderscore = false,
    allowHyphen = false,
    locale = 'en',
  } = options;

  if (typeof value !== 'string') return false;

  let pattern = /^[a-zA-Z0-9]+$/;

  if (allowUnderscore && allowHyphen) {
    pattern = /^[a-zA-Z0-9_-]+$/;
  } else if (allowUnderscore) {
    pattern = /^[a-zA-Z0-9_]+$/;
  } else if (allowHyphen) {
    pattern = /^[a-zA-Z0-9-]+$/;
  }

  // Locale-specific patterns
  if (locale !== 'en') {
    // Add support for international characters
    const unicodePattern =
      allowUnderscore && allowHyphen
        ? /^[\p{L}\p{N}_-]+$/u
        : allowUnderscore
          ? /^[\p{L}\p{N}_]+$/u
          : allowHyphen
            ? /^[\p{L}\p{N}-]+$/u
            : /^[\p{L}\p{N}]+$/u;
    return unicodePattern.test(value);
  }

  return pattern.test(value);
}

/**
 * Validates alphabetic string
 * @param {string} value - String to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is alphabetic
 */
export function isAlpha(value, options = {}) {
  const { locale = 'en', allowSpaces = false } = options;

  if (typeof value !== 'string') return false;

  if (locale === 'en') {
    return allowSpaces
      ? /^[a-zA-Z\s]+$/.test(value)
      : /^[a-zA-Z]+$/.test(value);
  }

  // Unicode letter support for international locales
  return allowSpaces ? /^[\p{L}\s]+$/u.test(value) : /^[\p{L}]+$/u.test(value);
}

/**
 * Validates numeric string
 * @param {string} value - String to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is numeric
 */
export function isNumeric(value, options = {}) {
  const {
    allowDecimal = false,
    allowNegative = false,
    allowLeadingZeros = true,
  } = options;

  if (typeof value !== 'string') return false;

  let pattern = /^\d+$/;

  if (allowDecimal && allowNegative) {
    pattern = /^-?\d+(\.\d+)?$/;
  } else if (allowDecimal) {
    pattern = /^\d+(\.\d+)?$/;
  } else if (allowNegative) {
    pattern = /^-?\d+$/;
  }

  if (
    !allowLeadingZeros &&
    value.length > 1 &&
    value.startsWith('0') &&
    !value.startsWith('0.')
  ) {
    return false;
  }

  return pattern.test(value);
}

/**
 * Validates hex color format
 * @param {string} value - Color to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid hex color
 */
export function isHexColor(value, options = {}) {
  const { allowShorthand = true, requireHash = true } = options;

  if (typeof value !== 'string') return false;

  let pattern;

  if (allowShorthand) {
    pattern = requireHash
      ? /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      : /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  } else {
    pattern = requireHash ? /^#[A-Fa-f0-9]{6}$/ : /^#?[A-Fa-f0-9]{6}$/;
  }

  return pattern.test(value);
}

/**
 * Validates IP address (IPv4 or IPv6)
 * @param {string} value - IP address to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid IP address
 */
export function isIpAddress(value, options = {}) {
  const { version = 'both' } = options;

  if (typeof value !== 'string') return false;

  switch (version) {
    case 'v4':
    case 4:
      return isIPv4(value);
    case 'v6':
    case 6:
      return isIPv6(value);
    case 'both':
    default:
      return isIPv4(value) || isIPv6(value);
  }
}

/**
 * Validates IPv4 address
 * @private
 * @param {string} value - IPv4 address
 * @returns {boolean} Is valid IPv4
 */
function isIPv4(value) {
  const parts = value.split('.');

  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && String(num) === part;
  });
}

/**
 * Validates IPv6 address
 * @private
 * @param {string} value - IPv6 address
 * @returns {boolean} Is valid IPv6
 */
function isIPv6(value) {
  // Basic IPv6 validation - handles most common cases
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  const compressedRegex =
    /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:)*::[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;

  return ipv6Regex.test(value) || compressedRegex.test(value);
}

/**
 * Validates slug format
 * @param {string} value - Slug to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid slug
 */
export function isSlug(value, options = {}) {
  const { allowUnderscore = false, maxLength = 100 } = options;

  if (typeof value !== 'string') return false;

  if (value.length > maxLength) return false;

  const pattern = allowUnderscore ? /^[a-z0-9_-]+$/ : /^[a-z0-9-]+$/;

  return pattern.test(value) && !value.startsWith('-') && !value.endsWith('-');
}

/**
 * Validates strong password
 * @param {string} value - Password to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is strong password
 */
export function isStrongPassword(value, options = {}) {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSymbols = true,
    minSymbols = 1,
    minNumbers = 1,
    minUppercase = 1,
    minLowercase = 1,
    forbiddenSequences = ['123', 'abc', 'qwerty', 'password'],
    maxRepeatingChars = 3,
  } = options;

  if (typeof value !== 'string') return false;

  // Length check
  if (value.length < minLength || value.length > maxLength) return false;

  // Character type requirements
  if (requireUppercase && (value.match(/[A-Z]/g) || []).length < minUppercase)
    return false;
  if (requireLowercase && (value.match(/[a-z]/g) || []).length < minLowercase)
    return false;
  if (requireNumbers && (value.match(/[0-9]/g) || []).length < minNumbers)
    return false;
  if (
    requireSymbols &&
    (value.match(/[^A-Za-z0-9]/g) || []).length < minSymbols
  )
    return false;

  // Forbidden sequences
  const lowerValue = value.toLowerCase();
  for (const sequence of forbiddenSequences) {
    if (lowerValue.includes(sequence.toLowerCase())) return false;
  }

  // Repeating characters check
  if (maxRepeatingChars > 0) {
    const regex = new RegExp(`(.)\\1{${maxRepeatingChars},}`, 'i');
    if (regex.test(value)) return false;
  }

  return true;
}

/**
 * Validates JSON string
 * @param {string} value - JSON string to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid JSON
 */
export function isJSON(value, options = {}) {
  const { allowPrimitives = true } = options;

  if (typeof value !== 'string') return false;

  try {
    const parsed = JSON.parse(value);

    if (!allowPrimitives && (typeof parsed !== 'object' || parsed === null)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates base64 string
 * @param {string} value - Base64 string to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid base64
 */
export function isBase64(value, options = {}) {
  const { urlSafe = false } = options;

  if (typeof value !== 'string') return false;

  const pattern = urlSafe ? /^[A-Za-z0-9_-]+={0,2}$/ : /^[A-Za-z0-9+/]+={0,2}$/;

  // Check pattern and length (base64 length should be multiple of 4)
  return pattern.test(value) && value.length % 4 === 0;
}

/**
 * Validates MongoDB ObjectId
 * @param {string} value - ObjectId to validate
 * @returns {boolean} Is valid ObjectId
 */
export function isObjectId(value) {
  if (typeof value !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Validates credit card expiry date
 * @param {string} value - Expiry date (MM/YY or MM/YYYY format)
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid and not expired
 */
export function isCreditCardExpiry(value, options = {}) {
  const { allowPast = false } = options;

  if (typeof value !== 'string') return false;

  const formats = [
    /^(0[1-9]|1[0-2])\/([0-9]{2})$/, // MM/YY
    /^(0[1-9]|1[0-2])\/([0-9]{4})$/, // MM/YYYY
  ];

  let match = null;
  for (const format of formats) {
    match = value.match(format);
    if (match) break;
  }

  if (!match) return false;

  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  // Convert 2-digit year to 4-digit
  if (year < 100) {
    const currentYear = new Date().getFullYear();
    const century = Math.floor(currentYear / 100) * 100;
    year = century + year;

    // If the year is more than 50 years in the past, assume it's next century
    if (year < currentYear - 50) {
      year += 100;
    }
  }

  if (!allowPast) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates semantic version
 * @param {string} value - Version string to validate
 * @param {Object} [options] - Validation options
 * @returns {boolean} Is valid semver
 */
export function isSemVer(value, options = {}) {
  const { allowPrerelease = true, allowBuild = true } = options;

  if (typeof value !== 'string') return false;

  let pattern = /^\d+\.\d+\.\d+$/;

  if (allowPrerelease && allowBuild) {
    pattern =
      /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
  } else if (allowPrerelease) {
    pattern = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
  } else if (allowBuild) {
    pattern = /^\d+\.\d+\.\d+(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
  }

  return pattern.test(value);
}
