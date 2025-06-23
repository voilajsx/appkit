/**
 * Universal middleware for Express, Fastify, Koa and other frameworks
 * @module @voilajsx/appkit/db
 * @file src/db/middleware.js
 */

import {
  createDatabaseError,
  validateTenantId,
  validateOrgId,
} from './defaults.js';

/**
 * Creates universal middleware for automatic tenant/org detection
 * @param {Object} db - Database instance
 * @param {Object} [options={}] - Middleware configuration options
 * @param {string} [options.tenantHeader='x-tenant-id'] - Header name for tenant ID
 * @param {string} [options.tenantParam='tenantId'] - URL parameter name for tenant ID
 * @param {boolean} [options.tenantRequired=false] - Require tenant ID
 * @param {string} [options.orgHeader='x-org-id'] - Header name for org ID
 * @param {string} [options.orgParam='orgId'] - URL parameter name for org ID
 * @param {boolean} [options.orgRequired=false] - Require org ID
 * @param {boolean} [options.autoCreate=false] - Auto-create missing tenants/orgs
 * @param {Function} [options.onError] - Custom error handler
 * @param {Function} [options.extractTenant] - Custom tenant extraction function
 * @param {Function} [options.extractOrg] - Custom org extraction function
 * @returns {Function} Middleware function
 */
export function createMiddleware(db, options = {}) {
  if (!db) {
    throw createDatabaseError('Database instance is required', 500);
  }

  // Default options with smart defaults
  const config = {
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
  };

  return async (req, res, next) => {
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
        const error = createDatabaseError('Organization ID is required', 400, {
          sources: [
            `Header: ${config.orgHeader}`,
            `Param: ${config.orgParam}`,
            'User: user.orgId',
          ],
        });
        return handleError(error, req, res, next, framework, config);
      }

      // Handle missing tenant ID
      if (config.tenantRequired && !tenantId) {
        const error = createDatabaseError('Tenant ID is required', 400, {
          sources: [
            `Header: ${config.tenantHeader}`,
            `Param: ${config.tenantParam}`,
            'User: user.tenantId',
          ],
        });
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
    } catch (error) {
      handleError(error, req, res, next, framework, config);
    }
  };
}

/**
 * Sets up org + tenant database connection
 * @param {Object} req - Request object
 * @param {Object} db - Database instance
 * @param {string} orgId - Organization ID
 * @param {string} tenantId - Tenant ID
 * @param {Object} config - Middleware config
 */
async function setupOrgTenantDatabase(req, db, orgId, tenantId, config) {
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
 * @param {Object} req - Request object
 * @param {Object} db - Database instance
 * @param {string} orgId - Organization ID
 * @param {Object} config - Middleware config
 */
async function setupOrgDatabase(req, db, orgId, config) {
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
 * @param {Object} req - Request object
 * @param {Object} db - Database instance
 * @param {string} tenantId - Tenant ID
 * @param {Object} config - Middleware config
 */
async function setupTenantDatabase(req, db, tenantId, config) {
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
 * @param {Object} db - Database instance
 * @param {string} orgId - Organization ID
 * @returns {Promise<boolean>}
 */
async function checkOrgExists(db, orgId) {
  try {
    // Try the standard org existence check
    if (typeof db.orgExists === 'function') {
      return await db.orgExists(orgId);
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
 * @param {Object} req - Request object
 * @param {Object} db - Database instance
 * @param {string} [orgId] - Organization ID
 * @param {string} [tenantId] - Tenant ID
 */
function addHelperMethods(req, db, orgId, tenantId) {
  // Switch tenant within current org
  req.switchTenant = async (newTenantId) => {
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
  req.switchOrg = async (newOrgId) => {
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
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {string} Framework type
 */
function detectFramework(req, res) {
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
 * @param {Object} req - Request object
 * @param {Object} config - Middleware config
 * @returns {string|null} Organization ID or null
 */
function extractOrgId(req, config) {
  // Use custom extractor if provided
  if (config.extractOrg) {
    const customOrgId = config.extractOrg(req);
    if (customOrgId) return customOrgId.trim();
  }

  // Check sources in order of preference
  const sources = [
    // Headers (most reliable for APIs)
    () =>
      req.headers?.[config.orgHeader] ||
      req.headers?.[config.orgHeader.toLowerCase()],

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
 * @param {Object} req - Request object
 * @param {Object} config - Middleware config
 * @returns {string|null} Tenant ID or null
 */
function extractTenantId(req, config) {
  // Use custom extractor if provided
  if (config.extractTenant) {
    const customTenantId = config.extractTenant(req);
    if (customTenantId) return customTenantId.trim();
  }

  // Check sources in order of preference
  const sources = [
    // Headers (most reliable for APIs)
    () =>
      req.headers?.[config.tenantHeader] ||
      req.headers?.[config.tenantHeader.toLowerCase()],

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
 * @param {Object} req - Request object
 * @param {string} type - 'org' or 'tenant'
 * @returns {string|null} Extracted ID or null
 */
function extractFromSubdomain(req, type) {
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
 * @param {Error} error - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 * @param {string} framework - Framework type
 * @param {Object} config - Middleware config
 */
function handleError(error, req, res, next, framework, config) {
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
 * @param {Function} next - Next function
 * @param {string} framework - Framework type
 */
function callNext(next, framework) {
  if (framework === 'koa') {
    // Koa uses async/await, so we just return
    return;
  }

  // For Express, Fastify, and others, call next
  next();
}

/**
 * Creates Express-style middleware (backward compatibility)
 * @param {Object} db - Database instance
 * @param {Object} [options={}] - Middleware options
 * @returns {Function} Express middleware
 */
export function expressMiddleware(db, options = {}) {
  return createMiddleware(db, options);
}

/**
 * Creates Fastify plugin
 * @param {Object} db - Database instance
 * @param {Object} [options={}] - Plugin options
 * @returns {Function} Fastify plugin
 */
export function fastifyPlugin(db, options = {}) {
  return async function (fastify, opts) {
    const middleware = createMiddleware(db, { ...options, ...opts });

    fastify.addHook('preHandler', async (request, reply) => {
      return new Promise((resolve, reject) => {
        middleware(request, reply, (error) => {
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
 * @param {Object} db - Database instance
 * @param {Object} [options={}] - Middleware options
 * @returns {Function} Koa middleware
 */
export function koaMiddleware(db, options = {}) {
  const middleware = createMiddleware(db, options);

  return async (ctx, next) => {
    return new Promise((resolve, reject) => {
      middleware(ctx.request, ctx.response, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    }).then(() => next());
  };
}
