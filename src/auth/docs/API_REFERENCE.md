# @voilajsx/appkit - Validation Module API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are provided
> for clarity.

This document provides a detailed API reference for the Validation module of
`@voilajsx/appkit`, which offers comprehensive data validation and sanitization
utilities for Node.js applications. All functions are designed to be
framework-agnostic and follow modern JavaScript practices (ESM, async/await,
etc.).

## Table of Contents

- [Installation](#installation)
- [Core Validation Functions](#core-validation-functions)
  - [validate](#validate)
  - [validateAsync](#validateasync)
  - [createValidator](#createvalidator)
- [Sanitization Functions](#sanitization-functions)
  - [sanitize](#sanitize)
  - [sanitizeString](#sanitizestring)
  - [sanitizeNumber](#sanitizenumber)
  - [sanitizeBoolean](#sanitizeboolean)
  - [sanitizeArray](#sanitizearray)
  - [sanitizeObject](#sanitizeobject)
  - [sanitizeHtml](#sanitizehtml)
  - [createSanitizer](#createsanitizer)
- [Built-in Validators](#built-in-validators)
  - [validateString](#validatestring)
  - [validateNumber](#validatenumber)
  - [validateBoolean](#validateboolean)
  - [validateArray](#validatearray)
  - [validateObject](#validateobject)
  - [validateDate](#validatedate)
  - [validateEmail](#validateemail)
  - [validateUrl](#validateurl)
  - [validatePhone](#validatephone)
  - [validateCreditCard](#validatecreditcard)
  - [validatePostalCode](#validatepostalcode)
  - [validatePassword](#validatepassword)
  - [validateUsername](#validateusername)
  - [validateSlug](#validateslug)
  - [validateHexColor](#validatehexcolor)
  - [validateUuid](#validateuuid)
  - [validateIpAddress](#validateipaddress)
  - [validateMacAddress](#validatemacaddress)
  - [validateDomain](#validatedomain)
  - [validateFilename](#validatefilename)
- [Common Sanitizers](#common-sanitizers)
  - [sanitizeEmail](#sanitizeemail)
  - [sanitizeUsername](#sanitizeusername-1)
  - [sanitizePassword](#sanitizepassword)
  - [sanitizePhone](#sanitizephone)
  - [sanitizeUrl](#sanitizeurl)
  - [sanitizeSlug](#sanitizeslug)
  - [sanitizeSearch](#sanitizesearch)
  - [sanitizeCreditCard](#sanitizecreditcard)
  - [sanitizePostalCode](#sanitizepostalcode)
  - [sanitizeTags](#sanitizetags)
  - [sanitizeHexColor](#sanitizehexcolor)
  - [sanitizeFilename](#sanitizefilename)
  - [sanitizeIpAddress](#sanitizeipaddress-1)
- [Schema Functions](#schema-functions)
  - [commonSchemas](#commonschemas)
  - [createSchema](#createschema)
  - [mergeSchemas](#mergeschemas)
  - [extendSchema](#extendschema)
- [Error Handling](#error-handling)
  - [ValidationError](#validationerror)
  - [isValid](#isvalid)
  - [getValidationErrors](#getvalidationerrors)
- [Validation Options](#validation-options)
- [Sanitization Rules](#sanitization-rules)
- [Schema Definitions](#schema-definitions)
- [Security Considerations](#security-considerations)
- [Performance Tips](#performance-tips)
- [TypeScript Support](#typescript-support)

## Installation

```bash
npm install @voilajsx/appkit
```

Import the validation module:

```javascript
import {
  validate,
  validateAsync,
  createValidator,
  sanitize,
  sanitizeString,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeArray,
  sanitizeObject,
  sanitizeHtml,
  createSanitizer,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateDate,
  validateEmail,
  validateUrl,
  validatePhone,
  validateCreditCard,
  validatePostalCode,
  validatePassword,
  validateUsername,
  validateSlug,
  validateHexColor,
  validateUuid,
  validateIpAddress,
  validateMacAddress,
  validateDomain,
  validateFilename,
  sanitizeEmail,
  sanitizeUsername,
  sanitizePassword,
  sanitizePhone,
  sanitizeUrl,
  sanitizeSlug,
  sanitizeSearch,
  sanitizeCreditCard,
  sanitizePostalCode,
  sanitizeTags,
  sanitizeHexColor,
  sanitizeFilename,
  sanitizeIpAddress,
  commonSchemas,
  createSchema,
  mergeSchemas,
  extendSchema,
  ValidationError,
  isValid,
  getValidationErrors,
} from '@voilajsx/appkit/validation';
```

## Core Validation Functions

### validate

Validates data against a schema synchronously.

```typescript
function validate<T = any>(
  data: T,
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    context?: object;
    strict?: boolean;
  }
): {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    code: string;
    value: any;
    [key: string]: any;
  }>;
  value: T;
};
```

**Parameters:**

| Name                   | Type      | Required | Default | Description                                             |
| ---------------------- | --------- | -------- | ------- | ------------------------------------------------------- |
| `data`                 | `*`       | Yes      | -       | The data to validate                                    |
| `schema`               | `Object`  | Yes      | -       | The validation schema definition                        |
| `options`              | `Object`  | No       | `{}`    | Validation options                                      |
| `options.abortEarly`   | `boolean` | No       | `true`  | Stop validation on the first error                      |
| `options.allowUnknown` | `boolean` | No       | `true`  | Allow properties not defined in the schema              |
| `options.stripUnknown` | `boolean` | No       | `false` | Remove properties not defined in the schema from output |
| `options.context`      | `Object`  | No       | `{}`    | Additional context for validation functions             |
| `options.strict`       | `boolean` | No       | `false` | Enable strict validation mode                           |

**Returns:**

- An object with:
  - `valid` (boolean): Whether the data is valid
  - `errors` (Array): List of validation errors (empty if valid)
  - `value` (any): The processed (potentially transformed) data

**Throws:**

- `Error` - If schema is invalid or malformed
- `TypeError` - If arguments have incorrect types
- `ValidationError` - If validation fails in strict mode

**Example:**

```javascript
const userSchema = {
  type: 'object',
  required: ['email', 'name'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 255,
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 120,
    },
    role: {
      type: 'string',
      enum: ['user', 'admin', 'moderator'],
    },
  },
};

const userData = {
  email: 'user@example.com',
  name: 'John Doe',
  age: 25,
  role: 'user',
};

const result = validate(userData, userSchema);

if (result.valid) {
  console.log('User data is valid:', result.value);
} else {
  console.error('Validation errors:', result.errors);
  // Errors array contains objects like:
  // { path: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT', value: 'invalid-email' }
}

// With options
const strictResult = validate(userData, userSchema, {
  abortEarly: false, // Collect all errors
  allowUnknown: false, // Reject unknown properties
  stripUnknown: true, // Remove unknown properties
  strict: true, // Throw on validation failure
});
```

---

### validateAsync

Validates data against a schema asynchronously, supporting async validators and
database checks.

```typescript
async function validateAsync<T = any>(
  data: T,
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    context?: object;
    strict?: boolean;
    timeout?: number;
  }
): Promise<{
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    code: string;
    value: any;
    [key: string]: any;
  }>;
  value: T;
}>;
```

**Parameters:**

| Name              | Type     | Required | Default | Description                                   |
| ----------------- | -------- | -------- | ------- | --------------------------------------------- |
| `data`            | `*`      | Yes      | -       | The data to validate                          |
| `schema`          | `Object` | Yes      | -       | The validation schema definition              |
| `options`         | `Object` | No       | `{}`    | Validation options (same as validate)         |
| `options.timeout` | `number` | No       | `5000`  | Timeout for async validations in milliseconds |

**Returns:**

- A Promise resolving to the same object structure as `validate`

**Throws:**

- `Error` - If schema is invalid or async validation times out
- `ValidationError` - If validation fails in strict mode

**Example:**

```javascript
const asyncSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      asyncValidator: async (value, context) => {
        // Check if username exists in database
        const exists = await db.users.findOne({ username: value });
        return exists ? 'Username already taken' : true;
      },
    },
    email: {
      type: 'string',
      format: 'email',
      asyncValidator: async (value) => {
        // Validate email domain exists
        const domain = value.split('@')[1];
        const valid = await checkDomainExists(domain);
        return valid || 'Email domain does not exist';
      },
    },
  },
};

try {
  const result = await validateAsync(
    {
      username: 'johndoe',
      email: 'john@example.com',
    },
    asyncSchema,
    {
      timeout: 10000, // 10 second timeout
    }
  );

  if (result.valid) {
    console.log('Async validation passed');
  } else {
    console.error('Async validation errors:', result.errors);
  }
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

---

### createValidator

Creates a reusable validator function for a specific schema.

```typescript
function createValidator<T = any>(
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    context?: object;
    strict?: boolean;
  }
): (data: T) => {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    code: string;
    value: any;
    [key: string]: any;
  }>;
  value: T;
};
```

**Parameters:**

| Name      | Type     | Required | Default | Description                                   |
| --------- | -------- | -------- | ------- | --------------------------------------------- |
| `schema`  | `Object` | Yes      | -       | The validation schema definition              |
| `options` | `Object` | No       | `{}`    | Default validation options (same as validate) |

**Returns:**

- A function that validates data against the schema, returning the same object
  structure as `validate`

**Throws:**

- `Error` - If schema is invalid

**Example:**

```javascript
// Create specialized validators
const userValidator = createValidator(
  {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 0, maximum: 120 },
    },
  },
  {
    abortEarly: false,
    stripUnknown: true,
  }
);

const productValidator = createValidator({
  type: 'object',
  required: ['name', 'price'],
  properties: {
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    category: { type: 'string', enum: ['electronics', 'clothing', 'books'] },
  },
});

// Use the validators
const userResult = userValidator({
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 30,
  extraField: 'removed', // Will be stripped due to stripUnknown: true
});

const productResult = productValidator({
  name: 'Smartphone',
  price: 299.99,
  category: 'electronics',
});

// Create async validator
const createAsyncValidator = (schema, options = {}) => {
  return async (data) => {
    return await validateAsync(data, schema, options);
  };
};

const asyncUserValidator = createAsyncValidator({
  type: 'object',
  properties: {
    username: {
      type: 'string',
      asyncValidator: async (value) => {
        const exists = await checkUsernameExists(value);
        return !exists || 'Username already exists';
      },
    },
  },
});
```

---

## Sanitization Functions

### sanitize

Sanitizes data based on provided rules or a transformation function.

```typescript
function sanitize<T = any>(
  data: T,
  rules: object | Array<object> | ((data: T) => T)
): T;
```

**Parameters:**

| Name    | Type    | Required | Description          |
| ------- | ------- | -------- | -------------------- | --- | --------------------------------------------------------- |
| `data`  | `*`     | Yes      | The data to sanitize |
| `rules` | `Object | Array    | Function`            | Yes | Sanitization rules, array of rules, or transform function |

**Returns:**

- The sanitized data (same type as input)

**Throws:**

- `Error` - If rules are invalid or transformation fails

**Example:**

```javascript
// Object rules
const sanitized1 = sanitize(
  {
    email: '  USER@EXAMPLE.COM  ',
    name: '<script>alert("xss")</script>John',
    tags: ['  JavaScript  ', 'Node.js', 'Web Dev', 'JavaScript'], // duplicate
  },
  {
    email: { trim: true, lowercase: true },
    name: { stripTags: true, capitalize: true },
    tags: {
      items: { trim: true, slug: true },
      unique: true,
      limit: 5,
    },
  }
);
// Result: {
//   email: 'user@example.com',
//   name: 'Alert("xss")john',
//   tags: ['javascript', 'nodejs', 'web-dev']
// }

// Function rule
const sanitized2 = sanitize({ score: '85.7', active: 'true' }, (data) => ({
  score: parseFloat(data.score),
  active: data.active === 'true',
}));
// Result: { score: 85.7, active: true }

// Array of rules (applied in sequence)
const sanitized3 = sanitize('  <b>Hello World!</b>  ', [
  { trim: true },
  { stripTags: true },
  { uppercase: true },
]);
// Result: 'HELLO WORLD!'
```

---

### sanitizeString

Sanitizes string values with comprehensive cleaning and transformation options.

```typescript
function sanitizeString(
  input: string,
  rules?: {
    trim?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
    capitalize?: boolean;
    titleCase?: boolean;
    escape?: boolean;
    unescape?: boolean;
    truncate?: number;
    truncateSuffix?: string;
    normalize?: boolean | string;
    replace?: { [pattern: string]: string };
    replaceFlags?: string;
    remove?: string | string[];
    slug?: boolean;
    alphanumeric?: boolean;
    alpha?: boolean;
    numeric?: boolean;
    email?: boolean;
    url?: boolean;
    stripTags?: boolean;
    whitespace?: 'single' | 'remove';
    linebreaks?: 'unix' | 'windows' | 'remove';
  }
): string;
```

**Parameters:**

| Name                   | Type      | Required  | Default | Description                                       |
| ---------------------- | --------- | --------- | ------- | ------------------------------------------------- | ------------------------------------ |
| `input`                | `string`  | Yes       | -       | String to sanitize                                |
| `rules`                | `Object`  | No        | `{}`    | Sanitization rules                                |
| `rules.trim`           | `boolean` | No        | `true`  | Remove leading/trailing whitespace                |
| `rules.lowercase`      | `boolean` | No        | `false` | Convert to lowercase                              |
| `rules.uppercase`      | `boolean` | No        | `false` | Convert to uppercase                              |
| `rules.capitalize`     | `boolean` | No        | `false` | Capitalize first letter                           |
| `rules.titleCase`      | `boolean` | No        | `false` | Convert to title case                             |
| `rules.escape`         | `boolean` | No        | `false` | Escape HTML entities                              |
| `rules.unescape`       | `boolean` | No        | `false` | Unescape HTML entities                            |
| `rules.truncate`       | `number`  | No        | -       | Maximum string length                             |
| `rules.truncateSuffix` | `string`  | No        | `'...'` | Suffix for truncated strings                      |
| `rules.normalize`      | `boolean  | string`   | No      | `false`                                           | Unicode normalization (true = 'NFC') |
| `rules.replace`        | `Object`  | No        | -       | Pattern replacement map                           |
| `rules.replaceFlags`   | `string`  | No        | `'g'`   | RegExp flags for replacements                     |
| `rules.remove`         | `string   | string[]` | No      | -                                                 | Patterns to remove                   |
| `rules.slug`           | `boolean` | No        | `false` | Create URL-friendly slug                          |
| `rules.alphanumeric`   | `boolean` | No        | `false` | Keep only alphanumeric characters                 |
| `rules.alpha`          | `boolean` | No        | `false` | Keep only alphabetic characters                   |
| `rules.numeric`        | `boolean` | No        | `false` | Keep only numeric characters                      |
| `rules.email`          | `boolean` | No        | `false` | Apply email normalization                         |
| `rules.url`            | `boolean` | No        | `false` | Normalize URL format                              |
| `rules.stripTags`      | `boolean` | No        | `false` | Remove HTML tags                                  |
| `rules.whitespace`     | `string`  | No        | -       | Whitespace handling ('single', 'remove')          |
| `rules.linebreaks`     | `string`  | No        | -       | Line break handling ('unix', 'windows', 'remove') |

**Returns:**

- The sanitized string

**Throws:**

- `Error` - If input is not a string or regex patterns are invalid

**Example:**

```javascript
// Basic sanitization
const basic = sanitizeString('  <h1>Hello World!</h1>  ', {
  trim: true,
  stripTags: true,
  capitalize: true,
});
// Result: 'Hello world!'

// Advanced sanitization
const advanced = sanitizeString('Café & Restaurant — "Best Food" in Town!', {
  normalize: true, // Handle unicode
  slug: true, // URL-friendly
  truncate: 20, // Limit length
});
// Result: 'cafe-restaurant-be...'

// Pattern replacement
const replaced = sanitizeString('Hello 123 World 456!', {
  replace: {
    '\\d+': 'NUMBER', // Replace digits with NUMBER
    '!': '.', // Replace ! with .
  },
});
// Result: 'Hello NUMBER World NUMBER.'

// Remove patterns
const cleaned = sanitizeString('Contact: +1-555-123-4567 or email@domain.com', {
  remove: ['\\+\\d+-\\d+-\\d+-\\d+', '\\S+@\\S+\\.\\S+'], // Remove phone and email
  whitespace: 'single',
});
// Result: 'Contact: or'

// Email normalization
const email = sanitizeString('  USER+tag@EXAMPLE.COM  ', {
  email: true,
  trim: true,
  lowercase: true,
});
// Result: 'user+tag@example.com'
```

---

### sanitizeNumber

Sanitizes and normalizes numeric values.

```typescript
function sanitizeNumber(
  input: any,
  rules?: {
    default?: number;
    integer?: boolean;
    round?: 'ceil' | 'floor' | 'round';
    min?: number;
    max?: number;
    clamp?: boolean;
    precision?: number;
    positive?: boolean;
    negative?: boolean;
    absolute?: boolean;
    finite?: boolean;
  }
): number;
```

**Parameters:**

| Name              | Type      | Required | Default   | Description                             |
| ----------------- | --------- | -------- | --------- | --------------------------------------- |
| `input`           | `*`       | Yes      | -         | Value to convert to number              |
| `rules`           | `Object`  | No       | `{}`      | Sanitization rules                      |
| `rules.default`   | `number`  | No       | `0`       | Default value for invalid numbers       |
| `rules.integer`   | `boolean` | No       | `false`   | Convert to integer                      |
| `rules.round`     | `string`  | No       | `'round'` | Rounding method for integer conversion  |
| `rules.min`       | `number`  | No       | -         | Minimum allowed value                   |
| `rules.max`       | `number`  | No       | -         | Maximum allowed value                   |
| `rules.clamp`     | `boolean` | No       | `false`   | Clamp values to min/max range           |
| `rules.precision` | `number`  | No       | -         | Decimal places to keep                  |
| `rules.positive`  | `boolean` | No       | `false`   | Ensure positive number                  |
| `rules.negative`  | `boolean` | No       | `false`   | Ensure negative number                  |
| `rules.absolute`  | `boolean` | No       | `false`   | Use absolute value                      |
| `rules.finite`    | `boolean` | No       | `false`   | Ensure finite number (not Infinity/NaN) |

**Returns:**

- The sanitized number

**Example:**

```javascript
// Basic conversion
sanitizeNumber('42.7', { integer: true }); // 43

// Clamping
sanitizeNumber(150, { min: 0, max: 100, clamp: true }); // 100

// Precision
sanitizeNumber(3.14159, { precision: 2 }); // 3.14

// Invalid input handling
sanitizeNumber('invalid', { default: 0 }); // 0

// Complex rules
sanitizeNumber(-42.7891, {
  absolute: true, // Make positive: 42.7891
  precision: 2, // Round to 2 decimals: 42.79
  min: 50, // Minimum value: 50
  clamp: true, // Clamp to minimum: 50
}); // Result: 50
```

---

### sanitizeBoolean

Sanitizes and normalizes boolean values.

```typescript
function sanitizeBoolean(
  input: any,
  rules?: {
    truthy?: string[];
    falsy?: string[];
    strictNumeric?: boolean;
  }
): boolean;
```

**Parameters:**

| Name                  | Type       | Required | Default                            | Description                  |
| --------------------- | ---------- | -------- | ---------------------------------- | ---------------------------- |
| `input`               | `*`        | Yes      | -                                  | Value to convert to boolean  |
| `rules`               | `Object`   | No       | `{}`                               | Sanitization rules           |
| `rules.truthy`        | `string[]` | No       | `['true', '1', 'yes', 'on', 'y']`  | Values considered truthy     |
| `rules.falsy`         | `string[]` | No       | `['false', '0', 'no', 'off', 'n']` | Values considered falsy      |
| `rules.strictNumeric` | `boolean`  | No       | `false`                            | Only 1 is truthy for numbers |

**Returns:**

- The sanitized boolean value

**Example:**

```javascript
// String conversion
sanitizeBoolean('yes'); // true
sanitizeBoolean('no'); // false

// Custom truthy/falsy values
sanitizeBoolean('oui', {
  truthy: ['oui', 'si'],
  falsy: ['non', 'no'],
}); // true

// Strict numeric
sanitizeBoolean(5, { strictNumeric: true }); // false
sanitizeBoolean(1, { strictNumeric: true }); // true
```

---

### sanitizeArray

Sanitizes and processes array values.

```typescript
function sanitizeArray(
  input: any,
  rules?: {
    parse?: boolean;
    delimiter?: string;
    compact?: boolean;
    flatten?: boolean | number;
    unique?: boolean;
    uniqueBy?: string | ((item: any) => any);
    items?: object;
    skipInvalid?: boolean;
    filter?: (item: any, index: number) => boolean;
    sort?: boolean | string | ((a: any, b: any) => number);
    reverse?: boolean;
    limit?: number;
    offset?: number;
  }
): any[];
```

**Parameters:**

| Name                | Type       | Required  | Default   | Description                      |
| ------------------- | ---------- | --------- | --------- | -------------------------------- | ----------------------------------------- | ---------------- |
| `input`             | `*`        | Yes       | -         | Value to convert to array        |
| `rules`             | `Object`   | No        | `{}`      | Sanitization rules               |
| `rules.parse`       | `boolean`  | No        | `false`   | Try to parse JSON strings        |
| `rules.delimiter`   | `string`   | No        | `','`     | Delimiter for string splitting   |
| `rules.compact`     | `boolean`  | No        | `false`   | Remove falsy values              |
| `rules.flatten`     | `boolean   | number`   | No        | `false`                          | Flatten nested arrays                     |
| `rules.unique`      | `boolean`  | No        | `false`   | Remove duplicate items           |
| `rules.uniqueBy`    | `string    | Function` | No        | -                                | Property or function for uniqueness check |
| `rules.items`       | `Object`   | No        | -         | Sanitization rules for each item |
| `rules.skipInvalid` | `boolean`  | No        | `false`   | Skip items that fail validation  |
| `rules.filter`      | `Function` | No        | -         | Filter function for items        |
| `rules.sort`        | `boolean   | string    | Function` | No                               | `false`                                   | Sort array items |
| `rules.reverse`     | `boolean`  | No        | `false`   | Reverse array order              |
| `rules.limit`       | `number`   | No        | -         | Maximum array length             |
| `rules.offset`      | `number`   | No        | `0`       | Skip items from beginning        |

**Returns:**

- The sanitized array

**Example:**

```javascript
// String parsing
sanitizeArray('a,b,c', { delimiter: ',' }); // ['a', 'b', 'c']

// JSON parsing
sanitizeArray('[1, 2, 3]', { parse: true }); // [1, 2, 3]

// Deduplication
sanitizeArray([1, 2, 2, 3, 1], { unique: true }); // [1, 2, 3]

// Object deduplication
sanitizeArray(
  [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 1, name: 'Johnny' },
  ],
  {
    unique: true,
    uniqueBy: 'id',
  }
); // [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]

// Item sanitization
sanitizeArray(['  hello  ', '  WORLD  '], {
  items: { trim: true, capitalize: true },
}); // ['Hello', 'World']

// Complex processing
sanitizeArray(
  ['JavaScript', 'Node.js', '', 'React', 'JavaScript', null, 'Vue.js'],
  {
    compact: true, // Remove empty/null values
    unique: true, // Remove duplicates
    items: { slug: true }, // Convert to slugs
    sort: true, // Sort alphabetically
    limit: 3, // Keep only first 3
  }
); // ['javascript', 'nodejs', 'react']
```

---

### sanitizeObject

Sanitizes and processes object values.

```typescript
function sanitizeObject(
  input: any,
  rules?: {
    parse?: boolean;
    defaults?: object;
    pick?: string[];
    omit?: string[];
    rename?: { [oldKey: string]: string };
    properties?: { [key: string]: object };
    skipInvalid?: boolean;
    filter?: (value: any, key: string) => boolean;
    mapKeys?: (key: string, value: any) => string;
    mapValues?: (value: any, key: string) => any;
    removeEmpty?: boolean;
    maxProperties?: number;
  }
): object;
```

**Parameters:**

| Name                  | Type       | Required | Default | Description                            |
| --------------------- | ---------- | -------- | ------- | -------------------------------------- |
| `input`               | `*`        | Yes      | -       | Value to convert to object             |
| `rules`               | `Object`   | No       | `{}`    | Sanitization rules                     |
| `rules.parse`         | `boolean`  | No       | `false` | Try to parse JSON strings              |
| `rules.defaults`      | `Object`   | No       | `{}`    | Default values to merge                |
| `rules.pick`          | `string[]` | No       | -       | Properties to keep                     |
| `rules.omit`          | `string[]` | No       | -       | Properties to remove                   |
| `rules.rename`        | `Object`   | No       | `{}`    | Property name mappings                 |
| `rules.properties`    | `Object`   | No       | `{}`    | Sanitization rules per property        |
| `rules.skipInvalid`   | `boolean`  | No       | `false` | Skip properties that fail sanitization |
| `rules.filter`        | `Function` | No       | -       | Filter function for properties         |
| `rules.mapKeys`       | `Function` | No       | -       | Transform property names               |
| `rules.mapValues`     | `Function` | No       | -       | Transform property values              |
| `rules.removeEmpty`   | `boolean`  | No       | `false` | Remove null/undefined/empty properties |
| `rules.maxProperties` | `number`   | No       | -       | Maximum number of properties           |

**Returns:**

- The sanitized object

**Example:**

```javascript
// Basic property selection
sanitizeObject(
  { name: 'John', age: 30, password: 'secret', role: 'admin' },
  { pick: ['name', 'age', 'role'] }
); // { name: 'John', age: 30, role: 'admin' }

// Property sanitization
sanitizeObject(
  { email: '  USER@EXAMPLE.COM  ', name: '<b>John</b>', age: '30' },
  {
    properties: {
      email: { trim: true, lowercase: true },
      name: { stripTags: true },
      age: { integer: true },
    },
  }
); // { email: 'user@example.com', name: 'John', age: 30 }

// Complex transformation
sanitizeObject(
  {
    firstName: 'John',
    lastName: 'Doe',
    email_address: 'john@example.com',
    phone_number: '555-1234',
    extra_field: 'remove me',
    empty_field: '',
  },
  {
    defaults: { active: true }, // Add default
    rename: {
      // Rename properties
      firstName: 'first_name',
      lastName: 'last_name',
      email_address: 'email',
      phone_number: 'phone',
    },
    omit: ['extra_field'], // Remove unwanted
    removeEmpty: true, // Remove empty values
    properties: {
      // Sanitize values
      email: { trim: true, lowercase: true },
      phone: { numeric: true },
    },
  }
);
// Result: {
//   first_name: 'John',
//   last_name: 'Doe',
//   email: 'john@example.com',
//   phone: '5551234',
//   active: true
// }
```

---

### sanitizeHtml

Sanitizes HTML content to prevent XSS attacks while preserving safe formatting.

```typescript
function sanitizeHtml(
  input: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: { [tag: string]: string[] };
    allowedSchemes?: string[];
    stripEmpty?: boolean;
    maxLength?: number;
    allowDataAttributes?: boolean;
    allowClassNames?: boolean;
  }
): string;
```

**Parameters:**

| Name                          | Type       | Required | Default             | Description                |
| ----------------------------- | ---------- | -------- | ------------------- | -------------------------- |
| `input`                       | `string`   | Yes      | -                   | HTML content to sanitize   |
| `options`                     | `Object`   | No       | `{}`                | Sanitization options       |
| `options.allowedTags`         | `string[]` | No       | Basic safe tags     | HTML tags to preserve      |
| `options.allowedAttributes`   | `Object`   | No       | `{}`                | Allowed attributes per tag |
| `options.allowedSchemes`      | `string[]` | No       | `['http', 'https']` | Allowed URL schemes        |
| `options.stripEmpty`          | `boolean`  | No       | `true`              | Remove empty tags          |
| `options.maxLength`           | `number`   | No       | -                   | Maximum input length       |
| `options.allowDataAttributes` | `boolean`  | No       | `false`             | Allow data-\* attributes   |
| `options.allowClassNames`     | `boolean`  | No       | `false`             | Allow class attributes     |

**Returns:**

- The sanitized HTML string

**Throws:**

- `Error` - If input is not a string or options are invalid

**Example:**

```javascript
// Basic HTML sanitization
const safeHtml = sanitizeHtml(
  '<p onclick="alert(1)">Hello <script>alert("xss")</script> <b>World</b></p>',
  {
    allowedTags: ['p', 'b', 'i', 'strong', 'em'],
    allowedAttributes: {},
  }
);
// Result: '<p>Hello  <b>World</b></p>'

// Advanced sanitization with attributes
const richHtml = sanitizeHtml(
  '<a href="javascript:alert(1)" target="_blank">Link</a><img src="image.jpg" onerror="alert(1)">',
  {
    allowedTags: ['a', 'img'],
    allowedAttributes: {
      a: ['href', 'target'],
      img: ['src', 'alt', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  }
);
// Result: '<a target="_blank">Link</a><img src="image.jpg">'

// Blog content sanitization
const blogContent = sanitizeHtml(
  '<h1>Title</h1><p class="intro">Introduction</p><div onclick="hack()">Content</div>',
  {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'p',
      'br',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
    ],
    allowedAttributes: {
      p: ['class'],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
    },
    allowClassNames: true,
    stripEmpty: true,
  }
);
// Result: '<h1>Title</h1><p class="intro">Introduction</p>Content'
```

---

### createSanitizer

Creates a reusable sanitizer function for specific rules.

```typescript
function createSanitizer<T = any>(
  rules: object | Array<object> | ((data: T) => T)
): (data: T) => T;
```

**Parameters:**

| Name    | Type    | Required | Description |
| ------- | ------- | -------- | ----------- | --- | --------------------------------------------------------- |
| `rules` | `Object | Array    | Function`   | Yes | Sanitization rules, array of rules, or transform function |

**Returns:**

- A function that sanitizes data according to the rules

**Throws:**

- `Error` - If rules are invalid

**Example:**

```javascript
// Create specialized sanitizers
const userSanitizer = createSanitizer({
  email: { trim: true, lowercase: true },
  name: { trim: true, capitalize: true, stripTags: true },
  bio: {
    stripTags: true,
    truncate: 500,
    whitespace: 'single',
  },
});

const commentSanitizer = createSanitizer({
  content: {
    stripTags: true,
    escape: true,
    truncate: 1000,
    whitespace: 'single',
  },
  author: { trim: true, capitalize: true },
});

// Use the sanitizers
const cleanUser = userSanitizer({
  email: '  USER@EXAMPLE.COM  ',
  name: '<script>alert("xss")</script>john doe',
  bio: 'A long bio with   multiple   spaces and <b>formatting</b>.',
});
// Result: {
//   email: 'user@example.com',
//   name: 'Alert("xss")john doe',
//   bio: 'A long bio with multiple spaces and formatting.'
// }

// Sequential sanitization
const pipeSanitizer = createSanitizer([
  { trim: true },
  { stripTags: true },
  { capitalize: true },
  { truncate: 50 },
]);

const result = pipeSanitizer('  <h1>hello world from a very long title</h1>  ');
// Result: 'Hello world from a very long title'
```

---

## Built-in Validators

### validateString

Validates string values against specified criteria.

```typescript
function validateString(
  input: string,
  rules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    exactLength?: number;
    pattern?: RegExp;
    enum?: string[];
    startsWith?: string;
    endsWith?: string;
    contains?: string;
    alphanumeric?: boolean;
    alpha?: boolean;
    numeric?: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
    email?: boolean;
    url?: boolean;
    uuid?: boolean;
    slug?: boolean;
    hexColor?: boolean;
    base64?: boolean;
    json?: boolean;
    custom?: (value: string) => boolean | string;
  }
): boolean;
```

**Parameters:**

| Name                 | Type       | Required | Default | Description                         |
| -------------------- | ---------- | -------- | ------- | ----------------------------------- |
| `input`              | `string`   | Yes      | -       | String to validate                  |
| `rules`              | `Object`   | No       | `{}`    | Validation rules                    |
| `rules.required`     | `boolean`  | No       | `false` | Field is required (not empty)       |
| `rules.minLength`    | `number`   | No       | -       | Minimum string length               |
| `rules.maxLength`    | `number`   | No       | -       | Maximum string length               |
| `rules.exactLength`  | `number`   | No       | -       | Exact string length required        |
| `rules.pattern`      | `RegExp`   | No       | -       | Regular expression pattern to match |
| `rules.enum`         | `string[]` | No       | -       | Allowed values (whitelist)          |
| `rules.startsWith`   | `string`   | No       | -       | String must start with this value   |
| `rules.endsWith`     | `string`   | No       | -       | String must end with this value     |
| `rules.contains`     | `string`   | No       | -       | String must contain this value      |
| `rules.alphanumeric` | `boolean`  | No       | `false` | Allow only alphanumeric characters  |
| `rules.alpha`        | `boolean`  | No       | `false` | Allow only alphabetic characters    |
| `rules.numeric`      | `boolean`  | No       | `false` | Allow only numeric characters       |
| `rules.uppercase`    | `boolean`  | No       | `false` | Must be uppercase                   |
| `rules.lowercase`    | `boolean`  | No       | `false` | Must be lowercase                   |
| `rules.email`        | `boolean`  | No       | `false` | Must be valid email format          |
| `rules.url`          | `boolean`  | No       | `false` | Must be valid URL format            |
| `rules.uuid`         | `boolean`  | No       | `false` | Must be valid UUID format           |
| `rules.slug`         | `boolean`  | No       | `false` | Must be valid URL slug format       |
| `rules.hexColor`     | `boolean`  | No       | `false` | Must be valid hex color format      |
| `rules.base64`       | `boolean`  | No       | `false` | Must be valid base64 format         |
| `rules.json`         | `boolean`  | No       | `false` | Must be valid JSON string           |
| `rules.custom`       | `Function` | No       | -       | Custom validation function          |

**Returns:**

- `boolean` - True if valid, false otherwise

**Throws:**

- `TypeError` - If input is not a string

**Example:**

```javascript
// Basic validation
validateString('user123', {
  minLength: 3,
  maxLength: 20,
  alphanumeric: true,
}); // true

// Pattern validation
validateString('ABC123', {
  pattern: /^[A-Z]{3}\d{3}$/,
}); // true

// Email validation
validateString('user@example.com', {
  email: true,
  maxLength: 255,
}); // true

// Enum validation
validateString('admin', {
  enum: ['user', 'admin', 'moderator'],
}); // true

// Custom validation
validateString('password123', {
  minLength: 8,
  custom: (value) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    return (
      (hasUpper && hasLower && hasNumber) ||
      'Password must contain uppercase, lowercase, and number'
    );
  },
}); // true

// Complex validation
validateString('my-blog-post-title', {
  slug: true,
  minLength: 5,
  maxLength: 100,
  startsWith: 'my-',
  contains: 'blog',
}); // true
```

---

### validateNumber

Validates numeric values against specified criteria.

```typescript
function validateNumber(
  input: number,
  rules?: {
    required?: boolean;
    min?: number;
    max?: number;
    exclusiveMin?: number;
    exclusiveMax?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    nonZero?: boolean;
    finite?: boolean;
    multipleOf?: number;
    precision?: number;
    enum?: number[];
    custom?: (value: number) => boolean | string;
  }
): boolean;
```

**Parameters:**

| Name                 | Type       | Required | Default | Description                            |
| -------------------- | ---------- | -------- | ------- | -------------------------------------- |
| `input`              | `number`   | Yes      | -       | Number to validate                     |
| `rules`              | `Object`   | No       | `{}`    | Validation rules                       |
| `rules.required`     | `boolean`  | No       | `false` | Field is required (not null/undefined) |
| `rules.min`          | `number`   | No       | -       | Minimum value (inclusive)              |
| `rules.max`          | `number`   | No       | -       | Maximum value (inclusive)              |
| `rules.exclusiveMin` | `number`   | No       | -       | Minimum value (exclusive)              |
| `rules.exclusiveMax` | `number`   | No       | -       | Maximum value (exclusive)              |
| `rules.integer`      | `boolean`  | No       | `false` | Must be an integer                     |
| `rules.positive`     | `boolean`  | No       | `false` | Must be positive (> 0)                 |
| `rules.negative`     | `boolean`  | No       | `false` | Must be negative (< 0)                 |
| `rules.nonZero`      | `boolean`  | No       | `false` | Must not be zero                       |
| `rules.finite`       | `boolean`  | No       | `false` | Must be finite (not Infinity/NaN)      |
| `rules.multipleOf`   | `number`   | No       | -       | Must be multiple of this value         |
| `rules.precision`    | `number`   | No       | -       | Maximum decimal places                 |
| `rules.enum`         | `number[]` | No       | -       | Allowed values (whitelist)             |
| `rules.custom`       | `Function` | No       | -       | Custom validation function             |

**Returns:**

- `boolean` - True if valid, false otherwise

**Example:**

```javascript
// Range validation
validateNumber(42, {
  min: 0,
  max: 100,
  integer: true,
}); // true

// Precision validation
validateNumber(3.14, {
  precision: 2,
  positive: true,
}); // true

// Multiple validation
validateNumber(15, {
  multipleOf: 5,
  min: 10,
  max: 20,
}); // true

// Custom validation
validateNumber(85, {
  custom: (value) => {
    if (value >= 90) return true;
    if (value >= 80) return 'Good but could be better';
    if (value >= 70) return 'Acceptable';
    return 'Too low';
  },
}); // 'Good but could be better'
```

---

### validateBoolean

Validates boolean values.

```typescript
function validateBoolean(
  input: boolean,
  rules?: {
    required?: boolean;
    strict?: boolean;
    allowTruthy?: boolean;
    custom?: (value: boolean) => boolean | string;
  }
): boolean;
```

**Parameters:**

| Name                | Type       | Required | Default | Description                     |
| ------------------- | ---------- | -------- | ------- | ------------------------------- |
| `input`             | `boolean`  | Yes      | -       | Boolean to validate             |
| `rules`             | `Object`   | No       | `{}`    | Validation rules                |
| `rules.required`    | `boolean`  | No       | `false` | Field is required               |
| `rules.strict`      | `boolean`  | No       | `true`  | Only accept true boolean values |
| `rules.allowTruthy` | `boolean`  | No       | `false` | Accept truthy/falsy values      |
| `rules.custom`      | `Function` | No       | -       | Custom validation function      |

**Returns:**

- `boolean` - True if valid, false otherwise

**Example:**

```javascript
// Strict boolean validation
validateBoolean(true, { strict: true }); // true
validateBoolean('true', { strict: true }); // false

// Truthy validation
validateBoolean('yes', {
  strict: false,
  allowTruthy: true,
}); // true
```

---

### validateArray

Validates array values and their contents.

```typescript
function validateArray(
  input: any[],
  rules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    exactLength?: number;
    unique?: boolean;
    uniqueBy?: string | ((item: any) => any);
    contains?: any;
    items?: object;
    enum?: any[][];
    custom?: (value: any[]) => boolean | string;
  }
): boolean;
```

**Parameters:**

| Name                | Type       | Required  | Default | Description                    |
| ------------------- | ---------- | --------- | ------- | ------------------------------ | ----------------------------------------- |
| `input`             | `any[]`    | Yes       | -       | Array to validate              |
| `rules`             | `Object`   | No        | `{}`    | Validation rules               |
| `rules.required`    | `boolean`  | No        | `false` | Field is required              |
| `rules.minLength`   | `number`   | No        | -       | Minimum array length           |
| `rules.maxLength`   | `number`   | No        | -       | Maximum array length           |
| `rules.exactLength` | `number`   | No        | -       | Exact array length required    |
| `rules.unique`      | `boolean`  | No        | `false` | All items must be unique       |
| `rules.uniqueBy`    | `string    | Function` | No      | -                              | Property or function for uniqueness check |
| `rules.contains`    | `any`      | No        | -       | Array must contain this value  |
| `rules.items`       | `Object`   | No        | -       | Validation rules for each item |
| `rules.enum`        | `any[][]`  | No        | -       | Allowed array values           |
| `rules.custom`      | `Function` | No        | -       | Custom validation function     |

**Returns:**

- `boolean` - True if valid, false otherwise

**Example:**

```javascript
// Basic array validation
validateArray([1, 2, 3], {
  minLength: 2,
  maxLength: 5,
  unique: true,
}); // true

// Item validation
validateArray(['alice@example.com', 'bob@example.com'], {
  items: {
    type: 'string',
    email: true,
  },
}); // true

// Object array validation
validateArray(
  [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
  ],
  {
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', positive: true },
        name: { type: 'string', minLength: 1 },
      },
    },
    unique: true,
    uniqueBy: 'id',
  }
); // true
```

---

### validateObject

Validates object structure and properties.

```typescript
function validateObject(
  input: object,
  rules?: {
    required?: boolean;
    minProperties?: number;
    maxProperties?: number;
    properties?: { [key: string]: object };
    required?: string[];
    additionalProperties?: boolean;
    patternProperties?: { [pattern: string]: object };
    dependencies?: { [key: string]: string[] | object };
    custom?: (value: object) => boolean | string;
  }
): boolean;
```

**Parameters:**

| Name                         | Type       | Required | Default | Description                                 |
| ---------------------------- | ---------- | -------- | ------- | ------------------------------------------- |
| `input`                      | `Object`   | Yes      | -       | Object to validate                          |
| `rules`                      | `Object`   | No       | `{}`    | Validation rules                            |
| `rules.required`             | `boolean`  | No       | `false` | Field is required                           |
| `rules.minProperties`        | `number`   | No       | -       | Minimum number of properties                |
| `rules.maxProperties`        | `number`   | No       | -       | Maximum number of properties                |
| `rules.properties`           | `Object`   | No       | `{}`    | Property validation rules                   |
| `rules.required`             | `string[]` | No       | `[]`    | Required property names                     |
| `rules.additionalProperties` | `boolean`  | No       | `true`  | Allow additional properties                 |
| `rules.patternProperties`    | `Object`   | No       | `{}`    | Validation for properties matching patterns |
| `rules.dependencies`         | `Object`   | No       | `{}`    | Property dependencies                       |
| `rules.custom`               | `Function` | No       | -       | Custom validation function                  |

**Returns:**

- `boolean` - True if valid, false otherwise

**Example:**

```javascript
// Basic object validation
const userSchema = {
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', email: true },
    age: { type: 'number', min: 0, max: 120 },
  },
  required: ['name', 'email'],
  additionalProperties: false,
};

validateObject(
  {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  },
  userSchema
); // true

// Nested object validation
const profileSchema = {
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        contact: {
          type: 'object',
          properties: {
            email: { type: 'string', email: true },
            phone: { type: 'string', phone: true },
          },
        },
      },
    },
  },
};

validateObject(
  {
    user: {
      name: 'Alice',
      contact: {
        email: 'alice@example.com',
        phone: '+1-555-123-4567',
      },
    },
  },
  profileSchema
); // true
```

---

### validateDate

Validates date values and formats.

```typescript
function validateDate(
  input: Date | string,
  rules?: {
    required?: boolean;
    min?: Date | string;
    max?: Date | string;
    format?: string;
    iso?: boolean;
    future?: boolean;
    past?: boolean;
    weekday?: number | number[];
    custom?: (value: Date) => boolean | string;
  }
): boolean;
```

**Parameters:**

| Name             | Type       | Required  | Default | Description                |
| ---------------- | ---------- | --------- | ------- | -------------------------- | --------------------------------------- |
| `input`          | `Date      | string`   | Yes     | -                          | Date to validate                        |
| `rules`          | `Object`   | No        | `{}`    | Validation rules           |
| `rules.required` | `boolean`  | No        | `false` | Field is required          |
| `rules.min`      | `Date      | string`   | No      | -                          | Minimum date (inclusive)                |
| `rules.max`      | `Date      | string`   | No      | -                          | Maximum date (inclusive)                |
| `rules.format`   | `string`   | No        | -       | Expected date format       |
| `rules.iso`      | `boolean`  | No        | `false` | Must be ISO 8601 format    |
| `rules.future`   | `boolean`  | No        | `false` | Must be in the future      |
| `rules.past`     | `boolean`  | No        | `false` | Must be in the past        |
| `rules.weekday`  | `number    | number[]` | No      | -                          | Allowed weekdays (0=Sunday, 6=Saturday) |
| `rules.custom`   | `Function` | No        | -       | Custom validation function |

**Returns:**

- `boolean` - True if valid, false otherwise

**Example:**

```javascript
// Basic date validation
validateDate(new Date(), {
  min: '2020-01-01',
  max: '2030-12-31',
}); // true

// ISO string validation
validateDate('2023-12-25T10:30:00Z', {
  iso: true,
  future: true,
}); // depends on current date

// Weekday validation
validateDate(new Date(), {
  weekday: [1, 2, 3, 4, 5], // Monday to Friday
}); // depends on current weekday
```

---

### validateEmail

Validates email addresses using comprehensive RFC-compliant rules.

```typescript
function validateEmail(
  email: string,
  options?: {
    allowInternational?: boolean;
    allowSmtpUTF8?: boolean;
    maxLength?: number;
    blacklistDomains?: string[];
    whitelistDomains?: string[];
    requireTld?: boolean;
    allowLocal?: boolean;
  }
): boolean;
```

**Parameters:**

| Name                         | Type       | Required | Default | Description                                |
| ---------------------------- | ---------- | -------- | ------- | ------------------------------------------ |
| `email`                      | `string`   | Yes      | -       | Email address to validate                  |
| `options`                    | `Object`   | No       | `{}`    | Validation options                         |
| `options.allowInternational` | `boolean`  | No       | `true`  | Allow international domain names           |
| `options.allowSmtpUTF8`      | `boolean`  | No       | `false` | Allow UTF-8 characters in local part       |
| `options.maxLength`          | `number`   | No       | `254`   | Maximum email length                       |
| `options.blacklistDomains`   | `string[]` | No       | `[]`    | Blocked domains                            |
| `options.whitelistDomains`   | `string[]` | No       | `[]`    | Allowed domains (if specified, only these) |
| `options.requireTld`         | `boolean`  | No       | `true`  | Require top-level domain                   |
| `options.allowLocal`         | `boolean`  | No       | `false` | Allow local addresses (no domain)          |

**Returns:**

- `boolean` - True if valid email format

**Example:**

```javascript
// Basic email validation
validateEmail('user@example.com'); // true
validateEmail('invalid-email'); // false

// Advanced email validation
validateEmail('user+tag@example.co.uk', {
  maxLength: 100,
  requireTld: true,
  whitelistDomains: ['example.com', 'example.co.uk'],
}); // true

// Corporate email validation
validateEmail('john.doe@company.internal', {
  allowLocal: true,
  requireTld: false,
  whitelistDomains: ['company.internal', 'company.com'],
}); // true
```

---

### validateUrl

Validates URL format and components.

```typescript
function validateUrl(
  url: string,
  options?: {
    protocols?: string[];
    requireTld?: boolean;
    requireProtocol?: boolean;
    allowLocal?: boolean;
    allowPort?: boolean;
    allowQuery?: boolean;
    allowFragment?: boolean;
    maxLength?: number;
  }
): boolean;
```

**Parameters:**

| Name                      | Type       | Required | Default             | Description                 |
| ------------------------- | ---------- | -------- | ------------------- | --------------------------- |
| `url`                     | `string`   | Yes      | -                   | URL to validate             |
| `options`                 | `Object`   | No       | `{}`                | Validation options          |
| `options.protocols`       | `string[]` | No       | `['http', 'https']` | Allowed protocols           |
| `options.requireTld`      | `boolean`  | No       | `true`              | Require top-level domain    |
| `options.requireProtocol` | `boolean`  | No       | `true`              | Require protocol in URL     |
| `options.allowLocal`      | `boolean`  | No       | `false`             | Allow localhost/local IPs   |
| `options.allowPort`       | `boolean`  | No       | `true`              | Allow port numbers          |
| `options.allowQuery`      | `boolean`  | No       | `true`              | Allow query parameters      |
| `options.allowFragment`   | `boolean`  | No       | `true`              | Allow URL fragments (#hash) |
| `options.maxLength`       | `number`   | No       | `2048`              | Maximum URL length          |

**Returns:**

- `boolean` - True if valid URL format

**Example:**

```javascript
// Basic URL validation
validateUrl('https://example.com'); // true
validateUrl('ftp://files.example.com'); // false (protocol not allowed)

// Custom protocol validation
validateUrl('ftp://files.example.com', {
  protocols: ['ftp', 'sftp', 'http', 'https'],
}); // true

// Strict URL validation
validateUrl('example.com/path', {
  requireProtocol: true,
  requireTld: true,
}); // false (no protocol)

// Local development validation
validateUrl('http://localhost:3000/api', {
  allowLocal: true,
  allowPort: true,
}); // true
```

---

### validatePhone

Validates phone numbers with international format support.

```typescript
function validatePhone(
  phone: string,
  options?: {
    country?: string;
    format?: 'e164' | 'national' | 'international' | 'any';
    allowExtensions?: boolean;
    minLength?: number;
    maxLength?: number;
  }
): boolean;
```

**Parameters:**

| Name                      | Type      | Required | Default | Description                            |
| ------------------------- | --------- | -------- | ------- | -------------------------------------- |
| `phone`                   | `string`  | Yes      | -       | Phone number to validate               |
| `options`                 | `Object`  | No       | `{}`    | Validation options                     |
| `options.country`         | `string`  | No       | -       | Country code for validation (ISO 3166) |
| `options.format`          | `string`  | No       | `'any'` | Expected phone format                  |
| `options.allowExtensions` | `boolean` | No       | `true`  | Allow phone extensions                 |
| `options.minLength`       | `number`  | No       | `7`     | Minimum phone number length            |
| `options.maxLength`       | `number`  | No       | `15`    | Maximum phone number length            |

**Returns:**

- `boolean` - True if valid phone format

**Example:**

```javascript
// Basic phone validation
validatePhone('+1-555-123-4567'); // true
validatePhone('555-123-4567'); // true

// Country-specific validation
validatePhone('555-123-4567', {
  country: 'US',
  format: 'national',
}); // true

// E.164 format validation
validatePhone('+15551234567', {
  format: 'e164',
}); // true

// International format
validatePhone('+44 20 7946 0958', {
  country: 'GB',
  format: 'international',
}); // true
```

---

## Common Sanitizers

### sanitizeEmail

Sanitizes and normalizes email addresses.

```javascript
function sanitizeEmail(email: string): string;
```

**Example:**

```javascript
sanitizeEmail('  USER@EXAMPLE.COM  '); // 'user@example.com'
sanitizeEmail('Test.Email+Tag@Domain.Co.UK'); // 'test.email+tag@domain.co.uk'
```

---

### sanitizeUsername

Sanitizes usernames for consistency.

```javascript
function sanitizeUsername(username: string): string;
```

**Example:**

```javascript
sanitizeUsername('  JOHN_DOE123  '); // 'john_doe123'
sanitizeUsername('User Name!'); // 'username'
```

---

### sanitizePassword

Sanitizes passwords while preserving integrity.

```javascript
function sanitizePassword(password: string): string;
```

**Example:**

```javascript
sanitizePassword('MyPassword123!'); // 'MyPassword123!'
sanitizePassword('  password  '); // '  password  ' (no trim)
```

---

### sanitizePhone

Sanitizes and formats phone numbers.

```javascript
function sanitizePhone(
  phone: string,
  options?: { format?: 'e164' | 'national'; country?: string }
): string;
```

**Example:**

```javascript
sanitizePhone('(555) 123-4567'); // '5551234567'
sanitizePhone('555-123-4567', { format: 'e164', country: 'US' }); // '+15551234567'
```

---

### sanitizeUrl

Sanitizes and normalizes URLs.

```javascript
function sanitizeUrl(url: string): string;
```

**Example:**

```javascript
sanitizeUrl('example.com'); // 'https://example.com'
sanitizeUrl('  https://example.com  '); // 'https://example.com'
```

---

### sanitizeSlug

Creates URL-friendly slugs.

```javascript
function sanitizeSlug(slug: string): string;
```

**Example:**

```javascript
sanitizeSlug('Hello World!'); // 'hello-world'
sanitizeSlug('  My Blog Post  '); // 'my-blog-post'
sanitizeSlug('Café & Restaurant'); // 'cafe-restaurant'
```

---

### sanitizeSearch

Sanitizes search query strings.

```javascript
function sanitizeSearch(query: string): string;
```

**Example:**

```javascript
sanitizeSearch('  hello world  '); // 'hello world'
sanitizeSearch('search<script>alert(1)</script>'); // 'searchalert(1)'
sanitizeSearch('hello   world\n\ntest'); // 'hello world test'
```

---

### sanitizeCreditCard

Sanitizes and optionally masks credit card numbers.

```javascript
function sanitizeCreditCard(
  card: string,
  options?: { mask?: boolean; keepLast?: number }
): string;
```

**Example:**

```javascript
sanitizeCreditCard('4111-1111-1111-1111'); // '4111111111111111'
sanitizeCreditCard('4111111111111111', { mask: true }); // '************1111'
sanitizeCreditCard('4111111111111111', { mask: true, keepLast: 6 }); // '**********111111'
```

---

### sanitizePostalCode

Sanitizes postal codes with country-specific formatting.

```javascript
function sanitizePostalCode(code: string, country?: string): string;
```

**Example:**

```javascript
sanitizePostalCode('  12345  '); // '12345'
sanitizePostalCode('k1a 0a6'); // 'K1A 0A6'
sanitizePostalCode('12345-6789', 'US'); // '12345-6789'
sanitizePostalCode('k1a0a6', 'CA'); // 'K1A0A6'
```

---

### sanitizeTags

Sanitizes arrays of tag strings.

```javascript
function sanitizeTags(
  tags: string | string[],
  options?: { maxTags?: number; maxLength?: number; delimiter?: string }
): string[];
```

**Example:**

```javascript
sanitizeTags('JavaScript, Node.js, Web Development, , ,React');
// ['javascript', 'nodejs', 'web-development', 'react']

sanitizeTags(['JavaScript', 'JavaScript', 'React', '']);
// ['javascript', 'react']
```

---

### sanitizeHexColor

Sanitizes hex color codes.

```javascript
function sanitizeHexColor(color: string): string | null;
```

**Example:**

```javascript
sanitizeHexColor('FF5733'); // '#FF5733'
sanitizeHexColor('#ff5733'); // '#FF5733'
sanitizeHexColor('FFF'); // '#FFF'
sanitizeHexColor('GGGGGG'); // null
```

---

### sanitizeFilename

Sanitizes filenames for file system safety.

```javascript
function sanitizeFilename(filename: string): string;
```

**Example:**

```javascript
sanitizeFilename('My Document.pdf'); // 'My_Document.pdf'
sanitizeFilename('file<>:"/\\|?*.txt'); // 'file.txt'
sanitizeFilename('file name with spaces.txt'); // 'file_name_with_spaces.txt'
```

---

### sanitizeIpAddress

Sanitizes IP addresses (IPv4 and IPv6).

```javascript
function sanitizeIpAddress(ip: string): string;
```

**Example:**

```javascript
sanitizeIpAddress('  192.168.1.1  '); // '192.168.1.1'
sanitizeIpAddress('2001:0db8:85a3::8a2e:0370:7334'); // '2001:0db8:85a3::8a2e:0370:7334'
sanitizeIpAddress('192.168.1.1abc'); // '192.168.1.1'
```

---

## Schema Functions

### commonSchemas

An object containing predefined schemas for common data types.

```typescript
const commonSchemas: {
  email: object;
  password: object;
  username: object;
  phone: object;
  url: object;
  id: object;
  uuid: object;
  slug: object;
  tags: object;
  date: object;
  integer: object;
  positiveInteger: object;
  percentage: object;
  address: object;
  coordinates: object;
  timeRange: object;
  pagination: object;
  searchQuery: object;
  fileUpload: object;
  creditCard: object;
  postalCode: object;
  hexColor: object;
  ipAddress: object;
  macAddress: object;
  domain: object;
  filename: object;
};
```

**Usage:**

```javascript
// Use predefined schemas
const userSchema = {
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    tags: commonSchemas.tags,
  },
  required: ['email', 'password'],
};

// Extend common schemas
const extendedEmailSchema = {
  ...commonSchemas.email,
  maxLength: 100,
  blacklistDomains: ['tempmail.com', 'guerrillamail.com'],
};
```

**Common Schema Details:**

- **email**: RFC 5322 compliant email validation with length limits
- **password**: Strong password requirements with character complexity
- **username**: Alphanumeric usernames with length constraints
- **phone**: International phone number validation with E.164 support
- **url**: HTTP/HTTPS URL validation with protocol requirements
- **id**: Positive integer ID validation
- **uuid**: UUID v4 format validation
- **slug**: URL-friendly slug validation (lowercase, hyphens)
- **tags**: Array of unique string tags with length limits
- **date**: ISO 8601 date validation
- **integer**: Whole number validation
- **positiveInteger**: Positive whole number validation
- **percentage**: Number between 0 and 100
- **address**: Postal address validation (street, city, zip)
- **coordinates**: Latitude/longitude coordinate validation
- **timeRange**: Time range validation (start/end times)
- **pagination**: Pagination parameter validation (page, limit)
- **searchQuery**: Search query parameter validation
- **fileUpload**: File upload metadata validation (size, type)

---

### createSchema

Creates a new schema definition with validation and normalization.

```typescript
function createSchema(definition: object): object;
```

**Parameters:**

| Name         | Type     | Required | Description           |
| ------------ | -------- | -------- | --------------------- |
| `definition` | `Object` | Yes      | The schema definition |

**Returns:**

- The normalized schema object

**Throws:**

- `Error` - If schema definition is invalid

**Example:**

```javascript
// Basic schema creation
const userSchema = createSchema({
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 50,
    },
    email: commonSchemas.email,
    age: {
      type: 'number',
      minimum: 0,
      maximum: 120,
    },
    role: {
      type: 'string',
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
  },
  additionalProperties: false,
});

// Schema with nested objects
const profileSchema = createSchema({
  type: 'object',
  properties: {
    personal: {
      type: 'object',
      properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        birthDate: commonSchemas.date,
      },
      required: ['firstName', 'lastName'],
    },
    contact: {
      type: 'object',
      properties: {
        email: commonSchemas.email,
        phone: commonSchemas.phone,
      },
    },
  },
});

// Schema with array validation
const blogPostSchema = createSchema({
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 5, maxLength: 100 },
    content: { type: 'string', minLength: 50 },
    tags: {
      type: 'array',
      items: { type: 'string', slug: true },
      minItems: 1,
      maxItems: 10,
      unique: true,
    },
    publishDate: commonSchemas.date,
  },
});
```

---

### mergeSchemas

Merges multiple schemas into a single schema definition.

```typescript
function mergeSchemas(...schemas: object[]): object;
```

**Parameters:**

| Name      | Type       | Required | Description          |
| --------- | ---------- | -------- | -------------------- |
| `schemas` | `Object[]` | Yes      | The schemas to merge |

**Returns:**

- The merged schema object

**Throws:**

- `Error` - If schemas cannot be merged due to conflicts

**Example:**

```javascript
// Basic schema merging
const baseUserSchema = {
  type: 'object',
  properties: {
    id: commonSchemas.id,
    createdAt: commonSchemas.date,
  },
};

const userDetailsSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    email: commonSchemas.email,
  },
  required: ['name', 'email'],
};

const fullUserSchema = mergeSchemas(baseUserSchema, userDetailsSchema);
// Result: Combined schema with all properties and requirements

// Merging with overrides
const strictEmailSchema = {
  type: 'object',
  properties: {
    email: {
      ...commonSchemas.email,
      maxLength: 100,
    },
  },
};

const mergedSchema = mergeSchemas(userDetailsSchema, strictEmailSchema);
// Result: Email property has maxLength: 100 override

// Complex merging
const auditSchema = {
  type: 'object',
  properties: {
    createdBy: commonSchemas.id,
    updatedBy: commonSchemas.id,
    createdAt: commonSchemas.date,
    updatedAt: commonSchemas.date,
  },
};

const productSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
    category: { type: 'string', enum: ['electronics', 'clothing', 'books'] },
  },
  required: ['name', 'price'],
};

const auditedProductSchema = mergeSchemas(productSchema, auditSchema);
```

---

### extendSchema

Extends an existing schema with additional properties or rules.

```typescript
function extendSchema(baseSchema: object, extension: object): object;
```

**Parameters:**

| Name         | Type     | Required | Description               |
| ------------ | -------- | -------- | ------------------------- |
| `baseSchema` | `Object` | Yes      | The base schema to extend |
| `extension`  | `Object` | Yes      | The schema extension      |

**Returns:**

- The extended schema object

**Example:**

```javascript
// Basic schema extension
const baseSchema = {
  type: 'object',
  properties: {
    id: commonSchemas.id,
    name: { type: 'string', minLength: 1 },
  },
};

const extendedSchema = extendSchema(baseSchema, {
  properties: {
    email: commonSchemas.email,
    role: { type: 'string', enum: ['user', 'admin'] },
  },
  required: ['email'],
});

// Extending with validation rules
const userSchema = extendSchema(commonSchemas.email, {
  maxLength: 50,
  blacklistDomains: ['tempmail.com'],
});

// Extending nested schemas
const detailedProfileSchema = extendSchema(profileSchema, {
  properties: {
    preferences: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['light', 'dark'] },
        language: { type: 'string', minLength: 2, maxLength: 5 },
      },
    },
  },
});
```

---

## Error Handling

### ValidationError

A custom error class for validation errors with enhanced functionality.

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    errors: Array<{
      path: string;
      message: string;
      code: string;
      value: any;
      [key: string]: any;
    }>
  );

  getMessages(): string[];
  getFieldErrors(field: string): Array<ValidationErrorDetail>;
  hasFieldErrors(field: string): boolean;
  getErrorsByCode(code: string): Array<ValidationErrorDetail>;
  toJSON(): ValidationErrorSummary;
  toString(): string;
}
```

**Methods:**

- `getMessages()`: Returns an array of all error messages
- `getFieldErrors(field)`: Returns errors for a specific field path
- `hasFieldErrors(field)`: Checks if a field has validation errors
- `getErrorsByCode(code)`: Returns errors matching a specific error code
- `toJSON()`: Converts the error to a JSON-serializable object
- `toString()`: Returns a formatted string representation

**Example:**

```javascript
try {
  const result = validate(userData, userSchema, { strict: true });
  if (!result.valid) {
    throw new ValidationError('User validation failed', result.errors);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:');
    console.log('All messages:', error.getMessages());
    console.log('Email errors:', error.getFieldErrors('email'));
    console.log('Has name errors:', error.hasFieldErrors('name'));
    console.log('Format errors:', error.getErrorsByCode('INVALID_FORMAT'));

    // Send to client
    res.status(400).json(error.toJSON());
  }
}

// Example error structure
const exampleError = new ValidationError('Validation failed', [
  {
    path: 'email',
    message: 'Invalid email format',
    code: 'INVALID_FORMAT',
    value: 'invalid-email',
  },
  {
    path: 'age',
    message: 'Must be between 0 and 120',
    code: 'OUT_OF_RANGE',
    value: 150,
  },
]);
```

---

### isValid

Utility function to check if validation result is valid.

```typescript
function isValid(result: ValidationResult): boolean;
```

**Parameters:**

| Name     | Type               | Required | Description       |
| -------- | ------------------ | -------- | ----------------- |
| `result` | `ValidationResult` | Yes      | Validation result |

**Returns:**

- `boolean` - True if validation passed

**Example:**

```javascript
const result = validate(data, schema);

if (isValid(result)) {
  console.log('Data is valid');
} else {
  console.log('Validation failed');
}

// Equivalent to:
if (result.valid) {
  console.log('Data is valid');
}
```

---

### getValidationErrors

Extracts validation errors from result.

```typescript
function getValidationErrors(result: ValidationResult): ValidationErrorDetail[];
```

**Parameters:**

| Name     | Type               | Required | Description       |
| -------- | ------------------ | -------- | ----------------- |
| `result` | `ValidationResult` | Yes      | Validation result |

**Returns:**

- Array of validation error details

**Example:**

```javascript
const result = validate(data, schema);
const errors = getValidationErrors(result);

errors.forEach((error) => {
  console.log(`${error.path}: ${error.message}`);
});
```

---

## Validation Options

The following options can be passed to validation functions:

| Option         | Type      | Default | Description                                       |
| -------------- | --------- | ------- | ------------------------------------------------- |
| `abortEarly`   | `boolean` | `true`  | Stop validation on the first error                |
| `allowUnknown` | `boolean` | `true`  | Allow properties not defined in the schema        |
| `stripUnknown` | `boolean` | `false` | Remove undefined properties from the output       |
| `context`      | `Object`  | `{}`    | Additional context for validation functions       |
| `strict`       | `boolean` | `false` | Throw ValidationError instead of returning result |
| `timeout`      | `number`  | `5000`  | Timeout for async validations (milliseconds)      |

**Example:**

```javascript
const result = validate(data, schema, {
  abortEarly: false, // Collect all errors
  allowUnknown: false, // Reject unknown properties
  stripUnknown: true, // Remove unknown properties
  strict: false, // Return result instead of throwing
  context: {
    // Additional context
    userId: 123,
    userRole: 'admin',
  },
});
```

---

## Sanitization Rules

Comprehensive list of sanitization rules for different data types:

### String Rules

| Rule           | Type      | Description                              | Example                     |
| -------------- | --------- | ---------------------------------------- | --------------------------- | ------------------------ |
| `trim`         | `boolean` | Remove leading/trailing whitespace       | `{ trim: true }`            |
| `lowercase`    | `boolean` | Convert to lowercase                     | `{ lowercase: true }`       |
| `uppercase`    | `boolean` | Convert to uppercase                     | `{ uppercase: true }`       |
| `capitalize`   | `boolean` | Capitalize first letter                  | `{ capitalize: true }`      |
| `titleCase`    | `boolean` | Convert to title case                    | `{ titleCase: true }`       |
| `escape`       | `boolean` | Escape HTML entities                     | `{ escape: true }`          |
| `unescape`     | `boolean` | Unescape HTML entities                   | `{ unescape: true }`        |
| `stripTags`    | `boolean` | Remove HTML tags                         | `{ stripTags: true }`       |
| `truncate`     | `number`  | Limit string length                      | `{ truncate: 100 }`         |
| `slug`         | `boolean` | Create URL-friendly slug                 | `{ slug: true }`            |
| `alphanumeric` | `boolean` | Keep only alphanumeric characters        | `{ alphanumeric: true }`    |
| `alpha`        | `boolean` | Keep only alphabetic characters          | `{ alpha: true }`           |
| `numeric`      | `boolean` | Keep only numeric characters             | `{ numeric: true }`         |
| `email`        | `boolean` | Apply email normalization                | `{ email: true }`           |
| `url`          | `boolean` | Normalize URL format                     | `{ url: true }`             |
| `replace`      | `Object`  | Pattern replacement map                  | `{ replace: {'\\d': 'X'} }` |
| `remove`       | `string   | string[]`                                | Patterns to remove          | `{ remove: ['[^a-z]'] }` |
| `normalize`    | `boolean  | string`                                  | Unicode normalization       | `{ normalize: 'NFC' }`   |
| `whitespace`   | `string`  | Whitespace handling ('single', 'remove') | `{ whitespace: 'single' }`  |

### Number Rules

| Rule        | Type      | Description                       | Example              |
| ----------- | --------- | --------------------------------- | -------------------- |
| `default`   | `number`  | Default value for invalid numbers | `{ default: 0 }`     |
| `integer`   | `boolean` | Convert to integer                | `{ integer: true }`  |
| `round`     | `string`  | Rounding method ('ceil', 'floor') | `{ round: 'ceil' }`  |
| `min`       | `number`  | Minimum allowed value             | `{ min: 0 }`         |
| `max`       | `number`  | Maximum allowed value             | `{ max: 100 }`       |
| `clamp`     | `boolean` | Clamp values to min/max range     | `{ clamp: true }`    |
| `precision` | `number`  | Decimal places to keep            | `{ precision: 2 }`   |
| `positive`  | `boolean` | Ensure positive number            | `{ positive: true }` |
| `absolute`  | `boolean` | Use absolute value                | `{ absolute: true }` |
| `finite`    | `boolean` | Ensure finite number              | `{ finite: true }`   |

### Array Rules

| Rule       | Type       | Description                      | Example                            |
| ---------- | ---------- | -------------------------------- | ---------------------------------- | -------------------- |
| `compact`  | `boolean`  | Remove falsy values              | `{ compact: true }`                |
| `unique`   | `boolean`  | Remove duplicate items           | `{ unique: true }`                 |
| `uniqueBy` | `string    | Function`                        | Uniqueness check property/function | `{ uniqueBy: 'id' }` |
| `flatten`  | `boolean   | number`                          | Flatten nested arrays              | `{ flatten: 2 }`     |
| `items`    | `Object`   | Sanitization rules for each item | `{ items: { trim: true } }`        |
| `filter`   | `Function` | Filter function for items        | `{ filter: item => item > 0 }`     |
| `sort`     | `boolean   | Function`                        | Sort array items                   | `{ sort: true }`     |
| `reverse`  | `boolean`  | Reverse array order              | `{ reverse: true }`                |
| `limit`    | `number`   | Maximum array length             | `{ limit: 10 }`                    |
| `offset`   | `number`   | Skip items from beginning        | `{ offset: 2 }`                    |

### Object Rules

| Rule          | Type       | Description                      | Example                              |
| ------------- | ---------- | -------------------------------- | ------------------------------------ |
| `defaults`    | `Object`   | Default values to merge          | `{ defaults: { active: true } }`     |
| `pick`        | `string[]` | Properties to keep               | `{ pick: ['name', 'email'] }`        |
| `omit`        | `string[]` | Properties to remove             | `{ omit: ['password'] }`             |
| `rename`      | `Object`   | Property name mappings           | `{ rename: { oldName: 'newName' } }` |
| `properties`  | `Object`   | Sanitization rules per property  | `{ properties: { email: {...} } }`   |
| `removeEmpty` | `boolean`  | Remove null/undefined properties | `{ removeEmpty: true }`              |
| `mapKeys`     | `Function` | Transform property names         | `{ mapKeys: k => k.toLowerCase() }`  |
| `mapValues`   | `Function` | Transform property values        | `{ mapValues: v => v.toString() }`   |

---

## Schema Definitions

### Basic Schema Structure

```javascript
const schema = {
  type: 'object', // Data type
  required: ['field1', 'field2'], // Required fields
  properties: {
    // Property definitions
    field1: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    field2: {
      type: 'number',
      minimum: 0,
    },
  },
  additionalProperties: false, // Reject unknown properties
};
```

### Supported Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `array` - Array of items
- `object` - Object with properties
- `null` - Null values
- `integer` - Whole numbers
- `any` - Any type allowed

### Advanced Schema Features

```javascript
const advancedSchema = {
  type: 'object',
  properties: {
    // Conditional validation
    role: { type: 'string', enum: ['user', 'admin'] },
    permissions: {
      type: 'array',
      if: { properties: { role: { const: 'admin' } } },
      then: { minItems: 1 },
      else: { maxItems: 0 },
    },

    // Pattern properties
    patternProperties: {
      '^config_': { type: 'string' },
    },

    // Dependencies
    dependencies: {
      creditCard: {
        properties: {
          billingAddress: { type: 'string', required: true },
        },
      },
    },

    // Custom validators
    customField: {
      type: 'string',
      validator: (value, context) => {
        return (
          value.includes(context.requiredText) || 'Must contain required text'
        );
      },
      asyncValidator: async (value) => {
        const isUnique = await checkUniqueness(value);
        return isUnique || 'Value must be unique';
      },
    },
  },
};
```

---

## Security Considerations

1. **Input Sanitization**: Always sanitize user input before validation to
   prevent injection attacks
2. **HTML Content**: Use `sanitizeHtml()` for any user-generated HTML content
   with strict allowlists
3. **File Uploads**: Validate file types, sizes, and scan content before
   processing
4. **SQL Injection**: Sanitize input used in database queries, use parameterized
   queries
5. **XSS Prevention**: Escape output when rendering user content in HTML
   contexts
6. **Rate Limiting**: Implement rate limiting for validation endpoints to
   prevent DoS attacks
7. **Schema Validation**: Validate schemas themselves to prevent schema
   injection attacks
8. **Sensitive Data**: Never log or expose sensitive data in validation error
   messages
9. **Async Validation**: Set timeouts for async validators to prevent hanging
   requests
10. **Error Messages**: Provide generic error messages to avoid information
    disclosure

**Example Security Implementation:**

```javascript
// Secure validation pipeline
const secureValidator = createValidator(
  {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        maxLength: 10000, // Prevent large payloads
        sanitize: {
          stripTags: true,
          escape: true,
          whitespace: 'single',
        },
      },
    },
  },
  {
    strict: true,
    timeout: 2000, // Prevent long-running validations
    context: {
      sanitizeFirst: true,
    },
  }
);

// Usage with error handling
try {
  const cleanData = sanitize(userInput, securityRules);
  const result = secureValidator(cleanData);

  if (result.valid) {
    // Process validated data
    await processData(result.value);
  }
} catch (error) {
  // Log error without exposing sensitive details
  logger.warn('Validation failed', {
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    errorCode: error.code,
  });

  // Return generic error to client
  res.status(400).json({
    error: 'Invalid input provided',
  });
}
```

---

## Performance Tips

1. **Schema Caching**: Create validators once and reuse them for better
   performance
2. **Early Termination**: Use `abortEarly: true` for faster validation in
   production
3. **Selective Validation**: Only validate fields that have changed when
   possible
4. **Async Optimization**: Use `validateAsync()` only when necessary as it's
   slower
5. **Batch Processing**: Validate multiple items together rather than
   individually
6. **Memory Management**: Avoid creating large objects during validation
7. **Regex Optimization**: Use efficient regex patterns, avoid catastrophic
   backtracking
8. **Schema Compilation**: Pre-compile complex schemas for repeated use
9. **Parallel Validation**: Run independent async validations in parallel
10. **Monitoring**: Monitor validation performance and optimize bottlenecks

**Example Performance Optimization:**

```javascript
// Pre-compile validators
const validators = {
  user: createValidator(userSchema),
  product: createValidator(productSchema),
  order: createValidator(orderSchema),
};

// Batch validation
async function validateBatch(items, type) {
  const validator = validators[type];
  const results = [];

  // Process in chunks to manage memory
  const chunkSize = 100;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = chunk.map((item) => validator(item));
    results.push(...chunkResults);
  }

  return results;
}

// Parallel async validation
async function validateParallel(data, schemas) {
  const validationPromises = Object.entries(schemas).map(
    async ([key, schema]) => {
      const result = await validateAsync(data[key], schema);
      return { key, result };
    }
  );

  const results = await Promise.all(validationPromises);
  return results.reduce((acc, { key, result }) => {
    acc[key] = result;
    return acc;
  }, {});
}
```

---

## TypeScript Support

The module includes comprehensive TypeScript definitions:

```typescript
// Core interfaces
interface ValidationResult<T = any> {
  valid: boolean;
  errors: ValidationErrorDetail[];
  value: T;
}

interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
  context?: Record<string, any>;
  strict?: boolean;
  timeout?: number;
}

interface ValidationErrorDetail {
  path: string;
  message: string;
  code: string;
  value: any;
  [key: string]: any;
}

// Function type definitions
type ValidatorFunction<T = any> = (data: T) => ValidationResult<T>;
type AsyncValidatorFunction<T = any> = (
  data: T
) => Promise<ValidationResult<T>>;
type SanitizerFunction<T = any> = (data: T) => T;

// Schema type definitions
interface SchemaDefinition {
  type?: string;
  properties?: Record<string, SchemaDefinition>;
  required?: string[];
  items?: SchemaDefinition;
  additionalProperties?: boolean;
  [key: string]: any;
}

// Usage examples
const typedValidator: ValidatorFunction<User> = createValidator(userSchema);
const result: ValidationResult<User> = typedValidator(userData);

if (result.valid) {
  // result.value is typed as User
  console.log(result.value.email);
}
```

---

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
