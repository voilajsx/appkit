/**
 * Core authentication class with role-level-permission system
 * @module @voilajsx/appkit/auth
 * @file src/auth/authentication.ts
 *
 * @llm-rule WHEN: Building apps that need JWT operations, password hashing, and role-based middleware
 * @llm-rule AVOID: Using directly - always get instance via auth.get()
 * @llm-rule NOTE: Use requireUserRoles() for hierarchy-based access, requireUserPermissions() for action-specific access
 * @llm-rule NOTE: Uses role.level format (user.basic, admin.tenant) with automatic inheritance
 */
import { type AuthConfig } from './defaults.js';
export interface JwtPayload {
    userId?: string | number;
    keyId?: string;
    type: 'login' | 'api_key';
    role: string;
    level: string;
    permissions?: string[];
    [key: string]: any;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}
export interface LoginTokenPayload {
    userId: string | number;
    type: 'login';
    role: string;
    level: string;
    permissions?: string[];
    [key: string]: any;
}
export interface ApiTokenPayload {
    keyId: string;
    type: 'api_key';
    role: string;
    level: string;
    permissions?: string[];
    [key: string]: any;
}
export interface ExpressRequest {
    headers: {
        [key: string]: string | string[] | undefined;
    };
    cookies?: {
        [key: string]: string;
    };
    query?: {
        [key: string]: any;
    };
    user?: JwtPayload;
    token?: JwtPayload;
    [key: string]: any;
}
export interface ExpressResponse {
    status: (code: number) => {
        json: (data: any) => void;
    };
    json: (data: any) => void;
}
export interface MiddlewareOptions {
    getToken?: (request: ExpressRequest) => string | null;
}
export type ExpressMiddleware = (req: ExpressRequest, res: ExpressResponse, next: () => void) => void;
/**
 * Authentication class with JWT, password, and role-level-permission system
 */
export declare class AuthenticationClass {
    config: AuthConfig;
    constructor(config: AuthConfig);
    /**
     * Generates a login JWT token for user authentication
     * @llm-rule WHEN: User successfully logs in to your app (mobile/web)
     * @llm-rule AVOID: Using for API access - use generateApiToken instead
     * @llm-rule NOTE: Creates JWT with userId and type: 'login'
     */
    generateLoginToken(payload: Omit<LoginTokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'aud'>, expiresIn?: string): string;
    /**
     * Generates an API JWT token for external access
     * @llm-rule WHEN: Creating API keys for third-party integrations
     * @llm-rule AVOID: Using for user authentication - use generateLoginToken instead
     * @llm-rule NOTE: Creates JWT with keyId and type: 'api_key'
     */
    generateApiToken(payload: Omit<ApiTokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'aud'>, expiresIn?: string): string;
    /**
     * Internal method to create and sign JWT tokens
     * @private
     */
    private signToken;
    /**
     * Verifies and decodes a JWT token (both login and API tokens)
     * @llm-rule WHEN: Validating incoming tokens from requests
     * @llm-rule AVOID: Using jwt.verify directly - this handles errors and validates structure
     * @llm-rule NOTE: Handles both login tokens (userId) and API tokens (keyId)
     */
    verifyToken(token: string): JwtPayload;
    /**
     * Hashes a password using bcrypt
     * @llm-rule WHEN: Storing user passwords - always hash before saving to database
     * @llm-rule AVOID: Storing plain text passwords - major security vulnerability
     * @llm-rule NOTE: Takes ~100ms with default 10 rounds - don't call in tight loops
     */
    hashPassword(password: string, rounds?: number): Promise<string>;
    /**
     * Compares a password with its hash
     * @llm-rule WHEN: Validating user login credentials
     * @llm-rule AVOID: Manual string comparison - timing attacks possible
     * @llm-rule NOTE: Always returns boolean, never throws on comparison failure
     */
    comparePassword(password: string, hash: string): Promise<boolean>;
    /**
     * Safely extracts user from request - never crashes
     * @llm-rule WHEN: Need to access user data from authenticated requests
     * @llm-rule AVOID: Accessing req.user directly - may be undefined and cause crashes
     * @llm-rule NOTE: Always returns null for unauthenticated requests - safe to use
     * @llm-rule NOTE: Works with both login authentication (req.user) and API tokens (req.token)
     */
    user(request: ExpressRequest): JwtPayload | null;
    /**
     * Checks if user has specified role with automatic inheritance
     * @llm-rule WHEN: Checking if user can access role-protected resources
     * @llm-rule AVOID: Manual role comparisons - this handles inheritance automatically
     * @llm-rule NOTE: Higher levels inherit lower (admin.org has admin.tenant access)
     * @llm-rule NOTE: INHERITANCE EXAMPLES:
     * @llm-rule NOTE: auth.hasRole('admin.org', 'admin.tenant') → TRUE (org > tenant)
     * @llm-rule NOTE: auth.hasRole('admin.system', 'user.basic') → TRUE (system > basic)
     * @llm-rule NOTE: auth.hasRole('user.basic', 'admin.tenant') → FALSE (basic < tenant)
     * @llm-rule NOTE: Role hierarchy: admin.system > admin.org > admin.tenant > user.max > user.pro > user.basic
     */
    hasRole(userRoleLevel: string, requiredRoleLevel: string): boolean;
    /**
     * Checks if user has specific permission with automatic action inheritance
     * @llm-rule WHEN: Checking fine-grained permissions for specific actions
     * @llm-rule AVOID: Hardcoding permission checks - this handles action inheritance
     * @llm-rule NOTE: 'manage:scope' includes ALL other actions for that scope
     * @llm-rule NOTE: PERMISSION INHERITANCE EXAMPLES:
     * @llm-rule NOTE: If user has 'manage:tenant' → can('edit:tenant') returns TRUE
     * @llm-rule NOTE: If user has 'manage:tenant' → can('view:tenant') returns TRUE
     * @llm-rule NOTE: If user has 'edit:tenant' → can('manage:tenant') returns FALSE
     * @llm-rule NOTE: Actions hierarchy: manage > delete > edit > create > view
     */
    can(user: JwtPayload, permission: string): boolean;
    /**
     * Creates Express authentication middleware for login tokens
     * @llm-rule WHEN: Protecting routes that need authenticated users
     * @llm-rule AVOID: Using for API routes - use requireApiToken instead
     * @llm-rule NOTE: Validates login tokens (type: 'login') and sets req.user
     */
    requireLoginToken(options?: MiddlewareOptions): ExpressMiddleware;
    /**
     * Creates Express role-based authorization middleware for authenticated users
     * @llm-rule WHEN: Protecting routes that require specific user roles
     * @llm-rule AVOID: Using without requireLoginToken - this assumes user is already authenticated
     * @llm-rule AVOID: Using with API tokens - API tokens don't have user roles
     * @llm-rule NOTE: User needs ANY role from the array (OR logic)
     * @llm-rule NOTE: Role inheritance applies - admin.org can access admin.tenant routes
     */
    requireUserRoles(requiredRoles: string[]): ExpressMiddleware;
    /**
     * Creates Express permission-based authorization middleware for authenticated users
     * @llm-rule WHEN: Protecting routes that require specific user permissions
     * @llm-rule AVOID: Using without requireLoginToken - this assumes user is already authenticated
     * @llm-rule AVOID: Using with API tokens - API tokens don't have user permissions
     * @llm-rule NOTE: User needs ALL permissions from the array (AND logic)
     * @llm-rule NOTE: Permission inheritance applies - manage:tenant can access edit:tenant routes
     */
    requireUserPermissions(requiredPermissions: string[]): ExpressMiddleware;
    /**
     * Creates Express API token authentication middleware for external access
     * @llm-rule WHEN: Protecting API routes for third-party integrations
     * @llm-rule AVOID: Using for user routes - use requireLoginToken instead
     * @llm-rule NOTE: Validates API tokens (type: 'api_key') and sets req.token
     */
    requireApiToken(options?: MiddlewareOptions): ExpressMiddleware;
    /**
     * Gets default token extractor that checks headers, cookies, and query params
     * @llm-rule WHEN: Need custom token extraction logic
     * @llm-rule AVOID: Modifying directly - pass custom getToken to middleware options
     */
    private getDefaultTokenExtractor;
}
//# sourceMappingURL=auth.d.ts.map