# @voilajsx/appkit/error - LLM API Reference

**Note**: Implementation is in JavaScript. TypeScript signatures are for
reference only.

## LLM Code Generation Guidelines

1. **File Header Comments** (Required for all files):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/error
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
   - **Inline comments**: Only for complex logic that's confusing
   - **No basic comments**: Avoid obvious comments
   - **Focus on minimal file size**: Comment only when necessary

5. **Error Handling Philosophy**:
   - Use the 6 error functions: `badRequest`, `unauthorized`, `forbidden`,
     `notFound`, `conflict`, `serverError`
   - Always include helpful error messages
   - Use `asyncRoute` for all async route handlers

## Function Signatures

### 1. Error Creation Functions (6)

```typescript
function badRequest(message?: string): Error; // 400 - Client input errors
function unauthorized(message?: string): Error; // 401 - Authentication required
function forbidden(message?: string): Error; // 403 - Access denied
function notFound(message?: string): Error; // 404 - Resource missing
function conflict(message?: string): Error; // 409 - Business logic conflicts
function serverError(message?: string): Error; // 500 - Internal errors
```

**Environment Variables:**

- `VOILA_AUTH_MESSAGE` - Default message for `unauthorized()`
- `NODE_ENV` - Affects `serverError()` message in development vs production

### 2. Middleware Functions (2)

```typescript
function handleErrors(options?: object): ExpressMiddleware;
function asyncRoute(fn: AsyncFunction): ExpressMiddleware;
```

**Environment Variables:**

- `VOILA_ERROR_STACK` - Show stack traces (default: true in development)
- `VOILA_ERROR_LOG` - Enable error logging (default: true)

## Basic Usage Examples

### Error Creation

```javascript
import { badRequest, notFound, forbidden } from '@voilajsx/appkit/error';

// Input validation
if (!email) throw badRequest('Email is required');

// Resource checks
if (!user) throw notFound('User not found');

// Permission checks
if (!user.isAdmin) throw forbidden('Admin access required');
```

### Express Setup

```javascript
import { handleErrors, asyncRoute } from '@voilajsx/appkit/error';

// Global error handling
app.use(handleErrors());

// Async route protection
app.post(
  '/users',
  asyncRoute(async (req, res) => {
    if (!req.body.email) throw badRequest('Email required');
    const user = await createUser(req.body);
    res.json(user);
  })
);
```

### Complete Route Example

```javascript
/**
 * User management route with comprehensive error handling
 * @module @voilajsx/appkit/error
 * @file routes/users.js
 */

import {
  asyncRoute,
  badRequest,
  unauthorized,
  notFound,
  conflict,
} from '@voilajsx/appkit/error';

/**
 * Creates a new user with validation
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createUser = asyncRoute(async (req, res) => {
  const { email, name, role } = req.body;

  // Input validation
  if (!email) throw badRequest('Email is required');
  if (!name) throw badRequest('Name is required');

  // Authentication check
  if (!req.user) throw unauthorized('Login required');

  // Authorization check
  if (role === 'admin' && !req.user.isAdmin) {
    throw forbidden('Cannot create admin users');
  }

  // Business logic validation
  const existingUser = await db.findUserByEmail(email);
  if (existingUser) throw conflict('Email already exists');

  const user = await db.createUser({ email, name, role });
  res.status(201).json(user);
});
```

## Error Response Format

### Development

```json
{
  "error": "BAD_REQUEST",
  "message": "Email is required",
  "stack": "Error: Email is required\n    at ..."
}
```

### Production

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

## Code Generation Rules

1. **Always include file header** with @module and @file tags
2. **Use JSDoc for all functions** with one clear sentence descriptions
3. **Use the 6 error functions consistently** based on HTTP semantics
4. **Wrap all async routes** with `asyncRoute`
5. **Include helpful error messages** that guide users
6. **Use generic `db` object** for database operations without imports
7. **Apply `handleErrors()` middleware** as last middleware in Express apps
8. **Focus on minimal file size** - avoid unnecessary comments
9. **Follow ESM import style** with single quotes and semicolons
10. **Include environment variable usage** when relevant

## Common Patterns

### Authentication Middleware

```javascript
const auth = asyncRoute(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw unauthorized('Token required');

  const user = await verifyToken(token);
  if (!user) throw unauthorized('Invalid token');

  req.user = user;
  next();
});
```

### Validation Helper

```javascript
function validateRequired(data, fields) {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw badRequest(`Missing required fields: ${missing.join(', ')}`);
  }
}
```

### Express App Setup

```javascript
import { handleErrors, asyncRoute } from '@voilajsx/appkit/error';

const app = express();
app.use(express.json());

// Routes here...

// Error handling (must be last)
app.use(handleErrors());
```

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
