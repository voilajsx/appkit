/**
 * @voilajsx/appkit - Error creation functions
 * @module @voilajsx/appkit/error/errors
 * @file src/error/errors.js
 *
 * Production-ready error creation with semantic HTTP status codes.
 */

/**
 * Creates a 400 Bad Request error
 * @param {string} [message='Bad Request'] - Error message
 * @returns {Error} Error with statusCode 400
 */
export function badRequest(message = 'Bad Request') {
  const error = new Error(message);
  error.statusCode = 400;
  error.type = 'BAD_REQUEST';
  return error;
}

/**
 * Creates a 401 Unauthorized error
 * @param {string} [message] - Error message (uses VOILA_AUTH_MESSAGE env var if not provided)
 * @returns {Error} Error with statusCode 401
 */
export function unauthorized(message) {
  const defaultMessage =
    process.env.VOILA_AUTH_MESSAGE || 'Authentication required';
  const error = new Error(message || defaultMessage);
  error.statusCode = 401;
  error.type = 'UNAUTHORIZED';
  return error;
}

/**
 * Creates a 403 Forbidden error
 * @param {string} [message='Access denied'] - Error message
 * @returns {Error} Error with statusCode 403
 */
export function forbidden(message = 'Access denied') {
  const error = new Error(message);
  error.statusCode = 403;
  error.type = 'FORBIDDEN';
  return error;
}

/**
 * Creates a 404 Not Found error
 * @param {string} [message='Not found'] - Error message
 * @returns {Error} Error with statusCode 404
 */
export function notFound(message = 'Not found') {
  const error = new Error(message);
  error.statusCode = 404;
  error.type = 'NOT_FOUND';
  return error;
}

/**
 * Creates a 409 Conflict error
 * @param {string} [message='Conflict'] - Error message
 * @returns {Error} Error with statusCode 409
 */
export function conflict(message = 'Conflict') {
  const error = new Error(message);
  error.statusCode = 409;
  error.type = 'CONFLICT';
  return error;
}

/**
 * Creates a 500 Server Error
 * @param {string} [message] - Error message (environment-aware defaults)
 * @returns {Error} Error with statusCode 500
 */
export function serverError(message) {
  const isDev = process.env.NODE_ENV === 'development';
  const defaultMessage = isDev ? 'Internal server error' : 'Server error';

  const error = new Error(message || defaultMessage);
  error.statusCode = 500;
  error.type = 'SERVER_ERROR';
  return error;
}
