# Validation Module - Developer Reference 🛠️

The validation module provides comprehensive data validation and sanitization
utilities for Node.js applications. It offers schema-based validation, async
validation support, built-in sanitizers, and essential validator functions - all
with sensible defaults to get you started quickly.

Whether you need simple data validation, complex async checks, or comprehensive
sanitization, this module provides flexible, composable utilities that work with
any Node.js framework.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- ✅ [Data Validation](#data-validation)
  - [Basic Validation](#basic-validation)
  - [Schema Validation](#schema-validation)
  - [Async Validation](#async-validation)
  - [Reusable Validators](#reusable-validators)
- 🧹 [Data Sanitization](#data-sanitization)
  - [String Sanitization](#string-sanitization)
  - [Number Sanitization](#number-sanitization)
  - [Object Sanitization](#object-sanitization)
  - [Auto-Detection](#auto-detection)
- 🔍 [Built-in Validators](#built-in-validators)
  - [Email Validation](#email-validation)
  - [URL Validation](#url-validation)
  - [Alphanumeric Validation](#alphanumeric-validation)
- 📋 [Common Schemas](#common-schemas)
  - [Pre-built Schemas](#pre-built-schemas)
  - [Custom Schemas](#custom-schemas)
- ⚡ [Pipeline Utilities](#pipeline-utilities)
  - [Chaining Validators](#chaining-validators)
  - [Error Handling](#error-handling)
- 🎯 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

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
  createValidator,
  sanitize,
  sanitizeString,
  sanitizeNumber,
  sanitizeObject,
  isEmail,
  commonSchemas,
  ValidationError,
  utils,
} from '@voilajsx/appkit/validation';
```

## Data Validation

The validation system uses schemas to define rules and constraints for your
data.

### Basic Validation

Use `validate()` to check data against a schema:

```javascript
import { validate } from '@voilajsx/appkit/validation';

// Simple string validation
const schema = {
  type: 'string',
  required: true,
  minLength: 3,
  maxLength: 20,
};

const result = validate('hello', schema);
console.log(result.valid); // true
console.log(result.value); // 'hello'
console.log(result.errors); // []
```

**Expected Output:**

```
true
hello
[]
```

**When to use:**

- Form input validation
- API parameter checking
- Configuration validation
- Data integrity checks

### Schema Validation

Validate complex objects with nested properties:

```javascript
import { validate } from '@voilajsx/appkit/validation';

const userSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
    },
    age: {
      type: 'number',
      min: 0,
      max: 120,
    },
    email: {
      type: 'string',
      email: true,
    },
  },
};

const userData = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
};

const result = validate(userData, userSchema);

if (result.valid) {
  console.log('User data is valid:', result.value);
} else {
  console.log('Validation errors:', result.errors);
}
```

**Expected Output:**

```
User data is valid: { name: 'John Doe', age: 30, email: 'john@example.com' }
```

**When to use:**

- User registration forms
- API request validation
- Database model validation
- Configuration file validation

### Async Validation

Handle async validation for database checks and external API calls:

```javascript
import { validateAsync } from '@voilajsx/appkit/validation';

const usernameSchema = {
  type: 'string',
  required: true,
  minLength: 3,
  validateAsync: async (username) => {
    // Simulate database check
    await new Promise((resolve) => setTimeout(resolve, 100));

    const takenUsernames = ['admin', 'root', 'test'];
    if (takenUsernames.includes(username)) {
      return 'Username is already taken';
    }
    return true;
  },
};

const result = await validateAsync('john123', usernameSchema);

if (result.valid) {
  console.log('Username is available');
} else {
  console.log('Error:', result.errors[0].message);
}
```

**Expected Output:**

```
Username is available
```

**When to use:**

- Username availability checks
- Email uniqueness validation
- External API verification
- Database constraint checking

### Reusable Validators

Create validators once and reuse them throughout your application:

```javascript
import {
  createValidator,
  createAsyncValidator,
} from '@voilajsx/appkit/validation';

// Create a reusable email validator
const emailValidator = createValidator({
  type: 'string',
  required: true,
  email: true,
});

// Create a reusable async username validator
const usernameValidator = createAsyncValidator({
  type: 'string',
  required: true,
  alphanumeric: true,
  minLength: 3,
  validateAsync: async (username) => {
    // Your async validation logic
    return username !== 'admin' ? true : 'Reserved username';
  },
});

// Use them anywhere
const emailResult = emailValidator('user@example.com');
const usernameResult = await usernameValidator('john123');

console.log('Email valid:', emailResult.valid);
console.log('Username valid:', usernameResult.valid);
```

**Expected Output:**

```
Email valid: true
Username valid: true
```

**When to use:**

- Consistent validation across your app
- Form field validation
- API endpoint protection
- Shared validation logic

## Data Sanitization

Sanitization cleans and transforms data to ensure it's safe and consistent.

### String Sanitization

Clean and transform string data:

```javascript
import { sanitizeString } from '@voilajsx/appkit/validation';

// Basic string cleaning
const cleaned = sanitizeString('  Hello World!  ', {
  trim: true,
  lowercase: true,
});
console.log(cleaned); // 'hello world!'

// Advanced string processing
const processed = sanitizeString('Hello@World.com', {
  trim: true,
  replace: {
    '@': ' at ',
    '\\.': ' dot ',
  },
  remove: '!',
});
console.log(processed); // 'Hello at World dot com'

// Length control
const truncated = sanitizeString('This is a very long text', {
  truncate: 10,
});
console.log(truncated); // 'This is a '
```

**Expected Output:**

```
hello world!
Hello at World dot com
This is a
```

**When to use:**

- User input cleaning
- Text preprocessing
- Data normalization
- Security sanitization

### Number Sanitization

Convert and constrain numeric values:

```javascript
import { sanitizeNumber } from '@voilajsx/appkit/validation';

// Convert strings to numbers
const converted = sanitizeNumber('123.45');
console.log(converted); // 123.45

// Handle quoted values
const unquoted = sanitizeNumber('"67.89"');
console.log(unquoted); // 67.89

// Apply constraints with clamping
const clamped = sanitizeNumber(150, {
  min: 0,
  max: 100,
  clamp: true,
});
console.log(clamped); // 100

// Control precision
const rounded = sanitizeNumber(3.14159, {
  precision: 2,
});
console.log(rounded); // 3.14

// Force integers
const integer = sanitizeNumber(3.7, {
  integer: true,
});
console.log(integer); // 3
```

**Expected Output:**

```
123.45
67.89
100
3.14
3
```

**When to use:**

- Form input processing
- API parameter conversion
- Data type enforcement
- Range validation

### Object Sanitization

Clean and transform object properties:

```javascript
import { sanitizeObject } from '@voilajsx/appkit/validation';

const rawData = {
  name: '  John Doe  ',
  age: '25',
  email: '  JOHN@EXAMPLE.COM  ',
  password: 'secret123',
  bio: '',
};

// Comprehensive object sanitization
const cleaned = sanitizeObject(rawData, {
  // Apply defaults
  defaults: {
    role: 'user',
    active: true,
  },

  // Pick only needed fields
  pick: ['name', 'age', 'email', 'role', 'active'],

  // Sanitize individual properties
  properties: {
    name: {
      trim: true,
    },
    age: {
      integer: true,
    },
    email: {
      trim: true,
      lowercase: true,
    },
  },

  // Remove empty values
  removeEmpty: true,
});

console.log(cleaned);
```

**Expected Output:**

```
{
  name: 'John Doe',
  age: 25,
  email: 'john@example.com',
  role: 'user',
  active: true
}
```

**When to use:**

- API request processing
- Form data cleaning
- Database preparation
- Security filtering

### Auto-Detection

Let the sanitizer automatically detect data types:

```javascript
import { sanitize } from '@voilajsx/appkit/validation';

// Auto-detects string and applies string rules
const string = sanitize('  hello  ', { trim: true, uppercase: true });
console.log(string); // 'HELLO'

// Auto-detects number and applies number rules
const number = sanitize(3.14159, { precision: 2 });
console.log(number); // 3.14

// Auto-detects object and applies object rules
const object = sanitize(
  { name: '  John  ', age: '25' },
  {
    properties: {
      name: { trim: true },
      age: { integer: true },
    },
  }
);
console.log(object); // { name: 'John', age: 25 }
```

**Expected Output:**

```
HELLO
3.14
{ name: 'John', age: 25 }
```

**When to use:**

- Generic data processing
- Dynamic data handling
- Flexible sanitization pipelines
- Unknown data type scenarios

## Built-in Validators

Essential validators for common data types are included out of the box.

### Email Validation

Validate email addresses with RFC compliance:

```javascript
import { isEmail } from '@voilajsx/appkit/validation';

// Valid emails
console.log(isEmail('user@example.com')); // true
console.log(isEmail('test.email+tag@domain.co.uk')); // true

// Invalid emails
console.log(isEmail('invalid-email')); // false
console.log(isEmail('user@')); // false
console.log(isEmail('@domain.com')); // false
```

**Expected Output:**

```
true
true
false
false
false
```

**When to use:**

- User registration forms
- Contact form validation
- Email list management
- Newsletter subscriptions

### URL Validation

Validate HTTP and HTTPS URLs:

```javascript
import { isUrl } from '@voilajsx/appkit/validation';

// Valid URLs
console.log(isUrl('https://example.com')); // true
console.log(isUrl('http://test.org/path?param=value')); // true

// Invalid URLs
console.log(isUrl('ftp://example.com')); // false
console.log(isUrl('not-a-url')); // false
```

**Expected Output:**

```
true
true
false
false
```

**When to use:**

- Link validation
- Webhook URL checking
- API endpoint validation
- Social media profile links

### Alphanumeric Validation

Ensure strings contain only letters and numbers:

```javascript
import { isAlphanumeric } from '@voilajsx/appkit/validation';

// Valid alphanumeric
console.log(isAlphanumeric('abc123')); // true
console.log(isAlphanumeric('UserName')); // true

// Invalid alphanumeric
console.log(isAlphanumeric('user-name')); // false
console.log(isAlphanumeric('user@123')); // false
```

**Expected Output:**

```
true
true
false
false
```

**When to use:**

- Username validation
- Product code checking
- ID validation
- Slug generation

## Common Schemas

Pre-built schemas for typical use cases speed up development.

### Pre-built Schemas

Use ready-made schemas for common data types:

```javascript
import { commonSchemas, validate } from '@voilajsx/appkit/validation';

// Email validation
const emailResult = validate('user@example.com', commonSchemas.email);
console.log(emailResult.valid); // true

// Strong password validation
const passwordResult = validate('MyPass123!', commonSchemas.password);
console.log(passwordResult.valid); // true

// Username validation
const usernameResult = validate('john123', commonSchemas.username);
console.log(usernameResult.valid); // true

// URL validation
const urlResult = validate('https://example.com', commonSchemas.url);
console.log(urlResult.valid); // true
```

**Expected Output:**

```
true
true
true
true
```

**When to use:**

- Quick validation setup
- Standard form fields
- Common data types
- Consistent validation rules

### Custom Schemas

Create your own schemas for specific needs:

```javascript
import { createValidationSchema, validate } from '@voilajsx/appkit/validation';

// Create a custom product schema
const productSchema = createValidationSchema({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: 'number',
      required: true,
      min: 0,
    },
    category: {
      type: 'string',
      required: true,
      pattern: /^[a-z-]+$/,
    },
    inStock: {
      type: 'boolean',
      default: true,
    },
  },
});

const product = {
  name: 'Wireless Headphones',
  price: 99.99,
  category: 'electronics',
};

const result = validate(product, productSchema);
console.log(result.valid); // true
console.log(result.value.inStock); // true (default applied)
```

**Expected Output:**

```
true
true
```

**When to use:**

- Domain-specific validation
- Business rule enforcement
- Custom data models
- Application-specific constraints

## Pipeline Utilities

Chain multiple validators together for complex validation workflows.

### Chaining Validators

Combine multiple validation steps:

```javascript
import { utils, createValidator } from '@voilajsx/appkit/validation';

// Create individual validators
const stringValidator = createValidator({
  type: 'string',
  required: true,
  minLength: 3,
});

const emailValidator = createValidator({
  type: 'string',
  email: true,
});

// Create a validation pipeline
const emailPipeline = utils.pipeline(stringValidator, emailValidator);

// Test the pipeline
const result = await emailPipeline('user@example.com');

if (result.valid) {
  console.log('Email passed all validations');
} else {
  console.log('Validation errors:', result.errors);
}
```

**Expected Output:**

```
Email passed all validations
```

**When to use:**

- Multi-step validation
- Complex business rules
- Progressive validation
- Reusable validation chains

### Error Handling

Handle validation errors gracefully:

```javascript
import { validate, ValidationError } from '@voilajsx/appkit/validation';

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', required: true, email: true },
    age: { type: 'number', required: true, min: 18 },
  },
};

const invalidData = {
  email: 'invalid-email',
  age: 15,
};

const result = validate(invalidData, schema);

if (!result.valid) {
  // Create a ValidationError for better error handling
  const error = new ValidationError('Validation failed', result.errors);

  console.log('Has errors:', error.hasErrors()); // true
  console.log('Error messages:', error.getMessages());

  // Handle specific errors
  result.errors.forEach((err) => {
    console.log(`Field ${err.path}: ${err.message}`);
  });
}
```

**Expected Output:**

```
Has errors: true
Error messages: ['email: Invalid email address', 'age: Value must be at least 18']
Field email: Invalid email address
Field age: Value must be at least 18
```

**When to use:**

- Error reporting
- User feedback
- Logging and monitoring
- API error responses

## Complete Integration Example

Here's a comprehensive example showing validation and sanitization working
together:

```javascript
import {
  validate,
  sanitizeObject,
  commonSchemas,
  createValidator,
  ValidationError,
} from '@voilajsx/appkit/validation';

// Create a user registration system
class UserRegistration {
  constructor() {
    // Define validation schema
    this.schema = {
      type: 'object',
      properties: {
        email: commonSchemas.email,
        password: commonSchemas.password,
        name: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 50,
        },
        age: {
          type: 'number',
          min: 13,
          max: 120,
        },
      },
    };

    // Create reusable validator
    this.validator = createValidator(this.schema);
  }

  async processRegistration(rawData) {
    try {
      // Step 1: Sanitize input data
      const sanitizedData = sanitizeObject(rawData, {
        pick: ['email', 'password', 'name', 'age'],
        properties: {
          email: { trim: true, lowercase: true },
          name: { trim: true },
          age: { integer: true },
        },
        removeEmpty: true,
      });

      console.log('Sanitized data:', sanitizedData);

      // Step 2: Validate sanitized data
      const validationResult = this.validator(sanitizedData);

      if (!validationResult.valid) {
        const error = new ValidationError(
          'Registration validation failed',
          validationResult.errors
        );
        throw error;
      }

      // Step 3: Process valid data
      const user = await this.createUser(validationResult.value);
      console.log('User created successfully:', user);

      return { success: true, user };
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('Validation errors:', error.getMessages());
        return { success: false, errors: error.getMessages() };
      }

      console.log('Unexpected error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createUser(userData) {
    // Simulate user creation
    return {
      id: Math.random().toString(36),
      ...userData,
      createdAt: new Date(),
    };
  }
}

// Usage example
const registration = new UserRegistration();

const rawUserData = {
  email: '  USER@EXAMPLE.COM  ',
  password: 'MySecurePass123!',
  name: '  John Doe  ',
  age: '25',
  extraField: 'ignored',
};

registration.processRegistration(rawUserData);
```

**Expected Output:**

```
Sanitized data: {
  email: 'user@example.com',
  password: 'MySecurePass123!',
  name: 'John Doe',
  age: 25
}
User created successfully: {
  id: 'abc123',
  email: 'user@example.com',
  password: 'MySecurePass123!',
  name: 'John Doe',
  age: 25,
  createdAt: 2023-01-01T00:00:00.000Z
}
```

**When to implement:**

- User registration systems
- API data processing
- Form handling applications
- Data import/export tools

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- Always validate user input before processing
- Sanitize data to prevent injection attacks
- Use appropriate validation rules for each data type
- Never trust client-side validation alone
- Implement rate limiting for validation endpoints

### 🏗️ Architecture

- Create reusable validators for common patterns
- Separate validation logic from business logic
- Use schemas to document your data requirements
- Implement consistent error handling
- Cache validators when possible for performance

### 🚀 Performance

- Use `abortEarly: true` for performance-critical validations
- Create validators once and reuse them
- Order pipeline validators by performance (fastest first)
- Use async validation sparingly
- Consider validation caching for expensive operations

### 👥 User Experience

- Provide clear, actionable error messages
- Validate incrementally (field by field) when appropriate
- Show validation feedback in real-time
- Sanitize data silently when it improves user experience
- Handle edge cases gracefully

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
