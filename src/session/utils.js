/**
 * @file src/session/utils.js
 * @voilajsx/appkit - Session utilities
 * @module @voilajsx/appkit/session/utils
 */

import crypto from 'crypto';

/**
 * Session manager for handling cookies and session lifecycle
 */
export class SessionManager {
  constructor(options = {}) {
    this.store = options.store; // Store is now passed from middleware
    this.cookieName = options.cookieName || 'sessionId';
    this.maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24 hours
    this.secure =
      options.secure !== false && process.env.NODE_ENV === 'production';
    this.httpOnly = options.httpOnly !== false;
    this.sameSite = options.sameSite || 'strict';
    this.secret = options.secret || this.generateSecret();
    this.rolling = options.rolling !== false; // Extend on activity
    this.path = options.path || '/';
    this.domain = options.domain;

    // Warn about auto-generated secrets in production
    if (!options.secret && process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️  Using auto-generated session secret. Set options.secret for production!'
      );
    }
  }

  /**
   * Generate a random secret for development
   * @returns {string} Random secret
   */
  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a new session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Sign a session ID to prevent tampering
   * @param {string} sessionId - Session ID to sign
   * @returns {string} Signed session ID
   */
  signSessionId(sessionId) {
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(sessionId)
      .digest('base64url');
    return `${sessionId}.${signature}`;
  }

  /**
   * Verify and extract session ID from signed value
   * @param {string} signedSessionId - Signed session ID
   * @returns {string|null} Session ID or null if invalid
   */
  unsignSessionId(signedSessionId) {
    if (!signedSessionId || typeof signedSessionId !== 'string') {
      return null;
    }

    const [sessionId, signature] = signedSessionId.split('.');
    if (!sessionId || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(sessionId)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'base64url'),
        Buffer.from(expectedSignature, 'base64url')
      );
      return isValid ? sessionId : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse cookie header manually
   * @param {string} cookieHeader - Raw cookie header
   * @returns {Object} Parsed cookies
   */
  parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = decodeURIComponent(rest.join('='));
      }
    });
    return cookies;
  }

  /**
   * Get session cookie from request (framework-agnostic)
   * @param {Object} req - Request object
   * @returns {string|null} Session cookie value
   */
  getCookie(req) {
    // Express/Connect style
    if (req.cookies && req.cookies[this.cookieName]) {
      return req.cookies[this.cookieName];
    }

    // Fastify style (cookies might be a function)
    if (req.cookies && typeof req.cookies === 'function') {
      try {
        const cookies = req.cookies();
        return cookies[this.cookieName];
      } catch (error) {
        // Ignore and fall through to manual parsing
      }
    }

    // Manual cookie parsing from headers
    if (req.headers && req.headers.cookie) {
      const cookies = this.parseCookies(req.headers.cookie);
      return cookies[this.cookieName];
    }

    return null;
  }

  /**
   * Build cookie string for Set-Cookie header
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {Object} options - Cookie options
   * @returns {string} Cookie string
   */
  buildCookieString(name, value, options = {}) {
    let cookie = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      cookie += `; Max-Age=${Math.floor(options.maxAge / 1000)}`;
    }
    if (options.path) {
      cookie += `; Path=${options.path}`;
    }
    if (options.domain) {
      cookie += `; Domain=${options.domain}`;
    }
    if (options.secure) {
      cookie += '; Secure';
    }
    if (options.httpOnly) {
      cookie += '; HttpOnly';
    }
    if (options.sameSite) {
      cookie += `; SameSite=${options.sameSite}`;
    }

    return cookie;
  }

  /**
   * Set session cookie (framework-agnostic)
   * @param {Object} res - Response object
   * @param {string} value - Cookie value
   * @param {Object} options - Cookie options
   */
  setCookie(res, value, options = {}) {
    const cookieOptions = {
      maxAge: this.maxAge,
      secure: this.secure,
      httpOnly: this.httpOnly,
      sameSite: this.sameSite,
      path: this.path,
      domain: this.domain,
      ...options,
    };

    // Express/Connect style
    if (res.cookie && typeof res.cookie === 'function') {
      res.cookie(this.cookieName, value, cookieOptions);
      return;
    }

    // Fastify style
    if (res.setCookie && typeof res.setCookie === 'function') {
      res.setCookie(this.cookieName, value, cookieOptions);
      return;
    }

    // Koa style
    if (
      res.cookies &&
      res.cookies.set &&
      typeof res.cookies.set === 'function'
    ) {
      res.cookies.set(this.cookieName, value, cookieOptions);
      return;
    }

    // Manual Set-Cookie header (works with any framework)
    const cookieString = this.buildCookieString(
      this.cookieName,
      value,
      cookieOptions
    );

    if (res.setHeader && typeof res.setHeader === 'function') {
      // Node.js http.ServerResponse or Express-like
      const existing = res.getHeader('Set-Cookie') || [];
      const cookies = Array.isArray(existing)
        ? existing
        : [existing].filter(Boolean);
      res.setHeader('Set-Cookie', [...cookies, cookieString]);
    } else if (res.headers) {
      // Some frameworks use headers object
      const existing = res.headers['Set-Cookie'];
      res.headers['Set-Cookie'] = existing
        ? [].concat(existing, cookieString)
        : cookieString;
    }
  }

  /**
   * Clear session cookie
   * @param {Object} res - Response object
   */
  clearCookie(res) {
    this.setCookie(res, '', { maxAge: 0 });
  }
}

/**
 * Utility function to create a secure session secret
 * @param {number} [length=32] - Length of the secret in bytes
 * @returns {string} Secure random secret
 *
 * @example
 * const secret = createSessionSecret();
 * console.log(secret); // 64-character hex string
 */
export function createSessionSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Utility function to validate session configuration
 * @param {Object} options - Session options to validate
 * @returns {Object} Validation result
 *
 * @example
 * const validation = validateSessionConfig({
 *   secret: 'my-secret',
 *   maxAge: 3600000
 * });
 *
 * if (!validation.valid) {
 *   console.error('Invalid session config:', validation.errors);
 * }
 */
export function validateSessionConfig(options = {}) {
  const errors = [];
  const warnings = [];

  // Check secret
  if (!options.secret) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('Secret is required in production');
    } else {
      warnings.push('No secret provided, using auto-generated secret');
    }
  } else if (typeof options.secret !== 'string') {
    errors.push('Secret must be a string');
  } else if (options.secret.length < 16) {
    warnings.push('Secret should be at least 16 characters for security');
  }

  // Check maxAge
  if (options.maxAge !== undefined) {
    if (typeof options.maxAge !== 'number' || options.maxAge <= 0) {
      errors.push('maxAge must be a positive number');
    } else if (options.maxAge < 60000) {
      // Less than 1 minute
      warnings.push('maxAge is very short (less than 1 minute)');
    } else if (options.maxAge > 30 * 24 * 60 * 60 * 1000) {
      // More than 30 days
      warnings.push('maxAge is very long (more than 30 days)');
    }
  }

  // Check cookie name
  if (options.cookieName !== undefined) {
    if (typeof options.cookieName !== 'string') {
      errors.push('cookieName must be a string');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(options.cookieName)) {
      errors.push('cookieName contains invalid characters');
    }
  }

  // Check sameSite
  if (options.sameSite !== undefined) {
    const validSameSite = ['strict', 'lax', 'none'];
    if (!validSameSite.includes(options.sameSite.toLowerCase())) {
      errors.push('sameSite must be one of: strict, lax, none');
    }
  }

  // Security warnings
  if (options.secure === false && process.env.NODE_ENV === 'production') {
    warnings.push('secure=false is not recommended in production');
  }

  if (options.httpOnly === false) {
    warnings.push('httpOnly=false allows JavaScript access to session cookies');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Utility function to sanitize session data before storage
 * @param {Object} data - Session data to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized session data
 *
 * @example
 * const sanitized = sanitizeSessionData({
 *   user: { id: 123, password: 'secret' },
 *   token: 'abc123'
 * }, {
 *   removeKeys: ['password', 'token']
 * });
 */
export function sanitizeSessionData(data, options = {}) {
  const {
    removeKeys = [],
    maxDepth = 10,
    maxSize = 1024 * 1024, // 1MB
  } = options;

  if (!data || typeof data !== 'object') {
    return data;
  }

  // Check size (rough estimate)
  const dataString = JSON.stringify(data);
  if (dataString.length > maxSize) {
    throw new Error(`Session data too large: ${dataString.length} bytes`);
  }

  // Deep clone and remove sensitive keys
  const sanitized = JSON.parse(dataString);

  function removeKeysRecursive(obj, depth = 0) {
    if (depth > maxDepth) {
      return '[Max Depth Exceeded]';
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => removeKeysRecursive(item, depth + 1));
    }

    if (obj && typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (!removeKeys.includes(key)) {
          cleaned[key] = removeKeysRecursive(value, depth + 1);
        }
      }
      return cleaned;
    }

    return obj;
  }

  return removeKeysRecursive(sanitized);
}

/**
 * Default export for convenience
 */
export default {
  SessionManager,
  createSessionSecret,
  validateSessionConfig,
  sanitizeSessionData,
};
