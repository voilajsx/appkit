/**
 * Universal middleware for Express, Fastify, Koa and other frameworks
 * @module @voilajsx/appkit/db
 * @file src/db/middleware.ts
 */

import { 
  createDatabaseError, 
  validateTenantId, 
  validateOrgId,
  type DatabaseConfig 
} from './defaults';
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

type FrameworkType = 'express' | 'fastify' | 'koa' | 'hapi' | 'unknown';

/**
 * Creates universal middleware for automatic tenant/org detection
 */
export function createMiddleware(
  db: DatabaseClass,
  options: MiddlewareConfig = {}
): Function {
  if (!db) {
    throw createDatabaseError('Database instance is required', 500);
  }

  // Default options with smart defaults
  const config: Required<MiddlewareConfig> = {
    tenantHeader: 'x-tenant-id',
    tenantParam: 'tenantId',
    tenantRequired: false,
    orgHeader: 'x-org-id',
    orgParam: 'orgId',
    orgRequired: false,
    autoCreate: false,
    onError: null,
    extractTenant: null,
    extractOrg: null,
    ...options,
  } as Required<MiddlewareConfig>;

  return async (req: RequestWithDatabase, res: any, next: any) => {
    try {
      const framework = detectFramework(req, res);

      // Extract org and tenant IDs from various sources
      const orgId = extractOrgId(req, config);
      const tenantId = extractTenantId(req, config);

      // Validate org ID if provided
      if (orgId && !validateOrgId(orgId)) {
        const error = createDatabaseError(
          'Invalid organization ID format. Use alphanumeric characters, underscores, and hyphens only',
          400
        );
        return handleError(error, req, res, next, framework, config);
      }

      // Validate tenant ID if provided
      if (tenantId && !validateTenantId(tenantId)) {
        const error = createDatabaseError(
          'Invalid tenant ID format. Use alphanumeric characters, underscores, and hyphens only',
          400
        );
        return handleError(error, req, res, next, framework, config);
      }

      // Handle missing org ID
      if (config.orgRequired && !orgId) {
        const error = createDatabaseError(
          'Organization ID is required',
          400,
          {
            sources: [
              `Header: ${config.orgHeader}`,
              `Param: ${config.orgParam}`,
              'User: user.orgId',
            ],
          }
        );
        return handleError(error, req, res, next, framework, config);
      }

      // Handle missing tenant ID
      if (config.tenantRequired && !tenantId) {
        const error = createDatabaseError(
          'Tenant ID is required',
          400,
          {
            sources: [
              `Header: ${config.tenantHeader}`,
              `Param: ${config.tenantParam}`,
              'User: user.tenantId',
            ],
          }
        );
        return handleError(error, req, res, next, framework, config);
      }

      // Set up database connection based on org/tenant combination
      if (orgId && tenantId) {
        // Org + Tenant mode
        await setupOrgTenantDatabase(req, db, orgId, tenantId, config);
      } else if (orgId) {
        // Org-only mode
        await setupOrgDatabase(req, db, orgId, config);
      } else if (tenantId) {
        // Tenant-only mode
        await setupTenantDatabase(req, db, tenantId, config);
      } else {
        // No org/tenant - use default database
        req.db = await db.client();
      }

      // Add helper methods to request
      addHelperMethods(req, db, orgId, tenantId);

      callNext(next, framework);
    } catch (error: any) {
      handleError(error, req, res, next, framework, config);
    }
  };
}

/**
 * Sets up org + tenant database connection
 */
async function setupOrgTenantDatabase(
  req: RequestWithDatabase,
  db: DatabaseClass,
  orgId: string,
  tenantId: string,
  config: Required<MiddlewareConfig>
): Promise<void> {
  // Check if org exists
  const orgExists = await checkOrgExists(db, orgId);
  if (!orgExists) {
    if (config.autoCreate) {
      await db.createOrg(orgId);
    } else {
      throw createDatabaseError(`Organization '${orgId}' not found`, 404);
    }
  }

  // Check if tenant exists within org
  const tenantExists = await db.exists(tenantId, { orgId });
  if (!tenantExists) {
    if (config.autoCreate) {
      await db.createTenant(tenantId, { orgId });
    } else {
      throw createDatabaseError(
        `Tenant '${tenantId}' not found in organization '${orgId}'`,
        404
      );
    }
  }

  // Get tenant-specific database within org
  req.db = await db.tenant(tenantId, { orgId });
  req.orgId = orgId;
  req.tenantId = tenantId;
}

/**
 * Sets up org-only database connection
 */
async function setupOrgDatabase(
  req: RequestWithDatabase,
  db: DatabaseClass,
  orgId: string,
  config: Required<MiddlewareConfig>
): Promise<void> {
  // Check if org exists
  const orgExists = await checkOrgExists(db, orgId);
  if (!orgExists) {
    if (config.autoCreate) {
      await db.createOrg(orgId);
    } else {
      throw createDatabaseError(`Organization '${orgId}' not found`, 404);
    }
  }

  // Get org-specific database
  req.db = await db.client({ orgId });
  req.orgId = orgId;
}

/**
 * Sets up tenant-only database connection
 */
async function setupTenantDatabase(
  req: RequestWithDatabase,
  db: DatabaseClass,
  tenantId: string,
  config: Required<MiddlewareConfig>
): Promise<void> {
  // Check if tenant exists
  const tenantExists = await db.exists(tenantId);
  if (!tenantExists) {
    if (config.autoCreate) {
      await db.createTenant(tenantId);
    } else {
      throw createDatabaseError(`Tenant '${tenantId}' not found`, 404);
    }
  }

  // Get tenant-specific database
  req.db = await db.tenant(tenantId);
  req.tenantId = tenantId;
}

/**
 * Checks if organization exists (with fallback for different strategies)
 */
async function checkOrgExists(db: DatabaseClass, orgId: string): Promise<boolean> {
  try {
    // Try the standard org existence check
    if (typeof (db as any).orgExists === 'function') {
      return await (db as any).orgExists(orgId);
    }

    // Fallback: try to get org client and see if it works
    try {
      const orgClient = await db.client({ orgId });
      return !!orgClient;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Adds helper methods to the request object
 */
function addHelperMethods(
  req: RequestWithDatabase,
  db: DatabaseClass,
  orgId?: string,
  tenantId?: string
): void {
  // Switch tenant within current org
  req.switchTenant = async (newTenantId: string) => {
    if (!validateTenantId(newTenantId)) {
      throw createDatabaseError('Invalid tenant ID format', 400);
    }

    const exists = await db.exists(newTenantId, orgId ? { orgId } : undefined);
    if (!exists) {
      throw createDatabaseError(`Tenant '${newTenantId}' not found`, 404);
    }

    req.db = await db.tenant(newTenantId, orgId ? { orgId } : undefined);
    req.tenantId = newTenantId;
    return req.db;
  };

  // Switch org (if org mode is supported)
  req.switchOrg = async (newOrgId: string) => {
    if (!validateOrgId(newOrgId)) {
      throw createDatabaseError('Invalid organization ID format', 400);
    }

    const exists = await checkOrgExists(db, newOrgId);
    if (!exists) {
      throw createDatabaseError(`Organization '${newOrgId}' not found`, 404);
    }

    if (tenantId) {
      // Switch to tenant within new org
      req.db = await db.tenant(tenantId, { orgId: newOrgId });
    } else {
      // Switch to org-only database
      req.db = await db.client({ orgId: newOrgId });
    }
    
    req.orgId = newOrgId;
    return req.db;
  };
}

/**
 * Detects the web framework being used
 */
function detectFramework(req: any, res: any): FrameworkType {
  // Fastify detection
  if (
    res.code &&
    typeof res.code === 'function' &&
    res.send &&
    typeof res.send === 'function'
  ) {
    return 'fastify';
  }

  // Express detection
  if (
    res.status &&
    typeof res.status === 'function' &&
    res.json &&
    typeof res.json === 'function'
  ) {
    return 'express';
  }

  // Koa detection
  if (req.ctx && res.body !== undefined) {
    return 'koa';
  }

  // Hapi detection
  if (res.response && typeof res.response === 'function') {
    return 'hapi';
  }

  return 'unknown';
}

/**
 * Extracts organization ID from various request sources
 */
function extractOrgId(req: any, config: Required<MiddlewareConfig>): string | null {
  // Use custom extractor if provided
  if (config.extractOrg) {
    const customOrgId = config.extractOrg(req);
    if (customOrgId) return customOrgId.trim();
  }

  // Check sources in order of preference
  const sources = [
    // Headers (most reliable for APIs)
    () => req.headers?.[config.orgHeader] || req.headers?.[config.orgHeader.toLowerCase()],

    // URL parameters (for REST APIs)
    () => req.params?.[config.orgParam],

    // Query parameters
    () => req.query?.[config.orgParam],

    // Request body
    () => req.body?.[config.orgParam],

    // User context (from authentication)
    () => req.user?.orgId,
    () => req.org?.id,

    // Subdomain extraction
    () => extractFromSubdomain(req, 'org'),
  ];

  for (const source of sources) {
    try {
      const orgId = source();
      if (orgId && typeof orgId === 'string') {
        return orgId.trim();
      }
    } catch (error) {
      // Continue to next source if extraction fails
      continue;
    }
  }

  return null;
}

/**
 * Extracts tenant ID from various request sources
 */
function extractTenantId(req: any, config: Required<MiddlewareConfig>): string | null {
  // Use custom extractor if provided
  if (config.extractTenant) {
    const customTenantId = config.extractTenant(req);
    if (customTenantId) return customTenantId.trim();
  }

  // Check sources in order of preference
  const sources = [
    // Headers (most reliable for APIs)
    () => req.headers?.[config.tenantHeader] || req.headers?.[config.tenantHeader.toLowerCase()],

    // URL parameters (for REST APIs)
    () => req.params?.[config.tenantParam],

    // Query parameters
    () => req.query?.[config.tenantParam],

    // Request body
    () => req.body?.[config.tenantParam],

    // User context (from authentication)
    () => req.user?.tenantId,
    () => req.tenant?.id,

    // Subdomain extraction (for tenant subdomains)
    () => extractFromSubdomain(req, 'tenant'),
  ];

  for (const source of sources) {
    try {
      const tenantId = source();
      if (tenantId && typeof tenantId === 'string') {
        return tenantId.trim();
      }
    } catch (error) {
      // Continue to next source if extraction fails
      continue;
    }
  }

  return null;
}

/**
 * Extracts ID from subdomain
 */
function extractFromSubdomain(req: any, type: 'org' | 'tenant'): string | null {
  try {
    const host = req.headers?.host || req.hostname || req.get?.('host');
    if (!host) return null;

    // Remove port if present
    const hostname = host.split(':')[0];

    // Split by dots and get parts
    const parts = hostname.split('.');

    // Need at least 3 parts for subdomain (subdomain.domain.tld)
    if (parts.length >= 3) {
      const subdomain = parts[0];

      // Skip common subdomains that aren't tenants/orgs
      const skipSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp'];
      if (!skipSubdomains.includes(subdomain.toLowerCase())) {
        return subdomain;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Handles errors in a framework-specific way
 */
function handleError(
  error: any,
  req: any,
  res: any,
  next: any,
  framework: FrameworkType,
  config: Required<MiddlewareConfig>
): void {
  console.error('Database middleware error:', error.message);

  // Use custom error handler if provided
  if (config.onError) {
    return config.onError(error, req, res, next);
  }

  const statusCode = error.statusCode || 500;
  const errorResponse = {
    error: 'Database error',
    message: error.message,
    ...(error.details && { details: error.details }),
  };

  switch (framework) {
    case 'fastify':
      return res.code(statusCode).send(errorResponse);

    case 'express':
      return res.status(statusCode).json(errorResponse);

    case 'koa':
      res.status = statusCode;
      res.body = errorResponse;
      return;

    case 'hapi':
      return res.response(errorResponse).code(statusCode);

    default:
      // For unknown frameworks, try Express-style first, then call next
      if (res.status && typeof res.status === 'function') {
        return res.status(statusCode).json(errorResponse);
      }

      // Fallback to calling next with error
      error.statusCode = statusCode;
      return next(error);
  }
}

/**
 * Calls next function in a framework-appropriate way
 */
function callNext(next: any, framework: FrameworkType): void {
  if (framework === 'koa') {
    // Koa uses async/await, so we just return
    return;
  }

  // For Express, Fastify, and others, call next
  next();
}

/**
 * Creates Express-style middleware (backward compatibility)
 */
export function expressMiddleware(
  db: DatabaseClass,
  options: MiddlewareConfig = {}
): Function {
  return createMiddleware(db, options);
}

/**
 * Creates Fastify plugin
 */
export function fastifyPlugin(
  db: DatabaseClass,
  options: MiddlewareConfig = {}
): Function {
  return async function (fastify: any, opts: any) {
    const middleware = createMiddleware(db, { ...options, ...opts });

    fastify.addHook('preHandler', async (request: any, reply: any) => {
      return new Promise((resolve, reject) => {
        middleware(request, reply, (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      });
    });
  };
}

/**
 * Creates Koa middleware
 */
export function koaMiddleware(
  db: DatabaseClass,
  options: MiddlewareConfig = {}
): Function {
  const middleware = createMiddleware(db, options);

  return async (ctx: any, next: any) => {
    return new Promise((resolve, reject) => {
      middleware(ctx.request, ctx.response, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    }).then(() => next());
  };
}