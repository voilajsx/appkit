# Error Module

The error module provides comprehensive error handling utilities for Node.js applications, including custom error classes, consistent error formatting, and middleware for Express applications. It helps maintain clean, predictable error handling throughout your application.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Error Types](#error-types)
  - [Predefined Error Types](#predefined-error-types)
  - [Custom Error Classes](#custom-error-classes)
- [Creating Errors](#creating-errors)
  - [Using Factory Functions](#using-factory-functions)
  - [Using Error Classes](#using-error-classes)
  - [Validation Errors](#validation-errors)
- [Error Handling](#error-handling)
  - [Express Middleware](#express-middleware)
  - [Async Route Handlers](#async-route-handlers)
  - [Global Error Handlers](#global-error-handlers)
- [Error Formatting](#error-formatting)
  - [API Response Format](#api-response-format)
  - [Custom Formatting](#custom-formatting)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Introduction

Proper error handling is crucial for building robust applications. This module provides:

- Consistent error types and status codes
- Structured error responses for APIs
- Centralized error handling middleware
- Utilities for async/await error handling
- Development and production-ready logging

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { 
  createError,
  validationError,
  notFoundError,
  createErrorHandler,
  asyncHandler 
} from '@voilajs/appkit/error';
import express from 'express';

const app = express();

// Async route handler with automatic error catching
app.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw notFoundError('User', req.params.id);
  }
  
  res.json(user);
}));

// Validation error example
app.post('/user', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw validationError({
      email: !email ? 'Email is required' : null,
      password: !password ? 'Password is required' : null
    });
  }
  
  const user = await User.create({ email, password });
  res.status(201).json(user);
}));

// Add error handling middleware (should be last)
app.use(createErrorHandler());
```

## Error Types

### Predefined Error Types

The module provides common error types with associated HTTP status codes:

```javascript
import { ErrorTypes } from '@voilajs/appkit/error';

// Available error types and their status codes:
ErrorTypes.VALIDATION           // 400 - Bad Request
ErrorTypes.NOT_FOUND           // 404 - Not Found
ErrorTypes.AUTHENTICATION      // 401 - Unauthorized
ErrorTypes.AUTHORIZATION       // 403 - Forbidden
ErrorTypes.CONFLICT           // 409 - Conflict
ErrorTypes.BAD_REQUEST        // 400 - Bad Request
ErrorTypes.RATE_LIMIT         // 429 - Too Many Requests
ErrorTypes.SERVICE_UNAVAILABLE // 503 - Service Unavailable
ErrorTypes.INTERNAL           // 500 - Internal Server Error
```

### Custom Error Classes

The `AppError` class is the base for all application errors:

```javascript
import { AppError, ErrorTypes } from '@voilajs/appkit/error';

// Create custom error
const error = new AppError(
  ErrorTypes.CONFLICT,
  'Email already exists',
  { email: 'user@example.com' },
  409
);

// Error structure
console.log(error.type);       // 'CONFLICT'
console.log(error.message);    // 'Email already exists'
console.log(error.details);    // { email: 'user@example.com' }
console.log(error.statusCode); // 409
console.log(error.timestamp);  // '2024-01-01T00:00:00.000Z'
```

## Creating Errors

### Using Factory Functions

The module provides convenient factory functions for common errors:

```javascript
import { 
  createError,
  validationError,
  notFoundError,
  authenticationError,
  authorizationError,
  conflictError,
  badRequestError,
  rateLimitError,
  serviceUnavailableError
} from '@voilajs/appkit/error';

// Generic error creation
throw createError(ErrorTypes.BAD_REQUEST, 'Invalid input');

// Validation error with field details
throw validationError({
  email: 'Invalid email format',
  password: 'Password must be at least 8 characters'
});

// Resource not found
throw notFoundError('User', '123');

// Authentication failed
throw authenticationError('Invalid credentials');

// Insufficient permissions
throw authorizationError('Admin access required');

// Resource conflict
throw conflictError('Username already taken', { username: 'john' });

// Bad request
throw badRequestError('Invalid query parameters');

// Rate limit exceeded
throw rateLimitError('Too many login attempts', { 
  retryAfter: 60 
});

// Service unavailable
throw serviceUnavailableError('Database connection failed');
```

### Using Error Classes

For more control, create errors directly:

```javascript
import { AppError, ErrorTypes } from '@voilajs/appkit/error';

// Custom error with all options
const error = new AppError(
  ErrorTypes.VALIDATION,
  'Form validation failed',
  {
    errors: {
      email: 'Invalid format',
      age: 'Must be a number'
    }
  },
  400
);

// Extend AppError for domain-specific errors
class PaymentError extends AppError {
  constructor(message, details) {
    super(ErrorTypes.BAD_REQUEST, message, details, 402);
    this.name = 'PaymentError';
  }
}

throw new PaymentError('Payment failed', { 
  reason: 'Insufficient funds' 
});
```

### Validation Errors

Handle validation errors from various sources:

```javascript
// Manual validation
app.post('/register', asyncHandler(async (req, res) => {
  const errors = {};
  
  if (!req.body.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(req.body.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!req.body.password) {
    errors.password = 'Password is required';
  } else if (req.body.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }
  
  // Process valid data...
}));

// With validation library (e.g., Joi)
import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

app.post('/register', asyncHandler(async (req, res) => {
  const { error } = userSchema.validate(req.body);
  
  if (error) {
    const errors = {};
    error.details.forEach(detail => {
      errors[detail.path[0]] = detail.message;
    });
    throw validationError(errors);
  }
  
  // Process valid data...
}));
```

## Error Handling

### Express Middleware

The error handler middleware catches all errors and formats responses:

```javascript
import { createErrorHandler } from '@voilajs/appkit/error';

// Basic error handler
app.use(createErrorHandler());

// With options
app.use(createErrorHandler({
  logger: customLogger,        // Custom logging function
  includeStack: true          // Include stack trace in development
}));

// Custom logger example
const customLogger = (error) => {
  console.error({
    timestamp: new Date().toISOString(),
    error: error.message,
    type: error.type,
    stack: error.stack,
    // Additional context
    service: 'api',
    environment: process.env.NODE_ENV
  });
};
```

### Async Route Handlers

Use `asyncHandler` to automatically catch async errors:

```javascript
import { asyncHandler } from '@voilajs/appkit/error';

// Without asyncHandler - errors won't be caught
app.get('/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id); // Error here crashes app
  res.json(user);
});

// With asyncHandler - errors are caught and passed to error middleware
app.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id); // Error here is handled
  res.json(user);
}));

// Works with all async operations
app.post('/upload', asyncHandler(async (req, res) => {
  const file = await processFile(req.file);
  const saved = await saveToStorage(file);
  await notifyUser(req.user.id, saved);
  
  res.json({ success: true, fileId: saved.id });
}));
```

### Global Error Handlers

Handle uncaught exceptions and unhandled rejections:

```javascript
import { 
  handleUncaughtExceptions, 
  handleUnhandledRejections 
} from '@voilajs/appkit/error';

// Set up global handlers
handleUncaughtExceptions((error) => {
  console.error('Uncaught Exception:', error);
  // Log to external service
  errorLogger.critical(error);
});

handleUnhandledRejections((reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Log to external service
  errorLogger.error(reason);
});

// Or use default console.error logging
handleUncaughtExceptions();
handleUnhandledRejections();
```

## Error Formatting

### API Response Format

All errors are formatted consistently:

```javascript
// Error response structure
{
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": {
        "email": "Invalid email format",
        "password": "Password is required"
      }
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}

// Stack trace in development
{
  "error": {
    "type": "INTERNAL_ERROR",
    "message": "Database connection failed",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "stack": "Error: Database connection failed\n    at ..."
  }
}
```

### Custom Formatting

Customize error responses for specific needs:

```javascript
import { formatErrorResponse } from '@voilajs/appkit/error';

// Custom error formatter
function customErrorHandler(error, req, res, next) {
  const formatted = formatErrorResponse(error);
  
  // Add request ID
  formatted.error.requestId = req.id;
  
  // Add user context
  if (req.user) {
    formatted.error.userId = req.user.id;
  }
  
  // Custom status codes
  let statusCode = 500;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
  }
  
  res.status(statusCode).json(formatted);
}

// Different format for specific routes
app.use('/api/v2', (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message,
    code: error.type,
    data: error.details
  });
});
```

## Best Practices

### 1. Use Specific Error Types

```javascript
// ❌ Don't use generic errors
throw new Error('User not found');

// ✅ Use specific error types
throw notFoundError('User', userId);

// ❌ Don't use wrong status codes
throw new AppError('INTERNAL', 'User not found', null, 500);

// ✅ Use appropriate status codes
throw new AppError(ErrorTypes.NOT_FOUND, 'User not found', null, 404);
```

### 2. Include Helpful Details

```javascript
// ❌ Minimal error information
throw notFoundError('Resource', '123');

// ✅ Include context
throw notFoundError('User', userId, {
  email: email,
  searchCriteria: { email, username }
});

// ✅ Helpful validation errors
throw validationError({
  password: 'Password must contain at least one uppercase letter, one number, and be 8+ characters',
  email: 'Email domain is not allowed for registration'
});
```

### 3. Error Logging

```javascript
// Structured error logging
const errorLogger = {
  error: (error, context = {}) => {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      type: error.type || 'UNKNOWN',
      stack: error.stack,
      ...context
    });
  },
  
  critical: (error, context = {}) => {
    // Send to monitoring service
    monitoringService.alert({
      severity: 'critical',
      error: error.message,
      stack: error.stack,
      ...context
    });
  }
};

// Use in error handler
app.use(createErrorHandler({
  logger: (error) => {
    errorLogger.error(error, {
      service: 'api',
      version: process.env.APP_VERSION
    });
  }
}));
```

### 4. Environment-Specific Behavior

```javascript
// Development vs Production
app.use(createErrorHandler({
  includeStack: process.env.NODE_ENV !== 'production',
  logger: process.env.NODE_ENV === 'production' 
    ? productionLogger 
    : console.error
}));

// Production error messages
function sanitizeError(error) {
  if (process.env.NODE_ENV === 'production') {
    // Don't leak sensitive info in production
    if (error.type === ErrorTypes.INTERNAL) {
      error.message = 'An unexpected error occurred';
      delete error.details;
    }
  }
  return error;
}
```

### 5. Error Recovery

```javascript
// Graceful degradation
app.get('/recommendations', asyncHandler(async (req, res) => {
  try {
    const recommendations = await recommendationService.get(req.user.id);
    res.json(recommendations);
  } catch (error) {
    // Log error but don't fail the request
    console.error('Recommendation service failed:', error);
    
    // Return fallback data
    res.json({
      recommendations: [],
      fallback: true,
      message: 'Showing default recommendations'
    });
  }
}));

// Retry logic for transient errors
async function withRetry(operation, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      // Only retry on specific errors
      if (error.type === ErrorTypes.SERVICE_UNAVAILABLE) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      throw error;
    }
  }
}
```

## Real-World Examples

### Complete Express Application

```javascript
import express from 'express';
import { 
  createErrorHandler,
  asyncHandler,
  notFoundError,
  validationError,
  authenticationError
} from '@voilajs/appkit/error';

const app = express();
app.use(express.json());

// Authentication middleware
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw authenticationError('No token provided');
  }
  
  try {
    req.user = await verifyToken(token);
    next();
  } catch (error) {
    throw authenticationError('Invalid token');
  }
});

// User registration
app.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validate input
  const errors = {};
  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  if (password && password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }
  
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw conflictError('Email already registered', { email });
  }
  
  // Create user
  const user = await User.create({ email, password, name });
  const token = generateToken(user);
  
  res.status(201).json({ token, user });
}));

// Get user profile
app.get('/profile', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw notFoundError('User', req.user.id);
  }
  
  res.json(user);
}));

// Update user
app.put('/user/:id', requireAuth, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) {
    throw authorizationError('Cannot update other users');
  }
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  if (!user) {
    throw notFoundError('User', req.params.id);
  }
  
  res.json(user);
}));

// 404 handler
app.use((req, res, next) => {
  throw notFoundError('Route', `${req.method} ${req.url}`);
});

// Error handler (must be last)
app.use(createErrorHandler({
  logger: (error) => {
    console.error({
      timestamp: new Date().toISOString(),
      error: error.message,
      type: error.type,
      url: error.url,
      method: error.method
    });
  },
  includeStack: process.env.NODE_ENV !== 'production'
}));

app.listen(3000);
```

### Mongoose Integration

```javascript
// Handle Mongoose validation errors
const errorHandler = createErrorHandler({
  logger: console.error
});

// Mongoose schema with validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: isValidEmail,
      message: 'Invalid email format'
    }
  },
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old']
  }
});

// Errors are automatically formatted
app.post('/user', asyncHandler(async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    // Mongoose validation errors are handled
    if (error.name === 'ValidationError') {
      throw error; // Will be formatted by error handler
    }
    
    // Duplicate key errors
    if (error.code === 11000) {
      throw conflictError('Email already exists');
    }
    
    throw error;
  }
}));
```

### API Client Error Handling

```javascript
// API client with error handling
class ApiClient {
  async request(url, options = {}) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new AppError(
          error.error.type,
          error.error.message,
          error.error.details,
          response.status
        );
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Network errors
      throw serviceUnavailableError('Network request failed');
    }
  }
  
  async getUser(id) {
    try {
      return await this.request(`/api/users/${id}`);
    } catch (error) {
      if (error.type === ErrorTypes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }
}
```

## API Reference

### Error Classes and Types

| Class/Type | Description |
|------------|-------------|
| `AppError` | Base error class for all application errors |
| `ErrorTypes` | Enumeration of error types |

### Factory Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createError(type, message, details?)` | Creates custom error | `type: string`, `message: string`, `details?: Object` | `AppError` |
| `validationError(errors)` | Creates validation error | `errors: Object` | `AppError` |
| `notFoundError(entity, id)` | Creates not found error | `entity: string`, `id: string` | `AppError` |
| `authenticationError(message?)` | Creates authentication error | `message?: string` | `AppError` |
| `authorizationError(message?)` | Creates authorization error | `message?: string` | `AppError` |
| `conflictError(message, details?)` | Creates conflict error | `message: string`, `details?: Object` | `AppError` |
| `badRequestError(message, details?)` | Creates bad request error | `message: string`, `details?: Object` | `AppError` |
| `rateLimitError(message?, details?)` | Creates rate limit error | `message?: string`, `details?: Object` | `AppError` |
| `serviceUnavailableError(message?)` | Creates service unavailable error | `message?: string` | `AppError` |

### Handler Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `formatErrorResponse(error)` | Formats error for API response | `error: Error` | `Object` |
| `createErrorHandler(options?)` | Creates error handler middleware | `options?: {logger?, includeStack?}` | `Function` |
| `asyncHandler(fn)` | Wraps async functions for error handling | `fn: Function` | `Function` |
| `handleUnhandledRejections(logger?)` | Sets up unhandled rejection handler | `logger?: Function` | `void` |
| `handleUncaughtExceptions(logger?)` | Sets up uncaught exception handler | `logger?: Function` | `void` |

## Troubleshooting

### Common Issues

#### 1. Errors Not Being Caught

```javascript
// ❌ Problem: Async errors not caught
app.get('/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

// ✅ Solution: Use asyncHandler
app.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
}));

// ❌ Problem: Error middleware not last
app.use(createErrorHandler());
app.use('/api', apiRouter); // Won't catch errors from this router

// ✅ Solution: Error handler must be last
app.use('/api', apiRouter);
app.use(createErrorHandler());
```

#### 2. Wrong Status Codes

```javascript
// ❌ Problem: Using wrong error type
throw createError(ErrorTypes.INTERNAL, 'User not found');
// Results in 500 status code

// ✅ Solution: Use correct error type
throw notFoundError('User', userId);
// Results in 404 status code

// ✅ Or specify status code explicitly
throw new AppError(
  ErrorTypes.NOT_FOUND,
  'User not found',
  { userId },
  404
);
```

#### 3. Missing Error Details

```javascript
// ❌ Problem: Generic error messages
throw new Error('Validation failed');

// ✅ Solution: Include specific details
throw validationError({
  email: 'Email format is invalid',
  password: 'Password must be at least 8 characters',
  age: 'Age must be between 18 and 100'
});
```

#### 4. Unhandled Promise Rejections

```javascript
// ❌ Problem: Unhandled promise
User.findById(id).then(user => {
  // Error here is not caught
  processUser(user);
});

// ✅ Solution: Always handle promises
User.findById(id)
  .then(user => processUser(user))
  .catch(error => {
    console.error('Error processing user:', error);
  });

// ✅ Or use async/await with try-catch
try {
  const user = await User.findById(id);
  await processUser(user);
} catch (error) {
  console.error('Error processing user:', error);
}
```

### Debug Mode

Enable detailed error logging for debugging:

```javascript
// Debug error handler
const debugErrorHandler = createErrorHandler({
  includeStack: true,
  logger: (error) => {
    console.error('=== ERROR DEBUG ===');
    console.error('Type:', error.type);
    console.error('Message:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Details:', JSON.stringify(error.details, null, 2));
    console.error('Stack:', error.stack);
    console.error('=================');
  }
});

// Conditional debug mode
app.use(process.env.DEBUG === 'true' 
  ? debugErrorHandler 
  : createErrorHandler()
);
```

## Support

For issues and feature requests, visit our [GitHub repository](https://github.com/voilajs/appkit).