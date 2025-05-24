# Error Module API Reference

## Overview

The `@voilajsx/appkit/error` module provides comprehensive error handling
utilities for Node.js applications, including standardized error types,
consistent error formatting, middleware for Express applications, and async
error handling.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import {
  createError,
  validationError,
  notFoundError,
  createErrorHandler,
  asyncHandler,
} from '@voilajsx/appkit/error';

// Create specific error types
throw validationError({ email: 'Invalid email format' });

// Protect Express routes from async errors
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw notFoundError('User', req.params.id);
    res.json(user);
  })
);

// Add global error handling middleware
app.use(createErrorHandler());
```

## API Reference

### Error Types

#### ErrorTypes

Enumeration of standardized error types with their corresponding HTTP status
codes.

| Error Type            | Status Code | Description                               |
| --------------------- | ----------- | ----------------------------------------- |
| `VALIDATION`          | 400         | Validation errors for user input          |
| `NOT_FOUND`           | 404         | Requested resource not found              |
| `AUTHENTICATION`      | 401         | Authentication failure                    |
| `AUTHORIZATION`       | 403         | Permission denied                         |
| `CONFLICT`            | 409         | Resource conflict (e.g., duplicate entry) |
| `BAD_REQUEST`         | 400         | Invalid request parameters                |
| `RATE_LIMIT`          | 429         | Rate limit exceeded                       |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable           |
| `INTERNAL`            | 500         | Unexpected internal error                 |

### Error Classes

#### AppError(type, message, details, statusCode)

Base error class for all application errors.

##### Parameters

| Name         | Type     | Required | Default | Description                |
| ------------ | -------- | -------- | ------- | -------------------------- |
| `type`       | `string` | Yes      | -       | Error type from ErrorTypes |
| `message`    | `string` | Yes      | -       | Error message              |
| `details`    | `Object` | No       | `null`  | Additional error details   |
| `statusCode` | `number` | No       | `500`   | HTTP status code           |

##### Properties

| Name         | Type     | Description                          |
| ------------ | -------- | ------------------------------------ |
| `name`       | `string` | Error name (always 'AppError')       |
| `type`       | `string` | Error type                           |
| `message`    | `string` | Error message                        |
| `details`    | `Object` | Additional error details             |
| `statusCode` | `number` | HTTP status code                     |
| `timestamp`  | `string` | ISO timestamp when error was created |
| `stack`      | `string` | Stack trace                          |

##### Methods

| Method     | Returns  | Description                                |
| ---------- | -------- | ------------------------------------------ |
| `toJSON()` | `Object` | Converts error to JSON-serializable object |

##### Throws

- None

##### Example

```javascript
import { AppError, ErrorTypes } from '@voilajsx/appkit/error';

const error = new AppError(
  ErrorTypes.CONFLICT,
  'Username already exists',
  { username: 'john_doe' },
  409
);

console.log(error.statusCode); // 409
console.log(error.toJSON());
// {
//   type: 'CONFLICT',
//   message: 'Username already exists',
//   details: { username: 'john_doe' },
//   timestamp: '2023-05-15T12:34:56.789Z'
// }
```

### Error Factory Functions

#### createError(type, message, details)

Creates a custom application error with appropriate status code.

##### Parameters

| Name      | Type     | Required | Default | Description                |
| --------- | -------- | -------- | ------- | -------------------------- |
| `type`    | `string` | Yes      | -       | Error type from ErrorTypes |
| `message` | `string` | Yes      | -       | Error message              |
| `details` | `Object` | No       | `null`  | Additional error details   |

##### Returns

- `AppError` - Application error instance

##### Throws

- None

##### Example

```javascript
import { createError, ErrorTypes } from '@voilajsx/appkit/error';

throw createError(ErrorTypes.BAD_REQUEST, 'Invalid query parameters', {
  param: 'sort',
  value: 'invalid',
});
```

---

#### validationError(errors)

Creates a validation error for invalid user input.

##### Parameters

| Name     | Type     | Required | Default | Description                         |
| -------- | -------- | -------- | ------- | ----------------------------------- |
| `errors` | `Object` | Yes      | -       | Object containing validation errors |

##### Returns

- `AppError` - Validation error instance with status code 400

##### Throws

- None

##### Example

```javascript
import { validationError } from '@voilajsx/appkit/error';

throw validationError({
  email: 'Invalid email format',
  password: 'Password must be at least 8 characters',
});
```

---

#### notFoundError(entity, id)

Creates a not found error for when a resource doesn't exist.

##### Parameters

| Name     | Type     | Required | Default | Description                    |
| -------- | -------- | -------- | ------- | ------------------------------ |
| `entity` | `string` | Yes      | -       | Entity type that was not found |
| `id`     | `string` | Yes      | -       | Entity identifier              |

##### Returns

- `AppError` - Not found error instance with status code 404

##### Throws

- None

##### Example

```javascript
import { notFoundError } from '@voilajsx/appkit/error';

throw notFoundError('User', '123456');
// Error message: "User not found"
// Details: { entity: 'User', id: '123456' }
```

---

#### authenticationError(message)

Creates an authentication error for invalid credentials.

##### Parameters

| Name      | Type     | Required | Default                 | Description   |
| --------- | -------- | -------- | ----------------------- | ------------- |
| `message` | `string` | No       | 'Authentication failed' | Error message |

##### Returns

- `AppError` - Authentication error instance with status code 401

##### Throws

- None

##### Example

```javascript
import { authenticationError } from '@voilajsx/appkit/error';

throw authenticationError('Invalid token');
```

---

#### authorizationError(message)

Creates an authorization error for insufficient permissions.

##### Parameters

| Name      | Type     | Required | Default                    | Description   |
| --------- | -------- | -------- | -------------------------- | ------------- |
| `message` | `string` | No       | 'Insufficient permissions' | Error message |

##### Returns

- `AppError` - Authorization error instance with status code 403

##### Throws

- None

##### Example

```javascript
import { authorizationError } from '@voilajsx/appkit/error';

throw authorizationError('Admin access required');
```

---

#### conflictError(message, details)

Creates a conflict error for resource conflicts.

##### Parameters

| Name      | Type     | Required | Default | Description      |
| --------- | -------- | -------- | ------- | ---------------- |
| `message` | `string` | Yes      | -       | Error message    |
| `details` | `Object` | No       | `null`  | Conflict details |

##### Returns

- `AppError` - Conflict error instance with status code 409

##### Throws

- None

##### Example

```javascript
import { conflictError } from '@voilajsx/appkit/error';

throw conflictError('Email already registered', { email: 'user@example.com' });
```

---

#### badRequestError(message, details)

Creates a bad request error for invalid input.

##### Parameters

| Name      | Type     | Required | Default | Description   |
| --------- | -------- | -------- | ------- | ------------- |
| `message` | `string` | Yes      | -       | Error message |
| `details` | `Object` | No       | `null`  | Error details |

##### Returns

- `AppError` - Bad request error instance with status code 400

##### Throws

- None

##### Example

```javascript
import { badRequestError } from '@voilajsx/appkit/error';

throw badRequestError('Invalid date format', {
  field: 'startDate',
  value: '13/99/2023',
});
```

---

#### rateLimitError(message, details)

Creates a rate limit error when request limits are exceeded.

##### Parameters

| Name      | Type     | Required | Default               | Description        |
| --------- | -------- | -------- | --------------------- | ------------------ |
| `message` | `string` | No       | 'Rate limit exceeded' | Error message      |
| `details` | `Object` | No       | `null`                | Rate limit details |

##### Returns

- `AppError` - Rate limit error instance with status code 429

##### Throws

- None

##### Example

```javascript
import { rateLimitError } from '@voilajsx/appkit/error';

throw rateLimitError('Too many login attempts', {
  retryAfter: 60,
  maxAttempts: 5,
});
```

---

#### serviceUnavailableError(message)

Creates a service unavailable error when service is temporarily down.

##### Parameters

| Name      | Type     | Required | Default                           | Description   |
| --------- | -------- | -------- | --------------------------------- | ------------- |
| `message` | `string` | No       | 'Service temporarily unavailable' | Error message |

##### Returns

- `AppError` - Service unavailable error instance with status code 503

##### Throws

- None

##### Example

```javascript
import { serviceUnavailableError } from '@voilajsx/appkit/error';

throw serviceUnavailableError('Database connection failed');
```

---

#### internalError(message, details)

Creates an internal server error for unexpected errors.

##### Parameters

| Name      | Type     | Required | Default                 | Description   |
| --------- | -------- | -------- | ----------------------- | ------------- |
| `message` | `string` | No       | 'Internal server error' | Error message |
| `details` | `Object` | No       | `null`                  | Error details |

##### Returns

- `AppError` - Internal error instance with status code 500

##### Throws

- None

##### Example

```javascript
import { internalError } from '@voilajsx/appkit/error';

throw internalError('Unexpected data format', {
  receivedType: typeof data,
});
```

### Error Handler Functions

#### formatErrorResponse(error)

Formats an error for API response, converting various error types to a
consistent format.

##### Parameters

| Name    | Type    | Required | Default | Description     |
| ------- | ------- | -------- | ------- | --------------- |
| `error` | `Error` | Yes      | -       | Error to format |

##### Returns

- `Object` - Formatted error response with consistent structure

##### Throws

- None

##### Example

```javascript
import { formatErrorResponse } from '@voilajsx/appkit/error';

const error = new Error('Something went wrong');
const formattedError = formatErrorResponse(error);

// Result:
// {
//   error: {
//     type: 'INTERNAL_ERROR',
//     message: 'Something went wrong',
//     timestamp: '2023-05-15T12:34:56.789Z'
//   }
// }
```

---

#### createErrorHandler(options)

Creates an Express error handler middleware that formats errors and sends
appropriate responses.

##### Parameters

| Name                   | Type       | Required | Default         | Description                     |
| ---------------------- | ---------- | -------- | --------------- | ------------------------------- |
| `options`              | `Object`   | No       | `{}`            | Handler options                 |
| `options.logger`       | `Function` | No       | `console.error` | Logger function for errors      |
| `options.includeStack` | `boolean`  | No       | `false`         | Include stack trace in response |

##### Returns

- `Function` - Express error middleware `(error, req, res, next) => void`

##### Throws

- None

##### Example

```javascript
import express from 'express';
import { createErrorHandler } from '@voilajsx/appkit/error';

const app = express();

// Add routes...

// Add error handler as the last middleware
app.use(
  createErrorHandler({
    logger: customLogger,
    includeStack: process.env.NODE_ENV !== 'production',
  })
);

function customLogger(error) {
  console.error('[ERROR]', {
    message: error.message,
    type: error.type,
    timestamp: new Date().toISOString(),
  });
}
```

---

#### asyncHandler(fn)

Wraps an async Express route handler to catch promises rejections and forward
them to the error middleware.

##### Parameters

| Name | Type       | Required | Default | Description            |
| ---- | ---------- | -------- | ------- | ---------------------- |
| `fn` | `Function` | Yes      | -       | Async function to wrap |

##### Returns

- `Function` - Wrapped Express middleware `(req, res, next) => void`

##### Throws

- None

##### Example

```javascript
import express from 'express';
import { asyncHandler } from '@voilajsx/appkit/error';

const app = express();

// Without asyncHandler - errors in async functions aren't caught properly
app.get('/bad', async (req, res) => {
  // This error will crash the app
  throw new Error('Uncaught error');
});

// With asyncHandler - errors are caught and passed to error middleware
app.get(
  '/good',
  asyncHandler(async (req, res) => {
    // This error will be caught and handled properly
    throw new Error('Caught error');
  })
);
```

---

#### notFoundHandler()

Creates a middleware to handle 404 errors for undefined routes.

##### Parameters

- None

##### Returns

- `Function` - Express middleware `(req, res, next) => void`

##### Throws

- None

##### Example

```javascript
import express from 'express';
import { notFoundHandler, createErrorHandler } from '@voilajsx/appkit/error';

const app = express();

// Add routes...

// Add 404 handler after all routes
app.use(notFoundHandler());

// Add error handler last
app.use(createErrorHandler());
```

---

#### handleUnhandledRejections(logger)

Sets up a global handler for unhandled promise rejections.

##### Parameters

| Name     | Type       | Required | Default         | Description     |
| -------- | ---------- | -------- | --------------- | --------------- |
| `logger` | `Function` | No       | `console.error` | Logger function |

##### Returns

- `void`

##### Throws

- None

##### Example

```javascript
import { handleUnhandledRejections } from '@voilajsx/appkit/error';

// With default logger
handleUnhandledRejections();

// With custom logger
handleUnhandledRejections((reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Send to error monitoring service
  errorMonitoring.captureException(reason);
});
```

---

#### handleUncaughtExceptions(logger)

Sets up a global handler for uncaught exceptions.

##### Parameters

| Name     | Type       | Required | Default         | Description     |
| -------- | ---------- | -------- | --------------- | --------------- |
| `logger` | `Function` | No       | `console.error` | Logger function |

##### Returns

- `void`

##### Throws

- None

##### Example

```javascript
import { handleUncaughtExceptions } from '@voilajsx/appkit/error';

// With default logger
handleUncaughtExceptions();

// With custom logger
handleUncaughtExceptions((error) => {
  console.error('Uncaught Exception:', error);
  // Send to error monitoring service
  errorMonitoring.captureException(error);
  // Force process exit after logging
  process.exit(1);
});
```

---

#### validateRequest(schema)

Creates middleware to validate request body against a schema.

##### Parameters

| Name     | Type     | Required | Default | Description       |
| -------- | -------- | -------- | ------- | ----------------- |
| `schema` | `Object` | Yes      | -       | Validation schema |

##### Returns

- `Function` - Express middleware `(req, res, next) => void`

##### Throws

- `AppError` - If validation fails, with status code 400

##### Example

```javascript
import express from 'express';
import Joi from 'joi';
import { validateRequest } from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(18).required(),
});

app.post('/users', validateRequest(userSchema), (req, res) => {
  // If we get here, request is valid
  res.status(201).json({ success: true });
});
```

## Error Handling

All functions in this module are designed to work together to provide consistent
error handling. The typical flow is:

1. An error occurs (thrown by your code or a third-party library)
2. The error is caught by `asyncHandler` (for async functions)
3. The error is passed to `createErrorHandler` middleware
4. The middleware formats the error using `formatErrorResponse`
5. The formatted error is sent as an HTTP response with appropriate status code

### Common Error Messages

| Error Type            | Example Message                   | Example Status Code |
| --------------------- | --------------------------------- | ------------------- |
| `VALIDATION`          | "Validation failed"               | 400                 |
| `NOT_FOUND`           | "User not found"                  | 404                 |
| `AUTHENTICATION`      | "Authentication failed"           | 401                 |
| `AUTHENTICATION`      | "Invalid token"                   | 401                 |
| `AUTHENTICATION`      | "Token expired"                   | 401                 |
| `AUTHORIZATION`       | "Insufficient permissions"        | 403                 |
| `CONFLICT`            | "Email already exists"            | 409                 |
| `BAD_REQUEST`         | "Invalid query parameters"        | 400                 |
| `RATE_LIMIT`          | "Rate limit exceeded"             | 429                 |
| `SERVICE_UNAVAILABLE` | "Service temporarily unavailable" | 503                 |
| `INTERNAL`            | "Internal server error"           | 500                 |

## Security Considerations

1. **Production Error Messages**: In production, generic error messages should
   be used for system errors to avoid leaking implementation details. Set
   `NODE_ENV=production` to ensure this behavior.

2. **Error Details in Responses**: Be careful about including sensitive
   information in error details. Consider filtering or sanitizing error details
   before sending to clients.

3. **Error Logging**: Log all errors with sufficient context for debugging, but
   be careful not to log sensitive information like passwords or tokens.

4. **Stack Traces**: Never include stack traces in production API responses. Use
   the `includeStack: false` option with `createErrorHandler` in production.

5. **Rate Limiting**: Implement rate limiting for authentication endpoints to
   prevent brute force attacks and use `rateLimitError` to provide clear
   feedback.

6. **Validation**: Always validate user input to prevent injection attacks and
   provide clear validation errors with `validationError`.

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create declaration files or
use JSDoc type annotations.

```typescript
// Example type declarations
interface ErrorOptions {
  logger?: (error: any) => void;
  includeStack?: boolean;
}

interface ValidationErrors {
  [field: string]: string;
}

interface AppErrorDetails {
  [key: string]: any;
}
```

## Performance Tips

1. **Error Creation**: Creating errors is a relatively expensive operation due
   to stack trace generation. Avoid creating errors in hot paths that are
   executed frequently.

2. **Error Logging**: Use asynchronous logging methods for error logging to
   avoid blocking the event loop.

3. **Validation Middleware**: Place validation middleware early in the request
   pipeline to fail fast before performing expensive operations.

4. **Custom Details**: Keep error details objects small to minimize
   serialization overhead in responses.

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
