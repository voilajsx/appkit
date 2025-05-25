/**
 * @voilajsx/appkit - Sanitizers
 * @module @voilajsx/appkit/validation/sanitizers
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

  if (Array.isArray(rules)) {
    return rules.reduce((result, rule) => sanitize(result, rule), data);
  }

  const type = getType(data);

  switch (type) {
    case 'string':
      return sanitizeString(data, rules);
    case 'number':
      return sanitizeNumber(data, rules);
    case 'boolean':
      return sanitizeBoolean(data, rules);
    case 'array':
      return sanitizeArray(data, rules);
    case 'object':
      return sanitizeObject(data, rules);
    default:
      return data;
  }
}

/**
 * Creates a reusable sanitizer function
 * @param {Object} rules - Sanitization rules
 * @returns {Function} Sanitizer function
 */
export function createSanitizer(rules) {
  return (data) => sanitize(data, rules);
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

  if (rules.capitalize) {
    result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  }

  if (rules.titleCase) {
    result = result.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  if (rules.escape) {
    result = escapeString(result);
  }

  if (rules.unescape) {
    result = unescapeString(result);
  }

  if (rules.truncate) {
    const length = typeof rules.truncate === 'number' ? rules.truncate : 255;
    const suffix = rules.truncateSuffix || '...';
    if (result.length > length) {
      result = result.substring(0, length - suffix.length) + suffix;
    }
  }

  if (rules.normalize) {
    result = result.normalize(
      rules.normalize === true ? 'NFC' : rules.normalize
    );
  }

  if (rules.replace) {
    for (const [pattern, replacement] of Object.entries(rules.replace)) {
      const flags = rules.replaceFlags || 'g';
      result = result.replace(new RegExp(pattern, flags), replacement);
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

  if (rules.slug) {
    result = result
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  }

  if (rules.alphanumeric) {
    result = result.replace(/[^a-zA-Z0-9]/g, '');
  }

  if (rules.alpha) {
    result = result.replace(/[^a-zA-Z]/g, '');
  }

  if (rules.numeric) {
    result = result.replace(/[^0-9]/g, '');
  }

  if (rules.email) {
    result = result.toLowerCase().trim();
  }

  if (rules.url) {
    try {
      const url = new URL(result);
      result = url.toString();
    } catch {
      // Invalid URL, return as is
    }
  }

  if (rules.stripTags) {
    result = result.replace(/<[^>]*>/g, '');
  }

  if (rules.whitespace) {
    if (rules.whitespace === 'single') {
      result = result.replace(/\s+/g, ' ');
    } else if (rules.whitespace === 'remove') {
      result = result.replace(/\s/g, '');
    }
  }

  if (rules.linebreaks) {
    if (rules.linebreaks === 'unix') {
      result = result.replace(/\r\n|\r/g, '\n');
    } else if (rules.linebreaks === 'windows') {
      result = result.replace(/\r\n|\r|\n/g, '\r\n');
    } else if (rules.linebreaks === 'remove') {
      result = result.replace(/[\r\n]/g, '');
    }
  }

  return result;
}

/**
 * Sanitizes HTML content with enhanced security options
 * @param {string} input - HTML to sanitize
 * @param {Object} [options] - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(input, options = {}) {
  const {
    allowedTags = [
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'a',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    allowedAttributes = {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
    allowedSchemes = ['http', 'https', 'mailto'],
    stripEmpty = true,
    maxLength = null,
    allowDataAttributes = false,
    allowClassNames = false,
  } = options;

  // Enhanced HTML sanitization
  // Note: For production use, consider using DOMPurify or similar library
  // This implementation provides basic protection
  let result = String(input);

  // Limit input length to prevent DoS
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  // Remove dangerous tags and content
  const dangerousTags = [
    'script',
    'style',
    'object',
    'embed',
    'applet',
    'iframe',
    'frame',
    'frameset',
    'meta',
    'link',
    'base',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'option',
  ];

  for (const tag of dangerousTags) {
    const regex = new RegExp(
      `<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`,
      'gi'
    );
    result = result.replace(regex, '');
    // Also remove self-closing versions
    result = result.replace(new RegExp(`<${tag}\\b[^>]*>`, 'gi'), '');
  }

  // Remove event handlers and javascript: URLs
  result = result.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\son\w+\s*=\s*[^>\s]+/gi, '');
  result = result.replace(/javascript\s*:/gi, 'unsafe:');
  result = result.replace(/data\s*:/gi, 'unsafe:');
  result = result.replace(/vbscript\s*:/gi, 'unsafe:');

  // Validate allowed tags and attributes
  const tagRegex = /<(\/?[a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  result = result.replace(tagRegex, (match, tagName, attributes) => {
    const isClosing = tagName.startsWith('/');
    const cleanTagName = isClosing ? tagName.slice(1) : tagName;

    if (!allowedTags.includes(cleanTagName.toLowerCase())) {
      return '';
    }

    if (isClosing) {
      return `</${cleanTagName}>`;
    }

    // Process attributes
    const allowedAttrs = allowedAttributes[cleanTagName.toLowerCase()] || [];
    const attrRegex = /(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
    let cleanAttributes = '';
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      const [, attrName, doubleQuoted, singleQuoted, unquoted] = attrMatch;
      const attrValue = doubleQuoted || singleQuoted || unquoted || '';

      const isAllowed =
        allowedAttrs.includes(attrName.toLowerCase()) ||
        (allowDataAttributes && attrName.toLowerCase().startsWith('data-')) ||
        (allowClassNames && attrName.toLowerCase() === 'class');

      if (isAllowed) {
        // Additional validation for href attributes
        if (attrName.toLowerCase() === 'href') {
          try {
            const url = new URL(attrValue, 'https://example.com');
            if (!allowedSchemes.includes(url.protocol.slice(0, -1))) {
              continue; // Skip this attribute
            }
          } catch {
            // Invalid URL, skip
            continue;
          }
        }

        cleanAttributes += ` ${attrName}="${escapeAttribute(attrValue)}"`;
      }
    }

    return `<${cleanTagName}${cleanAttributes}>`;
  });

  if (stripEmpty) {
    // Remove empty tags (but preserve <br> and other self-closing tags)
    const emptyTagRegex = /<([^>\/\s]+)[^>]*>\s*<\/\1>/g;
    let prevResult;
    do {
      prevResult = result;
      result = result.replace(emptyTagRegex, '');
    } while (result !== prevResult && result.length > 0);
  }

  return result.trim();
}

/**
 * Sanitizes number value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(input, rules = {}) {
  let result = Number(input);

  if (isNaN(result)) {
    result = rules.default !== undefined ? rules.default : 0;
  }

  if (rules.integer) {
    result =
      rules.round === 'ceil'
        ? Math.ceil(result)
        : rules.round === 'floor'
          ? Math.floor(result)
          : Math.round(result);
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

  if (rules.positive && result < 0) {
    result = rules.absolute ? Math.abs(result) : 0;
  }

  if (rules.negative && result > 0) {
    result = rules.absolute ? -Math.abs(result) : 0;
  }

  if (rules.finite && !Number.isFinite(result)) {
    result = rules.default !== undefined ? rules.default : 0;
  }

  return result;
}

/**
 * Sanitizes boolean value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {boolean} Sanitized boolean
 */
export function sanitizeBoolean(input, rules = {}) {
  if (typeof input === 'boolean') {
    return input;
  }

  const truthy = rules.truthy || ['true', '1', 'yes', 'on', 'y'];
  const falsy = rules.falsy || ['false', '0', 'no', 'off', 'n'];

  if (typeof input === 'string') {
    const stringValue = input.toLowerCase().trim();

    if (truthy.includes(stringValue)) {
      return true;
    }

    if (falsy.includes(stringValue)) {
      return false;
    }
  }

  if (typeof input === 'number') {
    if (rules.strictNumeric) {
      return input === 1;
    }
    return input !== 0;
  }

  return Boolean(input);
}

/**
 * Sanitizes array value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {Array} Sanitized array
 */
export function sanitizeArray(input, rules = {}) {
  if (!Array.isArray(input)) {
    if (rules.parse && typeof input === 'string') {
      try {
        input = JSON.parse(input);
        if (!Array.isArray(input)) {
          input = [input];
        }
      } catch {
        input = rules.delimiter ? input.split(rules.delimiter) : [];
      }
    } else if (input === null || input === undefined) {
      input = [];
    } else {
      input = [input];
    }
  }

  let result = [...input];

  if (rules.compact) {
    result = result.filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== '' &&
        (typeof item !== 'number' || !isNaN(item))
    );
  }

  if (rules.flatten) {
    const depth = typeof rules.flatten === 'number' ? rules.flatten : Infinity;
    result = result.flat(depth);
  }

  if (rules.unique) {
    if (rules.uniqueBy) {
      const seen = new Map();
      result = result.filter((item) => {
        const key =
          typeof rules.uniqueBy === 'function'
            ? rules.uniqueBy(item)
            : item[rules.uniqueBy];
        if (seen.has(key)) {
          return false;
        }
        seen.set(key, true);
        return true;
      });
    } else {
      result = [...new Set(result)];
    }
  }

  if (rules.items) {
    result = result.map((item, index) => {
      try {
        return sanitize(item, rules.items);
      } catch (error) {
        if (rules.skipInvalid) {
          return null; // Will be filtered out if compact is true
        }
        throw error;
      }
    });

    if (rules.skipInvalid) {
      result = result.filter((item) => item !== null);
    }
  }

  if (rules.filter) {
    result = result.filter(rules.filter);
  }

  if (rules.sort) {
    if (typeof rules.sort === 'function') {
      result.sort(rules.sort);
    } else if (rules.sort === true) {
      result.sort();
    } else if (typeof rules.sort === 'string') {
      // Sort by property name
      result.sort((a, b) => {
        const aVal = a[rules.sort];
        const bVal = b[rules.sort];
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
    }
  }

  if (rules.reverse) {
    result.reverse();
  }

  if (rules.limit && result.length > rules.limit) {
    result = result.slice(0, rules.limit);
  }

  if (rules.offset && rules.offset > 0) {
    result = result.slice(rules.offset);
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
    if (rules.parse && typeof input === 'string') {
      try {
        input = JSON.parse(input);
        if (
          typeof input !== 'object' ||
          input === null ||
          Array.isArray(input)
        ) {
          input = {};
        }
      } catch {
        input = {};
      }
    } else {
      input = {};
    }
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

  if (rules.rename) {
    for (const [oldKey, newKey] of Object.entries(rules.rename)) {
      if (oldKey in result) {
        result[newKey] = result[oldKey];
        delete result[oldKey];
      }
    }
  }

  if (rules.properties) {
    for (const [key, propRules] of Object.entries(rules.properties)) {
      if (key in result) {
        try {
          result[key] = sanitize(result[key], propRules);
        } catch (error) {
          if (rules.skipInvalid) {
            delete result[key];
          } else {
            throw error;
          }
        }
      }
    }
  }

  if (rules.filter) {
    const filtered = {};
    for (const [key, value] of Object.entries(result)) {
      if (rules.filter(value, key)) {
        filtered[key] = value;
      }
    }
    result = filtered;
  }

  if (rules.mapKeys) {
    const mapped = {};
    for (const [key, value] of Object.entries(result)) {
      const newKey = rules.mapKeys(key, value);
      mapped[newKey] = value;
    }
    result = mapped;
  }

  if (rules.mapValues) {
    for (const [key, value] of Object.entries(result)) {
      result[key] = rules.mapValues(value, key);
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

  if (rules.maxProperties && Object.keys(result).length > rules.maxProperties) {
    const keys = Object.keys(result).slice(0, rules.maxProperties);
    const limited = {};
    for (const key of keys) {
      limited[key] = result[key];
    }
    result = limited;
  }

  return result;
}

/**
 * Escapes HTML entities
 * @param {string} input - String to escape
 * @returns {string} Escaped string
 */
function escapeString(input) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return String(input).replace(/[&<>"'`=/]/g, (char) => escapeMap[char]);
}

/**
 * Unescapes HTML entities
 * @param {string} input - String to unescape
 * @returns {string} Unescaped string
 */
function unescapeString(input) {
  const unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
  };

  return String(input).replace(
    /&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g,
    (entity) => unescapeMap[entity]
  );
}

/**
 * Escapes attribute values
 * @param {string} input - Attribute value to escape
 * @returns {string} Escaped attribute value
 */
function escapeAttribute(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Gets the type of a value
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

/**
 * Common sanitizers
 */

export function sanitizeEmail(email) {
  return sanitizeString(email, {
    trim: true,
    lowercase: true,
    email: true,
    maxLength: 254, // RFC 5321 limit
  });
}

export function sanitizeUsername(username) {
  return sanitizeString(username, {
    trim: true,
    lowercase: true,
    replace: {
      '[^a-z0-9._-]': '', // Only allow alphanumeric, dots, underscores, hyphens
    },
    truncate: 32,
  });
}

export function sanitizePassword(password) {
  return sanitizeString(password, {
    trim: false, // Don't trim passwords
    truncate: 128,
    normalize: false, // Don't normalize passwords
  });
}

export function sanitizePhone(phone, options = {}) {
  const { format = 'e164', country = null } = options;

  let result = sanitizeString(phone, {
    trim: true,
    numeric: true,
    truncate: 15,
  });

  // Basic E.164 formatting
  if (format === 'e164' && result && !result.startsWith('+')) {
    // Add country code if specified
    if (country && country.length === 2) {
      const countryCodes = {
        US: '1',
        CA: '1',
        GB: '44',
        DE: '49',
        FR: '33',
        IN: '91',
        AU: '61',
        JP: '81',
        CN: '86',
        BR: '55',
      };
      const code = countryCodes[country.toUpperCase()];
      if (code) {
        result = `+${code}${result}`;
      }
    }
  }

  return result;
}

export function sanitizeUrl(url) {
  const sanitized = sanitizeString(url, {
    trim: true,
  });

  // Add protocol if missing
  if (sanitized && !sanitized.match(/^https?:\/\//)) {
    return `https://${sanitized}`;
  }

  return sanitized;
}

export function sanitizeSlug(slug) {
  return sanitizeString(slug, {
    trim: true,
    slug: true,
    truncate: 100,
  });
}

// In src/validation/sanitizers.js, update the sanitizeSearch function:

export function sanitizeSearch(query) {
  return sanitizeString(query, {
    trim: true,
    truncate: 100,
    stripTags: true, // ✅ Add this to remove HTML tags completely
    remove: ['\\\\', '/', '"', "'", '`'], // ✅ Remove < and > since stripTags handles them
    whitespace: 'single',
  });
}

export function sanitizeCreditCard(card, options = {}) {
  const { mask = false, keepLast = 4 } = options;

  let result = sanitizeString(card, {
    trim: true,
    numeric: true,
    truncate: 19,
  });

  if (mask && result.length > keepLast) {
    const masked = '*'.repeat(result.length - keepLast);
    const visible = result.slice(-keepLast);
    result = masked + visible;
  }

  return result;
}

export function sanitizePostalCode(code, country = null) {
  const rules = {
    trim: true,
    uppercase: true,
    replace: {
      '[^A-Z0-9 -]': '',
    },
  };

  // Country-specific formatting
  if (country) {
    switch (country.toUpperCase()) {
      case 'US':
        rules.pattern = /^\d{5}(-\d{4})?$/;
        break;
      case 'CA':
        rules.pattern = /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/;
        break;
      case 'GB':
        rules.pattern = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/;
        break;
    }
  }

  return sanitizeString(code, rules);
}

export function sanitizeTags(tags, options = {}) {
  const { maxTags = 20, maxLength = 50, delimiter = ',' } = options;

  if (typeof tags === 'string') {
    tags = tags.split(delimiter);
  }

  return sanitizeArray(tags, {
    compact: true,
    unique: true,
    items: {
      trim: true,
      lowercase: true,
      slug: true,
      truncate: maxLength,
    },
    limit: maxTags,
    filter: (tag) => tag.length > 0,
  });
}

export function sanitizeHexColor(color) {
  let result = sanitizeString(color, {
    trim: true,
    uppercase: true,
    remove: ['[^A-F0-9#]'],
  });

  // Add # if missing
  if (result && !result.startsWith('#')) {
    result = '#' + result;
  }

  // Validate hex color format
  if (result && !/^#([A-F0-9]{3}|[A-F0-9]{6})$/.test(result)) {
    return null; // Invalid color
  }

  return result;
}

export function sanitizeFilename(filename) {
  return sanitizeString(filename, {
    trim: true,
    replace: {
      '[<>:"/\\|?*]': '', // Remove invalid filename characters
      '\\s+': '_', // Replace spaces with underscores
    },
    truncate: 255,
  });
}

export function sanitizeIpAddress(ip) {
  return sanitizeString(ip, {
    trim: true,
    replace: {
      '[^0-9a-fA-F:.%]': '', // Only allow valid IP characters
    },
  });
}
