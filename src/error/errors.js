/**
 * @voilajsx/appkit - Simple error utilities
 * @module @voilajsx/appkit/error/errors
 * @file src/error/errors.js
 */

/**
 * Simple error types
 */
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  AUTH: 'AUTH_ERROR',
  SERVER: 'SERVER_ERROR',
};

/**
 * Custom application error class
 * @extends Error
 */
export class AppError extends Error {
  /**
   * Creates an application error
   * @param {string} type - Error type from ErrorTypes
   * @param {string} message - Error message
   * @param {Object} [details] - Additional error details
   */
  constructor(type, message, details = null) {
    super(message);

    this.name = 'AppError';
    this.type = type;
    this.message = message;
    this.details = details;
    this.statusCode = this.getStatusCode(type);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Gets HTTP status code for error type
   * @param {string} type - Error type
   * @returns {number} HTTP status code
   */
  getStatusCode(type) {
    const statusCodes = {
      [ErrorTypes.VALIDATION]: 400,
      [ErrorTypes.NOT_FOUND]: 404,
      [ErrorTypes.AUTH]: 401,
      [ErrorTypes.SERVER]: 500,
    };
    return statusCodes[type] || 500;
  }

  /**
   * Converts error to JSON-serializable object
   * @returns {Object} Error object
   */
  toJSON() {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Creates a validation error
 * @param {string} message - Error message
 * @param {Object} [details] - Validation details
 * @returns {AppError} Validation error instance
 */
export function validationError(message, details = null) {
  return new AppError(ErrorTypes.VALIDATION, message, details);
}

/**
 * Creates a not found error
 * @param {string} [message='Not found'] - Error message
 * @returns {AppError} Not found error instance
 */
export function notFoundError(message = 'Not found') {
  return new AppError(ErrorTypes.NOT_FOUND, message);
}

/**
 * Creates an authentication error
 * @param {string} [message='Authentication failed'] - Error message
 * @returns {AppError} Authentication error instance
 */
export function authError(message = 'Authentication failed') {
  return new AppError(ErrorTypes.AUTH, message);
}

/**
 * Creates a server error
 * @param {string} [message='Server error'] - Error message
 * @param {Object} [details] - Error details
 * @returns {AppError} Server error instance
 */
export function serverError(message = 'Server error', details = null) {
  return new AppError(ErrorTypes.SERVER, message, details);
}
