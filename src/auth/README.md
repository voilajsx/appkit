# @voilajsx/appkit - Auth Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Secure, simple, and flexible authentication utilities for Node.js applications

The Auth module of `@voilajsx/appkit` provides robust authentication utilities
including JWT token management, password hashing with bcrypt, and customizable
middleware for protecting routes and enforcing role-based access control (RBAC).

## Module Overview

The Auth module provides everything you need for modern authentication:

| Feature               | What it does                         | Main functions                        |
| --------------------- | ------------------------------------ | ------------------------------------- |
| **JWT Management**    | Create and verify secure tokens      | `generateToken()`, `verifyToken()`    |
| **Password Security** | Hash and verify passwords safely     | `hashPassword()`, `comparePassword()` |
| **Route Protection**  | Secure API endpoints with middleware | `createAuthMiddleware()`              |
| **Role-Based Access** | Control access based on user roles   | `createAuthorizationMiddleware()`     |

## 🚀 Features

- **🔑 JWT Token Management** - Generate and verify JWT tokens with customizable
  expiration
- **🔒 Password Security** - Hash and compare passwords using bcrypt
- **🛡️ Route Protection** - Middleware for authenticating requests
- **👥 Role-Based Access** - Control access based on user roles
- **🎯 Framework Agnostic** - Works with Express, Fastify, Koa, and more
- **⚡ Simple API** - Get started with just a few lines of code
- **🌍 Environment Configuration** - Auto-detects VOILA*AUTH*\* environment
  variables

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🌍 Environment Configuration

Configure the Auth module using environment variables for seamless integration:

```bash
# JWT Configuration
VOILA_AUTH_SECRET=your-jwt-secret-key    # Required: JWT signing secret
VOILA_AUTH_EXPIRES_IN=7d                 # Optional: Default token expiration
VOILA_AUTH_ALGORITHM=HS256               # Optional: Default signing algorithm

# Password Configuration
VOILA_AUTH_BCRYPT_ROUNDS=12              # Optional: Default bcrypt rounds (4-31)

# Middleware Configuration
VOILA_AUTH_TOKEN_HEADER=authorization    # Optional: Header name for tokens
VOILA_AUTH_COOKIE_NAME=token             # Optional: Cookie name for tokens
```

These variables are automatically detected and applied when using any function
from this module. Explicit options always take precedence over environment
variables.

## 🏃‍♂️ Quick Start

Import only the functions you need and start using them right away. Each
function is designed to work independently, so you can pick and choose what you
need for your application.

```javascript
import {
  generateToken,
  verifyToken,
  hashPassword,
  createAuthMiddleware,
} from '@voilajsx/appkit/auth';

// Set environment variable (or use explicit options)
process.env.VOILA_AUTH_SECRET = 'your-secret-key';

// Generate a JWT token (uses env secret automatically)
const token = generateToken({ userId: '123', email: 'user@example.com' });

// Protect your routes (uses env secret automatically)
const auth = createAuthMiddleware();
app.get('/dashboard', auth, (req, res) => {
  res.json({ userId: req.user.userId });
});
```

## 📖 Core Functions

### JWT Token Management

These utilities enable you to create secure, signed tokens for authenticating
requests and transmitting sensitive information. JWTs are perfect for stateless
authentication in APIs and microservices.

| Function          | Purpose                            | When to use                                   |
| ----------------- | ---------------------------------- | --------------------------------------------- |
| `generateToken()` | Creates a JWT token from a payload | After successful login, API token generation  |
| `verifyToken()`   | Verifies and decodes a JWT token   | Before allowing access to protected resources |

```javascript
// Using environment configuration (recommended)
process.env.VOILA_AUTH_SECRET = 'your-secret-key';
process.env.VOILA_AUTH_EXPIRES_IN = '24h';

const token = generateToken({ userId: '123', email: 'user@example.com' });

// Using explicit options (takes precedence over environment)
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'explicit-secret', expiresIn: '1h' }
);

// Verify a token (uses environment secret)
try {
  const payload = verifyToken(token);
  console.log(payload.userId); // '123'
} catch (error) {
  console.log('Invalid token');
}
```

### Password Security

These functions enable you to securely store user passwords in your database by
creating cryptographically strong hashes. Never store plaintext passwords - use
these utilities to significantly improve your application's security.

| Function            | Purpose                            | When to use                              |
| ------------------- | ---------------------------------- | ---------------------------------------- |
| `hashPassword()`    | Hashes a password using bcrypt     | During user registration, password reset |
| `comparePassword()` | Verifies a password against a hash | During user login, password verification |

```javascript
// Using environment configuration
process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';

// Hash a password (uses env rounds automatically)
const hash = await hashPassword('myPassword123');

// Using explicit rounds (takes precedence)
const hash = await hashPassword('myPassword123', 10);

// Verify a password
const isValid = await comparePassword('myPassword123', hash);
console.log(isValid); // true or false
```

### Middleware

Secure your routes with authentication middleware that verifies JWT tokens. For
more granular control, use role-based middleware to restrict access based on
user roles (admin, editor, etc.), ensuring users can only access what they're
authorized to.

| Function                          | Purpose                              | When to use                               |
| --------------------------------- | ------------------------------------ | ----------------------------------------- |
| `createAuthMiddleware()`          | Creates JWT verification middleware  | Protecting API routes, securing endpoints |
| `createAuthorizationMiddleware()` | Creates role-based access middleware | Admin panels, premium features            |

```javascript
// Using environment configuration
process.env.VOILA_AUTH_SECRET = 'your-secret-key';
process.env.VOILA_AUTH_TOKEN_HEADER = 'x-auth-token';
process.env.VOILA_AUTH_COOKIE_NAME = 'authToken';

// Authentication middleware (uses env config automatically)
const auth = createAuthMiddleware();

// Authorization middleware
const adminOnly = createAuthorizationMiddleware(['admin']);

// Apply to routes
app.get('/profile', auth, (req, res) => {
  // Requires valid JWT token
});

app.get('/admin', auth, adminOnly, (req, res) => {
  // Requires valid JWT token with admin role
});

// Override environment with explicit options
const customAuth = createAuthMiddleware({
  secret: 'override-secret',
  getToken: (req) => req.headers['custom-header'],
});
```

## 🔧 Configuration Options

The examples above show environment variable usage, but you have complete
control over configuration. Here are all available options:

### Token Generation Options

| Option      | Description                   | Environment Variable    | Default    | Example                         |
| ----------- | ----------------------------- | ----------------------- | ---------- | ------------------------------- |
| `secret`    | Secret key for signing tokens | `VOILA_AUTH_SECRET`     | _Required_ | `'your-secret-key'`             |
| `expiresIn` | Token expiration time         | `VOILA_AUTH_EXPIRES_IN` | `'7d'`     | `'1h'`, `'7d'`, `'30d'`         |
| `algorithm` | JWT signing algorithm         | `VOILA_AUTH_ALGORITHM`  | `'HS256'`  | `'HS256'`, `'HS384'`, `'HS512'` |

```javascript
// Environment-driven configuration
process.env.VOILA_AUTH_SECRET = 'your-secret-key';
process.env.VOILA_AUTH_EXPIRES_IN = '7d';
process.env.VOILA_AUTH_ALGORITHM = 'HS256';

generateToken(payload); // Uses all environment settings

// Explicit configuration (overrides environment)
generateToken(payload, {
  secret: 'explicit-secret',
  expiresIn: '1h',
  algorithm: 'HS512',
});
```

### Password Hashing Options

| Option   | Description                  | Environment Variable       | Default | Example    |
| -------- | ---------------------------- | -------------------------- | ------- | ---------- |
| `rounds` | Number of bcrypt salt rounds | `VOILA_AUTH_BCRYPT_ROUNDS` | `10`    | `12`, `14` |

```javascript
// Environment-driven configuration
process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';

await hashPassword('password'); // Uses 12 rounds from environment

// Explicit configuration (overrides environment)
await hashPassword('password', 14); // Uses 14 rounds explicitly
```

### Auth Middleware Options

| Option        | Description                      | Environment Variable      | Default                        | Example                      |
| ------------- | -------------------------------- | ------------------------- | ------------------------------ | ---------------------------- |
| `secret`      | Secret key for verifying tokens  | `VOILA_AUTH_SECRET`       | _Required_                     | `'your-secret-key'`          |
| `tokenHeader` | Header name to check for tokens  | `VOILA_AUTH_TOKEN_HEADER` | `'authorization'`              | `'x-auth-token'`             |
| `cookieName`  | Cookie name to check for tokens  | `VOILA_AUTH_COOKIE_NAME`  | `'token'`                      | `'authToken'`                |
| `getToken`    | Custom function to extract token | _N/A_                     | Checks headers, cookies, query | Function that returns token  |
| `onError`     | Custom error handling            | _N/A_                     | Returns 401 responses          | Function that handles errors |

```javascript
// Environment-driven configuration
process.env.VOILA_AUTH_SECRET = 'your-secret-key';
process.env.VOILA_AUTH_TOKEN_HEADER = 'x-api-token';
process.env.VOILA_AUTH_COOKIE_NAME = 'sessionToken';

createAuthMiddleware(); // Uses all environment settings

// Explicit configuration (overrides environment)
createAuthMiddleware({
  secret: 'explicit-secret',
  tokenHeader: 'custom-header',
  getToken: (req) => req.headers['x-api-key'],
  onError: (error, req, res) => {
    res.status(401).json({ error: error.message });
  },
});
```

## 💡 Common Use Cases

Here's where you can apply the auth module's functionality in your applications:

| Category            | Use Case            | Description                                           | Components Used                                             |
| ------------------- | ------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| **User Management** | User Registration   | Securely store user credentials during signup         | `hashPassword()`                                            |
|                     | User Login          | Authenticate users and generate tokens                | `comparePassword()`, `generateToken()`                      |
|                     | Password Reset      | Securely handle password reset flows                  | `hashPassword()`, `generateToken()`                         |
| **API Security**    | API Authentication  | Secure API endpoints with token verification          | `createAuthMiddleware()`                                    |
|                     | Microservices       | Secure service-to-service communication               | `generateToken()`, `verifyToken()`                          |
|                     | Mobile API Backends | Authenticate mobile app clients                       | `generateToken()`, `createAuthMiddleware()`                 |
| **Access Control**  | Admin Dashboards    | Restrict sensitive admin features to authorized users | `createAuthMiddleware()`, `createAuthorizationMiddleware()` |
|                     | Premium Features    | Limit access to paid features based on subscription   | `createAuthorizationMiddleware()`                           |
|                     | Multi-tenant Apps   | Ensure users can only access their own data           | `createAuthMiddleware()`, custom role checks                |
| **Special Cases**   | Single Sign-On      | Implement SSO with JWT as the token format            | `generateToken()`, `verifyToken()`                          |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common authentication scenarios using the `@voilajsx/appkit/auth` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality authentication code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
secure, best-practice authentication code tailored to your specific
requirements.

### Sample Prompts to Try

#### Basic Auth Setup

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then create a complete authentication system for an Express app using @voilajsx/appkit/auth with the following features:
- User registration with password hashing
- Login with JWT token generation
- Middleware for protected routes
- Role-based access control for admin routes
- Environment variable configuration using VOILA_AUTH_* variables
```

#### Custom Authentication Flow

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a secure authentication flow for a React Native mobile app using @voilajsx/appkit/auth that includes:
- Token storage in secure storage
- Token refresh mechanism
- Biometric authentication integration
- Protection against common mobile auth vulnerabilities
- VOILA_AUTH_* environment configuration
```

#### Complex Authorization

```
Please read the API reference at https://github.com/voilajsx/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a complex authorization system using @voilajsx/appkit/auth with:
- Hierarchical role structure (admin > manager > user)
- Resource-based permissions (users can only access their own data)
- Team-based access control
- Audit logging for all authentication and authorization events
- Environment-driven configuration using VOILA_AUTH_* variables
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Password Basics](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/01-password-basics.js) -
  Password hashing and verification with VOILA_AUTH_BCRYPT_ROUNDS
- [JWT Basics](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/02-jwt-basics.js) -
  Token generation and verification with VOILA*AUTH*\* environment variables
- [Simple Middleware](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/03-simple-middleware.js) -
  Authentication middleware with environment configuration
- [Role Authorization](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/04-role-authorization.js) -
  Role-based access control with custom logic
- [Environment Configuration](https://github.com/voilajsx/appkit/blob/main/src/auth/examples/05-environment-config.js) -
  Comprehensive VOILA*AUTH*\* environment variable usage

## 🛡️ Security Best Practices

Following these practices will help ensure your authentication system remains
secure:

1. **Environment Variables**: Store JWT secrets in environment variables, never
   in code. Use `VOILA_AUTH_SECRET` for consistent configuration.
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Token Expiration**: Use short-lived tokens (hours/days, not months)
4. **Password Requirements**: Implement strong password policies
5. **Salt Rounds**: Use at least 10 bcrypt rounds (12 for high security).
   Configure with `VOILA_AUTH_BCRYPT_ROUNDS`.
6. **Error Messages**: Don't reveal sensitive information in error responses

## 📊 Performance Considerations

- **Bcrypt Rounds**: Balance security and performance with appropriate rounds
  (10-12). Set `VOILA_AUTH_BCRYPT_ROUNDS` appropriately.
- **Token Size**: Keep JWT payloads small to minimize token size
- **Caching**: Consider caching verified tokens to reduce verification overhead
- **Async/Await**: Use properly with password functions for better performance

## 🔍 Error Handling

The module provides specific error messages that you should handle
appropriately:

```javascript
try {
  const payload = verifyToken(token);
} catch (error) {
  if (error.message === 'Token has expired') {
    // Handle expired token
  } else if (error.message === 'Invalid token') {
    // Handle invalid token
  } else {
    // Handle other errors
  }
}
```

## 📚 Documentation Links

- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/auth/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
