/**
 * @voilajsx/appkit - Validation module
 * @module @voilajsx/appkit/validation
 */

export {
  validate,
  createValidator,
  validateAsync,
  createAsyncValidator,
  // Essential validators
  isEmail,
  isUrl,
  isAlphanumeric,
} from './validators.js';

export {
  sanitize,
  sanitizeString,
  sanitizeNumber,
  sanitizeObject,
} from './sanitizers.js';

export { commonSchemas, createValidationSchema } from './schemas.js';

export { ValidationError } from './errors.js';

/**
 * Essential utility - pipeline for chaining validators
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
};
