# @voilajsx/appkit/error - LLM API Reference

**Note**: Implementation is in JavaScript. TypeScript signatures are for
reference only.

## LLM Code Generation Guidelines

1. **File Header Comments** (Required for all files):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/error
    * @file path/to/filename.js
    */
   ```

2. **Function JSDoc** (Required for all functions):

   ```javascript
   /**
    * One clear sentence describing what the function does
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Focus on reduced file size and clean code

4. **Comment Guidelines**:

   - **File headers**: Always include with description, module, and file path
   - **Function docs**: One clear sentence describing the purpose
   - **Inline comments**: Only for complex logic that's confusing or hard to
     understand
   - **No basic comments**: Avoid obvious comments like
     `// Create validation error` before `validationError()`
   - **Focus on minimal file size**: Comment only when necessary for
     understanding

5. **Error Handling Philosophy**:

   - Use the 4 simple error types: `VALIDATION`, `NOT_FOUND`, `AUTH`, `SERVER`
   - Always use factory functions instead of creating `AppError` directly
   - Include helpful details in error objects for debugging
   - Use `asyncHandler` for all async route handlers

6. **Database References**:

   - If database is needed, use generic `db` object (e.g., `db.findUser()`,
     `db.createUser()`)
   - Don't import or define `db` - assume it's available in scope
   - Keep database operations simple and generic

7. **Express Integration**:
   - Always use `asyncHandler` for async routes
   - Apply `errorHandler()` as the last middleware
   - Use `notFoundHandler()` before `errorHandler()`

## Function Signatures

### 1. `ErrorTypes`

```typescript
enum ErrorTypes {
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  AUTH = 'AUTH_ERROR',
  SERVER = 'SERVER_ERROR',
}
```

### 2. `AppError`

```typescript
class AppError extends Error {
  constructor(type: string, message: string, details?: any);

  type: string;
  message: string;
  details: any;
  statusCode: number;

  toJSON(): { type: string; message: string; details?: any };
  getStatusCode(type: string): number;
}
```

- Status mapping: VALIDATION→400, NOT_FOUND→404, AUTH→401, SERVER→500

### 3. `validationError`

```typescript
function validationError(message: string, details?: any): AppError;
```

### 4. `notFoundError`

```typescript
function notFoundError(message?: string): AppError;
```

- Default `message`: `'Not found'`

### 5. `authError`

```typescript
function authError(message?: string): AppError;
```

- Default `message`: `'Authentication failed'`

### 6. `serverError`

```typescript
function serverError(message?: string, details?: any): AppError;
```

- Default `message`: `'Server error'`

### 7. `errorHandler`

```typescript
function errorHandler(): (error: Error, req: any, res: any, next: any) => void;
```

- Zero configuration
- Automatically handles AppError, ValidationError, CastError, JWT errors,
  duplicate key errors

### 8. `asyncHandler`

```typescript
function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<any>
): (req: any, res: any, next: any) => void;
```

### 9. `notFoundHandler`

```typescript
function notFoundHandler(): (req: any, res: any, next: any) => void;
```

## Example Implementations

### Basic Error Creation

```javascript
/**
 * User validation utilities with comprehensive error handling
 * @module @voilajsx/appkit/error
 * @file examples/user-validation.js
 */

import {
  validationError,
  notFoundError,
  authError,
} from '@voilajsx/appkit/error';

/**
 * Validates user registration data
 * @param {Object} userData - User registration data
 * @returns {Object} Validated user data
 * @throws {AppError} If validation fails
 */
function validateUserRegistration(userData) {
  const { email, password, name } = userData;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!email.includes('@')) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  }

  if (Object.keys(errors).length > 0) {
    throw validationError('Registration validation failed', errors);
  }

  return { email, password, name: name.trim() };
}

/**
 * Finds user by ID with proper error handling
 * @param {string} userId - User ID to search for
 * @returns {Promise<Object>} User object
 * @throws {AppError} If user not found
 */
async function findUserById(userId) {
  const user = await db.findUser(userId);

  if (!user) {
    throw notFoundError('User not found');
  }

  return user;
}

/**
 * Verifies user has required permissions
 * @param {Object} user - User object
 * @param {string} requiredRole - Required role
 * @throws {AppError} If user lacks permission
 */
function requireRole(user, requiredRole) {
  if (!user) {
    throw authError('Authentication required');
  }

  if (!user.roles || !user.roles.includes(requiredRole)) {
    throw authError(`${requiredRole} access required`);
  }
}
```

### Express Middleware Setup

```javascript
/**
 * Express application with comprehensive error handling
 * @module @voilajsx/appkit/error
 * @file examples/express-app.js
 */

import express from 'express';
import {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationError,
  notFoundError,
  authError,
} from '@voilajsx/appkit/error';

/**
 * Creates Express app with error handling middleware
 * @returns {Object} Configured Express application
 */
function createApp() {
  const app = express();

  app.use(express.json());

  // Authentication middleware
  const authenticate = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw authError('Authentication token required');
    }

    const user = await verifyToken(token);
    if (!user) {
      throw authError('Invalid token');
    }

    req.user = user;
    next();
  });

  // Public routes
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Protected routes
  app.get(
    '/api/profile',
    authenticate,
    asyncHandler(async (req, res) => {
      const user = await db.findUser(req.user.id);
      if (!user) {
        throw notFoundError('User profile not found');
      }
      res.json(user);
    })
  );

  app.post(
    '/api/users',
    asyncHandler(async (req, res) => {
      const { email, name } = req.body;

      if (!email || !name) {
        throw validationError('Email and name are required');
      }

      const user = await db.createUser({ email, name });
      res.status(201).json(user);
    })
  );

  // Error handling middleware (order matters)
  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}
```

### Async Route Handlers

```javascript
/**
 * User management routes with async error handling
 * @module @voilajsx/appkit/error
 * @file examples/user-routes.js
 */

import {
  asyncHandler,
  validationError,
  notFoundError,
  authError,
  serverError,
} from '@voilajsx/appkit/error';

/**
 * Creates user profile update route handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Various error types based on failure
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  // Input validation
  const errors = {};

  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  }

  if (email && !email.includes('@')) {
    errors.email = 'Invalid email format';
  }

  if (bio && bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }

  if (Object.keys(errors).length > 0) {
    throw validationError('Profile validation failed', errors);
  }

  // Authorization check
  if (req.user.id !== id && !req.user.isAdmin) {
    throw authError('Cannot update other users profiles');
  }

  // Check if user exists
  const existingUser = await db.findUser(id);
  if (!existingUser) {
    throw notFoundError('User not found');
  }

  // Update user
  try {
    const updatedUser = await db.updateUser(id, {
      name: name.trim(),
      email,
      bio: bio?.trim(),
    });

    res.json(updatedUser);
  } catch (dbError) {
    throw serverError('Failed to update user profile');
  }
});

/**
 * Creates user deletion route handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Various error types based on failure
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Only admins can delete users
  if (!req.user.isAdmin) {
    throw authError('Admin access required');
  }

  // Prevent self-deletion
  if (id === req.user.id) {
    throw validationError('Cannot delete your own account');
  }

  const user = await db.findUser(id);
  if (!user) {
    throw notFoundError('User not found');
  }

  await db.deleteUser(id);
  res.status(204).end();
});
```

### Complete Application Example

```javascript
/**
 * Complete Express application with full error handling
 * @module @voilajsx/appkit/error
 * @file examples/complete-app.js
 */

import express from 'express';
import {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationError,
  notFoundError,
  authError,
  serverError,
} from '@voilajsx/appkit/error';

/**
 * Sets up complete Express application with error handling
 * @returns {Object} Configured Express application
 */
function setupApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Authentication middleware
  const auth = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw authError('Authentication required');
    }

    try {
      const user = await verifyJWT(token);
      req.user = user;
      next();
    } catch (error) {
      throw authError('Invalid or expired token');
    }
  });

  // Validation middleware factory
  const validateBody = (schema) => {
    return (req, res, next) => {
      const errors = {};

      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];

        if (rules.required && !value) {
          errors[field] = `${field} is required`;
        } else if (value && rules.type && typeof value !== rules.type) {
          errors[field] = `${field} must be a ${rules.type}`;
        } else if (value && rules.minLength && value.length < rules.minLength) {
          errors[field] =
            `${field} must be at least ${rules.minLength} characters`;
        }
      }

      if (Object.keys(errors).length > 0) {
        throw validationError('Validation failed', errors);
      }

      next();
    };
  };

  // Public endpoints
  app.post(
    '/auth/login',
    validateBody({
      email: { required: true, type: 'string' },
      password: { required: true, type: 'string', minLength: 8 },
    }),
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;

      const user = await db.findUserByEmail(email);
      if (!user) {
        throw authError('Invalid credentials');
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw authError('Invalid credentials');
      }

      const token = generateJWT(user);
      res.json({ token, user: { id: user.id, email: user.email } });
    })
  );

  // Protected endpoints
  app.get(
    '/api/profile',
    auth,
    asyncHandler(async (req, res) => {
      const user = await db.findUser(req.user.id);
      if (!user) {
        throw notFoundError('User profile not found');
      }
      res.json(user);
    })
  );

  app.put(
    '/api/profile',
    auth,
    validateBody({
      name: { required: true, type: 'string' },
      bio: { type: 'string' },
    }),
    asyncHandler(async (req, res) => {
      const { name, bio } = req.body;

      try {
        const updatedUser = await db.updateUser(req.user.id, { name, bio });
        res.json(updatedUser);
      } catch (error) {
        throw serverError('Failed to update profile');
      }
    })
  );

  // Admin endpoints
  app.get(
    '/api/admin/users',
    auth,
    asyncHandler(async (req, res) => {
      if (!req.user.isAdmin) {
        throw authError('Admin access required');
      }

      const users = await db.getAllUsers();
      res.json(users);
    })
  );

  // File upload with validation
  app.post(
    '/api/upload',
    auth,
    asyncHandler(async (req, res) => {
      if (!req.files || !req.files.file) {
        throw validationError('No file provided');
      }

      const file = req.files.file;
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        throw validationError('File too large', {
          maxSize: '5MB',
          receivedSize:
            Math.round((file.size / 1024 / 1024) * 100) / 100 + 'MB',
        });
      }

      try {
        const result = await uploadFile(file);
        res.json(result);
      } catch (error) {
        throw serverError('File upload failed');
      }
    })
  );

  // Error handling (order is important)
  app.use(notFoundHandler());
  app.use(errorHandler());

  return app;
}

// Start server
const app = setupApp();
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Error Transformation Patterns

```javascript
/**
 * Error transformation utilities for third-party libraries
 * @module @voilajsx/appkit/error
 * @file examples/error-transformation.js
 */

import {
  validationError,
  notFoundError,
  authError,
  serverError,
} from '@voilajsx/appkit/error';

/**
 * Transforms MongoDB errors to application errors
 * @param {Error} error - MongoDB error
 * @throws {AppError} Transformed application error
 */
function transformMongoError(error) {
  if (error.name === 'ValidationError') {
    const details = {};
    for (const field in error.errors) {
      details[field] = error.errors[field].message;
    }
    throw validationError('Validation failed', details);
  }

  if (error.name === 'CastError') {
    throw validationError('Invalid ID format');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    throw validationError(`${field} already exists`);
  }

  throw serverError('Database operation failed');
}

/**
 * Transforms JWT errors to authentication errors
 * @param {Error} error - JWT error
 * @throws {AppError} Transformed authentication error
 */
function transformJWTError(error) {
  if (error.name === 'TokenExpiredError') {
    throw authError('Token has expired');
  }

  if (error.name === 'JsonWebTokenError') {
    throw authError('Invalid token');
  }

  if (error.name === 'NotBeforeError') {
    throw authError('Token not active yet');
  }

  throw authError('Token verification failed');
}

/**
 * Database service with error transformation
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user
 * @throws {AppError} If operation fails
 */
async function updateUserSafely(userId, userData) {
  try {
    const user = await db.updateUser(userId, userData);
    if (!user) {
      throw notFoundError('User not found');
    }
    return user;
  } catch (error) {
    transformMongoError(error);
  }
}
```

## Code Generation Rules

1. **Always include file header** with description, @module, and @file tags
2. **Use JSDoc for all functions** with one clear sentence descriptions
3. **Add inline comments** only for complex logic that needs explanation
4. **Use the 4 error types consistently**: VALIDATION, NOT_FOUND, AUTH, SERVER
5. **Always use factory functions** instead of creating AppError directly
6. **Wrap all async routes** with asyncHandler
7. **Include error details** when helpful for debugging
8. **Use generic db object** for database operations without imports
9. **Apply error handling middleware** in correct order (notFoundHandler, then
   errorHandler)
10. **Transform third-party errors** to standard format
11. **Focus on minimal file size** - avoid unnecessary comments
12. **Follow ESM import style** with single quotes and semicolons

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
