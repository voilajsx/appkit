/**
 * Universal middleware for Express, Fastify, and other frameworks
 * @module @voilajsx/appkit/db
 * @file src/db/middleware.js
 */

import { createDatabaseError, validateTenantId } from './defaults.js';

/**
 * Creates universal middleware for automatic tenant detection
 * @param {Object} db - Database instance
 * @param {Object} [options] - Middleware configuration options
 * @param {string} [options.headerName] - Header name for tenant ID
 * @param {string} [options.paramName] - URL parameter name for tenant ID
 * @param {string} [options.queryName] - Query parameter name for tenant ID
 * @param {boolean} [options.required] - Whether tenant ID is required
 * @param {boolean} [options.autoCreate] - Whether to auto-create missing tenants
 * @param {Function} [options.onError] - Custom error handler
 * @returns {Function} Universal middleware function
 */
export function createMiddleware(db, options = {}) {
  if (!db) {
    throw createDatabaseError('Database instance is required', 500);
  }

  // Default options with smart defaults
  const config = {
    headerName: 'x-tenant-id',
    paramName: 'tenantId',
    queryName: 'tenantId',
    required: true,
    autoCreate: false,
    onError: null,
    ...options,
  };

  return async (req, res, next) => {
    try {
      const framework = detectFramework(req, res);

      // Extract tenant ID from various sources
      const tenantId = extractTenantId(req, config);

      // Handle missing tenant ID
      if (!tenantId) {
        if (config.required) {
          const error = createDatabaseError('Tenant ID is required', 400, {
            sources: [
              `Header: ${config.headerName}`,
              `Param: ${config.paramName}`,
              `Query: ${config.queryName}`,
              'Body: tenantId',
              'User: user.tenantId',
            ],
          });
          return handleError(error, req, res, next, framework, config);
        }

        // Continue without tenant context if not required
        return callNext(next, framework);
      }

      // Validate tenant ID format
      if (!validateTenantId(tenantId)) {
        const error = createDatabaseError(
          'Invalid tenant ID format. Use alphanumeric characters, underscores, and hyphens only',
          400
        );
        return handleError(error, req, res, next, framework, config);
      }

      // Check if tenant exists
      const tenantExists = await db.exists(tenantId);

      if (!tenantExists) {
        if (config.autoCreate) {
          // Auto-create tenant if enabled
          try {
            await db.createTenant(tenantId);
          } catch (createError) {
            const error = createDatabaseError(
              `Failed to auto-create tenant '${tenantId}': ${createError.message}`,
              500
            );
            return handleError(error, req, res, next, framework, config);
          }
        } else {
          const error = createDatabaseError(
            `Tenant '${tenantId}' not found`,
            404
          );
          return handleError(error, req, res, next, framework, config);
        }
      }

      // Get tenant-specific database connection
      const tenantDb = await db.tenant(tenantId);

      // Set tenant context on request
      req.db = tenantDb;
      req.tenantId = tenantId;

      // Add helper methods to request
      req.switchTenant = async (newTenantId) => {
        if (!validateTenantId(newTenantId)) {
          throw createDatabaseError('Invalid tenant ID format', 400);
        }

        const exists = await db.exists(newTenantId);
        if (!exists) {
          throw createDatabaseError(`Tenant '${newTenantId}' not found`, 404);
        }

        req.db = await db.tenant(newTenantId);
        req.tenantId = newTenantId;
        return req.db;
      };

      callNext(next, framework);
    } catch (error) {
      handleError(error, req, res, next, framework, config);
    }
  };
}

/**
 * Detects the web framework being used
 * @private
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {string} Framework name ('express', 'fastify', 'koa', 'unknown')
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
 * Extracts tenant ID from various request sources
 * @private
 * @param {Object} req - Request object
 * @param {Object} config - Configuration options
 * @returns {string|null} Tenant ID or null if not found
 */
function extractTenantId(req, config) {
  // Check sources in order of preference
  const sources = [
    // Headers (most reliable for APIs)
    () =>
      req.headers?.[config.headerName] ||
      req.headers?.[config.headerName.toLowerCase()],

    // URL parameters (for REST APIs)
    () => req.params?.[config.paramName],

    // Query parameters (for simple cases)
    () => req.query?.[config.queryName],

    // Request body (for form submissions)
    () => req.body?.[config.paramName],

    // User context (from authentication)
    () => req.user?.tenantId,
    () => req.tenant?.id,

    // Subdomain extraction (for subdomain-based tenancy)
    () => extractFromSubdomain(req),

    // Custom extraction (if provided)
    () => config.extract?.(req),
  ];

  for (const source of sources) {
    try {
      const tenantId = source();
      if (tenantId && typeof tenantId === 'string') {
        return tenantId.trim();
      }
    } catch (error) {
      // Continue to next source if extraction fails
      console.debug('Tenant extraction failed for source:', error.message);
    }
  }

  return null;
}

/**
 * Extracts tenant ID from subdomain
 * @private
 * @param {Object} req - Request object
 * @returns {string|null} Tenant ID from subdomain or null
 */
function extractFromSubdomain(req) {
  try {
    const host = req.headers?.host || req.hostname || req.get?.('host');
    if (!host) return null;

    // Remove port if present
    const hostname = host.split(':')[0];

    // Split by dots and get first part (subdomain)
    const parts = hostname.split('.');

    // Need at least 3 parts for subdomain (subdomain.domain.tld)
    if (parts.length >= 3) {
      const subdomain = parts[0];

      // Skip common subdomains that aren't tenants
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
 * @private
 * @param {Error} error - Error to handle
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 * @param {string} framework - Detected framework
 * @param {Object} config - Configuration options
 */
function handleError(error, req, res, next, framework, config) {
  console.error('Database middleware error:', error.message);

  // Use custom error handler if provided
  if (config.onError && typeof config.onError === 'function') {
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
 * @private
 * @param {Function} next - Next function
 * @param {string} framework - Detected framework
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
 * @param {Object} [options] - Middleware options
 * @returns {Function} Express middleware function
 */
export function expressMiddleware(db, options = {}) {
  return createMiddleware(db, options);
}

/**
 * Creates Fastify plugin (Fastify-specific helper)
 * @param {Object} db - Database instance
 * @param {Object} [options] - Plugin options
 * @returns {Function} Fastify plugin function
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
            resolve();
          }
        });
      });
    });
  };
}

/**
 * Creates Koa middleware (Koa-specific helper)
 * @param {Object} db - Database instance
 * @param {Object} [options] - Middleware options
 * @returns {Function} Koa middleware function
 */
export function koaMiddleware(db, options = {}) {
  const middleware = createMiddleware(db, options);

  return async (ctx, next) => {
    return new Promise((resolve, reject) => {
      middleware(ctx.request, ctx.response, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    }).then(() => next());
  };
}
