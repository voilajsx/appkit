# @voilajsx/appkit - Authentication Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple object-driven authentication with enterprise-grade security and
> smart role hierarchy

**One function** returns an auth object with all methods. Zero configuration
needed, production-ready security by default, with built-in role inheritance.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `authenticator.get()`, everything else is automatic
- **🔒 Enterprise Security** - Production-grade security by default
- **🔧 Zero Configuration** - Smart defaults for everything
- **👥 Smart Role Hierarchy** - Built-in role inheritance (user → moderator →
  admin → superadmin)
- **🛡️ Null-Safe Access** - Safe user extraction with `auth.user(req)`

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

```bash
# Set your environment variable
echo "VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars" > .env
```

```javascript
import { authenticator } from '@voilajsx/appkit/auth';

const auth = authenticator.get();

// JWT operations
const token = auth.signToken({ userId: 123, roles: ['admin'] });
const payload = auth.verifyToken(token);

// Password operations
const hash = await auth.hashPassword('userPassword123');
const isValid = await auth.comparePassword('userPassword123', hash);

// Safe user access
const user = auth.user(req); // Returns null if not authenticated

// Role-based routes
app.get('/admin', auth.requireLogin(), auth.requireRole('admin'), handler);
```

## 📖 API Reference

### Core Function

```javascript
const auth = authenticator.get(); // One function, all methods
```

### Methods

```javascript
// JWT
auth.signToken(payload, expiresIn);
auth.verifyToken(token);

// Passwords
auth.hashPassword(password, rounds);
auth.comparePassword(password, hash);

// User access
auth.user(req); // Safe user extraction (null if not authenticated)

// Role checking
auth.hasRole(userRoles, requiredRole);

// Middleware
auth.requireLogin(options);
auth.requireToken(options);
auth.requireRole(...roles);
```

## 👥 Role Hierarchy

### Built-in Roles (Zero Config)

```javascript
user → moderator → admin → superadmin
```

Higher roles automatically inherit lower role permissions.

### Custom Roles for Your Industry

```bash
# E-commerce
VOILA_AUTH_ROLES=customer:1,vendor:2,staff:3,manager:4,admin:5

# Healthcare
VOILA_AUTH_ROLES=patient:1,nurse:2,doctor:3,admin:4

# SaaS Platform
VOILA_AUTH_ROLES=viewer:1,editor:2,admin:3,owner:4
```

## 💡 Simple Examples

### Basic Express App

```javascript
import express from 'express';
import { authenticator } from '@voilajsx/appkit/auth';

const app = express();
const auth = authenticator.get();

// Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await auth.hashPassword(password);
  const user = await db.createUser({
    email,
    password: hashedPassword,
    roles: ['user'],
  });

  const token = auth.signToken({
    userId: user.id,
    email: user.email,
    roles: user.roles,
  });

  res.json({ token });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.findUserByEmail(email);
  const isValid = await auth.comparePassword(password, user.password);

  if (isValid) {
    const token = auth.signToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protected routes
app.get('/profile', auth.requireLogin(), (req, res) => {
  const user = auth.user(req);
  res.json({ user });
});

app.get(
  '/admin',
  auth.requireLogin(),
  auth.requireRole('admin'),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);
```

### Role-Based Access

```javascript
// Public route
app.get('/public', (req, res) => {
  res.json({ message: 'Everyone can see this' });
});

// User routes (any authenticated user)
app.get(
  '/dashboard',
  auth.requireLogin(),
  auth.requireRole('user'),
  (req, res) => {
    const user = auth.user(req);
    res.json({ message: `Welcome ${user.email}` });
  }
);

// Moderator routes (moderator + admin + superadmin)
app.get(
  '/moderate',
  auth.requireLogin(),
  auth.requireRole('moderator'),
  (req, res) => {
    res.json({ message: 'Moderator panel' });
  }
);

// Admin routes (admin + superadmin)
app.get(
  '/admin',
  auth.requireLogin(),
  auth.requireRole('admin'),
  (req, res) => {
    res.json({ message: 'Admin panel' });
  }
);

// Multiple roles (OR logic)
app.get(
  '/manage',
  auth.requireLogin(),
  auth.requireRole('admin', 'moderator'),
  (req, res) => {
    res.json({ message: 'Management area' });
  }
);
```

### Business Logic

```javascript
class PostService {
  async deletePost(postId, req) {
    const user = auth.user(req);

    if (!user) {
      throw new Error('Authentication required');
    }

    const post = await db.getPost(postId);

    // Users can delete own posts, moderators can delete any
    const canDelete =
      post.createdBy === user.userId || auth.hasRole(user.roles, 'moderator');

    if (!canDelete) {
      throw new Error('Permission denied');
    }

    await db.deletePost(postId);
    return { success: true };
  }

  async createPost(postData, req) {
    const user = auth.user(req);

    if (!user) {
      throw new Error('Authentication required');
    }

    // Moderators can publish immediately, users create drafts
    const status = auth.hasRole(user.roles, 'moderator')
      ? 'published'
      : 'draft';

    const post = await db.createPost({
      ...postData,
      createdBy: user.userId,
      status,
    });

    return post;
  }
}
```

### Optional Authentication

```javascript
app.get('/content', (req, res) => {
  const user = auth.user(req); // Safe - returns null if not authenticated

  if (!user) {
    return res.json({ content: 'Public content only' });
  }

  if (auth.hasRole(user.roles, 'admin')) {
    return res.json({ content: 'Admin content' });
  }

  res.json({ content: 'User content' });
});
```

## 🌍 Environment Variables

```bash
# Required
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars

# Optional
VOILA_AUTH_BCRYPT_ROUNDS=12        # Default: 10
VOILA_AUTH_EXPIRES_IN=1h           # Default: 7d
VOILA_AUTH_DEFAULT_ROLE=user       # Default: user
VOILA_AUTH_ROLES=user:1,mod:2,admin:3  # Custom roles
```

## 🔄 Authentication Types

### User Authentication (`requireLogin`)

- For web applications and user interfaces
- Sets `req.user` (accessible via `auth.user(req)`)

### API Authentication (`requireToken`)

- For service-to-service communication
- Sets `req.token` (accessible via `auth.user(req)`)

### Role Authorization (`requireRole`)

- Works with both authentication types
- Supports role hierarchy and multiple roles

## 🤖 LLM Guidelines

### Essential Patterns

```javascript
// ✅ ALWAYS use these patterns
import { authenticator } from '@voilajsx/appkit/auth';
const auth = authenticator.get();

// ✅ Safe user access
const user = auth.user(req);
if (!user) return res.status(401).json({ error: 'Auth required' });

// ✅ Always hash passwords
const hashedPassword = await auth.hashPassword(password);

// ✅ Include roles in JWT
const token = auth.signToken({ userId, email, roles: ['user'] });

// ✅ Use role hierarchy
auth.requireRole('admin'); // Also allows superadmin
```

### Anti-Patterns to Avoid

```javascript
// ❌ DON'T access req.user directly (can crash)
const user = req.user;

// ❌ DON'T store plain passwords
await db.createUser({ password });

// ❌ DON'T forget roles in JWT
auth.signToken({ userId });

// ❌ DON'T hardcode role checks
if (user.roles.includes('admin')) {
} // Use auth.hasRole() instead
```

## 📈 Performance

- **JWT Operations**: ~1ms per token
- **Password Hashing**: ~100ms (10 rounds)
- **Memory Usage**: <1MB overhead
- **Environment Parsing**: Once per app startup

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a>
</p>
