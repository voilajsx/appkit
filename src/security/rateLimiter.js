/**
 * @voilajs/appkit - Rate limiting middleware
 * @module @voilajs/appkit/security/rateLimiter
 */

// In-memory store for rate limiting
const memoryStore = new Map();

/**
 * Creates rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} [options.message] - Error message
 * @param {Function} [options.keyGenerator] - Function to generate key
 * @param {Object} [options.store] - Custom store implementation
 * @returns {Function} Express middleware function
 */
export function createRateLimiter(options) {
  if (!options || !options.windowMs || !options.max) {
    throw new Error('windowMs and max are required options');
  }

  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) =>
      req.ip || (req.connection && req.connection.remoteAddress) || 'unknown',
    store = memoryStore,
  } = options;

  // Clean old entries periodically
  if (store === memoryStore && !global._rateLimitCleanupInitialized) {
    setInterval(
      () => {
        const now = Date.now();
        for (const [key, record] of memoryStore.entries()) {
          if (now > record.resetTime) {
            memoryStore.delete(key);
          }
        }
      },
      Math.min(windowMs, 60000)
    );
    global._rateLimitCleanupInitialized = true;
  }

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or create record
    let record = store.get(key);
    if (!record) {
      record = { count: 0, resetTime: now + windowMs };
      store.set(key, record);
    } else if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    // Increment count
    record.count++;

    // Set headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    // Check limit
    if (record.count > max) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}
