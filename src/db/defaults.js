/**
 * Smart defaults and environment validation for database
 * @module @voilajsx/appkit/db
 * @file src/db/defaults.js
 */

/**
 * Gets smart defaults using VOILA_DB_* environment variables
 * @returns {object} Configuration object with smart defaults
 */
export function getSmartDefaults() {
  validateEnvironment();

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Database configuration
    database: {
      url: process.env.VOILA_DB_URL || process.env.DATABASE_URL,
      strategy: detectStrategy(),
      adapter: detectAdapter(),
      tenant: detectTenantMode(),
    },

    // Connection configuration
    connection: {
      poolSize:
        parseInt(process.env.VOILA_DB_POOL_SIZE) || (isProduction ? 10 : 5),
      timeout: parseInt(process.env.VOILA_DB_TIMEOUT) || 10000, // 10 seconds
      retries: parseInt(process.env.VOILA_DB_RETRIES) || 3,
      ssl: process.env.VOILA_DB_SSL === 'true' || isProduction,
    },

    // Tenant configuration
    tenant: {
      fieldName: process.env.VOILA_DB_TENANT_FIELD || 'tenantId',
      validation: process.env.VOILA_DB_TENANT_VALIDATION !== 'false',
      autoCreate: process.env.VOILA_DB_TENANT_AUTO_CREATE === 'true',
    },

    // Middleware configuration
    middleware: {
      headerName: process.env.VOILA_DB_TENANT_HEADER || 'x-tenant-id',
      paramName: process.env.VOILA_DB_TENANT_PARAM || 'tenantId',
      queryName: process.env.VOILA_DB_TENANT_QUERY || 'tenantId',
      required: process.env.VOILA_DB_TENANT_REQUIRED !== 'false',
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
 * Detects tenant strategy from environment or URL
 * @returns {string} Strategy name ('row' or 'database')
 */
function detectStrategy() {
  // Explicit strategy override
  const explicitStrategy = process.env.VOILA_DB_STRATEGY;
  if (explicitStrategy) {
    if (!['row', 'database'].includes(explicitStrategy)) {
      console.warn(
        `Invalid VOILA_DB_STRATEGY: "${explicitStrategy}". Using auto-detection.`
      );
    } else {
      return explicitStrategy;
    }
  }

  // Auto-detect from URL pattern
  const url = process.env.VOILA_DB_URL || process.env.DATABASE_URL;
  if (url && url.includes('{tenant}')) {
    return 'database';
  }

  return 'row'; // Default to row-level strategy
}

/**
 * Detects database adapter from URL
 * @returns {string} Adapter name ('prisma' or 'mongoose')
 */
function detectAdapter() {
  // Explicit adapter override
  const explicitAdapter = process.env.VOILA_DB_ADAPTER;
  if (explicitAdapter) {
    if (!['prisma', 'mongoose'].includes(explicitAdapter)) {
      console.warn(
        `Invalid VOILA_DB_ADAPTER: "${explicitAdapter}". Using auto-detection.`
      );
    } else {
      return explicitAdapter;
    }
  }

  // Auto-detect from URL
  const url = process.env.VOILA_DB_URL || process.env.DATABASE_URL;
  if (url) {
    if (url.includes('mongodb://') || url.includes('mongodb+srv://')) {
      return 'mongoose';
    }
    // Default to Prisma for SQL databases
    if (
      url.includes('postgresql://') ||
      url.includes('postgres://') ||
      url.includes('mysql://') ||
      url.includes('sqlite://')
    ) {
      return 'prisma';
    }
  }

  return 'prisma'; // Default to Prisma
}

/**
 * Detects if tenant mode should be enabled
 * @returns {boolean} True if tenant mode should be enabled
 */
function detectTenantMode() {
  // Explicit tenant mode
  const explicitTenant = process.env.VOILA_DB_TENANT;
  if (explicitTenant !== undefined) {
    return explicitTenant === 'true';
  }

  // Auto-detect from URL or strategy
  const url = process.env.VOILA_DB_URL || process.env.DATABASE_URL;
  const strategy = detectStrategy();

  // Enable tenant mode if URL has {tenant} placeholder or strategy is 'database'
  return (url && url.includes('{tenant}')) || strategy === 'database';
}

/**
 * Validates environment variables for database
 */
function validateEnvironment() {
  // Validate database URL
  const dbUrl = process.env.VOILA_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl && process.env.NODE_ENV === 'production') {
    console.warn(
      'VOILA_DB_URL not set. Database connection will not work in production.'
    );
  }

  if (dbUrl) {
    validateDatabaseUrl(dbUrl);
  }

  // Validate numeric environment variables
  validateNumericEnvVar('VOILA_DB_POOL_SIZE', 1, 100);
  validateNumericEnvVar('VOILA_DB_TIMEOUT', 1000, 60000);
  validateNumericEnvVar('VOILA_DB_RETRIES', 0, 10);

  // Validate tenant field name
  const tenantField = process.env.VOILA_DB_TENANT_FIELD;
  if (tenantField && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tenantField)) {
    console.warn(
      `Invalid VOILA_DB_TENANT_FIELD: "${tenantField}". Must be a valid identifier.`
    );
  }

  // Validate strategy and adapter
  const strategy = process.env.VOILA_DB_STRATEGY;
  if (strategy && !['row', 'database'].includes(strategy)) {
    console.warn(
      `Invalid VOILA_DB_STRATEGY: "${strategy}". Supported: row, database`
    );
  }

  const adapter = process.env.VOILA_DB_ADAPTER;
  if (adapter && !['prisma', 'mongoose'].includes(adapter)) {
    console.warn(
      `Invalid VOILA_DB_ADAPTER: "${adapter}". Supported: prisma, mongoose`
    );
  }
}

/**
 * Validates database URL format
 * @param {string} url - Database URL to validate
 */
function validateDatabaseUrl(url) {
  if (typeof url !== 'string' || url.length === 0) {
    console.warn('Database URL must be a non-empty string.');
    return;
  }

  // Check for common URL patterns
  const validPatterns = [
    /^postgresql:\/\//,
    /^postgres:\/\//,
    /^mysql:\/\//,
    /^sqlite:\/\//,
    /^mongodb:\/\//,
    /^mongodb\+srv:\/\//,
  ];

  const isValidUrl = validPatterns.some((pattern) => pattern.test(url));
  if (!isValidUrl) {
    console.warn(`Database URL format may be invalid: "${url}"`);
  }

  // Warn about insecure connections in production
  if (
    process.env.NODE_ENV === 'production' &&
    !url.includes('ssl=true') &&
    !url.includes('sslmode=require')
  ) {
    if (url.includes('postgresql://') || url.includes('mysql://')) {
      console.warn(
        'Consider using SSL for database connections in production.'
      );
    }
  }
}

/**
 * Validates numeric environment variables
 * @param {string} name - Environment variable name
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
function validateNumericEnvVar(name, min, max) {
  const value = process.env[name];
  if (value !== undefined) {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      console.warn(`Invalid ${name}: "${value}". Must be a number.`);
    } else if (numValue < min || numValue > max) {
      console.warn(
        `Invalid ${name}: "${value}". Must be between ${min} and ${max}.`
      );
    }
  }
}

/**
 * Validates tenant ID format
 * @param {string} tenantId - Tenant ID to validate
 * @returns {boolean} True if valid
 */
export function validateTenantId(tenantId) {
  if (!tenantId || typeof tenantId !== 'string') {
    return false;
  }

  // Allow alphanumeric characters, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
    return false;
  }

  // Prevent reserved words and patterns
  const reservedWords = [
    'admin',
    'api',
    'www',
    'ftp',
    'mail',
    'pop',
    'smtp',
    'imap',
    'ns',
    'ns1',
    'ns2',
    'dns',
    'mx',
    'email',
    'username',
    'userid',
    'test',
    'demo',
    'sample',
    'example',
    'null',
    'undefined',
  ];

  if (reservedWords.includes(tenantId.toLowerCase())) {
    return false;
  }

  // Length validation
  if (tenantId.length < 1 || tenantId.length > 63) {
    return false;
  }

  return true;
}

/**
 * Creates database error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {Error} Error with statusCode property
 */
export function createDatabaseError(message, statusCode = 500, details = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, details);
  return error;
}
