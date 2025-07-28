/**
 * Core authentication class with role-level-permission system
 * @module @voilajsx/appkit/auth
 * @file src/auth/authentication.ts
 *
 * @llm-rule WHEN: Building apps that need JWT operations, password hashing, and role-based middleware
 * @llm-rule AVOID: Using directly - always get instance via auth.get()
 * @llm-rule NOTE: Use requireRole() for hierarchy-based access, requirePermission() for action-specific access
 * @llm-rule NOTE: Uses role.level format (user.basic, admin.tenant) with automatic inheritance
 */
import { type AuthConfig } from './defaults.js';
export interface JwtPayload {
    userId: string | number;
    role: string;
    level: string;
    permissions?: string[];
    [key: string]: any;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}
export interface FastifyRequest {
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
}
export interface FastifyReply {
    code: (statusCode: number) => {
        send: (data: any) => void;
    };
    send: (data: any) => void;
}
export interface FastifyError {
    statusCode: number;
    error: string;
    message: string;
}
export interface ExpressRequest extends FastifyRequest {
    [key: string]: any;
}
export interface ExpressResponse {
    status: (code: number) => {
        json: (data: any) => void;
    };
    json: (data: any) => void;
}
export interface MiddlewareOptions {
    getToken?: (request: FastifyRequest) => string | null;
}
export type FastifyPreHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
export type ExpressMiddleware = (req: ExpressRequest, res: ExpressResponse, next: () => void) => void;
/**
 * Authentication class with JWT, password, and role-level-permission system
 */
export declare class AuthenticationClass {
    config: AuthConfig;
    constructor(config: AuthConfig);
    /**
     * Creates and signs a JWT token with role-level-permission structure
     * @llm-rule WHEN: Creating tokens for authenticated users with role-based access
     * @llm-rule AVOID: Missing userId, role, or level in payload - token will be invalid
     * @llm-rule AVOID: Using {userId, roles: ['admin']} format - use {userId, role: 'admin', level: 'tenant'}
     * @llm-rule NOTE: permissions array is optional - defaults are used from role.level config
     * @llm-rule NOTE: CORRECT TOKEN STRUCTURE EXAMPLES:
     * @llm-rule NOTE: Basic: {userId: 123, role: 'user', level: 'basic', permissions: ['manage:own']}
     * @llm-rule NOTE: Admin: {userId: 456, role: 'admin', level: 'tenant', permissions: ['manage:tenant']}
     * @llm-rule NOTE: WRONG: {userId: 123, roles: ['admin']} or {userId: 123, role: 'admin.tenant'}
     */
    signToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud'>, expiresIn?: string): string;
    /**
     * Verifies and decodes a JWT token
     * @llm-rule WHEN: Validating incoming tokens from requests
     * @llm-rule AVOID: Using jwt.verify directly - this handles errors and validates structure
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
     * @llm-rule NOTE: Works with both user authentication (req.user) and API tokens (req.token)
     */
    user(request: FastifyRequest | ExpressRequest): JwtPayload | null;
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
     * Creates Fastify-native authentication middleware for login-based routes
     * @llm-rule WHEN: Protecting routes that need authenticated users (Fastify framework)
     * @llm-rule AVOID: Using without requireRole/requirePermission - this only validates token
     * @llm-rule AVOID: Using with Express - use requireLoginExpress() for Express apps
     * @llm-rule NOTE: FASTIFY PATTERN: async (request, reply) => Promise<void>
     * @llm-rule NOTE: Auto-detects from async handler signature and reply.code() method
     */
    requireLogin(options?: MiddlewareOptions): FastifyPreHandler;
    /**
     * Creates Express-native authentication middleware for login-based routes
     * @llm-rule WHEN: Protecting routes that need authenticated users (Express framework)
     * @llm-rule AVOID: Using without requireRole/requirePermission - this only validates token
     * @llm-rule AVOID: Using with Fastify - use requireLogin() for Fastify apps
     * @llm-rule NOTE: EXPRESS PATTERN: (req, res, next) => void
     * @llm-rule NOTE: Auto-detects from callback signature and res.status() method
     */
    requireLoginExpress(options?: MiddlewareOptions): ExpressMiddleware;
    /**
     * Creates Fastify role-based authorization middleware
     * @llm-rule WHEN: Protecting routes that require specific role.level (Fastify)
     * @llm-rule AVOID: Using without requireLogin - this assumes user is already authenticated
     * @llm-rule NOTE: Role inheritance applies - admin.org can access admin.tenant routes
     */
    requireRole(requiredRoleLevel: string): FastifyPreHandler;
    /**
     * Creates Express role-based authorization middleware
     * @llm-rule WHEN: Protecting routes that require specific role.level (Express)
     * @llm-rule AVOID: Using without requireLogin - this assumes user is already authenticated
     * @llm-rule NOTE: Role inheritance applies - admin.org can access admin.tenant routes
     */
    requireRoleExpress(requiredRoleLevel: string): ExpressMiddleware;
    /**
     * Creates Fastify permission-based authorization middleware
     * @llm-rule WHEN: Protecting routes that require specific permissions (Fastify)
     * @llm-rule AVOID: Using without requireLogin - this assumes user is already authenticated
     * @llm-rule NOTE: Permission inheritance applies - manage:tenant can access edit:tenant routes
     */
    requirePermission(permission: string): FastifyPreHandler;
    /**
     * Creates Express permission-based authorization middleware
     * @llm-rule WHEN: Protecting routes that require specific permissions (Express)
     * @llm-rule AVOID: Using without requireLogin - this assumes user is already authenticated
     * @llm-rule NOTE: Permission inheritance applies - manage:tenant can access edit:tenant routes
     */
    requirePermissionExpress(permission: string): ExpressMiddleware;
    /**
     * Creates API token authentication middleware for service-to-service communication
     * @llm-rule WHEN: Protecting API routes that need token-based authentication
     * @llm-rule AVOID: Using for user-facing routes - use requireLogin instead
     * @llm-rule NOTE: Sets req.token instead of req.user for API authentication
     */
    requireToken(options?: MiddlewareOptions): FastifyPreHandler;
    /**
     * Gets default token extractor that checks headers, cookies, and query params
     * @llm-rule WHEN: Need custom token extraction logic
     * @llm-rule AVOID: Modifying directly - pass custom getToken to middleware options
     */
    private getDefaultTokenExtractor;
}
//# sourceMappingURL=auth.d.ts.map