# Auth Module - Developer REFERENCE 🛠️

The auth module provides secure authentication utilities for Node.js
applications. It offers JWT token generation and verification, password hashing
with bcrypt, and customizable middleware for protecting routes - all with
sensible defaults to get you started quickly.

Whether you need simple password hashing, JWT token management, or complete
authentication middleware, this module provides flexible, composable utilities
that work with any Node.js framework.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🔒 [Password Security](#password-security)
  - [Hashing Passwords](#hashing-passwords)
  - [Verifying Passwords](#verifying-passwords)
  - [Complete Password Example](#complete-password-example)
- 🔑 [JWT Token Management](#jwt-token-management)
  - [Creating Tokens](#creating-tokens)
  - [Verifying Tokens](#verifying-tokens)
  - [Complete JWT Example](#complete-jwt-example)
- 🛡️ [Authentication Middleware](#authentication-middleware)
  - [Basic Setup](#basic-setup)
  - [Custom Token Sources](#custom-token-sources)
  - [Error Handling](#error-handling)
  - [Complete Middleware Example](#complete-middleware-example)
- 👥 [Authorization Middleware](#authorization-middleware)
  - [Role-Based Access](#role-based-access)
  - [Custom Role Logic](#custom-role-logic)
  - [Complete Authorization Example](#complete-authorization-example)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajs/appkit
```

### Basic Import

```javascript
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajs/appkit/auth';
```

## Password Security

The password utilities provide secure password hashing and comparison using
bcrypt.

### Hashing Passwords

Use `hashPassword` to securely hash passwords before storing them:

```javascript
import { hashPassword } from '@voilajs/appkit/auth';

// Basic usage - uses 10 rounds by default (recommended for most apps)
const hash = await hashPassword('myPassword123');

// High security - use 12 rounds (slower but more secure)
const secureHash = await hashPassword('myPassword123', 12);

// Quick hashing - use 8 rounds (for development/testing only)
const quickHash = await hashPassword('myPassword123', 8);
```

💡 **Tip**: Higher rounds = more security but slower performance. Use 10-12 for
production.

### Verifying Passwords

Use `comparePassword` to check if a password matches its hash:

```javascript
import { comparePassword } from '@voilajs/appkit/auth';

const isValid = await comparePassword('myPassword123', hash);
if (isValid) {
  console.log('✅ Password is correct!');
} else {
  console.log('❌ Invalid password');
}
```

### Complete Password Example

Here's a real-world example of user registration and login:

```javascript
import { hashPassword, comparePassword } from '@voilajs/appkit/auth';

// User Registration
async function registerUser(email, password) {
  // 1. Validate password strength (your logic)
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // 2. Hash the password
  const hashedPassword = await hashPassword(password);

  // 3. Save to database
  const user = await db.createUser({
    email,
    password: hashedPassword,
  });

  // 4. Return user (without password)
  return { id: user.id, email: user.email };
}

// User Login
async function loginUser(email, password) {
  // 1. Find user by email
  const user = await db.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials'); // Don't reveal if email exists
  }

  // 2. Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // 3. Login successful
  return { id: user.id, email: user.email };
}
```

## JWT Token Management

JWT utilities handle token generation and verification for stateless
authentication.

### Creating Tokens

Use `generateToken` to create JWT tokens:

```javascript
import { generateToken } from '@voilajs/appkit/auth';

// Basic token (expires in 7 days)
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);

// Short-lived token (1 hour for sensitive operations)
const shortToken = generateToken(
  { userId: '123', action: 'reset-password' },
  { secret: 'your-secret-key', expiresIn: '1h' }
);

// Long-lived token (30 days for remember me)
const longToken = generateToken(
  { userId: '123', rememberMe: true },
  { secret: 'your-secret-key', expiresIn: '30d' }
);

// Custom algorithm (HS512 for extra security)
const secureToken = generateToken(
  { userId: '123' },
  { secret: 'your-secret-key', algorithm: 'HS512' }
);
```

### Verifying Tokens

Use `verifyToken` to validate and decode tokens:

```javascript
import { verifyToken } from '@voilajs/appkit/auth';

try {
  // Verify token
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log('User ID:', payload.userId);
  console.log('Email:', payload.email);
} catch (error) {
  // Handle specific errors
  switch (error.message) {
    case 'Token has expired':
      console.log('⏰ Token expired - user needs to login again');
      break;
    case 'Invalid token':
      console.log('❌ Invalid token - possible tampering');
      break;
    default:
      console.log('❌ Authentication failed:', error.message);
  }
}
```

### Complete JWT Example

Here's how to implement a complete token-based authentication system:

```javascript
import { generateToken, verifyToken } from '@voilajs/appkit/auth';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET;

// Generate different types of tokens
function createAuthTokens(user) {
  // Access token - short lived (15 minutes)
  const accessToken = generateToken(
    {
      userId: user.id,
      email: user.email,
      type: 'access',
    },
    { secret: JWT_SECRET, expiresIn: '15m' }
  );

  // Refresh token - long lived (7 days)
  const refreshToken = generateToken(
    {
      userId: user.id,
      type: 'refresh',
    },
    { secret: JWT_SECRET, expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

// Password reset token
function createResetToken(email) {
  return generateToken(
    { email, purpose: 'password-reset' },
    { secret: JWT_SECRET, expiresIn: '1h' }
  );
}

// Email verification token
function createVerificationToken(email) {
  return generateToken(
    { email, purpose: 'email-verification' },
    { secret: JWT_SECRET, expiresIn: '24h' }
  );
}

// Verify different token types
function verifyAuthToken(token) {
  try {
    const payload = verifyToken(token, { secret: JWT_SECRET });

    // Validate token type
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
```

## Authentication Middleware

Authentication middleware protects your routes by verifying JWT tokens.

### Basic Setup

Create middleware with just a secret:

```javascript
import { createAuthMiddleware } from '@voilajs/appkit/auth';
import express from 'express';

const app = express();

// Create middleware
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
});

// Protect routes
app.get('/profile', auth, (req, res) => {
  // req.user contains the token payload
  res.json({
    message: 'Welcome to your profile',
    userId: req.user.userId,
    email: req.user.email,
  });
});
```

### Custom Token Sources

By default, the middleware checks for tokens in:

1. `Authorization` header (Bearer token)
2. `token` cookie
3. `token` query parameter

You can customize this behavior:

```javascript
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
  getToken: (req) => {
    // 1. Check custom header
    if (req.headers['x-api-key']) {
      return req.headers['x-api-key'];
    }

    // 2. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 3. Check cookies (custom name)
    if (req.cookies?.sessionToken) {
      return req.cookies.sessionToken;
    }

    // 4. Check request body (for POST requests)
    if (req.body?.token) {
      return req.body.token;
    }

    return null;
  },
});
```

### Error Handling

Customize error responses for better user experience:

```javascript
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
  onError: (error, req, res) => {
    // Log error for debugging
    console.error('Auth error:', error.message);

    // Send appropriate response
    switch (error.message) {
      case 'Token has expired':
        res.status(401).json({
          error: 'Session expired',
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please login again.',
        });
        break;

      case 'No token provided':
        res.status(401).json({
          error: 'Authentication required',
          code: 'NO_TOKEN',
          message: 'Please login to access this resource.',
        });
        break;

      case 'Invalid token':
        res.status(401).json({
          error: 'Invalid authentication',
          code: 'INVALID_TOKEN',
          message: 'Your authentication is invalid. Please login again.',
        });
        break;

      default:
        res.status(401).json({
          error: 'Authentication failed',
          code: 'AUTH_ERROR',
          message: 'Authentication failed. Please try again.',
        });
    }
  },
});
```

### Complete Middleware Example

Here's a complete example with authentication and public routes:

```javascript
import { createAuthMiddleware, generateToken } from '@voilajs/appkit/auth';
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Create auth middleware
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
  getToken: (req) => {
    // Check both header and cookie
    return req.headers.authorization?.slice(7) || req.cookies.token;
  },
});

// Public routes (no auth needed)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API' });
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user (your logic)
    const user = await authenticateUser(email, password);

    // Generate token
    const token = generateToken(
      { userId: user.id, email: user.email },
      { secret: process.env.JWT_SECRET }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      token, // Also send in response for API clients
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protected routes (auth required)
app.get('/api/profile', auth, async (req, res) => {
  const user = await db.findUserById(req.user.userId);
  res.json({ user });
});

app.post('/api/logout', auth, (req, res) => {
  // Clear cookie
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});
```

## Authorization Middleware

Authorization middleware adds role-based access control (RBAC) to your routes.

### Role-Based Access

Protect routes based on user roles:

```javascript
import { createAuthorizationMiddleware } from '@voilajs/appkit/auth';

// Single role
const adminOnly = createAuthorizationMiddleware(['admin']);

// Multiple roles
const editorAccess = createAuthorizationMiddleware(['editor', 'admin']);

// Apply to routes
app.get('/admin/dashboard', auth, adminOnly, (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

app.put('/content/edit', auth, editorAccess, (req, res) => {
  res.json({ message: 'Edit content' });
});
```

### Custom Role Logic

Implement complex authorization logic:

```javascript
// Permission-based access
const canEditPosts = createAuthorizationMiddleware(['editor'], {
  getRoles: (req) => {
    // Check permissions instead of roles
    const permissions = req.user.permissions || [];
    return permissions.includes('posts:edit') ? ['editor'] : [];
  },
});

// Subscription-based access
const premiumFeatures = createAuthorizationMiddleware(['premium'], {
  getRoles: (req) => {
    // Check if user has active subscription
    if (req.user.subscription?.status === 'active') {
      return ['premium'];
    }
    return [];
  },
});

// Hierarchical roles
const managerAccess = createAuthorizationMiddleware(['manager'], {
  getRoles: (req) => {
    // Role hierarchy: admin > manager > supervisor > employee
    const roleHierarchy = {
      employee: ['employee'],
      supervisor: ['employee', 'supervisor'],
      manager: ['employee', 'supervisor', 'manager'],
      admin: ['employee', 'supervisor', 'manager', 'admin'],
    };

    return roleHierarchy[req.user.role] || [];
  },
});

// Combined conditions
const projectAccess = createAuthorizationMiddleware(['member'], {
  getRoles: (req) => {
    const { projectId } = req.params;
    const userProjects = req.user.projects || [];

    // Check if user is member of the project
    if (userProjects.includes(projectId)) {
      return ['member'];
    }

    // Admins always have access
    if (req.user.role === 'admin') {
      return ['member'];
    }

    return [];
  },
});
```

### Complete Authorization Example

Here's a complete example with different access levels:

```javascript
import {
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajs/appkit/auth';

// Auth middleware
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
});

// Role middleware
const adminOnly = createAuthorizationMiddleware(['admin']);
const moderatorAccess = createAuthorizationMiddleware(['moderator', 'admin']);
const premiumAccess = createAuthorizationMiddleware(['premium'], {
  getRoles: (req) => {
    // Check both role and subscription
    const roles = [];

    if (req.user.role === 'admin') roles.push('admin');
    if (req.user.role === 'moderator') roles.push('moderator');
    if (req.user.subscription?.plan === 'premium') roles.push('premium');

    return roles;
  },
});

// Public endpoints
app.get('/api/posts', async (req, res) => {
  const posts = await db.getPublicPosts();
  res.json({ posts });
});

// Authenticated endpoints
app.get('/api/profile', auth, async (req, res) => {
  const profile = await db.getUserProfile(req.user.userId);
  res.json({ profile });
});

// Premium features
app.get('/api/analytics', auth, premiumAccess, async (req, res) => {
  const analytics = await db.getPremiumAnalytics(req.user.userId);
  res.json({ analytics });
});

// Moderator actions
app.put('/api/posts/:id/flag', auth, moderatorAccess, async (req, res) => {
  await db.flagPost(req.params.id, req.user.userId);
  res.json({ message: 'Post flagged' });
});

// Admin only
app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
  await db.deleteUser(req.params.id);
  res.json({ message: 'User deleted' });
});

// Admin dashboard with stats
app.get('/api/admin/stats', auth, adminOnly, async (req, res) => {
  const stats = await db.getSystemStats();
  res.json({ stats });
});
```

## Complete Integration Example

Here's a production-ready example showing all features working together:

```javascript
import express from 'express';
import cookieParser from 'cookie-parser';
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajs/appkit/auth';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Environment configuration
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

// Create middleware
const auth = createAuthMiddleware({
  secret: JWT_SECRET,
  getToken: (req) => {
    // Support both Authorization header and cookies
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return req.cookies.token;
  },
});

const adminOnly = createAuthorizationMiddleware(['admin']);
const verifiedOnly = createAuthorizationMiddleware(['verified'], {
  getRoles: (req) => {
    // Check if email is verified
    return req.user.emailVerified ? ['verified'] : [];
  },
});

// User registration
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    // Check if user exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password, BCRYPT_ROUNDS);

    // Create user
    const user = await db.createUser({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
      roles: ['user'],
    });

    // Generate verification token
    const verificationToken = generateToken(
      { email, purpose: 'email-verification' },
      { secret: JWT_SECRET, expiresIn: '24h' }
    );

    // Send verification email (async)
    sendVerificationEmail(email, verificationToken);

    // Generate auth token
    const token = generateToken(
      {
        userId: user.id,
        email,
        emailVerified: false,
        roles: user.roles,
      },
      { secret: JWT_SECRET }
    );

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      token,
      user: {
        id: user.id,
        email,
        name,
        emailVerified: false,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
    });
  }
});

// User login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Generate tokens
    const token = generateToken(
      {
        userId: user.id,
        email,
        emailVerified: user.emailVerified,
        roles: user.roles,
      },
      { secret: JWT_SECRET }
    );

    // Set cookie for web clients
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
    });
  }
});

// Email verification
app.post('/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    const payload = verifyToken(token, { secret: JWT_SECRET });

    if (payload.purpose !== 'email-verification') {
      return res.status(400).json({
        error: 'Invalid verification token',
      });
    }

    // Update user
    await db.updateUser(payload.email, { emailVerified: true });

    res.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid or expired verification token',
    });
  }
});

// Password reset request
app.post('/auth/password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user (don't reveal if email exists)
    const user = await db.findUserByEmail(email);

    if (user) {
      // Generate reset token
      const resetToken = generateToken(
        { email, purpose: 'password-reset' },
        { secret: JWT_SECRET, expiresIn: '1h' }
      );

      // Send reset email
      sendPasswordResetEmail(email, resetToken);
    }

    // Always return success
    res.json({
      message:
        'If your email is registered, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Password reset failed',
    });
  }
});

// Protected routes
app.get('/api/profile', auth, async (req, res) => {
  const user = await db.findUserById(req.user.userId);
  res.json({ user });
});

// Verified users only
app.post('/api/posts', auth, verifiedOnly, async (req, res) => {
  const post = await db.createPost({
    ...req.body,
    authorId: req.user.userId,
  });
  res.json({ post });
});

// Admin routes
app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  const users = await db.getAllUsers();
  res.json({ users });
});

// Logout
app.post('/auth/logout', auth, (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/auth/docs/API_GUIDE.md) -
  Complete API documentation
- 📙
  [LLM Integration Guide](https://github.com/voilajs/appkit/blob/main/src/auth/docs/PROMPT_GUIDE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- Store JWT secrets in environment variables
- Use HTTPS in production
- Implement rate limiting on auth endpoints
- Use short-lived tokens with refresh token rotation
- Never store plain text passwords
- Use appropriate bcrypt rounds (10-12)

### 🏗️ Architecture

- Separate auth logic from business logic
- Use middleware composition for complex auth scenarios
- Implement proper error handling
- Log authentication events for security monitoring

### 🚀 Performance

- Cache verified tokens when possible
- Use async/await properly
- Consider token size impact on requests
- Balance bcrypt rounds with performance needs

### 👥 User Experience

- Provide clear error messages
- Implement "remember me" functionality
- Use appropriate token expiration times
- Handle token refresh gracefully

---

<p align="center">
  Made with ❤️ by the VoilaJS team
</p>
