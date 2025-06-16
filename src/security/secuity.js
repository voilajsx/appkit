/**
 * Core security class with built-in CSRF, rate limiting, sanitization, and encryption methods
 * @module @voilajsx/appkit/security
 * @file src/security/security.js
 */

import crypto from 'crypto';
import { createSecurityError } from './defaults.js';

/**
 * Security class with built-in protection functionality
 */
export class SecurityClass {
  /**
   * Creates a new Security instance
   * @param {object} [config={}] - Security configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.requestStore = new Map();
    this.cleanupInitialized = false;
  }

  /**
   * Creates CSRF protection middleware
   * @param {Object} [options] - CSRF options
   * @param {string} [options.secret] - CSRF secret override
   * @param {string} [options.tokenField] - Form field name override
   * @param {string} [options.headerField] - Header name override
   * @param {number} [options.expiryMinutes] - Token expiry override
   * @returns {Function} Express middleware for CSRF protection
   */
  forms(options = {}) {
    const csrfSecret = options.secret || this.config.csrf.secret;

    if (!csrfSecret) {
      throw createSecurityError(
        'CSRF secret required. Set VOILA_SECURITY_CSRF_SECRET or VOILA_AUTH_SECRET environment variable',
        500
      );
    }

    const tokenField = options.tokenField || this.config.csrf.tokenField;
    const headerField = options.headerField || this.config.csrf.headerField;
    const expiryMinutes =
      options.expiryMinutes || this.config.csrf.expiryMinutes;

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
      req.csrfToken = () => this._generateCSRFToken(req.session, expiryMinutes);

      // Skip CSRF verification for safe HTTP methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Extract token from request
      const token =
        (req.body && req.body[tokenField]) ||
        (req.headers && req.headers[headerField.toLowerCase()]) ||
        (req.query && req.query[tokenField]);

      // Verify token
      if (!this._verifyCSRFToken(token, req.session)) {
        const error = createSecurityError('Invalid or missing CSRF token', 403);
        return next(error);
      }

      next();
    };
  }

  /**
   * Creates rate limiting middleware
   * @param {number} [maxRequests] - Max requests per window
   * @param {number} [windowMs] - Time window in milliseconds
   * @param {Object} [options] - Rate limiting options
   * @param {string} [options.message] - Custom error message
   * @param {Function} [options.keyGenerator] - Custom key generation function
   * @returns {Function} Express middleware for rate limiting
   */
  requests(maxRequests, windowMs, options = {}) {
    // Handle argument polymorphism
    if (typeof maxRequests === 'object') {
      options = maxRequests;
      maxRequests = options.maxRequests;
      windowMs = options.windowMs;
    } else if (typeof windowMs === 'object') {
      options = windowMs;
      windowMs = options.windowMs;
    }

    // Use provided values or config defaults
    const max = maxRequests || this.config.rateLimit.maxRequests;
    const window = windowMs || this.config.rateLimit.windowMs;
    const message = options.message || this.config.rateLimit.message;
    const keyGenerator = options.keyGenerator || this._getClientKey;

    // Validate configuration
    if (max < 0 || window <= 0) {
      throw createSecurityError('Invalid rate limit configuration', 500);
    }

    // Initialize cleanup for memory management
    this._initializeCleanup(window);

    return (req, res, next) => {
      const key = keyGenerator(req);
      const now = Date.now();

      // Get or create rate limit record
      let record = this.requestStore.get(key);
      if (!record) {
        record = { count: 0, resetTime: now + window };
        this.requestStore.set(key, record);
      } else if (now > record.resetTime) {
        // Reset if window has passed
        record.count = 0;
        record.resetTime = now + window;
      }

      // Increment request count
      record.count++;

      // Set rate limit headers
      if (res.setHeader) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
      }

      // Check if limit exceeded
      if (record.count > max) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);

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

  /**
   * Cleans text input with XSS prevention
   * @param {string} text - Text to clean
   * @param {Object} [options] - Cleaning options
   * @param {number} [options.maxLength] - Maximum length override
   * @param {boolean} [options.trim] - Trim whitespace (default: true)
   * @param {boolean} [options.removeXSS] - Remove XSS patterns (default: true)
   * @returns {string} Cleaned text safe for storage/display
   */
  input(text, options = {}) {
    if (typeof text !== 'string') {
      return '';
    }

    const maxLength = options.maxLength || this.config.sanitization.maxLength;
    const trim = options.trim !== false;
    const removeXSS = options.removeXSS !== false;

    let result = text;

    // Trim whitespace
    if (trim) {
      result = result.trim();
    }

    // Basic XSS prevention
    if (removeXSS) {
      result = result
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
        .replace(/data:/gi, '') // Remove data: protocol
        .replace(/vbscript:/gi, ''); // Remove vbscript: protocol
    }

    // Length limiting
    if (result.length > maxLength) {
      result = result.substring(0, maxLength);
    }

    return result;
  }

  /**
   * Cleans HTML allowing specific tags
   * @param {string} html - HTML to clean
   * @param {Object} [options] - HTML cleaning options
   * @param {string[]} [options.allowedTags] - Allowed HTML tags override
   * @param {boolean} [options.stripAllTags] - Remove all HTML tags override
   * @returns {string} Safe HTML with dangerous elements removed
   */
  html(html, options = {}) {
    if (typeof html !== 'string') {
      return '';
    }

    const allowedTags =
      options.allowedTags || this.config.sanitization.allowedTags;
    const stripAllTags =
      options.stripAllTags !== undefined
        ? options.stripAllTags
        : this.config.sanitization.stripAllTags;

    let result = html;

    // Strip all tags if requested
    if (stripAllTags) {
      return result.replace(/<[^>]*>/g, '');
    }

    // Remove dangerous elements
    result = result
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
      .replace(/<embed\b[^>]*>/gi, '') // Remove embed tags
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
      .replace(/javascript\s*:/gi, '') // Remove javascript: protocol
      .replace(/data\s*:/gi, '') // Remove data: protocol
      .replace(/vbscript\s*:/gi, ''); // Remove vbscript: protocol

    // Filter allowed tags if specified
    if (allowedTags.length > 0) {
      try {
        const allowedPattern = allowedTags
          .map((tag) => tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
          .join('|');

        const tagPattern = new RegExp(
          `<(?!\/?(?:${allowedPattern})\\b)[^>]+>`,
          'gi'
        );
        result = result.replace(tagPattern, '');
      } catch (error) {
        console.warn(
          'HTML sanitization: Invalid allowed tags, stripping all tags'
        );
        result = result.replace(/<[^>]*>/g, '');
      }
    }

    return result;
  }

  /**
   * Escapes HTML special characters for safe display
   * @param {string} text - Text to escape
   * @returns {string} HTML-safe text with entities escaped
   */
  escape(text) {
    if (typeof text !== 'string') {
      return '';
    }

    const HTML_ESCAPE_MAP = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char]);
  }

  /**
   * Encrypts sensitive data with AES-256-GCM
   * @param {string|Buffer} data - Data to encrypt
   * @param {string|Buffer} [key] - Encryption key override
   * @param {Buffer} [associatedData] - Optional Associated Data (AAD)
   * @returns {string} Encrypted data as "IV:ciphertext:authTag" hex string
   */
  encrypt(data, key, associatedData = null) {
    if (!data) {
      throw createSecurityError('Data to encrypt cannot be empty');
    }

    const encryptionKey = key || this.config.encryption.key;

    if (!encryptionKey) {
      throw createSecurityError(
        'Encryption key required. Provide as argument or set VOILA_SECURITY_ENCRYPTION_KEY environment variable',
        500
      );
    }

    this._validateEncryptionKey(encryptionKey);

    const keyBuffer =
      typeof encryptionKey === 'string'
        ? Buffer.from(encryptionKey, 'hex')
        : encryptionKey;

    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.config.encryption.ivLength);
      const cipher = crypto.createCipheriv(
        this.config.encryption.algorithm,
        keyBuffer,
        iv
      );

      // Set AAD if provided
      if (associatedData) {
        if (!Buffer.isBuffer(associatedData)) {
          throw createSecurityError('Associated data must be a Buffer');
        }
        cipher.setAAD(associatedData);
      }

      // Encrypt data
      const dataBuffer = Buffer.isBuffer(data)
        ? data
        : Buffer.from(data, 'utf8');
      let encrypted = cipher.update(dataBuffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Combine IV, ciphertext, and auth tag
      return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
    } catch (error) {
      throw createSecurityError(`Encryption failed: ${error.message}`, 500);
    }
  }

  /**
   * Decrypts previously encrypted data
   * @param {string} encryptedData - Encrypted data string in "IV:ciphertext:authTag" format
   * @param {string|Buffer} [key] - Decryption key override
   * @param {Buffer} [associatedData] - Optional Associated Data (AAD)
   * @returns {string} Original plaintext data
   */
  decrypt(encryptedData, key, associatedData = null) {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw createSecurityError('Encrypted data must be a non-empty string');
    }

    const decryptionKey = key || this.config.encryption.key;

    if (!decryptionKey) {
      throw createSecurityError(
        'Decryption key required. Provide as argument or set VOILA_SECURITY_ENCRYPTION_KEY environment variable',
        500
      );
    }

    this._validateEncryptionKey(decryptionKey);

    const keyBuffer =
      typeof decryptionKey === 'string'
        ? Buffer.from(decryptionKey, 'hex')
        : decryptionKey;

    // Parse encrypted data format
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw createSecurityError(
        'Invalid encrypted data format. Expected IV:ciphertext:authTag'
      );
    }

    try {
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = Buffer.from(parts[1], 'hex');
      const authTag = Buffer.from(parts[2], 'hex');

      // Validate component lengths
      if (
        iv.length !== this.config.encryption.ivLength ||
        authTag.length !== this.config.encryption.tagLength
      ) {
        throw createSecurityError('Invalid IV or authentication tag length');
      }

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.config.encryption.algorithm,
        keyBuffer,
        iv
      );

      // Set AAD if provided
      if (associatedData) {
        if (!Buffer.isBuffer(associatedData)) {
          throw createSecurityError('Associated data must be a Buffer');
        }
        decipher.setAAD(associatedData);
      }

      // Set authentication tag
      decipher.setAuthTag(authTag);

      // Decrypt data
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      if (error.code === 'EBADTAG') {
        throw createSecurityError(
          'Authentication failed: Data may be tampered with or incorrect key/AAD provided',
          401
        );
      }
      throw createSecurityError(`Decryption failed: ${error.message}`, 500);
    }
  }

  /**
   * Generates a secure encryption key for production use
   * @returns {string} 32-byte encryption key as hex string
   */
  generateKey() {
    try {
      return crypto
        .randomBytes(this.config.encryption.keyLength)
        .toString('hex');
    } catch (error) {
      throw createSecurityError(`Key generation failed: ${error.message}`, 500);
    }
  }

  // Private helper methods

  /**
   * Generates a cryptographically secure CSRF token
   * @private
   */
  _generateCSRFToken(session, expiryMinutes) {
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
   */
  _verifyCSRFToken(token, session) {
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

      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Gets unique identifier for the client
   * @private
   */
  _getClientKey(req) {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      'unknown'
    );
  }

  /**
   * Initializes cleanup interval for memory management
   * @private
   */
  _initializeCleanup(windowMs) {
    if (this.cleanupInitialized) return;

    const cleanupInterval = Math.min(windowMs, 60 * 1000);

    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.requestStore.entries()) {
        if (now > record.resetTime) {
          this.requestStore.delete(key);
        }
      }
    }, cleanupInterval).unref();

    this.cleanupInitialized = true;
  }

  /**
   * Validates encryption key format and length
   * @private
   */
  _validateEncryptionKey(key) {
    if (!key) {
      throw createSecurityError('Encryption key is required', 500);
    }

    const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key;

    if (keyBuffer.length !== this.config.encryption.keyLength) {
      throw createSecurityError(
        `Invalid key length. Expected ${this.config.encryption.keyLength} bytes, got ${keyBuffer.length} bytes`,
        500
      );
    }
  }
}
