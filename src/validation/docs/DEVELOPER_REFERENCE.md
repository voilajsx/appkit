# @voilajsx/appkit - Validation Module Developer Reference 🛠️

The validation module provides comprehensive data validation and sanitization
utilities for Node.js applications. Whether you need simple input cleaning,
complex schema validation, or secure HTML sanitization, this module has you
covered with intuitive APIs and sensible defaults.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🔍 [Data Validation](#data-validation)
  - [Basic Validation](#basic-validation)
  - [Schema Validation](#schema-validation)
  - [Async Validation](#async-validation)
  - [Custom Validators](#custom-validators)
- 🧹 [Data Sanitization](#data-sanitization)
  - [String Sanitization](#string-sanitization)
  - [HTML Sanitization](#html-sanitization)
  - [Object Sanitization](#object-sanitization)
  - [Array Sanitization](#array-sanitization)
- 📋 [Schema Management](#schema-management)
  - [Common Schemas](#common-schemas)
  - [Creating Schemas](#creating-schemas)
  - [Merging & Extending](#merging--extending)
- ⚡ [Performance & Reusability](#performance--reusability)
  - [Reusable Validators](#reusable-validators)
  - [Reusable Sanitizers](#reusable-sanitizers)
- ❌ [Error Handling](#error-handling)
- 🏆 [Best Practices](#best-practices)
- 📚 [Complete Examples](#complete-examples)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit
```

### Basic Import

```javascript
import {
  validate,
  validateAsync,
  sanitize,
  sanitizeHtml,
  createValidator,
  createSanitizer,
  commonSchemas,
} from '@voilajsx/appkit/validation';
```

### Quick Example

```javascript
// Sanitize user input
const cleanData = sanitize(
  { email: '  USER@EXAMPLE.COM  ', name: '<script>John</script>' },
  {
    email: { trim: true, lowercase: true },
    name: { stripTags: true, capitalize: true },
  }
);

// Validate the clean data
const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', email: true },
    name: { type: 'string', minLength: 2 },
  },
  required: ['email', 'name'],
};

const result = validate(cleanData, schema);
if (result.valid) {
  console.log('✅ Data is valid!', result.value);
} else {
  console.log('❌ Validation errors:', result.errors);
}
```

## Data Validation

### Basic Validation

Simple validation for common use cases with clear, descriptive schemas.

```javascript
// User registration validation
const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: 'string',
      email: true,
      maxLength: 255,
    },
    age: {
      type: 'number',
      minimum: 13,
      maximum: 120,
    },
  },
  required: ['username', 'email'],
};

const userData = {
  username: 'john_doe',
  email: 'john@example.com',
  age: 25,
};

const result = validate(userData, userSchema);

if (result.valid) {
  // Process valid user data
  await createUser(result.value);
} else {
  // Handle validation errors
  result.errors.forEach((error) => {
    console.log(`❌ ${error.path}: ${error.message}`);
  });
}
```

**When to use:** For immediate validation of API inputs, form data, or any data
that doesn't require database checks.

### Schema Validation

Complex nested object validation with relationships and dependencies.

```javascript
// E-commerce order validation
const orderSchema = {
  type: 'object',
  properties: {
    customer: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', email: true },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', minLength: 5 },
            city: { type: 'string', minLength: 2 },
            zipCode: { type: 'string', pattern: /^\d{5}(-\d{4})?$/ },
          },
          required: ['street', 'city', 'zipCode'],
        },
      },
      required: ['name', 'email', 'address'],
    },
    items: {
      type: 'array',
      minItems: 1,
      maxItems: 50,
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string', minLength: 1 },
          quantity: { type: 'number', minimum: 1, integer: true },
          price: { type: 'number', minimum: 0 },
        },
        required: ['productId', 'quantity', 'price'],
      },
    },
    total: { type: 'number', minimum: 0 },
  },
  required: ['customer', 'items', 'total'],
};

const order = {
  customer: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    address: {
      street: '123 Main Street',
      city: 'New York',
      zipCode: '10001',
    },
  },
  items: [
    { productId: 'prod-123', quantity: 2, price: 29.99 },
    { productId: 'prod-456', quantity: 1, price: 15.5 },
  ],
  total: 75.48,
};

const validation = validate(order, orderSchema);
```

**When to use:** For complex data structures like API payloads, configuration
objects, or multi-step form data.

### Async Validation

Validation that requires database lookups or external API calls.

```javascript
// User registration with uniqueness checks
const registrationSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      asyncValidator: async (username) => {
        const exists = await db.users.findOne({ username });
        return exists ? 'Username is already taken' : true;
      },
    },
    email: {
      type: 'string',
      email: true,
      asyncValidator: async (email) => {
        // Check if email exists
        const user = await db.users.findOne({ email });
        if (user) return 'Email is already registered';

        // Validate domain exists (optional)
        const domain = email.split('@')[1];
        const domainValid = await checkDomainExists(domain);
        return domainValid || 'Email domain does not exist';
      },
    },
    inviteCode: {
      type: 'string',
      asyncValidator: async (code, context) => {
        if (!code && context.requireInvite) {
          return 'Invite code is required';
        }

        if (code) {
          const invite = await db.invites.findOne({
            code,
            used: false,
            expiresAt: { $gt: new Date() },
          });
          return invite ? true : 'Invalid or expired invite code';
        }

        return true;
      },
    },
  },
  required: ['username', 'email'],
};

// Usage with context
const registrationData = {
  username: 'newuser',
  email: 'newuser@example.com',
  inviteCode: 'ABC123',
};

try {
  const result = await validateAsync(registrationData, registrationSchema, {
    context: { requireInvite: true },
    timeout: 10000, // 10 second timeout
  });

  if (result.valid) {
    await registerUser(result.value);
  } else {
    // Handle async validation errors
    result.errors.forEach((error) => {
      console.log(`Async validation failed: ${error.message}`);
    });
  }
} catch (error) {
  console.log('Validation timeout or error:', error.message);
}
```

**When to use:** For registration forms, data imports, or any validation
requiring external checks.

### Custom Validators

Built-in validators for common data types with customizable options.

```javascript
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validateCreditCard,
  validatePassword,
} from '@voilajsx/appkit/validation';

// Email validation with options
const isValidEmail = validateEmail('user@company.com', {
  maxLength: 100,
  whitelistDomains: ['company.com', 'company.org'],
  requireTld: true,
});

// Phone validation
const isValidPhone = validatePhone('+1-555-123-4567', {
  country: 'US',
  format: 'international',
});

// URL validation
const isValidUrl = validateUrl('https://api.example.com/v1/users', {
  protocols: ['https'],
  requireTld: true,
  allowQuery: true,
});

// Password strength validation
const isValidPassword = validatePassword('MySecure123!', {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  blacklist: ['password', '123456', 'qwerty'],
});

// Credit card validation
const isValidCard = validateCreditCard('4111-1111-1111-1111', {
  types: ['visa', 'mastercard'],
  checkLuhn: true,
});

// Custom business logic validation
function validateBusinessHours(timeString) {
  const time = new Date(`2023-01-01 ${timeString}`);
  const hours = time.getHours();
  return (
    (hours >= 9 && hours <= 17) || 'Must be during business hours (9 AM - 5 PM)'
  );
}

// Use in schema
const appointmentSchema = {
  type: 'object',
  properties: {
    time: {
      type: 'string',
      pattern: /^\d{2}:\d{2}$/,
      custom: validateBusinessHours,
    },
  },
};
```

**When to use:** For specific data types like emails, phones, URLs, or custom
business logic validation.

## Data Sanitization

### String Sanitization

Clean and normalize text input with comprehensive options.

```javascript
import { sanitizeString } from '@voilajsx/appkit/validation';

// Basic text cleaning
const userInput = '  <script>alert("xss")</script>Hello World!  ';
const clean = sanitizeString(userInput, {
  trim: true, // Remove whitespace
  stripTags: true, // Remove HTML tags
  escape: true, // Escape remaining HTML entities
  capitalize: true, // Capitalize first letter
});
// Result: 'Alert("xss")hello world!'

// Blog post title sanitization
const blogTitle = 'My Awesome Blog Post About "JavaScript & Node.js"!!!';
const cleanTitle = sanitizeString(blogTitle, {
  trim: true,
  titleCase: true, // Title Case Each Word
  replace: {
    '"': '"', // Smart quotes
    '"': '"',
    '!!!+': '!', // Multiple exclamations to single
  },
  truncate: 60, // SEO-friendly length
  slug: false, // Keep readable format
});
// Result: 'My Awesome Blog Post About "Javascript & Node.js"!'

// URL slug creation
const slugTitle = sanitizeString(blogTitle, {
  slug: true, // Create URL-friendly slug
  truncate: 50,
});
// Result: 'my-awesome-blog-post-about-javascript-nodejs'

// Username sanitization
const rawUsername = '  John_Doe123@#$  ';
const username = sanitizeString(rawUsername, {
  trim: true,
  lowercase: true,
  alphanumeric: true, // Keep only letters and numbers
  truncate: 20,
});
// Result: 'johndoe123'

// Search query sanitization
const searchQuery = '  <script>hack</script> "search terms" & more  ';
const cleanSearch = sanitizeString(searchQuery, {
  stripTags: true,
  escape: true,
  remove: ['[<>"\'/\\]'], // Remove dangerous characters
  whitespace: 'single', // Normalize whitespace
  truncate: 100,
});
// Result: 'hack search terms &amp; more'
```

**When to use:** For any user text input - form fields, search queries,
usernames, content titles, etc.

### HTML Sanitization

Secure HTML content while preserving formatting.

```javascript
import { sanitizeHtml } from '@voilajsx/appkit/validation';

// Blog comment sanitization
const userComment = `
  <p>Great article! Check out <a href="javascript:alert('xss')">this link</a></p>
  <script>steal_cookies()</script>
  <img src="x" onerror="alert('xss')" />
  <b>Thanks for sharing</b>
`;

const safeComment = sanitizeHtml(userComment, {
  allowedTags: ['p', 'b', 'i', 'strong', 'em', 'a'],
  allowedAttributes: {
    a: ['href', 'title'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  stripEmpty: true,
});
// Result: '<p>Great article! Check out <a>this link</a></p><b>Thanks for sharing</b>'

// Rich text editor content
const richContent = `
  <h2>My Article</h2>
  <p class="intro">Introduction paragraph with <strong>bold text</strong></p>
  <ul>
    <li>First point</li>
    <li>Second point with <em>emphasis</em></li>
  </ul>
  <blockquote cite="https://example.com">
    "This is a quote from somewhere"
  </blockquote>
`;

const safeRichContent = sanitizeHtml(richContent, {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
    blockquote: ['cite'],
    p: ['class'],
    h1: ['id'],
    h2: ['id'],
    h3: ['id'],
  },
  allowClassNames: true,
  allowedSchemes: ['http', 'https'],
});

// Email HTML sanitization (more restrictive)
const emailHtml = `
  <div style="color: red;">
    <p>Hello <b>John</b>!</p>
    <p>Click <a href="https://example.com/unsubscribe">here</a> to unsubscribe</p>
  </div>
`;

const safeEmailHtml = sanitizeHtml(emailHtml, {
  allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'a'],
  allowedAttributes: {
    a: ['href'],
  },
  allowedSchemes: ['https'], // Only HTTPS links
  stripEmpty: true,
});
// Result: '<p>Hello <b>John</b>!</p><p>Click <a href="https://example.com/unsubscribe">here</a> to unsubscribe</p>'
```

**When to use:** For any user-generated HTML content - blog posts, comments,
email templates, rich text editor output.

### Object Sanitization

Clean and transform object structures.

```javascript
import { sanitizeObject } from '@voilajsx/appkit/validation';

// API request sanitization
const rawApiData = {
  firstName: '  John  ',
  lastName: '  Doe  ',
  email_address: '  USER@EXAMPLE.COM  ',
  phone_number: '(555) 123-4567',
  extra_field: 'should be removed',
  password: 'secret123',
  '': 'empty key',
  null_field: null,
  undefined_field: undefined,
};

const cleanApiData = sanitizeObject(rawApiData, {
  pick: ['firstName', 'lastName', 'email_address', 'phone_number'], // Only keep these
  rename: {
    email_address: 'email',
    phone_number: 'phone',
  },
  properties: {
    firstName: { trim: true, capitalize: true },
    lastName: { trim: true, capitalize: true },
    email: { trim: true, lowercase: true },
    phone: { numeric: true },
  },
  removeEmpty: true,
});
// Result: { firstName: 'John', lastName: 'Doe', email: 'user@example.com', phone: '5551234567' }

// Form data sanitization with defaults
const formData = {
  username: 'john_doe',
  preferences: {},
  settings: null,
};

const sanitizedForm = sanitizeObject(formData, {
  defaults: {
    preferences: { theme: 'light', notifications: true },
    settings: { privacy: 'public' },
    role: 'user',
  },
  properties: {
    username: { trim: true, lowercase: true },
  },
});
// Result: {
//   username: 'john_doe',
//   preferences: { theme: 'light', notifications: true },
//   settings: { privacy: 'public' },
//   role: 'user'
// }

// Database record sanitization
const userRecord = {
  id: 123,
  name: '<script>John</script>',
  email: '  USER@EXAMPLE.COM  ',
  profile: {
    bio: 'Hello world!   Multiple   spaces here.',
    website: 'example.com',
    social: {
      twitter: '@johndoe',
      linkedin: null,
    },
  },
  tags: ['JavaScript', 'Node.js', '', 'Web Dev', 'JavaScript'], // duplicates
  metadata: {
    created_at: '2023-01-01',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
  },
};

const cleanRecord = sanitizeObject(userRecord, {
  properties: {
    name: { stripTags: true, capitalize: true },
    email: { trim: true, lowercase: true },
    profile: {
      properties: {
        bio: { whitespace: 'single', truncate: 500 },
        website: { url: true }, // Add https:// if missing
        social: {
          removeEmpty: true,
          properties: {
            twitter: { trim: true },
          },
        },
      },
    },
    tags: {
      compact: true, // Remove empty strings
      unique: true, // Remove duplicates
      items: { slug: true }, // Convert to slugs
      limit: 5,
    },
  },
  omit: ['metadata'], // Remove sensitive data
});
```

**When to use:** For API request/response data, form submissions, database
records, or configuration objects.

### Array Sanitization

Process and clean arrays of data.

```javascript
import { sanitizeArray } from '@voilajsx/appkit/validation';

// Tag processing
const rawTags = [
  '  JavaScript  ',
  'Node.js',
  '',
  'WEB DEV',
  'javascript',
  null,
  'React',
];
const cleanTags = sanitizeArray(rawTags, {
  compact: true, // Remove empty/null values
  unique: true, // Remove duplicates (case-insensitive due to slug)
  items: {
    trim: true,
    slug: true, // Convert to URL-friendly slugs
  },
  sort: true, // Sort alphabetically
  limit: 5, // Maximum 5 tags
});
// Result: ['javascript', 'nodejs', 'react', 'web-dev']

// User list processing
const userEmails = [
  '  user1@example.com  ',
  'USER2@EXAMPLE.COM',
  'invalid-email',
  'user3@example.com',
  '  user1@example.com  ', // duplicate
  '',
];

const cleanEmails = sanitizeArray(userEmails, {
  compact: true,
  items: {
    trim: true,
    lowercase: true,
    // Only keep valid emails
    filter: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  },
  unique: true,
  sort: true,
});
// Result: ['user1@example.com', 'user2@example.com', 'user3@example.com']

// CSV data processing
const csvData = [
  ['Name', 'Email', 'Age'],
  ['  John Doe  ', '  john@example.com  ', '25'],
  ['', 'jane@example.com', 'thirty'], // invalid age
  ['Bob Smith', 'bob@example.com', '35'],
  ['', '', ''], // empty row
];

const processedCsv = sanitizeArray(csvData, {
  offset: 1, // Skip header row
  compact: true, // Remove empty rows
  items: {
    // Process each row
    compact: true, // Remove empty cells
    items: { trim: true }, // Trim each cell
  },
  filter: (row) => row.length === 3 && row[0] && row[1] && !isNaN(row[2]),
});
// Result: [['John Doe', 'john@example.com', '25'], ['Bob Smith', 'bob@example.com', '35']]

// Product inventory processing
const inventory = [
  { id: 1, name: '  Laptop  ', price: '999.99', category: 'electronics' },
  { id: 2, name: 'Phone', price: 'invalid', category: 'electronics' },
  { id: 3, name: 'Book', price: '29.99', category: 'books' },
  null,
  { id: 4, name: 'Tablet', price: '399.99', category: 'electronics' },
];

const cleanInventory = sanitizeArray(inventory, {
  compact: true,
  items: {
    properties: {
      name: { trim: true, capitalize: true },
      price: { parseFloat: true, precision: 2 },
      category: { lowercase: true },
    },
    filter: (item) => item.id && item.name && !isNaN(parseFloat(item.price)),
  },
  sort: (a, b) => a.price - b.price, // Sort by price
});
```

**When to use:** For processing lists of tags, user data, CSV imports, or any
array that needs cleaning and normalization.

## Schema Management

### Common Schemas

Pre-built schemas for standard data types.

```javascript
import { commonSchemas } from '@voilajsx/appkit/validation';

// Available common schemas
const userSchema = {
  type: 'object',
  properties: {
    email: commonSchemas.email, // RFC 5322 compliant
    password: commonSchemas.password, // Strong password rules
    username: commonSchemas.username, // Alphanumeric + underscore
    phone: commonSchemas.phone, // E.164 international format
    url: commonSchemas.url, // HTTP/HTTPS URLs
    uuid: commonSchemas.uuid, // UUID v4 format
    slug: commonSchemas.slug, // URL-friendly slugs
    tags: commonSchemas.tags, // Array of string tags
    date: commonSchemas.date, // ISO 8601 dates
    positiveInteger: commonSchemas.positiveInteger,
    percentage: commonSchemas.percentage, // 0-100
    hexColor: commonSchemas.hexColor, // #RRGGBB format
    ipAddress: commonSchemas.ipAddress, // IPv4/IPv6
    creditCard: commonSchemas.creditCard, // Credit card validation
    postalCode: commonSchemas.postalCode, // US/International postal codes
  },
};

// Extend common schemas
const customEmailSchema = {
  ...commonSchemas.email,
  maxLength: 100,
  whitelistDomains: ['company.com', 'company.org'],
};

// Use in API validation
const apiSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        profile: {
          email: customEmailSchema,
          website: commonSchemas.url,
          location: commonSchemas.address,
        },
      },
    },
    pagination: commonSchemas.pagination, // { page, limit, offset }
    searchQuery: commonSchemas.searchQuery, // Safe search parameters
  },
};
```

**When to use:** As building blocks for larger schemas, ensuring consistent
validation across your application.

### Creating Schemas

Build reusable schema definitions programmatically.

```javascript
import { createSchema } from '@voilajsx/appkit/validation';

// E-commerce product schema
const productSchema = createSchema({
  type: 'object',
  required: ['name', 'price', 'category'],
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 100,
      sanitize: { trim: true, titleCase: true },
    },
    description: {
      type: 'string',
      maxLength: 1000,
      sanitize: {
        stripTags: true,
        whitespace: 'single',
        truncate: 1000,
      },
    },
    price: {
      type: 'number',
      minimum: 0,
      maximum: 999999,
      sanitize: { precision: 2 },
    },
    category: {
      type: 'string',
      enum: ['electronics', 'clothing', 'books', 'home', 'sports'],
    },
    tags: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'string',
        minLength: 2,
        maxLength: 30,
      },
      sanitize: {
        unique: true,
        items: { slug: true },
      },
    },
    images: {
      type: 'array',
      maxItems: 5,
      items: commonSchemas.url,
    },
    specifications: {
      type: 'object',
      maxProperties: 20,
      patternProperties: {
        '^[a-zA-Z][a-zA-Z0-9_]*$': {
          type: 'string',
          maxLength: 200,
        },
      },
    },
  },
  additionalProperties: false,
});

// Blog post schema with conditional validation
const blogPostSchema = createSchema({
  type: 'object',
  required: ['title', 'content', 'status'],
  properties: {
    title: {
      type: 'string',
      minLength: 10,
      maxLength: 100,
    },
    content: {
      type: 'string',
      minLength: 100,
    },
    excerpt: {
      type: 'string',
      maxLength: 300,
    },
    status: {
      type: 'string',
      enum: ['draft', 'published', 'archived'],
    },
    publishedAt: {
      type: 'string',
      format: 'date-time',
    },
    tags: commonSchemas.tags,
    author: commonSchemas.id,
  },
  // Conditional validation
  if: {
    properties: { status: { const: 'published' } },
  },
  then: {
    required: ['publishedAt', 'excerpt'],
  },
});

// API response schema
const apiResponseSchema = createSchema({
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean' },
    data: { type: 'object' },
    message: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
    meta: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        requestId: commonSchemas.uuid,
      },
    },
  },
});
```

**When to use:** For complex data structures that will be validated repeatedly,
or when building schema libraries for your application.

### Merging & Extending

Combine and extend schemas for flexible validation.

```javascript
import { mergeSchemas, extendSchema } from '@voilajsx/appkit/validation';

// Base schemas
const timestampSchema = {
  properties: {
    createdAt: commonSchemas.date,
    updatedAt: commonSchemas.date,
  },
};

const auditSchema = {
  properties: {
    createdBy: commonSchemas.id,
    updatedBy: commonSchemas.id,
    version: { type: 'number', minimum: 1 },
  },
};

const baseEntitySchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: commonSchemas.id,
  },
};

// Merge multiple schemas
const auditedEntitySchema = mergeSchemas(
  baseEntitySchema,
  timestampSchema,
  auditSchema
);

// Create user schema by extending base
const userSchema = extendSchema(auditedEntitySchema, {
  required: ['email', 'username'],
  properties: {
    username: commonSchemas.username,
    email: commonSchemas.email,
    profile: {
      type: 'object',
      properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        bio: { type: 'string', maxLength: 500 },
        avatar: commonSchemas.url,
      },
    },
    preferences: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['light', 'dark'] },
        notifications: { type: 'boolean' },
        language: { type: 'string', minLength: 2, maxLength: 5 },
      },
      default: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
    },
  },
});

// Admin user schema with additional permissions
const adminUserSchema = extendSchema(userSchema, {
  required: ['role', 'permissions'],
  properties: {
    role: {
      type: 'string',
      enum: ['admin', 'super_admin'],
    },
    permissions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'users.read',
          'users.write',
          'users.delete',
          'posts.read',
          'posts.write',
          'posts.delete',
          'settings.read',
          'settings.write',
        ],
      },
      minItems: 1,
    },
    lastLogin: commonSchemas.date,
    accessLevel: {
      type: 'number',
      minimum: 1,
      maximum: 10,
    },
  },
});

// Product variants using schema composition
const baseProductSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
  },
};

const physicalProductSchema = extendSchema(baseProductSchema, {
  properties: {
    weight: { type: 'number', minimum: 0 },
    dimensions: {
      type: 'object',
      properties: {
        length: { type: 'number', minimum: 0 },
        width: { type: 'number', minimum: 0 },
        height: { type: 'number', minimum: 0 },
      },
      required: ['length', 'width', 'height'],
    },
    shipping: {
      type: 'object',
      properties: {
        domestic: { type: 'number', minimum: 0 },
        international: { type: 'number', minimum: 0 },
      },
    },
  },
});

const digitalProductSchema = extendSchema(baseProductSchema, {
  properties: {
    downloadUrl: commonSchemas.url,
    fileSize: { type: 'number', minimum: 0 },
    format: {
      type: 'string',
      enum: ['pdf', 'epub', 'mp3', 'mp4', 'zip'],
    },
    license: {
      type: 'string',
      enum: ['single-use', 'multi-use', 'commercial'],
    },
  },
  required: ['downloadUrl', 'format'],
});
```

**When to use:** When building related schemas with shared properties, or
creating schema hierarchies for different user types or product categories.

## Performance & Reusability

### Reusable Validators

Create validator functions once and reuse them for better performance.

```javascript
import { createValidator } from '@voilajsx/appkit/validation';

// Create validators for common operations
const validators = {
  // User registration validator
  userRegistration: createValidator(
    {
      type: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          maxLength: 20,
          pattern: /^[a-zA-Z0-9_]+$/,
        },
        email: commonSchemas.email,
        password: commonSchemas.password,
        firstName: { type: 'string', minLength: 1, maxLength: 50 },
        lastName: { type: 'string', minLength: 1, maxLength: 50 },
      },
    },
    {
      abortEarly: false, // Collect all errors
      stripUnknown: true, // Remove extra fields
    }
  ),

  // Product creation validator
  productCreation: createValidator({
    type: 'object',
    required: ['name', 'price', 'category'],
    properties: {
      name: { type: 'string', minLength: 3, maxLength: 100 },
      description: { type: 'string', maxLength: 1000 },
      price: { type: 'number', minimum: 0 },
      category: {
        type: 'string',
        enum: ['electronics', 'clothing', 'books', 'home'],
      },
      tags: {
        type: 'array',
        maxItems: 10,
        items: { type: 'string', minLength: 2, maxLength: 30 },
      },
    },
  }),

  // API pagination validator
  pagination: createValidator({
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
      sort: { type: 'string', maxLength: 50 },
      order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
    },
  }),

  // Search query validator
  searchQuery: createValidator({
    type: 'object',
    properties: {
      q: { type: 'string', minLength: 1, maxLength: 100 },
      category: { type: 'string' },
      minPrice: { type: 'number', minimum: 0 },
      maxPrice: { type: 'number', minimum: 0 },
      tags: {
        type: 'array',
        items: { type: 'string' },
        maxItems: 5,
      },
    },
    required: ['q'],
  }),
};

// Usage in Express.js middleware
function validateMiddleware(validatorName) {
  return (req, res, next) => {
    const validator = validators[validatorName];
    if (!validator) {
      return res.status(500).json({ error: 'Invalid validator' });
    }

    const result = validator(req.body);
    if (result.valid) {
      req.validatedData = result.value;
      next();
    } else {
      res.status(400).json({
        error: 'Validation failed',
        details: result.errors,
      });
    }
  };
}

// Usage in routes
app.post(
  '/api/users',
  validateMiddleware('userRegistration'),
  async (req, res) => {
    try {
      const user = await createUser(req.validatedData);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.post(
  '/api/products',
  validateMiddleware('productCreation'),
  async (req, res) => {
    const product = await createProduct(req.validatedData);
    res.json({ success: true, product });
  }
);

app.get(
  '/api/products',
  validateMiddleware('searchQuery'),
  async (req, res) => {
    const products = await searchProducts(req.validatedData);
    res.json({ success: true, products });
  }
);

// Batch validation for data processing
async function processBatchData(items, validatorName) {
  const validator = validators[validatorName];
  const results = {
    valid: [],
    invalid: [],
  };

  for (const item of items) {
    const result = validator(item);
    if (result.valid) {
      results.valid.push(result.value);
    } else {
      results.invalid.push({
        item,
        errors: result.errors,
      });
    }
  }

  return results;
}

// CSV import validation
const csvData = [
  { name: 'Laptop', price: 999, category: 'electronics' },
  { name: 'Book', price: 'invalid', category: 'books' }, // Invalid price
  { name: 'Shirt', price: 29.99, category: 'clothing' },
];

const batchResults = await processBatchData(csvData, 'productCreation');
console.log(`Valid items: ${batchResults.valid.length}`);
console.log(`Invalid items: ${batchResults.invalid.length}`);
```

**When to use:** For repeated validation operations, API endpoints, batch
processing, or any scenario where performance matters.

### Reusable Sanitizers

Create sanitizer functions for consistent data cleaning.

```javascript
import { createSanitizer } from '@voilajsx/appkit/validation';

// Create sanitizers for different data types
const sanitizers = {
  // User input sanitizer
  userInput: createSanitizer({
    username: {
      trim: true,
      lowercase: true,
      alphanumeric: true,
      truncate: 20,
    },
    email: {
      trim: true,
      lowercase: true,
    },
    firstName: {
      trim: true,
      capitalize: true,
      stripTags: true,
    },
    lastName: {
      trim: true,
      capitalize: true,
      stripTags: true,
    },
    bio: {
      stripTags: true,
      whitespace: 'single',
      truncate: 500,
    },
  }),

  // Content sanitizer for blog posts
  blogContent: createSanitizer({
    title: {
      trim: true,
      titleCase: true,
      stripTags: true,
      truncate: 100,
    },
    content: {
      // Keep basic HTML formatting
      allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3'],
      whitespace: 'single',
    },
    excerpt: {
      stripTags: true,
      truncate: 300,
      whitespace: 'single',
    },
    tags: {
      compact: true,
      unique: true,
      items: { slug: true },
      limit: 10,
    },
  }),

  // API response sanitizer
  apiResponse: createSanitizer({
    message: {
      trim: true,
      escape: true,
    },
    data: {
      removeEmpty: true,
      maxProperties: 50,
    },
  }),

  // Search query sanitizer
  searchInput: createSanitizer({
    q: {
      trim: true,
      stripTags: true,
      remove: ['[<>"\'/\\\\]'],
      whitespace: 'single',
      truncate: 100,
    },
    category: {
      trim: true,
      lowercase: true,
      slug: true,
    },
    tags: {
      compact: true,
      items: { slug: true },
      limit: 5,
    },
  }),
};

// Middleware for automatic sanitization
function sanitizeMiddleware(sanitizerName) {
  return (req, res, next) => {
    const sanitizer = sanitizers[sanitizerName];
    if (sanitizer) {
      req.body = sanitizer(req.body);
      req.query = sanitizer(req.query);
    }
    next();
  };
}

// Pipeline sanitization
function createSanitizationPipeline(...sanitizerNames) {
  return (data) => {
    return sanitizerNames.reduce((result, name) => {
      const sanitizer = sanitizers[name];
      return sanitizer ? sanitizer(result) : result;
    }, data);
  };
}

// Usage examples
app.post(
  '/api/users',
  sanitizeMiddleware('userInput'),
  validateMiddleware('userRegistration'),
  async (req, res) => {
    // Data is now sanitized and validated
    const user = await createUser(req.validatedData);
    res.json({ success: true, user });
  }
);

// Multi-stage sanitization
const contentPipeline = createSanitizationPipeline('userInput', 'blogContent');
const cleanContent = contentPipeline(userSubmittedContent);

// Conditional sanitization
function smartSanitizer(data, type) {
  const sanitizerMap = {
    user: sanitizers.userInput,
    content: sanitizers.blogContent,
    search: sanitizers.searchInput,
  };

  const sanitizer = sanitizerMap[type];
  return sanitizer ? sanitizer(data) : data;
}

// Batch sanitization
async function sanitizeBatch(items, sanitizerName) {
  const sanitizer = sanitizers[sanitizerName];
  if (!sanitizer) return items;

  return items.map((item) => sanitizer(item));
}
```

**When to use:** For consistent data cleaning across your application,
preprocessing data before validation, or building data processing pipelines.

## Error Handling

Comprehensive error handling with detailed feedback and recovery options.

```javascript
import { ValidationError, validate } from '@voilajsx/appkit/validation';

// Basic error handling
function validateUserData(userData) {
  const result = validate(userData, userSchema);

  if (!result.valid) {
    const error = new ValidationError('User validation failed', result.errors);

    // Get all error messages
    console.log('All errors:', error.getMessages());

    // Get errors for specific fields
    const emailErrors = error.getFieldErrors('email');
    const passwordErrors = error.getFieldErrors('password');

    // Check if field has errors
    if (error.hasFieldErrors('username')) {
      console.log('Username has validation errors');
    }

    // Get errors by type
    const formatErrors = error.getErrorsByCode('INVALID_FORMAT');
    const requiredErrors = error.getErrorsByCode('REQUIRED');

    throw error;
  }

  return result.value;
}

// Express.js error handling middleware
function validationErrorHandler(error, req, res, next) {
  if (error instanceof ValidationError) {
    // Group errors by field for better UX
    const fieldErrors = {};
    error.errors.forEach((err) => {
      if (!fieldErrors[err.path]) {
        fieldErrors[err.path] = [];
      }
      fieldErrors[err.path].push({
        message: err.message,
        code: err.code,
        value: err.value,
      });
    });

    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input and try again',
      fieldErrors,
      errorCount: error.errors.length,
    });
  }

  next(error);
}

// Custom error formatting for APIs
function formatValidationErrors(errors) {
  return errors.reduce((formatted, error) => {
    const field = error.path;
    if (!formatted[field]) {
      formatted[field] = {
        value: error.value,
        errors: [],
      };
    }

    formatted[field].errors.push({
      code: error.code,
      message: error.message,
      constraint: error.constraint,
    });

    return formatted;
  }, {});
}

// Validation with recovery
async function validateWithRecovery(data, schema, options = {}) {
  try {
    const result = validate(data, schema);

    if (!result.valid) {
      // Try to auto-fix common issues
      const fixedData = autoFixData(data, result.errors);
      const retryResult = validate(fixedData, schema);

      if (retryResult.valid) {
        return {
          ...retryResult,
          wasFixed: true,
          originalErrors: result.errors,
        };
      }

      // If still invalid, throw with helpful suggestions
      const suggestions = generateFixSuggestions(result.errors);
      throw new ValidationError('Validation failed', result.errors, {
        suggestions,
      });
    }

    return result;
  } catch (error) {
    if (options.logErrors) {
      console.error('Validation failed:', {
        data: options.sanitizeLog ? sanitizeForLogging(data) : data,
        errors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    throw error;
  }
}

// Auto-fix common validation issues
function autoFixData(data, errors) {
  const fixed = { ...data };

  errors.forEach((error) => {
    const { path, code, value } = error;

    switch (code) {
      case 'INVALID_EMAIL':
        // Try to fix common email issues
        if (typeof value === 'string') {
          fixed[path] = value.trim().toLowerCase();
        }
        break;

      case 'INVALID_PHONE':
        // Remove common phone formatting
        if (typeof value === 'string') {
          fixed[path] = value.replace(/[^\d+]/g, '');
        }
        break;

      case 'TOO_LONG':
        // Truncate long strings
        if (typeof value === 'string' && error.constraint) {
          fixed[path] = value.substring(0, error.constraint);
        }
        break;

      case 'INVALID_TYPE':
        // Try type conversion
        if (error.expectedType === 'number' && typeof value === 'string') {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            fixed[path] = num;
          }
        }
        break;
    }
  });

  return fixed;
}

// Generate helpful suggestions for fixing errors
function generateFixSuggestions(errors) {
  return errors.map((error) => {
    const suggestions = {
      REQUIRED: `The field '${error.path}' is required. Please provide a value.`,
      INVALID_EMAIL: `Please enter a valid email address for '${error.path}'.`,
      TOO_SHORT: `The field '${error.path}' must be at least ${error.constraint} characters long.`,
      TOO_LONG: `The field '${error.path}' must be no more than ${error.constraint} characters long.`,
      INVALID_FORMAT: `The field '${error.path}' has an invalid format. Expected: ${error.expectedFormat}`,
      OUT_OF_RANGE: `The field '${error.path}' must be between ${error.min} and ${error.max}.`,
    };

    return {
      field: error.path,
      suggestion:
        suggestions[error.code] ||
        `Please check the value for '${error.path}'.`,
    };
  });
}

// Sanitize sensitive data for logging
function sanitizeForLogging(data) {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

// Usage in application
app.post('/api/register', async (req, res, next) => {
  try {
    // Sanitize input first
    const cleanData = sanitizers.userInput(req.body);

    // Validate with recovery
    const result = await validateWithRecovery(cleanData, userSchema, {
      logErrors: true,
      sanitizeLog: true,
    });

    if (result.wasFixed) {
      // Log that auto-fixes were applied
      console.log(
        'Auto-fixes applied:',
        result.originalErrors.length,
        'issues'
      );
    }

    const user = await createUser(result.value);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Use the error handler
app.use(validationErrorHandler);
```

**When to use:** For robust applications that need detailed error reporting,
automatic error recovery, or user-friendly error messages.

## Best Practices

### 1. Sanitize First, Validate Second

Always clean data before validating to prevent security issues and improve
validation accuracy.

```javascript
// ✅ Good: Sanitize then validate
const cleanData = sanitize(userInput, {
  email: { trim: true, lowercase: true },
  name: { stripTags: true, capitalize: true },
});
const result = validate(cleanData, schema);

// ❌ Bad: Validate dirty data
const result = validate(userInput, schema);
```

### 2. Use Specific Schemas

Create focused schemas for different contexts rather than one large schema.

```javascript
// ✅ Good: Specific schemas
const registrationSchema = createSchema({
  /* registration fields */
});
const profileUpdateSchema = createSchema({
  /* profile fields */
});
const passwordChangeSchema = createSchema({
  /* password fields */
});

// ❌ Bad: One giant schema for everything
const userSchema = createSchema({
  /* all possible user fields */
});
```

### 3. Leverage Common Schemas

Use pre-built schemas for standard data types to ensure consistency.

```javascript
// ✅ Good: Use common schemas
const userSchema = {
  properties: {
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    url: commonSchemas.url,
  },
};

// ❌ Bad: Reinvent validation rules
const userSchema = {
  properties: {
    email: { type: 'string', pattern: /.../ }, // Custom email regex
    phone: { type: 'string', pattern: /.../ }, // Custom phone regex
  },
};
```

### 4. Create Reusable Components

Build validators and sanitizers once, use them everywhere.

```javascript
// ✅ Good: Reusable components
const validators = {
  user: createValidator(userSchema),
  product: createValidator(productSchema),
};

const sanitizers = {
  userInput: createSanitizer(userRules),
  contentInput: createSanitizer(contentRules),
};

// ❌ Bad: Recreate every time
app.post('/api/users', (req, res) => {
  const result = validate(req.body, userSchema); // Created every request
});
```

### 5. Handle Errors Gracefully

Provide helpful error messages and recovery options.

```javascript
// ✅ Good: Detailed error handling
try {
  const result = validate(data, schema);
  if (!result.valid) {
    const error = new ValidationError('Validation failed', result.errors);
    const suggestions = generateFixSuggestions(result.errors);
    return res.status(400).json({
      error: 'Please fix the following issues:',
      fields: formatFieldErrors(result.errors),
      suggestions,
    });
  }
} catch (error) {
  // Handle validation errors specifically
}

// ❌ Bad: Generic error handling
const result = validate(data, schema);
if (!result.valid) {
  return res.status(400).json({ error: 'Invalid input' });
}
```

### 6. Validate at Boundaries

Apply validation at API endpoints, form submissions, and data entry points.

```javascript
// ✅ Good: Validate at boundaries
app.post(
  '/api/users',
  sanitizeMiddleware('userInput'),
  validateMiddleware('userRegistration'),
  async (req, res) => {
    // Data is guaranteed to be clean and valid
    const user = await createUser(req.validatedData);
    res.json({ success: true, user });
  }
);

// ❌ Bad: Validate deep in business logic
async function createUser(userData) {
  // Too late - data might be dirty/invalid
  const result = validate(userData, schema);
  if (!result.valid) throw new Error('Invalid user data');
  // ...
}
```

## Complete Examples

### Express.js API with Validation

```javascript
import express from 'express';
import {
  validate,
  sanitize,
  createValidator,
  createSanitizer,
  commonSchemas,
  ValidationError,
} from '@voilajsx/appkit/validation';

const app = express();
app.use(express.json());

// Create reusable validators and sanitizers
const validators = {
  userRegistration: createValidator(
    {
      type: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: commonSchemas.username,
        email: commonSchemas.email,
        password: commonSchemas.password,
        firstName: { type: 'string', minLength: 1, maxLength: 50 },
        lastName: { type: 'string', minLength: 1, maxLength: 50 },
      },
    },
    { stripUnknown: true }
  ),

  userLogin: createValidator({
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: commonSchemas.email,
      password: { type: 'string', minLength: 1 },
    },
  }),
};

const sanitizers = {
  userInput: createSanitizer({
    username: { trim: true, lowercase: true },
    email: { trim: true, lowercase: true },
    firstName: { trim: true, capitalize: true },
    lastName: { trim: true, capitalize: true },
  }),
};

// Middleware
function sanitizeInput(sanitizerName) {
  return (req, res, next) => {
    if (sanitizers[sanitizerName]) {
      req.body = sanitizers[sanitizerName](req.body);
    }
    next();
  };
}

function validateInput(validatorName) {
  return (req, res, next) => {
    const validator = validators[validatorName];
    if (!validator) {
      return res.status(500).json({ error: 'Invalid validator configuration' });
    }

    const result = validator(req.body);
    if (result.valid) {
      req.validatedData = result.value;
      next();
    } else {
      const fieldErrors = {};
      result.errors.forEach((error) => {
        if (!fieldErrors[error.path]) {
          fieldErrors[error.path] = [];
        }
        fieldErrors[error.path].push({
          message: error.message,
          code: error.code,
        });
      });

      res.status(400).json({
        error: 'Validation failed',
        fields: fieldErrors,
      });
    }
  };
}

// Routes
app.post(
  '/api/register',
  sanitizeInput('userInput'),
  validateInput('userRegistration'),
  async (req, res) => {
    try {
      // Data is clean and validated
      const user = await createUser(req.validatedData);
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      if (error.code === 'DUPLICATE_EMAIL') {
        res.status(409).json({ error: 'Email already registered' });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  }
);

app.post(
  '/api/login',
  sanitizeInput('userInput'),
  validateInput('userLogin'),
  async (req, res) => {
    try {
      const { email, password } = req.validatedData;
      const token = await authenticateUser(email, password);
      res.json({ success: true, token });
    } catch (error) {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Data Processing Pipeline

```javascript
import {
  sanitize,
  validate,
  createValidator,
  createSanitizer,
} from '@voilajsx/appkit/validation';

// CSV import processing
class DataProcessor {
  constructor() {
    this.productValidator = createValidator({
      type: 'object',
      required: ['name', 'price', 'category'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        price: { type: 'number', minimum: 0 },
        category: {
          type: 'string',
          enum: ['electronics', 'clothing', 'books'],
        },
        description: { type: 'string', maxLength: 1000 },
      },
    });

    this.productSanitizer = createSanitizer({
      name: { trim: true, titleCase: true },
      description: { trim: true, stripTags: true, truncate: 1000 },
      category: { trim: true, lowercase: true },
    });
  }

  async processCSV(csvData) {
    const results = {
      processed: 0,
      valid: [],
      invalid: [],
      errors: [],
    };

    for (const [index, row] of csvData.entries()) {
      try {
        // Skip header row
        if (index === 0) continue;

        // Convert CSV row to object
        const rawProduct = {
          name: row[0],
          price: parseFloat(row[1]),
          category: row[2],
          description: row[3],
        };

        // Sanitize first
        const cleanProduct = this.productSanitizer(rawProduct);

        // Then validate
        const validation = this.productValidator(cleanProduct);

        if (validation.valid) {
          results.valid.push({
            row: index + 1,
            data: validation.value,
          });
        } else {
          results.invalid.push({
            row: index + 1,
            data: rawProduct,
            errors: validation.errors,
          });
        }

        results.processed++;
      } catch (error) {
        results.errors.push({
          row: index + 1,
          error: error.message,
        });
      }
    }

    return results;
  }

  async batchInsert(validProducts) {
    const insertPromises = validProducts.map((item) =>
      this.insertProduct(item.data)
    );

    return await Promise.allSettled(insertPromises);
  }

  async insertProduct(productData) {
    // Database insertion logic
    return await db.products.insert(productData);
  }
}

// Usage
const processor = new DataProcessor();
const csvResults = await processor.processCSV(csvData);

console.log(`Processed: ${csvResults.processed} rows`);
console.log(`Valid: ${csvResults.valid.length} products`);
console.log(`Invalid: ${csvResults.invalid.length} products`);

if (csvResults.valid.length > 0) {
  const insertResults = await processor.batchInsert(csvResults.valid);
  console.log(
    `Inserted: ${insertResults.filter((r) => r.status === 'fulfilled').length} products`
  );
}
```

This developer reference provides practical, easy-to-follow examples that show
real-world usage patterns while maintaining the depth and comprehensiveness
needed for effective implementation.

**When to use this reference:** As your go-to guide for implementing validation
and sanitization in Node.js applications, from simple form validation to complex
data processing pipelines.
