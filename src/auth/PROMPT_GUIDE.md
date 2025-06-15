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

5. **Environment Variables**:

   - **Always use .env files** for configuration in examples
   - **Show both approaches**: environment variables and explicit options
   - **Demonstrate precedence**: explicit options override environment variables
   - **Use dotenv package** to load environment variables
   - **Never hardcode secrets** in production examples

6. **Database References**:

   - If database is needed, use generic `db` object (e.g.,
     `db.findUserByEmail()`, `db.createUser()`)
   - Don't import or define `db` - assume it's available in scope
   - Keep database operations simple and generic

7. **Error Handling**:
   - Use try/catch blocks for async functions
   - Throw descriptive error messages

## Environment Variables

The auth module automatically detects and uses `VOILA_AUTH_*` environment
variables:

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

**Precedence Order**: Explicit options > Environment variables > Defaults

## Function Signatures

### 1. `generateToken`

```typescript
function generateToken(
  payload: Record<string, any>,
  options?: {
    secret?: string; // Uses VOILA_AUTH_SECRET if not provided
    expiresIn?: string; // Uses VOILA_AUTH_EXPIRES_IN if not provided
    algorithm?: string; // Uses VOILA_AUTH_ALGORITHM if not provided
  }
): string;
```

- Environment: `VOILA_AUTH_SECRET`, `VOILA_AUTH_EXPIRES_IN`,
  `VOILA_AUTH_ALGORITHM`
- Default `expiresIn`: `'7d'`
- Default `algorithm`: `'HS256'`

### 2. `verifyToken`

```typescript
function verifyToken(
  token: string,
  options?: {
    secret?: string; // Uses VOILA_AUTH_SECRET if not provided
    algorithms?: string[];
  }
): Record<string, any>;
```

- Environment: `VOILA_AUTH_SECRET`
- Default `algorithms`: `['HS256']`
- Throws: `'Token has expired'` or `'Invalid token'`

### 3. `hashPassword`

```typescript
async function hashPassword(
  password: string,
  rounds?: number // Uses VOILA_AUTH_BCRYPT_ROUNDS if not provided
): Promise<string>;
```

- Environment: `VOILA_AUTH_BCRYPT_ROUNDS`
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
function createAuthMiddleware(options?: {
  secret?: string; // Uses VOILA_AUTH_SECRET if not provided
  getToken?: (req: any) => string | null;
  onError?: (error: Error, req: any, res: any) => void;
}): Function;
```

- Environment: `VOILA_AUTH_SECRET`, `VOILA_AUTH_TOKEN_HEADER`,
  `VOILA_AUTH_COOKIE_NAME`
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

### Basic Authentication with Environment Variables

Create a `.env` file:

```bash
# .env file
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024
VOILA_AUTH_BCRYPT_ROUNDS=12
VOILA_AUTH_EXPIRES_IN=24h
```

```javascript
/**
 * User authentication utilities with environment configuration
 * @module @voilajsx/appkit/auth
 * @file examples/basic-auth.js
 */

import dotenv from 'dotenv';
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '@voilajsx/appkit/auth';

// Load environment variables from .env file
dotenv.config();

/**
 * Registers a new user with environment-configured hashing
 * @param {string} email - User email address
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} User token and ID
 * @throws {Error} If registration fails
 */
async function registerUser(email, password) {
  // Uses VOILA_AUTH_BCRYPT_ROUNDS automatically from .env
  const hashedPassword = await hashPassword(password);
  const user = await db.createUser({
    email,
    password: hashedPassword,
    roles: ['user'],
  });

  // Uses VOILA_AUTH_SECRET and VOILA_AUTH_EXPIRES_IN automatically from .env
  const token = generateToken({
    userId: user.id,
    email,
    roles: user.roles,
  });

  return { token, userId: user.id };
}

/**
 * Authenticates user with environment-configured tokens
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

  // Uses environment configuration automatically from .env
  return generateToken({
    userId: user.id,
    email,
    roles: user.roles,
  });
}

/**
 * Alternative with explicit options (overrides environment)
 * @param {string} email - User email address
 * @param {string} password - Plain text password
 * @returns {Promise<string>} JWT authentication token
 */
async function loginUserExplicit(email, password) {
  const user = await db.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Explicit options override .env variables
  return generateToken(
    { userId: user.id, email, roles: user.roles },
    {
      secret: 'explicit-secret-override',
      expiresIn: '1h',
      algorithm: 'HS512',
    }
  );
}
```

### Token Management with Environment Configuration

Create a `.env` file:

```bash
# .env file
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024
VOILA_AUTH_EXPIRES_IN=7d
VOILA_AUTH_ALGORITHM=HS256
```

```javascript
/**
 * JWT token validation and management with environment configuration
 * @module @voilajsx/appkit/auth
 * @file examples/token-management.js
 */

import dotenv from 'dotenv';
import { generateToken, verifyToken } from '@voilajsx/appkit/auth';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates a JWT token using environment configuration
 * @param {string} token - JWT token to validate
 * @returns {Object} Validation result with payload or error
 */
function validateToken(token) {
  try {
    // Uses VOILA_AUTH_SECRET automatically from .env
    const payload = verifyToken(token);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Creates different token types with environment and explicit configuration
 * @param {string} email - User email address
 * @returns {Object} Various token types
 */
function createTokens(email) {
  // Access token using .env defaults
  const accessToken = generateToken({
    email,
    type: 'access',
  });

  // Password reset token with explicit short expiration
  const resetToken = generateToken(
    { email, purpose: 'password-reset' },
    { expiresIn: '1h' } // Overrides .env expiration
  );

  // Email verification token with explicit configuration
  const verificationToken = generateToken(
    { email, purpose: 'email-verification' },
    { expiresIn: '24h' }
  );

  return { accessToken, resetToken, verificationToken };
}

/**
 * Environment-aware token validation
 * @param {string} token - JWT token to validate
 * @param {string} [expectedPurpose] - Expected token purpose
 * @returns {Object} Validation result
 */
function validatePurposeToken(token, expectedPurpose) {
  try {
    const payload = verifyToken(token); // Uses .env secret

    if (expectedPurpose && payload.purpose !== expectedPurpose) {
      return { valid: false, error: 'Invalid token purpose' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

### Middleware Integration with Environment Variables

Create a `.env` file:

```bash
# .env file
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024
VOILA_AUTH_TOKEN_HEADER=authorization
VOILA_AUTH_COOKIE_NAME=authToken
```

```javascript
/**
 * Express authentication and authorization middleware with environment configuration
 * @module @voilajsx/appkit/auth
 * @file examples/middleware-setup.js
 */

import dotenv from 'dotenv';
import {
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajsx/appkit/auth';

// Load environment variables from .env file
dotenv.config();

/**
 * Creates authentication middleware using environment configuration
 * @returns {Function} Express authentication middleware
 */
function createAuth() {
  // Uses VOILA_AUTH_SECRET, VOILA_AUTH_TOKEN_HEADER, and VOILA_AUTH_COOKIE_NAME automatically from .env
  return createAuthMiddleware();
}

/**
 * Creates custom authentication middleware with mixed configuration
 * @returns {Function} Express authentication middleware with custom logic
 */
function createCustomAuth() {
  return createAuthMiddleware({
    // Uses VOILA_AUTH_SECRET from .env
    getToken: (req) => {
      // Custom token extraction with environment-aware fallbacks
      const headerName = process.env.VOILA_AUTH_TOKEN_HEADER || 'authorization';
      const cookieName = process.env.VOILA_AUTH_COOKIE_NAME || 'token';

      // Check Authorization header
      const auth = req.headers[headerName.toLowerCase()];
      if (auth?.startsWith('Bearer ')) {
        return auth.slice(7);
      }

      // Check cookies
      if (req.cookies?.[cookieName]) {
        return req.cookies[cookieName];
      }

      // Check query parameters
      if (req.query?.token) {
        return req.query.token;
      }

      return null;
    },
    onError: (error, req, res) => {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
        timestamp: new Date().toISOString(),
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

/**
 * Creates environment-specific middleware
 * @returns {Object} Middleware functions for different environments
 */
function createEnvironmentMiddleware() {
  // Load different .env files based on NODE_ENV
  const envFile =
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development';
  dotenv.config({ path: envFile });

  return {
    auth: createAuthMiddleware(), // Uses .env config
    adminOnly: createAuthorizationMiddleware(['admin']),
    userAccess: createAuthorizationMiddleware(['user', 'admin']),
  };
}
```

### Complete Route Handler with Environment Configuration

Create a `.env` file:

```bash
# .env file
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024
VOILA_AUTH_EXPIRES_IN=7d
VOILA_AUTH_BCRYPT_ROUNDS=12
VOILA_AUTH_TOKEN_HEADER=authorization
VOILA_AUTH_COOKIE_NAME=authToken
NODE_ENV=production
PORT=3000
```

```javascript
/**
 * Complete Express application with environment-driven authentication
 * @module @voilajsx/appkit/auth
 * @file examples/complete-app.js
 */

import dotenv from 'dotenv';
import express from 'express';
import { registerUser, loginUser } from './auth-functions.js';
import { createAuth, createRoleAuth } from './middleware-setup.js';

// Load environment variables from .env file
dotenv.config();

/**
 * Sets up authentication routes with environment configuration
 * @param {Object} app - Express application instance
 */
function setupRoutes(app) {
  const auth = createAuth(); // Uses .env configuration
  const adminOnly = createRoleAuth(['admin']);

  // Public registration endpoint
  app.post('/auth/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await registerUser(email, password); // Uses .env for hashing and tokens
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

/**
 * Main application setup with environment configuration
 */
function createApp() {
  const app = express();
  app.use(express.json());

  setupRoutes(app);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  return app;
}

export { setupRoutes, createApp };
```
