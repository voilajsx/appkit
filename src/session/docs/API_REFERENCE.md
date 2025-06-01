# Session Module API Reference

## Overview

The `@voilajsx/appkit/session` module provides secure session management
utilities for Node.js applications, including middleware for session handling,
multiple storage backends, and utilities for authentication and authorization.
It works with any Node.js framework including Express, Fastify, Koa, and more.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  MemoryStore,
  RedisStore,
} from '@voilajsx/appkit/session';

// Basic session middleware
const sessionMiddleware = createSessionMiddleware({
  secret: 'your-secret-key',
});

// With custom store
const sessionMiddleware = createSessionMiddleware({
  store: new RedisStore(redisClient),
  secret: process.env.SESSION_SECRET,
});
```

## API Reference

### Middleware Functions

#### createSessionMiddleware(options)

Creates session middleware that manages user sessions across requests.

##### Parameters

| Name                 | Type      | Required | Default             | Description                                               |
| -------------------- | --------- | -------- | ------------------- | --------------------------------------------------------- |
| `options`            | `Object`  | Yes      | -                   | Session configuration options                             |
| `options.store`      | `Object`  | No       | `new MemoryStore()` | Session store instance                                    |
| `options.secret`     | `string`  | No\*     | Auto-generated      | Secret for signing session IDs (\*required in production) |
| `options.cookieName` | `string`  | No       | `'sessionId'`       | Name of the session cookie                                |
| `options.maxAge`     | `number`  | No       | `86400000`          | Session max age in milliseconds (24 hours)                |
| `options.secure`     | `boolean` | No       | Auto-detected       | Secure cookie flag (auto-detects production)              |
| `options.httpOnly`   | `boolean` | No       | `true`              | HTTP-only cookie flag                                     |
| `options.sameSite`   | `string`  | No       | `'strict'`          | SameSite cookie attribute ('strict', 'lax', 'none')       |
| `options.rolling`    | `boolean` | No       | `true`              | Extend session on activity                                |
| `options.path`       | `string`  | No       | `'/'`               | Cookie path                                               |
| `options.domain`     | `string`  | No       | -                   | Cookie domain                                             |

##### Returns

- `Function` - Middleware function `(req, res, next) => void`

##### Throws

- `Error` - If secret is missing in production environment

##### Session Object Methods

The middleware adds a `session` object to the request with the following
methods:

| Method         | Description                     | Returns         |
| -------------- | ------------------------------- | --------------- | ----- |
| `save(data)`   | Save data to session            | `Promise<void>` |
| `destroy()`    | Destroy session completely      | `Promise<void>` |
| `regenerate()` | Regenerate session ID           | `Promise<void>` |
| `touch()`      | Extend session expiry           | `Promise<void>` |
| `isActive()`   | Check if session exists         | `boolean`       |
| `getAge()`     | Get session age in milliseconds | `number         | null` |

##### Example

```javascript
const sessionMiddleware = createSessionMiddleware({
  store: new RedisStore(redisClient),
  secret: process.env.SESSION_SECRET,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  secure: true,
  sameSite: 'strict',
});

app.use(sessionMiddleware);

app.post('/login', async (req, res) => {
  // Save user to session
  await req.session.save({
    user: { id: 123, email: 'user@example.com' },
  });
  res.json({ message: 'Logged in' });
});
```

---

#### createSessionAuthMiddleware(options)

Creates authentication middleware that requires active sessions for route
access.

##### Parameters

| Name                     | Type       | Required | Default    | Description                                 |
| ------------------------ | ---------- | -------- | ---------- | ------------------------------------------- |
| `options`                | `Object`   | No       | `{}`       | Authentication configuration                |
| `options.loginUrl`       | `string`   | No       | `'/login'` | URL to redirect unauthenticated users       |
| `options.userKey`        | `string`   | No       | `'user'`   | Key in session data that contains user info |
| `options.getUser`        | `Function` | No       | See below  | Function to extract user from session data  |
| `options.onAuthRequired` | `Function` | No       | -          | Custom handler for authentication required  |

##### Default User Extraction

```javascript
const defaultGetUser = (sessionData) => sessionData.user;
```

##### Returns

- `Function` - Express middleware function

##### Throws

- None - Returns appropriate HTTP error responses

##### Error Responses

| Condition          | API Response | Web Response      |
| ------------------ | ------------ | ----------------- |
| No session         | 401 JSON     | Redirect to login |
| No user in session | 401 JSON     | Redirect to login |

##### Example

```javascript
const authRequired = createSessionAuthMiddleware({
  loginUrl: '/auth/login',
  getUser: (sessionData) => sessionData.currentUser,
});

app.get('/dashboard', authRequired, (req, res) => {
  // req.user contains the user from session
  res.json({ user: req.user });
});
```

---

#### createSessionAuthorizationMiddleware(allowedRoles, options)

Creates role-based authorization middleware for controlling access based on user
roles.

##### Parameters

| Name               | Type       | Required  | Default   | Description                           |
| ------------------ | ---------- | --------- | --------- | ------------------------------------- | ------------------------------------ |
| `allowedRoles`     | `string    | string[]` | Yes       | -                                     | Role(s) that can access the resource |
| `options`          | `Object`   | No        | `{}`      | Authorization options                 |
| `options.roleKey`  | `string`   | No        | `'role'`  | Key in user object that contains role |
| `options.getRoles` | `Function` | No        | See below | Function to extract user roles        |

##### Default Role Extraction

```javascript
const defaultGetRoles = (user) => {
  const userRole = user.role;
  return Array.isArray(userRole) ? userRole : [userRole].filter(Boolean);
};
```

##### Returns

- `Function` - Express middleware function

##### Throws

- None - Returns 403 HTTP error responses

##### Error Responses

All authorization errors return 403 Forbidden status with JSON response:

```json
{
  "error": "Access forbidden",
  "message": "Specific error message",
  "requiredRoles": ["admin"]
}
```

##### Example

```javascript
const adminOnly = createSessionAuthorizationMiddleware(['admin']);
const moderatorAccess = createSessionAuthorizationMiddleware([
  'admin',
  'moderator',
]);

// Custom role extraction
const premiumAccess = createSessionAuthorizationMiddleware(['premium'], {
  getRoles: (user) => {
    const roles = [];
    if (user.subscription?.active) roles.push('premium');
    if (user.isAdmin) roles.push('admin');
    return roles;
  },
});

app.get('/admin', authRequired, adminOnly, (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

---

### Session Stores

#### MemoryStore

In-memory session store for development and single-process applications.

##### Constructor

```javascript
new MemoryStore();
```

##### Methods

| Method                         | Parameters                                         | Returns         | Description        |
| ------------------------------ | -------------------------------------------------- | --------------- | ------------------ | ---------------- |
| `get(sessionId)`               | `sessionId: string`                                | `Promise<Object | null>`             | Get session data |
| `set(sessionId, data, maxAge)` | `sessionId: string, data: Object, maxAge?: number` | `Promise<void>` | Set session data   |
| `destroy(sessionId)`           | `sessionId: string`                                | `Promise<void>` | Delete session     |
| `touch(sessionId, maxAge)`     | `sessionId: string, maxAge: number`                | `Promise<void>` | Extend session     |
| `length()`                     | -                                                  | `number`        | Get session count  |
| `clear()`                      | -                                                  | `Promise<void>` | Clear all sessions |

##### Example

```javascript
const store = new MemoryStore();

const sessionMiddleware = createSessionMiddleware({
  store,
  secret: 'your-secret',
});
```

---

#### FileStore

File-based session store for simple production deployments.

##### Constructor

```javascript
new FileStore(directory, options);
```

##### Parameters

| Name                      | Type     | Required | Default        | Description                      |
| ------------------------- | -------- | -------- | -------------- | -------------------------------- |
| `directory`               | `string` | No       | `'./sessions'` | Directory to store session files |
| `options`                 | `Object` | No       | `{}`           | Store configuration              |
| `options.extension`       | `string` | No       | `'.json'`      | File extension for session files |
| `options.cleanupInterval` | `number` | No       | `60000`        | Cleanup interval in milliseconds |
| `options.encoding`        | `string` | No       | `'utf8'`       | File encoding                    |

##### Methods

Same as MemoryStore, plus:

| Method          | Parameters | Returns | Description             |
| --------------- | ---------- | ------- | ----------------------- |
| `stopCleanup()` | -          | `void`  | Stop background cleanup |
| `destroy()`     | -          | `void`  | Cleanup resources       |

##### Example

```javascript
const store = new FileStore('./sessions', {
  cleanupInterval: 30000, // 30 seconds
  extension: '.session',
});

const sessionMiddleware = createSessionMiddleware({
  store,
  secret: process.env.SESSION_SECRET,
});
```

---

#### RedisStore

Redis-based session store for production and multi-server deployments.

##### Constructor

```javascript
new RedisStore(client, options);
```

##### Parameters

| Name                 | Type     | Required | Default   | Description                                   |
| -------------------- | -------- | -------- | --------- | --------------------------------------------- |
| `client`             | `Object` | Yes      | -         | Redis client instance (ioredis or node_redis) |
| `options`            | `Object` | No       | `{}`      | Store configuration                           |
| `options.prefix`     | `string` | No       | `'sess:'` | Key prefix for session storage                |
| `options.serializer` | `Object` | No       | `JSON`    | Serializer for session data                   |

##### Methods

Same as MemoryStore, plus:

| Method   | Parameters | Returns            | Description           |
| -------- | ---------- | ------------------ | --------------------- |
| `ping()` | -          | `Promise<boolean>` | Test Redis connection |

##### Example

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const store = new RedisStore(redis, {
  prefix: 'myapp:sess:',
});

const sessionMiddleware = createSessionMiddleware({
  store,
  secret: process.env.SESSION_SECRET,
});
```

---

### Utility Functions

#### SessionManager

Internal session manager class for handling cookies and session lifecycle.

##### Constructor

```javascript
new SessionManager(options);
```

##### Parameters

Same as `createSessionMiddleware` options.

##### Methods

| Method                           | Parameters                                     | Returns  | Description             |
| -------------------------------- | ---------------------------------------------- | -------- | ----------------------- | ------------------------------- |
| `generateSessionId()`            | -                                              | `string` | Generate new session ID |
| `signSessionId(sessionId)`       | `sessionId: string`                            | `string` | Sign session ID         |
| `unsignSessionId(signedId)`      | `signedId: string`                             | `string  | null`                   | Verify and extract session ID   |
| `getCookie(req)`                 | `req: Object`                                  | `string  | null`                   | Get session cookie from request |
| `setCookie(res, value, options)` | `res: Object, value: string, options?: Object` | `void`   | Set session cookie      |
| `clearCookie(res)`               | `res: Object`                                  | `void`   | Clear session cookie    |

##### Example

```javascript
import { SessionManager } from '@voilajsx/appkit/session';

const manager = new SessionManager({
  secret: 'your-secret',
  cookieName: 'sessionId',
});

const sessionId = manager.generateSessionId();
const signed = manager.signSessionId(sessionId);
```

---

#### createSessionSecret(length)

Utility function to create a secure session secret.

##### Parameters

| Name     | Type     | Required | Default | Description                   |
| -------- | -------- | -------- | ------- | ----------------------------- |
| `length` | `number` | No       | `32`    | Length of the secret in bytes |

##### Returns

- `string` - Secure random secret (hex string)

##### Example

```javascript
import { createSessionSecret } from '@voilajsx/appkit/session';

const secret = createSessionSecret();
console.log(secret); // 64-character hex string

const longSecret = createSessionSecret(64);
console.log(longSecret); // 128-character hex string
```

---

#### validateSessionConfig(options)

Utility function to validate session configuration.

##### Parameters

| Name      | Type     | Required | Default | Description                 |
| --------- | -------- | -------- | ------- | --------------------------- |
| `options` | `Object` | No       | `{}`    | Session options to validate |

##### Returns

- `Object` - Validation result with `valid`, `errors`, and `warnings` properties

##### Example

```javascript
import { validateSessionConfig } from '@voilajsx/appkit/session';

const validation = validateSessionConfig({
  secret: 'my-secret',
  maxAge: 3600000,
  sameSite: 'strict',
});

if (!validation.valid) {
  console.error('Config errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Config warnings:', validation.warnings);
}
```

---

#### sanitizeSessionData(data, options)

Utility function to sanitize session data before storage.

##### Parameters

| Name                 | Type       | Required | Default   | Description                      |
| -------------------- | ---------- | -------- | --------- | -------------------------------- |
| `data`               | `Object`   | Yes      | -         | Session data to sanitize         |
| `options`            | `Object`   | No       | `{}`      | Sanitization options             |
| `options.removeKeys` | `string[]` | No       | `[]`      | Keys to remove from data         |
| `options.maxDepth`   | `number`   | No       | `10`      | Maximum object depth             |
| `options.maxSize`    | `number`   | No       | `1048576` | Maximum data size in bytes (1MB) |

##### Returns

- `Object` - Sanitized session data

##### Throws

- `Error` - If data size exceeds maximum

##### Example

```javascript
import { sanitizeSessionData } from '@voilajsx/appkit/session';

const sanitized = sanitizeSessionData(
  {
    user: { id: 123, password: 'secret' },
    token: 'abc123',
    preferences: { theme: 'dark' },
  },
  {
    removeKeys: ['password', 'token'],
  }
);

// Result: { user: { id: 123 }, preferences: { theme: 'dark' } }
```

---

## Error Handling

All functions in this module handle errors gracefully and provide descriptive
error messages. It's recommended to wrap calls in try-catch blocks:

```javascript
try {
  await req.session.save({ user: userData });
} catch (error) {
  console.error('Session save failed:', error.message);
}
```

### Common Error Messages

| Function                  | Error Message                              | Cause                                    |
| ------------------------- | ------------------------------------------ | ---------------------------------------- |
| `createSessionMiddleware` | "Session secret is required in production" | Missing secret in production environment |
| `sanitizeSessionData`     | "Session data too large: X bytes"          | Data exceeds maximum size limit          |
| `FileStore`               | "Failed to save session"                   | File system write error                  |
| `RedisStore`              | "Failed to save session"                   | Redis connection or write error          |

## Security Considerations

1. **Secret Management**: Store session secrets in environment variables, never
   in code
2. **HTTPS**: Always use HTTPS in production to protect session cookies
3. **Cookie Security**: Use secure, httpOnly, and sameSite cookie attributes
4. **Session Regeneration**: Regenerate session IDs after authentication to
   prevent fixation attacks
5. **Data Sanitization**: Remove sensitive data before storing in sessions
6. **Store Security**: Use Redis with authentication in production environments

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create declaration files or
use JSDoc type annotations.

```typescript
// Example type declarations
interface SessionData {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  [key: string]: any;
}

interface SessionOptions {
  store?: SessionStore;
  secret: string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}
```

## Performance Tips

1. **Store Selection**: Use RedisStore for production, MemoryStore for
   development
2. **Session Size**: Keep session data small to reduce storage and network
   overhead
3. **Cleanup Intervals**: Adjust cleanup intervals based on your application's
   needs
4. **Rolling Sessions**: Disable rolling sessions if not needed to reduce store
   operations
5. **Redis Configuration**: Use Redis persistence and clustering for high
   availability

## License

MIT

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
