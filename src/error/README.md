# @voilajsx/appkit - Error Module ⚠️

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Simple, consistent error handling for Node.js applications

The Error module of `@voilajsx/appkit` provides a minimal yet powerful approach
to error handling with standardized error types, automatic HTTP status mapping,
and zero-config middleware that works with any Express-compatible framework.

## Module Overview

The Error module simplifies error handling with just what you need:

| Feature                  | What it does                          | Main functions                     |
| ------------------------ | ------------------------------------- | ---------------------------------- |
| **Error Classification** | Categorize errors into 4 simple types | `ErrorTypes`, `AppError`           |
| **Error Creation**       | Create standardized errors easily     | `validationError()`, `authError()` |
| **Middleware**           | Handle errors automatically           | `errorHandler()`, `asyncHandler()` |

## 🚀 Features

- **🎯 4 Simple Error Types** - Covers all real-world scenarios without
  complexity
- **⚡ Zero Configuration** - Error handler works out of the box
- **🔧 Auto Status Mapping** - Automatically sets correct HTTP status codes
- **🛡️ Framework Agnostic** - Works with Express, Fastify, Koa, and more
- **📦 Tiny Bundle Size** - Minimal overhead, maximum functionality
- **🚀 Production Ready** - Handles common errors from popular libraries

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

Import the functions you need and start handling errors consistently. The error
handler automatically formats responses and sets appropriate status codes.

```javascript
import {
  AppError,
  ErrorTypes,
  validationError,
  errorHandler,
  asyncHandler,
} from '@voilajsx/appkit/error';

// Create standardized errors
throw validationError('Email is required');
throw authError('Invalid credentials');

// Use zero-config error handling
app.use(errorHandler());
```

## 📖 Core Functions

### Error Types and Creation

These utilities help you create consistent, well-structured errors across your
application. Instead of throwing generic errors, use these standardized types
for better error handling and API responses.

| Function            | Purpose                           | When to use                                 |
| ------------------- | --------------------------------- | ------------------------------------------- |
| `validationError()` | Creates validation/input errors   | Invalid data, missing fields, format errors |
| `notFoundError()`   | Creates resource not found errors | Missing users, posts, files, routes         |
| `authError()`       | Creates authentication errors     | Login failures, invalid tokens, permissions |
| `serverError()`     | Creates internal server errors    | Database errors, external API failures      |

```javascript
// Validation errors
throw validationError('Email is required');
throw validationError('Invalid age', { field: 'age', value: -5 });

// Not found errors
throw notFoundError('User not found');
throw notFoundError(); // Uses default message

// Auth errors
throw authError('Invalid credentials');
throw authError('Token expired');

// Server errors
throw serverError('Database connection failed');
```

### Error Handling Middleware

These middleware functions automate error handling in your Express applications.
They catch errors, format responses consistently, and handle both sync and async
operations seamlessly.

| Function            | Purpose                          | When to use                        |
| ------------------- | -------------------------------- | ---------------------------------- |
| `errorHandler()`    | Handles all errors automatically | As the last middleware in your app |
| `asyncHandler()`    | Wraps async functions safely     | Around async route handlers        |
| `notFoundHandler()` | Handles 404 routes               | For unmatched routes               |

```javascript
// Wrap async routes to catch errors
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await db.findUser(req.params.id);
    if (!user) throw notFoundError('User not found');
    res.json({ user });
  })
);

// Handle 404s for unmatched routes
app.use(notFoundHandler());

// Handle all errors (must be last)
app.use(errorHandler());
```

## 🔧 Configuration Options

The examples above show basic usage, but you can customize error handling for
your specific needs. Here are the available options:

### Error Types

| Type         | Description               | Status Code | Example Use Cases                      |
| ------------ | ------------------------- | ----------- | -------------------------------------- |
| `VALIDATION` | Input validation failures | 400         | Missing fields, invalid formats        |
| `NOT_FOUND`  | Resource not found        | 404         | Missing users, invalid routes          |
| `AUTH`       | Authentication failures   | 401         | Login errors, token validation         |
| `SERVER`     | Internal server errors    | 500         | Database errors, external API failures |

```javascript
import { ErrorTypes } from '@voilajsx/appkit/error';

// Check error types
if (error.type === ErrorTypes.VALIDATION) {
  // Handle validation error
}
```

### Custom Error Details

| Option    | Description                  | Default    | Example                                |
| --------- | ---------------------------- | ---------- | -------------------------------------- |
| `message` | Human-readable error message | _Required_ | `'Email is required'`                  |
| `details` | Additional error information | `null`     | `{ field: 'email', code: 'REQUIRED' }` |

```javascript
validationError('Validation failed', {
  errors: {
    email: 'Email is required',
    age: 'Must be at least 18',
  },
});

authError('Authentication failed', {
  reason: 'invalid_token',
  expired: true,
});
```

## 💡 Common Use Cases

Here's where you can apply the error module's functionality in your
applications:

| Category             | Use Case              | Description                                 | Components Used                       |
| -------------------- | --------------------- | ------------------------------------------- | ------------------------------------- |
| **API Development**  | Input Validation      | Validate request data and return errors     | `validationError()`, `errorHandler()` |
|                      | Resource Management   | Handle missing resources gracefully         | `notFoundError()`, `asyncHandler()`   |
|                      | Authentication APIs   | Secure endpoints with proper error handling | `authError()`, `errorHandler()`       |
| **Web Applications** | Route Protection      | Handle authentication in web apps           | `authError()`, `notFoundHandler()`    |
|                      | Form Validation       | Validate user input in forms                | `validationError()`, `errorHandler()` |
|                      | Error Pages           | Show user-friendly error pages              | All error types, `errorHandler()`     |
| **Microservices**    | Service Communication | Handle errors between services              | `serverError()`, `asyncHandler()`     |
|                      | Database Operations   | Handle database errors consistently         | `serverError()`, `notFoundError()`    |
|                      | External API Calls    | Handle third-party API failures             | `serverError()`, `asyncHandler()`     |
| **Special Cases**    | Background Jobs       | Handle errors in worker processes           | All error types                       |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common error handling scenarios using the `@voilajsx/appkit/error` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajsx/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality error handling code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
clean, best-practice error handling code tailored to your specific requirements.

### Sample Prompts to Try

#### Basic Error Handling Setup

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md and then create a complete Express.js application with error handling using @voilajsx/appkit/error that includes:
- User registration and login with proper validation errors
- Protected routes with authentication errors
- Database operations with not found errors
- Global error handling middleware
```

#### Advanced Error Scenarios

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md and then implement comprehensive error handling for a REST API using @voilajsx/appkit/error with:
- Custom validation for complex business rules
- Graceful handling of database connection failures
- Proper error responses for different client types (web, mobile, API)
- Error logging and monitoring integration
```

#### Microservice Error Handling

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md and then create error handling for a microservice architecture using @voilajsx/appkit/error that includes:
- Service-to-service error communication
- Circuit breaker pattern for external API calls
- Centralized error logging across services
- Health check endpoints with proper error responses
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic Error Handling](https://github.com/voilajsx/appkit/blob/main/src/error/examples/01-basic-errors.js) -
  How to create and throw errors
- [Express Middleware](https://github.com/voilajsx/appkit/blob/main/src/error/examples/02-express-middleware.js) -
  Setting up error handling in Express
- [Async Route Handling](https://github.com/voilajsx/appkit/blob/main/src/error/examples/03-async-routes.js) -
  Handling errors in async operations
- [Complete API Server](https://github.com/voilajsx/appkit/blob/main/src/error/examples/04-complete-api.js) -
  A fully functional API with comprehensive error handling

## 🛡️ Error Handling Best Practices

Following these practices will help ensure your application handles errors
gracefully and securely:

1. **Use Specific Error Types**: Choose the most appropriate error type for
   better debugging and user experience
2. **Include Helpful Details**: Add context in error details to help with
   troubleshooting
3. **Don't Expose Sensitive Data**: Avoid including passwords, tokens, or
   internal details in error messages
4. **Handle Async Errors**: Always wrap async route handlers with
   `asyncHandler()`
5. **Log Errors Appropriately**: Log server errors for debugging but don't
   expose stack traces to users
6. **Provide User-Friendly Messages**: Use clear, actionable error messages that
   help users understand what went wrong

## 📊 Performance Considerations

- **Minimal Overhead**: Error creation and handling add negligible performance
  impact
- **Early Error Detection**: Fail fast with validation errors to save processing
  time
- **Efficient Middleware**: Error handler runs only when errors occur, not on
  every request
- **Stack Trace Management**: Stack traces are captured efficiently without
  performance degradation

## 🔍 Error Handling

The module provides consistent error handling across your application:

```javascript
try {
  const user = await createUser(userData);
} catch (error) {
  if (error instanceof AppError) {
    // Handle known application errors
    console.log(`Error type: ${error.type}`);
    console.log(`Message: ${error.message}`);
    console.log(`Details:`, error.details);
  } else {
    // Handle unexpected errors
    throw serverError('User creation failed');
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/error/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/error/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
