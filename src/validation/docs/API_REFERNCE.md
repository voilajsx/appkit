# Validation Module API Reference

## Overview

The `@voilajsx/appkit/validation` module provides comprehensive data validation
and sanitization utilities for Node.js applications, including schema-based
validation, async validation support, built-in sanitizers, and essential
validator functions for common data types.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import {
  validate,
  validateAsync,
  createValidator,
  sanitize,
  sanitizeString,
  isEmail,
  commonSchemas,
} from '@voilajsx/appkit/validation';
```

## API Reference

### Core Validation Functions

#### validate(data, schema, options)

Validates data against a schema synchronously.

##### Parameters

| Name                 | Type      | Required | Default | Description                    |
| -------------------- | --------- | -------- | ------- | ------------------------------ |
| `data`               | `any`     | Yes      | -       | The data to validate           |
| `schema`             | `Object`  | Yes      | -       | Validation schema definition   |
| `options`            | `Object`  | No       | `{}`    | Validation options             |
| `options.abortEarly` | `boolean` | No       | `false` | Stop validation on first error |

##### Returns

- `Object` - Validation result with properties:
  - `valid` (boolean) - Whether validation passed
  - `errors` (Array) - Array of validation errors
  - `value` (any) - Processed/sanitized value

##### Throws

- `Error` - If validation encounters an exception

##### Example

```javascript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', required: true, minLength: 2 },
    age: { type: 'number', min: 0, max: 120 },
    email: { type: 'string', email: true },
  },
};

const result = validate(
  { name: 'John', age: 25, email: 'john@example.com' },
  schema
);

console.log(result.valid); // true
console.log(result.value); // { name: 'John', age: 25, email: 'john@example.com' }
```

---

#### validateAsync(data, schema, options)

Validates data against a schema asynchronously, supporting async custom
validators.

##### Parameters

| Name                 | Type      | Required | Default | Description                    |
| -------------------- | --------- | -------- | ------- | ------------------------------ |
| `data`               | `any`     | Yes      | -       | The data to validate           |
| `schema`             | `Object`  | Yes      | -       | Validation schema definition   |
| `options`            | `Object`  | No       | `{}`    | Validation options             |
| `options.abortEarly` | `boolean` | No       | `false` | Stop validation on first error |

##### Returns

- `Promise<Object>` - Promise resolving to validation result with same structure
  as `validate()`

##### Throws

- `Error` - If validation encounters an exception

##### Example

```javascript
const schema = {
  type: 'string',
  validateAsync: async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return value !== 'taken' ? true : 'Value is already taken';
  },
};

const result = await validateAsync('available', schema);
console.log(result.valid); // true
```

---

#### createValidator(schema, options)

Creates a reusable validator function with pre-configured schema and options.

##### Parameters

| Name      | Type     | Required | Default | Description                  |
| --------- | -------- | -------- | ------- | ---------------------------- |
| `schema`  | `Object` | Yes      | -       | Validation schema definition |
| `options` | `Object` | No       | `{}`    | Default validation options   |

##### Returns

- `Function` - Validator function that accepts (data, overrideOptions)

##### Throws

- `Error` - If schema is invalid

##### Example

```javascript
const emailValidator = createValidator({
  type: 'string',
  required: true,
  email: true,
});

const result = emailValidator('user@example.com');
console.log(result.valid); // true
```

---

#### createAsyncValidator(schema, options)

Creates a reusable async validator function with pre-configured schema and
options.

##### Parameters

| Name      | Type     | Required | Default | Description                  |
| --------- | -------- | -------- | ------- | ---------------------------- |
| `schema`  | `Object` | Yes      | -       | Validation schema definition |
| `options` | `Object` | No       | `{}`    | Default validation options   |

##### Returns

- `Function` - Async validator function that accepts (data, overrideOptions)

##### Throws

- `Error` - If schema is invalid

##### Example

```javascript
const usernameValidator = createAsyncValidator({
  type: 'string',
  alphanumeric: true,
  validateAsync: async (username) => {
    const taken = await checkUsernameAvailability(username);
    return taken ? 'Username is taken' : true;
  },
});

const result = await usernameValidator('john123');
```

---

### Built-in Validators

#### isEmail(value)

Validates email address format with RFC-compliant checks.

##### Parameters

| Name    | Type     | Required | Default | Description               |
| ------- | -------- | -------- | ------- | ------------------------- |
| `value` | `string` | Yes      | -       | Email address to validate |

##### Returns

- `boolean` - True if valid email format

##### Example

```javascript
console.log(isEmail('user@example.com')); // true
console.log(isEmail('invalid-email')); // false
```

---

#### isUrl(value)

Validates URL format, accepting only HTTP and HTTPS protocols.

##### Parameters

| Name    | Type     | Required | Default | Description     |
| ------- | -------- | -------- | ------- | --------------- |
| `value` | `string` | Yes      | -       | URL to validate |

##### Returns

- `boolean` - True if valid URL format

##### Example

```javascript
console.log(isUrl('https://example.com')); // true
console.log(isUrl('ftp://example.com')); // false
```

---

#### isAlphanumeric(value)

Validates that string contains only letters and numbers.

##### Parameters

| Name    | Type     | Required | Default | Description        |
| ------- | -------- | -------- | ------- | ------------------ |
| `value` | `string` | Yes      | -       | String to validate |

##### Returns

- `boolean` - True if alphanumeric

##### Example

```javascript
console.log(isAlphanumeric('abc123')); // true
console.log(isAlphanumeric('abc-123')); // false
```

---

### Sanitization Functions

#### sanitize(data, rules)

Automatically detects data type and applies appropriate sanitization rules.

##### Parameters

| Name    | Type    | Required  | Default | Description      |
| ------- | ------- | --------- | ------- | ---------------- | ------------------------------------- |
| `data`  | `any`   | Yes       | -       | Data to sanitize |
| `rules` | `Object | Function` | Yes     | -                | Sanitization rules or custom function |

##### Returns

- `any` - Sanitized data

##### Example

```javascript
const result = sanitize('  Hello World  ', {
  trim: true,
  uppercase: true,
});
console.log(result); // 'HELLO WORLD'
```

---

#### sanitizeString(input, rules)

Sanitizes string values with various transformation options.

##### Parameters

| Name              | Type      | Required | Default | Description                                   |
| ----------------- | --------- | -------- | ------- | --------------------------------------------- | ------------------------------------------ |
| `input`           | `string`  | Yes      | -       | String to sanitize                            |
| `rules`           | `Object`  | No       | `{}`    | Sanitization rules                            |
| `rules.trim`      | `boolean` | No       | `true`  | Remove leading/trailing whitespace            |
| `rules.lowercase` | `boolean` | No       | `false` | Convert to lowercase                          |
| `rules.uppercase` | `boolean` | No       | `false` | Convert to uppercase                          |
| `rules.truncate`  | `number   | boolean` | No      | `false`                                       | Truncate to specified length (255 if true) |
| `rules.replace`   | `Object`  | No       | `{}`    | Pattern replacements (regex patterns as keys) |
| `rules.remove`    | `string   | Array`   | No      | `[]`                                          | Patterns to remove                         |

##### Returns

- `string` - Sanitized string

##### Example

```javascript
const result = sanitizeString('  HELLO WORLD 123  ', {
  trim: true,
  lowercase: true,
  remove: '\\d+',
  replace: { world: 'universe' },
});
console.log(result); // 'hello universe '
```

---

#### sanitizeNumber(input, rules)

Sanitizes and converts values to numbers with constraint options.

##### Parameters

| Name              | Type      | Required | Default     | Description                     |
| ----------------- | --------- | -------- | ----------- | ------------------------------- |
| `input`           | `any`     | Yes      | -           | Value to sanitize               |
| `rules`           | `Object`  | No       | `{}`        | Sanitization rules              |
| `rules.default`   | `number`  | No       | `0`         | Default value for invalid input |
| `rules.integer`   | `boolean` | No       | `false`     | Convert to integer              |
| `rules.precision` | `number`  | No       | `undefined` | Round to decimal places         |
| `rules.min`       | `number`  | No       | `undefined` | Minimum allowed value           |
| `rules.max`       | `number`  | No       | `undefined` | Maximum allowed value           |
| `rules.clamp`     | `boolean` | No       | `false`     | Clamp to min/max bounds         |

##### Returns

- `number` - Sanitized number

##### Example

```javascript
const result = sanitizeNumber('"3.14159"', {
  precision: 2,
  min: 0,
  max: 5,
  clamp: true,
});
console.log(result); // 3.14
```

---

#### sanitizeObject(input, rules)

Sanitizes object properties with comprehensive transformation options.

##### Parameters

| Name                | Type      | Required | Default     | Description                                       |
| ------------------- | --------- | -------- | ----------- | ------------------------------------------------- |
| `input`             | `any`     | Yes      | -           | Value to sanitize (converted to object if needed) |
| `rules`             | `Object`  | No       | `{}`        | Sanitization rules                                |
| `rules.defaults`    | `Object`  | No       | `{}`        | Default property values                           |
| `rules.pick`        | `Array`   | No       | `undefined` | Properties to include                             |
| `rules.omit`        | `Array`   | No       | `undefined` | Properties to exclude                             |
| `rules.properties`  | `Object`  | No       | `{}`        | Per-property sanitization rules                   |
| `rules.removeEmpty` | `boolean` | No       | `false`     | Remove null/undefined/empty properties            |

##### Returns

- `Object` - Sanitized object

##### Example

```javascript
const result = sanitizeObject(
  { name: '  John  ', age: '25', password: 'secret' },
  {
    pick: ['name', 'age'],
    properties: {
      name: { trim: true, uppercase: true },
      age: { integer: true },
    },
  }
);
console.log(result); // { name: 'JOHN', age: 25 }
```

---

### Schema and Error Handling

#### commonSchemas

Pre-built validation schemas for common use cases.

##### Properties

| Schema     | Description     | Validation Rules                                            |
| ---------- | --------------- | ----------------------------------------------------------- |
| `email`    | Email address   | Required string, email format, max 254 chars                |
| `password` | Strong password | Required string, 8-128 chars, mixed case + number + special |
| `username` | Username        | Required alphanumeric string, 3-32 chars                    |
| `url`      | URL             | Required string, valid URL format, max 2048 chars           |
| `boolean`  | Boolean value   | Boolean type validation                                     |
| `integer`  | Integer number  | Number type with integer constraint                         |

##### Example

```javascript
import { commonSchemas, validate } from '@voilajsx/appkit/validation';

const result = validate('user@example.com', commonSchemas.email);
console.log(result.valid); // true
```

---

#### createValidationSchema(definition)

Creates a custom validation schema.

##### Parameters

| Name         | Type     | Required | Default | Description              |
| ------------ | -------- | -------- | ------- | ------------------------ |
| `definition` | `Object` | Yes      | -       | Schema definition object |

##### Returns

- `Object` - Schema object

##### Example

```javascript
const userSchema = createValidationSchema({
  type: 'object',
  properties: {
    name: { type: 'string', required: true },
    age: { type: 'number', min: 0 },
  },
});
```

---

#### ValidationError

Custom error class for validation failures.

##### Constructor

```javascript
new ValidationError(message, errors);
```

##### Parameters

| Name      | Type     | Required | Default | Description                       |
| --------- | -------- | -------- | ------- | --------------------------------- |
| `message` | `string` | Yes      | -       | Error message                     |
| `errors`  | `Array`  | No       | `[]`    | Array of validation error objects |

##### Methods

**getMessages()**

- Returns: `Array<string>` - Formatted error messages

**hasErrors()**

- Returns: `boolean` - Whether any errors exist

##### Example

```javascript
const error = new ValidationError('Validation failed', [
  { path: 'email', message: 'Invalid email', type: 'email' },
]);

console.log(error.getMessages()); // ['email: Invalid email']
console.log(error.hasErrors()); // true
```

---

### Utility Functions

#### utils.pipeline(...validators)

Creates a validation pipeline that chains multiple validators.

##### Parameters

| Name            | Type         | Required | Default | Description                  |
| --------------- | ------------ | -------- | ------- | ---------------------------- |
| `...validators` | `Function[]` | Yes      | -       | Validator functions to chain |

##### Returns

- `Function` - Combined async validator function

##### Example

```javascript
import { utils, createValidator } from '@voilajsx/appkit/validation';

const stringValidator = createValidator({ type: 'string', minLength: 3 });
const emailValidator = createValidator({ type: 'string', email: true });

const pipeline = utils.pipeline(stringValidator, emailValidator);

const result = await pipeline('user@example.com');
console.log(result.valid); // true
```

---

## Schema Definition Format

### Basic Schema Structure

```javascript
{
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'null' | 'undefined',
  required: boolean,
  default: any | Function,
  validate: Function,
  validateAsync: Function
}
```

### String Schema Options

```javascript
{
  type: 'string',
  minLength: number,
  maxLength: number,
  pattern: RegExp | string,
  trim: boolean,
  email: boolean,
  url: boolean,
  alphanumeric: boolean
}
```

### Number Schema Options

```javascript
{
  type: 'number',
  min: number,
  max: number,
  integer: boolean
}
```

### Object Schema Options

```javascript
{
  type: 'object',
  properties: {
    [key: string]: Schema
  }
}
```

---

## Error Handling

### Error Types

| Type           | Description                 | Thrown By               |
| -------------- | --------------------------- | ----------------------- |
| `required`     | Required field missing      | All validators          |
| `type`         | Type mismatch               | Type validation         |
| `minLength`    | String too short            | String validation       |
| `maxLength`    | String too long             | String validation       |
| `pattern`      | Pattern mismatch            | String validation       |
| `email`        | Invalid email format        | Email validation        |
| `url`          | Invalid URL format          | URL validation          |
| `alphanumeric` | Non-alphanumeric characters | Alphanumeric validation |
| `min`          | Number below minimum        | Number validation       |
| `max`          | Number above maximum        | Number validation       |
| `integer`      | Non-integer number          | Integer validation      |
| `custom`       | Custom validation failure   | Custom validators       |
| `asyncCustom`  | Async validation failure    | Async custom validators |
| `exception`    | Validation exception        | Any validator           |
| `pipeline`     | Pipeline execution error    | Pipeline utility        |

### Error Object Structure

```javascript
{
  path: string,        // Field path (e.g., 'user.email')
  message: string,     // Error message
  type: string,        // Error type
  value: any          // Original value that failed
}
```

---

## Common Validation Patterns

### User Registration

```javascript
const userRegistrationSchema = {
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    age: { type: 'number', min: 13, max: 120 },
    terms: {
      type: 'boolean',
      validate: (v) => (v === true ? true : 'Must accept terms'),
    },
  },
};
```

### API Query Parameters

```javascript
const querySchema = {
  type: 'object',
  properties: {
    page: { type: 'number', min: 1, default: 1 },
    limit: { type: 'number', min: 1, max: 100, default: 10 },
    search: { type: 'string', maxLength: 100, trim: true },
    sort: { type: 'string', pattern: /^[a-zA-Z_]+$/ },
  },
};
```

### Form Input Sanitization

```javascript
const sanitizeFormData = (data) =>
  sanitizeObject(data, {
    properties: {
      name: { trim: true, truncate: 50 },
      email: { trim: true, lowercase: true },
      phone: { remove: '[^0-9+\\-\\s()]' },
      age: { integer: true, min: 0, max: 150, clamp: true },
    },
    removeEmpty: true,
  });
```

---

## Security Considerations

1. **Input Validation**: Always validate user input before processing
2. **Sanitization**: Sanitize data to prevent injection attacks
3. **Type Safety**: Use strict type validation for security-critical fields
4. **Length Limits**: Set reasonable length limits to prevent DoS attacks
5. **Pattern Matching**: Use regex patterns for format validation
6. **Error Messages**: Don't expose sensitive information in error messages

## Performance Tips

1. **Reuse Validators**: Create validators once and reuse them
2. **Abort Early**: Use `abortEarly: true` for performance-critical validations
3. **Schema Caching**: Cache complex schemas to avoid recreation
4. **Pipeline Optimization**: Order validators by performance (fast first)
5. **Async Sparingly**: Use async validation only when necessary

## TypeScript Support

While this module is written in JavaScript, it includes comprehensive JSDoc
comments for IDE support. TypeScript users can create declaration files:

```typescript
interface ValidationResult<T = any> {
  valid: boolean;
  errors: ValidationError[];
  value: T;
}

interface Schema {
  type?: string | string[];
  required?: boolean;
  default?: any | (() => any);
  validate?: (value: any) => boolean | string;
  validateAsync?: (value: any) => Promise<boolean | string>;
}
```

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
