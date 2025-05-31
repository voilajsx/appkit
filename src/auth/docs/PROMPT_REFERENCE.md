# @voilajsx/appkit/auth - LLM API Reference

**Note**: Implementation is in JavaScript. TypeScript signatures are for
reference only.

## LLM Code Generation Guidelines

1. **File Header Comments** (Required for all files):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/auth
    * @file path/to/filename.js
    */
   ```

2. **Function JSDoc** (Required for all functions):

   ```javascript
   /**
    * One clear sentence describing what the function does
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Focus on reduced file size and clean code

4. **Comment Guidelines**:

   - **File headers**: Always include with description, module, and file path
   - **Function docs**: One clear sentence describing the purpose
   - **Inline comments**: Only for complex logic that's confusing or hard to
     understand
   - **No basic comments**: Avoid obvious comments like `// Hash password`
     before `hashPassword()`
   - **Focus on minimal file size**: Comment only when necessary for
     understanding

5. **Secrets and Configuration**:

   - Use simple hardcoded secrets for basic examples (`'your-secret-key'`)
   - Use environment variables only in complete application examples
     (`process.env.JWT_SECRET`)

6. **Database References**:

   - If database is needed, use generic `db` object (e.g.,
     `db.findUserByEmail()`, `db.createUser()`)
   - Don't import or define `db` - assume it's available in scope
   - Keep database operations simple and generic

7. **Error Handling**:
   - Use try/catch blocks for async functions
   - Throw descriptive error messages

## Function Signatures

### 1. `generateToken`

```typescript
function generateToken(
  payload: Record<string, any>,
  options: {
    secret: string;
    expiresIn?: string;
    algorithm?: string;
  }
): string;
```

- Default `expiresIn`: `'7d'`
- Default `algorithm`: `'HS256'`

### 2. `verifyToken`

```typescript
function verifyToken(
  token: string,
  options: {
    secret: string;
    algorithms?: string[];
  }
): Record<string, any>;
```

- Default `algorithms`: `['HS256']`
- Throws: `'Token has expired'` or `'Invalid token'`

### 3. `hashPassword`

```typescript
async function hashPassword(password: string, rounds?: number): Promise<string>;
```

- Default `rounds`: `10`

### 4. `comparePassword`

```typescript
async function comparePassword(
  password: string,
  hash: string
): Promise<boolean>;
```

### 5. `createAuthMiddleware`

```typescript
function createAuthMiddleware(options: {
  secret: string;
  getToken?: (req: any) => string | null;
  onError?: (error: Error, req: any, res: any) => void;
}): Function;
```

- Default token extraction: `Authorization` header → `req.cookies.token` →
  `req.query.token`

### 6. `createAuthorizationMiddleware`

```typescript
function createAuthorizationMiddleware(
  roles: string[],
  options?: {
    getRoles?: (req: any) => string[];
  }
): Function;
```

- Default: Uses `req.user.roles`

## Example Implementations

### Basic Authentication

```javascript
/**
 * User authentication utilities with registration and login
 * @module @voilajsx/appkit/auth
 * @file examples/basic-auth.js
 */

import {
  hashPassword,
  comparePassword,
  generateToken,
} from '@voilajsx/appkit/auth';

/**
 * Registers a new user with hashed password
 * @param {string} email - User email address
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} User token and ID
 * @throws {Error} If registration fails
 */
async function registerUser(email, password) {
  const hashedPassword = await hashPassword(password, 12);
  const user = await db.createUser({
    email,
    password: hashedPassword,
    roles: ['user'],
  });

  const token = generateToken(
    { userId: user.id, email, roles: user.roles },
    { secret: 'your-secret-key' }
  );

  return { token, userId: user.id };
}

/**
 * Authenticates user with email and password
 * @param {string} email - User email address
 * @param {string} password - Plain text password
 * @returns {Promise<string>} JWT authentication token
 * @throws {Error} If credentials are invalid
 */
async function loginUser(email, password) {
  const user = await db.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return generateToken(
    { userId: user.id, email, roles: user.roles },
    { secret: 'your-secret-key' }
  );
}
```

### Token Management

```javascript
/**
 * JWT token validation and management utilities
 * @module @voilajsx/appkit/auth
 * @file examples/token-management.js
 */

import { generateToken, verifyToken } from '@voilajsx/appkit/auth';

/**
 * Validates a JWT token and returns result
 * @param {string} token - JWT token to validate
 * @returns {Object} Validation result with payload or error
 */
function validateToken(token) {
  try {
    const payload = verifyToken(token, { secret: 'your-secret-key' });
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Creates a password reset token with short expiration
 * @param {string} email - User email address
 * @returns {string} Time-limited reset token
 */
function createResetToken(email) {
  return generateToken(
    { email, purpose: 'password-reset' },
    { secret: 'your-secret-key', expiresIn: '1h' }
  );
}
```

### Middleware Integration

```javascript
/**
 * Express authentication and authorization middleware setup
 * @module @voilajsx/appkit/auth
 * @file examples/middleware-setup.js
 */

import {
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajsx/appkit/auth';

/**
 * Creates configured authentication middleware
 * @returns {Function} Express authentication middleware
 */
function createAuth() {
  return createAuthMiddleware({
    secret: 'your-secret-key',
    getToken: (req) => {
      // Check multiple token sources in priority order
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ')) {
        return auth.slice(7);
      }
      if (req.cookies?.token) {
        return req.cookies.token;
      }
      if (req.query?.token) {
        return req.query.token;
      }
      return null;
    },
    onError: (error, req, res) => {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
      });
    },
  });
}

/**
 * Creates role-based authorization middleware
 * @param {string[]} roles - Required roles for access
 * @returns {Function} Express authorization middleware
 */
function createRoleAuth(roles) {
  return createAuthorizationMiddleware(roles, {
    getRoles: (req) => req.user?.roles || [],
  });
}
```

### Complete Route Handler

```javascript
/**
 * Complete Express application with authentication routes
 * @module @voilajsx/appkit/auth
 * @file examples/complete-app.js
 */

import express from 'express';
import { registerUser, loginUser } from './auth-functions.js';

/**
 * Sets up authentication routes on Express app
 * @param {Object} app - Express application instance
 */
function setupRoutes(app) {
  const auth = createAuth();
  const adminOnly = createRoleAuth(['admin']);

  // Public registration endpoint
  app.post('/auth/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await registerUser(email, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Protected user profile endpoint
  app.get('/api/profile', auth, async (req, res) => {
    const user = await db.findUserById(req.user.userId);
    res.json({ user });
  });

  // Admin-only users list endpoint
  app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
    const users = await db.getAllUsers();
    res.json({ users });
  });
}
```

## Code Generation Rules

1. **Always include file header** with description, @module, and @file tags
2. **Use JSDoc for all functions** with one clear sentence descriptions
3. **Add inline comments** only for complex logic that needs explanation
4. **Use async/await** for all password and database functions
5. **Include comprehensive error handling** with try/catch blocks
6. **Use simple secrets** for basic examples ('your-secret-key')
7. **Use environment variables** only in complete application examples
   (process.env.JWT_SECRET)
8. **Use generic db object** for database operations without imports
9. **Return consistent response formats** in API endpoints
10. **Focus on minimal file size** - avoid unnecessary comments
11. **Follow ESM import style** with single quotes and semicolons

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">voilajsx Team</a> — powering modern web development.
</p>
