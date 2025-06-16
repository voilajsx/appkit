/**
 * Core error class with built-in error creation and middleware methods
 * @module @voilajsx/appkit/error
 * @file src/error/error.js
 */

/**
 * Error class with built-in error creation and middleware functionality
 */
export class ErrorClass {
  /**
   * Creates a new Error instance
   * @param {object} [config={}] - Error configuration
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Creates a 400 Bad Request error
   * @param {string} [message] - Error message
   * @returns {Error} Error with statusCode 400
   */
  badRequest(message) {
    const error = new Error(message || this.config.messages.badRequest);
    error.statusCode = 400;
    error.type = 'BAD_REQUEST';
    return error;
  }

  /**
   * Creates a 401 Unauthorized error
   * @param {string} [message] - Error message
   * @returns {Error} Error with statusCode 401
   */
  unauthorized(message) {
    const error = new Error(message || this.config.messages.unauthorized);
    error.statusCode = 401;
    error.type = 'UNAUTHORIZED';
    return error;
  }

  /**
   * Creates a 403 Forbidden error
   * @param {string} [message] - Error message
   * @returns {Error} Error with statusCode 403
   */
  forbidden(message) {
    const error = new Error(message || this.config.messages.forbidden);
    error.statusCode = 403;
    error.type = 'FORBIDDEN';
    return error;
  }

  /**
   * Creates a 404 Not Found error
   * @param {string} [message] - Error message
   * @returns {Error} Error with statusCode 404
   */
  notFound(message) {
    const error = new Error(message || this.config.messages.notFound);
    error.statusCode = 404;
    error.type = 'NOT_FOUND';
    return error;
  }

  /**
   * Creates a 409 Conflict error
   * @param {string} [message] - Error message
   * @returns {Error} Error with statusCode 409
   */
  conflict(message) {
    const error = new Error(message || this.config.messages.conflict);
    error.statusCode = 409;
    error.type = 'CONFLICT';
    return error;
  }

  /**
   * Creates a 500 Server Error
   * @param {string} [message] - Error message
   * @returns {Error} Error with statusCode 500
   */
  serverError(message) {
    const error = new Error(message || this.config.messages.serverError);
    error.statusCode = 500;
    error.type = 'SERVER_ERROR';
    return error;
  }

  /**
   * Creates production-ready error handling middleware
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.showStack] - Show stack traces
   * @param {boolean} [options.logErrors] - Log errors
   * @returns {Function} Express error middleware
   */
  handleErrors(options = {}) {
    // Use instance config as defaults, allow options to override
    const showStack =
      options.showStack !== undefined
        ? options.showStack
        : this.config.middleware.showStack;

    const logErrors =
      options.logErrors !== undefined
        ? options.logErrors
        : this.config.middleware.logErrors;

    return (error, req, res, next) => {
      const statusCode = error.statusCode || 500;

      // Environment-aware error logging
      if (logErrors && statusCode >= 500) {
        console.error(`[${new Date().toISOString()}] ${error.message}`);
        if (showStack) {
          console.error(error.stack);
        }
      }

      // Production-safe error response
      const response = {
        error: error.type || 'ERROR',
        message:
          statusCode === 500 && !this.config.environment.isDevelopment
            ? 'Server error'
            : error.message,
      };

      // Include stack trace in development
      if (showStack && this.config.environment.isDevelopment) {
        response.stack = error.stack;
      }

      res.status(statusCode).json(response);
    };
  }

  /**
   * Wraps async route handlers to catch errors
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Wrapped function
   */
  asyncRoute(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
