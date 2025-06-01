/**
 * @voilajsx/appkit - Common validation schemas
 * @module @voilajsx/appkit/validation/schemas
 * @file src/validation/schemas.js
 */

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: {
    type: 'string',
    required: true,
    email: true,
    trim: true,
    lowercase: true,
    maxLength: 254, // RFC 5321 limit
    transform: (value) => value?.toLowerCase()?.trim(),
  },

  password: {
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 128,
    strongPassword: true,
    validate(value) {
      // Custom validation for additional password rules
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/[^A-Za-z0-9]/.test(value)) {
        return 'Password must contain at least one special character';
      }

      // Check for common weak passwords
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty123',
        'abc123456',
        'password123',
        'admin123',
        'letmein123',
      ];
      if (weakPasswords.includes(value.toLowerCase())) {
        return 'Password is too common and not secure';
      }

      return true;
    },
  },

  username: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_-]+$/,
    trim: true,
    lowercase: true,
    validate(value) {
      // Reserved usernames
      const reserved = [
        'admin',
        'root',
        'user',
        'test',
        'guest',
        'api',
        'www',
        'mail',
        'support',
        'help',
        'info',
        'contact',
        'about',
        'null',
        'undefined',
      ];
      if (reserved.includes(value.toLowerCase())) {
        return 'Username is reserved and cannot be used';
      }
      return true;
    },
  },

  id: {
    type: 'string',
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
    minLength: 1,
    maxLength: 50,
    trim: true,
  },

  uuid: {
    type: 'string',
    required: true,
    uuid: true,
    transform: (value) => value?.toLowerCase()?.trim(),
  },

  objectId: {
    type: 'string',
    required: true,
    pattern: /^[0-9a-fA-F]{24}$/,
    transform: (value) => value?.trim(),
  },

  url: {
    type: 'string',
    required: true,
    url: true,
    trim: true,
    maxLength: 2048,
    validate(value) {
      try {
        const url = new URL(value);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must use HTTP or HTTPS protocol';
        }
        return true;
      } catch {
        return 'Invalid URL format';
      }
    },
  },

  phone: {
    type: 'string',
    required: true,
    phone: true,
    transform: (value) => {
      if (typeof value !== 'string') return value;
      // Remove formatting and keep only digits and +
      return value.replace(/[^\d+]/g, '');
    },
    validate(value) {
      // E.164 format validation
      if (!/^\+?[1-9]\d{1,14}$/.test(value)) {
        return 'Phone number must be in valid international format';
      }
      return true;
    },
  },

  creditCard: {
    type: 'string',
    required: true,
    creditCard: true,
    transform: (value) => value?.replace(/\D/g, ''),
    validate(value) {
      // Additional credit card validation
      const cardTypes = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard:
          /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      };

      const isValidType = Object.values(cardTypes).some((pattern) =>
        pattern.test(value)
      );
      if (!isValidType) {
        return 'Credit card number format is not recognized';
      }

      return true;
    },
  },

  date: {
    type: ['string', 'date'],
    required: true,
    transform: (value) => {
      if (value instanceof Date) return value;
      if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date;
      }
      return value;
    },
    validate(value) {
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        return 'Invalid date';
      }
      return true;
    },
  },

  dateString: {
    type: 'string',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    validate(value) {
      const date = new Date(value + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        return 'Invalid date format. Use YYYY-MM-DD';
      }
      return true;
    },
  },

  dateTime: {
    type: ['string', 'date'],
    required: true,
    transform: (value) => {
      if (value instanceof Date) return value;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid datetime');
      }
      return date;
    },
  },

  timestamp: {
    type: 'number',
    required: true,
    integer: true,
    min: 0,
    max: 4102444800000, // Year 2100
    validate(value) {
      // Check if timestamp is in reasonable range
      const date = new Date(value);
      if (date.getFullYear() < 1970 || date.getFullYear() > 2100) {
        return 'Timestamp is outside valid range';
      }
      return true;
    },
  },

  boolean: {
    type: 'boolean',
    transform: (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const truthy = ['true', '1', 'yes', 'on', 'y'];
        const falsy = ['false', '0', 'no', 'off', 'n'];
        const lowered = value.toLowerCase().trim();
        if (truthy.includes(lowered)) return true;
        if (falsy.includes(lowered)) return false;
      }
      return Boolean(value);
    },
  },

  integer: {
    type: 'number',
    integer: true,
    transform: (value) => {
      const num = Number(value);
      if (isNaN(num)) throw new Error('Invalid number');
      return Math.trunc(num);
    },
  },

  positiveInteger: {
    type: 'number',
    integer: true,
    min: 1,
    transform: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    },
  },

  nonNegativeInteger: {
    type: 'number',
    integer: true,
    min: 0,
    transform: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    },
  },

  percentage: {
    type: 'number',
    min: 0,
    max: 100,
    precision: 2,
    transform: (value) => {
      const num = parseFloat(value);
      if (isNaN(num)) throw new Error('Invalid percentage');
      return Math.round(num * 100) / 100;
    },
  },

  currency: {
    type: 'number',
    min: 0,
    precision: 2,
    transform: (value) => {
      const num = parseFloat(value);
      if (isNaN(num)) throw new Error('Invalid currency amount');
      return Math.round(num * 100) / 100;
    },
  },

  price: {
    type: 'number',
    min: 0,
    precision: 2,
    finite: true,
    transform: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || !isFinite(num)) {
        throw new Error('Invalid price');
      }
      return Math.round(num * 100) / 100;
    },
  },

  tags: {
    type: 'array',
    items: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      trim: true,
      lowercase: true,
      slug: true,
    },
    minItems: 0,
    maxItems: 20,
    unique: true,
    transform: (value) => {
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
      return Array.isArray(value) ? value : [];
    },
  },

  slug: {
    type: 'string',
    required: true,
    slug: true,
    minLength: 1,
    maxLength: 100,
    lowercase: true,
    trim: true,
    transform: (value) => {
      if (typeof value !== 'string') return value;
      return value
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
    },
  },

  hexColor: {
    type: 'string',
    required: true,
    hexColor: true,
    transform: (value) => {
      if (typeof value !== 'string') return value;
      let color = value.trim().toUpperCase();
      if (!color.startsWith('#')) {
        color = '#' + color;
      }
      return color;
    },
  },

  ipAddress: {
    type: 'string',
    required: true,
    ipAddress: true,
    trim: true,
  },

  metadata: {
    type: 'object',
    additionalProperties: {
      type: ['string', 'number', 'boolean', 'null'],
    },
    maxProperties: 50,
    validate(value) {
      // Ensure metadata values are serializable
      try {
        JSON.stringify(value);
        return true;
      } catch {
        return 'Metadata must be JSON serializable';
      }
    },
  },

  json: {
    type: ['object', 'array', 'string'],
    transform: (value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          throw new Error('Invalid JSON string');
        }
      }
      return value;
    },
    validate(value) {
      try {
        JSON.stringify(value);
        return true;
      } catch {
        return 'Value must be JSON serializable';
      }
    },
  },

  base64: {
    type: 'string',
    required: true,
    pattern: /^[A-Za-z0-9+/]*={0,2}$/,
    validate(value) {
      // Check if length is multiple of 4
      if (value.length % 4 !== 0) {
        return 'Base64 string length must be multiple of 4';
      }

      try {
        // Try to decode to validate
        if (typeof atob !== 'undefined') {
          atob(value);
        } else if (typeof Buffer !== 'undefined') {
          Buffer.from(value, 'base64');
        }
        return true;
      } catch {
        return 'Invalid base64 encoding';
      }
    },
  },

  semver: {
    type: 'string',
    required: true,
    pattern:
      /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/,
    trim: true,
  },

  // Complex objects
  address: {
    type: 'object',
    required: ['street', 'city', 'country', 'postalCode'],
    properties: {
      street: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
        trim: true,
      },
      street2: {
        type: 'string',
        maxLength: 255,
        trim: true,
      },
      city: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        trim: true,
      },
      state: {
        type: 'string',
        maxLength: 100,
        trim: true,
      },
      country: {
        type: 'string',
        required: true,
        minLength: 2,
        maxLength: 3,
        uppercase: true,
        pattern: /^[A-Z]{2,3}$/,
      },
      postalCode: {
        type: 'string',
        required: true,
        minLength: 3,
        maxLength: 20,
        trim: true,
        uppercase: true,
      },
    },
    additionalProperties: false,
  },

  coordinates: {
    type: 'object',
    required: ['latitude', 'longitude'],
    properties: {
      latitude: {
        type: 'number',
        required: true,
        min: -90,
        max: 90,
        precision: 6,
      },
      longitude: {
        type: 'number',
        required: true,
        min: -180,
        max: 180,
        precision: 6,
      },
      altitude: {
        type: 'number',
        min: -1000,
        max: 50000,
        precision: 2,
      },
    },
    additionalProperties: false,
  },

  pagination: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        integer: true,
        min: 1,
        default: 1,
        transform: (value) => parseInt(value, 10) || 1,
      },
      limit: {
        type: 'number',
        integer: true,
        min: 1,
        max: 100,
        default: 20,
        transform: (value) => Math.min(parseInt(value, 10) || 20, 100),
      },
      sort: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc',
        lowercase: true,
      },
      sortBy: {
        type: 'string',
        pattern: /^[a-zA-Z_][a-zA-Z0-9_.]*$/,
        maxLength: 50,
      },
    },
    additionalProperties: false,
  },

  searchQuery: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        trim: true,
        transform: (value) => value?.trim().replace(/\s+/g, ' '),
      },
      filters: {
        type: 'object',
        additionalProperties: true,
        maxProperties: 20,
      },
      page: {
        type: 'number',
        integer: true,
        min: 1,
        default: 1,
        transform: (value) => parseInt(value, 10) || 1,
      },
      limit: {
        type: 'number',
        integer: true,
        min: 1,
        max: 100,
        default: 20,
        transform: (value) => Math.min(parseInt(value, 10) || 20, 100),
      },
    },
    additionalProperties: false,
  },

  fileUpload: {
    type: 'object',
    required: ['filename', 'mimetype', 'size', 'data'],
    properties: {
      filename: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
        pattern: /^[^<>:"/\\|?*\x00-\x1f]+$/,
        trim: true,
      },
      mimetype: {
        type: 'string',
        required: true,
        pattern:
          /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/,
      },
      size: {
        type: 'number',
        required: true,
        integer: true,
        min: 0,
        max: 50 * 1024 * 1024, // 50MB default max
      },
      data: {
        type: ['string', 'object'], // Buffer or base64 string
        required: true,
      },
    },
    additionalProperties: false,
    validate(value) {
      // Additional file validation
      const dangerousTypes = [
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program',
        'text/javascript',
        'application/javascript',
      ];

      if (dangerousTypes.includes(value.mimetype)) {
        return 'File type is not allowed for security reasons';
      }

      return true;
    },
  },

  timeRange: {
    type: 'object',
    required: ['start', 'end'],
    properties: {
      start: {
        type: ['string', 'date'],
        required: true,
        transform: (value) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid start date');
          }
          return date;
        },
      },
      end: {
        type: ['string', 'date'],
        required: true,
        transform: (value) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid end date');
          }
          return date;
        },
      },
    },
    additionalProperties: false,
    validate(value) {
      const start = new Date(value.start);
      const end = new Date(value.end);

      if (start >= end) {
        return 'Start time must be before end time';
      }

      // Check if range is reasonable (not more than 100 years)
      const maxRange = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years in ms
      if (end.getTime() - start.getTime() > maxRange) {
        return 'Time range is too large (maximum 100 years)';
      }

      return true;
    },
  },

  socialMediaHandles: {
    type: 'object',
    properties: {
      twitter: {
        type: 'string',
        pattern: /^@?[a-zA-Z0-9_]{1,15}$/,
        transform: (value) => value?.replace(/^@/, ''),
      },
      instagram: {
        type: 'string',
        pattern: /^[a-zA-Z0-9_.]{1,30}$/,
      },
      facebook: {
        type: 'string',
        pattern: /^[a-zA-Z0-9.]{5,50}$/,
      },
      linkedin: {
        type: 'string',
        url: true,
        validate(value) {
          return value.includes('linkedin.com') || 'Must be a LinkedIn URL';
        },
      },
      github: {
        type: 'string',
        pattern: /^[a-zA-Z0-9-]{1,39}$/,
      },
      youtube: {
        type: 'string',
        url: true,
        validate(value) {
          return (
            value.includes('youtube.com') ||
            value.includes('youtu.be') ||
            'Must be a YouTube URL'
          );
        },
      },
      tiktok: {
        type: 'string',
        pattern: /^@?[a-zA-Z0-9_.]{1,24}$/,
        transform: (value) => value?.replace(/^@/, ''),
      },
    },
    additionalProperties: false,
  },

  creditCardExpiry: {
    type: 'string',
    required: true,
    pattern: /^(0[1-9]|1[0-2])\/([0-9]{2}|[0-9]{4})$/,
    validate(value) {
      const [month, year] = value.split('/');
      const monthNum = parseInt(month, 10);
      let yearNum = parseInt(year, 10);

      // Convert 2-digit year to 4-digit
      if (yearNum < 100) {
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        yearNum = century + yearNum;

        if (yearNum < currentYear) {
          yearNum += 100;
        }
      }

      // Check if not expired
      const now = new Date();
      const expiryDate = new Date(yearNum, monthNum - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      if (expiryDate < currentMonth) {
        return 'Credit card has expired';
      }

      return true;
    },
  },
};

/**
 * Creates a new schema
 * @param {Object} definition - Schema definition
 * @returns {Object} Schema object
 */
export function createSchema(definition) {
  return { ...definition };
}

/**
 * Merges multiple schemas
 * @param {...Object} schemas - Schemas to merge
 * @returns {Object} Merged schema
 */
export function mergeSchemas(...schemas) {
  const merged = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const schema of schemas) {
    if (schema.properties) {
      merged.properties = { ...merged.properties, ...schema.properties };
    }

    if (schema.required) {
      if (Array.isArray(schema.required)) {
        merged.required = [
          ...new Set([...merged.required, ...schema.required]),
        ];
      }
    }

    // Merge other properties
    for (const [key, value] of Object.entries(schema)) {
      if (key !== 'properties' && key !== 'required') {
        if (
          key === 'validate' &&
          typeof merged[key] === 'function' &&
          typeof value === 'function'
        ) {
          // Combine validation functions
          const existingValidate = merged[key];
          merged[key] = function (val, ctx) {
            const result1 = existingValidate.call(this, val, ctx);
            if (result1 !== true) return result1;
            return value.call(this, val, ctx);
          };
        } else {
          merged[key] = value;
        }
      }
    }
  }

  return merged;
}

/**
 * Extends a schema with additional properties
 * @param {Object} baseSchema - Base schema
 * @param {Object} extensions - Extension properties
 * @returns {Object} Extended schema
 */
export function extendSchema(baseSchema, extensions) {
  const extended = { ...baseSchema };

  if (extensions.properties) {
    extended.properties = {
      ...(extended.properties || {}),
      ...extensions.properties,
    };
  }

  if (extensions.required) {
    if (Array.isArray(extensions.required)) {
      extended.required = [
        ...(extended.required || []),
        ...extensions.required,
      ];
    }
  }

  // Extend other properties
  for (const [key, value] of Object.entries(extensions)) {
    if (key !== 'properties' && key !== 'required') {
      if (
        key === 'validate' &&
        typeof extended[key] === 'function' &&
        typeof value === 'function'
      ) {
        // Combine validation functions
        const existingValidate = extended[key];
        extended[key] = function (val, ctx) {
          const result1 = existingValidate.call(this, val, ctx);
          if (result1 !== true) return result1;
          return value.call(this, val, ctx);
        };
      } else {
        extended[key] = value;
      }
    }
  }

  return extended;
}

/**
 * Creates a conditional schema
 * @param {Object} condition - Condition object
 * @param {Object} thenSchema - Schema to use if condition is true
 * @param {Object} [elseSchema] - Schema to use if condition is false
 * @returns {Object} Conditional schema
 */
export function createConditionalSchema(
  condition,
  thenSchema,
  elseSchema = {}
) {
  return {
    when: condition,
    then: thenSchema,
    otherwise: elseSchema,
  };
}

/**
 * Creates an enum schema
 * @param {Array} values - Allowed values
 * @param {Object} [options] - Additional options
 * @returns {Object} Enum schema
 */
export function createEnumSchema(values, options = {}) {
  return {
    type: 'string',
    enum: values,
    ...options,
  };
}

/**
 * Creates an array schema
 * @param {Object} itemSchema - Schema for array items
 * @param {Object} [options] - Additional options
 * @returns {Object} Array schema
 */
export function createArraySchema(itemSchema, options = {}) {
  return {
    type: 'array',
    items: itemSchema,
    ...options,
  };
}

/**
 * Common schema templates
 */

export const userRegistrationSchema = createSchema({
  type: 'object',
  required: ['email', 'password', 'username', 'terms'],
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      trim: true,
      alpha: true,
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      trim: true,
      alpha: true,
    },
    dateOfBirth: {
      ...commonSchemas.dateString,
      required: false,
      validate(value) {
        const date = new Date(value);
        const now = new Date();
        const age = Math.floor((now - date) / (365.25 * 24 * 60 * 60 * 1000));

        if (age < 13) {
          return 'Must be at least 13 years old';
        }
        if (age > 120) {
          return 'Invalid birth date';
        }
        return true;
      },
    },
    terms: {
      type: 'boolean',
      required: true,
      truthy: true,
      validate(value) {
        return value === true || 'Must accept terms and conditions';
      },
    },
    newsletter: {
      type: 'boolean',
      default: false,
    },
  },
  additionalProperties: false,
});

export const userLoginSchema = createSchema({
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: commonSchemas.email,
    password: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 128,
    },
    remember: {
      type: 'boolean',
      default: false,
    },
    captcha: {
      type: 'string',
      minLength: 4,
      maxLength: 10,
    },
  },
  additionalProperties: false,
});

export const userProfileSchema = createSchema({
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      trim: true,
    },
    displayName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      trim: true,
    },
    bio: {
      type: 'string',
      maxLength: 500,
      trim: true,
    },
    avatar: commonSchemas.url,
    phone: commonSchemas.phone,
    address: commonSchemas.address,
    socialMedia: commonSchemas.socialMediaHandles,
    dateOfBirth: commonSchemas.dateString,
    website: commonSchemas.url,
    timezone: {
      type: 'string',
      enum: [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Kolkata',
        'Australia/Sydney',
      ],
      default: 'UTC',
    },
    language: {
      type: 'string',
      pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
      default: 'en',
    },
    preferences: {
      type: 'object',
      properties: {
        notifications: {
          type: 'object',
          properties: {
            email: { type: 'boolean', default: true },
            push: { type: 'boolean', default: true },
            sms: { type: 'boolean', default: false },
            marketing: { type: 'boolean', default: false },
          },
          additionalProperties: false,
        },
        privacy: {
          type: 'object',
          properties: {
            profileVisible: { type: 'boolean', default: true },
            showEmail: { type: 'boolean', default: false },
            showPhone: { type: 'boolean', default: false },
          },
          additionalProperties: false,
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'auto'],
          default: 'auto',
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
});

export const passwordResetSchema = createSchema({
  type: 'object',
  required: ['token', 'password'],
  properties: {
    token: {
      type: 'string',
      required: true,
      minLength: 32,
      maxLength: 512,
      trim: true,
    },
    password: commonSchemas.password,
    confirmPassword: {
      type: 'string',
      required: true,
      validate(value, context) {
        if (value !== context.data.password) {
          return 'Passwords do not match';
        }
        return true;
      },
    },
  },
  additionalProperties: false,
});

export const changePasswordSchema = createSchema({
  type: 'object',
  required: ['currentPassword', 'newPassword'],
  properties: {
    currentPassword: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 128,
    },
    newPassword: commonSchemas.password,
    confirmPassword: {
      type: 'string',
      required: true,
      validate(value, context) {
        if (value !== context.data.newPassword) {
          return 'New passwords do not match';
        }
        return true;
      },
    },
  },
  additionalProperties: false,
  validate(value) {
    if (value.currentPassword === value.newPassword) {
      return 'New password must be different from current password';
    }
    return true;
  },
});

export const productSchema = createSchema({
  type: 'object',
  required: ['name', 'price', 'category'],
  properties: {
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 255,
      trim: true,
    },
    description: {
      type: 'string',
      maxLength: 5000,
      trim: true,
    },
    shortDescription: {
      type: 'string',
      maxLength: 300,
      trim: true,
    },
    price: commonSchemas.price,
    salePrice: {
      ...commonSchemas.price,
      required: false,
      validate(value, context) {
        if (value && context.data.price && value >= context.data.price) {
          return 'Sale price must be less than regular price';
        }
        return true;
      },
    },
    cost: commonSchemas.price,
    sku: {
      type: 'string',
      pattern: /^[A-Z0-9-_]+$/,
      maxLength: 50,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: 'string',
      pattern: /^[0-9]{8,14}$/,
      trim: true,
    },
    category: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      trim: true,
    },
    subcategory: {
      type: 'string',
      maxLength: 100,
      trim: true,
    },
    brand: {
      type: 'string',
      maxLength: 100,
      trim: true,
    },
    tags: commonSchemas.tags,
    images: {
      type: 'array',
      items: commonSchemas.url,
      maxItems: 20,
      unique: true,
    },
    specifications: {
      type: 'object',
      additionalProperties: {
        type: ['string', 'number', 'boolean'],
      },
      maxProperties: 50,
    },
    dimensions: {
      type: 'object',
      properties: {
        length: { type: 'number', min: 0, precision: 2 },
        width: { type: 'number', min: 0, precision: 2 },
        height: { type: 'number', min: 0, precision: 2 },
        weight: { type: 'number', min: 0, precision: 3 },
        unit: { type: 'string', enum: ['cm', 'in', 'mm'], default: 'cm' },
        weightUnit: {
          type: 'string',
          enum: ['kg', 'lb', 'g', 'oz'],
          default: 'kg',
        },
      },
      additionalProperties: false,
    },
    inventory: {
      type: 'object',
      properties: {
        quantity: { type: 'number', integer: true, min: 0, default: 0 },
        lowStockThreshold: {
          type: 'number',
          integer: true,
          min: 0,
          default: 10,
        },
        trackInventory: { type: 'boolean', default: true },
        allowBackorders: { type: 'boolean', default: false },
      },
      additionalProperties: false,
    },
    shipping: {
      type: 'object',
      properties: {
        weight: { type: 'number', min: 0, precision: 3 },
        length: { type: 'number', min: 0, precision: 2 },
        width: { type: 'number', min: 0, precision: 2 },
        height: { type: 'number', min: 0, precision: 2 },
        freeShipping: { type: 'boolean', default: false },
        shippingClass: { type: 'string', maxLength: 50 },
      },
      additionalProperties: false,
    },
    status: {
      type: 'string',
      enum: ['draft', 'active', 'inactive', 'discontinued'],
      default: 'draft',
    },
    featured: { type: 'boolean', default: false },
    metadata: commonSchemas.metadata,
  },
  additionalProperties: false,
});

export const orderSchema = createSchema({
  type: 'object',
  required: ['items', 'shippingAddress', 'paymentMethod'],
  properties: {
    orderNumber: {
      type: 'string',
      pattern: /^ORD-[A-Z0-9]{8,}$/,
      uppercase: true,
    },
    items: {
      type: 'array',
      required: true,
      minItems: 1,
      maxItems: 100,
      items: {
        type: 'object',
        required: ['productId', 'quantity', 'price'],
        properties: {
          productId: commonSchemas.id,
          variantId: commonSchemas.id,
          quantity: {
            type: 'number',
            integer: true,
            min: 1,
            max: 1000,
          },
          price: commonSchemas.price,
          originalPrice: commonSchemas.price,
          discount: {
            type: 'number',
            min: 0,
            max: 100,
            precision: 2,
          },
          total: commonSchemas.price,
          name: { type: 'string', maxLength: 255 },
          sku: { type: 'string', maxLength: 50 },
          image: commonSchemas.url,
        },
        additionalProperties: false,
        validate(item) {
          const expectedTotal = item.price * item.quantity;
          if (Math.abs(item.total - expectedTotal) > 0.01) {
            return 'Item total does not match price × quantity';
          }
          return true;
        },
      },
    },
    customer: {
      type: 'object',
      required: ['email'],
      properties: {
        id: commonSchemas.id,
        email: commonSchemas.email,
        firstName: { type: 'string', maxLength: 50 },
        lastName: { type: 'string', maxLength: 50 },
        phone: commonSchemas.phone,
      },
      additionalProperties: false,
    },
    shippingAddress: commonSchemas.address,
    billingAddress: {
      ...commonSchemas.address,
      required: false,
    },
    paymentMethod: {
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: [
            'credit_card',
            'debit_card',
            'paypal',
            'stripe',
            'bank_transfer',
            'cash_on_delivery',
          ],
        },
        provider: { type: 'string', maxLength: 50 },
        transactionId: { type: 'string', maxLength: 100 },
        last4: { type: 'string', pattern: /^\d{4}$/ },
        expiryMonth: { type: 'number', integer: true, min: 1, max: 12 },
        expiryYear: { type: 'number', integer: true, min: 2024, max: 2050 },
        cardType: {
          type: 'string',
          enum: ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners'],
        },
      },
      additionalProperties: false,
    },
    totals: {
      type: 'object',
      required: ['subtotal', 'total'],
      properties: {
        subtotal: commonSchemas.price,
        tax: { type: 'number', min: 0, precision: 2, default: 0 },
        shipping: { type: 'number', min: 0, precision: 2, default: 0 },
        discount: { type: 'number', min: 0, precision: 2, default: 0 },
        total: commonSchemas.price,
      },
      additionalProperties: false,
    },
    shipping: {
      type: 'object',
      properties: {
        method: { type: 'string', maxLength: 100 },
        provider: { type: 'string', maxLength: 50 },
        trackingNumber: { type: 'string', maxLength: 100 },
        estimatedDelivery: commonSchemas.dateString,
        cost: commonSchemas.price,
      },
      additionalProperties: false,
    },
    couponCode: {
      type: 'string',
      pattern: /^[A-Z0-9-_]+$/,
      maxLength: 50,
      uppercase: true,
    },
    discountAmount: {
      type: 'number',
      min: 0,
      precision: 2,
    },
    notes: {
      type: 'string',
      maxLength: 1000,
      trim: true,
    },
    status: {
      type: 'string',
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    currency: {
      type: 'string',
      pattern: /^[A-Z]{3}$/,
      default: 'USD',
    },
    metadata: commonSchemas.metadata,
  },
  additionalProperties: false,
});

export const invoiceSchema = createSchema({
  type: 'object',
  required: ['invoiceNumber', 'customer', 'items', 'dueDate'],
  properties: {
    invoiceNumber: {
      type: 'string',
      pattern: /^INV-[A-Z0-9]{6,}$/,
      uppercase: true,
    },
    customer: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        id: commonSchemas.id,
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: commonSchemas.email,
        company: { type: 'string', maxLength: 100 },
        taxId: { type: 'string', maxLength: 50 },
        address: commonSchemas.address,
      },
      additionalProperties: false,
    },
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['description', 'quantity', 'rate'],
        properties: {
          description: { type: 'string', minLength: 1, maxLength: 500 },
          quantity: { type: 'number', min: 0, precision: 3 },
          rate: commonSchemas.price,
          amount: commonSchemas.price,
          taxRate: {
            type: 'number',
            min: 0,
            max: 100,
            precision: 2,
            default: 0,
          },
        },
        additionalProperties: false,
      },
    },
    issueDate: commonSchemas.dateString,
    dueDate: commonSchemas.dateString,
    terms: { type: 'string', maxLength: 1000 },
    notes: { type: 'string', maxLength: 1000 },
    status: {
      type: 'string',
      enum: [
        'draft',
        'sent',
        'viewed',
        'partial',
        'paid',
        'overdue',
        'cancelled',
      ],
      default: 'draft',
    },
    currency: {
      type: 'string',
      pattern: /^[A-Z]{3}$/,
      default: 'USD',
    },
    totals: {
      type: 'object',
      properties: {
        subtotal: commonSchemas.price,
        taxAmount: { type: 'number', min: 0, precision: 2, default: 0 },
        total: commonSchemas.price,
        amountPaid: { type: 'number', min: 0, precision: 2, default: 0 },
        amountDue: { type: 'number', precision: 2 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  validate(invoice) {
    const issueDate = new Date(invoice.issueDate);
    const dueDate = new Date(invoice.dueDate);

    if (dueDate <= issueDate) {
      return 'Due date must be after issue date';
    }

    return true;
  },
});

export const commentSchema = createSchema({
  type: 'object',
  required: ['content'],
  properties: {
    content: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 5000,
      trim: true,
      validate(value) {
        // Check for spam patterns
        const spamPatterns = [
          /(.)\1{10,}/, // Repeated characters
          /https?:\/\/[^\s]+.*https?:\/\/[^\s]+/, // Multiple URLs
          /buy\s+now|click\s+here|free\s+money/i, // Common spam phrases
        ];

        for (const pattern of spamPatterns) {
          if (pattern.test(value)) {
            return 'Comment appears to be spam';
          }
        }

        return true;
      },
    },
    parentId: commonSchemas.id,
    authorId: commonSchemas.id,
    authorName: {
      type: 'string',
      maxLength: 100,
      trim: true,
    },
    authorEmail: commonSchemas.email,
    rating: {
      type: 'number',
      min: 1,
      max: 5,
      integer: true,
    },
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected', 'spam'],
      default: 'pending',
    },
    ipAddress: commonSchemas.ipAddress,
    userAgent: {
      type: 'string',
      maxLength: 500,
    },
    metadata: commonSchemas.metadata,
  },
  additionalProperties: false,
});

export const reviewSchema = createSchema({
  type: 'object',
  required: ['rating', 'title', 'content'],
  properties: {
    productId: commonSchemas.id,
    userId: commonSchemas.id,
    rating: {
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      integer: true,
    },
    title: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 100,
      trim: true,
    },
    content: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 2000,
      trim: true,
    },
    pros: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        trim: true,
      },
      maxItems: 10,
    },
    cons: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        trim: true,
      },
      maxItems: 10,
    },
    verified: {
      type: 'boolean',
      default: false,
    },
    helpful: {
      type: 'number',
      integer: true,
      min: 0,
      default: 0,
    },
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    images: {
      type: 'array',
      items: commonSchemas.url,
      maxItems: 5,
    },
  },
  additionalProperties: false,
});

export const apiKeySchema = createSchema({
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      trim: true,
    },
    description: {
      type: 'string',
      maxLength: 500,
      trim: true,
    },
    permissions: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['read', 'write', 'delete', 'admin'],
      },
      minItems: 1,
      unique: true,
    },
    scopes: {
      type: 'array',
      items: {
        type: 'string',
        pattern: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
      },
      maxItems: 50,
      unique: true,
    },
    expiresAt: {
      ...commonSchemas.dateTime,
      required: false,
      validate(value) {
        if (value && new Date(value) <= new Date()) {
          return 'Expiration date must be in the future';
        }
        return true;
      },
    },
    rateLimit: {
      type: 'object',
      properties: {
        requests: { type: 'number', integer: true, min: 1, max: 10000 },
        window: {
          type: 'string',
          enum: ['second', 'minute', 'hour', 'day'],
          default: 'hour',
        },
        burst: { type: 'number', integer: true, min: 1 },
      },
      additionalProperties: false,
    },
    ipWhitelist: {
      type: 'array',
      items: commonSchemas.ipAddress,
      maxItems: 100,
      unique: true,
    },
    environment: {
      type: 'string',
      enum: ['development', 'staging', 'production'],
      default: 'development',
    },
    active: {
      type: 'boolean',
      default: true,
    },
  },
  additionalProperties: false,
});

export const webhookSchema = createSchema({
  type: 'object',
  required: ['url', 'events'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      trim: true,
    },
    url: {
      ...commonSchemas.url,
      validate(value) {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'Webhook URL must use HTTP or HTTPS';
        }
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          return 'Localhost URLs are not allowed for webhooks';
        }
        return true;
      },
    },
    events: {
      type: 'array',
      minItems: 1,
      maxItems: 50,
      items: {
        type: 'string',
        pattern: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
      },
      unique: true,
    },
    secret: {
      type: 'string',
      minLength: 16,
      maxLength: 128,
      pattern: /^[A-Za-z0-9+/=]+$/,
    },
    headers: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        maxLength: 1000,
      },
      maxProperties: 20,
    },
    timeout: {
      type: 'number',
      integer: true,
      min: 1,
      max: 30,
      default: 10,
    },
    retries: {
      type: 'number',
      integer: true,
      min: 0,
      max: 5,
      default: 3,
    },
    active: {
      type: 'boolean',
      default: true,
    },
  },
  additionalProperties: false,
});

export const subscriptionSchema = createSchema({
  type: 'object',
  required: ['planId', 'customerId'],
  properties: {
    planId: commonSchemas.id,
    customerId: commonSchemas.id,
    status: {
      type: 'string',
      enum: [
        'trial',
        'active',
        'past_due',
        'cancelled',
        'unpaid',
        'incomplete',
      ],
      default: 'trial',
    },
    trialStart: commonSchemas.dateTime,
    trialEnd: commonSchemas.dateTime,
    currentPeriodStart: commonSchemas.dateTime,
    currentPeriodEnd: commonSchemas.dateTime,
    cancelAtPeriodEnd: {
      type: 'boolean',
      default: false,
    },
    canceledAt: commonSchemas.dateTime,
    paymentMethod: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['card', 'bank_account', 'paypal'],
        },
        last4: { type: 'string', pattern: /^\d{4}$/ },
        brand: { type: 'string', maxLength: 50 },
        expiryMonth: { type: 'number', integer: true, min: 1, max: 12 },
        expiryYear: { type: 'number', integer: true, min: 2024 },
      },
      additionalProperties: false,
    },
    billing: {
      type: 'object',
      properties: {
        interval: {
          type: 'string',
          enum: ['month', 'year'],
          default: 'month',
        },
        intervalCount: {
          type: 'number',
          integer: true,
          min: 1,
          max: 12,
          default: 1,
        },
        amount: commonSchemas.price,
        currency: {
          type: 'string',
          pattern: /^[A-Z]{3}$/,
          default: 'USD',
        },
      },
      additionalProperties: false,
    },
    addons: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'quantity'],
        properties: {
          id: commonSchemas.id,
          quantity: { type: 'number', integer: true, min: 1 },
          amount: commonSchemas.price,
        },
        additionalProperties: false,
      },
      maxItems: 20,
    },
    discounts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['code', 'type', 'value'],
        properties: {
          code: { type: 'string', maxLength: 50 },
          type: { type: 'string', enum: ['percent', 'fixed'] },
          value: { type: 'number', min: 0 },
          duration: { type: 'string', enum: ['once', 'repeating', 'forever'] },
          durationInMonths: { type: 'number', integer: true, min: 1 },
        },
        additionalProperties: false,
      },
      maxItems: 5,
    },
    metadata: commonSchemas.metadata,
  },
  additionalProperties: false,
});

export const supportTicketSchema = createSchema({
  type: 'object',
  required: ['subject', 'description', 'priority'],
  properties: {
    ticketNumber: {
      type: 'string',
      pattern: /^TKT-[A-Z0-9]{8}$/,
      uppercase: true,
    },
    subject: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 200,
      trim: true,
    },
    description: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 5000,
      trim: true,
    },
    category: {
      type: 'string',
      enum: [
        'technical',
        'billing',
        'feature_request',
        'bug_report',
        'general',
      ],
      default: 'general',
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: 'string',
      enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: commonSchemas.id,
    customer: {
      type: 'object',
      required: ['email'],
      properties: {
        id: commonSchemas.id,
        name: { type: 'string', maxLength: 100 },
        email: commonSchemas.email,
        company: { type: 'string', maxLength: 100 },
      },
      additionalProperties: false,
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        slug: true,
      },
      maxItems: 10,
      unique: true,
    },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['filename', 'url', 'size'],
        properties: {
          filename: { type: 'string', minLength: 1, maxLength: 255 },
          url: commonSchemas.url,
          size: {
            type: 'number',
            integer: true,
            min: 0,
            max: 10 * 1024 * 1024,
          },
          contentType: { type: 'string', maxLength: 100 },
        },
        additionalProperties: false,
      },
      maxItems: 5,
    },
    sla: {
      type: 'object',
      properties: {
        responseTime: { type: 'number', integer: true, min: 0 }, // hours
        resolutionTime: { type: 'number', integer: true, min: 0 }, // hours
        breached: { type: 'boolean', default: false },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
});

export const blogPostSchema = createSchema({
  type: 'object',
  required: ['title', 'content', 'slug'],
  properties: {
    title: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 200,
      trim: true,
    },
    slug: commonSchemas.slug,
    excerpt: {
      type: 'string',
      maxLength: 500,
      trim: true,
    },
    content: {
      type: 'string',
      required: true,
      minLength: 100,
      maxLength: 50000,
      trim: true,
    },
    authorId: commonSchemas.id,
    status: {
      type: 'string',
      enum: ['draft', 'published', 'scheduled', 'archived'],
      default: 'draft',
    },
    publishedAt: commonSchemas.dateTime,
    scheduledAt: commonSchemas.dateTime,
    featuredImage: commonSchemas.url,
    category: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      trim: true,
    },
    tags: commonSchemas.tags,
    seo: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 70 },
        description: { type: 'string', maxLength: 160 },
        keywords: {
          type: 'array',
          items: { type: 'string', maxLength: 50 },
          maxItems: 20,
        },
        canonicalUrl: commonSchemas.url,
        noIndex: { type: 'boolean', default: false },
        noFollow: { type: 'boolean', default: false },
      },
      additionalProperties: false,
    },
    readingTime: {
      type: 'number',
      integer: true,
      min: 1,
    },
    allowComments: {
      type: 'boolean',
      default: true,
    },
    featured: {
      type: 'boolean',
      default: false,
    },
    viewCount: {
      type: 'number',
      integer: true,
      min: 0,
      default: 0,
    },
    metadata: commonSchemas.metadata,
  },
  additionalProperties: false,
  validate(post) {
    if (post.status === 'scheduled' && !post.scheduledAt) {
      return 'Scheduled posts must have a scheduled date';
    }
    if (post.scheduledAt && new Date(post.scheduledAt) <= new Date()) {
      return 'Scheduled date must be in the future';
    }
    return true;
  },
});

export const eventSchema = createSchema({
  type: 'object',
  required: ['title', 'startDate', 'endDate'],
  properties: {
    title: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 200,
      trim: true,
    },
    description: {
      type: 'string',
      maxLength: 5000,
      trim: true,
    },
    shortDescription: {
      type: 'string',
      maxLength: 300,
      trim: true,
    },
    startDate: commonSchemas.dateTime,
    endDate: commonSchemas.dateTime,
    timezone: {
      type: 'string',
      default: 'UTC',
    },
    allDay: {
      type: 'boolean',
      default: false,
    },
    recurring: {
      type: 'object',
      properties: {
        frequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'yearly'],
        },
        interval: {
          type: 'number',
          integer: true,
          min: 1,
          max: 100,
          default: 1,
        },
        endDate: commonSchemas.dateTime,
        count: {
          type: 'number',
          integer: true,
          min: 1,
          max: 1000,
        },
        daysOfWeek: {
          type: 'array',
          items: {
            type: 'number',
            integer: true,
            min: 0,
            max: 6,
          },
          maxItems: 7,
          unique: true,
        },
      },
      additionalProperties: false,
    },
    location: {
      type: 'object',
      properties: {
        name: { type: 'string', maxLength: 200 },
        address: commonSchemas.address,
        coordinates: commonSchemas.coordinates,
        url: commonSchemas.url,
        virtual: { type: 'boolean', default: false },
        meetingLink: commonSchemas.url,
        meetingId: { type: 'string', maxLength: 100 },
        meetingPassword: { type: 'string', maxLength: 50 },
      },
      additionalProperties: false,
    },
    organizer: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        id: commonSchemas.id,
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: commonSchemas.email,
        phone: commonSchemas.phone,
        organization: { type: 'string', maxLength: 100 },
      },
      additionalProperties: false,
    },
    capacity: {
      type: 'number',
      integer: true,
      min: 1,
      max: 100000,
    },
    registrationRequired: {
      type: 'boolean',
      default: false,
    },
    registrationDeadline: commonSchemas.dateTime,
    price: {
      type: 'object',
      properties: {
        amount: commonSchemas.price,
        currency: { type: 'string', pattern: /^[A-Z]{3}$/, default: 'USD' },
        free: { type: 'boolean', default: true },
        earlyBird: {
          type: 'object',
          properties: {
            amount: commonSchemas.price,
            deadline: commonSchemas.dateTime,
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    category: {
      type: 'string',
      enum: [
        'conference',
        'workshop',
        'seminar',
        'webinar',
        'meetup',
        'training',
        'social',
        'other',
      ],
      default: 'other',
    },
    tags: commonSchemas.tags,
    status: {
      type: 'string',
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    visibility: {
      type: 'string',
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },
    images: {
      type: 'array',
      items: commonSchemas.url,
      maxItems: 10,
    },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'url'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          url: commonSchemas.url,
          description: { type: 'string', maxLength: 500 },
        },
        additionalProperties: false,
      },
      maxItems: 20,
    },
    customFields: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          type: {
            type: 'string',
            enum: [
              'text',
              'number',
              'email',
              'phone',
              'date',
              'select',
              'checkbox',
            ],
          },
          required: { type: 'boolean', default: false },
          options: {
            type: 'array',
            items: { type: 'string', maxLength: 100 },
            maxItems: 50,
          },
          placeholder: { type: 'string', maxLength: 200 },
          validation: { type: 'string', maxLength: 500 },
        },
        additionalProperties: false,
      },
      maxItems: 20,
    },
  },
  additionalProperties: false,
  validate(event) {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (end <= start) {
      return 'End date must be after start date';
    }

    if (
      event.registrationDeadline &&
      new Date(event.registrationDeadline) > start
    ) {
      return 'Registration deadline must be before event start date';
    }

    if (
      event.price?.earlyBird?.deadline &&
      new Date(event.price.earlyBird.deadline) > start
    ) {
      return 'Early bird deadline must be before event start date';
    }

    return true;
  },
});

export const newsletterSubscriptionSchema = createSchema({
  type: 'object',
  required: ['email'],
  properties: {
    email: commonSchemas.email,
    firstName: {
      type: 'string',
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: 'string',
      maxLength: 50,
      trim: true,
    },
    preferences: {
      type: 'object',
      properties: {
        frequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          default: 'weekly',
        },
        categories: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['news', 'updates', 'promotions', 'events', 'tutorials'],
          },
          unique: true,
        },
        format: {
          type: 'string',
          enum: ['html', 'text'],
          default: 'html',
        },
      },
      additionalProperties: false,
    },
    source: {
      type: 'string',
      enum: ['website', 'social_media', 'referral', 'event', 'api'],
      default: 'website',
    },
    doubleOptIn: {
      type: 'boolean',
      default: true,
    },
    confirmed: {
      type: 'boolean',
      default: false,
    },
    confirmationToken: {
      type: 'string',
      minLength: 32,
      maxLength: 128,
    },
    tags: commonSchemas.tags,
    customFields: {
      type: 'object',
      additionalProperties: {
        type: ['string', 'number', 'boolean'],
      },
      maxProperties: 20,
    },
  },
  additionalProperties: false,
});

export const settingsSchema = createSchema({
  type: 'object',
  properties: {
    general: {
      type: 'object',
      properties: {
        siteName: { type: 'string', minLength: 1, maxLength: 100 },
        siteDescription: { type: 'string', maxLength: 500 },
        siteUrl: commonSchemas.url,
        adminEmail: commonSchemas.email,
        timezone: { type: 'string', default: 'UTC' },
        language: {
          type: 'string',
          pattern: /^[a-z]{2}(-[A-Z]{2})?$/,
          default: 'en',
        },
        dateFormat: {
          type: 'string',
          enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
          default: 'YYYY-MM-DD',
        },
        timeFormat: { type: 'string', enum: ['12', '24'], default: '24' },
        currency: { type: 'string', pattern: /^[A-Z]{3}$/, default: 'USD' },
      },
      additionalProperties: false,
    },
    email: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
        },
        fromName: { type: 'string', maxLength: 100 },
        fromEmail: commonSchemas.email,
        replyTo: commonSchemas.email,
        smtp: {
          type: 'object',
          properties: {
            host: { type: 'string', maxLength: 255 },
            port: { type: 'number', integer: true, min: 1, max: 65535 },
            secure: { type: 'boolean', default: false },
            username: { type: 'string', maxLength: 255 },
            password: { type: 'string', maxLength: 255 },
          },
          additionalProperties: false,
        },
        apiKey: { type: 'string', maxLength: 255 },
        templates: {
          type: 'object',
          properties: {
            welcome: { type: 'string', maxLength: 100 },
            passwordReset: { type: 'string', maxLength: 100 },
            orderConfirmation: { type: 'string', maxLength: 100 },
            newsletter: { type: 'string', maxLength: 100 },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    payment: {
      type: 'object',
      properties: {
        providers: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['stripe', 'paypal', 'square', 'razorpay'],
          },
          unique: true,
        },
        defaultProvider: {
          type: 'string',
          enum: ['stripe', 'paypal', 'square', 'razorpay'],
        },
        currency: { type: 'string', pattern: /^[A-Z]{3}$/, default: 'USD' },
        taxRate: { type: 'number', min: 0, max: 100, precision: 2, default: 0 },
        stripe: {
          type: 'object',
          properties: {
            publishableKey: { type: 'string', maxLength: 255 },
            secretKey: { type: 'string', maxLength: 255 },
            webhookSecret: { type: 'string', maxLength: 255 },
          },
          additionalProperties: false,
        },
        paypal: {
          type: 'object',
          properties: {
            clientId: { type: 'string', maxLength: 255 },
            clientSecret: { type: 'string', maxLength: 255 },
            sandbox: { type: 'boolean', default: false },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    security: {
      type: 'object',
      properties: {
        passwordPolicy: {
          type: 'object',
          properties: {
            minLength: {
              type: 'number',
              integer: true,
              min: 6,
              max: 128,
              default: 8,
            },
            requireUppercase: { type: 'boolean', default: true },
            requireLowercase: { type: 'boolean', default: true },
            requireNumbers: { type: 'boolean', default: true },
            requireSymbols: { type: 'boolean', default: true },
            maxAge: {
              type: 'number',
              integer: true,
              min: 30,
              max: 365,
              default: 90,
            }, // days
          },
          additionalProperties: false,
        },
        sessionTimeout: {
          type: 'number',
          integer: true,
          min: 300,
          max: 86400,
          default: 3600,
        }, // seconds
        maxLoginAttempts: {
          type: 'number',
          integer: true,
          min: 3,
          max: 10,
          default: 5,
        },
        lockoutDuration: {
          type: 'number',
          integer: true,
          min: 300,
          max: 3600,
          default: 900,
        }, // seconds
        twoFactorAuth: { type: 'boolean', default: false },
        ipWhitelist: {
          type: 'array',
          items: commonSchemas.ipAddress,
          maxItems: 100,
        },
        allowedOrigins: {
          type: 'array',
          items: commonSchemas.url,
          maxItems: 50,
        },
      },
      additionalProperties: false,
    },
    notifications: {
      type: 'object',
      properties: {
        email: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            newUser: { type: 'boolean', default: true },
            newOrder: { type: 'boolean', default: true },
            lowStock: { type: 'boolean', default: true },
            systemErrors: { type: 'boolean', default: true },
          },
          additionalProperties: false,
        },
        slack: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: false },
            webhookUrl: commonSchemas.url,
            channel: { type: 'string', pattern: /^#[a-z0-9_-]+$/ },
            events: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 20,
            },
          },
          additionalProperties: false,
        },
        push: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: false },
            serviceWorkerPath: { type: 'string', maxLength: 255 },
            vapidPublicKey: { type: 'string', maxLength: 255 },
            vapidPrivateKey: { type: 'string', maxLength: 255 },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    analytics: {
      type: 'object',
      properties: {
        googleAnalytics: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: false },
            trackingId: {
              type: 'string',
              pattern: /^UA-\d+-\d+$|^G-[A-Z0-9]+$/,
            },
            anonymizeIp: { type: 'boolean', default: true },
          },
          additionalProperties: false,
        },
        facebookPixel: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: false },
            pixelId: { type: 'string', pattern: /^\d+$/ },
          },
          additionalProperties: false,
        },
        customEvents: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'trigger'],
            properties: {
              name: { type: 'string', minLength: 1, maxLength: 100 },
              trigger: {
                type: 'string',
                enum: ['page_view', 'click', 'form_submit', 'purchase'],
              },
              selector: { type: 'string', maxLength: 255 },
              parameters: {
                type: 'object',
                additionalProperties: { type: 'string' },
                maxProperties: 20,
              },
            },
            additionalProperties: false,
          },
          maxItems: 50,
        },
      },
      additionalProperties: false,
    },
    integrations: {
      type: 'object',
      properties: {
        crm: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['salesforce', 'hubspot', 'pipedrive'],
            },
            apiKey: { type: 'string', maxLength: 255 },
            apiUrl: commonSchemas.url,
            syncEnabled: { type: 'boolean', default: false },
            syncInterval: {
              type: 'number',
              integer: true,
              min: 300,
              max: 86400,
              default: 3600,
            },
          },
          additionalProperties: false,
        },
        marketing: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['mailchimp', 'constantcontact', 'sendinblue'],
            },
            apiKey: { type: 'string', maxLength: 255 },
            listId: { type: 'string', maxLength: 100 },
            autoSync: { type: 'boolean', default: false },
          },
          additionalProperties: false,
        },
        storage: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['local', 's3', 'gcs', 'azure'] },
            bucket: { type: 'string', maxLength: 100 },
            region: { type: 'string', maxLength: 50 },
            accessKey: { type: 'string', maxLength: 255 },
            secretKey: { type: 'string', maxLength: 255 },
            cdnUrl: commonSchemas.url,
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    maintenance: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: false },
        message: { type: 'string', maxLength: 500 },
        allowedIps: {
          type: 'array',
          items: commonSchemas.ipAddress,
          maxItems: 50,
        },
        scheduledStart: commonSchemas.dateTime,
        scheduledEnd: commonSchemas.dateTime,
        showCountdown: { type: 'boolean', default: false },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
});

/**
 * Validation schema for database migrations
 */
export const migrationSchema = createSchema({
  type: 'object',
  required: ['version', 'name', 'up', 'down'],
  properties: {
    version: {
      type: 'string',
      pattern: /^\d{14}$/, // Timestamp format YYYYMMDDHHMMSS
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: /^[a-z0-9_]+$/,
    },
    description: {
      type: 'string',
      maxLength: 1000,
    },
    up: {
      type: 'string',
      minLength: 1,
    },
    down: {
      type: 'string',
      minLength: 1,
    },
    dependencies: {
      type: 'array',
      items: {
        type: 'string',
        pattern: /^\d{14}$/,
      },
      maxItems: 50,
    },
  },
  additionalProperties: false,
});

/**
 * Validation schema for API responses
 */
export const apiResponseSchema = createSchema({
  type: 'object',
  required: ['success'],
  properties: {
    success: {
      type: 'boolean',
    },
    data: {
      type: ['object', 'array', 'string', 'number', 'boolean', 'null'],
    },
    message: {
      type: 'string',
      maxLength: 1000,
    },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    meta: {
      type: 'object',
      properties: {
        page: { type: 'number', integer: true, min: 1 },
        limit: { type: 'number', integer: true, min: 1 },
        total: { type: 'number', integer: true, min: 0 },
        totalPages: { type: 'number', integer: true, min: 0 },
        hasNext: { type: 'boolean' },
        hasPrev: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    timestamp: commonSchemas.timestamp,
    requestId: commonSchemas.uuid,
  },
  additionalProperties: false,
});

/**
 * Performance monitoring schema
 */
export const performanceMetricSchema = createSchema({
  type: 'object',
  required: ['name', 'value', 'timestamp'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/,
    },
    value: {
      type: 'number',
      finite: true,
    },
    unit: {
      type: 'string',
      enum: ['ms', 's', 'bytes', 'kb', 'mb', 'gb', 'count', 'percent'],
      default: 'count',
    },
    timestamp: commonSchemas.timestamp,
    tags: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        maxLength: 100,
      },
      maxProperties: 20,
    },
    metadata: {
      type: 'object',
      additionalProperties: {
        type: ['string', 'number', 'boolean'],
      },
      maxProperties: 10,
    },
  },
  additionalProperties: false,
});

/**
 * Export all schemas for easy access
 */
export const allSchemas = {
  // Common schemas
  ...commonSchemas,

  // Application schemas
  userRegistrationSchema,
  userLoginSchema,
  userProfileSchema,
  passwordResetSchema,
  changePasswordSchema,
  productSchema,
  orderSchema,
  invoiceSchema,
  commentSchema,
  reviewSchema,
  apiKeySchema,
  webhookSchema,
  subscriptionSchema,
  supportTicketSchema,
  blogPostSchema,
  eventSchema,
  newsletterSubscriptionSchema,
  settingsSchema,
  migrationSchema,
  apiResponseSchema,
  performanceMetricSchema,
};

/**
 * Get schema by name
 * @param {string} name - Schema name
 * @returns {Object|null} Schema or null if not found
 */
export function getSchema(name) {
  return allSchemas[name] || null;
}

/**
 * List all available schema names
 * @returns {Array<string>} Array of schema names
 */
export function getSchemaNames() {
  return Object.keys(allSchemas);
}

/**
 * Check if schema exists
 * @param {string} name - Schema name
 * @returns {boolean} True if schema exists
 */
export function hasSchema(name) {
  return name in allSchemas;
}

/**
 * Create a validation schema for a specific model
 * @param {string} modelName - Model name
 * @param {Object} fields - Field definitions
 * @param {Object} [options] - Additional options
 * @returns {Object} Model schema
 */
export function createModelSchema(modelName, fields, options = {}) {
  const {
    timestamps = true,
    softDelete = false,
    additionalProperties = false,
  } = options;

  const schema = {
    type: 'object',
    properties: { ...fields },
    additionalProperties,
  };

  // Add timestamp fields
  if (timestamps) {
    schema.properties.createdAt = commonSchemas.dateTime;
    schema.properties.updatedAt = commonSchemas.dateTime;
  }

  // Add soft delete field
  if (softDelete) {
    schema.properties.deletedAt = {
      ...commonSchemas.dateTime,
      required: false,
    };
  }

  // Add model-specific metadata
  schema.properties.id = commonSchemas.id;

  return schema;
}

/**
 * Create CRUD operation schemas for a model
 * @param {Object} baseSchema - Base model schema
 * @param {Object} [options] - Options for different operations
 * @returns {Object} CRUD schemas
 */
export function createCrudSchemas(baseSchema, options = {}) {
  const {
    createFields = [],
    updateFields = [],
    readOnlyFields = ['id', 'createdAt', 'updatedAt'],
  } = options;

  // Create schema - exclude read-only fields, include only specified create fields
  const createSchema = { ...baseSchema };
  createSchema.properties = { ...baseSchema.properties };

  for (const field of readOnlyFields) {
    delete createSchema.properties[field];
  }

  if (createFields.length > 0) {
    const filteredProps = {};
    for (const field of createFields) {
      if (createSchema.properties[field]) {
        filteredProps[field] = createSchema.properties[field];
      }
    }
    createSchema.properties = filteredProps;
  }

  // Update schema - similar to create but may have different required fields
  const updateSchema = { ...createSchema };
  updateSchema.required = updateFields.length > 0 ? updateFields : [];

  // List/query schema
  const querySchema = createSchema({
    type: 'object',
    properties: {
      ...commonSchemas.pagination.properties,
      filters: {
        type: 'object',
        additionalProperties: true,
      },
      search: commonSchemas.searchQuery.properties.q,
    },
    additionalProperties: false,
  });

  return {
    create: createSchema,
    update: updateSchema,
    query: querySchema,
    read: baseSchema,
  };
}
