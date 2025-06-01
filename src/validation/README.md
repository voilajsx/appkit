# @voilajsx/appkit - Validation Module ✅

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-minimal, essential data validation and sanitization utilities for
> Node.js applications

The Validation module of `@voilajsx/appkit` provides core data validation and
sanitization capabilities with a focus on simplicity and essential
functionality.

## Module Overview

A minimal validation framework that covers the most common use cases:

| Feature                  | What it does                             | Main functions                   |
| ------------------------ | ---------------------------------------- | -------------------------------- |
| **Core Validation**      | Validate data against schemas            | `validate()`, `validateAsync()`  |
| **Data Sanitization**    | Clean and normalize input data           | `sanitize()`, `sanitizeString()` |
| **Essential Validators** | Validate common formats                  | `isEmail()`, `isUrl()`           |
| **Basic Schemas**        | Ready-to-use schemas for common patterns | `email`, `password`, `username`  |

## 🚀 Features

- **📋 Core Validation** - Essential validation with sync/async support
- **🧹 Data Sanitization** - Basic cleaning and normalization
- **🔍 Essential Validators** - Email, URL, and alphanumeric validation
- **📦 Common Schemas** - 6 essential schemas for typical needs
- **⚡ Async Support** - Full async validation support
- **🎯 Minimal & Focused** - Only essential functionality, no bloat

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import {
  validate,
  sanitize,
  isEmail,
  commonSchemas,
} from '@voilajsx/appkit/validation';

// Quick email validation
const isValidEmail = isEmail('user@example.com'); // true

// Sanitize user input
const cleanData = sanitize('  Hello World!  ', { trim: true, lowercase: true });

// Validate against a schema
const result = validate(userData, commonSchemas.email);
if (result.valid) {
  console.log('Valid email:', result.value);
} else {
  console.log('Validation errors:', result.errors);
}
```

## 📖 Core Functions

### Schema Validation

Essential validation functions for data integrity:

| Function                 | Purpose                              | When to use                    |
| ------------------------ | ------------------------------------ | ------------------------------ |
| `validate()`             | Validates data against a schema      | Basic validation needs         |
| `validateAsync()`        | Asynchronous validation              | Database checks, external APIs |
| `createValidator()`      | Creates reusable validator functions | Repetitive validation patterns |
| `createAsyncValidator()` | Creates reusable async validators    | Async validation patterns      |

```javascript
// Basic validation
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', required: true, minLength: 2 },
    email: { type: 'string', required: true, email: true },
    age: { type: 'number', min: 18, max: 120 },
  },
};

const result = validate(userData, schema);
if (!result.valid) {
  console.log('Errors:', result.errors);
}

// Async validation
const asyncResult = await validateAsync(userData, {
  ...schema,
  properties: {
    ...schema.properties,
    username: {
      type: 'string',
      required: true,
      validateAsync: async (value) => {
        const exists = await checkUsernameExists(value);
        return exists ? 'Username already taken' : true;
      },
    },
  },
});
```

### Data Sanitization

Essential data cleaning functions:

| Function           | Purpose                    | When to use              |
| ------------------ | -------------------------- | ------------------------ |
| `sanitize()`       | General data sanitization  | Any data cleaning needs  |
| `sanitizeString()` | String cleaning and format | Text input processing    |
| `sanitizeNumber()` | Number normalization       | Numeric input processing |
| `sanitizeObject()` | Object property cleaning   | Form data processing     |

```javascript
// String sanitization
const cleanText = sanitizeString('  Hello World!  ', {
  trim: true,
  lowercase: true,
  maxLength: 100,
});

// Object sanitization
const cleanObject = sanitize(formData, {
  properties: {
    name: { trim: true, maxLength: 50 },
    email: { trim: true, lowercase: true },
  },
});
```

### Essential Validators

Core validation functions for common formats:

| Function           | Purpose                        | When to use           |
| ------------------ | ------------------------------ | --------------------- |
| `isEmail()`        | Validates email addresses      | User input validation |
| `isUrl()`          | Validates URLs                 | Link validation       |
| `isAlphanumeric()` | Validates alphanumeric strings | Username validation   |

```javascript
// Email validation
const isValidEmail = isEmail('user@example.com');

// URL validation
const isValidUrl = isUrl('https://example.com');

// Alphanumeric validation
const isValidUsername = isAlphanumeric('user123');
```

### Common Schemas

Essential validation schemas for typical use cases:

| Schema     | Purpose                    | When to use          |
| ---------- | -------------------------- | -------------------- |
| `email`    | Email validation           | User registration    |
| `password` | Password strength checking | Authentication forms |
| `username` | Username validation        | User accounts        |
| `url`      | URL validation             | Link fields          |
| `boolean`  | Boolean type validation    | Checkbox processing  |
| `integer`  | Integer validation         | Numeric IDs          |

```javascript
// Using common schemas
const emailResult = validate('user@example.com', commonSchemas.email);
const passwordResult = validate('MyStr0ngP@ss!', commonSchemas.password);
const usernameResult = validate('user123', commonSchemas.username);

// Creating custom schemas
const userSchema = createSchema({
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
  },
});
```

## 🔧 Configuration Options

### Validation Options

| Option       | Description                    | Default | Example                |
| ------------ | ------------------------------ | ------- | ---------------------- |
| `abortEarly` | Stop validation on first error | `false` | `{ abortEarly: true }` |

```javascript
const result = validate(data, schema, {
  abortEarly: false, // Get all validation errors
});
```

### Sanitization Options

| Category | Option      | Description                | Example               |
| -------- | ----------- | -------------------------- | --------------------- |
| String   | `trim`      | Remove whitespace          | `{ trim: true }`      |
| String   | `lowercase` | Convert to lowercase       | `{ lowercase: true }` |
| String   | `truncate`  | Limit string length        | `{ truncate: 100 }`   |
| Number   | `integer`   | Convert to integer         | `{ integer: true }`   |
| Number   | `clamp`     | Limit to min/max range     | `{ clamp: true }`     |
| Object   | `pick`      | Select specific properties | `{ pick: ['name'] }`  |

## 💡 Common Use Cases

Essential patterns for typical applications:

| Category            | Use Case           | Description                    | Components Used                   |
| ------------------- | ------------------ | ------------------------------ | --------------------------------- |
| **API Development** | Request Validation | Validate incoming API requests | `validate()`, `createValidator()` |
| **Form Processing** | User Registration  | Validate and sanitize forms    | `commonSchemas`, `sanitize()`     |
| **Data Cleaning**   | Input Sanitization | Clean user input safely        | `sanitizeString()`, `sanitize()`  |

## 🔧 Utility Functions

Essential utility for composing validators:

```javascript
import { utils } from '@voilajsx/appkit/validation';

// Pipeline for chaining validators
const validateUser = utils.pipeline(
  createValidator(commonSchemas.email),
  createValidator(commonSchemas.password),
  async (data) => {
    // Custom async validation
    const exists = await checkUserExists(data.email);
    return exists
      ? { valid: false, errors: [{ message: 'User exists' }] }
      : { valid: true, value: data };
  }
);

const result = await validateUser(userData);
```

## 📋 Example Code

Basic usage examples:

```javascript
import {
  validate,
  validateAsync,
  sanitize,
  isEmail,
  commonSchemas,
  utils,
} from '@voilajsx/appkit/validation';

// 1. Basic validation
const userSchema = {
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    age: { type: 'number', min: 18 },
  },
};

const result = validate(userData, userSchema);

// 2. Data sanitization
const cleanData = sanitize(formData, {
  properties: {
    name: { trim: true, maxLength: 50 },
    bio: { trim: true, truncate: 200 },
  },
});

// 3. Async validation
const asyncValidator = createAsyncValidator({
  type: 'string',
  email: true,
  validateAsync: async (email) => {
    const exists = await checkEmailExists(email);
    return exists ? 'Email already registered' : true;
  },
});

// 4. Validator pipeline
const userValidator = utils.pipeline(
  createValidator(userSchema),
  async (data) => {
    // Additional business logic
    return { valid: true, value: data };
  }
);
```

## 🛡️ Security Best Practices

1. **Input Sanitization**: Always sanitize user input before processing
2. **Type Validation**: Validate data types strictly
3. **Length Limits**: Set appropriate length limits for strings
4. **Error Handling**: Don't expose sensitive information in validation errors

## 🔍 Error Handling

```javascript
import { ValidationError } from '@voilajsx/appkit/validation';

try {
  const result = validate(data, schema);

  if (!result.valid) {
    // Handle validation errors
    result.errors.forEach((error) => {
      console.log(`Field ${error.path}: ${error.message}`);
    });
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.getMessages());
    console.log('Has errors:', error.hasErrors());
  }
}
```

## 📚 API Reference

### Core Functions

- `validate(data, schema, options)` - Validate data against schema
- `validateAsync(data, schema, options)` - Async validation
- `createValidator(schema, options)` - Create reusable validator
- `createAsyncValidator(schema, options)` - Create async validator

### Validators

- `isEmail(value)` - Email validation
- `isUrl(value)` - URL validation
- `isAlphanumeric(value)` - Alphanumeric validation

### Sanitizers

- `sanitize(data, rules)` - General sanitization
- `sanitizeString(value, rules)` - String sanitization
- `sanitizeNumber(value, rules)` - Number sanitization
- `sanitizeObject(value, rules)` - Object sanitization

### Schemas

- `commonSchemas` - Common validation schemas
- `createSchema(definition)` - Create custom schema

### Utilities

- `utils.pipeline(...validators)` - Chain validators

### Error Handling

- `ValidationError` - Validation error class
- `ValidationError.getMessages()` - Get formatted error messages
- `ValidationError.hasErrors()` - Check if errors exist

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
