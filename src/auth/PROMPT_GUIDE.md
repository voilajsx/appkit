# @voilajsx/appkit/auth - LLM API Reference

**Implementation**: JavaScript ES6 modules with ultra-minimal API design.

## LLM Code Generation Guidelines

### File Structure Requirements

1. **File Header** (mandatory):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/auth
    * @file path/to/filename.js
    */
   ```

2. **Function Documentation** (mandatory):

   ```javascript
   /**
    * One clear sentence describing what the function does
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    */
   ```

3. **Code Style**:
   - ESM imports with single quotes
   - 2-space indentation
   - Semicolons required
   - Minimal comments (only for complex logic)

### Environment Variable Strategy

- **Always use .env files** in examples
- **Show VOILA_AUTH_SECRET** in all JWT examples
- **Load with dotenv.config()** at top of files
- **Never hardcode secrets** in code examples

## Complete API Reference

### JWT Functions

#### `signToken(payload, secret?, expiresIn?)`

Creates a JWT token.

```javascript
// Uses VOILA_AUTH_SECRET from .env
const token = signToken({ userId: 123 });

// With explicit secret
const token = signToken({ userId: 123 }, 'my-secret');

// With expiration
const token = signToken({ userId: 123 }, 'my-secret', '1h');
```

#### `verifyToken(token, secret?)`

Verifies a JWT token.

```javascript
// Uses VOILA_AUTH_SECRET from .env
const payload = verifyToken(token);

// With explicit secret
const payload = verifyToken(token, 'my-secret');
```

### Password Functions

#### `hashPassword(password, rounds?)`

Hashes a password with bcrypt.

```javascript
// Uses VOILA_AUTH_BCRYPT_ROUNDS from .env
const hash = await hashPassword('password123');

// With explicit rounds
const hash = await hashPassword('password123', 12);
```

#### `comparePassword(password, hash)`

Verifies a password against hash.

```javascript
const isValid = await comparePassword('password123', hash);
```

### Middleware Functions

#### `requireAuth(secret?, options?)`

Creates authentication middleware.

```javascript
// Uses VOILA_AUTH_SECRET from .env
app.get('/protected', requireAuth(), handler);

// With explicit secret
app.get('/protected', requireAuth('my-secret'), handler);
```

#### `requireRole(...roles)`

Creates role-based authorization middleware.

```javascript
// Single role
app.get('/admin', requireAuth(), requireRole('admin'), handler);

// Multiple roles
app.get('/content', requireAuth(), requireRole('admin', 'editor'), handler);
```

## Environment Variables

**Required .env file structure:**

```bash
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars
VOILA_AUTH_BCRYPT_ROUNDS=12
```

**Complete .env example:**

```bash
# JWT Configuration
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars

# Optional configurations
VOILA_AUTH_BCRYPT_ROUNDS=12
```

## Standard Code Patterns

### 1. Basic Authentication Setup

```javascript
/**
 * Complete authentication system with environment configuration
 * @module @voilajsx/appkit/auth
 * @file examples/auth-system.js
 */

import dotenv from 'dotenv';
import {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  requireAuth,
  requireRole,
} from '@voilajsx/appkit/auth';

dotenv.config();

async function registerUser(email, password) {
  const hashedPassword = await hashPassword(password);
  const user = await db.createUser({
    email,
    password: hashedPassword,
    roles: ['user'],
  });
  const token = signToken({ userId: user.id, email, roles: user.roles });
  return { token, user: { id: user.id, email } };
}

async function loginUser(email, password) {
  const user = await db.findUserByEmail(email);
  if (!user || !(await comparePassword(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  const token = signToken({ userId: user.id, email, roles: user.roles });
  return { token };
}
```

### 2. Express Route Protection

```javascript
/**
 * Express application with protected routes
 * @module @voilajsx/appkit/auth
 * @file examples/express-app.js
 */

import dotenv from 'dotenv';
import express from 'express';
import { requireAuth, requireRole } from '@voilajsx/appkit/auth';

dotenv.config();

const app = express();
app.use(express.json());

// Public route
app.get('/api/posts', async (req, res) => {
  const posts = await db.getPosts();
  res.json({ posts });
});

// Protected route
app.get('/api/profile', requireAuth(), async (req, res) => {
  const user = await db.findUserById(req.user.userId);
  res.json({ user });
});

// Admin-only route
app.get('/api/admin', requireAuth(), requireRole('admin'), async (req, res) => {
  res.json({ message: 'Admin access' });
});

app.listen(3000);
```

### 3. Complete Registration/Login Flow

```javascript
/**
 * Complete user authentication flow
 * @module @voilajsx/appkit/auth
 * @file examples/user-flow.js
 */

import dotenv from 'dotenv';
import express from 'express';
import {
  signToken,
  hashPassword,
  comparePassword,
  requireAuth,
} from '@voilajsx/appkit/auth';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/register', async (req, res) => {
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

app.post('/login', async (req, res) => {
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

app.get('/profile', requireAuth(), async (req, res) => {
  const user = await db.findUserById(req.user.userId);
  res.json({ user });
});
```

## LLM Instructions

**When generating code:**

1. **Always start with** `import dotenv from 'dotenv';` and `dotenv.config();`
2. **Always include** `.env` file example with `VOILA_AUTH_SECRET`
3. **Use simple patterns** - avoid complex configurations
4. **Include file headers** with @module and @file tags
5. **Use try/catch blocks** for async functions
6. **Keep database operations generic** using `db.methodName()`
7. **Focus on the 6 main functions**: `signToken`, `verifyToken`,
   `hashPassword`, `comparePassword`, `requireAuth`, `requireRole`

**Default .env template for all examples:**

```bash
# Required
VOILA_AUTH_SECRET=your-super-secure-jwt-secret-key-2024-minimum-32-chars

# Optional
VOILA_AUTH_BCRYPT_ROUNDS=12
```

**Standard import pattern:**

```javascript
import dotenv from 'dotenv';
import {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  requireAuth,
  requireRole,
} from '@voilajsx/appkit/auth';

dotenv.config();
```

**Error handling pattern:**

```javascript
try {
  // Auth operation
  const result = await authFunction();
  res.json({ result });
} catch (error) {
  res.status(400).json({ error: error.message });
}
```

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
