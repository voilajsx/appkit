/**
 * @voilajsx/appkit - CSRF protection utilities
 * @module @voilajsx/appkit/security/csrf
 * @file src/security/csrf.js
 *
 * Production-ready CSRF protection with timing-safe verification.
 */

import crypto from 'crypto';

/**
 * Creates security error with status code
 * @private
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Error with statusCode property
 */
function createSecurityError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Generates a cryptographically secure CSRF token
 * @private
 * @param {Object} session - Express session object
 * @param {number} expiryMinutes - Token expiry in minutes
 * @returns {string} CSRF token
 */
function generateToken(session, expiryMinutes) {
  if (!session || typeof session !== 'object') {
    throw createSecurityError(
      'Session object required for CSRF token generation',
      500
    );
  }

  const token = crypto.randomBytes(16).toString('hex');
  session.csrfToken = token;
  session.csrfTokenExpiry = Date.now() + expiryMinutes * 60 * 1000;

  return token;
}

/**
 * Verifies CSRF token using timing-safe comparison
 * @private
 * @param {string} token - Token from request
 * @param {Object} session - Express session object
 * @returns {boolean} True if token is valid
 */
function verifyToken(token, session) {
  if (!token || typeof token !== 'string' || !session?.csrfToken) {
    return false;
  }

  // Check expiry
  if (session.csrfTokenExpiry && Date.now() > session.csrfTokenExpiry) {
    return false;
  }

  try {
    const expectedBuffer = Buffer.from(session.csrfToken, 'hex');
    const actualBuffer = Buffer.from(token, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

/**
 * Creates CSRF protection middleware with environment-first defaults
 * @param {string} [secret] - CSRF secret (uses VOILA_CSRF_SECRET env var)
 * @param {Object} [options] - Configuration options
 * @param {string} [options.tokenField] - Form field name (uses VOILA_CSRF_FIELD env var)
 * @param {string} [options.headerField] - Header name (uses VOILA_CSRF_HEADER env var)
 * @param {number} [options.expiryMinutes] - Token expiry (uses VOILA_CSRF_EXPIRY env var)
 * @returns {Function} Express middleware for CSRF protection
 */
export function protectForms(secret, options = {}) {
  // Handle argument polymorphism
  if (typeof secret === 'object') {
    options = secret;
    secret = options.secret;
  }

  // Environment → Argument → Default pattern
  const csrfSecret =
    secret || process.env.VOILA_CSRF_SECRET || process.env.VOILA_AUTH_SECRET;

  if (!csrfSecret) {
    throw createSecurityError(
      'CSRF secret required. Set VOILA_CSRF_SECRET or VOILA_AUTH_SECRET environment variable',
      500
    );
  }

  // Smart defaults from environment
  const tokenField =
    options.tokenField || process.env.VOILA_CSRF_FIELD || '_csrf';

  const headerField =
    options.headerField || process.env.VOILA_CSRF_HEADER || 'x-csrf-token';

  const expiryMinutes =
    options.expiryMinutes || parseInt(process.env.VOILA_CSRF_EXPIRY) || 60;

  return (req, res, next) => {
    // Ensure session exists
    if (!req.session || typeof req.session !== 'object') {
      const error = createSecurityError(
        'Session required for CSRF protection',
        500
      );
      return next(error);
    }

    // Add token generation method to request
    req.csrfToken = () => generateToken(req.session, expiryMinutes);

    // Skip CSRF verification for safe HTTP methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Extract token from request (body, header, query in order of preference)
    const token =
      (req.body && req.body[tokenField]) ||
      (req.headers && req.headers[headerField.toLowerCase()]) ||
      (req.query && req.query[tokenField]);

    // Verify token
    if (!verifyToken(token, req.session)) {
      const error = createSecurityError('Invalid or missing CSRF token', 403);
      return next(error);
    }

    next();
  };
}
