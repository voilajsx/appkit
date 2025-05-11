# Authentication Module API Reference

## Overview

The `@voilajs/appkit/auth` module provides secure authentication utilities for
Node.js applications, including JWT token management, password hashing, and
middleware for route protection and role-based access control.

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
} from '@voilajs/appkit/auth';
```

## API Reference

### JWT Functions

#### generateToken(payload, options)

Generates a JWT token with the specified payload and options.

##### Parameters

| Name                | Type     | Required | Default   | Description                                                     |
| ------------------- | -------- | -------- | --------- | --------------------------------------------------------------- |
| `payload`           | `Object` | Yes      | -         | The payload to encode in the JWT token. Must be a valid object. |
| `options`           | `Object` | Yes      | -         | Configuration options for token generation                      |
| `options.secret`    | `string` | Yes      | -         | Secret key used to sign the JWT token                           |
| `options.expiresIn` | `string` | No       | `'7d'`    | Token expiration time (e.g., '1h', '7d', '30d')                 |
| `options.algorithm` | `string` | No       | `'HS256'` | JWT signing algorithm                                           |

##### Returns

- `string` - The generated JWT token

##### Throws

- `Error` - If payload is not an object
- `Error` - If secret is missing
- `Error` - If token generation fails

##### Example

```javascript
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key', expiresIn: '24h' }
);
```

---

#### verifyToken(token, options)

Verifies and decodes a JWT token.

##### Parameters

| Name                 | Type       | Required | Default     | Description                             |
| -------------------- | ---------- | -------- | ----------- | --------------------------------------- |
| `token`              | `string`   | Yes      | -           | JWT token to verify                     |
| `options`            | `Object`   | Yes      | -           | Verification options                    |
| `options.secret`     | `string`   | Yes      | -           | Secret key used to verify the JWT token |
| `options.algorithms` | `string[]` | No       | `['HS256']` | Array of allowed algorithms             |

##### Returns

- `Object` - The decoded token payload

##### Throws

- `Error` - If token is not a string
- `Error` - If secret is missing
- `Error` - With message "Token has expired" if token is expired
- `Error` - With message "Invalid token" if token is invalid
- `Error` - For other verification failures

##### Example

```javascript
try {
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log(payload.userId); // '123'
} catch (error) {
  if (error.message === 'Token has expired') {
    // Handle expired token
  }
}
```

---

### Password Functions

#### hashPassword(password, rounds)

Hashes a password using bcrypt.

##### Parameters

| Name       | Type     | Required | Default | Description                                   |
| ---------- | -------- | -------- | ------- | --------------------------------------------- |
| `password` | `string` | Yes      | -       | Password to hash. Must be a non-empty string. |
| `rounds`   | `number` | No       | `10`    | Number of salt rounds for bcrypt              |

##### Returns

- `Promise<string>` - The hashed password

##### Throws

- `Error` - If password is not a non-empty string
- `Error` - If password hashing fails

##### Example

```javascript
const hashedPassword = await hashPassword('userPassword123', 12);
```

---

#### comparePassword(password, hash)

Compares a plain text password with a bcrypt hash.

##### Parameters

| Name       | Type     | Required | Description                    |
| ---------- | -------- | -------- | ------------------------------ |
| `password` | `string` | Yes      | Plain text password to compare |
| `hash`     | `string` | Yes      | Bcrypt hash to compare against |

##### Returns

- `Promise<boolean>` - `true` if password matches the hash, `false` otherwise

##### Throws

- `Error` - If password is not a non-empty string
- `Error` - If hash is not a non-empty string
- `Error` - If comparison fails

##### Example

```javascript
const isValid = await comparePassword('userPassword123', hashedPassword);
if (isValid) {
  // Password is correct
}
```

---

### Middleware Functions

#### createAuthMiddleware(options)

Creates an authentication middleware that verifies JWT tokens.

##### Parameters

| Name               | Type       | Required | Default   | Description                                   |
| ------------------ | ---------- | -------- | --------- | --------------------------------------------- |
| `options`          | `Object`   | Yes      | -         | Middleware configuration                      |
| `options.secret`   | `string`   | Yes      | -         | JWT secret key                                |
| `options.getToken` | `Function` | No       | See below | Custom function to extract token from request |
| `options.onError`  | `Function` | No       | See below | Custom error handler                          |

##### Default Token Extraction

The default `getToken` function checks for tokens in the following order:

1. `Authorization` header with `Bearer` prefix
2. `token` cookie
3. `token` query parameter

```javascript
const defaultGetToken = (req) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookies
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  // Check query params
  if (req.query?.token) {
    return req.query.token;
  }

  return null;
};
```

##### Default Error Handler

The default error handler returns appropriate HTTP status codes and
user-friendly messages:

| Error Type        | HTTP Status | Response Message                                  |
| ----------------- | ----------- | ------------------------------------------------- |
| No token provided | 401         | "Authentication required"                         |
| Token has expired | 401         | "Your session has expired. Please sign in again." |
| Invalid token     | 401         | "Invalid authentication. Please sign in again."   |
| Other errors      | 401         | "Authentication failed"                           |

##### Returns

- `Function` - Express middleware function

##### Throws

- `Error` - If secret is missing

##### Example

```javascript
const auth = createAuthMiddleware({
  secret: process.env.JWT_SECRET,
  getToken: (req) => req.headers['x-api-key'],
  onError: (error, req, res) => {
    res.status(401).json({ error: error.message });
  },
});

app.get('/protected', auth, (req, res) => {
  // req.user contains the JWT payload
  res.json({ userId: req.user.userId });
});
```

---

#### createAuthorizationMiddleware(allowedRoles, options)

Creates middleware for role-based access control.

##### Parameters

| Name               | Type       | Required | Default   | Description                                   |
| ------------------ | ---------- | -------- | --------- | --------------------------------------------- |
| `allowedRoles`     | `string[]` | Yes      | -         | Array of roles that are allowed access        |
| `options`          | `Object`   | No       | `{}`      | Middleware options                            |
| `options.getRoles` | `Function` | No       | See below | Custom function to extract roles from request |

##### Default Role Extraction

```javascript
const defaultGetRoles = (req) => {
  return req.user?.roles || [];
};
```

##### Returns

- `Function` - Express middleware function

##### Throws

- `Error` - If allowedRoles is not a non-empty array

##### Error Responses

All authorization errors return 403 Forbidden status with JSON response:

```json
{
  "error": "Authorization failed",
  "message": "Error specific message"
}
```

##### Example

```javascript
const adminOnly = createAuthorizationMiddleware(['admin']);

// Custom role extraction
const premiumOnly = createAuthorizationMiddleware(['premium'], {
  getRoles: (req) => {
    if (req.user.subscription?.active) {
      return ['premium'];
    }
    return [];
  },
});

app.get('/admin', auth, adminOnly, (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

---

## Error Handling

All functions in this module throw errors with descriptive messages. It's
recommended to wrap calls in try-catch blocks:

```javascript
try {
  const token = generateToken(payload, options);
} catch (error) {
  console.error('Token generation failed:', error.message);
}
```

### Common Error Messages

| Function                        | Error Message                            | Cause                 |
| ------------------------------- | ---------------------------------------- | --------------------- |
| `generateToken`                 | "Payload must be an object"              | Invalid payload type  |
| `generateToken`                 | "JWT secret is required"                 | Missing secret        |
| `verifyToken`                   | "Token must be a string"                 | Invalid token type    |
| `verifyToken`                   | "Token has expired"                      | JWT expired           |
| `verifyToken`                   | "Invalid token"                          | JWT validation failed |
| `hashPassword`                  | "Password must be a non-empty string"    | Invalid password      |
| `comparePassword`               | "Hash must be a non-empty string"        | Invalid hash          |
| `createAuthMiddleware`          | "JWT secret is required"                 | Missing secret        |
| `createAuthorizationMiddleware` | "allowedRoles must be a non-empty array" | Invalid roles array   |

## Security Considerations

1. **Secret Management**: Store JWT secrets in environment variables, never in
   code
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Token Storage**: Store tokens in httpOnly cookies when possible
4. **Password Requirements**: Implement password policies before hashing
5. **Salt Rounds**: Use at least 10 rounds for bcrypt (12 for high security)
6. **Token Expiration**: Use short-lived tokens and implement refresh token
   rotation

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create declaration files or
use JSDoc type annotations.

```typescript
// Example type declarations
interface TokenPayload {
  userId: string;
  email: string;
  roles?: string[];
}

interface AuthOptions {
  secret: string;
  expiresIn?: string;
  algorithm?: string;
}
```

## Performance Tips

1. **Caching**: Consider caching verified tokens to avoid repeated verification
2. **Async Operations**: All password operations are async - use proper error
   handling
3. **Bcrypt Rounds**: Balance security and performance when choosing salt rounds
4. **Token Size**: Keep JWT payloads small to reduce overhead

## License

MIT
