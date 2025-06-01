/**
 * @voilajsx/appkit - Sanitizers
 * @module @voilajsx/appkit/validation/sanitizers
 * @file src/validation/sanitizers.js
 */

/**
 * Sanitizes data based on rules
 * @param {*} data - Data to sanitize
 * @param {Object} rules - Sanitization rules
 * @returns {*} Sanitized data
 */
export function sanitize(data, rules) {
  if (typeof rules === 'function') {
    return rules(data);
  }

  const type = getType(data);

  switch (type) {
    case 'string':
      return sanitizeString(data, rules);
    case 'number':
      return sanitizeNumber(data, rules);
    case 'object':
      return sanitizeObject(data, rules);
    default:
      return data;
  }
}

/**
 * Sanitizes string value
 * @param {string} input - String to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, rules = {}) {
  if (typeof input !== 'string') {
    input = String(input);
  }

  let result = input;

  if (rules.trim !== false) {
    result = result.trim();
  }

  if (rules.lowercase) {
    result = result.toLowerCase();
  }

  if (rules.uppercase) {
    result = result.toUpperCase();
  }

  if (rules.truncate) {
    const length = typeof rules.truncate === 'number' ? rules.truncate : 255;
    if (result.length > length) {
      result = result.substring(0, length);
    }
  }

  if (rules.replace) {
    for (const [pattern, replacement] of Object.entries(rules.replace)) {
      result = result.replace(new RegExp(pattern, 'g'), replacement);
    }
  }

  if (rules.remove) {
    if (Array.isArray(rules.remove)) {
      for (const pattern of rules.remove) {
        result = result.replace(new RegExp(pattern, 'g'), '');
      }
    } else {
      result = result.replace(new RegExp(rules.remove, 'g'), '');
    }
  }

  return result;
}

/**
 * Sanitizes number value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(input, rules = {}) {
  // Handle quoted strings by removing quotes first
  if (typeof input === 'string') {
    input = input.replace(/^["']|["']$/g, '');
  }

  let result = Number(input);

  if (isNaN(result)) {
    result = rules.default !== undefined ? rules.default : 0;
  }

  if (rules.integer) {
    result = Math.trunc(result);
  }

  if (rules.min !== undefined && result < rules.min) {
    result = rules.clamp ? rules.min : result;
  }

  if (rules.max !== undefined && result > rules.max) {
    result = rules.clamp ? rules.max : result;
  }

  if (rules.precision !== undefined) {
    result = Number(result.toFixed(rules.precision));
  }

  return result;
}

/**
 * Sanitizes object value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(input, rules = {}) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    input = {};
  }

  let result = { ...input };

  // Apply defaults first
  if (rules.defaults) {
    result = { ...rules.defaults, ...result };
  }

  if (rules.pick && Array.isArray(rules.pick)) {
    const picked = {};
    for (const key of rules.pick) {
      if (key in result) {
        picked[key] = result[key];
      }
    }
    result = picked;
  }

  if (rules.omit && Array.isArray(rules.omit)) {
    for (const key of rules.omit) {
      delete result[key];
    }
  }

  if (rules.properties) {
    for (const [key, propRules] of Object.entries(rules.properties)) {
      if (key in result) {
        // Determine which sanitizer to use based on rules
        if (
          propRules.integer ||
          propRules.precision !== undefined ||
          propRules.min !== undefined ||
          propRules.max !== undefined ||
          propRules.clamp
        ) {
          result[key] = sanitizeNumber(result[key], propRules);
        } else if (
          propRules.trim ||
          propRules.lowercase ||
          propRules.uppercase ||
          propRules.truncate ||
          propRules.replace ||
          propRules.remove
        ) {
          result[key] = sanitizeString(result[key], propRules);
        } else {
          result[key] = sanitize(result[key], propRules);
        }
      }
    }
  }

  if (rules.removeEmpty) {
    const cleaned = {};
    for (const [key, value] of Object.entries(result)) {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
    result = cleaned;
  }

  return result;
}

/**
 * Gets the type of a value
 * @private
 * @param {*} value - Value to check
 * @returns {string} Type name
 */
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}
