# @voilajs/appkit - Auth Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Secure, simple, and flexible authentication utilities for Node.js applications

The Auth module of `@voilajs/appkit` provides robust authentication utilities
including JWT token management, password hashing with bcrypt, and customizable
middleware for protecting routes and enforcing role-based access control (RBAC).

## 🚀 Features

- **🔑 JWT Token Management** - Generate and verify JWT tokens with customizable
  expiration
- **🔒 Password Security** - Hash and compare passwords using bcrypt
- **🛡️ Route Protection** - Middleware for authenticating requests
- **👥 Role-Based Access** - Control access based on user roles
- **🎯 Framework Agnostic** - Works with Express, Fastify, Koa, and more
- **⚡ Simple API** - Get started with just a few lines of code

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import {
  generateToken,
  verifyToken,
  hashPassword,
  createAuthMiddleware,
} from '@voilajs/appkit/auth';

// Generate a JWT token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);

// Protect your routes
const auth = createAuthMiddleware({ secret: 'your-secret-key' });
app.get('/dashboard', auth, (req, res) => {
  res.json({ userId: req.user.userId });
});
```

## 📖 Core Functions

### JWT Token Management

| Function          | Description                        | Usage                              |
| ----------------- | ---------------------------------- | ---------------------------------- |
| `generateToken()` | Creates a JWT token from a payload | User login, API authentication     |
| `verifyToken()`   | Verifies and decodes a JWT token   | Route protection, token validation |

```javascript
// Generate a token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key', expiresIn: '24h' }
);

// Verify a token
try {
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log(payload.userId); // '123'
} catch (error) {
  console.log('Invalid token');
}
```

### Password Security

| Function            | Description                          | Usage                               |
| ------------------- | ------------------------------------ | ----------------------------------- |
| `hashPassword()`    | Hashes a password using bcrypt       | User registration, password updates |
| `comparePassword()` | Compares a password against its hash | User login, authentication          |

```javascript
// Hash a password
const hash = await hashPassword('myPassword123');

// Verify a password
const isValid = await comparePassword('myPassword123', hash);
console.log(isValid); // true or false
```

### Middleware

| Function                          | Description                          | Usage                                |
| --------------------------------- | ------------------------------------ | ------------------------------------ |
| `createAuthMiddleware()`          | Creates JWT verification middleware  | Protect API routes, secure endpoints |
| `createAuthorizationMiddleware()` | Creates role-based access middleware | Admin panels, premium features       |

```javascript
// Authentication middleware
const auth = createAuthMiddleware({ secret: 'your-secret-key' });

// Authorization middleware
const adminOnly = createAuthorizationMiddleware(['admin']);

// Apply to routes
app.get('/profile', auth, (req, res) => {
  // Requires valid JWT token
});

app.get('/admin', auth, adminOnly, (req, res) => {
  // Requires valid JWT token with admin role
});
```

## 🔧 Configuration Options

### Token Generation Options

```javascript
generateToken(payload, {
  secret: 'your-secret-key', // Required
  expiresIn: '7d', // Optional (default: '7d')
  algorithm: 'HS256', // Optional (default: 'HS256')
});
```

### Auth Middleware Options

```javascript
createAuthMiddleware({
  secret: 'your-secret-key', // Required

  // Custom token extraction (optional)
  getToken: (req) => {
    // Default checks in order:
    // 1. Authorization header (Bearer token)
    // 2. req.cookies.token
    // 3. req.query.token
    return req.headers['x-api-key'];
  },

  // Custom error handling (optional)
  onError: (error, req, res) => {
    res.status(401).json({ error: error.message });
  },
});
```

## 💡 Common Use Cases

### User Registration & Login

```javascript
// Registration
async function register(email, password) {
  const hashedPassword = await hashPassword(password);
  const user = await createUser({ email, password: hashedPassword });

  const token = generateToken(
    { userId: user.id, email },
    { secret: process.env.JWT_SECRET }
  );

  return { token, user };
}

// Login
async function login(email, password) {
  const user = await findUserByEmail(email);
  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(
    { userId: user.id, email },
    { secret: process.env.JWT_SECRET }
  );

  return { token };
}
```

### Protected API Routes

```javascript
const app = express();
const auth = createAuthMiddleware({ secret: process.env.JWT_SECRET });

// Public routes
app.post('/auth/register', register);
app.post('/auth/login', login);

// Protected routes
app.get('/api/profile', auth, (req, res) => {
  // req.user contains the JWT payload
  res.json({ user: req.user });
});

// Admin only routes
const adminOnly = createAuthorizationMiddleware(['admin']);
app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  // Only accessible by admin users
});
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Store JWT secrets in environment variables
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Use short-lived tokens (hours/days, not months)
4. **Password Requirements**: Implement strong password policies
5. **Salt Rounds**: Use at least 10 bcrypt rounds (12 for high security)
6. **Error Messages**: Don't reveal sensitive information in errors

## 📊 Performance Tips

- Use appropriate bcrypt rounds (10-12) to balance security and performance
- Consider caching verified tokens to reduce verification overhead
- Keep JWT payloads small to minimize token size
- Use async/await properly with password functions

## 🔍 Error Handling

All functions throw descriptive errors that should be caught and handled
appropriately:

```javascript
try {
  const payload = verifyToken(token, { secret });
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

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/auth/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Integration REFERENCE](https://github.com/voilajs/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Made with ❤️ by the VoilaJS team
</p>
