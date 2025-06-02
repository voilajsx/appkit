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
export function createMiddleware(db) {
  if (!db) {
    throw new Error('Database instance is required');
  }

  return async (req, res, next) => {
    try {
      const tenantId = getTenantId(req);

      if (!tenantId) {
        return handleError(new Error('Tenant ID is required'), req, res);
      }

      // Check if tenant exists
      const exists = await db.tenantExists(tenantId);
      if (!exists) {
        return handleError(
          new Error(`Tenant '${tenantId}' not found`),
          req,
          res
        );
      }

      // Set tenant database connection
      req.db = await db.forTenant(tenantId);
      req.tenantId = tenantId;

      next();
    } catch (error) {
      handleError(error, req, res);
    }
  };
}

/**
 * Extracts tenant ID from request
 * @private
 * @param {Object} req - Express request object
 * @returns {string|null} Tenant ID or null if not found
 */
function getTenantId(req) {
  // Check multiple sources in order of preference
  return (
    req.headers['x-tenant-id'] ||
    req.query.tenantId ||
    req.params.tenantId ||
    req.tenant?.id ||
    req.user?.tenantId ||
    req.body?.tenantId ||
    null
  );
}

/**
 * Handles middleware errors
 * @private
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function handleError(error, req, res) {
  console.error('Tenant middleware error:', error.message);

  const status = error.message.includes('not found') ? 404 : 400;

  res.status(status).json({
    error: 'Tenant error',
    message: error.message,
  });
}
