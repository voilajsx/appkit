/**
 * Clean, unified logging configuration with auto scope detection
 * @module @voilajsx/appkit/logging
 * @file src/logging/defaults.js
 *
 * Environment Variables Reference:
 * VOILA_LOGGING_SCOPE=auto|minimal|full     # auto (default), minimal, full
 * VOILA_LOGGING_CONSOLE=true|false          # true (default), false
 * VOILA_LOGGING_FILE=true|false             # true (default), false
 * VOILA_LOGGING_DATABASE=true|false         # false (default), true - EXPLICIT opt-in only
 * VOILA_LOGGING_HTTP_URL=https://...        # URL auto-enables HTTP transport
 * VOILA_LOGGING_WEBHOOK_URL=https://...     # URL auto-enables webhook transport
 *
 * Optional:
 * VOILA_LOGGING_LEVEL=debug|info|warn|error # Auto-detected by environment
 * VOILA_LOGGING_DIR=./logs                  # Log directory path
 * VOILA_SERVICE_NAME=my-service             # Service name in logs
 */

/**
 * Gets smart defaults using simplified VOILA_LOGGING_* environment variables
 * @returns {object} Configuration object with smart defaults and transport config
 */
export function getSmartDefaults() {
  validateEnvironment();

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  // Auto scope detection with manual override
  const scope = detectScope();
  const isMinimalScope = scope === 'minimal';

  // Individual transport enablement (corrected logic)
  const transports = getEnabledTransports();

  return {
    // Core logging configuration
    level:
      process.env.VOILA_LOGGING_LEVEL ||
      (isProduction ? 'warn' : isDevelopment ? 'debug' : 'info'),

    // Global scope setting affects all transports
    scope: scope,
    minimal: isMinimalScope,

    defaultMeta: {
      service: process.env.VOILA_SERVICE_NAME || 'app',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },

    // Transport configuration
    transports: transports,

    // Console transport config
    console: {
      enabled: transports.includes('console'),
      minimal: isMinimalScope,
      colorize: !isProduction,
      prettyPrint: isDevelopment && !isMinimalScope,
      timestamps: !isMinimalScope, // Minimal mode = cleaner output
      showOnlyImportant: isMinimalScope,
      minimalLevel: isMinimalScope
        ? isProduction
          ? 'error'
          : 'warn'
        : 'debug',
    },

    // File transport config
    file: {
      enabled: transports.includes('file'),
      minimal: isMinimalScope,
      dirname: process.env.VOILA_LOGGING_DIR || 'logs',
      filename: 'app.log',
      retentionDays: 5, // 5 days for production debugging
      maxSize: isProduction ? 50 * 1024 * 1024 : 10 * 1024 * 1024,
      // Scope-based settings
      verbosity: scope, // 'minimal' or 'full'
      compactFormat: isMinimalScope, // Short field names in minimal
      includeStackTraces: !isMinimalScope || isDevelopment,
      includeMetadata: !isMinimalScope,
    },

    // Database transport config
    database: {
      enabled: transports.includes('database'),
      minimal: isMinimalScope,
      url: process.env.DATABASE_URL,
      table: 'logs',
      batchSize: isMinimalScope ? 50 : 100, // Smaller batches in minimal
      flushInterval: isMinimalScope ? 10000 : 5000, // Less frequent in minimal
      includeMetadata: !isMinimalScope,
    },

    // HTTP transport config
    http: {
      enabled: transports.includes('http'),
      minimal: isMinimalScope,
      url: process.env.VOILA_LOGGING_HTTP_URL,
      headers: { 'Content-Type': 'application/json' },
      batchSize: isMinimalScope ? 25 : 50, // Smaller batches in minimal
      flushInterval: isMinimalScope ? 15000 : 10000,
      includeMetadata: !isMinimalScope,
    },

    // Webhook transport config (Slack + Generic only)
    webhook: {
      enabled: transports.includes('webhook'),
      minimal: isMinimalScope,
      url: process.env.VOILA_LOGGING_WEBHOOK_URL,
      level: isMinimalScope ? 'error' : 'warn', // Only errors in minimal
      headers: { 'Content-Type': 'application/json' },
      rateLimit: isMinimalScope ? 5 : 10, // Fewer webhooks in minimal
      includeMetadata: !isMinimalScope,
    },
  };
}

/**
 * Auto-detect optimal logging scope based on environment
 * @returns {string} Detected scope: 'minimal' or 'full'
 */
function detectScope() {
  // Manual override always wins
  const manualScope = process.env.VOILA_LOGGING_SCOPE;
  if (
    manualScope &&
    ['auto', 'minimal', 'full'].includes(manualScope.toLowerCase())
  ) {
    if (manualScope.toLowerCase() !== 'auto') {
      return manualScope.toLowerCase();
    }
  }

  // Auto-detection logic
  if (process.env.CI) return 'minimal'; // CI/CD pipelines
  if (process.env.NODE_ENV === 'production') return 'minimal';
  if (process.env.DEBUG) return 'full'; // Debug sessions
  if (process.env.VOILA_DEBUG) return 'full'; // VoilaJS debug mode
  if (process.env.NODE_ENV === 'development') return 'minimal'; // Clean development

  return 'minimal'; // Safe default
}

/**
 * Determines which transports are enabled based on EXPLICIT configuration
 * @returns {string[]} Array of enabled transport names
 */
function getEnabledTransports() {
  const transports = [];
  const isTest = process.env.NODE_ENV === 'test';

  // Console transport - VOILA_LOGGING_CONSOLE (default: true except test)
  const consoleEnabled =
    process.env.VOILA_LOGGING_CONSOLE !== 'false' && !isTest;
  if (consoleEnabled) {
    transports.push('console');
  }

  // File transport - VOILA_LOGGING_FILE (default: true except test)
  const fileEnabled = process.env.VOILA_LOGGING_FILE !== 'false' && !isTest;
  if (fileEnabled) {
    transports.push('file');
  }

  // Database transport - ONLY when EXPLICITLY enabled (no auto-detection)
  // This prevents unexpected database connections and table creation
  if (process.env.VOILA_LOGGING_DATABASE === 'true') {
    transports.push('database');
  }

  // HTTP transport - auto-enable if URL provided
  if (process.env.VOILA_LOGGING_HTTP_URL) {
    transports.push('http');
  }

  // Webhook transport - auto-enable if URL provided
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

  // Validate scope
  const scope = process.env.VOILA_LOGGING_SCOPE;
  if (scope && !['auto', 'minimal', 'full'].includes(scope.toLowerCase())) {
    throw new Error(
      `Invalid VOILA_LOGGING_SCOPE: "${scope}". Must be one of: auto, minimal, full`
    );
  }

  // Validate boolean transport settings
  const booleanSettings = [
    'VOILA_LOGGING_CONSOLE',
    'VOILA_LOGGING_FILE',
    'VOILA_LOGGING_DATABASE',
  ];

  for (const setting of booleanSettings) {
    const value = process.env[setting];
    if (value && !['true', 'false'].includes(value.toLowerCase())) {
      throw new Error(
        `Invalid ${setting}: "${value}". Must be either 'true' or 'false'`
      );
    }
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

  // Validate database configuration if explicitly enabled
  if (process.env.VOILA_LOGGING_DATABASE === 'true') {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'VOILA_LOGGING_DATABASE is enabled but DATABASE_URL is not provided. Either set DATABASE_URL or disable database logging with VOILA_LOGGING_DATABASE=false'
      );
    }

    if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
      throw new Error(
        `Invalid DATABASE_URL: "${process.env.DATABASE_URL}". Must be a valid database connection string`
      );
    }
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

/**
 * Validates if a string is a valid database URL
 * @param {string} string - Database URL string to validate
 * @returns {boolean} True if valid database URL
 */
function isValidDatabaseUrl(string) {
  try {
    const url = new URL(string);
    const validProtocols = ['postgres:', 'postgresql:', 'mysql:', 'sqlite:'];
    return validProtocols.includes(url.protocol);
  } catch (error) {
    return false;
  }
}
