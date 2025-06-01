/**
 * @voilajsx/appkit - Configuration validator
 * @module @voilajsx/appkit/config/validator
 * @file src/config/validator.js
 */

// Schema store
const schemas = new Map();

/**
 * Creates a reusable schema.
 * @param {string} name - Schema name.
 * @param {Object} schema - Schema definition.
 * @throws {Error} If schema name already exists.
 */
export function createConfigSchema(name, schema) {
  if (schemas.has(name)) {
    throw new Error(`Schema '${name}' already defined`);
  }
  schemas.set(name, schema);
}

/**
 * Gets the schemas Map for internal use.
 * @returns {Map} The schemas Map.
 */
export function getSchemas() {
  return schemas;
}

/**
 * Validates configuration against a named schema.
 * @param {Object} config - Configuration to validate.
 * @param {string} schemaName - Name of the schema.
 * @returns {boolean} True if valid.
 * @throws {Error} If validation fails or schema not found.
 */
export function validateConfigSchema(config, schemaName) {
  const schema = schemas.get(schemaName);
  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found`);
  }

  const errors = validateObject(config, schema, '');
  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed: ${errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`
    );
  }
  return true;
}

/**
 * Validates an object against a schema.
 * @private
 * @param {*} value - Value to validate.
 * @param {Object} schema - Schema definition.
 * @param {string} path - Current path for error reporting.
 * @returns {Array<Object>} Validation errors.
 */
function validateObject(value, schema, path) {
  const errors = [];

  // Handle schema references
  if (schema.$ref) {
    const refSchema = schemas.get(schema.$ref);
    if (!refSchema) {
      errors.push({
        path,
        message: `Referenced schema '${schema.$ref}' not found`,
      });
      return errors;
    }
    return validateObject(value, refSchema, path);
  }

  // Check type
  if (schema.type) {
    const typeError = validateType(value, schema.type, path);
    if (typeError) {
      errors.push(typeError);
      return errors;
    }
  }

  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (value && !(field in value)) {
        errors.push({
          path: path ? `${path}.${field}` : field,
          message: 'Required field missing',
        });
      }
    }
  }

  // Validate properties
  if (schema.properties && typeof value === 'object' && value !== null) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const propPath = path ? `${path}.${key}` : key;
      const propValue = value[key];

      if (propValue === undefined && propSchema.default !== undefined) {
        value[key] = propSchema.default;
        continue;
      }

      if (propValue !== undefined) {
        errors.push(...validateObject(propValue, propSchema, propPath));
      }
    }
  }

  // Validate number constraints
  if (typeof value === 'number' && schema.type === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({
        path,
        message: `Value must be at least ${schema.minimum}`,
      });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `Value must not exceed ${schema.maximum}` });
    }
  }

  return errors;
}

/**
 * Validates value type.
 * @private
 * @param {*} value - Value to check.
 * @param {string|Array<string>} type - Expected type(s).
 * @param {string} path - Current path.
 * @returns {Object|null} Error object or null.
 */
function validateType(value, type, path) {
  const types = Array.isArray(type) ? type : [type];
  const actualType = getType(value);

  if (!types.includes(actualType)) {
    return {
      path,
      message: `Expected type '${types.join(' or ')}', got '${actualType}'`,
    };
  }
  return null;
}

/**
 * Gets the type of a value.
 * @private
 * @param {*} value - Value to check.
 * @returns {string} Type name.
 */
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
