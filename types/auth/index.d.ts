/**
 * Ultra-simple role-level-permission authentication that just works
 * @module @voilajsx/appkit/auth
 * @file src/auth/index.ts
 *
 * @llm-rule WHEN: Building apps that need authentication with user roles and permissions
 * @llm-rule AVOID: Complex auth setups with multiple libraries - this handles JWT + bcrypt + middleware in one API
 * @llm-rule NOTE: Uses role.level hierarchy (user.basic → admin.system) with automatic inheritance
 * @llm-rule NOTE: Common pattern - auth.requireLogin() → auth.requireRole() → handler
 * @llm-rule NOTE: Safe user access - const user = auth.user(req); if (!user) return error;
 */
import { AuthenticationClass } from './authentication';
import { type AuthConfig, type RoleHierarchy } from './defaults';
/**
 * Get authentication instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @llm-rule WHEN: Starting any auth operation - this is your main entry point
 * @llm-rule AVOID: Calling new AuthenticationClass() directly - always use this function
 * @llm-rule NOTE: Typical flow - get() → signToken() → middleware → user()
 */
declare function get(overrides?: Partial<AuthConfig>): AuthenticationClass;
/**
 * Reset global instance (useful for testing or config changes)
 * @llm-rule WHEN: Testing auth logic with different configurations
 * @llm-rule AVOID: Using in production - only for tests and development
 */
declare function reset(newConfig?: Partial<AuthConfig>): AuthenticationClass;
/**
 * Get current role hierarchy for inspection
 * @llm-rule WHEN: Need to see available role.levels for debugging or UI
 * @llm-rule AVOID: Using for authorization logic - use hasRole() method instead
 */
declare function getRoles(): RoleHierarchy;
/**
 * Get current permission configuration for inspection
 * @llm-rule WHEN: Need to see default permissions for debugging or documentation
 * @llm-rule AVOID: Using for permission checks - use can() method instead
 */
declare function getPermissions(): {
    coreActions: string[];
    coreScopes: string[];
    defaults: Record<string, string[]>;
};
/**
 * Check if a role.level exists in current configuration
 * @llm-rule WHEN: Validating user input or config before creating tokens
 * @llm-rule AVOID: Using for runtime authorization - this is for validation only
 */
declare function isValidRole(roleLevel: string): boolean;
/**
 * Get all available role.levels in hierarchy order
 * @llm-rule WHEN: Building role selection UI or generating documentation
 * @llm-rule AVOID: Hardcoding role lists - use this to stay in sync with config
 */
declare function getAllRoles(): string[];
/**
 * Single authentication export with minimal functionality
 */
export declare const authenticator: {
    readonly get: typeof get;
    readonly reset: typeof reset;
    readonly getRoles: typeof getRoles;
    readonly getPermissions: typeof getPermissions;
    readonly isValidRole: typeof isValidRole;
    readonly getAllRoles: typeof getAllRoles;
};
export type { AuthConfig, RoleConfig, RoleHierarchy, PermissionDefaults, } from './defaults';
export type { JwtPayload, FastifyRequest, FastifyReply, FastifyError, ExpressRequest, ExpressResponse, MiddlewareOptions, FastifyPreHandler, ExpressMiddleware, } from './authentication';
export { AuthenticationClass } from './authentication';
