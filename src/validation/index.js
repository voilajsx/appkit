/**
 * @voilajsx/appkit - Validation module
 * @module @voilajsx/appkit/validation
 */

export {
  validate,
  createValidator,
  validateAsync,
  createAsyncValidator,
  // Common validators
  isEmail,
  isUrl,
  isUuid,
  isCreditCard,
  isPhoneNumber,
  isAlphanumeric,
  isAlpha,
  isNumeric,
  isHexColor,
  isIpAddress,
  isSlug,
  isStrongPassword,
  isJSON,
  isBase64,
  isObjectId,
  isCreditCardExpiry,
  isSemVer,
} from './validators.js';

export {
  sanitize,
  sanitizeHtml,
  sanitizeString,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeArray,
  sanitizeObject,
  createSanitizer,
  // Common sanitizers
  sanitizeEmail,
  sanitizeUsername,
  sanitizePassword,
  sanitizePhone,
  sanitizeUrl,
  sanitizeSlug,
  sanitizeSearch,
  sanitizeCreditCard,
  sanitizePostalCode,
  sanitizeTags,
  sanitizeHexColor,
  sanitizeFilename,
  sanitizeIpAddress,
} from './sanitizers.js';

export {
  commonSchemas,
  createSchema,
  mergeSchemas,
  extendSchema,
  createConditionalSchema,
  createEnumSchema,
  createArraySchema,
  createModelSchema,
  createCrudSchemas,
  getSchema,
  getSchemaNames,
  hasSchema,
  allSchemas,
  // Pre-built schemas
  userRegistrationSchema,
  userLoginSchema,
  userProfileSchema,
  passwordResetSchema,
  changePasswordSchema,
  productSchema,
  orderSchema,
  invoiceSchema,
  commentSchema,
  reviewSchema,
  apiKeySchema,
  webhookSchema,
  subscriptionSchema,
  supportTicketSchema,
  blogPostSchema,
  eventSchema,
  newsletterSubscriptionSchema,
  settingsSchema,
  migrationSchema,
  apiResponseSchema,
  performanceMetricSchema,
} from './schemas.js';

export { ValidationError } from './errors.js';

/**
 * Validation module utilities
 */
export const utils = {
  /**
   * Create a validation pipeline with multiple validators
   * @param {...Function} validators - Validator functions
   * @returns {Function} Combined validator
   */
  pipeline: (...validators) => {
    return async (data, options = {}) => {
      let result = data;
      const allErrors = [];

      for (const validator of validators) {
        try {
          if (typeof validator === 'function') {
            const validationResult = await validator(result, options);

            if (validationResult && typeof validationResult === 'object') {
              if (!validationResult.valid) {
                allErrors.push(...(validationResult.errors || []));
                if (options.abortEarly) break;
              } else {
                result = validationResult.value || result;
              }
            }
          }
        } catch (error) {
          allErrors.push({
            path: '',
            message: error.message,
            type: 'pipeline',
            value: result,
          });
          if (options.abortEarly) break;
        }
      }

      return {
        valid: allErrors.length === 0,
        errors: allErrors,
        value: result,
      };
    };
  },

  /**
   * Create a conditional validator
   * @param {Function|Object} condition - Condition to check
   * @param {Function} thenValidator - Validator to use if condition is true
   * @param {Function} [elseValidator] - Validator to use if condition is false
   * @returns {Function} Conditional validator
   */
  when: (condition, thenValidator, elseValidator = null) => {
    return async (data, options = {}) => {
      let shouldApplyThen = false;

      if (typeof condition === 'function') {
        shouldApplyThen = await condition(data, options);
      } else if (typeof condition === 'object') {
        const { path, is, exists } = condition;
        let targetValue = data;

        if (path) {
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
          shouldApplyThen = (targetValue !== undefined) === exists;
        } else if (is !== undefined) {
          shouldApplyThen = targetValue === is;
        }
      }

      const validator = shouldApplyThen ? thenValidator : elseValidator;

      if (validator && typeof validator === 'function') {
        return await validator(data, options);
      }

      return { valid: true, value: data, errors: [] };
    };
  },

  /**
   * Create a validator that applies different schemas based on a discriminator field
   * @param {string} discriminatorField - Field name to use for discrimination
   * @param {Object} schemaMap - Map of discriminator values to schemas
   * @param {Object} [fallbackSchema] - Schema to use if discriminator value not found
   * @returns {Function} Discriminator validator
   */
  discriminator: (discriminatorField, schemaMap, fallbackSchema = null) => {
    return async (data, options = {}) => {
      if (!data || typeof data !== 'object') {
        return {
          valid: false,
          errors: [
            {
              path: '',
              message: 'Data must be an object for discriminator validation',
              type: 'discriminator',
              value: data,
            },
          ],
          value: data,
        };
      }

      const discriminatorValue = data[discriminatorField];
      const schema = schemaMap[discriminatorValue] || fallbackSchema;

      if (!schema) {
        return {
          valid: false,
          errors: [
            {
              path: discriminatorField,
              message: `Unknown discriminator value: ${discriminatorValue}`,
              type: 'discriminator',
              value: discriminatorValue,
            },
          ],
          value: data,
        };
      }

      return await validate(data, schema, options);
    };
  },

  /**
   * Create a validator that requires at least one of the specified fields
   * @param {string[]} fields - Field names
   * @param {string} [message] - Custom error message
   * @returns {Function} At least one validator
   */
  atLeastOne: (fields, message = null) => {
    return (data, options = {}) => {
      if (!data || typeof data !== 'object') {
        return {
          valid: false,
          errors: [
            {
              path: '',
              message: 'Data must be an object',
              type: 'atLeastOne',
              value: data,
            },
          ],
          value: data,
        };
      }

      const hasAtLeastOne = fields.some(
        (field) =>
          data[field] !== undefined &&
          data[field] !== null &&
          data[field] !== ''
      );

      if (!hasAtLeastOne) {
        return {
          valid: false,
          errors: [
            {
              path: '',
              message:
                message ||
                `At least one of the following fields is required: ${fields.join(', ')}`,
              type: 'atLeastOne',
              value: data,
            },
          ],
          value: data,
        };
      }

      return { valid: true, value: data, errors: [] };
    };
  },

  /**
   * Create a validator that ensures mutual exclusivity of fields
   * @param {string[]} fields - Field names that are mutually exclusive
   * @param {string} [message] - Custom error message
   * @returns {Function} Mutually exclusive validator
   */
  mutuallyExclusive: (fields, message = null) => {
    return (data, options = {}) => {
      if (!data || typeof data !== 'object') {
        return {
          valid: false,
          errors: [
            {
              path: '',
              message: 'Data must be an object',
              type: 'mutuallyExclusive',
              value: data,
            },
          ],
          value: data,
        };
      }

      const presentFields = fields.filter(
        (field) =>
          data[field] !== undefined &&
          data[field] !== null &&
          data[field] !== ''
      );

      if (presentFields.length > 1) {
        return {
          valid: false,
          errors: [
            {
              path: '',
              message:
                message ||
                `Only one of the following fields can be present: ${fields.join(', ')}. Found: ${presentFields.join(', ')}`,
              type: 'mutuallyExclusive',
              value: data,
            },
          ],
          value: data,
        };
      }

      return { valid: true, value: data, errors: [] };
    };
  },

  /**
   * Create a cross-field validation function
   * @param {Function} validationFn - Function that receives the entire object and returns true or error message
   * @returns {Function} Cross-field validator
   */
  crossField: (validationFn) => {
    return async (data, options = {}) => {
      try {
        const result = await validationFn(data, options);

        if (result === true) {
          return { valid: true, value: data, errors: [] };
        }

        return {
          valid: false,
          errors: [
            {
              path: '',
              message:
                typeof result === 'string'
                  ? result
                  : 'Cross-field validation failed',
              type: 'crossField',
              value: data,
            },
          ],
          value: data,
        };
      } catch (error) {
        return {
          valid: false,
          errors: [
            {
              path: '',
              message: error.message,
              type: 'crossField',
              value: data,
            },
          ],
          value: data,
        };
      }
    };
  },

  /**
   * Create a validator that transforms data before validation
   * @param {Function} transformFn - Transformation function
   * @param {Object} schema - Schema to validate transformed data
   * @returns {Function} Transform validator
   */
  transform: (transformFn, schema) => {
    return async (data, options = {}) => {
      try {
        const transformed = await transformFn(data, options);
        return await validate(transformed, schema, options);
      } catch (error) {
        return {
          valid: false,
          errors: [
            {
              path: '',
              message: `Transform failed: ${error.message}`,
              type: 'transform',
              value: data,
            },
          ],
          value: data,
        };
      }
    };
  },

  /**
   * Create a validator with custom error messages
   * @param {Object} schema - Base schema
   * @param {Object} messages - Custom error messages
   * @returns {Object} Schema with custom messages
   */
  withMessages: (schema, messages) => {
    const customSchema = { ...schema };

    // Add custom validation function that provides custom messages
    const originalValidate = customSchema.validate;
    customSchema.validate = function (value, context) {
      try {
        if (originalValidate && typeof originalValidate === 'function') {
          const result = originalValidate.call(this, value, context);
          if (result !== true && messages.custom) {
            return messages.custom;
          }
          return result;
        }

        // Apply custom messages based on validation type
        if (
          customSchema.required &&
          (value === undefined || value === null) &&
          messages.required
        ) {
          return messages.required;
        }

        if (
          customSchema.minLength &&
          typeof value === 'string' &&
          value.length < customSchema.minLength &&
          messages.minLength
        ) {
          return messages.minLength.replace('{min}', customSchema.minLength);
        }

        if (
          customSchema.maxLength &&
          typeof value === 'string' &&
          value.length > customSchema.maxLength &&
          messages.maxLength
        ) {
          return messages.maxLength.replace('{max}', customSchema.maxLength);
        }

        if (
          customSchema.min &&
          typeof value === 'number' &&
          value < customSchema.min &&
          messages.min
        ) {
          return messages.min.replace('{min}', customSchema.min);
        }

        if (
          customSchema.max &&
          typeof value === 'number' &&
          value > customSchema.max &&
          messages.max
        ) {
          return messages.max.replace('{max}', customSchema.max);
        }

        if (customSchema.email && !isEmail(value) && messages.email) {
          return messages.email;
        }

        if (customSchema.url && !isUrl(value) && messages.url) {
          return messages.url;
        }

        return true;
      } catch (error) {
        return messages.error || error.message;
      }
    };

    return customSchema;
  },
};

/**
 * Quick validation helpers for common use cases
 */
export const quick = {
  /**
   * Quick email validation
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  email: (email) => isEmail(email),

  /**
   * Quick password strength check
   * @param {string} password - Password to check
   * @returns {boolean} Is strong password
   */
  password: (password) => isStrongPassword(password),

  /**
   * Quick URL validation
   * @param {string} url - URL to validate
   * @returns {boolean} Is valid URL
   */
  url: (url) => isUrl(url),

  /**
   * Quick phone validation
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Is valid phone
   */
  phone: (phone) => isPhoneNumber(phone),

  /**
   * Quick object validation with simple schema
   * @param {Object} data - Data to validate
   * @param {Object} rules - Simple validation rules
   * @returns {Object} Validation result
   */
  object: (data, rules) => {
    const schema = {
      type: 'object',
      properties: {},
      required: [],
    };

    for (const [key, rule] of Object.entries(rules)) {
      if (typeof rule === 'string') {
        // Simple type validation
        schema.properties[key] = { type: rule };
      } else if (Array.isArray(rule)) {
        // [type, required]
        schema.properties[key] = { type: rule[0] };
        if (rule[1]) {
          schema.required.push(key);
        }
      } else {
        // Full schema object
        schema.properties[key] = rule;
        if (rule.required) {
          schema.required.push(key);
        }
      }
    }

    return validate(data, schema);
  },

  /**
   * Quick array validation
   * @param {Array} array - Array to validate
   * @param {Object} itemSchema - Schema for array items
   * @returns {Object} Validation result
   */
  array: (array, itemSchema) => {
    return validate(array, {
      type: 'array',
      items: itemSchema,
    });
  },
};
