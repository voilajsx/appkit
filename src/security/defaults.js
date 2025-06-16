/**
 * Smart defaults and environment validation for security
 * @module @voilajsx/appkit/security
 * @file src/security/defaults.js
 */

/**
 * Gets smart defaults using VOILA_SECURITY_* environment variables
 * @returns {object} Configuration object with smart defaults
 */
export function getSmartDefaults() {
  validateEnvironment();

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // CSRF configuration
    csrf: {
      secret:
        process.env.VOILA_SECURITY_CSRF_SECRET || process.env.VOILA_AUTH_SECRET,
      tokenField: process.env.VOILA_SECURITY_CSRF_FIELD || '_csrf',
      headerField: process.env.VOILA_SECURITY_CSRF_HEADER || 'x-csrf-token',
      expiryMinutes: parseInt(process.env.VOILA_SECURITY_CSRF_EXPIRY) || 60,
    },

    // Rate limiting configuration
    rateLimit: {
      maxRequests: parseInt(process.env.VOILA_SECURITY_RATE_LIMIT) || 100,
      windowMs:
        parseInt(process.env.VOILA_SECURITY_RATE_WINDOW) || 15 * 60 * 1000, // 15 minutes
      message:
        process.env.VOILA_SECURITY_RATE_MESSAGE ||
        'Too many requests, please try again later',
    },

    // Input sanitization configuration
    sanitization: {
      maxLength: parseInt(process.env.VOILA_SECURITY_MAX_INPUT_LENGTH) || 1000,
      allowedTags: process.env.VOILA_SECURITY_ALLOWED_TAGS
        ? process.env.VOILA_SECURITY_ALLOWED_TAGS.split(',').map((tag) =>
            tag.trim()
          )
        : [],
      stripAllTags: process.env.VOILA_SECURITY_STRIP_ALL_TAGS === 'true',
    },

    // Encryption configuration
    encryption: {
      key: process.env.VOILA_SECURITY_ENCRYPTION_KEY,
      algorithm: 'aes-256-gcm',
      ivLength: 16,
      tagLength: 16,
      keyLength: 32,
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
 * Validates environment variables for security
 */
function validateEnvironment() {
  // Validate CSRF secret
  const csrfSecret =
    process.env.VOILA_SECURITY_CSRF_SECRET || process.env.VOILA_AUTH_SECRET;
  if (!csrfSecret && process.env.NODE_ENV === 'production') {
    console.warn(
      'VOILA_SECURITY_CSRF_SECRET not set. CSRF protection will not work in production.'
    );
  }

  // Validate encryption key
  const encryptionKey = process.env.VOILA_SECURITY_ENCRYPTION_KEY;
  if (encryptionKey) {
    validateEncryptionKey(encryptionKey);
  }

  // Validate rate limit values
  const rateLimit = process.env.VOILA_SECURITY_RATE_LIMIT;
  if (rateLimit) {
    const rateLimitNum = parseInt(rateLimit);
    if (isNaN(rateLimitNum) || rateLimitNum <= 0) {
      console.warn(
        `Invalid VOILA_SECURITY_RATE_LIMIT: "${rateLimit}". Must be a positive number.`
      );
    }
  }

  const rateWindow = process.env.VOILA_SECURITY_RATE_WINDOW;
  if (rateWindow) {
    const rateWindowNum = parseInt(rateWindow);
    if (isNaN(rateWindowNum) || rateWindowNum <= 0) {
      console.warn(
        `Invalid VOILA_SECURITY_RATE_WINDOW: "${rateWindow}". Must be a positive number (milliseconds).`
      );
    }
  }

  // Validate max input length
  const maxLength = process.env.VOILA_SECURITY_MAX_INPUT_LENGTH;
  if (maxLength) {
    const maxLengthNum = parseInt(maxLength);
    if (isNaN(maxLengthNum) || maxLengthNum <= 0) {
      console.warn(
        `Invalid VOILA_SECURITY_MAX_INPUT_LENGTH: "${maxLength}". Must be a positive number.`
      );
    }
  }

  // Validate CSRF expiry
  const csrfExpiry = process.env.VOILA_SECURITY_CSRF_EXPIRY;
  if (csrfExpiry) {
    const csrfExpiryNum = parseInt(csrfExpiry);
    if (isNaN(csrfExpiryNum) || csrfExpiryNum <= 0) {
      console.warn(
        `Invalid VOILA_SECURITY_CSRF_EXPIRY: "${csrfExpiry}". Must be a positive number (minutes).`
      );
    }
  }
}

/**
 * Validates encryption key format and length
 * @param {string} key - Encryption key to validate
 */
function validateEncryptionKey(key) {
  if (typeof key !== 'string') {
    console.warn('VOILA_SECURITY_ENCRYPTION_KEY must be a string.');
    return;
  }

  // Check if it's a valid hex string
  if (!/^[0-9a-fA-F]+$/.test(key)) {
    console.warn(
      'VOILA_SECURITY_ENCRYPTION_KEY must be a valid hexadecimal string.'
    );
    return;
  }

  // Check length (should be 64 hex characters for 32 bytes)
  if (key.length !== 64) {
    console.warn(
      `VOILA_SECURITY_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Current length: ${key.length}`
    );
    return;
  }
}

/**
 * Creates security error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {Error} Error with statusCode property
 */
export function createSecurityError(message, statusCode = 400, details = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, details);
  return error;
}
