/**
 * @voilajsx/appkit - Rate limiting utilities
 * @module @voilajsx/appkit/security/rateLimiter
 * @file src/security/rateLimiter.js
 *
 * Production-ready rate limiting with automatic cleanup and environment-first design.
 */

// In-memory store for rate limiting records
const requestStore = new Map();
let cleanupInitialized = false;

/**
 * Creates security error with status code
 * @private
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {Error} Error with statusCode property
 */
function createSecurityError(message, statusCode = 400, details = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, details);
  return error;
}

/**
 * Initializes cleanup interval for memory management
 * @private
 * @param {number} windowMs - Time window for cleanup interval
 */
function initializeCleanup(windowMs) {
  if (cleanupInitialized) return;

  // Cleanup interval is smaller of windowMs or 60 seconds
  const cleanupInterval = Math.min(windowMs, 60 * 1000);

  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestStore.entries()) {
      if (now > record.resetTime) {
        requestStore.delete(key);
      }
    }
  }, cleanupInterval).unref(); // Allow process to exit

  cleanupInitialized = true;
}

/**
 * Gets unique identifier for the client
 * @private
 * @param {Object} req - Express request object
 * @returns {string} Client identifier
 */
function getClientKey(req) {
  // Use IP address or forwarded IP as client identifier
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Creates rate limiting middleware with environment-first defaults
 * @param {number} [maxRequests] - Max requests per window (uses VOILA_RATE_LIMIT env var)
 * @param {number} [windowMs] - Time window in milliseconds (uses VOILA_RATE_WINDOW env var)
 * @param {Object} [options] - Configuration options
 * @param {string} [options.message] - Custom error message
 * @param {Function} [options.keyGenerator] - Custom key generation function
 * @returns {Function} Express middleware for rate limiting
 */
export function limitRequests(maxRequests, windowMs, options = {}) {
  // Handle argument polymorphism
  if (typeof maxRequests === 'object') {
    options = maxRequests;
    maxRequests = options.maxRequests;
    windowMs = options.windowMs;
  } else if (typeof windowMs === 'object') {
    options = windowMs;
    windowMs = options.windowMs;
  }

  // Environment → Argument → Default pattern
  const max = maxRequests || parseInt(process.env.VOILA_RATE_LIMIT) || 100;

  const window =
    windowMs || parseInt(process.env.VOILA_RATE_WINDOW) || 15 * 60 * 1000; // 15 minutes

  const message =
    options.message ||
    process.env.VOILA_RATE_MESSAGE ||
    'Too many requests, please try again later';

  const keyGenerator = options.keyGenerator || getClientKey;

  // Validate configuration
  if (max < 0 || window <= 0) {
    throw createSecurityError('Invalid rate limit configuration', 500);
  }

  // Initialize cleanup for memory management
  initializeCleanup(window);

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create rate limit record
    let record = requestStore.get(key);
    if (!record) {
      record = { count: 0, resetTime: now + window };
      requestStore.set(key, record);
    } else if (now > record.resetTime) {
      // Reset if window has passed
      record.count = 0;
      record.resetTime = now + window;
    }

    // Increment request count
    record.count++;

    // Set rate limit headers for client information
    if (res.setHeader) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
    }

    // Check if limit exceeded
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      // Set Retry-After header
      if (res.setHeader) {
        res.setHeader('Retry-After', retryAfter);
      }

      const error = createSecurityError(message, 429, {
        retryAfter,
        limit: max,
        remaining: 0,
        resetTime: record.resetTime,
      });

      return next(error);
    }

    next();
  };
}
