@voilajsx/appkit - Validation Module API Reference

Note: Implementation is in JavaScript. TypeScript signatures are provided for
clarity.

This document provides a detailed API reference for the Validation module of
@voilajsx/appkit, which offers schema-based data validation and sanitization for
Node.js applications. All functions are designed to be framework-agnostic and
follow modern JavaScript practices (ESM, async/await, etc.). Table of Contents

Installation Core Validation Functions validate validateAsync createValidator

Sanitization Functions sanitize sanitizeHtml createSanitizer

Schema Functions commonSchemas createSchema mergeSchemas extendSchema

Error Handling ValidationError

Common Schemas Validation Options Sanitization Rules

Installation npm install @voilajsx/appkit

Import the validation module: import { validate, validateAsync, createValidator,
sanitize, sanitizeHtml, createSanitizer, commonSchemas, createSchema,
mergeSchemas, extendSchema, } from '@voilajsx/appkit/validation';

Core Validation Functions validate Validates data against a schema
synchronously. function validate<T = any>( data: T, schema: object, options?: {
abortEarly?: boolean; allowUnknown?: boolean; stripUnknown?: boolean; } ): {
valid: boolean; errors: Array<{ path: string; message: string; [key: string]:
any; }>; value: T; };

Parameters:

data (\*): The data to validate. schema (Object): The validation schema. options
(Object, optional): abortEarly (boolean): Stop validation on the first error
(default: true). allowUnknown (boolean): Allow properties not defined in the
schema (default: true). stripUnknown (boolean): Remove properties not defined in
the schema from the output (default: false).

Returns:

An object with: valid (boolean): Whether the data is valid. errors (Array): List
of validation errors (empty if valid). value (any): The processed (potentially
transformed) data.

Example: const schema = { type: 'object', required: ['email'], properties: {
email: { type: 'string', email: true }, }, }; const result = validate({ email:
'user@example.com' }, schema); if (!result.valid) {
console.error(result.errors); }

validateAsync Validates data against a schema asynchronously, supporting async
validators. async function validateAsync<T = any>( data: T, schema: object,
options?: { abortEarly?: boolean; allowUnknown?: boolean; stripUnknown?:
boolean; } ): Promise<{ valid: boolean; errors: Array<{ path: string; message:
string; [key: string]: any; }>; value: T; }>;

Parameters:

Same as validate.

Returns:

A Promise resolving to the same object structure as validate.

Example: const schema = { type: 'object', properties: { email: { type: 'string',
email: true, validateAsync: async (value) => { const exists = await
checkEmailExists(value); return exists ? 'Email already exists' : true; }, }, },
}; const result = await validateAsync({ email: 'user@example.com' }, schema);

createValidator Creates a reusable validator function for a specific schema.
function createValidator<T = any>( schema: object, options?: { abortEarly?:
boolean; allowUnknown?: boolean; stripUnknown?: boolean; } ): (data: T) => {
valid: boolean; errors: Array<{ path: string; message: string; [key: string]:
any; }>; value: T; };

Parameters:

schema (Object): The validation schema. options (Object, optional): Default
validation options (same as validate).

Returns:

A function that validates data against the schema, returning the same object
structure as validate.

Example: const userValidator = createValidator({ type: 'object', properties: {
name: { type: 'string', minLength: 1 }, }, }); const result = userValidator({
name: 'Alice' });

Sanitization Functions sanitize Sanitizes data based on provided rules. function
sanitize<T = any>( data: T, rules: object | ((data: T) => T) ): T;

Parameters:

data (\*): The data to sanitize. rules (Object | Function): Sanitization rules
or a function to transform the data. Object format: Keys are property paths,
values are sanitization rules (see Sanitization Rules). Function format: A
custom transformation function.

Returns:

The sanitized data.

Example: const sanitized = sanitize( { email: ' User@Example.com ', name:
'<script>' }, { email: { trim: true, lowercase: true }, name: { trim: true,
escape: true }, } );

sanitizeHtml Sanitizes HTML content to prevent XSS attacks. function
sanitizeHtml( input: string, options?: { allowedTags?: string[];
allowedAttributes?: { [tag: string]: string[] }; allowedSchemes?: string[]; } ):
string;

Parameters:

input (string): The HTML content to sanitize. options (Object, optional):
allowedTags (Array): HTML tags to allow (default: basic tags like p, strong).
allowedAttributes (Object): Attributes allowed per tag (e.g., { a: ['href'] }).
allowedSchemes (Array): Allowed URL schemes (e.g., ['http', 'https']).

Returns:

The sanitized HTML string.

Example: const safeHtml = sanitizeHtml('<p onclick="alert()">Text</p>', {
allowedTags: ['p'], allowedAttributes: {}, });

createSanitizer Creates a reusable sanitizer function for specific rules.
function createSanitizer<T = any>( rules: object | ((data: T) => T) ): (data: T)
=> T;

Parameters:

rules (Object | Function): Sanitization rules or transformation function (same
as sanitize).

Returns:

A function that sanitizes data according to the rules.

Example: const userSanitizer = createSanitizer({ email: { trim: true, lowercase:
true }, name: { trim: true, escape: true }, }); const sanitized =
userSanitizer({ email: ' User@Example.com ', name: '<script>' });

Schema Functions commonSchemas An object containing predefined schemas for
common data types. const commonSchemas: { email: object; password: object;
username: object; phone: object; url: object; id: object; uuid: object; slug:
object; tags: object; date: object; integer: object; positiveInteger: object;
percentage: object; address: object; coordinates: object; timeRange: object;
pagination: object; searchQuery: object; fileUpload: object; };

Usage: const schema = { type: 'object', properties: { email:
commonSchemas.email, password: commonSchemas.password, }, };

createSchema Creates a new schema definition. function createSchema(definition:
object): object;

Parameters:

definition (Object): The schema definition.

Returns:

The schema object.

Example: const userSchema = createSchema({ type: 'object', required: ['name'],
properties: { name: { type: 'string', minLength: 1 }, }, });

mergeSchemas Merges multiple schemas into a single schema. function
mergeSchemas(...schemas: object[]): object;

Parameters:

...schemas (Object[]): The schemas to merge.

Returns:

The merged schema object.

Example: const baseSchema = { properties: { id: commonSchemas.id } }; const
extraSchema = { properties: { name: { type: 'string' } } }; const merged =
mergeSchemas(baseSchema, extraSchema);

extendSchema Extends an existing schema with additional properties or rules.
function extendSchema(baseSchema: object, extension: object): object;

Parameters:

baseSchema (Object): The base schema to extend. extension (Object): The schema
extension.

Returns:

The extended schema object.

Example: const baseSchema = { type: 'object', properties: { id: commonSchemas.id
}, }; const extended = extendSchema(baseSchema, { properties: { role: { type:
'string' } }, required: ['role'], });

Error Handling ValidationError A custom error class for validation errors. class
ValidationError extends Error { constructor(message: string, errors: Array<{
path: string; message: string; [key: string]: any; }>); getMessages(): string[];
getFieldErrors(field: string): Array<{ path: string; message: string; [key:
string]: any; }>; hasFieldErrors(field: string): boolean; toJSON(): { message:
string; errors: Array<{ path: string; message: string; [key: string]: any; }>;
}; }

Methods:

getMessages(): Returns an array of error messages. getFieldErrors(field):
Returns errors for a specific field. hasFieldErrors(field): Checks if a field
has errors. toJSON(): Converts the error to a JSON-serializable object.

Example: try { const result = validate(data, schema); if (!result.valid) { throw
new ValidationError('Validation failed', result.errors); } } catch (error) { if
(error instanceof ValidationError) { console.error(error.getMessages()); } }

Common Schemas List The commonSchemas object includes predefined schemas for:

email: Validates email addresses (e.g., RFC 5322 compliant). password: Enforces
password strength (e.g., min length, character types). username: Validates
usernames (e.g., alphanumeric, length constraints). phone: Validates phone
numbers (e.g., E.164 format). url: Validates URLs (e.g., HTTP/HTTPS schemes).
id: Validates generic IDs (e.g., positive integers). uuid: Validates UUIDs
(e.g., version 4). slug: Validates URL slugs (e.g., lowercase, hyphens). tags:
Validates arrays of strings (e.g., unique, max length). date: Validates ISO 8601
dates. integer: Validates whole numbers. positiveInteger: Validates positive
whole numbers. percentage: Validates numbers between 0 and 100. address:
Validates postal addresses (e.g., street, city, zip). coordinates: Validates
latitude/longitude pairs. timeRange: Validates time ranges (e.g., start/end
times). pagination: Validates pagination parameters (e.g., page, limit).
searchQuery: Validates search query parameters. fileUpload: Validates file
upload metadata (e.g., size, type).

Example Usage: const schema = { type: 'object', properties: { email:
commonSchemas.email, tags: commonSchemas.tags, }, };

Validation Options The following options can be passed to validate,
validateAsync, or createValidator:

Option Type Default Description

abortEarly boolean true Stop validation on the first error.

allowUnknown boolean true Allow properties not defined in the schema.

stripUnknown boolean false Remove undefined properties from the output.

Example: const result = validate(data, schema, { abortEarly: false, // Collect
all errors allowUnknown: false, // Reject unknown properties stripUnknown: true,
// Remove unknown properties });

Sanitization Rules The following rules can be used with sanitize or
createSanitizer:

Rule Type Description Example

trim boolean Removes leading/trailing whitespace. { trim: true }

lowercase boolean Converts to lowercase. { lowercase: true }

uppercase boolean Converts to uppercase. { uppercase: true }

escape boolean Escapes HTML characters. { escape: true }

truncate number Limits string length. { truncate: 100 }

unique boolean Removes duplicate array items. { unique: true }

array boolean Ensures the value is an array. { array: true }

limit number Limits array length. { limit: 10 }

alphanumeric boolean Allows only alphanumeric characters. { alphanumeric: true }

email boolean Normalizes email format. { email: true }

compact boolean Removes falsy values from arrays. { compact: true }

Example: const rules = { email: { trim: true, lowercase: true, email: true },
tags: { array: true, unique: true, limit: 5 }, }; const sanitized =
sanitize(data, rules);

Code Generation Guidelines When generating code for the Validation module (e.g.,
using LLMs), follow these guidelines:

Adhere to Code Style:

Use ESM imports, single quotes, 2-space indentation, semicolons. Include JSDoc
comments for all functions. Prefer async/await over callbacks or raw promises.

JSDoc Format: /\*\*

- Function description
- @param {Type} paramName - Parameter description
- @returns {ReturnType} Return value description
- @throws {Error} Error conditions \*/

Error Handling:

Use try/catch for async functions. Validate parameters before use. Throw
descriptive error messages.

Framework Agnostic:

Ensure code works with any Node.js framework. Avoid dependencies on specific
frameworks like Express.

For detailed LLM prompts, refer to PROMPT_REFERENCE.md. Support For issues and
feature requests, visit our GitHub repository.

Built with ❤️ in India by the VoilaJSX Team — powering modern web development.

# @voilajsx/appkit - Validation Module API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are provided
> for clarity.

This document provides a detailed API reference for the Validation module of
`@voilajsx/appkit`, which offers schema-based data validation and sanitization
for Node.js applications. All functions are designed to be framework-agnostic
and follow modern JavaScript practices (ESM, async/await, etc.).

## Table of Contents

- [Installation](#installation)
- [Core Validation Functions](#core-validation-functions)
  - [validate](#validate)
  - [validateAsync](#validateasync)
  - [createValidator](#createvalidator)
- [Sanitization Functions](#sanitization-functions)
  - [sanitize](#sanitize)
  - [sanitizeHtml](#sanitizehtml)
  - [createSanitizer](#createsanitizer)
- [Schema Functions](#schema-functions)
  - [commonSchemas](#commonschemas)
  - [createSchema](#createschema)
  - [mergeSchemas](#mergeschemas)
  - [extendSchema](#extendschema)
- [Error Handling](#error-handling)
  - [ValidationError](#validationerror)
- [Common Schemas](#common-schemas-list)
- [Validation Options](#validation-options)
- [Sanitization Rules](#sanitization-rules)

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
  sanitizeHtml,
  createSanitizer,
  commonSchemas,
  createSchema,
  mergeSchemas,
  extendSchema,
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
  }
): {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    [key: string]: any;
  }>;
  value: T;
};
```

**Parameters:**

- `data` (\*): The data to validate.
- `schema` (Object): The validation schema.
- `options` (Object, optional):
  - `abortEarly` (boolean): Stop validation on the first error (default:
    `true`).
  - `allowUnknown` (boolean): Allow properties not defined in the schema
    (default: `true`).
  - `stripUnknown` (boolean): Remove properties not defined in the schema from
    the output (default: `false`).

**Returns:**

- An object with:
  - `valid` (boolean): Whether the data is valid.
  - `errors` (Array): List of validation errors (empty if valid).
  - `value` (any): The processed (potentially transformed) data.

**Example:**

```javascript
const schema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', email: true },
  },
};
const result = validate({ email: 'user@example.com' }, schema);
if (!result.valid) {
  console.error(result.errors);
}
```

### validateAsync

Validates data against a schema asynchronously, supporting async validators.

```typescript
async function validateAsync<T = any>(
  data: T,
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
  }
): Promise<{
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    [key: string]: any;
  }>;
  value: T;
}>;
```

**Parameters:**

- Same as `validate`.

**Returns:**

- A Promise resolving to the same object structure as `validate`.

**Example:**

```javascript
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      email: true,
      validateAsync: async (value) => {
        const exists = await checkEmailExists(value);
        return exists ? 'Email already exists' : true;
      },
    },
  },
};
const result = await validateAsync({ email: 'user@example.com' }, schema);
```

### createValidator

Creates a reusable validator function for a specific schema.

```typescript
function createValidator<T = any>(
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
  }
): (data: T) => {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    [key: string]: any;
  }>;
  value: T;
};
```

**Parameters:**

- `schema` (Object): The validation schema.
- `options` (Object, optional): Default validation options (same as `validate`).

**Returns:**

- A function that validates data against the schema, returning the same object
  structure as `validate`.

**Example:**

```javascript
const userValidator = createValidator({
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
  },
});
const result = userValidator({ name: 'Alice' });
```

## Sanitization Functions

### sanitize

Sanitizes data based on provided rules.

```typescript
function sanitize<T = any>(data: T, rules: object | ((data: T) => T)): T;
```

**Parameters:**

- `data` (\*): The data to sanitize.
- `rules` (Object | Function): Sanitization rules or a function to transform the
  data.
  - Object format: Keys are property paths, values are sanitization rules (see
    [Sanitization Rules](#sanitization-rules)).
  - Function format: A custom transformation function.

**Returns:**

- The sanitized data.

**Example:**

```javascript
const sanitized = sanitize(
  { email: '  User@Example.com  ', name: '<script>' },
  {
    email: { trim: true, lowercase: true },
    name: { trim: true, escape: true },
  }
);
```

### sanitizeHtml

Sanitizes HTML content to prevent XSS attacks.

```typescript
function sanitizeHtml(
  input: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: { [tag: string]: string[] };
    allowedSchemes?: string[];
  }
): string;
```

**Parameters:**

- `input` (string): The HTML content to sanitize.
- `options` (Object, optional):
  - `allowedTags` (Array): HTML tags to allow (default: basic tags like `p`,
    `strong`).
  - `allowedAttributes` (Object): Attributes allowed per tag (e.g.,
    `{ a: ['href'] }`).
  - `allowedSchemes` (Array): Allowed URL schemes (e.g., `['http', 'https']`).

**Returns:**

- The sanitized HTML string.

**Example:**

```javascript
const safeHtml = sanitizeHtml('<p onclick="alert()">Text</p>', {
  allowedTags: ['p'],
  allowedAttributes: {},
});
```

### createSanitizer

Creates a reusable sanitizer function for specific rules.

```typescript
function createSanitizer<T = any>(
  rules: object | ((data: T) => T)
): (data: T) => T;
```

**Parameters:**

- `rules` (Object | Function): Sanitization rules or transformation function
  (same as `sanitize`).

**Returns:**

- A function that sanitizes data according to the rules.

**Example:**

```javascript
const userSanitizer = createSanitizer({
  email: { trim: true, lowercase: true },
  name: { trim: true, escape: true },
});
const sanitized = userSanitizer({
  email: '  User@Example.com  ',
  name: '<script>',
});
```

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
};
```

**Usage:**

```javascript
const schema = {
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
  },
};
```

### createSchema

Creates a new schema definition.

```typescript
function createSchema(definition: object): object;
```

**Parameters:**

- `definition` (Object): The schema definition.

**Returns:**

- The schema object.

**Example:**

```javascript
const userSchema = createSchema({
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 },
  },
});
```

### mergeSchemas

Merges multiple schemas into a single schema.

```typescript
function mergeSchemas(...schemas: object[]): object;
```

**Parameters:**

- `...schemas` (Object[]): The schemas to merge.

**Returns:**

- The merged schema object.

**Example:**

```javascript
const baseSchema = { properties: { id: commonSchemas.id } };
const extraSchema = { properties: { name: { type: 'string' } } };
const merged = mergeSchemas(baseSchema, extraSchema);
```

### extendSchema

Extends an existing schema with additional properties or rules.

```typescript
function extendSchema(baseSchema: object, extension: object): object;
```

**Parameters:**

- `baseSchema` (Object): The base schema to extend.
- `extension` (Object): The schema extension.

**Returns:**

- The extended schema object.

**Example:**

```javascript
const baseSchema = {
  type: 'object',
  properties: { id: commonSchemas.id },
};
const extended = extendSchema(baseSchema, {
  properties: { role: { type: 'string' } },
  required: ['role'],
});
```

## Error Handling

### ValidationError

A custom error class for validation errors.

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    errors: Array<{
      path: string;
      message: string;
      [key: string]: any;
    }>
  );
  getMessages(): string[];
  getFieldErrors(field: string): Array<{
    path: string;
    message: string;
    [key: string]: any;
  }>;
  hasFieldErrors(field: string): boolean;
  toJSON(): {
    message: string;
    errors: Array<{
      path: string;
      message: string;
      [key: string]: any;
    }>;
  };
}
```

**Methods:**

- `getMessages()`: Returns an array of error messages.
- `getFieldErrors(field)`: Returns errors for a specific field.
- `hasFieldErrors(field)`: Checks if a field has errors.
- `toJSON()`: Converts the error to a JSON-serializable object.

**Example:**

```javascript
try {
  const result = validate(data, schema);
  if (!result.valid) {
    throw new ValidationError('Validation failed', result.errors);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.getMessages());
  }
}
```

## Common Schemas List

The `commonSchemas` object includes predefined schemas for:

- `email`: Validates email addresses (e.g., RFC 5322 compliant).
- `password`: Enforces password strength (e.g., min length, character types).
- `username`: Validates usernames (e.g., alphanumeric, length constraints).
- `phone`: Validates phone numbers (e.g., E.164 format).
- `url`: Validates URLs (e.g., HTTP/HTTPS schemes).
- `id`: Validates generic IDs (e.g., positive integers).
- `uuid`: Validates UUIDs (e.g., version 4).
- `slug`: Validates URL slugs (e.g., lowercase, hyphens).
- `tags`: Validates arrays of strings (e.g., unique, max length).
- `date`: Validates ISO 8601 dates.
- `integer`: Validates whole numbers.
- `positiveInteger`: Validates positive whole numbers.
- `percentage`: Validates numbers between 0 and 100.
- `address`: Validates postal addresses (e.g., street, city, zip).
- `coordinates`: Validates latitude/longitude pairs.
- `timeRange`: Validates time ranges (e.g., start/end times).
- `pagination`: Validates pagination parameters (e.g., page, limit).
- `searchQuery`: Validates search query parameters.
- `fileUpload`: Validates file upload metadata (e.g., size, type).

**Example Usage:**

```javascript
const schema = {
  type: 'object',
  properties: {
    email: commonSchemas.email,
    tags: commonSchemas.tags,
  },
};
```

## Validation Options

The following options can be passed to `validate`, `validateAsync`, or
`createValidator`:

| Option         | Type    | Default | Description                                  |
| -------------- | ------- | ------- | -------------------------------------------- |
| `abortEarly`   | boolean | `true`  | Stop validation on the first error.          |
| `allowUnknown` | boolean | `true`  | Allow properties not defined in the schema.  |
| `stripUnknown` | boolean | `false` | Remove undefined properties from the output. |

**Example:**

```javascript
const result = validate(data, schema, {
  abortEarly: false, // Collect all errors
  allowUnknown: false, // Reject unknown properties
  stripUnknown: true, // Remove unknown properties
});
```

## Sanitization Rules

The following rules can be used with `sanitize` or `createSanitizer`:

| Rule           | Type    | Description                          | Example                  |
| -------------- | ------- | ------------------------------------ | ------------------------ |
| `trim`         | boolean | Removes leading/trailing whitespace. | `{ trim: true }`         |
| `lowercase`    | boolean | Converts to lowercase.               | `{ lowercase: true }`    |
| `uppercase`    | boolean | Converts to uppercase.               | `{ uppercase: true }`    |
| `escape`       | boolean | Escapes HTML characters.             | `{ escape: true }`       |
| `truncate`     | number  | Limits string length.                | `{ truncate: 100 }`      |
| `unique`       | boolean | Removes duplicate array items.       | `{ unique: true }`       |
| `array`        | boolean | Ensures the value is an array.       | `{ array: true }`        |
| `limit`        | number  | Limits array length.                 | `{ limit: 10 }`          |
| `alphanumeric` | boolean | Allows only alphanumeric characters. | `{ alphanumeric: true }` |
| `email`        | boolean | Normalizes email format.             | `{ email: true }`        |
| `compact`      | boolean | Removes falsy values from arrays.    | `{ compact: true }`      |

**Example:**

```javascript
const rules = {
  email: { trim: true, lowercase: true, email: true },
  tags: { array: true, unique: true, limit: 5 },
};
const sanitized = sanitize(data, rules);
```

## Code Generation Guidelines

When generating code for the Validation module (e.g., using LLMs), follow these
guidelines:

1. **Adhere to Code Style**:

   - Use ESM imports, single quotes, 2-space indentation, semicolons.
   - Include JSDoc comments for all functions.
   - Prefer async/await over callbacks or raw promises.

2. **JSDoc Format**:

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch for async functions.
   - Validate parameters before use.
   - Throw descriptive error messages.

4. **Framework Agnostic**:
   - Ensure code works with any Node.js framework.
   - Avoid dependencies on specific frameworks like Express.

For detailed LLM prompts, refer to
[PROMPT_REFERENCE.md](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/PROMPT_REFERENCE.md).

## Support

For issues and feature requests, visit our
[GitHub repository](https://github.com/voilajsx/appkit).

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
