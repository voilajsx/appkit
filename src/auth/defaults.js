/**
 * Smart defaults and environment validation for authentication
 * @module @voilajsx/appkit/auth
 * @file src/auth/defaults.js
 */

/**
 * Default role hierarchy with inheritance
 */
const DEFAULT_ROLE_HIERARCHY = {
  user: { level: 1, inherits: [] },
  moderator: { level: 2, inherits: ['user'] },
  admin: { level: 3, inherits: ['moderator', 'user'] },
  superadmin: { level: 4, inherits: ['admin', 'moderator', 'user'] },
};

/**
 * Gets smart defaults using VOILA_AUTH_* environment variables
 * @returns {object} Configuration object with smart defaults
 */
export function getSmartDefaults() {
  validateEnvironment();

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // JWT configuration
    jwt: {
      secret: process.env.VOILA_AUTH_SECRET,
      expiresIn: process.env.VOILA_AUTH_EXPIRES_IN || '7d',
      algorithm: 'HS256',
    },

    // Password configuration
    password: {
      saltRounds: parseInt(process.env.VOILA_AUTH_BCRYPT_ROUNDS) || 10,
    },

    // Role configuration with smart defaults
    roles: parseRoleHierarchy(),

    // User configuration
    user: {
      defaultRole: process.env.VOILA_AUTH_DEFAULT_ROLE || 'user',
    },

    // Middleware configuration
    middleware: {
      tokenSources: ['header', 'cookie', 'query'], // Order of token extraction
      errorMessages: {
        noToken: 'Authentication required',
        invalidToken: 'Invalid authentication. Please sign in again.',
        expiredToken: 'Your session has expired. Please sign in again.',
        noRoles: 'No roles found for user',
        insufficientPermissions: 'Insufficient permissions',
        invalidRole: 'Invalid role specified',
      },
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
 * Parses role hierarchy from environment or uses defaults
 * @returns {object} Role hierarchy configuration
 */
function parseRoleHierarchy() {
  const customRoles = process.env.VOILA_AUTH_ROLES;

  if (!customRoles) {
    return DEFAULT_ROLE_HIERARCHY;
  }

  try {
    // Parse format: "user:1,moderator:2,admin:3,superadmin:4"
    const roles = {};
    const rolePairs = customRoles.split(',');

    rolePairs.forEach((pair) => {
      const [roleName, levelStr] = pair.trim().split(':');
      const level = parseInt(levelStr);

      if (!roleName || isNaN(level)) {
        throw new Error(`Invalid role format: "${pair}"`);
      }

      roles[roleName] = { level, inherits: [] };
    });

    // Calculate inheritance based on levels
    Object.keys(roles).forEach((roleName) => {
      const currentLevel = roles[roleName].level;
      roles[roleName].inherits = Object.keys(roles)
        .filter((otherRole) => roles[otherRole].level < currentLevel)
        .sort((a, b) => roles[b].level - roles[a].level); // Higher levels first
    });

    return roles;
  } catch (error) {
    console.warn(
      `Invalid VOILA_AUTH_ROLES format: ${error.message}. Using defaults.`
    );
    return DEFAULT_ROLE_HIERARCHY;
  }
}

/**
 * Validates JWT secret strength for production security
 * @param {string} secret - JWT secret to validate
 * @throws {Error} If secret is weak or invalid
 */
function validateSecret(secret) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('JWT secret must be a non-empty string');
  }

  if (secret.length < 32) {
    throw new Error(
      'JWT secret must be at least 32 characters long for security'
    );
  }

  // Warn about common weak secrets
  const weakSecrets = ['secret', 'password', 'key', 'token', 'jwt'];
  if (weakSecrets.includes(secret.toLowerCase())) {
    throw new Error('JWT secret is too weak. Use a strong, random secret');
  }
}

/**
 * Validates bcrypt rounds for security and performance
 * @param {number} rounds - Number of salt rounds
 * @throws {Error} If rounds are outside safe range
 */
function validateRounds(rounds) {
  if (rounds < 8) {
    throw new Error('Bcrypt rounds must be at least 8 for security');
  }

  if (rounds > 15) {
    throw new Error('Bcrypt rounds should not exceed 15 for performance');
  }
}

/**
 * Validates if a role exists in the hierarchy
 * @param {string} role - Role to validate
 * @param {object} roleHierarchy - Role hierarchy to check against
 * @returns {boolean} True if role is valid
 */
function validateRole(role, roleHierarchy) {
  return roleHierarchy && roleHierarchy[role] !== undefined;
}

/**
 * Validates environment variables
 */
function validateEnvironment() {
  const secret = process.env.VOILA_AUTH_SECRET;
  if (secret) {
    validateSecret(secret);
  }

  // Validate bcrypt rounds
  const rounds = process.env.VOILA_AUTH_BCRYPT_ROUNDS;
  if (rounds) {
    const roundsNum = parseInt(rounds);
    if (isNaN(roundsNum)) {
      throw new Error(
        `Invalid VOILA_AUTH_BCRYPT_ROUNDS: "${rounds}". Must be a number between 8 and 15`
      );
    }
    validateRounds(roundsNum);
  }

  // Validate JWT expiration format
  const expiresIn = process.env.VOILA_AUTH_EXPIRES_IN;
  if (expiresIn && !isValidTimespan(expiresIn)) {
    throw new Error(
      `Invalid VOILA_AUTH_EXPIRES_IN: "${expiresIn}". Must be a valid time span (e.g., '7d', '1h', '30m')`
    );
  }

  // Validate default role
  const defaultRole = process.env.VOILA_AUTH_DEFAULT_ROLE;
  if (defaultRole) {
    const roles = parseRoleHierarchy();
    if (!validateRole(defaultRole, roles)) {
      throw new Error(
        `Invalid VOILA_AUTH_DEFAULT_ROLE: "${defaultRole}". Must be one of: ${Object.keys(roles).join(', ')}`
      );
    }
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    console.warn(
      `Unusual NODE_ENV: "${nodeEnv}". Expected: development, production, or test`
    );
  }
}

/**
 * Validates if a string is a valid JWT timespan
 * @param {string} timespan - Timespan to validate
 * @returns {boolean} True if valid timespan
 */
function isValidTimespan(timespan) {
  // JWT library accepts: number (seconds), string with units (1h, 7d, 30m, etc.)
  if (typeof timespan === 'number') {
    return timespan > 0;
  }

  if (typeof timespan === 'string') {
    // Check for valid format: number followed by unit (s, m, h, d, w, y)
    return /^\d+[smhdwy]$/.test(timespan.toLowerCase());
  }

  return false;
}

// Export validation functions and defaults for use in auth class
export { validateSecret, validateRounds, validateRole, DEFAULT_ROLE_HIERARCHY };
