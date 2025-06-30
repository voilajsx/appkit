/**
 * Smart defaults and environment validation for role-level-permission authentication
 * @module @voilajsx/appkit/auth
 * @file src/auth/defaults.js
 */

/**
 * Default role hierarchy with semantic level names and clear inheritance
 */
const DEFAULT_ROLE_HIERARCHY = {
  'user.basic': {
    level: 1,
    inherits: [],
  },
  'user.pro': {
    level: 2,
    inherits: ['user.basic'],
  },
  'user.max': {
    level: 3,
    inherits: ['user.pro', 'user.basic'],
  },

  'moderator.review': {
    level: 4,
    inherits: ['user.max', 'user.pro', 'user.basic'],
  },
  'moderator.approve': {
    level: 5,
    inherits: ['moderator.review', 'user.max', 'user.pro', 'user.basic'],
  },
  'moderator.manage': {
    level: 6,
    inherits: [
      'moderator.approve',
      'moderator.review',
      'user.max',
      'user.pro',
      'user.basic',
    ],
  },

  'admin.tenant': {
    level: 7,
    inherits: [
      'moderator.manage',
      'moderator.approve',
      'moderator.review',
      'user.max',
      'user.pro',
      'user.basic',
    ],
  },
  'admin.org': {
    level: 8,
    inherits: [
      'admin.tenant',
      'moderator.manage',
      'moderator.approve',
      'moderator.review',
      'user.max',
      'user.pro',
      'user.basic',
    ],
  },
  'admin.system': {
    level: 9,
    inherits: [
      'admin.org',
      'admin.tenant',
      'moderator.manage',
      'moderator.approve',
      'moderator.review',
      'user.max',
      'user.pro',
      'user.basic',
    ],
  },
};

/**
 * Core permission actions - fixed set for consistency
 */
const CORE_ACTIONS = ['view', 'create', 'edit', 'delete', 'manage'];

/**
 * Core permission scopes - fixed set for consistency
 */
const CORE_SCOPES = ['own', 'tenant', 'org', 'system'];

/**
 * Default permissions for each role.level
 *
 * USER LEVELS:
 * - All user levels get 'manage:own' - full control over their own data
 * - Feature-level restrictions (file limits, premium features) should be
 *   handled at application level, not permission level
 *
 * MODERATOR LEVELS:
 * - review: Can only view content for moderation
 * - approve: Can view, create, and edit content (but not delete)
 * - manage: Same as approve (delete reserved for admin levels)
 *
 * ADMIN LEVELS:
 * - All admin levels get 'manage' permission which includes delete capability
 * - tenant: Manages single branch/location
 * - org: Manages organization + all its tenants
 * - system: Manages entire platform
 */
const DEFAULT_PERMISSIONS = {
  // Users: Full control over own data, feature restrictions at app level
  'user.basic': ['manage:own'],
  'user.pro': ['manage:own'],
  'user.max': ['manage:own'],

  // Moderators: Content moderation without delete capability
  'moderator.review': ['view:tenant'],
  'moderator.approve': ['view:tenant', 'create:tenant', 'edit:tenant'],
  'moderator.manage': ['view:tenant', 'create:tenant', 'edit:tenant'],

  // Admins: Full management including delete capability
  'admin.tenant': ['manage:tenant'],
  'admin.org': ['manage:tenant', 'manage:org'],
  'admin.system': ['manage:tenant', 'manage:org', 'manage:system'],
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

    // Role configuration with level-based hierarchy
    roles: parseRoleHierarchy(),

    // Permission configuration
    permissions: {
      coreActions: CORE_ACTIONS,
      coreScopes: CORE_SCOPES,
      defaults: parseDefaultPermissions(),
    },

    // User configuration
    user: {
      defaultRole: process.env.VOILA_AUTH_DEFAULT_ROLE || 'user',
      defaultLevel: process.env.VOILA_AUTH_DEFAULT_LEVEL || 'basic',
    },

    // Middleware configuration
    middleware: {
      tokenSources: ['header', 'cookie', 'query'],
      errorMessages: {
        noToken: 'Authentication required',
        invalidToken: 'Invalid authentication. Please sign in again.',
        expiredToken: 'Your session has expired. Please sign in again.',
        noRole: 'No role found for user',
        noPermissions: 'No permissions found for user',
        insufficientRole: 'Insufficient role level',
        insufficientPermissions: 'Insufficient permissions',
        invalidRole: 'Invalid role specified',
        invalidPermission: 'Invalid permission format',
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
    // Parse format: "user.basic:1,user.pro:2,admin.system:9"
    const roles = {};
    const rolePairs = customRoles.split(',');

    rolePairs.forEach((pair) => {
      const [roleLevel, levelNum] = pair.trim().split(':');
      const levelNumber = parseInt(levelNum);

      if (!roleLevel || isNaN(levelNumber)) {
        throw new Error(`Invalid role format: "${pair}"`);
      }

      roles[roleLevel] = { level: levelNumber, inherits: [] };
    });

    // Calculate inheritance based on levels (all lower levels)
    Object.keys(roles).forEach((roleLevel) => {
      const currentLevel = roles[roleLevel].level;
      roles[roleLevel].inherits = Object.keys(roles)
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
 * Parses default permissions from environment or uses defaults
 * @returns {object} Default permissions configuration
 */
function parseDefaultPermissions() {
  const customPermissions = process.env.VOILA_AUTH_PERMISSIONS;

  if (!customPermissions) {
    return DEFAULT_PERMISSIONS;
  }

  try {
    // Parse format: "user.basic:view:own,admin.tenant:manage:tenant"
    const permissions = {};
    const permissionPairs = customPermissions.split(',');

    permissionPairs.forEach((pair) => {
      const [roleLevel, ...permissionParts] = pair.trim().split(':');

      if (permissionParts.length < 2) {
        throw new Error(
          `Invalid permission format: "${pair}". Expected format: role.level:action:scope`
        );
      }

      const action = permissionParts[0];
      const scope = permissionParts[1];
      const permission = `${action}:${scope}`;

      if (!permissions[roleLevel]) {
        permissions[roleLevel] = [];
      }

      permissions[roleLevel].push(permission);
    });

    return permissions;
  } catch (error) {
    console.warn(
      `Invalid VOILA_AUTH_PERMISSIONS format: ${error.message}. Using defaults.`
    );
    return DEFAULT_PERMISSIONS;
  }
}

/**
 * Validates if a role.level combination exists in the hierarchy
 * @param {string} roleLevel - Role.level to validate (e.g., 'admin.tenant')
 * @param {object} roleHierarchy - Role hierarchy to check against
 * @returns {boolean} True if role.level is valid
 */
export function validateRoleLevel(roleLevel, roleHierarchy) {
  return roleHierarchy && roleHierarchy[roleLevel] !== undefined;
}

/**
 * Validates if a permission has correct format
 * @param {string} permission - Permission to validate (e.g., 'edit:tenant')
 * @returns {boolean} True if permission format is valid
 */
export function validatePermission(permission) {
  if (!permission || typeof permission !== 'string') {
    return false;
  }

  const parts = permission.split(':');
  if (parts.length < 2) {
    return false;
  }

  const [action, scope] = parts;

  // Check if it's a core permission or custom permission
  if (CORE_ACTIONS.includes(action) && CORE_SCOPES.includes(scope)) {
    return true;
  }

  // Custom permissions are valid if they follow action:scope format
  return action.length > 0 && scope.length > 0;
}

/**
 * Validates JWT secret strength for production security
 * @param {string} secret - JWT secret to validate
 * @throws {Error} If secret is weak or invalid
 */
export function validateSecret(secret) {
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
export function validateRounds(rounds) {
  if (rounds < 8) {
    throw new Error('Bcrypt rounds must be at least 8 for security');
  }

  if (rounds > 15) {
    throw new Error('Bcrypt rounds should not exceed 15 for performance');
  }
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

  // Validate default role.level
  const defaultRole = process.env.VOILA_AUTH_DEFAULT_ROLE;
  const defaultLevel = process.env.VOILA_AUTH_DEFAULT_LEVEL;
  if (defaultRole && defaultLevel) {
    const roleLevel = `${defaultRole}.${defaultLevel}`;
    const roles = parseRoleHierarchy();
    if (!validateRoleLevel(roleLevel, roles)) {
      const validRoles = Object.keys(roles).join(', ');
      throw new Error(
        `Invalid VOILA_AUTH_DEFAULT_ROLE.LEVEL: "${roleLevel}". Must be one of: ${validRoles}`
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

// Export constants and validation functions
export {
  DEFAULT_ROLE_HIERARCHY,
  DEFAULT_PERMISSIONS,
  CORE_ACTIONS,
  CORE_SCOPES,
  validateSecret,
  validateRounds,
};
