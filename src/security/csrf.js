/**
 * @voilajsx/appkit - CSRF protection utilities
 * @module @voilajsx/appkit/security/csrf
 */

import crypto from 'crypto';
import { Buffer } from 'buffer'; // Required for crypto.timingSafeEqual

/**
 * Generates a CSRF token and stores it in the session with an expiration.
 * The token is generated as a cryptographically secure hexadecimal string
 * to ensure safe transport in HTML forms and URLs.
 *
 * @param {Object} session - The session object where the token will be stored (e.g., req.session).
 * @param {number} [expiryMinutes=60] - The duration in minutes for which the token will be valid.
 * @returns {string} The generated CSRF token as a hexadecimal string.
 * @throws {Error} If the session object is not provided or is invalid, or if expiryMinutes is non-positive.
 */
export function generateCsrfToken(session, expiryMinutes = 60) {
  if (!session || typeof session !== 'object') {
    throw new Error('Session object is required for CSRF token generation.');
  }
  if (typeof expiryMinutes !== 'number' || expiryMinutes <= 0) {
    throw new Error('Expiry minutes must be a positive number.');
  }

  // Generate a cryptographically secure random token (16 bytes = 32 hex characters)
  // Using 'hex' encoding is crucial for safe transport in HTML attributes and URL encoding.
  const token = crypto.randomBytes(16).toString('hex');

  // Store the token and its expiration time in the session
  session.csrfToken = token;
  session.csrfTokenExpiry = Date.now() + expiryMinutes * 60 * 1000;

  return token;
}

/**
 * Verifies a CSRF token received from a request against the one stored in the session.
 * Uses a constant-time comparison to mitigate timing attacks.
 *
 * @param {string} token - The CSRF token received from the request (from body, header, or query).
 * @param {Object} session - The session object containing the stored CSRF token and its expiry.
 * @returns {boolean} True if the token is valid and not expired; otherwise, false.
 */
export function verifyCsrfToken(token, session) {
  // Basic validation of inputs and existence of stored token
  if (
    !token ||
    typeof token !== 'string' ||
    !session ||
    typeof session !== 'object' ||
    !session.csrfToken || // Check if a token actually exists in the session
    typeof session.csrfToken !== 'string'
  ) {
    return false;
  }

  // Check if the stored token has expired
  // If session.csrfTokenExpiry is not set (e.g., old session without expiry), treat as expired for safety
  if (session.csrfTokenExpiry && Date.now() > session.csrfTokenExpiry) {
    return false;
  }

  // Use crypto.timingSafeEqual for constant-time comparison to prevent timing attacks.
  // Both tokens must be converted to Buffers and must have the same length.
  try {
    const expectedBuffer = Buffer.from(session.csrfToken, 'hex');
    const actualBuffer = Buffer.from(token, 'hex');

    // Crucial: If lengths differ, timingSafeEqual will throw an error or behave unpredictably.
    // Return false immediately if lengths don't match.
    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    // This is the correct, cryptographically secure comparison
    const isValid = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    return isValid;
  } catch (e) {
    // This catch block handles cases where the provided token might not be valid hex,
    // which `Buffer.from(string, 'hex')` would throw on.
    return false;
  }
}

/**
 * Creates an Express-compatible CSRF protection middleware.
 * This middleware verifies CSRF tokens for non-GET, HEAD, and OPTIONS requests.
 * It assumes a session object (e.g., `req.session`) is available on the request,
 * populated by a preceding session middleware.
 *
 * @param {Object} [options] - Configuration options for the middleware.
 * @param {string} [options.tokenField='_csrf'] - The field name in the request body or query string where the token is expected.
 * @param {string} [options.headerField='x-csrf-token'] - The HTTP header name where the token is expected.
 * @returns {Function} An Express-compatible middleware function (req, res, next).
 */
export function createCsrfMiddleware(options = {}) {
  const { tokenField = '_csrf', headerField = 'x-csrf-token' } = options;

  return (req, res, next) => {
    // Skip idempotent HTTP methods (GET, HEAD, OPTIONS) as per CSRF best practices
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Ensure that a session object is available on the request.
    // This middleware assumes a session middleware has run previously.
    if (!req.session || typeof req.session !== 'object') {
      const error = new Error(
        'Session object is required for CSRF validation. Ensure session middleware is configured.'
      );
      error.code = 'ENOSESSION'; // Custom error code for missing session setup
      error.status = 500; // Internal Server Error, as it's a configuration issue
      return next(error);
    }

    // Extract the CSRF token from common request locations in order of precedence:
    // 1. Request body (e.g., from a hidden input field in a form)
    // 2. HTTP header (e.g., for AJAX requests)
    // 3. Query string (less common for POST but included for completeness, although generally discouraged for sensitive operations)
    const token =
      (req.body && req.body[tokenField]) ||
      (req.headers && req.headers[headerField.toLowerCase()]) ||
      (req.query && req.query[tokenField]) ||
      null; // Ensure 'token' is explicitly null if not found

    // Verify the extracted token using the verifyCsrfToken helper
    if (!verifyCsrfToken(token, req.session)) {
      const error = new Error('Invalid or missing CSRF token.');
      error.code = 'EBADCSRFTOKEN'; // Standard error code for invalid CSRF token
      error.status = 403; // HTTP 403 Forbidden status
      return next(error);
    }

    next(); // If verification passes, proceed to the next middleware/route handler
  };
}
