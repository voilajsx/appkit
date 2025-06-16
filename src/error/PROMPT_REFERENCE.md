# @voilajsx/appkit/error - LLM API Reference

**Implementation**: JavaScript ES6 modules with object-driven API design.

## LLM Code Generation Guidelines

### File Structure Requirements

1. **File Header** (mandatory):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/error
    * @file path/to/filename.js
    */
   ```

2. **Function Documentation** (mandatory):

   ```javascript
   /**
    * One clear sentence describing what the function does
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    */
   ```

3. **Code Style**:
   - ESM imports with single quotes
   - 2-space indentation
   - Semicolons required
   - Minimal comments (only for complex logic)

### Environment Variable Strategy

- **Auto-detect behavior** from environment variables
- **Smart defaults** for development vs production
- **Never hardcode configuration** in code examples

## Essential API

### Single Import Pattern

```javascript
import { error } from '@voilajsx/appkit/error';
```

### Core Function

```javascript
// Main function - returns error object with all methods
const err = error.get(); // Environment parsed once for performance
```

### Error Object Methods

```javascript
// Error creation methods (6)
err.badRequest(message); // 400 - Client input errors
err.unauthorized(message); // 401 - Authentication required
err.forbidden(message); // 403 - Access denied
err.notFound(message); // 404 - Resource missing
err.conflict(message); // 409 - Business logic conflicts
err.serverError(message); // 500 - Internal errors

// Middleware methods (2)
err.handleErrors(options); // Express error handling middleware
err.asyncRoute(fn); // Async route wrapper
```

## Code Patterns for AI Generation

### 1. Basic Express Setup

```javascript
/**
 * Express application with object-driven error handling
 * @module @voilajsx/appkit/error
 * @file examples/basic-express.js
 */

import express from 'express';
import { error } from '@voilajsx/appkit/error';

const app = express();
const err = error.get();

app.use(express.json());

// Global error handling (must be last)
app.use(err.handleErrors());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 2. Route with Validation

```javascript
/**
 * User registration route with comprehensive validation
 * @module @voilajsx/appkit/error
 * @file routes/auth.js
 */

import { error } from '@voilajsx/appkit/error';

const err = error.get();

export const registerUser = err.asyncRoute(async (req, res) => {
  const { email, password, name } = req.body;

  // Input validation
  if (!email) throw err.badRequest('Email is required');
  if (!password) throw err.badRequest('Password is required');
  if (!name) throw err.badRequest('Name is required');

  // Business logic validation
  const existingUser = await db.findUserByEmail(email);
  if (existingUser) throw err.conflict('Email already registered');

  try {
    const user = await db.createUser({ email, password, name });
    res.status(201).json({ user });
  } catch (dbError) {
    throw err.serverError('Failed to create user');
  }
});
```

### 3. Protected Route with Authentication

```javascript
/**
 * Protected route with authentication and authorization
 * @module @voilajsx/appkit/error
 * @file routes/protected.js
 */

import { error } from '@voilajsx/appkit/error';

const err = error.get();

export const getUserProfile = err.asyncRoute(async (req, res) => {
  // Authentication check
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw err.unauthorized('Login required');

  try {
    const decoded = verifyToken(token);
    const user = await db.findUser(decoded.userId);

    if (!user) throw err.notFound('User not found');

    res.json({ user });
  } catch (tokenError) {
    throw err.unauthorized('Invalid token');
  }
});

export const deleteUser = err.asyncRoute(async (req, res) => {
  // Authorization check
  if (!req.user?.isAdmin) {
    throw err.forbidden('Admin access required');
  }

  const user = await db.findUser(req.params.id);
  if (!user) throw err.notFound('User not found');

  try {
    await db.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (dbError) {
    throw err.serverError('Failed to delete user');
  }
});
```

### 4. Service Class with Error Handling

```javascript
/**
 * User service with comprehensive error handling
 * @module @voilajsx/appkit/error
 * @file services/user-service.js
 */

import { error } from '@voilajsx/appkit/error';

const err = error.get();

export class UserService {
  async createUser(userData) {
    // Input validation
    if (!userData.email) throw err.badRequest('Email is required');
    if (!userData.password) throw err.badRequest('Password is required');

    // Business validation
    const existingUser = await db.findUserByEmail(userData.email);
    if (existingUser) throw err.conflict('User already exists');

    try {
      return await db.createUser(userData);
    } catch (dbError) {
      throw err.serverError('Database operation failed');
    }
  }

  async authenticateUser(email, password) {
    if (!email || !password) {
      throw err.badRequest('Email and password are required');
    }

    const user = await db.findUserByEmail(email);
    if (!user) throw err.unauthorized('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw err.unauthorized('Invalid credentials');

    return user;
  }

  async updateUserRole(userId, newRole, requestingUserId) {
    // Permission check
    const requestingUser = await db.findUser(requestingUserId);
    if (!requestingUser?.isAdmin) {
      throw err.forbidden('Admin access required');
    }

    // Resource check
    const targetUser = await db.findUser(userId);
    if (!targetUser) throw err.notFound('User not found');

    try {
      return await db.updateUser(userId, { role: newRole });
    } catch (dbError) {
      throw err.serverError('Failed to update user role');
    }
  }
}
```

### 5. Background Job Processing

```javascript
/**
 * Background job worker with error handling
 * @module @voilajsx/appkit/error
 * @file workers/email-worker.js
 */

import { error } from '@voilajsx/appkit/error';

const err = error.get();

export async function processEmailJob(job) {
  try {
    // Validate job data
    if (!job.data.email) throw err.badRequest('Email is required');
    if (!job.data.template) throw err.badRequest('Template is required');

    // Check user exists
    const user = await db.findUserByEmail(job.data.email);
    if (!user) throw err.notFound('User not found');

    // Send email
    await emailService.send({
      to: job.data.email,
      template: job.data.template,
      data: job.data.templateData,
    });

    console.log('Email sent successfully');
  } catch (error) {
    // Handle different error types appropriately
    if (error.statusCode < 500) {
      console.warn('Job failed due to client error:', error.message);
      // Don't retry 4xx errors
    } else {
      console.error('Job failed due to server error:', error.message);
      // Retry 5xx errors
      throw error;
    }
  }
}
```

## Environment Variables

### Essential Variables

```bash
# Error behavior (optional - smart defaults)
VOILA_ERROR_STACK=false          # Show stack traces (default: true in dev)
VOILA_ERROR_LOG=true             # Log server errors (default: true)
VOILA_AUTH_MESSAGE="Login required" # Custom unauthorized message
```

### Environment Detection

- **Development**: Stack traces shown, detailed errors, all errors logged
- **Production**: Stack traces hidden, generic errors, only server errors logged
- **Test**: Minimal logging, optimized for testing

## Standard Patterns

### Error Creation by HTTP Semantics

```javascript
// 400 - Client input errors
if (!email) throw err.badRequest('Email is required');
if (!isValidEmail(email)) throw err.badRequest('Invalid email format');

// 401 - Authentication required
if (!token) throw err.unauthorized('Login required');
if (!isValidToken(token)) throw err.unauthorized('Invalid token');

// 403 - Access denied (authenticated but not authorized)
if (!user.isAdmin) throw err.forbidden('Admin access required');
if (!user.canEdit) throw err.forbidden('Edit permission required');

// 404 - Resource not found
if (!user) throw err.notFound('User not found');
if (!post) throw err.notFound('Post not found');

// 409 - Business logic conflicts
if (emailExists) throw err.conflict('Email already registered');
if (usernameExists) throw err.conflict('Username already taken');

// 500 - Server/system errors
if (dbError) throw err.serverError('Database connection failed');
if (apiError) throw err.serverError('External service unavailable');
```

### Express Middleware Usage

```javascript
// Always wrap async routes
app.post(
  '/users',
  err.asyncRoute(async (req, res) => {
    // Route logic with error throwing
  })
);

// Always add error handling as last middleware
app.use(err.handleErrors());

// Optional: Custom error handling configuration
app.use(
  err.handleErrors({
    showStack: process.env.NODE_ENV === 'development',
    logErrors: true,
  })
);
```

### Service Integration Pattern

```javascript
// Service class pattern
export class ResourceService {
  constructor() {
    this.err = error.get(); // Get error instance once
  }

  async createResource(data) {
    if (!data.name) throw this.err.badRequest('Name is required');

    const exists = await this.findByName(data.name);
    if (exists) throw this.err.conflict('Resource already exists');

    try {
      return await db.createResource(data);
    } catch (dbError) {
      throw this.err.serverError('Failed to create resource');
    }
  }
}
```

## LLM Generation Rules

1. **Always use object pattern**: `error.get()` then call methods on returned
   object
2. **Include file headers** with @module and @file tags
3. **Use semantic HTTP codes** - match error type to HTTP status appropriately
4. **Wrap all async routes** with `err.asyncRoute()`
5. **Add error handling middleware** as last middleware in Express apps
6. **Include helpful error messages** that guide users to fix the issue
7. **Use try/catch blocks** for system operations that might fail
8. **Validate inputs first** before processing business logic

## Common Anti-Patterns to Avoid

```javascript
// ❌ Wrong - Function imports (old pattern)
import { badRequest, unauthorized } from '@voilajsx/appkit/error';

// ✅ Correct - Object-driven pattern
import { error } from '@voilajsx/appkit/error';
const err = error.get();

// ❌ Wrong - Generic error messages
throw err.badRequest('Invalid input');

// ✅ Correct - Specific, helpful messages
throw err.badRequest('Email is required and must be valid');

// ❌ Wrong - Wrong HTTP semantics
if (!user) throw err.serverError('User not found'); // 500 for missing resource

// ✅ Correct - Proper HTTP semantics
if (!user) throw err.notFound('User not found'); // 404 for missing resource

// ❌ Wrong - Not wrapping async routes
app.post('/users', async (req, res) => { ... }); // Unhandled promise rejections

// ✅ Correct - Always wrap async routes
app.post('/users', err.asyncRoute(async (req, res) => { ... }));
```

## Quick Reference

```javascript
// Import pattern
import { error } from '@voilajsx/appkit/error';

// Get error object
const err = error.get();

// Create errors
err.badRequest('message');    // 400
err.unauthorized('message');  // 401
err.forbidden('message');     // 403
err.notFound('message');      // 404
err.conflict('message');      // 409
err.serverError('message');   // 500

// Express middleware
app.use(err.handleErrors());
app.post('/route', err.asyncRoute(async (req, res) => { ... }));
```

## HTTP Status Code Decision Tree

```
Is it a client problem?
├─ Yes: Is authentication missing/invalid?
│  ├─ Yes: 401 Unauthorized
│  └─ No: Is access forbidden?
│     ├─ Yes: 403 Forbidden
│     └─ No: Is resource missing?
│        ├─ Yes: 404 Not Found
│        └─ No: Is there a business conflict?
│           ├─ Yes: 409 Conflict
│           └─ No: 400 Bad Request
└─ No: 500 Server Error
```

**Remember: One import, one function (`error.get()`), semantic HTTP status codes
for everything!**

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
