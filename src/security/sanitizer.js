/**
 * @voilajsx/appkit - Input sanitization utilities
 * @module @voilajsx/appkit/security/sanitizer
 * @file src/security/sanitizer.js
 *
 * Production-ready input sanitization with environment-first design.
 */

// HTML entity mapping for escaping
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

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
 * Cleans text input with environment-aware defaults
 * @param {string} text - Text to clean
 * @param {Object} [options] - Cleaning options
 * @param {number} [options.maxLength] - Maximum length (uses VOILA_MAX_INPUT_LENGTH env var)
 * @param {boolean} [options.trim] - Trim whitespace (default: true)
 * @param {boolean} [options.removeXSS] - Remove XSS patterns (default: true)
 * @returns {string} Cleaned text safe for storage/display
 */
export function cleanInput(text, options = {}) {
  if (typeof text !== 'string') {
    return '';
  }

  // Environment → Argument → Default pattern
  const maxLength =
    options.maxLength || parseInt(process.env.VOILA_MAX_INPUT_LENGTH) || 1000;

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
 * Cleans HTML allowing specific tags with environment-aware defaults
 * @param {string} html - HTML to clean
 * @param {Object} [options] - HTML cleaning options
 * @param {string[]} [options.allowedTags] - Allowed HTML tags (uses VOILA_ALLOWED_TAGS env var)
 * @param {boolean} [options.stripAllTags] - Remove all HTML tags (default: false)
 * @returns {string} Safe HTML with dangerous elements removed
 */
export function cleanHtml(html, options = {}) {
  if (typeof html !== 'string') {
    return '';
  }

  // Environment → Argument → Default pattern
  const allowedTags =
    options.allowedTags ||
    (process.env.VOILA_ALLOWED_TAGS
      ? process.env.VOILA_ALLOWED_TAGS.split(',')
      : []);

  const stripAllTags =
    options.stripAllTags || process.env.VOILA_STRIP_ALL_TAGS === 'true';

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
      // Create regex pattern for allowed tags
      const allowedPattern = allowedTags
        .map((tag) => tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
        .join('|');

      // Remove tags not in allowed list
      const tagPattern = new RegExp(
        `<(?!\/?(?:${allowedPattern})\\b)[^>]+>`,
        'gi'
      );
      result = result.replace(tagPattern, '');
    } catch (error) {
      // If regex fails, strip all tags for safety
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
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }

  // Replace HTML special characters with entities
  return text.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char]);
}
