# @voilajsx/appkit/error - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Middleware patterns should be adaptable

## Function Signatures

### 1. `AppError`

```typescript
class AppError extends Error {
  constructor(
    type: string,
    message: string,
    details?: Record<string, any> | null,
    statusCode?: number
  );

  toJSON(): Record<string, any>;
}
```

- Default `details`: `null`
- Default `statusCode`: `500`

### 2. `ErrorTypes`

```typescript
enum ErrorTypes {
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

### 3. `createError`

```typescript
function createError(
  type: string,
  message: string,
  details?: Record<string, any> | null
): AppError;
```

- Default `details`: `null`

### 4. `validationError`

```typescript
function validationError(errors: Record<string, string>): AppError;
```

### 5. `notFoundError`

```typescript
function notFoundError(entity: string, id: string): AppError;
```

### 6. `authenticationError`

```typescript
function authenticationError(message?: string): AppError;
```

- Default `message`: `'Authentication failed'`

### 7. `authorizationError`

```typescript
function authorizationError(message?: string): AppError;
```

- Default `message`: `'Insufficient permissions'`

### 8. `conflictError`

```typescript
function conflictError(
  message: string,
  details?: Record<string, any> | null
): AppError;
```

- Default `details`: `null`

### 9. `badRequestError`

```typescript
function badRequestError(
  message: string,
  details?: Record<string, any> | null
): AppError;
```

- Default `details`: `null`

### 10. `rateLimitError`

```typescript
function rateLimitError(
  message?: string,
  details?: Record<string, any> | null
): AppError;
```

- Default `message`: `'Rate limit exceeded'`
- Default `details`: `null`

### 11. `serviceUnavailableError`

```typescript
function serviceUnavailableError(message?: string): AppError;
```

- Default `message`: `'Service temporarily unavailable'`

### 12. `internalError`

```typescript
function internalError(
  message?: string,
  details?: Record<string, any> | null
): AppError;
```

- Default `message`: `'Internal server error'`
- Default `details`: `null`

### 13. `formatErrorResponse`

```typescript
function formatErrorResponse(error: Error): Record<string, any>;
```

### 14. `createErrorHandler`

```typescript
function createErrorHandler(options?: {
  logger?: (error: any) => void;
  includeStack?: boolean;
}): (error: Error, req: any, res: any, next: any) => void;
```

- Default `logger`: `console.error`
- Default `includeStack`: `false`

### 15. `asyncHandler`

```typescript
function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<any>
): (req: any, res: any, next: any) => void;
```

### 16. `notFoundHandler`

```typescript
function notFoundHandler(): (req: any, res: any, next: any) => void;
```

### 17. `handleUnhandledRejections`

```typescript
function handleUnhandledRejections(
  logger?: (reason: any, promise: Promise<any>) => void
): void;
```

- Default `logger`: `console.error`

### 18. `handleUncaughtExceptions`

```typescript
function handleUncaughtExceptions(logger?: (error: Error) => void): void;
```

- Default `logger`: `console.error`

### 19. `validateRequest`

```typescript
function validateRequest(schema: any): (req: any, res: any, next: any) => void;
```

## Example Implementations

### Basic Error Creation and Handling

```javascript
/**
 * Processes user data with error handling
 * @param {Object} userData - User data to process
 * @returns {Object} Processed user data
 * @throws {AppError} If user data is invalid
 */
function processUserData(userData) {
  if (!userData) {
    throw badRequestError('User data is required');
  }

  const { email, name, age } = userData;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!name) {
    errors.name = 'Name is required';
  }

  if (age !== undefined && (typeof age !== 'number' || age < 0)) {
    errors.age = 'Age must be a positive number';
  }

  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }

  // Process user data...
  return {
    id: generateId(),
    email,
    name,
    age,
    createdAt: new Date(),
  };
}
```

### Express Middleware Setup

```javascript
/**
 * Sets up error handling middleware for Express app
 * @param {Object} app - Express app instance
 */
function setupErrorHandling(app) {
  // Not found handler - should be after all routes
  app.use(notFoundHandler());

  // Global error handler - should be last middleware
  app.use(
    createErrorHandler({
      logger: (error) => {
        console.error('API Error:', {
          message: error.message,
          type: error.type,
          path: error.url,
          timestamp: new Date().toISOString(),
        });
      },
      includeStack: process.env.NODE_ENV !== 'production',
    })
  );

  // Set up global handlers
  handleUncaughtExceptions();
  handleUnhandledRejections();
}
```

### Async Route Handler

```javascript
/**
 * Retrieves user by ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
async function getUserById(req, res) {
  const userId = req.params.id;

  if (!userId) {
    throw badRequestError('User ID is required');
  }

  try {
    const user = await userService.findById(userId);

    if (!user) {
      throw notFoundError('User', userId);
    }

    res.json(user);
  } catch (error) {
    // If error is already an AppError, it will be passed through
    // If it's a different error, convert it to an appropriate AppError
    if (error.name === 'CastError') {
      throw badRequestError('Invalid user ID format', { id: userId });
    }

    throw error;
  }
}

// Usage with asyncHandler
app.get('/users/:id', asyncHandler(getUserById));
```

### Complete Error Handling System

```javascript
/**
 * Creates a complete error handling system for Express
 * @param {Object} app - Express app instance
 */
function createErrorSystem(app) {
  // Custom error handling middleware
  const errorHandler = createErrorHandler({
    logger: (error) => {
      // Log error details
      console.error({
        message: error.message,
        type: error.type || 'UNKNOWN',
        path: error.url,
        method: error.method,
        timestamp: new Date().toISOString(),
        // Don't log stack in production
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      });
    },
    includeStack: process.env.NODE_ENV !== 'production',
  });

  // Function to wrap route handlers
  const route = (fn) => asyncHandler(fn);

  // Validation middleware generator
  const validate = (schema) => validateRequest(schema);

  // Helper for checking permissions
  const requirePermission = (permission) => {
    return (req, res, next) => {
      if (!req.user || !req.user.permissions.includes(permission)) {
        throw authorizationError(`Required permission: ${permission}`);
      }
      next();
    };
  };

  // Apply error handling middleware
  app.use(notFoundHandler());
  app.use(errorHandler);

  // Register global handlers
  handleUncaughtExceptions();
  handleUnhandledRejections();

  // Return utility functions
  return {
    route,
    validate,
    requirePermission,
  };
}

// Usage example
const app = express();
const { route, validate, requirePermission } = createErrorSystem(app);

app.get(
  '/users',
  route(async (req, res) => {
    const users = await userService.findAll();
    res.json(users);
  })
);

app.post(
  '/users',
  validate(userSchema),
  route(async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  })
);

app.delete(
  '/users/:id',
  requirePermission('user:delete'),
  route(async (req, res) => {
    await userService.delete(req.params.id);
    res.status(204).end();
  })
);
```

## Code Generation Rules

1. **Always use descriptive errors**: Use the appropriate error factory function
   based on the error type rather than generic Error objects
2. **Include proper error details**: Provide relevant details in error objects
   to help debugging
3. **Wrap async route handlers**: Always use asyncHandler for Express async
   route handlers
4. **Use middleware composition**: Combine middleware functions for validation,
   authentication, and authorization
5. **Include JSDoc comments**: Document all functions with JSDoc format comments
6. **Handle all error cases**: Account for different types of errors that could
   occur
7. **Use environment variables**: Adjust behavior based on NODE_ENV
8. **Implement proper logging**: Log errors with useful context but avoid
   sensitive information

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
