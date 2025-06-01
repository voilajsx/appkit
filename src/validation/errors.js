/**
 * @voilajsx/appkit - Validation errors
 * @module @voilajsx/appkit/validation/errors
 * @file src/validation/errors.js
 */

/**
 * Minimal validation error class
 */
export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;

    // Maintain proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Get formatted error messages
   * @returns {Array<string>} Error messages
   */
  getMessages() {
    return this.errors.map((error) => {
      if (error.path) {
        return `${error.path}: ${error.message}`;
      }
      return error.message;
    });
  }

  /**
   * Check if there are any errors
   * @returns {boolean} Has any errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }
}
