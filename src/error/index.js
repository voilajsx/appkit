/**
 * @voilajs/appkit - Error module
 * @module @voilajs/appkit/error
 */

// Main exports file
export { 
    AppError, 
    ErrorTypes, 
    createError, 
    validationError, 
    notFoundError, 
    authenticationError, 
    authorizationError 
  } from './errors.js';
  export { formatErrorResponse, createErrorHandler } from './handlers.js';