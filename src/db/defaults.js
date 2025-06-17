/**
 * Smart defaults and environment validation for database with app-level detection
 * @module @voilajsx/appkit/db
 * @file src/db/defaults.js
 */

/**
 * Gets smart defaults using VOILA_DB_* environment variables with app detection
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
      appId: detectAppId(),
    },

    // Connection configuration
    connection: {
      poolSize:
        parseInt(process.env.VOILA_DB_POOL_SIZE) || (isProduction ? 10 : 5),
      timeout: parseInt(process.env.VOILA_DB_TIMEOUT) || 10000, // 10 seconds
      retries: parseInt(process.env.VOILA_DB_RETRIES) || 3,
      ssl: process.env.VOILA_DB_SSL === 'true' || isProduction,
    },

    // Adapter configuration with auto-detection
    adapter: {
      type: detectAdapter(),
      clientPath: process.env.VOILA_DB_PRISMA_CLIENT_PATH,
      client: null, // Can be injected directly
      autoDetect: process.env.VOILA_DB_AUTO_DETECT_PRISMA !== 'false',
    },

    // Tenant configuration
    tenant: {
      fieldName: process.env.VOILA_DB_TENANT_FIELD || 'tenantId',
      validation: process.env.VOILA_DB_TENANT_VALIDATION !== 'false',
      autoCreate: process.env.VOILA_DB_TENANT_AUTO_CREATE === 'true',
    },

    // App-level configuration (for monorepo)
    app: {
      fieldName: process.env.VOILA_DB_APP_FIELD || 'appId',
      autoDetect: process.env.VOILA_DB_APP_AUTO_DETECT !== 'false',
      isolation: process.env.VOILA_DB_APP_ISOLATION === 'true',
      tablePrefix: process.env.VOILA_DB_APP_TABLE_PREFIX !== 'false', // Default enabled
    },

    // Middleware configuration
    middleware: {
      headerName: process.env.VOILA_DB_TENANT_HEADER || 'x-tenant-id',
      paramName: process.env.VOILA_DB_TENANT_PARAM || 'tenantId',
      queryName: process.env.VOILA_DB_TENANT_QUERY || 'tenantId',
      required: process.env.VOILA_DB_TENANT_REQUIRED !== 'false',
      appHeaderName: process.env.VOILA_DB_APP_HEADER || 'x-app-id',
      appParamName: process.env.VOILA_DB_APP_PARAM || 'appId',
    },

    // Environment info
    environment: {
      isDevelopment,
      isProduction,
      nodeEnv: process.env.NODE_ENV || 'development',
      isMonorepo: isMonorepoEnvironment(),
      appRoot: getAppRoot(),
    },
  };
}

/**
 * Detects application ID for monorepo app isolation
 * @returns {string} Application identifier
 */
function detectAppId() {
  // Explicit app ID override
  const explicitAppId = process.env.VOILA_DB_APP_ID;
  if (explicitAppId) {
    return explicitAppId;
  }

  // Auto-detect from package.json
  try {
    const fs = require('fs');
    const path = require('path');

    // Look for package.json in current directory
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

      // Use package name (remove scope if present)
      if (pkg.name) {
        return pkg.name.split('/').pop();
      }
    }
  } catch (error) {
    // Failed to read package.json
  }

  // Fallback to directory name
  try {
    const path = require('path');
    const dirName = path.basename(process.cwd());

    // Clean up directory name
    return dirName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  } catch (error) {
    // Ultimate fallback
    return 'voila';
  }
}

/**
 * Detects if running in a monorepo environment
 * @returns {boolean} True if in monorepo
 */
function isMonorepoEnvironment() {
  try {
    const fs = require('fs');
    const path = require('path');

    // Check for common monorepo indicators
    const indicators = [
      'turbo.json',
      'lerna.json',
      'nx.json',
      'rush.json',
      'pnpm-workspace.yaml',
      'yarn.lock',
    ];

    // Check current directory and parent directories
    let currentDir = process.cwd();
    const maxDepth = 5;

    for (let i = 0; i < maxDepth; i++) {
      for (const indicator of indicators) {
        if (fs.existsSync(path.join(currentDir, indicator))) {
          return true;
        }
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir;
    }

    // Check for apps/ or packages/ directory structure
    const cwd = process.cwd();
    if (cwd.includes('/apps/') || cwd.includes('/packages/')) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the app root directory in monorepo
 * @returns {string} App root path
 */
function getAppRoot() {
  try {
    const path = require('path');
    const cwd = process.cwd();

    // Look for common app directory patterns
    const patterns = ['/apps/', '/packages/', '/modules/'];

    for (const pattern of patterns) {
      const index = cwd.indexOf(pattern);
      if (index !== -1) {
        return cwd.substring(index + pattern.length).split('/')[0];
      }
    }

    return path.basename(cwd);
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Detects tenant strategy from environment or URL with app support
 * @returns {string} Strategy name ('row', 'database', or 'app')
 */
function detectStrategy() {
  // Explicit strategy override
  const explicitStrategy = process.env.VOILA_DB_STRATEGY;
  if (explicitStrategy) {
    if (!['row', 'database', 'app'].includes(explicitStrategy)) {
      console.warn(
        `Invalid VOILA_DB_STRATEGY: "${explicitStrategy}". Using auto-detection.`
      );
    } else {
      return explicitStrategy;
    }
  }

  // Auto-detect app strategy in monorepo
  if (
    isMonorepoEnvironment() &&
    process.env.VOILA_DB_APP_ISOLATION === 'true'
  ) {
    return 'app';
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

  // Enable tenant mode if URL has {tenant} placeholder or strategy supports tenancy
  return (
    (url && url.includes('{tenant}')) || ['database', 'app'].includes(strategy)
  );
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

  // Validate app field name
  const appField = process.env.VOILA_DB_APP_FIELD;
  if (appField && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(appField)) {
    console.warn(
      `Invalid VOILA_DB_APP_FIELD: "${appField}". Must be a valid identifier.`
    );
  }

  // Validate strategy and adapter
  const strategy = process.env.VOILA_DB_STRATEGY;
  if (strategy && !['row', 'database', 'app'].includes(strategy)) {
    console.warn(
      `Invalid VOILA_DB_STRATEGY: "${strategy}". Supported: row, database, app`
    );
  }

  const adapter = process.env.VOILA_DB_ADAPTER;
  if (adapter && !['prisma', 'mongoose'].includes(adapter)) {
    console.warn(
      `Invalid VOILA_DB_ADAPTER: "${adapter}". Supported: prisma, mongoose`
    );
  }

  // Validate Prisma client path if provided
  const prismaClientPath = process.env.VOILA_DB_PRISMA_CLIENT_PATH;
  if (prismaClientPath) {
    try {
      const fs = require('fs');
      const path = require('path');

      // Check if path exists (for relative paths)
      if (
        prismaClientPath.startsWith('./') ||
        prismaClientPath.startsWith('../')
      ) {
        const fullPath = path.resolve(prismaClientPath);
        if (!fs.existsSync(fullPath)) {
          console.warn(
            `VOILA_DB_PRISMA_CLIENT_PATH path does not exist: ${prismaClientPath}`
          );
        }
      }
    } catch (error) {
      // Ignore validation errors
    }
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
 * Validates app ID format
 * @param {string} appId - App ID to validate
 * @returns {boolean} True if valid
 */
export function validateAppId(appId) {
  if (!appId || typeof appId !== 'string') {
    return false;
  }

  // Allow alphanumeric characters, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(appId)) {
    return false;
  }

  // Length validation
  if (appId.length < 1 || appId.length > 63) {
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

/**
 * Runs comprehensive database diagnostics
 * @returns {Object} Diagnostic information
 */
export function diagnoseDatabase() {
  console.log('\n🔍 Database Diagnostics:');

  const diagnostics = {
    environment: {
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV,
      isMonorepo: isMonorepoEnvironment(),
      appRoot: getAppRoot(),
    },
    configuration: {
      url: process.env.VOILA_DB_URL ? '✅ Set' : '❌ Missing',
      strategy: detectStrategy(),
      adapter: detectAdapter(),
      appId: detectAppId(),
      tenantMode: detectTenantMode(),
    },
    files: {},
    suggestions: [],
  };

  // Log basic info
  console.log(`Working directory: ${diagnostics.environment.cwd}`);
  console.log(`Node environment: ${diagnostics.environment.nodeEnv}`);
  console.log(
    `Monorepo detected: ${diagnostics.environment.isMonorepo ? '✅' : '❌'}`
  );
  console.log(`App root: ${diagnostics.environment.appRoot}`);
  console.log(`Database URL: ${diagnostics.configuration.url}`);
  console.log(`Strategy: ${diagnostics.configuration.strategy}`);
  console.log(`Adapter: ${diagnostics.configuration.adapter}`);
  console.log(`App ID: ${diagnostics.configuration.appId}`);
  console.log(
    `Tenant mode: ${diagnostics.configuration.tenantMode ? '✅' : '❌'}`
  );

  // Check for important files
  console.log('\n📁 File Check:');
  const importantFiles = [
    './package.json',
    './prisma/schema.prisma',
    './schema.prisma',
    './node_modules/@prisma/client',
    './generated/client',
    './prisma/generated/client',
    './.prisma/client',
    './turbo.json',
    './lerna.json',
    './.env',
    './.env.local',
  ];

  try {
    const fs = require('fs');

    importantFiles.forEach((file) => {
      try {
        fs.accessSync(file);
        console.log(`${file}: ✅ Found`);
        diagnostics.files[file] = true;
      } catch {
        console.log(`${file}: ❌ Missing`);
        diagnostics.files[file] = false;
      }
    });
  } catch (error) {
    console.log('❌ Unable to check files');
  }

  // Generate suggestions
  console.log('\n💡 Suggestions:');

  if (!diagnostics.files['./package.json']) {
    diagnostics.suggestions.push('Initialize package.json: npm init');
    console.log('1. Initialize package.json: npm init');
  }

  if (
    !diagnostics.files['./prisma/schema.prisma'] &&
    !diagnostics.files['./schema.prisma']
  ) {
    diagnostics.suggestions.push('Initialize Prisma: npx prisma init');
    console.log('2. Initialize Prisma: npx prisma init');
  }

  if (
    !diagnostics.files['./node_modules/@prisma/client'] &&
    !diagnostics.files['./generated/client'] &&
    !diagnostics.files['./prisma/generated/client']
  ) {
    diagnostics.suggestions.push(
      'Install Prisma client: npm install @prisma/client'
    );
    diagnostics.suggestions.push('Generate Prisma client: npx prisma generate');
    console.log('3. Install Prisma client: npm install @prisma/client');
    console.log('4. Generate Prisma client: npx prisma generate');
  }

  if (diagnostics.configuration.url === '❌ Missing') {
    diagnostics.suggestions.push(
      'Set database URL: VOILA_DB_URL=your_database_url'
    );
    console.log('5. Set database URL in .env: VOILA_DB_URL=your_database_url');
  }

  console.log('\n📋 Environment Variables:');
  const envVars = [
    'VOILA_DB_URL',
    'DATABASE_URL',
    'VOILA_DB_STRATEGY',
    'VOILA_DB_ADAPTER',
    'VOILA_DB_APP_ID',
    'VOILA_DB_TENANT',
    'VOILA_DB_PRISMA_CLIENT_PATH',
    'NODE_ENV',
  ];

  envVars.forEach((envVar) => {
    const value = process.env[envVar];
    if (value) {
      // Mask sensitive values
      const maskedValue = envVar.includes('URL')
        ? value.replace(/:\/\/[^@]*@/, '://***:***@')
        : value;
      console.log(`${envVar}: ${maskedValue}`);
    } else {
      console.log(`${envVar}: ❌ Not set`);
    }
  });

  console.log('\n');
  return diagnostics;
}
