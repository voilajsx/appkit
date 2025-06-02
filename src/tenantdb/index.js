/**
 * @voilajsx/appkit - Multi-tenant database module
 * @module @voilajsx/appkit/tenantdb
 * @file src/tenantdb/index.js
 */

// Main database functions
export { createDb } from './database.js';

// Middleware function
export { createMiddleware } from './middleware.js';

// Strategy classes (for advanced users)
export { RowStrategy } from './strategies/row.js';
export { DatabaseStrategy } from './strategies/database.js';

// Adapter classes (for advanced users)
export { PrismaAdapter } from './adapters/prisma.js';
export { MongooseAdapter } from './adapters/mongoose.js';
