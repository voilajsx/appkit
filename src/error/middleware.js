/**
 * @voilajsx/appkit - Error handling middleware
 * @module @voilajsx/appkit/error/middleware
 * @file src/error/middleware.js
 *
 * Production-ready middleware for Express error handling.
 */

/**
 * Creates production-ready error handling middleware
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.showStack] - Show stack traces (uses VOILA_ERROR_STACK env var)
 * @param {boolean} [options.logErrors] - Log errors (uses VOILA_ERROR_LOG env var)
 * @returns {Function} Express error middleware
 */
export function handleErrors(options = {}) {
  // Environment → Argument → Default (auth module pattern)
  const isDev = process.env.NODE_ENV === 'development';
  const showStack =
    options.showStack !== undefined
      ? options.showStack
      : process.env.VOILA_ERROR_STACK === 'true' || isDev;

  const logErrors =
    options.logErrors !== false && process.env.VOILA_ERROR_LOG !== 'false';

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
      message: statusCode === 500 && !isDev ? 'Server error' : error.message,
    };

    // Include stack trace in development
    if (showStack && isDev) {
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
export function asyncRoute(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
