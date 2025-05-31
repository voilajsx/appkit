# Validation Module API Reference

## Overview

The `@voilajsx/appkit/validation` module provides comprehensive data validation and sanitization utilities for Node.js applications, including schema-based validation, input sanitization, and built-in validators for common data types.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import {
  validate,
  sanitize,
  sanitizeString,
  sanitizeHtml,
  validateString,
  validateEmail,
  createValidator,
  createSanitizer,
} from '@voilajsx/appkit/validation';
```

## API Reference

### Core Functions

#### validate(data, schema, options)

Validates data against a schema definition.

##### Parameters

| Name                | Type     | Required | Default | Description                                                 |
| ------------------- | -------- | -------- | ------- | ----------------------------------------------------------- |
| `data`              | `*`      | Yes      | -       | The data to validate                                        |
| `schema`            | `Object` | Yes      | -       | Schema definition with validation rules                     |
| `options`           | `Object` | No       | `{}`    | Validation options                                          |
| `options.strict`    | `boolean`| No       | `false` | Enable strict validation mode                               |
| `options.abortEarly`| `boolean`| No       | `true`  | Stop on first validation error                              |

##### Returns

- `Object` - Validation result with `{ isValid: boolean, errors: Array, data: * }`

##### Throws

- `Error` - If schema is invalid or malformed
- `TypeError` - If arguments have incorrect types

##### Example

```javascript
const userSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    age: { type: 'number', minimum: 0, maximum: 120 }
  },
  required: ['email']
};

const result = validate({ email: 'user@example.com', age: 25 }, userSchema);
if (result.isValid) {
  console.log('Valid user data');
} else {
  console.error('Validation errors:', result.errors);
}
```

---

#### validateAsync(data, schema, options)

Asynchronously validates data with support for async validation rules.

##### Parameters

| Name                | Type     | Required | Default | Description                                                 |
| ------------------- | -------- | -------- | ------- | ----------------------------------------------------------- |
| `data`              | `*`      | Yes      | -       | The data to validate                                        |
| `schema`            | `Object` | Yes      | -       | Schema definition with validation rules                     |
| `options`           | `Object` | No       | `{}`    | Validation options                                          |

##### Returns

- `Promise<Object>` - Promise resolving to validation result

##### Example

```javascript
const schema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      asyncValidator: async (value) => {
        const exists = await checkUsernameExists(value);
        return !exists || 'Username already taken';
      }
    }
  }
};

const result = await validateAsync({ username: 'johndoe' }, schema);
```

---

### Sanitization Functions

#### sanitize(data, rules)

Sanitizes data based on rules or a transformation function.

##### Parameters

| Name    | Type                | Required | Description                           |
| ------- | ------------------- | -------- | ------------------------------------- |
| `data`  | `*`                 | Yes      | Data to sanitize                      |
| `rules` | `Object|Function`   | Yes      | Sanitization rules or transform function |

##### Returns

- `*` - Sanitized data

##### Example

```javascript
const sanitized = sanitize(
  { email: '  USER@EXAMPLE.COM  ', name: '<script>alert("xss")</script>' },
  {
    email: { trim: true, lowercase: true },
    name: { stripTags: true, escape: true }
  }
);
// Result: { email: 'user@example.com', name: 'alert("xss")' }
```

---

#### sanitizeString(input, rules)

Sanitizes string values with comprehensive cleaning options.

##### Parameters

| Name                    | Type      | Required | Default | Description                                        |
| ----------------------- | --------- | -------- | ------- | -------------------------------------------------- |
| `input`                 | `string`  | Yes      | -       | String to sanitize                                 |
| `rules`                 | `Object`  | No       | `{}`    | Sanitization rules                                 |
| `rules.trim`            | `boolean` | No       | `true`  | Remove leading/trailing whitespace                 |
| `rules.lowercase`       | `boolean` | No       | `false` | Convert to lowercase                               |
| `rules.uppercase`       | `boolean` | No       | `false` | Convert to uppercase                               |
| `rules.capitalize`      | `boolean` | No       | `false` | Capitalize first letter                            |
| `rules.titleCase`       | `boolean` | No       | `false` | Convert to title case                              |
| `rules.stripTags`       | `boolean` | No       | `false` | Remove HTML tags                                   |
| `rules.escape`          | `boolean` | No       | `false` | Escape HTML entities                               |
| `rules.truncate`        | `number`  | No       | -       | Maximum string length                              |
| `rules.slug`            | `boolean` | No       | `false` | Create URL-friendly slug                           |
| `rules.alphanumeric`    | `boolean` | No       | `false` | Keep only alphanumeric characters                  |

##### Returns

- `string` - Sanitized string

##### Example

```javascript
const clean = sanitizeString('  <h1>Hello World!</h1>  ', {
  trim: true,
  stripTags: true,
  capitalize: true
});
// Result: 'Hello world!'
```

---

#### sanitizeHtml(input, options)

Sanitizes HTML content to prevent XSS attacks while preserving safe formatting.

##### Parameters

| Name                        | Type       | Required | Default              | Description                                 |
| --------------------------- | ---------- | -------- | -------------------- | ------------------------------------------- |
| `input`                     | `string`   | Yes      | -                    | HTML content to sanitize                    |
| `options`                   | `Object`   | No       | `{}`                 | Sanitization options                        |
| `options.allowedTags`       | `string[]` | No       | `['p', 'br', 'b']`  | HTML tags to preserve                       |
| `options.allowedAttributes` | `Object`   | No       | `{}`                 | Allowed attributes per tag                  |
| `options.allowedSchemes`    | `string[]` | No       | `['http', 'https']` | Allowed URL schemes                         |
| `options.stripEmpty`        | `boolean`  | No       | `true`              | Remove empty tags                           |

##### Returns

- `string` - Sanitized HTML content

##### Example

```javascript
const safeHtml = sanitizeHtml(
  '<p onclick="alert(1)">Hello <script>alert("xss")</script> <b>World</b></p>',
  {
    allowedTags: ['p', 'b', 'i'],
    allowedAttributes: { a: ['href'] }
  }
);
// Result: '<p>Hello  <b>World</b></p>'
```

---

### Validation Functions

#### validateString(input, rules)

Validates string values against specified criteria.

##### Parameters

| Name                | Type       | Required | Default | Description                                   |
| ------------------- | ---------- | -------- | ------- | --------------------------------------------- |
| `input`             | `string`   | Yes      | -       | String to validate                            |
| `rules`             | `Object`   | No       | `{}`    | Validation rules                              |
| `rules.required`    | `boolean`  | No       | `false` | Field is required                             |
| `rules.minLength`   | `number`   | No       | -       | Minimum string length                         |
| `rules.maxLength`   | `number`   | No       | -       | Maximum string length                         |
| `rules.pattern`     | `RegExp`   | No       | -       | Pattern to match                              |
| `rules.enum`        | `string[]` | No       | -       | Allowed values                                |
| `rules.alphanumeric`| `boolean`  | No       | `false` | Allow only alphanumeric characters            |
| `rules.alpha`       | `boolean`  | No       | `false` | Allow only alphabetic characters              |
| `rules.numeric`     | `boolean`  | No       | `false` | Allow only numeric characters                 |

##### Returns

- `boolean` - True if valid, false otherwise

##### Example

```javascript
const isValid = validateString('user123', {
  minLength: 3,
  maxLength: 20,
  alphanumeric: true
});
// Result: true
```

---

#### validateNumber(input, rules)

Validates numeric values against specified criteria.

##### Parameters

| Name                | Type      | Required | Default | Description                                   |
| ------------------- | --------- | -------- | ------- | --------------------------------------------- |
| `input`             | `number`  | Yes      | -       | Number to validate                            |
| `rules`             | `Object`  | No       | `{}`    | Validation rules                              |
| `rules.min`         | `number`  | No       | -       | Minimum value                                 |
| `rules.max`         | `number`  | No       | -       | Maximum value                                 |
| `rules.integer`     | `boolean` | No       | `false` | Must be an integer                            |
| `rules.positive`    | `boolean` | No       | `false` | Must be positive                              |
| `rules.multipleOf`  | `number`  | No       | -       | Must be multiple of this value                |

##### Returns

- `boolean` - True if valid, false otherwise

##### Example

```javascript
const isValid = validateNumber(42, {
  min: 0,
  max: 100,
  integer: true
});
// Result: true
```

---

### Built-in Validators

#### validateEmail(email)

Validates email addresses using RFC 5322 standards.

##### Parameters

| Name    | Type     | Required | Description           |
| ------- | -------- | -------- | --------------------- |
| `email` | `string` | Yes      | Email to validate     |

##### Returns

- `boolean` - True if valid email format

##### Example

```javascript
validateEmail('user@example.com'); // true
validateEmail('invalid-email');    // false
```

---

#### validateUrl(url, options)

Validates URL format and optionally checks allowed protocols.

##### Parameters

| Name                  | Type       | Required | Default                  | Description                    |
| --------------------- | ---------- | -------- | ------------------------ | ------------------------------ |
| `url`                 | `string`   | Yes      | -                        | URL to validate                |
| `options`             | `Object`   | No       | `{}`                     | Validation options             |
| `options.protocols`   | `string[]` | No       | `['http', 'https']`      | Allowed protocols              |
| `options.requireTld`  | `boolean`  | No       | `true`                   | Require top-level domain       |

##### Returns

- `boolean` - True if valid URL format

##### Example

```javascript
validateUrl('https://example.com');           // true
validateUrl('ftp://files.example.com', {
  protocols: ['ftp', 'sftp']
});                                          // true
```

---

#### validatePhone(phone, options)

Validates phone numbers with support for international formats.

##### Parameters

| Name               | Type     | Required | Default | Description                           |
| ------------------ | -------- | -------- | ------- | ------------------------------------- |
| `phone`            | `string` | Yes      | -       | Phone number to validate              |
| `options`          | `Object` | No       | `{}`    | Validation options                    |
| `options.country`  | `string` | No       | -       | Country code for validation           |
| `options.format`   | `string` | No       | -       | Expected format ('e164', 'national')  |

##### Returns

- `boolean` - True if valid phone format

##### Example

```javascript
validatePhone('+1-555-123-4567');                    // true
validatePhone('555-123-4567', { country: 'US' });    // true
```

---

### Utility Functions

#### createValidator(schema, options)

Creates a reusable validator function for a specific schema.

##### Parameters

| Name      | Type     | Required | Default | Description                    |
| --------- | -------- | -------- | ------- | ------------------------------ |
| `schema`  | `Object` | Yes      | -       | Validation schema              |
| `options` | `Object` | No       | `{}`    | Default validation options     |

##### Returns

- `Function` - Validator function that accepts data and returns validation result

##### Example

```javascript
const validateUser = createValidator({
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
});

const result = validateUser({ name: 'John', email: 'john@example.com' });
```

---

#### createSanitizer(rules)

Creates a reusable sanitizer function for specific rules.

##### Parameters

| Name    | Type                | Required | Description                    |
| ------- | ------------------- | -------- | ------------------------------ |
| `rules` | `Object|Function`   | Yes      | Sanitization rules or function |

##### Returns

- `Function` - Sanitizer function that accepts data and returns sanitized result

##### Example

```javascript
const sanitizeUser = createSanitizer({
  email: { trim: true, lowercase: true },
  name: { trim: true, capitalize: true }
});

const clean = sanitizeUser({
  email: '  USER@EXAMPLE.COM  ',
  name: 'john doe'
});
// Result: { email: 'user@example.com', name: 'John doe' }
```

---

## Error Handling

All validation functions return structured error information when validation fails.

### Error Object Structure

```javascript
{
  isValid: false,
  errors: [
    {
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
      value: 'invalid-email'
    }
  ],
  data: { /* processed data */ }
}
```

### Common Error Codes

| Code               | Description                           |
| ------------------ | ------------------------------------- |
| `REQUIRED`         | Required field is missing             |
| `INVALID_TYPE`     | Value has incorrect type              |
| `INVALID_FORMAT`   | Value doesn't match expected format   |
| `OUT_OF_RANGE`     | Value outside allowed range           |
| `TOO_SHORT`        | String/array shorter than minimum     |
| `TOO_LONG`         | String/array longer than maximum      |
| `INVALID_ENUM`     | Value not in allowed enumeration      |

## Security Considerations

1. **Input Sanitization**: Always sanitize user input before validation to prevent injection attacks
2. **HTML Content**: Use `sanitizeHtml()` for any user-generated HTML content
3. **File Uploads**: Validate file types, sizes, and content before processing
4. **SQL Injection**: Sanitize input used in database queries
5. **XSS Prevention**: Escape output when rendering user content in HTML

## Performance Tips

1. **Schema Caching**: Create validators once and reuse them for better performance
2. **Early Termination**: Use `abortEarly: true` for faster validation in production
3. **Selective Validation**: Only validate fields that have changed when possible
4. **Async Validation**: Use `validateAsync()` only when necessary as it's slower
5. **Batch Processing**: Validate multiple items together rather than individually

## TypeScript Support

The module includes TypeScript definitions for better IDE support:

```typescript
interface ValidationResult<T = any> {
  isValid: boolean;
  errors: ValidationError[];
  data: T;
}

interface ValidationOptions {
  strict?: boolean;
  abortEarly?: boolean;
}
```

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>