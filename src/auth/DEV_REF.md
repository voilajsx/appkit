# Auth Module

The auth module provides secure authentication utilities for Node.js applications. It offers JWT token generation and verification, password hashing with bcrypt, and customizable middleware for protecting routes - all with sensible defaults to get you started quickly.

Whether you need simple password hashing, JWT token management, or complete authentication middleware, this module provides flexible, composable utilities that work with any Node.js framework.

## Table of Contents

- [Installation](#installation)
- [Using Password Utilities](#using-password-utilities)
  - [Hashing Passwords](#hashing-passwords)
  - [Comparing Passwords](#comparing-passwords)
  - [Complete Password Example](#complete-password-example)
- [Using JWT Utilities](#using-jwt-utilities)
  - [Generating Tokens](#generating-tokens)
  - [Verifying Tokens](#verifying-tokens)
  - [Complete JWT Example](#complete-jwt-example)
- [Using Authentication Middleware](#using-authentication-middleware)
  - [Basic Authentication](#basic-authentication)
  - [Custom Token Extraction](#custom-token-extraction)
  - [Error Handling](#error-handling)
  - [Complete Middleware Example](#complete-middleware-example)
- [Using Authorization Middleware](#using-authorization-middleware)
  - [Role-Based Access](#role-based-access)
  - [Custom Role Extraction](#custom-role-extraction)
  - [Complete Authorization Example](#complete-authorization-example)
- [Complete Integration Example](#complete-integration-example)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Installation

```bash
npm install @voilajs/appkit
```

## Using Password Utilities

The password utilities provide secure password hashing and comparison using bcrypt.

### Hashing Passwords

Use `hashPassword` to securely hash passwords before storing them:

```javascript
import { hashPassword } from '@voilajs/appkit/auth';

// Basic usage - uses 10 rounds by default
const hash = await hashPassword('myPassword123');

// Custom salt rounds for extra security
const secureHash = await hashPassword('myPassword123', 12);
```

### Comparing Passwords

Use `comparePassword` to verify a password against its hash:

```javascript
import { comparePassword } from '@voilajs/appkit/auth';

const isValid = await comparePassword('myPassword123', hash);
if (isValid) {
  console.log('Password is correct!');
} else {
  console.log('Invalid password');
}
```

### Complete Password Example

```javascript
import { hashPassword, comparePassword } from '@voilajs/appkit/auth';

// User registration
async function registerUser(email, password) {
  // Hash the password
  const hashedPassword = await hashPassword(password);
  
  // Save to database
  const user = await db.createUser({
    email,
    password: hashedPassword
  });
  
  return user;
}

// User login
async function loginUser(email, password) {
  // Get user from database
  const user = await db.findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }
  
  return user;
}
```

## Using JWT Utilities

JWT utilities handle token generation and verification for stateless authentication.

### Generating Tokens

Use `generateToken` to create JWT tokens:

```javascript
import { generateToken } from '@voilajs/appkit/auth';

// Basic usage - token expires in 7 days by default
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);

// Custom expiration
const shortToken = generateToken(
  { userId: '123' },
  { secret: 'your-secret-key', expiresIn: '1h' }
);

// Custom algorithm
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
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log('User ID:', payload.userId);
} catch (error) {
  if (error.message === 'Token has expired') {
    console.log('Token expired - user needs to login again');
  } else {
    console.log('Invalid token');
  }
}
```

### Complete JWT Example

```javascript
import { generateToken, verifyToken } from '@voilajs/appkit/auth';

// Generate tokens for different purposes
function createAuthToken(user) {
  return generateToken(
    { 
      userId: user.id, 
      email: user.email,
      roles: user.roles 
    },
    { secret: process.env.JWT_SECRET }
  );
}

function createResetToken(email) {
  return generateToken(
    { email, purpose: 'password-reset' },
    { secret: process.env.JWT_SECRET, expiresIn: '1h' }
  );
}

// Verify tokens
function verifyAuthToken(token) {
  try {
    return verifyToken(token, { secret: process.env.JWT_SECRET });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
```

## Using Authentication Middleware

Authentication middleware protects routes by verifying JWT tokens.

### Basic Authentication

Create middleware with just a secret:

```javascript
import { createAuthMiddleware } from '@voilajs/appkit/auth';
import express from 'express';

const app = express();

// Create middleware
const auth = createAuthMiddleware({ 
  secret: process.env.JWT_SECRET 
});

// Protect routes
app.get('/dashboard', auth, (req, res) => {
  // req.user contains the token payload
  res.json({ 
    message: 'Welcome to dashboard',
    userId: req.user.userId 
  });
});
```

### Custom Token Extraction

Override the default token extraction logic:

```javascript
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
  getToken: (req) => {
    // Check custom header first
    if (req.headers['x-api-token']) {
      return req.headers['x-api-token'];
    }
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    
    // Check cookies
    if (req.cookies?.jwt) {
      return req.cookies.jwt;
    }
    
    return null;
  }
});
```

### Error Handling

Customize error responses:

```javascript
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
  onError: (error, req, res) => {
    if (error.message === 'Token has expired') {
      res.status(401).json({
        error: 'Session expired',
        code: 'TOKEN_EXPIRED',
        message: 'Please login again'
      });
    } else if (error.message === 'No token provided') {
      res.status(401).json({
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    } else {
      res.status(401).json({
        error: 'Invalid authentication',
        code: 'INVALID_TOKEN'
      });
    }
  }
});
```

### Complete Middleware Example

```javascript
import { createAuthMiddleware, generateToken } from '@voilajs/appkit/auth';
import express from 'express';

const app = express();

// Create auth middleware
const auth = createAuthMiddleware({ 
  secret: process.env.JWT_SECRET 
});

// Public route - no auth needed
app.get('/', (req, res) => {
  res.json({ message: 'Public endpoint' });
});

// Login route - generates token
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Verify credentials (your logic here)
  const user = await authenticateUser(email, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = generateToken(
    { userId: user.id, email: user.email },
    { secret: process.env.JWT_SECRET }
  );
  
  res.json({ token });
});

// Protected route - requires valid token
app.get('/profile', auth, async (req, res) => {
  // req.user is populated by the middleware
  const user = await db.findUserById(req.user.userId);
  res.json({ user });
});
```

## Using Authorization Middleware

Authorization middleware adds role-based access control.

### Role-Based Access

Protect routes based on user roles:

```javascript
import { createAuthorizationMiddleware } from '@voilajs/appkit/auth';

// Create role-specific middleware
const adminOnly = createAuthorizationMiddleware(['admin']);
const editorAccess = createAuthorizationMiddleware(['editor', 'admin']);

// Apply to routes
app.get('/admin/dashboard', auth, adminOnly, (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

app.put('/content/edit', auth, editorAccess, (req, res) => {
  res.json({ message: 'Edit content' });
});
```

### Custom Role Extraction

Customize how roles are extracted from the request:

```javascript
// Check subscription-based roles
const premiumOnly = createAuthorizationMiddleware(['premium'], {
  getRoles: (req) => {
    // Check if user has active subscription
    if (req.user.subscription?.active) {
      return ['premium'];
    }
    return [];
  }
});

// Hierarchical roles
const managerOnly = createAuthorizationMiddleware(['manager'], {
  getRoles: (req) => {
    const roleHierarchy = {
      employee: ['employee'],
      supervisor: ['employee', 'supervisor'],
      manager: ['employee', 'supervisor', 'manager'],
      director: ['employee', 'supervisor', 'manager', 'director']
    };
    
    return roleHierarchy[req.user.role] || [];
  }
});
```

### Complete Authorization Example

```javascript
import { 
  createAuthMiddleware, 
  createAuthorizationMiddleware 
} from '@voilajs/appkit/auth';

// Create middleware
const auth = createAuthMiddleware({ 
  secret: process.env.JWT_SECRET 
});

const adminOnly = createAuthorizationMiddleware(['admin']);
const moderatorAccess = createAuthorizationMiddleware(['moderator', 'admin']);

// Apply different levels of access
app.get('/users', auth, async (req, res) => {
  // Any authenticated user can view users
  const users = await db.getUsers();
  res.json({ users });
});

app.put('/users/:id/ban', auth, moderatorAccess, async (req, res) => {
  // Only moderators and admins can ban users
  await db.banUser(req.params.id);
  res.json({ message: 'User banned' });
});

app.delete('/users/:id', auth, adminOnly, async (req, res) => {
  // Only admins can delete users
  await db.deleteUser(req.params.id);
  res.json({ message: 'User deleted' });
});
```

## Complete Integration Example

Here's a complete example showing all utilities working together:

```javascript
import express from 'express';
import { 
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
  createAuthorizationMiddleware
} from '@voilajs/appkit/auth';

const app = express();
app.use(express.json());

// Create middleware
const auth = createAuthMiddleware({ 
  secret: process.env.JWT_SECRET 
});

const adminOnly = createAuthorizationMiddleware(['admin']);

// User registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await db.createUser({
      email,
      password: hashedPassword,
      name,
      roles: ['user']
    });
    
    // Generate token
    const token = generateToken(
      { userId: user.id, email, roles: user.roles },
      { secret: process.env.JWT_SECRET }
    );
    
    res.json({ token, user: { id: user.id, email, name } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await db.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(
      { userId: user.id, email, roles: user.roles },
      { secret: process.env.JWT_SECRET }
    );
    
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Public route
app.get('/products', async (req, res) => {
  const products = await db.getProducts();
  res.json({ products });
});

// Protected route - requires authentication
app.get('/orders', auth, async (req, res) => {
  const orders = await db.getUserOrders(req.user.userId);
  res.json({ orders });
});

// Admin route - requires admin role
app.get('/admin/stats', auth, adminOnly, async (req, res) => {
  const stats = await db.getSystemStats();
  res.json({ stats });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## API Reference

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `generateToken` | Creates JWT token | `payload: Object`, `options: {secret, expiresIn?, algorithm?}` | `string` |
| `verifyToken` | Verifies JWT token | `token: string`, `options: {secret, algorithms?}` | `Object` |
| `hashPassword` | Hashes password | `password: string`, `rounds?: number` | `Promise<string>` |
| `comparePassword` | Compares password with hash | `password: string`, `hash: string` | `Promise<boolean>` |
| `createAuthMiddleware` | Creates auth middleware | `options: {secret, getToken?, onError?}` | `Function` |
| `createAuthorizationMiddleware` | Creates role middleware | `roles: string[]`, `options?: {getRoles?}` | `Function` |

## Best Practices

1. **Environment Variables**: Always store secrets in environment variables
2. **HTTPS**: Use HTTPS in production to protect tokens in transit
3. **Error Handling**: Don't reveal whether an email exists during login failures
4. **Token Expiration**: Use short-lived tokens (hours/days, not months)
5. **Password Requirements**: Enforce minimum password length and complexity
6. **Salt Rounds**: Use at least 10 rounds for bcrypt (12 for high security)
7. **Input Validation**: Always validate input before processing