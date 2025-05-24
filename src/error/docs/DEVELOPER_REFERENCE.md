# Error Module - Developer REFERENCE 🛠️

The error module provides comprehensive error handling utilities for Node.js
applications. It offers standardized error types, middleware for Express
applications, and utilities for consistent error responses - all with sensible
defaults to get you started quickly.

Whether you need simple error creation, middleware for API error handling, or
complete error management systems, this module provides flexible, composable
utilities that work with any Node.js framework.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🔍 [Error Types](#error-types)
  - [Standard Error Types](#standard-error-types)
  - [Custom Error Types](#custom-error-types)
  - [Complete Error Types Example](#complete-error-types-example)
- 📦 [Error Creation](#error-creation)
  - [Creating Basic Errors](#creating-basic-errors)
  - [Validation Errors](#validation-errors)
  - [Resource Errors](#resource-errors)
  - [Complete Error Creation Example](#complete-error-creation-example)
- 🛡️ [Error Middleware](#error-middleware)
  - [Basic Setup](#basic-setup)
  - [Custom Logging](#custom-logging)
  - [Environment-Specific Behavior](#environment-specific-behavior)
  - [Complete Middleware Example](#complete-middleware-example)
- 🔄 [Async Error Handling](#async-error-handling)
  - [Route Handlers](#route-handlers)
  - [Error Propagation](#error-propagation)
  - [Complete Async Example](#complete-async-example)
- 🌐 [Global Error Handlers](#global-error-handlers)
  - [Unhandled Rejections](#unhandled-rejections)
  - [Uncaught Exceptions](#uncaught-exceptions)
  - [Complete Global Handler Example](#complete-global-handler-example)
- 🚀 [Complete Integration Example](#complete-integration-example)
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
  createError,
  validationError,
  notFoundError,
  createErrorHandler,
  asyncHandler,
  ErrorTypes,
} from '@voilajsx/appkit/error';
```

## Error Types

The module provides standardized error types with appropriate HTTP status codes.

### Standard Error Types

Use the `ErrorTypes` enum for consistent error categorization:

```javascript
import { ErrorTypes } from '@voilajsx/appkit/error';

// Available error types
ErrorTypes.VALIDATION; // 400
ErrorTypes.NOT_FOUND; // 404
ErrorTypes.AUTHENTICATION; // 401
ErrorTypes.AUTHORIZATION; // 403
ErrorTypes.CONFLICT; // 409
ErrorTypes.BAD_REQUEST; // 400
ErrorTypes.RATE_LIMIT; // 429
ErrorTypes.SERVICE_UNAVAILABLE; // 503
ErrorTypes.INTERNAL; // 500
```

**Expected Output:**

Each error type maps to an appropriate HTTP status code and is used to
categorize errors in your application.

**When to use:**

- **API Development**: For consistent HTTP status codes
- **Error Logging**: For categorizing errors by type
- **Error Handling**: For routing errors to appropriate handlers
- **Client Feedback**: For providing clear error types to API consumers

### Custom Error Types

The `AppError` class provides a base for all application errors:

```javascript
import { AppError, ErrorTypes } from '@voilajsx/appkit/error';

// Create a custom error
const error = new AppError(
  ErrorTypes.NOT_FOUND,
  'User not found',
  { userId: '123' },
  404
);

console.log(error.type); // 'NOT_FOUND'
console.log(error.message); // 'User not found'
console.log(error.statusCode); // 404
console.log(error.details); // { userId: '123' }
```

**When to use:**

- **Specialized Errors**: When you need custom error types
- **Domain-Specific Errors**: For application-specific error cases
- **Detailed Error Info**: When you need to include error context
- **HTTP APIs**: When status codes are important

### Complete Error Types Example

Here's a real-world example using different error types:

```javascript
import { ErrorTypes, AppError } from '@voilajsx/appkit/error';

// Function that returns different error types
function processRequest(req) {
  // Check authentication
  if (!req.token) {
    return new AppError(
      ErrorTypes.AUTHENTICATION,
      'Authentication required',
      null,
      401
    );
  }

  // Check permissions
  if (!req.user.isAdmin) {
    return new AppError(
      ErrorTypes.AUTHORIZATION,
      'Admin access required',
      { requiredRole: 'admin' },
      403
    );
  }

  // Check if resource exists
  if (!req.data) {
    return new AppError(
      ErrorTypes.NOT_FOUND,
      'Resource not found',
      { id: req.id },
      404
    );
  }

  // Success - no error
  return null;
}
```

## Error Creation

The module provides convenient factory functions to create standardized errors.

### Creating Basic Errors

Use the `createError` function for generic errors:

```javascript
import { createError, ErrorTypes } from '@voilajsx/appkit/error';

// Create a basic error
const error = createError(ErrorTypes.BAD_REQUEST, 'Invalid parameters', {
  param: 'userId',
  value: 'abc',
});

console.log(error.statusCode); // 400
console.log(error.type); // 'BAD_REQUEST'
console.log(error.message); // 'Invalid parameters'
```

**Expected Output:**

An `AppError` instance with the specified type, message, details, and an
appropriate status code.

**When to use:**

- **Generic Errors**: When you need a custom error message
- **API Responses**: For consistent error responses
- **Error Bubbling**: When propagating errors up the call stack
- **Custom Error Details**: When you need to include context

### Validation Errors

Use `validationError` for input validation failures:

```javascript
import { validationError } from '@voilajsx/appkit/error';

// Form validation example
function validateForm(data) {
  const errors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }

  return data;
}
```

**Expected Output:**

An `AppError` with type `VALIDATION_ERROR`, status code 400, and detailed
validation errors.

**When to use:**

- **Form Validation**: For validating user input
- **API Requests**: For validating API parameters
- **Data Processing**: For validating data before processing
- **User Feedback**: For providing clear validation messages

### Resource Errors

Use specialized errors for common scenarios:

```javascript
import {
  notFoundError,
  authenticationError,
  authorizationError,
} from '@voilajsx/appkit/error';

// Resource not found
throw notFoundError('User', '123');

// Authentication failed
throw authenticationError('Invalid credentials');

// Insufficient permissions
throw authorizationError('Admin access required');
```

**Expected Output:**

Appropriate `AppError` instances with descriptive messages and correct status
codes.

**When to use:**

- **API Endpoints**: For standard API error responses
- **Resource Access**: When resources can't be found
- **Auth Flows**: For authentication and authorization errors
- **Conflict Handling**: For duplicate records or version conflicts

### Complete Error Creation Example

Here's a practical function using various error types:

```javascript
import {
  notFoundError,
  authorizationError,
  validationError,
} from '@voilajsx/appkit/error';

// User update function with error handling
async function updateUser(userId, data, currentUser) {
  // Validate input
  const errors = {};
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  if (data.age && (typeof data.age !== 'number' || data.age < 0)) {
    errors.age = 'Age must be a positive number';
  }

  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }

  // Check if user exists
  const user = await db.findUser(userId);
  if (!user) {
    throw notFoundError('User', userId);
  }

  // Check permissions
  if (user.id !== currentUser.id && !currentUser.isAdmin) {
    throw authorizationError('Cannot update other users');
  }

  // Update user
  return await db.updateUser(userId, data);
}
```

## Error Middleware

The module provides middleware for handling errors in Express applications.

### Basic Setup

Use `createErrorHandler` to set up error handling middleware:

```javascript
import express from 'express';
import { createErrorHandler } from '@voilajsx/appkit/error';

const app = express();

// Define routes...

// Add error handler (must be last middleware)
app.use(createErrorHandler());
```

**Expected Behavior:**

The middleware catches errors, formats them consistently, and sends appropriate
HTTP responses.

**When to use:**

- **Express Applications**: For centralized error handling
- **REST APIs**: For consistent error responses
- **JSON APIs**: For formatted JSON error messages
- **Any Node.js HTTP Server**: Compatible with any framework

### Custom Logging

Customize error logging with a custom logger:

```javascript
import { createErrorHandler } from '@voilajsx/appkit/error';

// Custom logger
function customLogger(error) {
  console.error('[ERROR]', {
    type: error.type || 'UNKNOWN',
    message: error.message,
    timestamp: new Date().toISOString(),
  });
}

// Create error handler with custom logger
const errorHandler = createErrorHandler({
  logger: customLogger,
});
```

**When to use:**

- **Structured Logging**: For better log readability
- **Error Monitoring**: For capturing additional context
- **Production Environments**: For controlled error information
- **Error Analytics**: For categorizing and analyzing errors

### Environment-Specific Behavior

Adjust error handling based on the environment:

```javascript
import { createErrorHandler } from '@voilajsx/appkit/error';

// Create environment-specific handler
const errorHandler = createErrorHandler({
  // Include stack traces in development only
  includeStack: process.env.NODE_ENV !== 'production',

  // Custom logger
  logger: (error) => {
    if (process.env.NODE_ENV === 'production') {
      // Production logging (minimal)
      console.error({
        type: error.type,
        message: error.message,
      });
    } else {
      // Development logging (verbose)
      console.error({
        type: error.type,
        message: error.message,
        details: error.details,
        stack: error.stack,
      });
    }
  },
});
```

**When to use:**

- **Multi-Environment Apps**: For different behavior in dev vs. prod
- **Security**: To avoid leaking sensitive info in production
- **Debugging**: For more details in development
- **Error Monitoring**: For sending errors to monitoring services

### Complete Middleware Example

A complete error handling setup for Express:

```javascript
import express from 'express';
import { createErrorHandler, notFoundHandler } from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// Add routes...

// Handle 404 errors for undefined routes
app.use(notFoundHandler());

// Add error handling middleware (last)
app.use(
  createErrorHandler({
    includeStack: process.env.NODE_ENV !== 'production',
    logger: (error) => {
      console.error({
        type: error.type || 'UNKNOWN',
        message: error.message,
        path: error.url,
        timestamp: new Date().toISOString(),
      });
    },
  })
);

app.listen(3000);
```

## Async Error Handling

Async functions require special handling to properly catch errors.

### Route Handlers

Use `asyncHandler` to wrap async route handlers:

```javascript
import express from 'express';
import { asyncHandler } from '@voilajsx/appkit/error';

const app = express();

// Without asyncHandler - errors aren't caught properly
app.get('/users-unsafe', async (req, res) => {
  // If this throws, it crashes the server
  const users = await db.getUsers();
  res.json(users);
});

// With asyncHandler - errors are caught
app.get(
  '/users',
  asyncHandler(async (req, res) => {
    // If this throws, it's passed to the error middleware
    const users = await db.getUsers();
    res.json(users);
  })
);
```

**Expected Behavior:**

Errors in async functions are caught and passed to the error middleware.

**When to use:**

- **Async Routes**: For all Express async route handlers
- **Middleware**: For async Express middleware
- **Promise-Based APIs**: When working with promises in routes
- **Database Operations**: When accessing databases in routes

### Error Propagation

`asyncHandler` automatically propagates errors to the error middleware:

```javascript
import { asyncHandler, notFoundError } from '@voilajsx/appkit/error';

// Using asyncHandler with custom errors
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await db.getUser(req.params.id);

    if (!user) {
      // This error is passed to the error middleware
      throw notFoundError('User', req.params.id);
    }

    res.json(user);
  })
);
```

**When to use:**

- **Resource Retrieval**: When fetching resources that might not exist
- **Multi-Step Operations**: When multiple async operations can fail
- **Error Transformation**: When converting library errors to AppErrors
- **Consistent Error Handling**: For uniform error responses

### Complete Async Example

A more complete example showing async error handling:

```javascript
import express from 'express';
import {
  asyncHandler,
  notFoundError,
  validationError,
  createErrorHandler,
} from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// Get user
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await db.getUser(req.params.id);

    if (!user) {
      throw notFoundError('User', req.params.id);
    }

    res.json(user);
  })
);

// Create user
app.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;
    const errors = {};

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (!name) errors.name = 'Name is required';

    if (Object.keys(errors).length > 0) {
      throw validationError(errors);
    }

    const user = await db.createUser({ email, name, password });
    res.status(201).json(user);
  })
);

// Error handler
app.use(createErrorHandler());

app.listen(3000);
```

## Global Error Handlers

Handle uncaught errors at the application level.

### Unhandled Rejections

Set up handlers for unhandled promise rejections:

```javascript
import { handleUnhandledRejections } from '@voilajsx/appkit/error';

// Basic handler
handleUnhandledRejections();

// Custom handler
handleUnhandledRejections((reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Log to external service
  logger.error({
    type: 'UNHANDLED_REJECTION',
    error: reason,
  });
});
```

**Expected Behavior:**

Logs unhandled promise rejections without crashing the application in
development, exits in production.

**When to use:**

- **Production Applications**: To prevent silent failures
- **Error Monitoring**: To track unhandled promises
- **Application Stability**: To ensure graceful handling of unexpected errors
- **Development**: To catch programming errors

### Uncaught Exceptions

Handle uncaught exceptions:

```javascript
import { handleUncaughtExceptions } from '@voilajsx/appkit/error';

// Basic handler
handleUncaughtExceptions();

// Custom handler
handleUncaughtExceptions((error) => {
  console.error('FATAL ERROR:', error);
  // Log to external service
  logger.fatal({
    type: 'UNCAUGHT_EXCEPTION',
    error: error.message,
    stack: error.stack,
  });
  // Force process exit with error code
  process.exit(1);
});
```

**Expected Behavior:**

Logs uncaught exceptions and exits the process to prevent undefined behavior.

**When to use:**

- **Production Applications**: For proper error tracking
- **Critical Systems**: To ensure proper failure handling
- **Monitoring Setups**: To be notified of critical errors
- **Restart Mechanisms**: With process managers like PM2

### Complete Global Handler Example

Setting up global error handling:

```javascript
import {
  handleUncaughtExceptions,
  handleUnhandledRejections,
} from '@voilajsx/appkit/error';

// Create logger
const logger = {
  error: (message) =>
    console.error(`[ERROR] ${new Date().toISOString()}:`, message),
  fatal: (message) =>
    console.error(`[FATAL] ${new Date().toISOString()}:`, message),
};

// Set up handlers
handleUncaughtExceptions((error) => {
  logger.fatal({
    type: 'UNCAUGHT_EXCEPTION',
    message: error.message,
    stack: error.stack,
  });

  // Exit with error code
  process.exit(1);
});

handleUnhandledRejections((reason) => {
  logger.error({
    type: 'UNHANDLED_REJECTION',
    message: reason?.message || String(reason),
  });

  // Exit in production, continue in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

console.log('Global error handlers registered');
```

## Complete Integration Example

Here's a complete example integrating all features:

```javascript
import express from 'express';
import {
  createErrorHandler,
  asyncHandler,
  notFoundError,
  validationError,
  authenticationError,
  handleUncaughtExceptions,
  handleUnhandledRejections,
} from '@voilajsx/appkit/error';

// Initialize Express
const app = express();
app.use(express.json());

// Basic auth middleware
const auth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw authenticationError('Authentication required');
  }

  req.user = await verifyToken(token); // Implement your own function
  next();
});

// Public routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes
app.get(
  '/profile',
  auth,
  asyncHandler(async (req, res) => {
    const user = await db.getUser(req.user.id);

    if (!user) {
      throw notFoundError('User', req.user.id);
    }

    res.json(user);
  })
);

// Post with validation
app.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { email, name, password } = req.body;
    const errors = {};

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      throw validationError(errors);
    }

    const user = await db.createUser({ email, name, password });
    res.status(201).json(user);
  })
);

// Handle 404s
app.use(notFoundHandler());

// Error handler
app.use(
  createErrorHandler({
    includeStack: process.env.NODE_ENV !== 'production',
  })
);

// Global handlers
handleUncaughtExceptions();
handleUnhandledRejections();

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Additional Resources

- 📘 [README](https://github.com/voilajs/appkit/blob/main/src/error/README.md) -
  Module overview and quick start
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/error/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Error Security

- Never include sensitive information in error details
- Use different error messages for internal vs. external errors
- Don't expose stack traces in production
- Log errors with request IDs for correlation
- Sanitize error messages before sending to clients

### 🏗️ Architecture

- Centralize error handling logic
- Use factory functions for consistent errors
- Map third-party errors to application errors
- Define clear error types for different scenarios
- Keep error details structured for easy processing

### 🚀 Performance

- Avoid creating errors in hot paths
- Use async logging to prevent blocking
- Keep error objects small
- Consider caching common validation errors
- Validate early to fail fast

### 👥 User Experience

- Provide clear, actionable error messages
- Include field-specific validation errors
- Use appropriate HTTP status codes
- Format errors consistently across API
- Include error reference codes for support

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
