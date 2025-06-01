# @voilajsx/appkit - Session Module 🛡️

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Framework-agnostic session management for modern Node.js applications

The Session module of `@voilajsx/appkit` provides secure, flexible session
management utilities that work seamlessly across Express, Fastify, Koa, and any
Node.js framework. Perfect for traditional web applications, admin dashboards,
and hybrid authentication systems.

## Module Overview

The Session module provides everything you need for stateful authentication:

| Feature                | What it does                              | Main functions                                                            |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| **Session Management** | Create and manage user sessions           | `createSessionMiddleware()`                                               |
| **Session-Based Auth** | Authenticate users with sessions          | `createSessionAuthMiddleware()`, `createSessionAuthorizationMiddleware()` |
| **Flexible Storage**   | Store sessions in memory, files, or Redis | `MemoryStore`, `FileStore`, `RedisStore`                                  |
| **Cookie Management**  | Secure, signed session cookies            | Built into `SessionManager`                                               |

## 🚀 Features

- **🍪 Secure Session Cookies** - HMAC-signed cookies with secure defaults
- **🔄 Framework Agnostic** - Works with Express, Fastify, Koa, raw Node.js
- **💾 Multiple Storage Options** - Memory, file-based, or Redis storage
- **🔐 Session-Based Authentication** - Ready-to-use auth middleware
- **👥 Role-Based Authorization** - Control access based on user roles
- **⚡ Zero Configuration** - Works out of the box with sensible defaults
- **🛡️ Security First** - Prevents session fixation, timing attacks, and more

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

Import only the functions you need and start using them right away. Sessions
work across any Node.js framework with the same API.

```javascript
import { createSessionMiddleware } from '@voilajsx/appkit/session';

// Basic session setup - works with any framework
const sessionMiddleware = createSessionMiddleware({
  secret: 'your-secret-key',
});

// Apply to your app
app.use(sessionMiddleware);

// Use sessions in routes
app.post('/login', async (req, res) => {
  // Save user data to session
  await req.session.save({
    user: { id: 123, email: 'user@example.com' },
  });
  res.json({ message: 'Logged in successfully' });
});

app.get('/profile', (req, res) => {
  // Access session data
  const user = req.session.data.user;
  res.json({ user });
});
```

## 📋 Examples

The module includes several examples to help you get started with common session
management scenarios:

| Example                                                                                                          | Description                   | Key Features                                      |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| [01-basic-session.js](https://github.com/voilajsx/appkit/blob/main/src/session/examples/01-basic-session.js)     | Basic session setup and usage | Session creation, data storage, session lifecycle |
| [02-file-sessions.js](https://github.com/voilajsx/appkit/blob/main/src/session/examples/02-file-sessions.js)     | File-based session storage    | FileStore configuration, persistent sessions      |
| [03-session-auth.js](https://github.com/voilajsx/appkit/blob/main/src/session/examples/03-session-auth.js)       | Session-based authentication  | Login/logout, protected routes, user sessions     |
| [04-middleware-auth.js](https://github.com/voilajsx/appkit/blob/main/src/session/examples/04-middleware-auth.js) | Authentication middleware     | Role-based access, authorization middleware       |
| [05-redis-sessions.js](https://github.com/voilajsx/appkit/blob/main/src/session/examples/05-redis-sessions.js)   | Redis session storage         | RedisStore setup, production-ready sessions       |

### Example: Basic Session Usage

```javascript
// From 01-basic-session.js
import express from 'express';
import { createSessionMiddleware } from '@voilajsx/appkit/session';

const app = express();
app.use(express.json());

// Create session middleware
const sessionMiddleware = createSessionMiddleware({
  secret: 'your-secret-key',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

app.use(sessionMiddleware);

// Save data to session
app.post('/save', async (req, res) => {
  const { data } = req.body;
  await req.session.save({ userData: data });
  res.json({ message: 'Data saved to session' });
});

// Get data from session
app.get('/data', (req, res) => {
  const userData = req.session.data.userData;
  res.json({ userData: userData || null });
});

// Check session status
app.get('/status', (req, res) => {
  res.json({
    active: req.session.isActive(),
    age: req.session.getAge(),
    sessionId: req.session.id,
  });
});

// Destroy session
app.post('/clear', async (req, res) => {
  await req.session.destroy();
  res.json({ message: 'Session destroyed' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Example: Authentication with Middleware

```javascript
// From 04-middleware-auth.js
import express from 'express';
import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
} from '@voilajsx/appkit/session';

const app = express();
app.use(express.json());

// Session middleware
const sessionMiddleware = createSessionMiddleware({
  secret: process.env.SESSION_SECRET || 'dev-secret',
});

// Authentication middleware
const authRequired = createSessionAuthMiddleware({
  loginUrl: '/login',
});

// Role-based authorization
const adminOnly = createSessionAuthorizationMiddleware(['admin']);

app.use(sessionMiddleware);

// Public routes
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simulate user authentication
    const users = {
      'admin@example.com': {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
      },
      'user@example.com': {
        id: 2,
        email: 'user@example.com',
        role: 'user',
        name: 'Regular User',
      },
    };

    const user = users[email];
    if (user && password === 'password') {
      // Save user to session
      await req.session.save({ user });
      res.json({
        message: 'Login successful',
        user: { id: user.id, email: user.email, name: user.name },
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected routes
app.get('/profile', authRequired, (req, res) => {
  res.json({ user: req.user });
});

app.get('/admin', authRequired, adminOnly, (req, res) => {
  res.json({ message: 'Admin access granted', user: req.user });
});

// Logout
app.post('/logout', authRequired, async (req, res) => {
  await req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## 📖 Core Functions

### Session Management

These utilities handle the complete session lifecycle - creation, storage, and
cleanup. Sessions are automatically signed to prevent tampering and can be
configured for different deployment scenarios.

| Function                    | Purpose                         | When to use                                |
| --------------------------- | ------------------------------- | ------------------------------------------ |
| `createSessionMiddleware()` | Creates session middleware      | Every app that needs user sessions         |
| `req.session.save()`        | Saves data to current session   | After login, when storing user preferences |
| `req.session.destroy()`     | Completely removes session      | During logout, account deletion            |
| `req.session.regenerate()`  | Changes session ID for security | After privilege escalation, login          |

```javascript
// Create session middleware
const sessionMiddleware = createSessionMiddleware({
  secret: 'your-secret-key',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
});

// In your route handlers
app.post('/login', async (req, res) => {
  // Save user to session
  await req.session.save({ user: { id: 123, name: 'John' } });
});

app.post('/logout', async (req, res) => {
  // Destroy session
  await req.session.destroy();
});
```

### Session Storage

Choose the right storage backend for your deployment. Each store implements the
same interface, so switching between them is seamless as your application grows.

| Store         | Purpose                      | When to use                              |
| ------------- | ---------------------------- | ---------------------------------------- |
| `MemoryStore` | In-memory session storage    | Development, testing, single-server apps |
| `FileStore`   | File-based session storage   | Simple deployments, shared hosting       |
| `RedisStore`  | Redis-backed session storage | Production, multi-server deployments     |

```javascript
import {
  createSessionMiddleware,
  MemoryStore,
  FileStore,
  RedisStore,
} from '@voilajsx/appkit/session';

// Memory store (default)
const memorySession = createSessionMiddleware({
  secret: 'your-secret-key',
});

// File store for simple production
const fileSession = createSessionMiddleware({
  store: new FileStore('./sessions'),
  secret: 'your-secret-key',
});

// Redis store for scalable production
const redisSession = createSessionMiddleware({
  store: new RedisStore(redisClient),
  secret: 'your-secret-key',
});
```

### Authentication Middleware

Protect your routes with session-based authentication. These middleware
functions check for active sessions and can redirect users or return appropriate
error responses.

| Function                                 | Purpose                                     | When to use                                 |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| `createSessionAuthMiddleware()`          | Creates session authentication middleware   | Protecting private pages and API endpoints  |
| `createSessionAuthorizationMiddleware()` | Creates role-based authorization middleware | Admin panels, premium features, permissions |

```javascript
import {
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
} from '@voilajsx/appkit/session';

// Authentication middleware
const authRequired = createSessionAuthMiddleware({
  loginUrl: '/login', // Redirect here if not authenticated
});

// Role-based authorization
const adminOnly = createSessionAuthorizationMiddleware(['admin']);
const moderatorAccess = createSessionAuthorizationMiddleware([
  'admin',
  'moderator',
]);

// Apply to routes
app.get('/dashboard', authRequired, (req, res) => {
  // req.user is automatically available
  res.json({ user: req.user });
});

app.get('/admin', authRequired, adminOnly, (req, res) => {
  // Only admin users can access
  res.json({ message: 'Admin panel' });
});
```

## 🔧 Configuration Options

The examples above show basic usage, but you have complete control over session
behavior. Here are the customization options available:

### Session Middleware Options

| Option       | Description                    | Default          | Example                  |
| ------------ | ------------------------------ | ---------------- | ------------------------ |
| `secret`     | Secret key for signing cookies | _Required_       | `'your-secret-key'`      |
| `store`      | Session storage backend        | `MemoryStore`    | `new RedisStore(client)` |
| `maxAge`     | Session expiration time        | `86400000` (24h) | `3600000` (1 hour)       |
| `cookieName` | Name of session cookie         | `'sessionId'`    | `'myapp_session'`        |
| `secure`     | Secure cookie flag             | Auto-detected    | `true` for HTTPS         |
| `rolling`    | Extend session on activity     | `true`           | `false` to disable       |

```javascript
createSessionMiddleware({
  secret: 'your-secret-key',
  store: new RedisStore(redis),
  maxAge: 2 * 60 * 60 * 1000, // 2 hours
  cookieName: 'myapp_session',
  secure: true,
  rolling: true,
});
```

### Storage Options

| Store        | Option       | Description                      | Default        | Example           |
| ------------ | ------------ | -------------------------------- | -------------- | ----------------- |
| `FileStore`  | `directory`  | Directory to store session files | `'./sessions'` | `'/tmp/sessions'` |
|              | `extension`  | File extension for sessions      | `'.json'`      | `'.sess'`         |
| `RedisStore` | `prefix`     | Redis key prefix                 | `'sess:'`      | `'myapp:sess:'`   |
|              | `serializer` | Data serialization method        | `JSON`         | Custom serializer |

```javascript
// File store with custom options
new FileStore('./my-sessions', {
  extension: '.sess',
  cleanupInterval: 30000, // 30 seconds
});

// Redis store with custom options
new RedisStore(redisClient, {
  prefix: 'myapp:sessions:',
  serializer: JSON,
});
```

## 💡 Common Use Cases

Here's where you can apply the session module's functionality in your
applications:

| Category             | Use Case             | Description                                      | Components Used                                                       |
| -------------------- | -------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| **Web Applications** | Traditional Web Apps | Server-rendered apps with login/logout           | `createSessionMiddleware()`, `createSessionAuthMiddleware()`          |
|                      | Admin Dashboards     | Management interfaces with user sessions         | `createSessionMiddleware()`, `createSessionAuthorizationMiddleware()` |
|                      | Content Management   | CMS systems with editor authentication           | All session components                                                |
| **E-commerce**       | Shopping Carts       | Persistent cart data across page visits          | `createSessionMiddleware()`, `req.session.save()`                     |
|                      | User Accounts        | Customer login and account management            | `createSessionAuthMiddleware()`, session persistence                  |
|                      | Checkout Process     | Multi-step checkout with temporary data storage  | Session data storage and retrieval                                    |
| **Hybrid Systems**   | Session + JWT        | Web interface with session, API with JWT         | Session middleware + JWT auth from auth module                        |
|                      | Multi-tenant Apps    | Different authentication per tenant              | Custom session configuration per tenant                               |
|                      | Development Tools    | Developer tools with persistent user preferences | `FileStore` for local development                                     |
| **Deployment**       | Single Server        | Simple deployments on single server              | `FileStore` for persistence                                           |
|                      | Load Balanced        | Multiple servers sharing session data            | `RedisStore` for shared state                                         |
|                      | Serverless           | Stateless functions with session-like behavior   | External storage with session utilities                               |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common session management scenarios using the `@voilajsx/appkit/session`
module. We've designed the API to be LLM-friendly with clear patterns and
comprehensive documentation.

### How to Use LLM Code Generation

Simply describe your session management needs to an LLM and mention that you're
using `@voilajsx/appkit/session`. The clear API design makes it easy for LLMs to
generate correct, working code.

### Sample Prompts to Try

#### Basic Session Setup

```
Create a complete session management setup for an Express.js application using @voilajsx/appkit/session with the following features:
- User login and logout
- Session-based authentication middleware
- Redis storage for production
- Secure cookie configuration
```

#### E-commerce Shopping Cart

```
Implement a shopping cart system using @voilajsx/appkit/session that includes:
- Add/remove items from cart
- Persistent cart across browser sessions
- Guest checkout with cart preservation
- Cart data cleanup after purchase
```

#### Admin Dashboard with Roles

```
Build an admin dashboard authentication system using @voilajsx/appkit/session with:
- Role-based access control (admin, editor, viewer)
- Session timeout warnings
- Activity logging
- Secure admin area protection
```

## 📋 Framework Examples

The session module works identically across all Node.js frameworks:

### Express.js

```javascript
import express from 'express';
import { createSessionMiddleware } from '@voilajsx/appkit/session';

const app = express();
app.use(createSessionMiddleware({ secret: 'secret' }));
```

### Fastify

```javascript
import Fastify from 'fastify';
import { createSessionMiddleware } from '@voilajsx/appkit/session';

const fastify = Fastify();
fastify.addHook('onRequest', createSessionMiddleware({ secret: 'secret' }));
```

### Koa

```javascript
import Koa from 'koa';
import { createSessionMiddleware } from '@voilajsx/appkit/session';

const app = new Koa();
const sessionMiddleware = createSessionMiddleware({ secret: 'secret' });
app.use(async (ctx, next) => {
  await new Promise((resolve) =>
    sessionMiddleware(ctx.request, ctx.response, resolve)
  );
  await next();
});
```

## 🛡️ Security Best Practices

Following these practices will help ensure your session management remains
secure:

1. **Strong Secrets**: Use cryptographically secure secrets (32+ characters)
2. **HTTPS Only**: Always use secure cookies in production
3. **Session Rotation**: Regenerate session IDs after login/privilege changes
4. **Proper Expiration**: Set appropriate session timeouts for your use case
5. **Secure Storage**: Use Redis or encrypted file storage in production
6. **Regular Cleanup**: Ensure expired sessions are properly cleaned up

## 📊 Performance Considerations

- **Storage Choice**: Memory for development, Redis for production scaling
- **Session Size**: Keep session data small to reduce storage overhead
- **Cleanup Intervals**: Configure appropriate cleanup for file-based storage
- **Rolling Sessions**: Consider disabling if you don't need activity-based
  extension

## 🔍 Error Handling

The session module is designed to be resilient and won't break your application
if the session store fails:

```javascript
// Sessions gracefully handle store failures
app.use(
  createSessionMiddleware({
    secret: 'your-secret',
    store: new RedisStore(redisClient),
  })
);

// Even if Redis is down, your app continues to work
app.get('/api/data', (req, res) => {
  // req.session will be available (empty if store failed)
  const user = req.session.data.user || null;
  res.json({ data: 'some data', user });
});
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/session/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/session/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajsx/appkit/blob/main/src/session/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

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
