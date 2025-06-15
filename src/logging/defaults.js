/**
 * Smart defaults and environment validation for logging
 * @module @voilajsx/appkit/logging
 * @file src/logging/defaults.js
 */

/**
 * Gets smart defaults using VOILA_LOGGING_* environment variables
 * @returns {object} Configuration object with smart defaults
 */
export function getSmartDefaults() {
  validateEnvironment();

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    level:
      process.env.VOILA_LOGGING_LEVEL ||
      (isProduction ? 'warn' : isDevelopment ? 'debug' : 'info'),

    dirname: process.env.VOILA_LOGGING_DIR || 'logs',
    filename: process.env.VOILA_LOGGING_FILE || 'app.log',

    retentionDays:
      parseInt(process.env.VOILA_LOGGING_RETENTION_DAYS) ||
      (isProduction ? 30 : 7),

    maxSize:
      parseInt(process.env.VOILA_LOGGING_MAX_SIZE) ||
      (isProduction ? 50 * 1024 * 1024 : 10 * 1024 * 1024),

    enableFileLogging:
      process.env.VOILA_LOGGING_FILE_ENABLED !== 'false' && !isTest,

    colorize: process.env.VOILA_LOGGING_COLORIZE !== 'false' && !isProduction,
    prettyPrint: process.env.VOILA_LOGGING_PRETTY !== 'false' && isDevelopment,

    defaultMeta: {
      service: process.env.VOILA_SERVICE_NAME || 'app',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  };
}

function validateEnvironment() {
  const level = process.env.VOILA_LOGGING_LEVEL;
  if (level && !['debug', 'info', 'warn', 'error'].includes(level)) {
    throw new Error(
      `Invalid VOILA_LOGGING_LEVEL: "${level}". Must be one of: debug, info, warn, error`
    );
  }

  const maxSize = process.env.VOILA_LOGGING_MAX_SIZE;
  if (maxSize) {
    const size = parseInt(maxSize);
    if (isNaN(size) || size < 1024 || size > 1073741824) {
      throw new Error(
        `Invalid VOILA_LOGGING_MAX_SIZE: "${maxSize}". Must be between 1024 (1KB) and 1073741824 (1GB)`
      );
    }
  }

  const retentionDays = process.env.VOILA_LOGGING_RETENTION_DAYS;
  if (retentionDays) {
    const days = parseInt(retentionDays);
    if (isNaN(days) || days < 0 || days > 3650) {
      throw new Error(
        `Invalid VOILA_LOGGING_RETENTION_DAYS: "${retentionDays}". Must be between 0 and 3650`
      );
    }
  }
}
