# @voilajsx/appkit - Auth Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Secure, simple, and flexible authentication utilities for Node.js applications

## Introduction

The Auth module provides everything you need to add robust authentication to
your Node.js applications. Whether you're building a simple blog, a complex API,
or a full-scale web application, this module handles JWT token management,
secure password hashing with bcrypt, and customizable middleware for protecting
routes and controlling user access.

Designed to work seamlessly with any Node.js framework including Express,
Fastify, Koa, and more. You can use individual functions for specific needs or
combine them for complete authentication systems.

## Documentation

If you want to understand the usage of this module clearly with step-by-step
tutorials, real-world examples, and best practices, follow our comprehensive
documentation:

**[📖 Read the Complete Guide](https://voilajsx.github.io/appkit/docs/auth)**

## Installation

```bash
npm install @voilajsx/appkit
```

## Basic Usage

```javascript
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
} from '@voilajsx/appkit/auth';

// Hash passwords securely
const hash = await hashPassword('myPassword123');

// Verify passwords during login
const isValid = await comparePassword('myPassword123', hash);

// Generate JWT tokens for authenticated sessions
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);

// Verify tokens
const payload = verifyToken(token, { secret: 'your-secret-key' });

// Protect routes with middleware
const auth = createAuthMiddleware({ secret: 'your-secret-key' });
app.get('/dashboard', auth, (req, res) => {
  res.json({ message: 'Welcome!', user: req.user });
});
```

## Module Overview

| Feature               | Functions                             | What it does                                                  |
| --------------------- | ------------------------------------- | ------------------------------------------------------------- |
| **JWT Management**    | `generateToken()`, `verifyToken()`    | Create and verify secure tokens for stateless authentication  |
| **Password Security** | `hashPassword()`, `comparePassword()` | Securely hash and verify passwords using bcrypt               |
| **Route Protection**  | `createAuthMiddleware()`              | Middleware to authenticate requests and protect API endpoints |
| **Role-Based Access** | `createAuthorizationMiddleware()`     | Control access based on user roles and permissions            |

## Examples

Ready-to-use code examples for common authentication scenarios:

- **[Password Basics](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/01-password-basics.js)** -
  Learn password hashing and verification with user registration/login flow
- **[JWT Tokens](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/02-jwt-basics.js)** -
  Create and verify JWT tokens with expiration handling
- **[Express Middleware](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/03-simple-middleware.js)** -
  Protect routes with authentication middleware and error handling
- **[Complete Auth System](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/auth-demo-app)** -
  Full authentication system with registration, login, email verification, and
  admin roles

## AI Code Generation

Generate complete authentication systems using AI tools like ChatGPT or Claude.
We provide specialized prompts that help AI understand the module and generate
production-ready code:

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then create a complete authentication system for an Express app using @voilajsx/appkit/auth with user registration, JWT login, and role-based admin routes.
```

**[View AI Prompts Guide →](https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md)**

## License

MIT © [VoilaJS](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a>
</p>
