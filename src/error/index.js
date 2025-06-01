/**
 * @voilajsx/appkit - Error module
 * @module @voilajsx/appkit/error
 * @file src/error/index.js
 */

// Error classes and types
export {
  AppError,
  ErrorTypes,
  validationError,
  notFoundError,
  authError,
  serverError,
} from './errors.js';

// Error handling utilities
export { errorHandler, asyncHandler, notFoundHandler } from './handlers.js';
