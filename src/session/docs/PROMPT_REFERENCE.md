# @voilajsx/appkit/session - LLM API Reference

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

### 1. `createSessionMiddleware`

```typescript
function createSessionMiddleware(options: {
  store?: SessionStore;
  secret?: string;
  cookieName?: string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  rolling?: boolean;
  path?: string;
  domain?: string;
}): Function;
```

- Default `store`: `new MemoryStore()`
- Default `cookieName`: `'sessionId'`
- Default `maxAge`: `86400000` (24 hours)
- Default `secure`: Auto-detected based on NODE_ENV
- Default `httpOnly`: `true`
- Default `sameSite`: `'strict'`
- Default `rolling`: `true`
- Default `path`: `'/'`
- **Secret required in production**

### 2. `createSessionAuthMiddleware`

```typescript
function createSessionAuthMiddleware(options?: {
  loginUrl?: string;
  userKey?: string;
  getUser?: (sessionData: any) => any;
  onAuthRequired?: (req: any, res: any, next: Function, error: Error) => void;
}): Function;
```

- Default `loginUrl`: `'/login'`
- Default `userKey`: `'user'`
- Default `getUser`: `(sessionData) => sessionData.user`

### 3. `createSessionAuthorizationMiddleware`

```typescript
function createSessionAuthorizationMiddleware(
  allowedRoles: string | string[],
  options?: {
    roleKey?: string;
    getRoles?: (user: any) => string[];
  }
): Function;
```

- Default `roleKey`: `'role'`
- Default `getRoles`: Extract roles from user object

### 4. Session Stores

#### `MemoryStore`

```typescript
class MemoryStore {
  constructor();
  async get(sessionId: string): Promise<any>;
  async set(sessionId: string, data: any, maxAge?: number): Promise<void>;
  async destroy(sessionId: string): Promise<void>;
  async touch(sessionId: string, maxAge: number): Promise<void>;
  length(): number;
  async clear(): Promise<void>;
}
```

#### `FileStore`

```typescript
class FileStore {
  constructor(
    directory?: string,
    options?: {
      extension?: string;
      cleanupInterval?: number;
      encoding?: string;
    }
  );
  // Same methods as MemoryStore plus:
  stopCleanup(): void;
  destroy(): void;
}
```

#### `RedisStore`

```typescript
class RedisStore {
  constructor(
    client: any,
    options?: {
      prefix?: string;
      serializer?: any;
    }
  );
  // Same methods as MemoryStore plus:
  async ping(): Promise<boolean>;
}
```

### 5. Utility Functions

#### `createSessionSecret`

```typescript
function createSessionSecret(length?: number): string;
```

- Default `length`: `32`

#### `validateSessionConfig`

```typescript
function validateSessionConfig(options: any): {
  valid: boolean;
  errors: string[];
  warnings: string[];
};
```

#### `sanitizeSessionData`

```typescript
function sanitizeSessionData(
  data: any,
  options?: {
    removeKeys?: string[];
    maxDepth?: number;
    maxSize?: number;
  }
): any;
```

## Example Implementations

### Basic Session Setup

```javascript
/**
 * Creates session middleware for Express application
 * @param {Object} options - Session configuration options
 * @returns {Function} Express middleware
 */
function setupSessions(options = {}) {
  const { store, secret = process.env.SESSION_SECRET } = options;

  return createSessionMiddleware({
    store: store || new MemoryStore(),
    secret,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    rolling: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Handles user login with session creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    await req.session.save({
      user: { id: user.id, email: user.email, role: user.role },
    });

    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}
```

### Session Store Configuration

```javascript
/**
 * Creates appropriate session store based on environment
 * @returns {Object} Session store instance
 */
function createSessionStore() {
  const env = process.env.NODE_ENV;

  if (env === 'production') {
    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    return new RedisStore(redis, {
      prefix: 'sess:',
    });
  } else if (env === 'staging') {
    return new FileStore('./sessions', {
      cleanupInterval: 60000,
    });
  } else {
    return new MemoryStore();
  }
}

/**
 * Validates session store health
 * @param {Object} store - Session store instance
 * @returns {Promise<boolean>} Store health status
 */
async function validateStore(store) {
  try {
    if (store.ping) {
      return await store.ping();
    }

    // Test basic operations
    const testId = 'health-check';
    await store.set(testId, { test: true }, 1000);
    const data = await store.get(testId);
    await store.destroy(testId);

    return data && data.test === true;
  } catch (error) {
    console.error('Store validation failed:', error);
    return false;
  }
}
```

### Authentication Middleware

```javascript
/**
 * Creates authentication middleware with custom user extraction
 * @param {Object} options - Authentication options
 * @returns {Function} Authentication middleware
 */
function createAuth(options = {}) {
  return createSessionAuthMiddleware({
    loginUrl: options.loginUrl || '/login',
    getUser: (sessionData) => {
      // Custom user validation
      const user = sessionData.user;
      if (!user || !user.id) return null;

      // Check if user is active
      if (user.status === 'suspended') return null;

      return user;
    },
  });
}

/**
 * Creates role-based authorization middleware
 * @param {string|string[]} roles - Required roles
 * @param {Object} options - Authorization options
 * @returns {Function} Authorization middleware
 */
function createRoleAuth(roles, options = {}) {
  return createSessionAuthorizationMiddleware(roles, {
    getRoles: (user) => {
      // Handle hierarchical roles
      const roleHierarchy = {
        user: ['user'],
        moderator: ['user', 'moderator'],
        admin: ['user', 'moderator', 'admin'],
      };

      return roleHierarchy[user.role] || [];
    },
  });
}
```

### Session Management

```javascript
/**
 * Handles user logout with session cleanup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
async function handleLogout(req, res) {
  try {
    if (req.session && req.session.isActive()) {
      await req.session.destroy();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}

/**
 * Updates user session data
 * @param {Object} req - Express request object
 * @param {Object} userData - Updated user data
 * @returns {Promise<void>}
 */
async function updateUserSession(req, userData) {
  if (!req.session || !req.session.isActive()) {
    throw new Error('No active session');
  }

  const currentUser = req.session.data.user;
  await req.session.save({
    user: { ...currentUser, ...userData },
  });
}

/**
 * Regenerates session ID for security
 * @param {Object} req - Express request object
 * @returns {Promise<void>}
 */
async function regenerateSession(req) {
  if (req.session && req.session.isActive()) {
    await req.session.regenerate();
  }
}
```

### Complete Route Handler

```javascript
/**
 * Sets up complete authentication routes
 * @param {Object} app - Express application
 * @param {Object} options - Configuration options
 */
function setupAuthRoutes(app, options = {}) {
  const sessionMiddleware = setupSessions(options);
  const authRequired = createAuth(options);
  const adminOnly = createRoleAuth(['admin']);

  app.use(sessionMiddleware);

  // Public routes
  app.post('/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const user = await createUser({ email, password, name });

      await req.session.save({
        user: { id: user.id, email, name, role: 'user' },
      });

      res.status(201).json({ message: 'Registration successful', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/login', handleLogin);

  // Protected routes
  app.get('/profile', authRequired, (req, res) => {
    res.json({ user: req.user });
  });

  app.post('/logout', authRequired, handleLogout);

  // Admin routes
  app.get('/admin/users', authRequired, adminOnly, async (req, res) => {
    const users = await getAllUsers();
    res.json({ users });
  });
}

/**
 * Creates session monitoring endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function sessionStatus(req, res) {
  if (!req.session) {
    return res.json({ active: false });
  }

  res.json({
    active: req.session.isActive(),
    age: req.session.getAge(),
    hasUser: !!req.session.data.user,
  });
}
```

### Error Handling and Validation

```javascript
/**
 * Validates session configuration
 * @param {Object} config - Session configuration
 * @returns {Object} Validation result
 */
function validateSessionConfiguration(config) {
  const validation = validateSessionConfig(config);

  if (!validation.valid) {
    throw new Error(`Invalid session config: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('Session config warnings:', validation.warnings);
  }

  return validation;
}

/**
 * Sanitizes user data before storing in session
 * @param {Object} userData - User data to sanitize
 * @returns {Object} Sanitized user data
 */
function sanitizeUserData(userData) {
  return sanitizeSessionData(userData, {
    removeKeys: ['password', 'passwordHash', 'socialSecurityNumber'],
    maxSize: 10 * 1024, // 10KB max
  });
}

/**
 * Session error handler middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function sessionErrorHandler(error, req, res, next) {
  console.error('Session error:', error);

  if (error.message.includes('session')) {
    res.status(500).json({
      error: 'Session error',
      message: 'Please try logging in again',
    });
  } else {
    next(error);
  }
}
```

## Code Generation Rules

1. **Always use async/await** for session operations
2. **Include comprehensive error handling** in all examples
3. **Use environment variables** for secrets and configuration
4. **Follow JSDoc format** exactly as shown
5. **Check session state** before operations
6. **Return appropriate HTTP status codes** for different scenarios
7. **Use framework-agnostic patterns** that work with Express, Fastify, etc.
8. **Implement proper session lifecycle management** (create, update, destroy)

## Security Considerations for Code Generation

1. **Secret Management**: Always use environment variables for secrets
2. **Session Regeneration**: Regenerate sessions after authentication
3. **Data Sanitization**: Remove sensitive data before storing in sessions
4. **Cookie Security**: Use secure settings in production
5. **Validation**: Validate all session data before use
6. **Error Handling**: Don't expose sensitive information in errors

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
