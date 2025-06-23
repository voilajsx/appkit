/**
 * @voilajsx/appkit - Tenant middleware
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/middleware.js
 */
/**
 * Creates tenant middleware for Express-like frameworks
 * @param {Object} db - Multi-tenant database instance
 * @returns {Function} Middleware function
 */
export function createMiddleware(db: any): Function;
