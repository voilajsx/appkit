# Error Module API Reference

## Overview

The `@voilajsx/appkit/error` module provides simple, consistent error handling
utilities for Node.js applications, including standardized error types, custom
error classes, and Express middleware for automated error handling.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import {
  AppError,
  ErrorTypes,
  validationError,
  notFoundError,
  errorHandler,
  asyncHandler,
} from '@voilajsx/appkit/error';

// Create specific error types
throw validationError('Email is required', { field: 'email' });

// Protect Express routes from async errors
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw notFoundError('User not found');
    res.json(user);
  })
);

// Add global error handling middleware
app.use(errorHandler());
```

## API Reference

### Error Types

#### ErrorTypes

Enumeration of standardized error types.

| Error Type   | Description                                            |
| ------------ | ------------------------------------------------------ |
| `VALIDATION` | `'VALIDATION_ERROR'` - Input validation failures       |
| `NOT_FOUND`  | `'NOT_FOUND'` - Requested resource not found           |
| `AUTH`       | `'AUTH_ERROR'` - Authentication/authorization failures |
| `SERVER`     | `'SERVER_ERROR'` - Internal server errors              |

##### Example

```javascript
import { ErrorTypes } from '@voilajsx/appkit/error';

console.log(ErrorTypes.VALIDATION); // 'VALIDATION_ERROR'
console.log(ErrorTypes.NOT_FOUND); // 'NOT_FOUND'
console.log(ErrorTypes.AUTH); // 'AUTH_ERROR'
console.log(ErrorTypes.SERVER); // 'SERVER_ERROR'
```

### Error Classes

#### AppError(type, message, details)

Custom application error class that extends native Error.

##### Parameters

| Name      | Type     | Required | Default | Description                |
| --------- | -------- | -------- | ------- | -------------------------- |
| `type`    | `string` | Yes      | -       | Error type from ErrorTypes |
| `message` | `string` | Yes      | -       | Error message              |
| `details` | `Object` | No       | `null`  | Additional error details   |

##### Properties

| Name         | Type     | Description                    |
| ------------ | -------- | ------------------------------ |
| `name`       | `string` | Error name (always 'AppError') |
| `type`       | `string` | Error type                     |
| `message`    | `string` | Error message                  |
| `details`    | `Object` | Additional error details       |
| `statusCode` | `number` | HTTP status code (auto-mapped) |
| `stack`      | `string` | Stack trace                    |

##### Methods

| Method                | Returns  | Description                                |
| --------------------- | -------- | ------------------------------------------ |
| `toJSON()`            | `Object` | Converts error to JSON-serializable object |
| `getStatusCode(type)` | `number` | Gets HTTP status code for error type       |

##### Status Code Mapping

| Error Type   | Status Code | Description           |
| ------------ | ----------- | --------------------- |
| `VALIDATION` | 400         | Bad Request           |
| `NOT_FOUND`  | 404         | Not Found             |
| `AUTH`       | 401         | Unauthorized          |
| `SERVER`     | 500         | Internal Server Error |

##### Throws

- None

##### Example

```javascript
import { AppError, ErrorTypes } from '@voilajsx/appkit/error';

const error = new AppError(ErrorTypes.NOT_FOUND, 'User not found', {
  userId: '123',
});

console.log(error.statusCode); // 404
console.log(error.type); // 'NOT_FOUND'
console.log(error.toJSON());
// {
//   type: 'NOT_FOUND',
//   message: 'User not found',
//   details: { userId: '123' }
// }
```

### Error Factory Functions

#### validationError(message, details)

Creates a validation error for invalid user input.

##### Parameters

| Name      | Type     | Required | Default | Description              |
| --------- | -------- | -------- | ------- | ------------------------ |
| `message` | `string` | Yes      | -       | Validation error message |
| `details` | `Object` | No       | `null`  | Validation error details |

##### Returns

- `AppError` - Validation error instance with status code 400

##### Throws

- None

##### Example

```javascript
import { validationError } from '@voilajsx/appkit/error';

throw validationError('Email is required');

throw validationError('Validation failed', {
  email: 'Email is required',
  password: 'Password must be at least 8 characters',
});
```

---

#### notFoundError(message)

Creates a not found error for when a resource doesn't exist.

##### Parameters

| Name      | Type     | Required | Default       | Description   |
| --------- | -------- | -------- | ------------- | ------------- |
| `message` | `string` | No       | `'Not found'` | Error message |

##### Returns

- `AppError` - Not found error instance with status code 404

##### Throws

- None

##### Example

```javascript
import { notFoundError } from '@voilajsx/appkit/error';

throw notFoundError('User not found');
throw notFoundError(); // Uses default message
```

---

#### authError(message)

Creates an authentication/authorization error.

##### Parameters

| Name      | Type     | Required | Default                   | Description   |
| --------- | -------- | -------- | ------------------------- | ------------- |
| `message` | `string` | No       | `'Authentication failed'` | Error message |

##### Returns

- `AppError` - Authentication error instance with status code 401

##### Throws

- None

##### Example

```javascript
import { authError } from '@voilajsx/appkit/error';

throw authError('Invalid credentials');
throw authError(); // Uses default message
```

---

#### serverError(message, details)

Creates an internal server error for unexpected errors.

##### Parameters

| Name      | Type     | Required | Default          | Description   |
| --------- | -------- | -------- | ---------------- | ------------- |
| `message` | `string` | No       | `'Server error'` | Error message |
| `details` | `Object` | No       | `null`           | Error details |

##### Returns

- `AppError` - Server error instance with status code 500

##### Throws

- None

##### Example

```javascript
import { serverError } from '@voilajsx/appkit/error';

throw serverError('Database connection failed');
throw serverError('Processing failed', { operation: 'user_update' });
```

### Error Handler Functions

#### errorHandler()

Creates an Express error handler middleware that automatically handles various
error types and formats responses.

##### Parameters

- None

##### Returns

- `Function` - Express error middleware `(error, req, res, next) => void`

##### Error Handling

The middleware automatically handles:

- `AppError` instances - Formats using `toJSON()` with appropriate status codes
- `ValidationError` - Maps to 400 status with validation type
- `CastError` - Maps to 400 status for invalid ID formats
- `JsonWebTokenError` - Maps to 401 status for invalid tokens
- `TokenExpiredError` - Maps to 401 status for expired tokens
- MongoDB duplicate key errors (`code: 11000`) - Maps to 409 status
- Generic errors - Maps to 500 status (hides details in production)

##### Response Format

All error responses follow this JSON structure:

```json
{
  "type": "ERROR_TYPE",
  "message": "Error message",
  "details": "Additional details (optional)"
}
```

##### Throws

- None

##### Example

```javascript
import express from 'express';
import { errorHandler } from '@voilajsx/appkit/error';

const app = express();

// Add routes...

// Add error handler as last middleware
app.use(errorHandler());
```

---

#### asyncHandler(fn)

Wraps an async Express route handler to catch promise rejections and forward
them to the error middleware.

##### Parameters

| Name | Type       | Required | Description            |
| ---- | ---------- | -------- | ---------------------- |
| `fn` | `Function` | Yes      | Async function to wrap |

##### Returns

- `Function` - Wrapped Express middleware `(req, res, next) => void`

##### Throws

- None (catches and forwards errors)

##### Example

```javascript
import express from 'express';
import { asyncHandler, notFoundError } from '@voilajsx/appkit/error';

const app = express();

// Without asyncHandler - promise rejections aren't caught
app.get('/users-unsafe', async (req, res) => {
  // If this throws, it crashes the server
  const users = await db.getUsers();
  res.json(users);
});

// With asyncHandler - promise rejections are caught
app.get(
  '/users',
  asyncHandler(async (req, res) => {
    // If this throws, it's passed to error middleware
    const users = await db.getUsers();
    res.json(users);
  })
);

app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await db.getUser(req.params.id);
    if (!user) {
      throw notFoundError('User not found');
    }
    res.json(user);
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

- `AppError` - Creates a NOT_FOUND error for unmatched routes

##### Example

```javascript
import express from 'express';
import { notFoundHandler, errorHandler } from '@voilajsx/appkit/error';

const app = express();

// Add your routes...

// Handle 404s for unmatched routes (before error handler)
app.use(notFoundHandler());

// Handle all errors (must be last)
app.use(errorHandler());
```

## Error Handling Flow

The typical error handling flow in an Express application:

1. **Error occurs** - In route handler, middleware, or async operation
2. **Error is caught** - By `asyncHandler` (for async functions) or Express (for
   sync functions)
3. **Error is passed** - To error handling middleware via `next(error)`
4. **Error is processed** - By `errorHandler()` middleware
5. **Response is sent** - Formatted JSON response with appropriate status code

### Example Error Flow

```javascript
import express from 'express';
import {
  asyncHandler,
  notFoundError,
  validationError,
  errorHandler,
  notFoundHandler,
} from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// Route that might throw validation error
app.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
      // This error will be caught by asyncHandler
      // and passed to errorHandler middleware
      throw validationError('Email is required');
    }

    const user = await db.createUser({ email, name });
    res.status(201).json(user);
  })
);

// Route that might throw not found error
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await db.getUser(req.params.id);

    if (!user) {
      // This error will be caught and handled
      throw notFoundError('User not found');
    }

    res.json(user);
  })
);

// Handle 404s for unmatched routes
app.use(notFoundHandler());

// Handle all errors
app.use(errorHandler());

app.listen(3000);
```

## Common Error Responses

### Validation Error (400)

```json
{
  "type": "VALIDATION_ERROR",
  "message": "Email is required",
  "details": {
    "field": "email"
  }
}
```

### Not Found Error (404)

```json
{
  "type": "NOT_FOUND",
  "message": "User not found"
}
```

### Authentication Error (401)

```json
{
  "type": "AUTH_ERROR",
  "message": "Invalid credentials"
}
```

### Server Error (500)

```json
{
  "type": "SERVER_ERROR",
  "message": "Database connection failed"
}
```

## Security Considerations

1. **Production Error Messages**: In production (`NODE_ENV=production`), the
   error handler hides internal error details and shows generic "Server error"
   messages for unhandled errors.

2. **Stack Traces**: Stack traces are never included in API responses to prevent
   information leakage.

3. **Error Details**: Be careful about including sensitive information in error
   `details`. The error handler will include details in the response.

4. **Input Validation**: Always validate user input and use `validationError` to
   provide clear feedback without exposing internal logic.

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create declaration files:

```typescript
// Example type declarations
interface ErrorDetails {
  [key: string]: any;
}

interface AppErrorJSON {
  type: string;
  message: string;
  details?: ErrorDetails | null;
}

declare class AppError extends Error {
  type: string;
  details: ErrorDetails | null;
  statusCode: number;

  constructor(type: string, message: string, details?: ErrorDetails | null);
  toJSON(): AppErrorJSON;
  getStatusCode(type: string): number;
}
```

## Performance Tips

1. **Error Creation**: Error creation includes stack trace generation, which is
   moderately expensive. Avoid creating errors in high-frequency code paths.

2. **Error Middleware**: The error handler only runs when errors occur, adding
   no overhead to successful requests.

3. **Error Details**: Keep error detail objects small to minimize JSON
   serialization overhead.

4. **Early Validation**: Use validation errors early in request processing to
   fail fast and avoid expensive operations.

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
