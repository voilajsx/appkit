/**
 * @voilajs/appkit - Rate limiting middleware
 * @module @voilajs/appkit/security/rateLimiter
 */

/**
 * Creates rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} [options.message] - Error message
 * @param {Function} [options.keyGenerator] - Function to generate key
 * @returns {Function} Express middleware function
 */
export function createRateLimiter(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('Options object is required');
    }
  
    const {
      windowMs,
      max,
      message = 'Too many requests, please try again later.',
      keyGenerator = defaultKeyGenerator
    } = options;
  
    if (!windowMs || !max) {
      throw new Error('windowMs and max are required options');
    }
  
    // In-memory store for request counts
    const store = new Map();
  
    return (req, res, next) => {
      const key = keyGenerator(req);
      const now = Date.now();
      
      // Get or create record for this key
      let record = store.get(key);
      
      if (!record) {
        record = {
          count: 0,
          resetTime: now + windowMs
        };
        store.set(key, record);
      }
  
      // Reset if window has passed
      if (now > record.resetTime) {
        record.count = 0;
        record.resetTime = now + windowMs;
      }
  
      // Increment count
      record.count++;
  
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
  
      // Check if limit exceeded
      if (record.count > max) {
        res.status(429).json({
          error: 'Too Many Requests',
          message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        });
        return;
      }
  
      next();
    };
  }
  
  /**
   * Default key generator - uses IP address
   * @private
   */
  function defaultKeyGenerator(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0] ||
           'unknown';
  }
  
  // Periodic cleanup of expired entries
  setInterval(() => {
    const now = Date.now();
    const store = global.rateLimitStore || new Map();
    
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 60000); // Clean up every minute