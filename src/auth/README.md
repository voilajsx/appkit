# @voilajsx/appkit - Auth Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Dead simple, secure authentication for Node.js applications

The Auth module provides **6 essential functions** that cover 90% of
authentication needs with zero learning curve. Production-ready security with
the simplest possible API.

## 🚀 Why Choose This?

- **⚡ Zero Learning Curve** - Intuitive function names, start in 30 seconds
- **🔒 Production Security** - Enterprise-grade security by default
- **🎯 Just 6 Functions** - Covers 90% of auth needs without complexity
- **🌍 Environment-First** - Auto-detects VOILA*AUTH*\* variables
- **📦 Ultra Lightweight** - No bloat, just essentials

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

### 1. Set your environment variables:

```bash
# .env
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars
VOILA_AUTH_BCRYPT_ROUNDS=12
```

### 2. Start using immediately:

```javascript
import {
  signToken,
  verifyToken,
  requireAuth,
  requireRole,
  hashPassword,
} from '@voilajsx/appkit/auth';

// Hash a password
const hash = await hashPassword('userPassword123');

// Create a JWT token
const token = signToken({ userId: 123, roles: ['user'] });

// Verify a token
const payload = verifyToken(token);

// Protect routes
app.get('/profile', requireAuth(), (req, res) => {
  res.json({ user: req.user });
});

app.get('/admin', requireAuth(), requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin only!' });
});
```

That's it! You're ready for production.

## 📖 Complete API Reference

### JWT Functions

#### `signToken(payload, secret?, expiresIn?)`

Creates a JWT token with your data.

```javascript
// Uses VOILA_AUTH_SECRET from environment
const token = signToken({ userId: 123 });

// Override secret
const token = signToken({ userId: 123 }, 'my-secret');

// Custom expiration
const token = signToken({ userId: 123 }, 'my-secret', '1h');
```

#### `verifyToken(token, secret?)`

Verifies and decodes a JWT token.

```javascript
// Uses VOILA_AUTH_SECRET from environment
const payload = verifyToken(token);

// Override secret
const payload = verifyToken(token, 'my-secret');
```

### Password Functions

#### `hashPassword(password, rounds?)`

Securely hashes a password using bcrypt.

```javascript
// Uses VOILA_AUTH_BCRYPT_ROUNDS from environment (default: 10)
const hash = await hashPassword('myPassword123');

// Custom rounds
const hash = await hashPassword('myPassword123', 12);
```

#### `comparePassword(password, hash)`

Verifies a password against its hash.

```javascript
const isValid = await comparePassword('myPassword123', hash);
if (isValid) {
  // Password correct
}
```

### Middleware Functions

#### `requireAuth(secret?, options?)`

Protects routes with JWT authentication.

```javascript
// Uses VOILA_AUTH_SECRET from environment
app.get('/protected', requireAuth(), handler);

// Override secret
app.get('/protected', requireAuth('my-secret'), handler);

// Custom token extraction
app.get(
  '/protected',
  requireAuth({
    getToken: (req) => req.headers['x-api-key'],
  }),
  handler
);
```

**Token Sources (checked in order):**

1. `Authorization: Bearer <token>` header
2. `token` cookie
3. `?token=<token>` query parameter

#### `requireRole(...roles)`

Restricts access based on user roles.

```javascript
// Single role
app.get('/admin', requireAuth(), requireRole('admin'), handler);

// Multiple roles (OR logic)
app.get('/content', requireAuth(), requireRole('admin', 'editor'), handler);

// Array syntax
app.get('/content', requireAuth(), requireRole(['admin', 'editor']), handler);
```

**Note:** Requires `req.user.roles` array in JWT payload.

## 🌍 Environment Variables

| Variable                   | Description                       | Default    | Example                             |
| -------------------------- | --------------------------------- | ---------- | ----------------------------------- |
| `VOILA_AUTH_SECRET`        | JWT signing secret (min 32 chars) | _Required_ | `your-secret-key-2024-min-32-chars` |
| `VOILA_AUTH_BCRYPT_ROUNDS` | Password hashing rounds (8-15)    | `10`       | `12`                                |

### Security Requirements:

- **JWT Secret**: Must be at least 32 characters
- **Bcrypt Rounds**: Must be between 8-15 for security/performance balance

## 💡 Real-World Examples

### User Registration & Login

```javascript
import {
  signToken,
  hashPassword,
  comparePassword,
} from '@voilajsx/appkit/auth';

// Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Save user to database
  const user = await db.createUser({ email, password: hashedPassword });

  // Create token
  const token = signToken({ userId: user.id, email, roles: ['user'] });

  res.json({ token, user: { id: user.id, email } });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ userId: user.id, email, roles: user.roles });
  res.json({ token });
});
```

### Protected API Routes

```javascript
import { requireAuth, requireRole } from '@voilajsx/appkit/auth';

// Public route
app.get('/api/posts', async (req, res) => {
  const posts = await db.getPosts();
  res.json({ posts });
});

// User-only route
app.get('/api/profile', requireAuth(), async (req, res) => {
  const user = await db.findUserById(req.user.userId);
  res.json({ user });
});

// Admin-only route
app.get(
  '/api/admin/users',
  requireAuth(),
  requireRole('admin'),
  async (req, res) => {
    const users = await db.getAllUsers();
    res.json({ users });
  }
);

// Multi-role route
app.put(
  '/api/posts/:id',
  requireAuth(),
  requireRole('admin', 'editor'),
  async (req, res) => {
    const post = await db.updatePost(req.params.id, req.body);
    res.json({ post });
  }
);
```

### Complete Express App

```javascript
import express from 'express';
import {
  signToken,
  verifyToken,
  requireAuth,
  requireRole,
  hashPassword,
  comparePassword,
} from '@voilajsx/appkit/auth';

const app = express();
app.use(express.json());

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await db.createUser({
      email,
      password: hashedPassword,
      roles: ['user'],
    });
    const token = signToken({ userId: user.id, email, roles: user.roles });
    res.json({ token, user: { id: user.id, email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ userId: user.id, email, roles: user.roles });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected routes
app.get('/api/profile', requireAuth(), async (req, res) => {
  const user = await db.findUserById(req.user.userId);
  res.json({ user });
});

app.get('/api/admin', requireAuth(), requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome admin!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 🛡️ Security Features

### Production-Ready Security

- **Strong Secret Validation** - Rejects weak JWT secrets
- **Algorithm Protection** - Forces HS256 algorithm to prevent attacks
- **Bcrypt Rounds Validation** - Ensures optimal security/performance balance
- **Hash Format Validation** - Validates bcrypt hash integrity
- **Input Sanitization** - Comprehensive input validation
- **Timing Attack Protection** - Secure password comparison

### Error Handling

```javascript
try {
  const payload = verifyToken(token);
} catch (error) {
  // Handles: 'Token has expired', 'Invalid token', etc.
  console.log(error.message);
}
```

## 🔍 Error Messages

| Function       | Error                                       | Meaning                     |
| -------------- | ------------------------------------------- | --------------------------- |
| `signToken`    | `JWT secret must be at least 32 characters` | Weak secret detected        |
| `verifyToken`  | `Token has expired`                         | JWT token expired           |
| `verifyToken`  | `Invalid token`                             | JWT token corrupted/invalid |
| `hashPassword` | `Bcrypt rounds must be between 8-15`        | Invalid rounds              |
| `requireAuth`  | `Authentication required`                   | No token provided           |
| `requireRole`  | `Insufficient permissions`                  | User lacks required role    |

## 🚀 Migration from Other Libraries

### From `jsonwebtoken`

```javascript
// Before
import jwt from 'jsonwebtoken';
const token = jwt.sign(payload, secret, { expiresIn: '7d' });
const decoded = jwt.verify(token, secret);

// After
import { signToken, verifyToken } from '@voilajsx/appkit/auth';
const token = signToken(payload, secret);
const decoded = verifyToken(token, secret);
```

### From `express-jwt`

```javascript
// Before
import { expressjwt } from 'express-jwt';
app.use(expressjwt({ secret, algorithms: ['HS256'] }));

// After
import { requireAuth } from '@voilajsx/appkit/auth';
app.use(requireAuth(secret));
```

### From `bcrypt`

```javascript
// Before
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10);
const valid = await bcrypt.compare(password, hash);

// After
import { hashPassword, comparePassword } from '@voilajsx/appkit/auth';
const hash = await hashPassword(password);
const valid = await comparePassword(password, hash);
```

## 📊 Performance

- **JWT Operations**: ~1ms per token (sign/verify)
- **Password Hashing**: ~100ms with 10 rounds, ~400ms with 12 rounds
- **Memory Usage**: <1MB additional overhead
- **Bundle Size**: <50KB additional (with tree-shaking)

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJS](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
