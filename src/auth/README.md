## Auth Module

The Auth module of the `@voilajs/appkit` package provides robust utilities for
secure authentication in Node.js applications. It includes JWT token management,
password hashing with bcrypt, and middleware for protecting routes and enforcing
role-based access control.

### Snapshot of Methods

| S.No. | Method                                                            | Description                                            |
| ----- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| 1     | [`generateToken`](#generatetoken)                                 | Creates a JWT token from a payload                     |
| 2     | [`verifyToken`](#verifytoken)                                     | Verifies and decodes a JWT token                       |
| 3     | [`hashPassword`](#hashpassword)                                   | Hashes a password using bcrypt                         |
| 4     | [`comparePassword`](#comparepassword)                             | Compares a password against its hash                   |
| 5     | [`createAuthMiddleware`](#createauthmiddleware)                   | Creates middleware to verify JWTs for route protection |
| 6     | [`createAuthorizationMiddleware`](#createauthorizationmiddleware) | Creates middleware for role-based access control       |

### Use Cases

| S.No. | Method                                                            | Use Cases                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | [`generateToken`](#generatetoken)                                 | <ul><li>Generating user session tokens for stateless authentication in REST APIs</li><li>Creating API authentication tokens for client applications</li><li>Issuing password reset tokens with short expiration times</li><li>Producing refresh tokens for token rotation strategies</li><li>Encoding user metadata for single sign-on (SSO) systems</li><li>Generating tokens for email verification during registration</li></ul> |
| 2     | [`verifyToken`](#verifytoken)                                     | <ul><li>Validating tokens in protected API routes to ensure user authentication</li><li>Checking token expiration for session management</li><li>Decoding tokens for password reset link verification</li><li>Verifying refresh tokens before issuing new access tokens</li><li>Authenticating websocket connections using JWTs</li><li>Ensuring token integrity in microservices communication</li></ul>                           |
| 3     | [`hashPassword`](#hashpassword)                                   | <ul><li>Securing passwords during user registration before database storage</li><li>Re-hashing passwords during password updates</li><li>Creating secure credentials for admin accounts</li><li>Storing API keys securely in a hashed format</li><li>Protecting sensitive user inputs in non-authentication contexts</li><li>Ensuring compliance with security standards like OWASP</li></ul>                                       |
| 4     | [`comparePassword`](#comparepassword)                             | <ul><li>Verifying user credentials during login attempts</li><li>Authenticating users for password-protected resources</li><li>Validating admin credentials for sensitive operations</li><li>Checking API key validity in secure endpoints</li><li>Enabling two-factor authentication with password verification</li><li>Ensuring secure password recovery processes</li></ul>                                                      |
| 5     | [`createAuthMiddleware`](#createauthmiddleware)                   | <ul><li>Securing API endpoints to restrict access to authenticated users</li><li>Protecting dashboard routes in web applications</li><li>Ensuring only logged-in users access profile data</li><li>Implementing token-based authentication for microservices</li><li>Restricting access to sensitive resources like payment gateways</li><li>Enforcing authentication in serverless functions</li></ul>                             |
| 6     | [`createAuthorizationMiddleware`](#createauthorizationmiddleware) | <ul><li>Restricting admin dashboards to users with admin roles</li><li>Allowing editors to modify content but not delete it</li><li>Granting premium users access to exclusive features</li><li>Enforcing hierarchical access in enterprise applications</li><li>Limiting API access based on user subscription tiers</li><li>Controlling access to specific modules in multi-tenant apps</li></ul>                                 |

### Basic Usage Examples

#### generateToken

```javascript
import { generateToken } from '@voilajs/appkit/auth';

const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);
console.log(token); // Outputs JWT token string
```

#### verifyToken

```javascript
import { verifyToken } from '@voilajs/appkit/auth';

try {
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log(payload.userId); // Outputs: '123'
} catch (error) {
  console.log(error.message); // e.g., 'Token has expired'
}
```

#### hashPassword

```javascript
import { hashPassword } from '@voilajs/appkit/auth';

const hash = await hashPassword('myPassword123');
console.log(hash); // Outputs hashed password string
```

#### comparePassword

```javascript
import { comparePassword } from '@voilajs/appkit/auth';

const isValid = await comparePassword('myPassword123', hash);
console.log(isValid); // Outputs: true or false
```

#### createAuthMiddleware

```javascript
import { createAuthMiddleware } from '@voilajs/appkit/auth';
import express from 'express';

const app = express();
const auth = createAuthMiddleware({ secret: 'your-secret-key' });
app.get('/dashboard', auth, (req, res) => {
  res.json({ userId: req.user.userId });
});
```

#### createAuthorizationMiddleware

```javascript
import { createAuthorizationMiddleware } from '@voilajs/appkit/auth';
import express from 'express';

const app = express();
const adminOnly = createAuthorizationMiddleware(['admin']);
app.get('/admin', adminOnly, (req, res) => {
  res.json({ message: 'Admin access' });
});
```

### Detailed Note

To explore advanced features, configuration options, and detailed API
specifications, refer to the developer reference at
[https://github.com/voilajs/appkit/src/auth/DEV_REF.md](https://github.com/voilajs/appkit/src/auth/DEV_REF.md)
and the API documentation at
[https://github.com/voilajs/appkit/src/auth/API.md](https://github.com/voilajs/appkit/src/auth/API.md).
