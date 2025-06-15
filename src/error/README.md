# @voilajsx/appkit - Error Module ⚠️

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Production-ready error handling with semantic HTTP status codes and
> environment-first design

The Error module provides essential error creation and handling utilities for
building robust Node.js APIs that work correctly with monitoring systems, load
balancers, and client applications.

## Module Overview

Essential error handling for production APIs:

| Feature            | What it does               | Main functions                                                                               |
| ------------------ | -------------------------- | -------------------------------------------------------------------------------------------- |
| **Error Creation** | Semantic HTTP status codes | `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`, `serverError()` |
| **Middleware**     | Automatic error handling   | `handleErrors()`, `asyncRoute()`                                                             |

## 🚀 Features

- **🎯 Production-Ready** - Semantic HTTP status codes that work with
  infrastructure
- **⚡ Zero Configuration** - Smart defaults from environment variables
- **🌍 Environment-First** - Auto-detects development vs production settings
- **🔧 Express Integration** - Middleware that works out of the box
- **📦 Focused Design** - Pure error handling, no mixed concerns
- **🛡️ Async-Safe** - Proper async error catching

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import {
  handleErrors,
  asyncRoute,
  badRequest,
  notFound,
} from '@voilajsx/appkit/error';

// Zero-config error handling
app.use(handleErrors());

// Protected routes
app.post(
  '/users',
  asyncRoute(async (req, res) => {
    if (!req.body.email) throw badRequest('Email required');

    const user = await createUser(req.body);
    if (!user) throw notFound('User not found');

    res.json({ user });
  })
);
```

## 📖 Core Functions

### Error Creation (6 functions)

Production-ready error functions with semantic HTTP status codes:

| Function         | Status | Purpose                  | When to use                  |
| ---------------- | ------ | ------------------------ | ---------------------------- |
| `badRequest()`   | 400    | Client input errors      | Invalid data, missing fields |
| `unauthorized()` | 401    | Authentication required  | Missing/invalid tokens       |
| `forbidden()`    | 403    | Access denied            | Insufficient permissions     |
| `notFound()`     | 404    | Resource missing         | User/post/file not found     |
| `conflict()`     | 409    | Business logic conflicts | Email already exists         |
| `serverError()`  | 500    | Internal errors          | Database/API failures        |

```javascript
// Input validation
if (!email) throw badRequest('Email is required');

// Authentication
if (!token) throw unauthorized('Login required');

// Authorization
if (!isAdmin) throw forbidden('Admin access required');

// Resource not found
if (!user) throw notFound('User not found');

// Business conflicts
if (emailExists) throw conflict('Email already registered');

// Server errors
if (dbError) throw serverError('Database connection failed');
```

### Middleware (2 functions)

Zero-configuration middleware for Express applications:

| Function         | Purpose               | When to use                       |
| ---------------- | --------------------- | --------------------------------- |
| `handleErrors()` | Global error handling | As last middleware in Express app |
| `asyncRoute()`   | Async error catching  | Wrap all async route handlers     |

```javascript
// Global error handling with environment-aware logging
app.use(handleErrors());

// Async route protection
app.get(
  '/users/:id',
  asyncRoute(async (req, res) => {
    const user = await findUser(req.params.id);
    if (!user) throw notFound('User not found');
    res.json(user);
  })
);
```

## 🔧 Environment Variables

### Optional Configuration (Smart Defaults)

```bash
# Error handling behavior
VOILA_ERROR_STACK=false          # Show stack traces (default: true in dev)
VOILA_ERROR_LOG=true             # Log server errors (default: true)
VOILA_AUTH_MESSAGE="Please login" # Default auth error message
```

## 💡 Common Use Cases

| Scenario                | Functions Used                   | Example                   |
| ----------------------- | -------------------------------- | ------------------------- |
| **API Validation**      | `badRequest()`, `asyncRoute()`   | User input validation     |
| **Authentication**      | `unauthorized()`, `forbidden()`  | Protected API endpoints   |
| **Resource Management** | `notFound()`, `conflict()`       | User/post CRUD operations |
| **Error Handling**      | `handleErrors()`, `asyncRoute()` | Express application setup |

## 📋 Complete Example

```javascript
import express from 'express';
import {
  handleErrors,
  asyncRoute,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// Global error handling
app.use(handleErrors());

// User registration
app.post(
  '/auth/register',
  asyncRoute(async (req, res) => {
    // Input validation
    const { email, name } = req.body;
    if (!email) throw badRequest('Email is required');
    if (!name) throw badRequest('Name is required');

    // Business logic validation
    const existingUser = await findUserByEmail(email);
    if (existingUser) throw conflict('Email already registered');

    const user = await createUser({ email, name });
    res.json({ user });
  })
);

// Protected route
app.get(
  '/profile',
  asyncRoute(async (req, res) => {
    // Authentication check
    if (!req.headers.authorization) {
      throw unauthorized('Login required');
    }

    const token = req.headers.authorization.replace('Bearer ', '');
    const decoded = verifyToken(token);

    const user = await findUser(decoded.userId);
    if (!user) throw notFound('User not found');

    res.json({ user });
  })
);

// Admin-only route
app.delete(
  '/users/:id',
  asyncRoute(async (req, res) => {
    if (!req.user?.isAdmin) {
      throw forbidden('Admin access required');
    }

    const user = await findUser(req.params.id);
    if (!user) throw notFound('User not found');

    await deleteUser(req.params.id);
    res.json({ success: true });
  })
);

// Server error handling
app.get(
  '/data',
  asyncRoute(async (req, res) => {
    try {
      const data = await fetchExternalAPI();
      res.json(data);
    } catch (error) {
      throw serverError('External API unavailable');
    }
  })
);

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## 🛡️ Production Benefits

### Infrastructure Compatibility

- **Load balancers** retry 5xx but not 4xx errors correctly
- **API gateways** route based on status codes appropriately
- **Circuit breakers** trigger on correct error patterns
- **Monitoring systems** categorize errors by status code

### Client Integration

- **Frontend applications** can handle different error types appropriately
- **Mobile apps** get consistent error formats
- **API consumers** receive semantically correct responses

### Development Experience

- **Environment-aware** logging and stack traces
- **Consistent error format** across all endpoints
- **Zero configuration** for basic usage

## 🔍 Error Response Format

### Development Environment

```json
{
  "error": "BAD_REQUEST",
  "message": "Email is required",
  "stack": "Error: Email is required\n    at ..."
}
```

### Production Environment

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

## 🎯 Usage Patterns

### Basic Error Handling

```javascript
// Simple validation
if (!data) throw badRequest('Data is required');

// Resource checks
const item = await findItem(id);
if (!item) throw notFound('Item not found');

// Permission checks
if (!user.canEdit) throw forbidden('Edit permission required');
```

### Advanced Error Handling

```javascript
// Multiple validation
app.post(
  '/users',
  asyncRoute(async (req, res) => {
    const { email, password, role } = req.body;

    // Input validation
    if (!email) throw badRequest('Email is required');
    if (!password) throw badRequest('Password is required');

    // Business logic validation
    const exists = await userExists(email);
    if (exists) throw conflict('User already exists');

    // Authorization check
    if (role === 'admin' && !req.user.isAdmin) {
      throw forbidden('Cannot create admin users');
    }

    const user = await createUser({ email, password, role });
    res.json({ user });
  })
);
```

### Error Middleware Integration

```javascript
// Custom error enhancement
app.use(
  handleErrors({
    showStack: process.env.NODE_ENV === 'development',
    logErrors: true,
  })
);

// Additional error processing
app.use((error, req, res, next) => {
  // Custom logging, monitoring, etc.
  if (error.statusCode >= 500) {
    monitoring.recordError(error);
  }
  next(error);
});
```

## 📚 API Reference

### Error Creation Functions

- `badRequest(message)` - Creates 400 Bad Request error
- `unauthorized(message)` - Creates 401 Unauthorized error (uses
  `VOILA_AUTH_MESSAGE`)
- `forbidden(message)` - Creates 403 Forbidden error
- `notFound(message)` - Creates 404 Not Found error
- `conflict(message)` - Creates 409 Conflict error
- `serverError(message)` - Creates 500 Server Error (environment-aware message)

### Middleware Functions

- `handleErrors(options)` - Global error handling middleware
- `asyncRoute(fn)` - Async route wrapper for error catching

### Environment Variables

- `VOILA_ERROR_STACK` - Show stack traces (default: true in development)
- `VOILA_ERROR_LOG` - Enable error logging (default: true)
- `VOILA_AUTH_MESSAGE` - Default unauthorized error message
- `NODE_ENV` - Environment detection for error behavior

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
