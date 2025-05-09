/**
 * @voilajs/appkit - Input sanitization utilities
 * @module @voilajs/appkit/security/sanitizer
 */

/**
 * Sanitizes HTML input
 * @param {string} input - HTML string to sanitize
 * @param {Object} [options] - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(input, options = {}) {
    if (typeof input !== 'string') {
      return '';
    }
  
    // Basic HTML sanitization (remove script tags, event handlers, etc.)
    let sanitized = input
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: protocol
      .replace(/javascript\s*:/gi, '')
      // Remove data: protocol for potential XSS
      .replace(/data:text\/html/gi, '');
  
    // Additional options
    if (options.stripTags) {
      // Remove all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
  
    if (options.allowedTags) {
      // Only allow specific tags
      const allowedTagsRegex = new RegExp(
        `<(?!\/?(?:${options.allowedTags.join('|')})\s*\/?>)[^>]+>`, 
        'gi'
      );
      sanitized = sanitized.replace(allowedTagsRegex, '');
    }
  
    return sanitized;
  }
  
  /**
   * Escapes special characters in a string
   * @param {string} input - String to escape
   * @returns {string} Escaped string
   */
  export function escapeString(input) {
    if (typeof input !== 'string') {
      return '';
    }
  
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
  
    return input.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
  }
  
  /**
   * Escapes HTML for safe display
   * @param {string} input - HTML string to escape
   * @returns {string} Escaped HTML
   */
  export function escapeHtml(input) {
    return escapeString(input);
  }
  
  /**
   * Sanitizes an object by escaping all string values
   * @param {Object} obj - Object to sanitize
   * @returns {Object} Sanitized object
   */
  export function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = escapeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  
    return sanitized;
  }
  
  /**
   * Removes potentially dangerous characters from filenames
   * @param {string} filename - Filename to sanitize
   * @returns {string} Sanitized filename
   */
  export function sanitizeFilename(filename) {
    if (typeof filename !== 'string') {
      return '';
    }
  
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');
    
    // Remove special characters (keep alphanumeric, dots, dashes, underscores)
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');
    
    // Limit length
    if (sanitized.length > 255) {
      const ext = sanitized.substring(sanitized.lastIndexOf('.'));
      const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
      sanitized = name.substring(0, 255 - ext.length) + ext;
    }
  
    return sanitized;
  }