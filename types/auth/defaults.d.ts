/**
 * Smart defaults and environment validation for role-level-permission authentication
 * @module @voilajsx/appkit/auth
 * @file src/auth/defaults.ts
 *
 * @llm-rule WHEN: App startup - need to parse auth environment variables and build role hierarchy
 * @llm-rule AVOID: Calling multiple times - expensive validation, use lazy loading in get()
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 */
export interface RoleConfig {
    level: number;
    inherits: string[];
}
export interface RoleHierarchy {
    [roleLevel: string]: RoleConfig;
}
export interface PermissionDefaults {
    [roleLevel: string]: string[];
}
export interface AuthConfig {
    jwt: {
        secret: string;
        expiresIn: string;
        algorithm: string;
    };
    password: {
        saltRounds: number;
    };
    roles: RoleHierarchy;
    permissions: {
        coreActions: string[];
        coreScopes: string[];
        defaults: PermissionDefaults;
    };
    user: {
        defaultRole: string;
        defaultLevel: string;
    };
    middleware: {
        tokenSources: string[];
        errorMessages: {
            noToken: string;
            invalidToken: string;
            expiredToken: string;
            noRole: string;
            noPermissions: string;
            insufficientRole: string;
            insufficientPermissions: string;
            invalidRole: string;
            invalidPermission: string;
        };
    };
    environment: {
        isDevelopment: boolean;
        isProduction: boolean;
        nodeEnv: string;
    };
}
/**
 * Default role hierarchy with semantic level names and clear inheritance
 */
declare const DEFAULT_ROLE_HIERARCHY: RoleHierarchy;
/**
 * Core permission actions - fixed set for consistency
 */
declare const CORE_ACTIONS: string[];
/**
 * Core permission scopes - fixed set for consistency
 */
declare const CORE_SCOPES: string[];
/**
 * Default permissions for each role.level
 */
declare const DEFAULT_PERMISSIONS: PermissionDefaults;
/**
 * Gets smart defaults using VOILA_AUTH_* environment variables
 * @llm-rule WHEN: App startup to get production-ready auth configuration
 * @llm-rule AVOID: Calling repeatedly - validates environment each time, expensive operation
 * @llm-rule AVOID: Calling in request handlers - expensive environment parsing
 * @llm-rule NOTE: Called once at startup, cached globally for performance
 */
export declare function getSmartDefaults(): AuthConfig;
/**
 * Validates if a role.level combination exists in the hierarchy
 * @llm-rule WHEN: Before using role.level in authorization checks
 * @llm-rule AVOID: Skipping validation - invalid roles cause silent authorization failures
 */
export declare function validateRoleLevel(roleLevel: string, roleHierarchy: RoleHierarchy): boolean;
/**
 * Validates if a permission has correct format
 * @llm-rule WHEN: Before using custom permissions in authorization
 * @llm-rule AVOID: Assuming all permission strings are valid - malformed permissions always fail
 */
export declare function validatePermission(permission: string): boolean;
/**
 * Validates JWT secret strength for production security
 * @llm-rule WHEN: App startup or when setting custom JWT secret
 * @llm-rule AVOID: Using secrets shorter than 32 chars - creates security vulnerability
 */
export declare function validateSecret(secret: string): void;
/**
 * Validates bcrypt rounds for security and performance
 * @llm-rule WHEN: Setting custom bcrypt rounds for password hashing
 * @llm-rule AVOID: Using rounds below 8 (insecure) or above 15 (too slow)
 */
export declare function validateRounds(rounds: number): void;
export { DEFAULT_ROLE_HIERARCHY, DEFAULT_PERMISSIONS, CORE_ACTIONS, CORE_SCOPES, };
