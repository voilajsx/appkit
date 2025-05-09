## @voilajs/appkit/auth LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

### LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM, single quotes, 2-space indentation, semicolons, JSDoc.

2. **Always include JSDoc comments** with all functions using this format:

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error handling patterns**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Return standardized error objects

4. **Framework agnostic**:
   - Implementation should work with any framework
   - Middleware patterns should be adaptable

### Function Signatures

#### 1. `generateToken`

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

#### 2. `verifyToken`

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

#### 3. `hashPassword`

```typescript
async function hashPassword(password: string, rounds?: number): Promise<string>;
```

- Default `rounds`: `10`

#### 4. `comparePassword`

```typescript
async function comparePassword(
  password: string,
  hash: string
): Promise<boolean>;
```

#### 5. `createAuthMiddleware`

```typescript
function createAuthMiddleware(options: {
  secret: string;
  getToken?: (req: any) => string | null;
  onError?: (error: Error, req: any, res: any, next: Function) => void;
}): Function;
```

- Default: Checks `Authorization: Bearer <token>` and `req.cookies.jwt`

#### 6. `createAuthorizationMiddleware`

```typescript
function createAuthorizationMiddleware(
  roles: string[],
  options?: {
    getRoles?: (req: any) => string[];
  }
): Function;
```

- Default: Uses `req.user.roles`

### Example Implementations

#### Basic Authentication

```javascript
/**
 * Registers a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User token and ID
 */
async function registerUser(email, password) {
  const hashedPassword = await hashPassword(password, 12);
  // Store user in database
  const userId = 'user_id'; // From database insert
  const token = generateToken(
    { userId, email, roles: ['user'] },
    { secret: 'YOUR_SECRET_KEY' }
  );
  return { token, userId };
}

/**
 * Authenticates a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} Authentication token
 */
async function loginUser(email, password) {
  // Get user from database
  const user = { id: 'user_id', password: 'hashed_pw', roles: ['user'] };
  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');

  return generateToken(
    { userId: user.id, roles: user.roles },
    { secret: 'YOUR_SECRET_KEY' }
  );
}
```

#### Token Verification

```javascript
/**
 * Validates a user token
 * @param {string} token - JWT token to validate
 * @returns {Object} Validation result
 */
function validateToken(token) {
  try {
    const payload = verifyToken(token, { secret: 'YOUR_SECRET_KEY' });
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}

/**
 * Refreshes an expired token
 * @param {string} oldToken - Expired token
 * @returns {Object} New token and user data
 */
function refreshToken(oldToken) {
  try {
    // Verify but ignore expiration
    const payload = verifyToken(oldToken, {
      secret: 'YOUR_SECRET_KEY',
      ignoreExpiration: true,
    });

    // Remove token metadata
    const { iat, exp, ...userData } = payload;

    return {
      token: generateToken(userData, {
        secret: 'YOUR_SECRET_KEY',
        expiresIn: '7d',
      }),
      user: userData,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

#### Framework-Agnostic Middleware

```javascript
/**
 * Creates authentication middleware
 * @returns {Function} Authentication middleware
 */
function createAuthHandler() {
  return function authHandler(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const payload = verifyToken(token, { secret: 'YOUR_SECRET_KEY' });
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
}

/**
 * Creates role-based authorization middleware
 * @param {string[]} requiredRoles - Required roles for access
 * @returns {Function} Authorization middleware
 */
function createRoleHandler(requiredRoles) {
  return function roleHandler(req, res, next) {
    const userRoles = req.user?.roles || [];
    const hasAccess = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
}
```
