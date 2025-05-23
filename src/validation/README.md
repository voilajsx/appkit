# @voilajsx/appkit - Validation Module ✅

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Schema-based data validation and sanitization for Node.js applications

The Validation module of `@voilajsx/appkit` provides a robust framework for data
validation and sanitization, ensuring data integrity and security with
schema-based validation, built-in sanitization, and reusable patterns for common
use cases.

## Module Overview

The Validation module equips your application with powerful tools for data
validation and sanitization:

| Feature               | What it does                             | Functions                                                                                                  |
| --------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Schema Validation** | Validate data against defined schemas    | `validate()`, `validateAsync()`, `createValidator()`, `createSchema()`, `mergeSchemas()`, `extendSchema()` |
| **Data Sanitization** | Clean and transform user input           | `sanitize()`, `sanitizeHtml(), `createSanitizer()`                                                         |
| **Error Handling**    | Detailed error reporting                 | `ValidationError` class, `result.errors`                                                                   |
| **Common Schemas**    | Predefined schemas for common data types | `commonSchemas`                                                                                            |
| **Custom Validation** | Extend with custom validation logic      | Custom `validate` and `validateAsync` functions                                                            |

## 🚀 Features

- **📏 Schema-Based Validation** - Define strict data structures with type
  checking
- **🧼 Input Sanitization** - Protect against injection attacks and invalid data
- **🔍 Detailed Error Reporting** - Field-specific error messages for better
  debugging
- **🔄 Reusable Schemas** - Predefined schemas for emails, passwords, URLs, and
  more
- **🛠️ Custom Validators** - Add application-specific validation rules
- **⏳ Async Validation** - Support for database checks and external validation
- **🔗 Schema Composition** - Combine and extend schemas for complex use cases

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

Import the validation module and start validating and sanitizing data with a
simple, intuitive API.

```javascript
import { validate, sanitize, commonSchemas } from '@voilajsx/appkit/validation';

// Define a schema
const userSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    age: { type: 'number', min: 18 },
  },
};

// Validate data
const userData = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  age: 25,
};
const result = validate(userData, userSchema);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
} else {
  console.log('Validated user:', result.value);
}

// Sanitize input
const userInput = {
  email: '  User@Example.com  ',
  name: '<script>alert("xss")</script>',
};
const sanitized = sanitize(userInput, {
  email: { trim: true, lowercase: true, email: true },
  name: { trim: true, escape: true },
});
```

## 📖 Core Functions

### Validation Functions

These functions allow you to validate data against defined schemas, ensuring
data integrity.

| Function            | Purpose                             | When to use                                |
| ------------------- | ----------------------------------- | ------------------------------------------ |
| `validate()`        | Validates data against a schema     | Immediate data validation                  |
| `validateAsync()`   | Validates data with async checks    | Database lookups, external API checks      |
| `createValidator()` | Creates reusable validator function | Repeated validation of similar data        |
| `createSchema()`    | Creates a new schema                | Defining reusable schema definitions       |
| `mergeSchemas()`    | Combines multiple schemas           | Building complex schemas from simpler ones |
| `extendSchema()`    | Extends an existing schema          | Adding fields to existing schemas          |

```javascript
// Create reusable validator
const userValidator = createValidator(userSchema);
const result = userValidator(userData);

// Async validation for unique email
const asyncSchema = {
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
const asyncResult = await validateAsync(userData, asyncSchema);
```

### Sanitization Functions

These functions clean and transform input data to ensure security and
consistency.

| Function            | Purpose                             | When to use                           |
| ------------------- | ----------------------------------- | ------------------------------------- |
| `sanitize()`        | Applies sanitization rules to data  | Cleaning user input before processing |
| `sanitizeHtml()`    | Sanitizes HTML content              | Handling user-generated HTML content  |
| `createSanitizer()` | Creates reusable sanitizer function | Repeated sanitization of similar data |

```javascript
// Sanitize user input
const sanitized = sanitize(userInput, {
  email: { trim: true, lowercase: true },
  name: { trim: true, escape: true },
});

// Sanitize HTML content
const safeHtml = sanitizeHtml(userContent, {
  allowedTags: ['p', 'strong', 'em'],
  allowedAttributes: { a: ['href'] },
});
```

## 🔧 Configuration Options

### Validation Options

| Option         | Description               | Default | Example                      |
| -------------- | ------------------------- | ------- | ---------------------------- |
| `abortEarly`   | Stop on first error       | `true`  | `false` (collect all errors) |
| `allowUnknown` | Allow unknown properties  | `true`  | `false` (reject unknown)     |
| `stripUnknown` | Remove unknown properties | `false` | `true` (strip unknown)       |

```javascript
const result = validate(data, schema, {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
});
```

### Sanitization Rules

| Rule           | Description                         | Example                  |
| -------------- | ----------------------------------- | ------------------------ |
| `trim`         | Removes leading/trailing whitespace | `{ trim: true }`         |
| `lowercase`    | Converts to lowercase               | `{ lowercase: true }`    |
| `escape`       | Escapes HTML characters             | `{ escape: true }`       |
| `truncate`     | Limits string length                | `{ truncate: 100 }`      |
| `unique`       | Removes duplicate array items       | `{ unique: true }`       |
| `alphanumeric` | Allows only alphanumeric chars      | `{ alphanumeric: true }` |

```javascript
const sanitized = sanitize(data, {
  bio: { trim: true, truncate: 500, escape: true },
  tags: { array: true, unique: true, limit: 5 },
});
```

## 💡 Common Use Cases

| Category            | Use Case                | Description                               | Components Used                        |
| ------------------- | ----------------------- | ----------------------------------------- | -------------------------------------- |
| **API Servers**     | Input Validation        | Validate incoming API requests            | `validate()`, `createValidator()`      |
|                     | Error Reporting         | Provide detailed error responses          | `ValidationError`, `result.errors`     |
| **Web Forms**       | Form Validation         | Validate user input on client/server      | `validate()`, `createValidator()`      |
|                     | Input Sanitization      | Clean user input before processing        | `sanitize()`, `sanitizeHtml()`         |
| **Database**        | Data Integrity          | Validate data before database operations  | `validateAsync()`, `createValidator()` |
| **Security**        | XSS Prevention          | Sanitize user-generated content           | `sanitizeHtml()`, `sanitize()`         |
|                     | Input Validation        | Prevent malicious input                   | `validate()`, custom validators        |
| **User Management** | Registration Validation | Validate user registration data           | `commonSchemas`, `validate()`          |
|                     | Profile Updates         | Validate partial updates to user profiles | `mergeSchemas()`, `extendSchema()`     |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate
validation code for common scenarios using the `@voilajsx/appkit/validation`
module. Refer to the
[PROMPT_REFERENCE.md](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/PROMPT_REFERENCE.md)
document for LLM-specific guidance.

### Sample Prompts to Try

#### Basic Validation Setup

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/validation/docs/PROMPT_REFERENCE.md and create a validation system for a user registration API using @voilajsx/appkit/validation with:
- Email and password validation using common schemas
- Custom password strength rules
- Input sanitization
- Detailed error handling
```

#### API Input Validation

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/validation/docs/PROMPT_REFERENCE.md and implement an Express middleware for API input validation using @voilajsx/appkit/validation that includes:
- Schema-based validation for POST requests
- Async validation for unique checks
- Sanitization of user input
- Structured error responses
```

#### Form Validation

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/validation/docs/PROMPT_REFERENCE.md and create a React form validation system using @voilajsx/appkit/validation with:
- Real-time field validation
- Custom error messages
- Input sanitization
- Form submission handling
```

## 📋 Example Code

For complete examples, check our examples folder:

- [Basic Validation](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/01-basic-validation.js) -
  Simple schema validation
- [Async Validation](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/02-async-validation.js) -
  Database-backed validation
- [Form Integration](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/03-form-validation.js) -
  Client-side form validation
- [Express Integration](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/04-express-validation.js) -
  API validation middleware

## 🛡️ Validation Best Practices

1. **Sanitize First** - Always sanitize input before validation to prevent
   security issues
2. **Use Specific Errors** - Provide clear, field-specific error messages
3. **Validate Early** - Validate at the API boundary and model layer
4. **Reuse Schemas** - Use `commonSchemas` and `mergeSchemas()` for consistency
5. **Handle Async Properly** - Use `validateAsync()` for database checks
6. **Secure Content** - Use `sanitizeHtml()` for user-generated content

## 📊 Performance Considerations

- **Reuse Validators** - Use `createValidator()` for frequently used schemas
- **Optimize Schemas** - Keep schemas focused to reduce validation overhead
- **Batch Sanitization** - Use `createSanitizer()` for repeated operations
- **Limit Async Calls** - Cache async validation results when possible
- **Set Appropriate Options** - Use `abortEarly: true` in production for faster
  validation

## 🔍 Error Handling

The validation module provides robust error handling with the `ValidationError`
class:

```javascript
import { validate, ValidationError } from '@voilajsx/appkit/validation';

try {
  const result = validate(data, schema);
  if (!result.valid) {
    throw new ValidationError('Validation failed', result.errors);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation errors:', error.getMessages());
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

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
