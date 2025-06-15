/**
 * @voilajsx/appkit - Production-ready error handling
 * @module @voilajsx/appkit/error
 * @file src/error/index.js
 *
 * Environment-first error handling with smart defaults for production APIs.
 */

// Error creation functions (6)
export {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from './errors.js';

// Error handling middleware (2)
export { handleErrors, asyncRoute } from './middleware.js';
