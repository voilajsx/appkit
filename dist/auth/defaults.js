/**
 * Smart defaults and environment validation for role-level-permission authentication
 * @module @voilajsx/appkit/auth
 * @file src/auth/defaults.ts
 *
 * @llm-rule WHEN: App startup - need to parse auth environment variables and build role hierarchy
 * @llm-rule AVOID: Calling multiple times - expensive validation, use lazy loading in get()
 * @llm-rule NOTE: Called once at startup, cached globally for performance
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
 */
const DEFAULT_PERMISSIONS = {
    'user.basic': ['manage:own'],
    'user.pro': ['manage:own'],
    'user.max': ['manage:own'],
    'moderator.review': ['view:tenant'],
    'moderator.approve': ['view:tenant', 'create:tenant', 'edit:tenant'],
    'moderator.manage': ['view:tenant', 'create:tenant', 'edit:tenant'],
    'admin.tenant': ['manage:tenant'],
    'admin.org': ['manage:tenant', 'manage:org'],
    'admin.system': ['manage:tenant', 'manage:org', 'manage:system'],
};
/**
 * Gets smart defaults using VOILA_AUTH_* environment variables
 * @llm-rule WHEN: App startup to get production-ready auth configuration
 * @llm-rule AVOID: Calling repeatedly - validates environment each time, expensive operation
 * @llm-rule AVOID: Calling in request handlers - expensive environment parsing
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 */
export function getSmartDefaults() {
    validateEnvironment();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        jwt: {
            secret: process.env.VOILA_AUTH_SECRET,
            expiresIn: process.env.VOILA_AUTH_EXPIRES_IN || '7d',
            algorithm: 'HS256',
        },
        password: {
            saltRounds: parseInt(process.env.VOILA_AUTH_BCRYPT_ROUNDS || '10'),
        },
        roles: parseRoleHierarchy(),
        permissions: {
            coreActions: CORE_ACTIONS,
            coreScopes: CORE_SCOPES,
            defaults: parseDefaultPermissions(),
        },
        user: {
            defaultRole: process.env.VOILA_AUTH_DEFAULT_ROLE || 'user',
            defaultLevel: process.env.VOILA_AUTH_DEFAULT_LEVEL || 'basic',
        },
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
        environment: {
            isDevelopment,
            isProduction,
            nodeEnv: process.env.NODE_ENV || 'development',
        },
    };
}
/**
 * Parses role hierarchy from environment or uses defaults
 */
function parseRoleHierarchy() {
    const customRoles = process.env.VOILA_AUTH_ROLES;
    if (!customRoles) {
        return DEFAULT_ROLE_HIERARCHY;
    }
    try {
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
                .sort((a, b) => roles[b].level - roles[a].level);
        });
        return roles;
    }
    catch (error) {
        console.warn(`Invalid VOILA_AUTH_ROLES format: ${error.message}. Using defaults.`);
        return DEFAULT_ROLE_HIERARCHY;
    }
}
/**
 * Parses default permissions from environment or uses defaults
 */
function parseDefaultPermissions() {
    const customPermissions = process.env.VOILA_AUTH_PERMISSIONS;
    if (!customPermissions) {
        return DEFAULT_PERMISSIONS;
    }
    try {
        const permissions = {};
        const permissionPairs = customPermissions.split(',');
        permissionPairs.forEach((pair) => {
            const [roleLevel, ...permissionParts] = pair.trim().split(':');
            if (permissionParts.length < 2) {
                throw new Error(`Invalid permission format: "${pair}". Expected format: role.level:action:scope`);
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
    }
    catch (error) {
        console.warn(`Invalid VOILA_AUTH_PERMISSIONS format: ${error.message}. Using defaults.`);
        return DEFAULT_PERMISSIONS;
    }
}
/**
 * Validates if a role.level combination exists in the hierarchy
 * @llm-rule WHEN: Before using role.level in authorization checks
 * @llm-rule AVOID: Skipping validation - invalid roles cause silent authorization failures
 */
export function validateRoleLevel(roleLevel, roleHierarchy) {
    return roleHierarchy && roleHierarchy[roleLevel] !== undefined;
}
/**
 * Validates if a permission has correct format
 * @llm-rule WHEN: Before using custom permissions in authorization
 * @llm-rule AVOID: Assuming all permission strings are valid - malformed permissions always fail
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
 * @llm-rule WHEN: App startup or when setting custom JWT secret
 * @llm-rule AVOID: Using secrets shorter than 32 chars - creates security vulnerability
 */
export function validateSecret(secret) {
    if (!secret || typeof secret !== 'string') {
        throw new Error('JWT secret must be a non-empty string');
    }
    if (secret.length < 32) {
        throw new Error('JWT secret must be at least 32 characters long for security');
    }
    const weakSecrets = ['secret', 'password', 'key', 'token', 'jwt'];
    if (weakSecrets.includes(secret.toLowerCase())) {
        throw new Error('JWT secret is too weak. Use a strong, random secret');
    }
}
/**
 * Validates bcrypt rounds for security and performance
 * @llm-rule WHEN: Setting custom bcrypt rounds for password hashing
 * @llm-rule AVOID: Using rounds below 8 (insecure) or above 15 (too slow)
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
    const rounds = process.env.VOILA_AUTH_BCRYPT_ROUNDS;
    if (rounds) {
        const roundsNum = parseInt(rounds);
        if (isNaN(roundsNum)) {
            throw new Error(`Invalid VOILA_AUTH_BCRYPT_ROUNDS: "${rounds}". Must be a number between 8 and 15`);
        }
        validateRounds(roundsNum);
    }
    const expiresIn = process.env.VOILA_AUTH_EXPIRES_IN;
    if (expiresIn && !isValidTimespan(expiresIn)) {
        throw new Error(`Invalid VOILA_AUTH_EXPIRES_IN: "${expiresIn}". Must be a valid time span (e.g., '7d', '1h', '30m')`);
    }
    const defaultRole = process.env.VOILA_AUTH_DEFAULT_ROLE;
    const defaultLevel = process.env.VOILA_AUTH_DEFAULT_LEVEL;
    if (defaultRole && defaultLevel) {
        const roleLevel = `${defaultRole}.${defaultLevel}`;
        const roles = parseRoleHierarchy();
        if (!validateRoleLevel(roleLevel, roles)) {
            const validRoles = Object.keys(roles).join(', ');
            throw new Error(`Invalid VOILA_AUTH_DEFAULT_ROLE.LEVEL: "${roleLevel}". Must be one of: ${validRoles}`);
        }
    }
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
        console.warn(`Unusual NODE_ENV: "${nodeEnv}". Expected: development, production, or test`);
    }
}
/**
 * Validates if a string is a valid JWT timespan
 */
function isValidTimespan(timespan) {
    if (typeof timespan === 'number') {
        return timespan > 0;
    }
    if (typeof timespan === 'string') {
        return /^\d+[smhdwy]$/.test(timespan.toLowerCase());
    }
    return false;
}
export { DEFAULT_ROLE_HIERARCHY, DEFAULT_PERMISSIONS, CORE_ACTIONS, CORE_SCOPES, };
