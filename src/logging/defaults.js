/**
 * Minimal smart defaults for logging with essential environment variables only
 * @module @voilajsx/appkit/logging
 * @file src/logging/defaults.js
 */

/**
 * Gets smart defaults using minimal VOILA_LOGGING_* environment variables
 * @returns {object} Configuration object with smart defaults and transport config
 */
export function getSmartDefaults() {
  validateEnvironment();

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    // Core logging configuration
    level:
      process.env.VOILA_LOGGING_LEVEL ||
      (isProduction ? 'warn' : isDevelopment ? 'debug' : 'info'),

    defaultMeta: {
      service: process.env.VOILA_SERVICE_NAME || 'app',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },

    // Transport configuration - auto-detect what's enabled
    transports: getEnabledTransports(),

    // Console transport config
    console: {
      enabled: !isTest,
      colorize: !isProduction,
      prettyPrint: isDevelopment,
    },

    // File transport config
    file: {
      enabled: !isTest,
      dirname: process.env.VOILA_LOGGING_DIR || 'logs',
      filename: 'app.log',
      retentionDays: isProduction ? 30 : 7,
      maxSize: isProduction ? 50 * 1024 * 1024 : 10 * 1024 * 1024,
    },

    // Database transport config
    database: {
      enabled: !!(process.env.DATABASE_URL || process.env.VOILA_LOGGING_DB_URL),
      url: process.env.VOILA_LOGGING_DB_URL || process.env.DATABASE_URL,
      table: 'logs',
    },

    // HTTP transport config
    http: {
      enabled: !!process.env.VOILA_LOGGING_HTTP_URL,
      url: process.env.VOILA_LOGGING_HTTP_URL,
      headers: { 'Content-Type': 'application/json' },
    },

    // Webhook transport config
    webhook: {
      enabled: !!process.env.VOILA_LOGGING_WEBHOOK_URL,
      url: process.env.VOILA_LOGGING_WEBHOOK_URL,
      level: 'error', // Only send errors to webhooks
      headers: { 'Content-Type': 'application/json' },
    },
  };
}

/**
 * Determines which transports are enabled based on environment
 * @returns {string[]} Array of enabled transport names
 */
function getEnabledTransports() {
  const transports = [];

  // Console and File - always enabled except in test
  if (process.env.NODE_ENV !== 'test') {
    transports.push('console', 'file');
  }

  // Database - auto-enable if URL is available
  if (process.env.DATABASE_URL || process.env.VOILA_LOGGING_DB_URL) {
    transports.push('database');
  }

  // HTTP - only if URL is provided
  if (process.env.VOILA_LOGGING_HTTP_URL) {
    transports.push('http');
  }

  // Webhook - only if URL is provided
  if (process.env.VOILA_LOGGING_WEBHOOK_URL) {
    transports.push('webhook');
  }

  return transports;
}

/**
 * Validates essential environment variables
 */
function validateEnvironment() {
  // Validate log level
  const level = process.env.VOILA_LOGGING_LEVEL;
  if (level && !['debug', 'info', 'warn', 'error'].includes(level)) {
    throw new Error(
      `Invalid VOILA_LOGGING_LEVEL: "${level}". Must be one of: debug, info, warn, error`
    );
  }

  // Validate URLs if provided
  if (
    process.env.VOILA_LOGGING_HTTP_URL &&
    !isValidUrl(process.env.VOILA_LOGGING_HTTP_URL)
  ) {
    throw new Error(
      `Invalid VOILA_LOGGING_HTTP_URL: "${process.env.VOILA_LOGGING_HTTP_URL}". Must be a valid HTTP/HTTPS URL`
    );
  }

  if (
    process.env.VOILA_LOGGING_WEBHOOK_URL &&
    !isValidUrl(process.env.VOILA_LOGGING_WEBHOOK_URL)
  ) {
    throw new Error(
      `Invalid VOILA_LOGGING_WEBHOOK_URL: "${process.env.VOILA_LOGGING_WEBHOOK_URL}". Must be a valid HTTP/HTTPS URL`
    );
  }
}

/**
 * Validates if a string is a valid URL
 * @param {string} string - URL string to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}
