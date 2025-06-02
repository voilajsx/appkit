# Error Module - Developer REFERENCE 🛠️

The error module provides simple, consistent error handling utilities for
Node.js applications. It offers standardized error types, custom error classes,
and zero-configuration middleware for Express applications - all with sensible
defaults to get you started quickly.

Whether you need basic error creation, automated error handling middleware, or
complete error management systems, this module provides flexible, composable
utilities that work with any Node.js framework.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🔍 [Error Types](#error-types)
  - [Standard Error Types](#standard-error-types)
  - [Custom Error Creation](#custom-error-creation)
  - [Complete Error Types Example](#complete-error-types-example)
- 📦 [Error Factory Functions](#error-factory-functions)
  - [Creating Validation Errors](#creating-validation-errors)
  - [Creating Resource Errors](#creating-resource-errors)
  - [Creating Auth Errors](#creating-auth-errors)
  - [Complete Error Factory Example](#complete-error-factory-example)
- 🛡️ [Error Middleware](#error-middleware)
  - [Basic Setup](#basic-setup)
  - [Automatic Error Recognition](#automatic-error-recognition)
  - [Environment-Specific Behavior](#environment-specific-behavior)
  - [Complete Middleware Example](#complete-middleware-example)
- 🔄 [Async Error Handling](#async-error-handling)
  - [Route Handler Protection](#route-handler-protection)
  - [Error Propagation](#error-propagation)
  - [Complete Async Example](#complete-async-example)
- 🌐 [404 Handling](#404-handling)
  - [Unmatched Routes](#unmatched-routes)
  - [Complete 404 Example](#complete-404-example)
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
  AppError,
  ErrorTypes,
  validationError,
  notFoundError,
  authError,
  serverError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
} from '@voilajsx/appkit/error';
```

## Error Types

The module provides 4 simple error types that cover all real-world scenarios
without complexity.

### Standard Error Types

Use the `ErrorTypes` enum for consistent error categorization:

```javascript
import { ErrorTypes } from '@voilajsx/appkit/error';

// The 4 simple error types
console.log(ErrorTypes.VALIDATION); // 'VALIDATION_ERROR' (400)
console.log(ErrorTypes.NOT_FOUND); // 'NOT_FOUND' (404)
console.log(ErrorTypes.AUTH); // 'AUTH_ERROR' (401)
console.log(ErrorTypes.SERVER); // 'SERVER_ERROR' (500)
```

**Expected Output:**

```
'VALIDATION_ERROR'
'NOT_FOUND'
'AUTH_ERROR'
'SERVER_ERROR'
```

**When to use:**

- **API Development**: For consistent HTTP status codes across your application
- **Error Logging**: For categorizing errors in logs and monitoring systems
- **Error Handling**: For routing different error types to appropriate handlers
- **Client Communication**: For providing clear error categories to API
  consumers

The beauty of this system is its simplicity - these 4 types cover virtually
every error scenario you'll encounter in web applications.

### Custom Error Creation

The `AppError` class provides the foundation for all application errors:

```javascript
import { AppError, ErrorTypes } from '@voilajsx/appkit/error';

// Create a custom error with all options
const error = new AppError(ErrorTypes.NOT_FOUND, 'User not found', {
  userId: '123',
  requestId: 'req_456',
});

console.log(error.type); // 'NOT_FOUND'
console.log(error.message); // 'User not found'
console.log(error.statusCode); // 404 (automatically mapped)
console.log(error.details); // { userId: '123', requestId: 'req_456' }

// Convert to JSON for API responses
console.log(error.toJSON());
// {
//   type: 'NOT_FOUND',
//   message: 'User not found',
//   details: { userId: '123', requestId: 'req_456' }
// }
```

**When to use:**

- **Custom Error Scenarios**: When the factory functions don't fit your specific
  needs
- **Detailed Error Context**: When you need to include additional information
- **Error Transformation**: When converting third-party library errors
- **Specialized Applications**: When you need fine-grained control over error
  properties

### Complete Error Types Example

Here's a real-world example demonstrating all error types:

```javascript
import { AppError, ErrorTypes } from '@voilajsx/appkit/error';

// Function that demonstrates different error scenarios
async function processUserRequest(userId, requestData, currentUser) {
  // Validation errors (400)
  if (!userId || typeof userId !== 'string') {
    throw new AppError(ErrorTypes.VALIDATION, 'Invalid user ID', {
      provided: userId,
      expected: 'string',
    });
  }

  // Authentication errors (401)
  if (!currentUser || !currentUser.token) {
    throw new AppError(ErrorTypes.AUTH, 'Authentication required', {
      action: 'user_access',
    });
  }

  // Resource not found errors (404)
  const user = await db.findUser(userId);
  if (!user) {
    throw new AppError(ErrorTypes.NOT_FOUND, 'User not found', {
      userId,
      searchedAt: new Date(),
    });
  }

  // Server errors (500) for unexpected issues
  try {
    return await processUserData(user, requestData);
  } catch (dbError) {
    throw new AppError(ErrorTypes.SERVER, 'Failed to process user data', {
      originalError: dbError.message,
      userId,
    });
  }
}
```

**When to implement:**

- **API Endpoints**: For comprehensive error handling in REST APIs
- **User Management Systems**: For handling various user-related operations
- **Data Processing Applications**: For robust error handling in data workflows
- **Authentication Systems**: For handling the full spectrum of auth-related
  errors

## Error Factory Functions

The module provides convenient factory functions to create standardized errors
quickly.

### Creating Validation Errors

Use `validationError` for input validation failures:

```javascript
import { validationError } from '@voilajsx/appkit/error';

// Simple validation error
throw validationError('Email is required');

// Validation error with details
throw validationError('Multiple validation failures', {
  email: 'Email is required',
  password: 'Password must be at least 8 characters',
  age: 'Age must be a positive number',
});

// Field-specific validation
function validateUser(userData) {
  const { email, password, age } = userData;

  if (!email) {
    throw validationError('Email is required', { field: 'email' });
  }

  if (!email.includes('@')) {
    throw validationError('Invalid email format', {
      field: 'email',
      value: email,
    });
  }

  if (!password || password.length < 8) {
    throw validationError('Password must be at least 8 characters', {
      field: 'password',
      minLength: 8,
      provided: password?.length || 0,
    });
  }
}
```

**Expected Output:**

An `AppError` with type `VALIDATION_ERROR`, status code 400, and the provided
message and details.

**When to use:**

- **Form Validation**: For validating user input in web forms
- **API Request Validation**: For validating incoming API parameters
- **Data Import**: For validating data before processing or storing
- **Configuration Validation**: For validating application configuration
- **Business Rule Validation**: For enforcing business logic constraints

Validation errors are perfect for providing clear, actionable feedback to users
about what needs to be corrected.

### Creating Resource Errors

Use `notFoundError` for missing resources:

```javascript
import { notFoundError } from '@voilajsx/appkit/error';

// Simple not found error
throw notFoundError('User not found');

// Using default message
throw notFoundError(); // Message: 'Not found'

// In context
async function getUserById(id) {
  const user = await db.findUser(id);

  if (!user) {
    throw notFoundError(`User with ID ${id} not found`);
  }

  return user;
}

// For different resource types
async function getResource(type, id) {
  const resource = await db.findResource(type, id);

  if (!resource) {
    throw notFoundError(`${type} not found`);
  }

  return resource;
}
```

**Expected Output:**

An `AppError` with type `NOT_FOUND`, status code 404, and the specified message.

**When to use:**

- **API Endpoints**: When requested resources don't exist
- **File Operations**: When files or directories can't be found
- **Database Queries**: When records don't exist
- **Route Handlers**: When URL parameters don't match existing resources
- **Navigation**: When pages or content can't be located

Not found errors are essential for RESTful APIs where specific resources are
requested by ID or other identifiers.

### Creating Auth Errors

Use `authError` for authentication and authorization failures:

```javascript
import { authError } from '@voilajsx/appkit/error';

// Simple auth error
throw authError('Invalid credentials');

// Using default message
throw authError(); // Message: 'Authentication failed'

// In authentication context
async function authenticateUser(email, password) {
  const user = await db.findUserByEmail(email);

  if (!user) {
    // Don't reveal if email exists
    throw authError('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

  if (!isValidPassword) {
    throw authError('Invalid credentials');
  }

  return user;
}

// For authorization
function requireAdmin(user) {
  if (!user.isAdmin) {
    throw authError('Admin access required');
  }
}

// For token validation
function validateToken(token) {
  if (!token) {
    throw authError('Authentication token required');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw authError('Invalid or expired token');
  }
}
```

**Expected Output:**

An `AppError` with type `AUTH_ERROR`, status code 401, and the specified
message.

**When to use:**

- **Login Systems**: For invalid username/password combinations
- **Token Validation**: For expired or invalid authentication tokens
- **Permission Checks**: For insufficient user permissions
- **API Authentication**: For unauthorized API access attempts
- **Session Management**: For expired or invalid sessions

Auth errors are crucial for maintaining application security while providing
clear feedback to users.

### Complete Error Factory Example

Here's a comprehensive user management function using all error types:

```javascript
import {
  validationError,
  notFoundError,
  authError,
  serverError,
} from '@voilajsx/appkit/error';

// Complete user update function with comprehensive error handling
async function updateUserProfile(userId, updates, currentUser) {
  // Input validation
  if (!userId) {
    throw validationError('User ID is required');
  }

  if (!updates || typeof updates !== 'object') {
    throw validationError('Update data is required');
  }

  // Validate specific fields
  const errors = {};

  if (updates.email && !isValidEmail(updates.email)) {
    errors.email = 'Invalid email format';
  }

  if (updates.age && (typeof updates.age !== 'number' || updates.age < 0)) {
    errors.age = 'Age must be a positive number';
  }

  if (updates.username && updates.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (Object.keys(errors).length > 0) {
    throw validationError('Validation failed', errors);
  }

  // Authentication check
  if (!currentUser) {
    throw authError('Authentication required');
  }

  // Authorization check
  if (currentUser.id !== userId && !currentUser.isAdmin) {
    throw authError('Cannot update other users profiles');
  }

  // Check if user exists
  let user;
  try {
    user = await db.findUser(userId);
  } catch (dbError) {
    throw serverError('Failed to retrieve user', {
      operation: 'findUser',
      error: dbError.message,
    });
  }

  if (!user) {
    throw notFoundError('User not found');
  }

  // Perform update
  try {
    const updatedUser = await db.updateUser(userId, updates);
    return updatedUser;
  } catch (dbError) {
    if (dbError.code === 11000) {
      // Duplicate key error
      throw validationError('Email already exists');
    }

    throw serverError('Failed to update user', {
      operation: 'updateUser',
      userId,
      error: dbError.message,
    });
  }
}
```

**When to implement:**

- **User Management APIs**: For comprehensive user operation error handling
- **Data Processing Services**: For robust validation and error reporting
- **E-commerce Applications**: For handling order processing with multiple
  validation steps
- **Content Management Systems**: For handling content creation and updates

## Error Middleware

The module provides zero-configuration middleware that automatically handles
various error types.

### Basic Setup

Use `errorHandler` to set up automatic error handling:

```javascript
import express from 'express';
import { errorHandler } from '@voilajsx/appkit/error';

const app = express();

// Add your routes here...

// Add error handler as the last middleware
app.use(errorHandler());

app.listen(3000);
```

**Expected Behavior:**

The middleware automatically:

- Catches all errors passed to `next(error)`
- Formats errors into consistent JSON responses
- Sets appropriate HTTP status codes
- Handles both custom `AppError` instances and generic errors

**When to use:**

- **Express Applications**: For centralized error handling in Express apps
- **REST APIs**: For consistent error response formatting
- **Web Applications**: For standardized error pages and responses
- **Microservices**: For uniform error handling across services

The error handler requires zero configuration but provides comprehensive error
handling out of the box.

### Automatic Error Recognition

The error handler intelligently recognizes and handles different error types:

```javascript
import { errorHandler } from '@voilajsx/appkit/error';

// The middleware automatically handles:

// 1. AppError instances - formatted with toJSON()
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id);
    if (!user) {
      throw notFoundError('User not found'); // -> 404 with proper JSON
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// 2. Validation errors from libraries like Mongoose
// ValidationError -> 400 with "Validation failed" message

// 3. MongoDB CastError for invalid IDs
// CastError -> 400 with "Invalid ID format" message

// 4. JWT errors
// JsonWebTokenError -> 401 with "Invalid token" message
// TokenExpiredError -> 401 with "Token expired" message

// 5. MongoDB duplicate key errors
// error.code === 11000 -> 409 with "Duplicate value" message

// 6. Generic errors -> 500 with generic message (production-safe)

app.use(errorHandler());
```

**Expected Output:**

All errors are formatted as JSON with consistent structure:

```json
{
  "type": "ERROR_TYPE",
  "message": "Human-readable error message",
  "details": "Additional context (optional)"
}
```

**When to use:**

- **Mixed Error Sources**: When your app uses multiple libraries that throw
  different error types
- **Library Integration**: When working with Mongoose, JWT libraries, etc.
- **Rapid Development**: When you want comprehensive error handling without
  manual setup
- **Production Applications**: When you need production-safe error responses

### Environment-Specific Behavior

The error handler adjusts its behavior based on the environment:

```javascript
import { errorHandler } from '@voilajsx/appkit/error';

// In development (NODE_ENV !== 'production')
// - Shows detailed error messages
// - Includes full error details

// In production (NODE_ENV === 'production')
// - Shows generic "Server error" for unhandled errors
// - Hides sensitive implementation details
// - Maintains security while providing useful feedback

// Example of environment-specific error responses:

// Development response for unhandled error:
{
  "type": "SERVER_ERROR",
  "message": "Cannot read property 'name' of undefined"
}

// Production response for same error:
{
  "type": "SERVER_ERROR",
  "message": "Server error"
}

// AppError instances always show their custom messages in both environments
app.use(errorHandler());
```

**When to use:**

- **Multi-Environment Deployments**: When you deploy to dev, staging, and
  production
- **Security-Conscious Applications**: When you need to prevent information
  leakage
- **Development Debugging**: When you want detailed errors during development
- **Production Monitoring**: When you want clean, user-friendly errors in
  production

### Complete Middleware Example

A comprehensive Express application setup with error handling:

```javascript
import express from 'express';
import {
  errorHandler,
  notFoundHandler,
  validationError,
  notFoundError,
} from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// Regular routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id);

    if (!user) {
      throw notFoundError('User not found');
    }

    res.json(user);
  } catch (error) {
    next(error); // Pass to error handler
  }
});

app.post('/users', async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      throw validationError('Email is required');
    }

    const user = await db.createUser({ email, name });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Handle 404s for unmatched routes (before error handler)
app.use(notFoundHandler());

// Handle all errors (must be last middleware)
app.use(errorHandler());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Async Error Handling

Async functions require special handling to properly catch Promise rejections.

### Route Handler Protection

Use `asyncHandler` to wrap async route handlers:

```javascript
import express from 'express';
import { asyncHandler, notFoundError } from '@voilajsx/appkit/error';

const app = express();

// Problem: Without asyncHandler, Promise rejections crash the server
app.get('/users-unsafe/:id', async (req, res) => {
  // If this throws, it becomes an unhandled Promise rejection
  const user = await db.findUser(req.params.id);
  if (!user) throw notFoundError('User not found');
  res.json(user);
});

// Solution: With asyncHandler, Promise rejections are caught
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    // If this throws, it's automatically passed to error middleware
    const user = await db.findUser(req.params.id);
    if (!user) throw notFoundError('User not found');
    res.json(user);
  })
);
```

**Expected Behavior:**

- **Without asyncHandler**: Promise rejections become unhandled rejections,
  potentially crashing the application
- **With asyncHandler**: Promise rejections are caught and passed to the error
  middleware

**When to use:**

- **All Async Routes**: For every Express route handler that uses async/await
- **Async Middleware**: For middleware functions that perform async operations
- **Database Operations**: When route handlers interact with databases
- **External API Calls**: When making HTTP requests to external services
- **File Operations**: When reading/writing files asynchronously

### Error Propagation

`asyncHandler` automatically forwards errors to the error middleware:

```javascript
import {
  asyncHandler,
  validationError,
  notFoundError,
  serverError,
} from '@voilajsx/appkit/error';

// Complex async operation with multiple error points
app.post(
  '/users/:id/avatar',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { imageData } = req.body;

    // Validation error - automatically caught and handled
    if (!imageData) {
      throw validationError('Image data is required');
    }

    // Check if user exists - not found error
    const user = await db.findUser(id);
    if (!user) {
      throw notFoundError('User not found');
    }

    // Process image - might throw server error
    try {
      const processedImage = await imageService.process(imageData);
      const savedPath = await fileService.save(processedImage);

      // Update user record
      await db.updateUser(id, { avatarPath: savedPath });

      res.json({ message: 'Avatar updated successfully' });
    } catch (processingError) {
      // Convert third-party errors to our error format
      throw serverError('Failed to process avatar', {
        operation: 'avatar_processing',
        originalError: processingError.message,
      });
    }
  })
);
```

**When to use:**

- **Multi-Step Operations**: When async operations have multiple failure points
- **Third-Party Integration**: When working with external services that might
  fail
- **Complex Business Logic**: When operations involve multiple async steps
- **Error Transformation**: When converting library errors to application errors

### Complete Async Example

A comprehensive async route handler with error handling:

```javascript
import express from 'express';
import {
  asyncHandler,
  validationError,
  notFoundError,
  authError,
  serverError,
  errorHandler,
} from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// User profile update with comprehensive async error handling
app.put(
  '/users/:id/profile',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, bio } = req.body;
    const authToken = req.headers.authorization;

    // Authentication validation
    if (!authToken) {
      throw authError('Authentication token required');
    }

    // Input validation
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.name = 'Name is required';
    }
    if (email && !isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }
    if (bio && bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    if (Object.keys(errors).length > 0) {
      throw validationError('Profile validation failed', errors);
    }

    // Verify token and get current user
    let currentUser;
    try {
      currentUser = await authService.verifyToken(authToken);
    } catch (authError) {
      throw authError('Invalid authentication token');
    }

    // Authorization check
    if (currentUser.id !== id && !currentUser.isAdmin) {
      throw authError('Cannot update other users profiles');
    }

    // Check if target user exists
    const targetUser = await db.findUser(id);
    if (!targetUser) {
      throw notFoundError('User not found');
    }

    // Check for email conflicts
    if (email && email !== targetUser.email) {
      const existingUser = await db.findUserByEmail(email);
      if (existingUser) {
        throw validationError('Email already in use');
      }
    }

    // Update user profile
    try {
      const updatedUser = await db.updateUser(id, {
        name: name.trim(),
        email,
        bio: bio?.trim(),
        updatedAt: new Date(),
      });

      // Log the update
      await auditService.logUserUpdate(currentUser.id, id, {
        name,
        email,
        bio,
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (dbError) {
      throw serverError('Failed to update user profile', {
        operation: 'user_update',
        userId: id,
        error: dbError.message,
      });
    }
  })
);

// Error handling middleware
app.use(errorHandler());

app.listen(3000);
```

## 404 Handling

Handle unmatched routes with the `notFoundHandler` middleware.

### Unmatched Routes

Use `notFoundHandler` to catch requests to undefined routes:

```javascript
import express from 'express';
import { notFoundHandler, errorHandler } from '@voilajsx/appkit/error';

const app = express();

// Define your routes
app.get('/users', (req, res) => {
  res.json({ users: [] });
});

app.get('/posts', (req, res) => {
  res.json({ posts: [] });
});

// Handle 404s (must come after all routes but before error handler)
app.use(notFoundHandler());

// Handle all errors (must be last)
app.use(errorHandler());
```

**Expected Behavior:**

When a request doesn't match any defined route:

- Creates a `NOT_FOUND` error with the requested path
- Returns a 404 status code
- Provides a descriptive error message

**When to use:**

- **All Express Applications**: To handle requests to non-existent routes
- **API Development**: To provide consistent 404 responses for REST APIs
- **Web Applications**: To catch typos in URLs and missing pages
- **SPA Backends**: To handle undefined API endpoints

### Complete 404 Example

A complete setup showing proper 404 handling:

```javascript
import express from 'express';
import {
  notFoundHandler,
  errorHandler,
  asyncHandler,
} from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get(
  '/api/users',
  asyncHandler(async (req, res) => {
    const users = await db.getAllUsers();
    res.json(users);
  })
);

app.get(
  '/api/users/:id',
  asyncHandler(async (req, res) => {
    const user = await db.findUser(req.params.id);
    if (!user) {
      throw notFoundError('User not found');
    }
    res.json(user);
  })
);

// Static file serving (if needed)
app.use(express.static('public'));

// Handle 404s for unmatched routes
// This catches requests like:
// - /api/nonexistent
// - /random-page
// - /api/users/123/invalid-endpoint
app.use(notFoundHandler());

// Handle all errors (including 404s from notFoundHandler)
app.use(errorHandler());

app.listen(3000);
```

**Expected Output:**

For a request to `/api/nonexistent`:

```json
{
  "type": "NOT_FOUND",
  "message": "Route GET /api/nonexistent not found"
}
```

## Complete Integration Example

Here's a production-ready example integrating all error handling features:

```javascript
import express from 'express';
import cors from 'cors';
import {
  AppError,
  ErrorTypes,
  validationError,
  notFoundError,
  authError,
  serverError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
} from '@voilajsx/appkit/error';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Authentication middleware
const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw authError('Authentication token required');
  }

  try {
    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    throw authError('Invalid or expired token');
  }
});

// Validation middleware factory
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const details = error.details.reduce((acc, detail) => {
        acc[detail.path[0]] = detail.message;
        return acc;
      }, {});
      throw validationError('Validation failed', details);
    }
    next();
  };
};

// Public routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// User routes
app.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw validationError('Email and password are required');
    }

    try {
      const { user, token } = await authService.login(email, password);
      res.json({ user, token });
    } catch (error) {
      throw authError('Invalid credentials');
    }
  })
);

app.get(
  '/api/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);

    if (!user) {
      throw notFoundError('User profile not found');
    }

    res.json(user);
  })
);

app.put(
  '/api/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, bio } = req.body;

    // Validation
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.name = 'Name is required';
    }
    if (bio && bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    if (Object.keys(errors).length > 0) {
      throw validationError('Profile validation failed', errors);
    }

    try {
      const updatedUser = await userService.updateProfile(req.user.id, {
        name: name.trim(),
        bio: bio?.trim(),
      });

      res.json(updatedUser);
    } catch (error) {
      throw serverError('Failed to update profile');
    }
  })
);

// Users management (admin only)
app.get(
  '/api/admin/users',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      throw authError('Admin access required');
    }

    const { page = 1, limit = 20 } = req.query;

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      throw validationError('Invalid page number');
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw validationError('Limit must be between 1 and 100');
    }

    try {
      const users = await userService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json(users);
    } catch (error) {
      throw serverError('Failed to retrieve users');
    }
  })
);

app.delete(
  '/api/admin/users/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user.isAdmin) {
      throw authError('Admin access required');
    }

    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      throw validationError('Cannot delete your own account');
    }

    const user = await userService.findById(id);
    if (!user) {
      throw notFoundError('User not found');
    }

    try {
      await userService.deleteUser(id);
      res.status(204).end();
    } catch (error) {
      throw serverError('Failed to delete user');
    }
  })
);

// Posts management
app.get(
  '/api/posts',
  asyncHandler(async (req, res) => {
    const { category, author, limit = 10 } = req.query;

    try {
      const posts = await postService.getPosts({
        category,
        author,
        limit: parseInt(limit) || 10,
      });

      res.json(posts);
    } catch (error) {
      throw serverError('Failed to retrieve posts');
    }
  })
);

app.get(
  '/api/posts/:id',
  asyncHandler(async (req, res) => {
    const post = await postService.findById(req.params.id);

    if (!post) {
      throw notFoundError('Post not found');
    }

    res.json(post);
  })
);

app.post(
  '/api/posts',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, content, category } = req.body;

    // Validation
    const errors = {};

    if (!title || title.trim().length === 0) {
      errors.title = 'Title is required';
    } else if (title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (!content || content.trim().length === 0) {
      errors.content = 'Content is required';
    } else if (content.length > 10000) {
      errors.content = 'Content must be less than 10,000 characters';
    }

    if (
      category &&
      !['tech', 'lifestyle', 'business', 'other'].includes(category)
    ) {
      errors.category = 'Invalid category';
    }

    if (Object.keys(errors).length > 0) {
      throw validationError('Post validation failed', errors);
    }

    try {
      const post = await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        category: category || 'other',
        authorId: req.user.id,
      });

      res.status(201).json(post);
    } catch (error) {
      if (error.code === 11000) {
        throw validationError('Post with this title already exists');
      }
      throw serverError('Failed to create post');
    }
  })
);

// File upload with error handling
app.post(
  '/api/upload',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.files || !req.files.file) {
      throw validationError('No file uploaded');
    }

    const file = req.files.file;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      throw validationError('File too large', {
        maxSize: '5MB',
        receivedSize: Math.round((file.size / 1024 / 1024) * 100) / 100 + 'MB',
      });
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw validationError('Invalid file type', {
        allowed: allowedTypes,
        received: file.mimetype,
      });
    }

    try {
      const uploadResult = await fileService.uploadFile(file, req.user.id);
      res.json(uploadResult);
    } catch (error) {
      throw serverError('File upload failed', {
        operation: 'file_upload',
        error: error.message,
      });
    }
  })
);

// Health check with database connectivity
app.get(
  '/api/health/detailed',
  asyncHandler(async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {},
    };

    // Check database connectivity
    try {
      await db.ping();
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check external API connectivity
    try {
      await externalApi.healthCheck();
      health.services.externalApi = 'connected';
    } catch (error) {
      health.services.externalApi = 'disconnected';
      health.status = 'degraded';
    }

    // Return appropriate status code
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  })
);

// Error simulation endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test/errors/:type', (req, res, next) => {
    const { type } = req.params;

    switch (type) {
      case 'validation':
        throw validationError('Test validation error', { field: 'test' });
      case 'notfound':
        throw notFoundError('Test resource not found');
      case 'auth':
        throw authError('Test authentication error');
      case 'server':
        throw serverError('Test server error');
      case 'generic':
        throw new Error('Test generic error');
      default:
        throw validationError('Invalid error type', {
          provided: type,
          allowed: ['validation', 'notfound', 'auth', 'server', 'generic'],
        });
    }
  });
}

// Handle 404s for unmatched routes
app.use(notFoundHandler());

// Global error handling middleware (must be last)
app.use(errorHandler());

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛡️ Error handling: Active`);
});

export default app;
```

**When to implement this comprehensive approach:**

- **Production APIs**: For robust error handling in real-world applications
- **Multi-feature Applications**: When your app has authentication, file
  uploads, and complex business logic
- **Team Projects**: For consistent error handling across team members
- **Client-facing Applications**: When you need reliable, user-friendly error
  responses

## Additional Resources

- 📘
  [README](https://github.com/voilajsx/appkit/blob/main/src/error/README.md) -
  Module overview and quick start
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/error/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Error Security

- **Hide Implementation Details**: Never expose internal system information in
  error messages
- **Sanitize Error Data**: Be careful about what information you include in
  error details
- **Use Generic Messages**: In production, use generic messages for server
  errors
- **Log Sensitive Information Separately**: Log detailed errors server-side,
  send generic messages to clients
- **Validate Error Sources**: Ensure error details don't contain
  user-controllable data that could be exploited

```javascript
// ❌ Bad - exposes internal information
throw serverError(
  `Database connection failed: ${dbConnection.host}:${dbConnection.port}`
);

// ✅ Good - generic message with internal logging
console.error('Database connection failed:', {
  host: dbConnection.host,
  port: dbConnection.port,
});
throw serverError('Service temporarily unavailable');
```

### 🏗️ Architecture

- **Centralize Error Types**: Use the 4 standard error types consistently across
  your application
- **Layer Error Handling**: Handle errors at the appropriate layer (validation
  in controllers, business logic in services)
- **Transform Third-party Errors**: Convert library-specific errors to your
  standard error format
- **Use Error Boundaries**: Implement error boundaries at logical application
  boundaries
- **Document Error Scenarios**: Clearly document when each error type should be
  used

```javascript
// ✅ Good - consistent error transformation
async function updateUser(id, data) {
  try {
    return await db.updateUser(id, data);
  } catch (dbError) {
    if (dbError.code === 11000) {
      throw validationError('Email already exists');
    }
    if (dbError.name === 'CastError') {
      throw validationError('Invalid user ID format');
    }
    throw serverError('Failed to update user');
  }
}
```

### 🚀 Performance

- **Avoid Error Creation in Hot Paths**: Don't create errors for normal flow
  control
- **Cache Error Objects**: For frequently used validation errors, consider
  caching error objects
- **Minimize Error Details**: Keep error detail objects small to reduce JSON
  serialization overhead
- **Use Early Returns**: Validate input early to avoid expensive operations on
  invalid data
- **Optimize Error Logging**: Use asynchronous logging to prevent blocking the
  event loop

```javascript
// ❌ Bad - error used for flow control
function findUser(id) {
  try {
    return db.findUser(id);
  } catch (error) {
    throw notFoundError('User not found'); // Creates error object unnecessarily
  }
}

// ✅ Good - normal return for expected case
async function findUser(id) {
  const user = await db.findUser(id);
  return user || null; // Let caller decide if null is an error
}
```

### 👥 User Experience

- **Provide Actionable Messages**: Tell users what they can do to fix the
  problem
- **Use Field-Specific Validation**: Include field names in validation errors
- **Maintain Consistency**: Use the same error format across your entire API
- **Include Error Codes**: Consider adding error codes for programmatic handling
- **Localize Error Messages**: For international applications, support multiple
  languages

```javascript
// ✅ Good - actionable, specific error messages
throw validationError('Registration failed', {
  email: 'Please enter a valid email address',
  password: 'Password must contain at least 8 characters and one number',
  terms: 'You must accept the terms of service to continue',
});
```

### 🔍 Monitoring and Debugging

- **Include Request Context**: Add request IDs, user IDs, and timestamps to
  error logs
- **Use Structured Logging**: Log errors in a structured format for easy parsing
- **Set Up Error Alerting**: Configure monitoring to alert on error rate
  increases
- **Track Error Patterns**: Monitor which errors occur most frequently
- **Include Recovery Information**: Log what users can do to recover from errors

```javascript
// ✅ Good - structured error logging with context
app.use((req, res, next) => {
  req.requestId = generateRequestId();
  next();
});

app.use(
  errorHandler({
    logger: (error, req) => {
      console.error({
        requestId: req.requestId,
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        error: {
          type: error.type,
          message: error.message,
          stack: error.stack,
        },
        timestamp: new Date().toISOString(),
      });
    },
  })
);
```

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
