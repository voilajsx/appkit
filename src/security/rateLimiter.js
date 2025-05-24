/**
 * @voilajsx/appkit - Rate Limiting middleware
 * @module @voilajsx/appkit/security/rateLimiter
 *
 * Provides rate limiting functionality to protect routes from abuse.
 */

// Module-scoped in-memory store for rate limiting records
// This is used as the default store if no custom store is provided.
const memoryStore = new Map();
// Flag to ensure the cleanup interval for the default memoryStore is initialized only once.
let _memoryStoreCleanupInitialized = false;

/**
 * Creates an Express-compatible rate limiter middleware.
 * Limits the number of requests a client can make within a specified time window.
 *
 * @param {Object} options - Configuration options for the rate limiter.
 * @param {number} options.windowMs - The time window in milliseconds during which `max` requests are allowed.
 * @param {number} options.max - The maximum number of requests allowed per `windowMs`.
 * @param {string} [options.message='Too many requests, please try again later.'] - The error message sent to the client when the limit is exceeded.
 * @param {Function} [options.keyGenerator] - A function that returns a unique key for the client (e.g., IP address). Defaults to `req.ip`.
 * @param {Object} [options.store] - A custom store implementation (must support `get`, `set`, `delete` methods). Defaults to an in-memory Map.
 * @returns {Function} An Express-compatible middleware function (req, res, next).
 * @throws {Error} If `windowMs` or `max` options are missing or invalid.
 */
export function createRateLimiter(options) {
  if (
    !options ||
    typeof options.windowMs !== 'number' ||
    options.windowMs <= 0 ||
    typeof options.max !== 'number' ||
    options.max < 0
  ) {
    throw new Error(
      'createRateLimiter: `windowMs` (positive number) and `max` (non-negative number) are required options.'
    );
  }

  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) =>
      req.ip || (req.connection && req.connection.remoteAddress) || 'unknown', // Robust key generation from IP
    store = memoryStore, // Use the default in-memory store if none provided
  } = options;

  // Initialize the cleanup interval for the default in-memory store only once.
  // This ensures old records are purged to prevent memory leaks.
  if (store === memoryStore && !_memoryStoreCleanupInitialized) {
    setInterval(
      () => {
        const now = Date.now();
        for (const [key, record] of memoryStore.entries()) {
          if (now > record.resetTime) {
            // If the record's window has passed
            memoryStore.delete(key); // Delete the old record
          }
        }
      },
      // Cleanup interval is the smaller of windowMs or 60 seconds, to ensure timely cleanup
      Math.min(windowMs, 60 * 1000)
    ).unref(); // Allows the Node.js process to exit if only this interval is left active
    _memoryStoreCleanupInitialized = true;
  }

  return (req, res, next) => {
    const key = keyGenerator(req); // Get the unique key for the current client
    const now = Date.now();

    // Retrieve or create the rate limiting record for the client
    let record = store.get(key);
    if (!record) {
      // If no record exists, create a new one with count 0 and a new reset time
      record = { count: 0, resetTime: now + windowMs };
      store.set(key, record);
    } else if (now > record.resetTime) {
      // If the current time is past the reset time, reset the count and update the reset time
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    // Increment the request count for the current window
    record.count++;

    // Set standard X-RateLimit headers for client-side feedback
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000)); // UNIX timestamp in seconds

    // Check if the request count exceeds the maximum allowed
    if (record.count > max) {
      // Set HTTP status code to 429 Too Many Requests
      res.statusCode = 429;

      const responseData = {
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000), // Time in seconds to wait
      };

      // Attempt to send the JSON response using framework-specific methods first,
      // then fall back to native Node.js http.ServerResponse methods.
      if (typeof res.json === 'function') {
        // Express/Fastify compatibility
        res.json(responseData);
      } else if (typeof res.send === 'function') {
        // Other frameworks that might use .send for objects
        res.send(responseData);
      } else {
        // Native Node.js http.ServerResponse fallback
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responseData));
      }

      // Stop the middleware chain; do not call next()
      return;
    }

    // If the limit is not exceeded, proceed to the next middleware/route handler
    next();
  };
}
