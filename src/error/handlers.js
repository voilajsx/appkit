/**
 * @voilajsx/appkit - Error handling utilities
 * @module @voilajsx/appkit/error/handlers
 * @file src/error/handlers.js
 */

import { AppError, ErrorTypes } from './errors.js';

/**
 * Simple error handler middleware
 * @returns {Function} Express error middleware
 */
export function errorHandler() {
  return (error, req, res, next) => {
    // Handle AppError instances
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.toJSON());
    }

    // Handle validation errors from common libraries
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        type: ErrorTypes.VALIDATION,
        message: 'Validation failed',
        details: error.message,
      });
    }

    // Handle invalid ID format (MongoDB/Mongoose)
    if (error.name === 'CastError') {
      return res.status(400).json({
        type: ErrorTypes.VALIDATION,
        message: 'Invalid ID format',
      });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        type: ErrorTypes.AUTH,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        type: ErrorTypes.AUTH,
        message: 'Token expired',
      });
    }

    // Handle duplicate key errors (MongoDB)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(409).json({
        type: ErrorTypes.VALIDATION,
        message: `Duplicate value for ${field}`,
      });
    }

    // Default server error
    res.status(500).json({
      type: ErrorTypes.SERVER,
      message:
        process.env.NODE_ENV === 'production' ? 'Server error' : error.message,
    });
  };
}

/**
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Creates a 404 not found handler middleware
 * @returns {Function} Express middleware
 */
export function notFoundHandler() {
  return (req, res, next) => {
    const error = new AppError(
      ErrorTypes.NOT_FOUND,
      `Route ${req.method} ${req.url} not found`
    );
    next(error);
  };
}
