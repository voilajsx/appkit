/**
 * Universal middleware for Express, Fastify, Koa and other frameworks
 * @module @voilajsx/appkit/db
 * @file src/db/middleware.ts
 */
import type { DatabaseClass } from './database';
export interface MiddlewareConfig {
    tenantHeader?: string;
    tenantParam?: string;
    tenantRequired?: boolean;
    orgHeader?: string;
    orgParam?: string;
    orgRequired?: boolean;
    autoCreate?: boolean;
    onError?: (error: Error, req: any, res: any, next: any) => void;
    extractTenant?: (req: any) => string | null;
    extractOrg?: (req: any) => string | null;
}
export interface RequestWithDatabase {
    db?: any;
    tenantId?: string;
    orgId?: string;
    switchTenant?: (tenantId: string) => Promise<any>;
    switchOrg?: (orgId: string) => Promise<any>;
}
/**
 * Creates universal middleware for automatic tenant/org detection
 */
export declare function createMiddleware(db: DatabaseClass, options?: MiddlewareConfig): Function;
/**
 * Creates Express-style middleware (backward compatibility)
 */
export declare function expressMiddleware(db: DatabaseClass, options?: MiddlewareConfig): Function;
/**
 * Creates Fastify plugin
 */
export declare function fastifyPlugin(db: DatabaseClass, options?: MiddlewareConfig): Function;
/**
 * Creates Koa middleware
 */
export declare function koaMiddleware(db: DatabaseClass, options?: MiddlewareConfig): Function;
