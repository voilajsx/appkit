/**
 * @voilajsx/appkit - Input sanitization utilities
 * @module @voilajsx/appkit/security/sanitizer
 */

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;', // ' is not strictly necessary for HTML but good for attributes
  '/': '&#x2F;', // Important for preventing </script> injection etc.
};

/**
 * Escapes special characters in a string to prevent XSS (Cross-Site Scripting) attacks
 * in HTML contexts. It converts HTML-sensitive characters to their corresponding
 * HTML entity equivalents.
 *
 * @param {string} input - The string to escape. If not a string, returns an empty string.
 * @returns {string} The escaped string, safe for display within HTML.
 */
export function escapeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Replace each sensitive character with its HTML entity
  return input.replace(/[&<>"'/]/g, (char) => ESCAPE_MAP[char]);
}

/**
 * Sanitizes HTML input by removing dangerous elements and attributes to mitigate XSS attacks.
 *
 * WARNING: This is a REGEX-BASED sanitizer. While it covers common attack vectors,
 * for arbitrary, untrusted user-generated HTML (e.g., content from rich text editors),
 * a dedicated, robust HTML parsing and sanitization library (like `DOMPurify` or `xss`)
 * that uses a proper HTML parser is strongly recommended for comprehensive security.
 * This function is suitable for simpler, more controlled HTML snippets.
 *
 * @param {string} input - The HTML string to sanitize. If not a string, returns an empty string.
 * @param {Object} [options] - Sanitization options.
 * @param {boolean} [options.stripAllTags=false] - If `true`, all HTML tags will be removed, leaving only plain text.
 * @param {string[]} [options.allowedTags] - An array of tag names (e.g., `['b', 'i', 'p']`) to explicitly allow.
 * If provided, any tag not in this list will be stripped.
 * @returns {string} The sanitized HTML string.
 */
export function sanitizeHtml(input, options = {}) {
  if (typeof input !== 'string') {
    return '';
  }

  // If `stripAllTags` option is true, remove all HTML tags aggressively
  if (options.stripAllTags) {
    return input.replace(/<[^>]*>/g, '');
  }

  // Remove common XSS vectors using regular expressions:
  // 1. <script> tags and their contents
  // 2. Inline event handlers (e.g., onclick, onload, onerror)
  // 3. Dangerous URI schemes (e.g., javascript:, data:, vbscript:)
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '');

  // If `allowedTags` are specified, strip any tags that are not explicitly allowed.
  if (Array.isArray(options.allowedTags) && options.allowedTags.length > 0) {
    try {
      // Escape special characters in tag names to safely use in regex
      const allowedPattern = options.allowedTags
        .map(
          (tag) => tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') // Escape regex special characters
        )
        .join('|'); // Join allowed tags with OR (|)

      // Regex to match any tag NOT followed by one of the allowed patterns
      const tagPattern = new RegExp(
        `<(?!\/?(?:${allowedPattern})\\b)[^>]+>`, // Matches < followed by NOT / or allowed tag, then any chars to >
        'gi' // Global, case-insensitive
      );
      sanitized = sanitized.replace(tagPattern, '');
    } catch (e) {
      // If regex construction fails (e.g., malformed allowedTags array),
      // log an error and fall back to a safer default (strip all remaining tags).
      console.error(
        'sanitizeHtml: Error creating allowedTags regex. Stripping all remaining tags.',
        e
      );
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
  }

  return sanitized;
}

/**
 * Sanitizes a filename string to prevent path traversal attacks (e.g., `../../etc/passwd`).
 * It removes directory traversal sequences and limits characters to a safe set.
 *
 * WARNING: For highly sensitive file upload scenarios (e.g., storing user files on a server),
 * it is also recommended to implement strict file extension whitelisting at the application
 * layer (e.g., only allow `.pdf`, `.jpg`, `.png` and reject all others) in addition to this sanitization.
 *
 * @param {string} filename - The filename string to sanitize. If not a string, returns an empty string.
 * @returns {string} The sanitized filename, safe for file system operations.
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    return '';
  }

  // 1. Remove path traversal sequences (e.g., .., ...). This prevents moving up directories.
  // 2. Remove directory separators (both / and \)
  // 3. Keep only alphanumeric characters, underscores, hyphens, and periods (dots).
  //    This disallows most special characters that could be problematic on file systems.
  const sanitized = filename
    .replace(/\.{2,}/g, '') // Remove sequences of two or more dots (e.g., .., ..., ....)
    .replace(/[\/\\]/g, '') // Remove all directory separators (forward and back slashes)
    .replace(/[^\w.-]/g, ''); // Keep only word characters (a-zA-Z0-9_), dashes, and dots.

  // 4. Truncate the filename to a reasonable maximum length (e.g., 255 characters)
  //    to prevent excessively long filenames that can cause issues on some file systems.
  return sanitized.slice(0, 255);
}
