# @voilajsx/appkit - Validation Module ✅

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Comprehensive, secure, and flexible data validation and sanitization utilities
> for Node.js applications

The Validation module of `@voilajsx/appkit` provides robust data validation and
sanitization capabilities including schema-based validation, data sanitization,
built-in validators for common formats, and pre-built schemas for typical
application needs.

## Module Overview

The Validation module provides everything you need for modern data validation:

| Feature                 | What it does                              | Main functions                            |
| ----------------------- | ----------------------------------------- | ----------------------------------------- |
| **Schema Validation**   | Validate data against defined schemas     | `validate()`, `validateAsync()`           |
| **Data Sanitization**   | Clean and normalize input data            | `sanitize()`, `sanitizeString()`          |
| **Built-in Validators** | Validate common formats and types         | `isEmail()`, `isUrl()`, `isPhoneNumber()` |
| **Pre-built Schemas**   | Ready-to-use schemas for common use cases | `userRegistrationSchema`, `productSchema` |

## 🚀 Features

- **📋 Schema-Based Validation** - Comprehensive validation with nested object
  support
- **🧹 Data Sanitization** - Clean and normalize input data with security focus
- **🔍 Built-in Validators** - 20+ validators for common formats (email, URL,
  phone, etc.)
- **📦 Pre-built Schemas** - 25+ production-ready schemas for typical
  applications
- **⚡ Async Support** - Full support for asynchronous validation workflows
- **🔒 Security Focused** - XSS prevention, input sanitization, and safe
  defaults
- **🎯 Framework Agnostic** - Works with Express, Fastify, Koa, and more
- **⚙️ Highly Configurable** - Extensive customization options for all
  validation needs

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

Import only the functions you need and start validating data right away. Each
function is designed to work independently, so you can pick and choose what you
need for your application.

```javascript
import {
  validate,
  sanitize,
  isEmail,
  userRegistrationSchema,
} from '@voilajsx/appkit/validation';

// Quick email validation
const isValidEmail = isEmail('user@example.com'); // true

// Sanitize user input
const cleanData = sanitize('  Hello World!  ', { trim: true, lowercase: true });

// Validate against a schema
const result = validate(userData, userRegistrationSchema);
if (result.valid) {
  console.log('User data is valid:', result.value);
} else {
  console.log('Validation errors:', result.errors);
}
```

## 📖 Core Functions

### Schema Validation

These utilities enable you to validate complex data structures against
predefined schemas. Perfect for validating API requests, form submissions, and
configuration data with comprehensive error reporting.

| Function                    | Purpose                                       | When to use                                 |
| --------------------------- | --------------------------------------------- | ------------------------------------------- |
| `validate()`                | Validates data against a schema               | API request validation, form processing     |
| `validateAsync()`           | Asynchronous validation with async validators | Database validation, external API checks    |
| `createValidator()`         | Creates reusable validator functions          | Repetitive validation, middleware creation  |
| `createAsyncValidator()`    | Creates reusable async validator functions    | Async validation patterns, middleware       |
| `createSchema()`            | Creates new validation schemas                | Custom schema definition, schema building   |
| `mergeSchemas()`            | Combines multiple schemas                     | Schema composition, inheritance patterns    |
| `extendSchema()`            | Extends existing schemas with new properties  | Schema inheritance, customization           |
| `createConditionalSchema()` | Creates conditional validation schemas        | Dynamic validation, context-dependent rules |
| `createEnumSchema()`        | Creates enumeration validation schemas        | Dropdown validation, restricted values      |
| `createArraySchema()`       | Creates array validation schemas              | List validation, collection processing      |
| `createModelSchema()`       | Creates database model schemas                | ORM integration, model validation           |
| `createCrudSchemas()`       | Creates CRUD operation schemas                | API endpoints, database operations          |
| `getSchema()`               | Retrieves schema by name                      | Schema registry, dynamic schema loading     |
| `hasSchema()`               | Checks if schema exists                       | Schema validation, registry management      |
| `getSchemaNames()`          | Lists all available schema names              | Schema discovery, documentation generation  |

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

These functions clean and normalize input data to prevent security
vulnerabilities and ensure data consistency. Essential for handling user input
safely and maintaining data quality.

| Function               | Purpose                              | When to use                                  |
| ---------------------- | ------------------------------------ | -------------------------------------------- |
| `sanitize()`           | Sanitizes data based on rules        | General data cleaning, input normalization   |
| `sanitizeString()`     | Cleans and formats strings           | Text input processing, content sanitization  |
| `sanitizeHtml()`       | Removes dangerous HTML content       | User-generated content, rich text processing |
| `sanitizeNumber()`     | Normalizes numeric values            | Price validation, quantity processing        |
| `sanitizeBoolean()`    | Normalizes boolean values            | Checkbox processing, flag normalization      |
| `sanitizeArray()`      | Cleans and processes arrays          | List processing, tag normalization           |
| `sanitizeObject()`     | Sanitizes object properties          | Form data processing, nested data cleaning   |
| `sanitizeEmail()`      | Normalizes email addresses           | User registration, email processing          |
| `sanitizeUsername()`   | Cleans username input                | User registration, profile updates           |
| `sanitizePassword()`   | Safely handles password input        | Authentication, password processing          |
| `sanitizePhone()`      | Normalizes phone numbers             | Contact forms, user profiles                 |
| `sanitizeUrl()`        | Cleans and validates URLs            | Link processing, website fields              |
| `sanitizeSlug()`       | Creates URL-friendly slugs           | SEO URLs, content management                 |
| `sanitizeSearch()`     | Cleans search query input            | Search functionality, query processing       |
| `sanitizeCreditCard()` | Safely handles credit card data      | Payment processing, PCI compliance           |
| `sanitizePostalCode()` | Normalizes postal/zip codes          | Address processing, shipping forms           |
| `sanitizeTags()`       | Processes tag arrays                 | Content tagging, categorization              |
| `sanitizeHexColor()`   | Normalizes hex color codes           | Color inputs, theme settings                 |
| `sanitizeFilename()`   | Creates safe filenames               | File uploads, document processing            |
| `sanitizeIpAddress()`  | Cleans IP address input              | Network logs, security processing            |
| `createSanitizer()`    | Creates reusable sanitizer functions | Custom sanitization, middleware creation     |

```javascript
// String sanitization
const cleanText = sanitizeString('  Hello <script>alert("xss")</script>  ', {
  trim: true,
  stripTags: true,
  maxLength: 100,
});

// HTML sanitization (XSS prevention)
const safeHtml = sanitizeHtml(userContent, {
  allowedTags: ['p', 'br', 'strong', 'em'],
  stripEmpty: true,
});

// Email normalization
const normalizedEmail = sanitizeEmail('  USER@EXAMPLE.COM  '); // "user@example.com"

// Complex object sanitization
const cleanObject = sanitize(formData, {
  properties: {
    name: { trim: true, maxLength: 50 },
    bio: { trim: true, stripTags: true, maxLength: 500 },
    tags: { compact: true, unique: true, limit: 10 },
  },
});
```

### Built-in Validators

Validate common data formats with battle-tested validators. These functions
provide reliable validation for the most common data types you'll encounter in
web applications.

| Function               | Purpose                        | When to use                              |
| ---------------------- | ------------------------------ | ---------------------------------------- |
| `isEmail()`            | Validates email addresses      | User registration, contact forms         |
| `isUrl()`              | Validates URLs                 | Link validation, website fields          |
| `isPhoneNumber()`      | Validates phone numbers        | Contact information, SMS verification    |
| `isCreditCard()`       | Validates credit card numbers  | Payment processing, e-commerce           |
| `isStrongPassword()`   | Checks password strength       | Security validation, password policies   |
| `isUuid()`             | Validates UUID format          | Database IDs, unique identifiers         |
| `isAlphanumeric()`     | Validates alphanumeric strings | Usernames, product codes                 |
| `isAlpha()`            | Validates alphabetic strings   | Names, text-only fields                  |
| `isNumeric()`          | Validates numeric strings      | ID numbers, codes                        |
| `isHexColor()`         | Validates hex color codes      | Color pickers, theme settings            |
| `isIpAddress()`        | Validates IP addresses (v4/v6) | Network configuration, security logs     |
| `isSlug()`             | Validates URL slugs            | SEO-friendly URLs, routing               |
| `isJSON()`             | Validates JSON strings         | Configuration data, API payloads         |
| `isBase64()`           | Validates base64 encoding      | File uploads, encoded data               |
| `isObjectId()`         | Validates MongoDB ObjectIds    | Database references, MongoDB integration |
| `isCreditCardExpiry()` | Validates credit card expiry   | Payment forms, card validation           |
| `isSemVer()`           | Validates semantic versions    | Package versions, API versioning         |

```javascript
// Email validation with options
const isValidEmail = isEmail('user@example.com', {
  allowInternational: true,
  allowPunycode: true,
});

// URL validation
const isValidUrl = isUrl('https://example.com', {
  protocols: ['http', 'https'],
  requireProtocol: true,
});

// Phone number validation
const isValidPhone = isPhoneNumber('+1234567890', {
  country: 'US',
  format: 'international',
});

// Credit card validation
const isValidCard = isCreditCard('4111111111111111', {
  types: ['visa', 'mastercard'],
});

// Password strength
const isStrongPwd = isStrongPassword('MyStr0ngP@ss!', {
  minLength: 12,
  requireSymbols: true,
  maxRepeatingChars: 2,
});
```

### Pre-built Schemas

Ready-to-use validation schemas for common application scenarios. These schemas
follow best practices and can be used directly or extended for your specific
needs.

| Schema                         | Purpose                           | When to use                               |
| ------------------------------ | --------------------------------- | ----------------------------------------- |
| `userRegistrationSchema`       | User signup validation            | User registration forms, account creation |
| `userLoginSchema`              | User login validation             | Authentication forms, login processing    |
| `userProfileSchema`            | User profile data validation      | Profile updates, user management          |
| `passwordResetSchema`          | Password reset validation         | Password reset flows, security operations |
| `changePasswordSchema`         | Password change validation        | Password updates, security settings       |
| `productSchema`                | E-commerce product validation     | Product management, inventory systems     |
| `orderSchema`                  | Order processing validation       | E-commerce orders, purchase flows         |
| `invoiceSchema`                | Invoice data validation           | Billing systems, accounting software      |
| `commentSchema`                | User-generated content validation | Comments, reviews, feedback systems       |
| `reviewSchema`                 | Product/service review validation | Review systems, rating platforms          |
| `apiKeySchema`                 | API key configuration validation  | API management, authentication systems    |
| `webhookSchema`                | Webhook configuration validation  | Integration systems, event processing     |
| `subscriptionSchema`           | Subscription data validation      | SaaS billing, recurring payments          |
| `supportTicketSchema`          | Support ticket validation         | Help desk systems, customer support       |
| `blogPostSchema`               | Blog content validation           | Content management, publishing systems    |
| `eventSchema`                  | Event data validation             | Event management, calendar systems        |
| `newsletterSubscriptionSchema` | Newsletter signup validation      | Email marketing, subscription management  |
| `settingsSchema`               | Application settings validation   | Configuration management, admin panels    |
| `migrationSchema`              | Database migration validation     | Database versioning, migration systems    |
| `apiResponseSchema`            | API response format validation    | API consistency, response standardization |
| `performanceMetricSchema`      | Performance data validation       | Monitoring systems, analytics platforms   |

```javascript
// User registration
const registrationResult = validate(signupData, userRegistrationSchema);

// Product validation
const productResult = validate(productData, productSchema);

// Custom schema extension
const extendedUserSchema = extendSchema(userRegistrationSchema, {
  properties: {
    companyName: { type: 'string', maxLength: 100 },
    referralCode: { type: 'string', pattern: /^[A-Z0-9]{6,10}$/ },
  },
});
```

## 🔧 Configuration Options

The examples above show basic usage, but you have extensive control over
validation behavior. Here are the key customization options:

### Validation Options

| Option         | Description                            | Default | Example                         |
| -------------- | -------------------------------------- | ------- | ------------------------------- |
| `abortEarly`   | Stop validation on first error         | `false` | `{ abortEarly: true }`          |
| `allowUnknown` | Allow properties not defined in schema | `false` | `{ allowUnknown: true }`        |
| `stripUnknown` | Remove unknown properties from result  | `false` | `{ stripUnknown: true }`        |
| `context`      | Additional context for validators      | `{}`    | `{ context: { userId: '123' }}` |

```javascript
const result = validate(data, schema, {
  abortEarly: false, // Get all validation errors
  allowUnknown: true, // Allow extra properties
  stripUnknown: false, // Keep extra properties in result
  context: { currentUser }, // Pass context to validators
});
```

### Sanitization Options

| Category | Option        | Description              | Example                        |
| -------- | ------------- | ------------------------ | ------------------------------ |
| String   | `trim`        | Remove whitespace        | `{ trim: true }`               |
| String   | `lowercase`   | Convert to lowercase     | `{ lowercase: true }`          |
| String   | `truncate`    | Limit string length      | `{ truncate: 100 }`            |
| String   | `slug`        | Create URL-friendly slug | `{ slug: true }`               |
| HTML     | `allowedTags` | Permitted HTML tags      | `{ allowedTags: ['p', 'br'] }` |
| Array    | `unique`      | Remove duplicate items   | `{ unique: true }`             |
| Array    | `compact`     | Remove empty values      | `{ compact: true }`            |

```javascript
const sanitized = sanitize(userInput, {
  properties: {
    title: { trim: true, slug: true, maxLength: 100 },
    content: {
      stripTags: true,
      truncate: 1000,
      normalize: 'NFC',
    },
    tags: {
      compact: true,
      unique: true,
      items: { lowercase: true, slug: true },
    },
  },
});
```

## 💡 Common Use Cases

Here's where you can apply the validation module's functionality in your
applications:

| Category               | Use Case              | Description                                | Components Used                              |
| ---------------------- | --------------------- | ------------------------------------------ | -------------------------------------------- |
| **API Development**    | Request Validation    | Validate incoming API requests             | `validate()`, `createValidator()`            |
|                        | Response Sanitization | Clean outgoing API responses               | `sanitize()`, `sanitizeObject()`             |
|                        | Parameter Validation  | Validate URL parameters and query strings  | Built-in validators, custom schemas          |
| **Form Processing**    | User Registration     | Validate and sanitize signup forms         | `userRegistrationSchema`, `sanitizeEmail()`  |
|                        | Contact Forms         | Process and validate user submissions      | `sanitizeString()`, `isEmail()`, `isPhone()` |
|                        | File Uploads          | Validate file metadata and content         | `fileUploadSchema`, custom validators        |
| **E-commerce**         | Product Management    | Validate product data and pricing          | `productSchema`, `orderSchema`               |
|                        | Payment Processing    | Validate payment information securely      | `isCreditCard()`, `sanitizeCreditCard()`     |
|                        | Inventory Management  | Validate stock levels and product variants | Custom schemas, number validators            |
| **Content Management** | Blog Posts            | Validate and sanitize article content      | `blogPostSchema`, `sanitizeHtml()`           |
|                        | User Comments         | Process user-generated content safely      | `commentSchema`, XSS prevention              |
|                        | Media Uploads         | Validate images and documents              | File validators, metadata schemas            |
| **Security & Privacy** | Input Sanitization    | Prevent XSS and injection attacks          | `sanitizeHtml()`, `sanitizeString()`         |
|                        | Data Anonymization    | Clean sensitive data for analytics         | Custom sanitizers, data masking              |
|                        | Rate Limiting Data    | Validate request patterns and limits       | Custom validators, API schemas               |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate
validation code for specific scenarios using the `@voilajsx/appkit/validation`
module. We've designed the module with clear patterns that LLMs can easily
understand and adapt.

### How to Use LLM Code Generation

Simply describe your validation needs to an LLM and mention that you're using
`@voilajsx/appkit/validation`. The LLM can generate appropriate validation
schemas and sanitization rules based on the patterns shown in this
documentation.

### Sample Prompts to Try

#### Basic Form Validation

```
Using @voilajsx/appkit/validation, create a validation schema for a user profile form with the following fields:
- Full name (required, 2-50 characters)
- Email (required, valid email format)
- Phone number (optional, international format)
- Bio (optional, max 500 characters, HTML sanitized)
- Social media links (optional, valid URLs)
- Age (required, 18-120)
```

#### E-commerce Product Validation

```
Using @voilajsx/appkit/validation, create comprehensive validation for an e-commerce product with:
- Product name, description, and SKU
- Pricing with sale price validation
- Inventory tracking
- Multiple product images
- Categories and tags
- Shipping dimensions and weight
- Variant support (size, color, etc.)
```

#### API Request Validation

```
Using @voilajsx/appkit/validation, create validation middleware for a REST API that handles:
- Authentication token validation
- Request rate limiting data
- Pagination parameters
- Search queries with filters
- File upload validation
- Error handling with proper HTTP status codes
```

## 📋 Example Code

For complete, working examples, check our examples folder:

| Example                                                                                                                     | Description                         | Key Features                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| [01-basic-validation.js](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/01-basic-validation.js)       | Simple validation examples          | String validation, number ranges, boolean checks, basic patterns    |
| [02-data-sanitization.js](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/02-data-sanitization.js)     | Input cleaning and normalization    | HTML sanitization, XSS prevention, data formatting, type conversion |
| [03-built-in-validators.js](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/03-built-in-validators.js) | Using built-in validator functions  | Email, URL, phone, credit card, password strength validation        |
| [04-prebuilt-schemas.js](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/04-prebuilt-schemas.js)       | Building complex validation schemas | Object validation, nested schemas, array validation, custom rules   |
| [05-async-validation.js](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/05-async-validation.js)       | Asynchronous validation patterns    | Database uniqueness checks, external API validation, async rules    |
| [06-custom-schemas.js](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/06-custom-schemas.js)           | Creating custom validation schemas  | Business logic validation, domain-specific rules, reusable schemas  |
| [07-api-validation.js](https://github.com/voilajsx/appkit/blob/main/src/validation/examples/07-api-validation.js)           | Express middleware integration      | Request validation, error handling, validation middleware patterns  |

## 🛡️ Security Best Practices

Following these practices will help ensure your validation system remains secure
and robust:

1. **Input Sanitization**: Always sanitize user input before processing or
   storage
2. **XSS Prevention**: Use HTML sanitization for user-generated content
3. **SQL Injection Prevention**: Validate data types and formats before database
   queries
4. **File Upload Security**: Validate file types, sizes, and content before
   processing
5. **Rate Limiting**: Validate request patterns to prevent abuse
6. **Error Information**: Don't expose sensitive system information in
   validation errors
7. **Schema Validation**: Use strict schemas and avoid overly permissive
   validation rules

## 📊 Performance Considerations

- **Early Termination**: Use `abortEarly: true` for better performance when you
  only need to know if data is valid
- **Async Validation**: Use `validateAsync()` only when necessary, as it's
  slower than sync validation
- **Schema Caching**: Cache compiled schemas for frequently used validation
  patterns
- **Sanitization Order**: Apply sanitization before validation to reduce
  processing overhead
- **Batch Validation**: Validate multiple items together when possible to reduce
  overhead

## 🔍 Error Handling

The module provides detailed error information that you should handle
appropriately:

```javascript
try {
  const result = validate(data, schema);

  if (!result.valid) {
    // Handle validation errors
    result.errors.forEach((error) => {
      console.log(`Field ${error.path}: ${error.message}`);
    });

    // Group errors by field
    const errorsByField = {};
    result.errors.forEach((error) => {
      if (!errorsByField[error.path]) {
        errorsByField[error.path] = [];
      }
      errorsByField[error.path].push(error.message);
    });
  }
} catch (error) {
  // Handle system errors
  console.error('Validation system error:', error.message);
}

// Using ValidationError class
import { ValidationError } from '@voilajsx/appkit/validation';

try {
  // ... validation code
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.getFormattedMessage());
    console.log('Field errors:', error.getErrorsByPath());
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Guide](https://github.com/voilajsx/appkit/blob/main/src/validation/docs/LLM_REFERENCE.md) -
  Comprehensive LLM guide

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
