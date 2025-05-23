# @voilajsx/appkit - Validation Module Developer Reference

This document provides a concise guide for developers using the Validation
module of `@voilajsx/appkit`. It includes minimal, easy-to-understand examples
for each function, focusing on practical usage with clear explanations and "When
to Use" guidance. The module supports schema-based validation and sanitization
for Node.js applications.

## Table of Contents

- [Getting Started](#getting-started)
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
- [Best Practices](#best-practices)

## Getting Started

Install the module:

```bash
npm install @voilajsx/appkit
```

Import functions:

```javascript
import { validate, sanitize, commonSchemas } from '@voilajsx/appkit/validation';
```

The Validation module helps you validate and sanitize data using schemas,
ensuring data integrity and security. Use it for API inputs, form data, database
records, and more.

## Core Validation Functions

### validate

Validates data against a schema synchronously.

```javascript
const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', email: true },
  },
};
const result = validate({ email: 'user@example.com' }, schema);
if (!result.valid) console.error(result.errors);
```

**When to Use**: For immediate validation of data, such as form inputs or API
payloads, when no async checks (e.g., database queries) are needed.

### validateAsync

Validates data asynchronously, supporting async validators.

```javascript
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      validateAsync: async (value) =>
        (await checkEmailExists(value)) ? 'Email taken' : true,
    },
  },
};
const result = await validateAsync({ email: 'user@example.com' }, schema);
```

**When to Use**: When validation requires async operations, like checking if an
email exists in a database.

### createValidator

Creates a reusable validator function for a schema.

```javascript
const validator = createValidator({
  type: 'object',
  properties: { name: { type: 'string', minLength: 1 } },
});
const result = validator({ name: 'Alice' });
```

**When to Use**: For repeated validation of the same schema, such as validating
multiple user inputs in a loop or across API endpoints.

## Sanitization Functions

### sanitize

Cleans data based on sanitization rules.

```javascript
const sanitized = sanitize(
  { email: '  User@Example.com  ' },
  { email: { trim: true, lowercase: true } }
);
```

**When to Use**: To clean user input before validation or storage, removing
unwanted characters or formatting data (e.g., trimming spaces, escaping HTML).

### sanitizeHtml

Sanitizes HTML content to prevent XSS attacks.

```javascript
const safeHtml = sanitizeHtml('<p onclick="alert()">Text</p>', {
  allowedTags: ['p'],
});
```

**When to Use**: When handling user-generated HTML content, such as comments or
rich text, to ensure only safe tags and attributes are allowed.

### createSanitizer

Creates a reusable sanitizer function.

```javascript
const sanitizer = createSanitizer({ name: { trim: true, escape: true } });
const sanitized = sanitizer({ name: '  <script>Alice</script>  ' });
```

**When to Use**: For repeated sanitization of similar data, such as cleaning
user inputs across multiple forms or API requests.

## Schema Functions

### commonSchemas

Provides predefined schemas for common data types.

```javascript
const schema = {
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
  },
};
```

**When to Use**: To quickly validate standard data types (e.g., emails, URLs,
UUIDs) without writing custom schemas.

### createSchema

Creates a new schema definition.

```javascript
const schema = createSchema({
  type: 'object',
  properties: { age: { type: 'number', min: 18 } },
});
```

**When to Use**: To define reusable schemas programmatically, especially when
generating schemas dynamically.

### mergeSchemas

Combines multiple schemas into one.

```javascript
const schema1 = { properties: { id: commonSchemas.id } };
const schema2 = { properties: { name: { type: 'string' } } };
const merged = mergeSchemas(schema1, schema2);
```

**When to Use**: To combine schemas for complex data structures, such as merging
user and profile schemas.

### extendSchema

Extends an existing schema with new properties or rules.

```javascript
const baseSchema = { properties: { id: commonSchemas.id } };
const extended = extendSchema(baseSchema, {
  properties: { role: { type: 'string' } },
});
```

**When to Use**: To add fields or rules to an existing schema, such as extending
a base user schema for admin users.

## Error Handling

### ValidationError

Handles validation errors with detailed information.

```javascript
try {
  const result = validate(data, schema);
  if (!result.valid) throw new ValidationError('Invalid data', result.errors);
} catch (error) {
  if (error instanceof ValidationError) console.error(error.getMessages());
}
```

**When to Use**: To catch and handle validation errors, providing user-friendly
error messages or logging detailed issues.

## Best Practices

1. **Sanitize First**: Always sanitize input before validation to prevent
   security issues.

   ```javascript
   const clean = sanitize(data, { email: { trim: true } });
   const result = validate(clean, schema);
   ```

2. **Use Common Schemas**: Leverage `commonSchemas` for standard data types.

   ```javascript
   const schema = { properties: { email: commonSchemas.email } };
   ```

3. **Reuse Validators/Sanitizers**: Use `createValidator` and `createSanitizer`
   for performance.

   ```javascript
   const validator = createValidator(schema);
   ```

4. **Handle Errors Gracefully**: Use `ValidationError` for detailed error
   reporting.

   ```javascript
   if (!result.valid) throw new ValidationError('Failed', result.errors);
   ```

5. **Validate Early**: Apply validation at API boundaries or form submission.
   ```javascript
   app.post('/register', (req, res) => {
     const result = validate(req.body, schema);
     if (!result.valid) res.status(400).json(result.errors);
   });
   ```

## Support

For issues or feature requests, visit our
[GitHub repository](https://github.com/voilajsx/appkit).

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
