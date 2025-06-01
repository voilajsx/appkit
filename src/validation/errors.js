/**
 * @voilajsx/appkit - Validation errors
 * @module @voilajsx/appkit/validation/errors
 * @file src/validation/errors.js
 */

/**
 * Validation error class with enhanced error handling and i18n support
 */
export class ValidationError extends Error {
  constructor(message, errors = [], options = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.code = options.code || 'VALIDATION_ERROR';
    this.statusCode = options.statusCode || 400;
    this.locale = options.locale || 'en';

    // Maintain proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Get formatted error messages
   * @param {Object} [options] - Formatting options
   * @param {boolean} [options.includePath=true] - Include field path
   * @param {string} [options.separator=': '] - Path separator
   * @returns {Array<string>} Error messages
   */
  getMessages(options = {}) {
    const { includePath = true, separator = ': ' } = options;

    return this.errors.map((error) => {
      if (includePath && error.path) {
        return `${error.path}${separator}${error.message}`;
      }
      return error.message;
    });
  }

  /**
   * Get errors by field path
   * @param {string} path - Field path
   * @returns {Array<Object>} Field errors
   */
  getFieldErrors(path) {
    return this.errors.filter((error) => error.path === path);
  }

  /**
   * Get first error for a field
   * @param {string} path - Field path
   * @returns {Object|null} First error or null
   */
  getFirstFieldError(path) {
    return this.errors.find((error) => error.path === path) || null;
  }

  /**
   * Check if field has errors
   * @param {string} path - Field path
   * @returns {boolean} Has errors
   */
  hasFieldErrors(path) {
    return this.errors.some((error) => error.path === path);
  }

  /**
   * Get errors grouped by field path
   * @returns {Object} Errors grouped by path
   */
  getErrorsByPath() {
    const grouped = {};

    for (const error of this.errors) {
      const path = error.path || 'root';
      if (!grouped[path]) {
        grouped[path] = [];
      }
      grouped[path].push(error);
    }

    return grouped;
  }

  /**
   * Get all error paths
   * @returns {Array<string>} Array of paths with errors
   */
  getErrorPaths() {
    return [...new Set(this.errors.map((error) => error.path).filter(Boolean))];
  }

  /**
   * Get error count
   * @returns {number} Number of errors
   */
  getErrorCount() {
    return this.errors.length;
  }

  /**
   * Check if there are any errors
   * @returns {boolean} Has any errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Filter errors by type
   * @param {string} type - Error type to filter by
   * @returns {Array<Object>} Filtered errors
   */
  getErrorsByType(type) {
    return this.errors.filter((error) => error.type === type);
  }

  /**
   * Get formatted error message for display
   * @param {Object} [options] - Formatting options
   * @param {number} [options.maxErrors=5] - Maximum errors to show
   * @param {boolean} [options.showCount=true] - Show total error count
   * @returns {string} Formatted error message
   */
  getFormattedMessage(options = {}) {
    const { maxErrors = 5, showCount = true } = options;
    const messages = this.getMessages();

    let result = messages.slice(0, maxErrors).join('\n');

    if (showCount && messages.length > maxErrors) {
      result += `\n... and ${messages.length - maxErrors} more error(s)`;
    }

    return result;
  }

  /**
   * Convert to plain object for API responses
   * @param {Object} [options] - Serialization options
   * @param {boolean} [options.includeStack=false] - Include stack trace
   * @returns {Object} Error object
   */
  toJSON(options = {}) {
    const { includeStack = false } = options;

    const result = {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      errors: this.errors,
      errorCount: this.getErrorCount(),
    };

    if (includeStack) {
      result.stack = this.stack;
    }

    return result;
  }

  /**
   * Create ValidationError from Joi-like error
   * @param {Object} joiError - Joi error object
   * @returns {ValidationError} ValidationError instance
   */
  static fromJoi(joiError) {
    const errors =
      joiError.details?.map((detail) => ({
        path: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
        value: detail.context?.value,
      })) || [];

    return new ValidationError(joiError.message, errors);
  }

  /**
   * Create ValidationError from express-validator errors
   * @param {Array} validationErrors - express-validator errors
   * @returns {ValidationError} ValidationError instance
   */
  static fromExpressValidator(validationErrors) {
    const errors = validationErrors.map((error) => ({
      path: error.param || error.path,
      message: error.msg,
      type: error.type || 'field',
      value: error.value,
      location: error.location,
    }));

    const message = `Validation failed with ${errors.length} error(s)`;
    return new ValidationError(message, errors);
  }

  /**
   * Create ValidationError for a single field
   * @param {string} path - Field path
   * @param {string} message - Error message
   * @param {*} [value] - Field value
   * @param {string} [type] - Error type
   * @returns {ValidationError} ValidationError instance
   */
  static forField(path, message, value, type = 'validation') {
    const error = {
      path,
      message,
      type,
      value,
    };

    return new ValidationError(`Validation failed for field '${path}'`, [
      error,
    ]);
  }

  /**
   * Create ValidationError for required field
   * @param {string} path - Field path
   * @returns {ValidationError} ValidationError instance
   */
  static required(path) {
    return ValidationError.forField(
      path,
      'This field is required',
      undefined,
      'required'
    );
  }

  /**
   * Create ValidationError for invalid type
   * @param {string} path - Field path
   * @param {string} expected - Expected type
   * @param {string} actual - Actual type
   * @returns {ValidationError} ValidationError instance
   */
  static invalidType(path, expected, actual) {
    const message = `Expected ${expected}, got ${actual}`;
    return ValidationError.forField(path, message, undefined, 'type');
  }
}
