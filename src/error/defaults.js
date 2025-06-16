/**
 * Smart defaults and environment validation for error handling
 * @module @voilajsx/appkit/error
 * @file src/error/defaults.js
 */

/**
 * Gets smart defaults using VOILA_ERROR_* environment variables
 * @returns {object} Configuration object with smart defaults
 */
export function getSmartDefaults() {
  validateEnvironment();

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    // Error message defaults
    messages: {
      badRequest: 'Bad Request',
      unauthorized: process.env.VOILA_AUTH_MESSAGE || 'Authentication required',
      forbidden: 'Access denied',
      notFound: 'Not found',
      conflict: 'Conflict',
      serverError: isDevelopment ? 'Internal server error' : 'Server error',
    },

    // Error handling behavior
    middleware: {
      showStack: process.env.VOILA_ERROR_STACK === 'true' || isDevelopment,
      logErrors: process.env.VOILA_ERROR_LOG !== 'false',
    },

    // Environment info
    environment: {
      isDevelopment,
      isProduction,
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  };
}

/**
 * Validates environment variables
 */
function validateEnvironment() {
  // Validate VOILA_ERROR_STACK
  const errorStack = process.env.VOILA_ERROR_STACK;
  if (errorStack && !['true', 'false'].includes(errorStack)) {
    throw new Error(
      `Invalid VOILA_ERROR_STACK: "${errorStack}". Must be "true" or "false"`
    );
  }

  // Validate VOILA_ERROR_LOG
  const errorLog = process.env.VOILA_ERROR_LOG;
  if (errorLog && !['true', 'false'].includes(errorLog)) {
    throw new Error(
      `Invalid VOILA_ERROR_LOG: "${errorLog}". Must be "true" or "false"`
    );
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    console.warn(
      `Unusual NODE_ENV: "${nodeEnv}". Expected: development, production, or test`
    );
  }
}
