# @voilajsx/appkit - Error Module ⚠️

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple object-driven error handling with semantic HTTP status codes

The Error module provides **one function** that returns an error object with all
methods. Zero configuration needed, production-ready by default, with
environment-aware smart defaults.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `error.get()`, everything else is automatic
- **🔧 Zero Configuration** - Smart defaults for everything
- **🌍 Environment-First** - Auto-detects development vs production settings
- **📊 Semantic HTTP Codes** - Proper status codes for infrastructure
- **🎯 Object-Driven** - Clean API, perfect for AI code generation

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (10 seconds)

```javascript
// One import, one function call
import { error } from '@voilajsx/appkit/error';

const err = error.get();

// Create errors with semantic status codes
throw err.badRequest('Email is required');
throw err.unauthorized('Login required');
throw err.notFound('User not found');

// Express middleware
app.use(err.handleErrors());
app.post(
  '/users',
  err.asyncRoute(async (req, res) => {
    if (!req.body.email) throw err.badRequest('Email required');
    const user = await createUser(req.body);
    res.json({ user });
  })
);
```

**That's it!** Automatic error handling with production-ready defaults.

## 📖 Complete API Reference

### Main Function

#### `error.get()`

Returns an error object with all error creation and middleware methods.

```javascript
import { error } from '@voilajsx/appkit/error';

const err = error.get(); // Environment parsed once for performance
```

### Error Creation Methods

All error objects have these methods for creating semantic HTTP errors:

```javascript
err.badRequest(message); // 400 - Client input errors
err.unauthorized(message); // 401 - Authentication required
err.forbidden(message); // 403 - Access denied
err.notFound(message); // 404 - Resource missing
err.conflict(message); // 409 - Business logic conflicts
err.serverError(message); // 500 - Internal errors
```

### Middleware Methods

```javascript
err.handleErrors(options); // Express error handling middleware
err.asyncRoute(fn); // Async route wrapper
```

## 💡 Real-World Examples

### Express Application with Error Handling

```javascript
import express from 'express';
import { error } from '@voilajsx/appkit/error';

const app = express();
const err = error.get();

app.use(express.json());

// Global error handling
app.use(err.handleErrors());

// User registration with validation
app.post(
  '/auth/register',
  err.asyncRoute(async (req, res) => {
    const { email, name, password } = req.body;

    // Input validation
    if (!email) throw err.badRequest('Email is required');
    if (!name) throw err.badRequest('Name is required');
    if (!password) throw err.badRequest('Password is required');

    // Business logic validation
    const existingUser = await findUserByEmail(email);
    if (existingUser) throw err.conflict('Email already registered');

    const user = await createUser({ email, name, password });
    res.json({ user });
  })
);

// Protected route
app.get(
  '/profile',
  err.asyncRoute(async (req, res) => {
    // Authentication check
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw err.unauthorized('Login required');

    const decoded = verifyToken(token);
    const user = await findUser(decoded.userId);
    if (!user) throw err.notFound('User not found');

    res.json({ user });
  })
);

// Admin-only route
app.delete(
  '/users/:id',
  err.asyncRoute(async (req, res) => {
    if (!req.user?.isAdmin) {
      throw err.forbidden('Admin access required');
    }

    const user = await findUser(req.params.id);
    if (!user) throw err.notFound('User not found');

    await deleteUser(req.params.id);
    res.json({ success: true });
  })
);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### API with Comprehensive Error Handling

```javascript
import { error } from '@voilajsx/appkit/error';

const err = error.get();

// User service with all error types
class UserService {
  async createUser(userData) {
    // Input validation
    if (!userData.email) throw err.badRequest('Email is required');
    if (!userData.password) throw err.badRequest('Password is required');

    // Business validation
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) throw err.conflict('User already exists');

    try {
      return await db.createUser(userData);
    } catch (dbError) {
      throw err.serverError('Failed to create user');
    }
  }

  async authenticateUser(email, password) {
    const user = await this.findByEmail(email);
    if (!user) throw err.unauthorized('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw err.unauthorized('Invalid credentials');

    return user;
  }

  async updateUser(userId, updateData) {
    const user = await this.findById(userId);
    if (!user) throw err.notFound('User not found');

    try {
      return await db.updateUser(userId, updateData);
    } catch (dbError) {
      throw err.serverError('Failed to update user');
    }
  }

  async deleteUser(userId, requestingUserId) {
    const user = await this.findById(userId);
    if (!user) throw err.notFound('User not found');

    // Permission check
    if (userId !== requestingUserId && !user.isAdmin) {
      throw err.forbidden('Cannot delete other users');
    }

    try {
      await db.deleteUser(userId);
    } catch (dbError) {
      throw err.serverError('Failed to delete user');
    }
  }
}
```

### Background Job Processing

```javascript
import { error } from '@voilajsx/appkit/error';

const err = error.get();

async function processEmailJob(job) {
  try {
    // Validate job data
    if (!job.data.email) throw err.badRequest('Email is required');
    if (!job.data.template) throw err.badRequest('Template is required');

    // Check if user exists
    const user = await findUserByEmail(job.data.email);
    if (!user) throw err.notFound('User not found');

    // Send email
    await sendEmail({
      to: job.data.email,
      template: job.data.template,
      data: job.data.templateData,
    });

    console.log('Email sent successfully');
  } catch (error) {
    // Different handling based on error type
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

## 🌍 Environment Variables

### Smart Defaults Configuration

```bash
# Error behavior (optional - smart defaults)
VOILA_ERROR_STACK=false          # Show stack traces (default: true in dev)
VOILA_ERROR_LOG=true             # Log server errors (default: true)
VOILA_AUTH_MESSAGE="Please login" # Custom unauthorized message
```

### Environment-Aware Behavior

**Development:**

- Stack traces shown in responses
- Detailed error messages
- All errors logged to console

**Production:**

- Stack traces hidden from responses
- Generic error messages for security
- Only server errors (5xx) logged

**Test:**

- Minimal logging
- Error behavior optimized for testing

## 📊 Error Types & Status Codes

| Method           | Status | Type         | When to Use              | Example                    |
| ---------------- | ------ | ------------ | ------------------------ | -------------------------- |
| `badRequest()`   | 400    | BAD_REQUEST  | Invalid input data       | Missing email field        |
| `unauthorized()` | 401    | UNAUTHORIZED | Authentication required  | Missing/invalid token      |
| `forbidden()`    | 403    | FORBIDDEN    | Access denied            | Insufficient permissions   |
| `notFound()`     | 404    | NOT_FOUND    | Resource missing         | User/post not found        |
| `conflict()`     | 409    | CONFLICT     | Business logic conflicts | Email already exists       |
| `serverError()`  | 500    | SERVER_ERROR | Internal failures        | Database connection failed |

## 🔧 Advanced Usage

### Custom Middleware Configuration

```javascript
const err = error.get();

// Custom error handling with options
app.use(
  err.handleErrors({
    showStack: process.env.NODE_ENV === 'development',
    logErrors: true,
  })
);

// Multiple error middlewares
app.use(err.handleErrors());
app.use((error, req, res, next) => {
  // Additional error processing
  if (error.statusCode >= 500) {
    monitoring.recordError(error);
  }
  next();
});
```

### Error Response Formats

#### Development Response

```json
{
  "error": "BAD_REQUEST",
  "message": "Email is required",
  "stack": "Error: Email is required\n    at ..."
}
```

#### Production Response

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### Testing Patterns

```javascript
import { error } from '@voilajsx/appkit/error';

describe('User API', () => {
  test('should validate required fields', async () => {
    const err = error.get();

    expect(() => {
      if (!userData.email) throw err.badRequest('Email required');
    }).toThrow();
  });

  test('should handle not found errors', async () => {
    const err = error.get();

    const result = await request(app).get('/users/999').expect(404);

    expect(result.body.error).toBe('NOT_FOUND');
  });
});
```

## 🛡️ Production Benefits

### Infrastructure Compatibility

- **Load balancers** retry 5xx but not 4xx errors correctly
- **API gateways** route based on status codes appropriately
- **Circuit breakers** trigger on correct error patterns
- **Monitoring systems** categorize errors by status code

### Client Integration

- **Frontend applications** handle different error types appropriately
- **Mobile apps** get consistent error formats
- **API consumers** receive semantically correct responses

### Development Experience

- **Environment-aware** logging and stack traces
- **Consistent error format** across all endpoints
- **Zero configuration** for basic usage

## 🏷️ HTTP Status Code Guide

| Range   | Category     | Retry? | Client Action         |
| ------- | ------------ | ------ | --------------------- |
| 400-499 | Client Error | ❌ No  | Fix request and retry |
| 500-599 | Server Error | ✅ Yes | Retry with backoff    |

## 🚀 Migration Guide

### From Function-Driven Errors

```javascript
// Before
import { badRequest, unauthorized, handleErrors } from '@voilajsx/appkit/error';

throw badRequest('Email required');
throw unauthorized('Login required');
app.use(handleErrors());

// After
import { error } from '@voilajsx/appkit/error';
const err = error.get();

throw err.badRequest('Email required');
throw err.unauthorized('Login required');
app.use(err.handleErrors());
```

### From Other Error Libraries

```javascript
// Before (http-errors)
import createError from 'http-errors';
throw createError(400, 'Email required');

// After (AppKit)
import { error } from '@voilajsx/appkit/error';
const err = error.get();
throw err.badRequest('Email required');
```

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
