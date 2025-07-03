/**
 * Core authentication class with role-level-permission system
 * @module @voilajsx/appkit/auth
 * @file src/auth/authentication.ts
 *
 * @llm-rule WHEN: Building apps that need JWT operations, password hashing, and role-based middleware
 * @llm-rule AVOID: Using directly - always get instance via authenticator.get()
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
     * Compares a plain text password against a hashed password
     * @llm-rule WHEN: User login - verify input password against stored hash
     * @llm-rule AVOID: Comparing hashed passwords directly - use this method for timing attack protection
     */
    comparePassword(password: string, hash: string): Promise<boolean>;
    /**
     * Checks if user has a specific role.level (with inheritance)
     * @llm-rule WHEN: Checking if user meets minimum role requirement
     * @llm-rule AVOID: Exact string matching - use this for hierarchy checking
     * @llm-rule NOTE: Inheritance works upward - admin.org has admin.tenant access, not vice versa
     * @llm-rule NOTE: admin.org automatically has admin.tenant access via inheritance
     */
    hasRole(userRoleLevel: string, requiredRoleLevel: string): boolean;
    /**
     * Checks if user has a specific permission
     * @llm-rule WHEN: Checking fine-grained permissions beyond role hierarchy
     * @llm-rule AVOID: Manual permission array checking - this handles manage:scope fallbacks
     * @llm-rule NOTE: manage:tenant permission automatically grants edit:tenant, view:tenant, etc.
     */
    can(user: JwtPayload, permission: string): boolean;
    /**
     * Creates Fastify-native authentication middleware for login-based routes
     * @llm-rule WHEN: Protecting routes that need authenticated users (Fastify framework)
     * @llm-rule AVOID: Using without requireRole/requirePermission - this only validates token
     * @llm-rule AVOID: Using with Express - use requireLoginExpress() for Express apps
     */
    requireLogin(options?: MiddlewareOptions): FastifyPreHandler;
    /**
     * Creates Fastify-native token validation middleware for API-to-API communication
     * @llm-rule WHEN: Protecting API endpoints for service-to-service calls (Fastify framework)
     * @llm-rule AVOID: Using for user-facing routes - use requireLogin instead
     * @llm-rule AVOID: Using with Express - use requireTokenExpress() for Express apps
     */
    requireToken(options?: MiddlewareOptions): FastifyPreHandler;
    /**
     * Creates Fastify-native role-level authorization middleware
     * @llm-rule WHEN: Protecting routes that need minimum role.level access (Fastify framework)
     * @llm-rule AVOID: Using with exact role matching - this uses inheritance hierarchy
     * @llm-rule AVOID: Using with Express - use requireRoleExpress() for Express apps
     * @llm-rule NOTE: Use this for hierarchy-based access (admin.org gets admin.tenant access)
     */
    requireRole(requiredRoleLevel: string): FastifyPreHandler;
    /**
     * Creates Fastify-native permission-based authorization middleware
     * @llm-rule WHEN: Protecting routes that need specific action:scope permissions (Fastify framework)
     * @llm-rule AVOID: Using for simple role checks - use requireRole for hierarchy-based access
     * @llm-rule AVOID: Using with Express - use requirePermissionExpress() for Express apps
     * @llm-rule NOTE: Use this for action-specific access (edit:tenant, view:org, etc.)
     */
    requirePermission(requiredPermission: string): FastifyPreHandler;
    /**
     * Gets user from request object safely (works with both requireLogin and requireToken)
     * @llm-rule WHEN: Need to access user data from authenticated requests
     * @llm-rule AVOID: Accessing req.user or req.token directly - WILL crash app when undefined
     * @llm-rule NOTE: Always returns null safely - never throws undefined errors
     */
    user(request: FastifyRequest): JwtPayload | null;
    /**
     * Gets default token extraction function for Fastify
     */
    getDefaultTokenExtractor(): (request: FastifyRequest) => string | null;
    /**
     * Express adapter - converts Fastify middleware to work with Express
     * @llm-rule WHEN: Using Express framework instead of Fastify
     * @llm-rule AVOID: Using Fastify methods directly in Express - use *Express variants
     */
    toExpress(fastifyMiddleware: FastifyPreHandler): ExpressMiddleware;
    /**
     * Express convenience methods (using the adapter)
     * @llm-rule WHEN: Using Express framework - these handle Fastify-to-Express conversion automatically
     * @llm-rule AVOID: Mixing Fastify and Express methods - stick to one framework's methods
     * @llm-rule AVOID: Using requireLogin() with Express - use these Express variants instead
     */
    requireLoginExpress(options?: MiddlewareOptions): ExpressMiddleware;
    requireTokenExpress(options?: MiddlewareOptions): ExpressMiddleware;
    requireRoleExpress(requiredRoleLevel: string): ExpressMiddleware;
    requirePermissionExpress(requiredPermission: string): ExpressMiddleware;
}
//# sourceMappingURL=authentication.d.ts.map