# @voilajs/appkit/auth - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Middleware patterns should be adaptable

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
 * Registers a new user
 * @param {string} email - User email
 * @param {string} password - User password
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
    { secret: process.env.JWT_SECRET }
  );

  return { token, userId: user.id };
}

/**
 * Authenticates a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} Authentication token
 * @throws {Error} If credentials invalid
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
    { secret: process.env.JWT_SECRET }
  );
}
```

### Token Management

```javascript
/**
 * Validates a JWT token
 * @param {string} token - JWT token to validate
 * @returns {Object} Validation result
 */
function validateToken(token) {
  try {
    const payload = verifyToken(token, { secret: process.env.JWT_SECRET });
    return { valid: true, payload };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

/**
 * Creates password reset token
 * @param {string} email - User email
 * @returns {string} Reset token
 */
function createResetToken(email) {
  return generateToken(
    { email, purpose: 'password-reset' },
    { secret: process.env.JWT_SECRET, expiresIn: '1h' }
  );
}
```

### Middleware Integration

```javascript
/**
 * Creates Express authentication middleware
 * @returns {Function} Authentication middleware
 */
function createAuth() {
  return createAuthMiddleware({
    secret: process.env.JWT_SECRET,
    getToken: (req) => {
      // Authorization header
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ')) {
        return auth.slice(7);
      }
      // Cookie
      if (req.cookies?.token) {
        return req.cookies.token;
      }
      // Query parameter
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
 * Creates role-based middleware
 * @param {string[]} roles - Required roles
 * @returns {Function} Authorization middleware
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
 * Protected route handler
 * @param {Object} app - Express app
 */
function setupRoutes(app) {
  const auth = createAuth();
  const adminOnly = createRoleAuth(['admin']);

  // Public route
  app.post('/auth/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await registerUser(email, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Protected route
  app.get('/api/profile', auth, async (req, res) => {
    const user = await db.findUserById(req.user.userId);
    res.json({ user });
  });

  // Admin route
  app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
    const users = await db.getAllUsers();
    res.json({ users });
  });
}
```

## Code Generation Rules

1. **Always use async/await** for password functions
2. **Include error handling** in all examples
3. **Use environment variables** for secrets
4. **Follow JSDoc format** exactly as shown
5. **Check for null/undefined** before operations
6. **Return standardized responses** in middleware
