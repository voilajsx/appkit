# @voilajsx/appkit - Security Module 🔒

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Essential security utilities for Node.js applications - CSRF protection, rate
> limiting, input sanitization, and **data encryption**.

The Security module of `@voilajsx/appkit` provides robust protection against
common web vulnerabilities including cross-site request forgery (CSRF), brute
force attacks, cross-site scripting (XSS), and ensures the **confidentiality and
integrity of sensitive data at rest or in transit.** Each utility is designed to
be simple to use while following security best practices.

## 🚀 Features

- **🛡️ CSRF Protection** - Generate and validate cryptographically secure,
  time-limited tokens to prevent cross-site request forgery.
- **⏱️ Rate Limiting** - Control request frequency to protect against brute
  force and Denial-of-Service (DoS) attacks.
- **🧹 Input Sanitization** - Clean user input to prevent XSS and injection
  attacks.
- **🔐 Data Encryption** - Encrypt and decrypt sensitive data using
  authenticated encryption (AES-256-GCM) for confidentiality and integrity.
- **🔌 Framework Agnostic Core** - Core functions (`generateCsrfToken`,
  `validateCsrfToken`, `escapeString`, `sanitizeHtml`, `sanitizeFilename`,
  `generateEncryptionKey`, `encrypt`, `decrypt`) are framework-agnostic.
- **📦 Express.js Middleware Ready** - `createCsrfMiddleware` and
  `createRateLimiter` provide ready-to-use middleware for Express.js and
  Express-compatible frameworks.
- **🎯 Minimal Dependencies** - Lightweight implementation with zero external
  dependencies.
- **⚡ Simple API** - Easy to implement with sensible defaults for quick
  protection.

## Module Overview

The Security module provides comprehensive protection against common web
vulnerabilities:

| Feature                | What it does                                         | Main functions                                                         |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **CSRF Protection**    | Prevent cross-site request forgery attacks           | `generateCsrfToken()`, `validateCsrfToken()`, `createCsrfMiddleware()` |
| **Rate Limiting**      | Control request frequency to prevent abuse           | `createRateLimiter()`                                                  |
| **Input Sanitization** | Clean user input to prevent XSS and injection        | `sanitizeHtml()`, `escapeString()`, `sanitizeFilename()`               |
| **Data Encryption**    | Encrypt sensitive data with authenticated encryption | `generateEncryptionKey()`, `encrypt()`, `decrypt()`                    |

## 📦 Installation

To install `@voilajsx/appkit` in your project:

```bash
npm install @voilajsx/appkit
```

````

## 🏃‍♂️ Quick Start

Here's a quick overview of how to get started with the security utilities. For
complete examples, refer to the [Example Code](%23example-code) section.

```javascript
import {
  // CSRF Protection
  generateCsrfToken,
  validateCsrfToken,
  createCsrfMiddleware,

  // Rate Limiting
  createRateLimiter,

  // Input Sanitization
  sanitizeHtml,
  escapeString,
  sanitizeFilename,

  // Encryption
  generateEncryptionKey,
  encrypt,
  decrypt,
} from '@voilajsx/appkit/security'; // Corrected import path

// --- Example Express.js Setup ---
import express from 'express';
import session from 'express-session'; // Required for stateful CSRF

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Configure session middleware (REQUIRED for stateful CSRF)
app.use(
  session({
    secret: 'your-super-secret-session-key', // CHANGE THIS IN PRODUCTION!
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'Lax' },
  })
);

// 2. Create and apply CSRF middleware
const csrfProtection = createCsrfMiddleware();
app.use(csrfProtection); // Apply globally or to specific POST routes

// 3. Add rate limiting to API endpoints
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
app.use('/api', apiLimiter);

// 4. Sanitize user input before display or storage
app.post('/profile', (req, res) => {
  const unsafeHtml = req.body.bio;
  const unsafeText = req.body.username;
  const unsafeFilename = req.body.fileName;

  const safeHtml = sanitizeHtml(unsafeHtml, {
    allowedTags: ['p', 'b', 'i', 'a'], // Allow only these HTML tags
  });
  const safeText = escapeString(unsafeText);
  const safeFilename = sanitizeFilename(unsafeFilename);

  res.json({ username: safeText, bio: safeHtml, file: safeFilename });
});

// --- Example Data Encryption ---
const ENCRYPTION_KEY = generateEncryptionKey(); // Generate once and load securely
const sensitiveData = 'This is my secret sensitive data!';
const associatedData = 'user_id_123'; // Optional: data to bind to the ciphertext

// Encrypt
const encrypted = encrypt(sensitiveData, ENCRYPTION_KEY, associatedData);
console.log('Encrypted:', encrypted);

// Decrypt
try {
  const decrypted = decrypt(encrypted, ENCRYPTION_KEY, associatedData);
  console.log('Decrypted:', decrypted);
} catch (error) {
  console.error('Decryption failed:', error.message);
}

// Basic error handler for CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid or missing CSRF token!');
  }
  if (err.code === 'ENOSESSION') {
    return res.status(500).send('Session not configured for CSRF middleware!');
  }
  next(err);
});

app.listen(3000, () => console.log('Quick Start App running on port 3000'));
```

## 📖 Core Functions

### CSRF Protection

These utilities help prevent cross-site request forgery attacks by ensuring that
form submissions and state-changing requests originate from your site. They rely
on a **stateful (session-based)** approach, requiring a session management
middleware.

| Function                 | Purpose                                                                            | When to use                                                      |
| :----------------------- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `generateCsrfToken()`    | Creates a cryptographically secure token and stores it in the session              | When rendering forms or before sensitive actions                 |
| `validateCsrfToken()`    | Verifies a submitted token against the one in the session (timing-safe comparison) | When manually validating form submissions or by the middleware   |
| `createCsrfMiddleware()` | Creates an Express-compatible middleware for automatic CSRF protection of routes   | For automatic protection of `POST`, `PUT`, `DELETE`, etc. routes |

```javascript
// Generate a token for a form (requires req.session from session middleware)
const token = generateCsrfToken(req.session); // Store this in a hidden form field or custom header

// Validate a token from a request (usually handled by the middleware)
// const isValid = validateCsrfToken(req.body._csrf, req.session); // For manual validation

// Apply middleware to all relevant routes (e.g., after session middleware)
app.use(createCsrfMiddleware());
```

### Rate Limiting

Rate limiting helps prevent abuse of your API endpoints by controlling how many
requests a client can make in a given time period. It uses an in-memory store by
default.

| Function              | Purpose                                          | When to use                                          |
| :-------------------- | :----------------------------------------------- | :--------------------------------------------------- |
| `createRateLimiter()` | Creates middleware that limits request frequency | For API endpoints, login pages, and form submissions |

```javascript
// Create a rate limiter: 100 requests per 15 minutes
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

// Apply to API routes
app.use('/api', limiter);

// Stricter limits for login attempts (5 attempts per hour)
const loginLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
});
app.use('/login', loginLimiter);
```

### Input Sanitization

These utilities clean user input to prevent XSS attacks and other injection
vulnerabilities.

| Function             | Purpose                                                          | When to use                                                                     |
| :------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| `escapeString()`     | Escapes HTML special characters in plain text                    | When displaying untrusted user input in HTML                                    |
| `sanitizeHtml()`     | Removes dangerous HTML elements and attributes from HTML strings | When allowing limited HTML formatting in user input (e.g., comments, rich text) |
| `sanitizeFilename()` | Cleans filenames to prevent path traversal issues                | When handling user-uploaded files or user-provided file paths                   |

```javascript
// Escape user input for safe display in HTML
const safeText = escapeString(userComment); // e.g., converts <script> to &lt;script&gt;

// Allow limited HTML tags (e.g., from a user's bio)
const safeHtml = sanitizeHtml(userBio, {
  allowedTags: ['p', 'b', 'i', 'a', 'ul', 'li'], // Other tags will be stripped
});

// Clean a filename provided by a user
const safeName = sanitizeFilename(uploadedFile.originalname); // e.g., removes ../ or /
```

### Data Encryption

These utilities provide strong, authenticated symmetric encryption using
AES-256-GCM. This ensures both confidentiality (data remains secret) and
integrity (data has not been tampered with).

| Function                  | Purpose                                                               | When to use                                                       |
| :------------------------ | :-------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `generateEncryptionKey()` | Generates a cryptographically secure 32-byte (AES-256) encryption key | Once for your application; load securely at runtime               |
| `encrypt()`               | Encrypts plaintext data using AES-256-GCM                             | To protect sensitive data at rest or in transit                   |
| `decrypt()`               | Decrypts ciphertext and verifies its authenticity                     | To retrieve original data after encryption; will fail if tampered |

```javascript
// --- IMPORTANT: Key Management ---
// Generate this key ONCE per application and store it securely (e.g., environment variable, KMS).
// NEVER hardcode keys in your code!
const ENCRYPTION_KEY = generateEncryptionKey(); // For demo purposes only

// Data to encrypt and optional Associated Data (AAD)
const sensitiveUserInfo = '{"email": "user@example.com", "ssn": "123-45-678"}';
const aad = 'user_profile_id_456'; // AAD is optional, but highly recommended for context binding

// Encrypt the data
// Returns a string format "IV:Ciphertext:AuthTag" (all in hex)
const encryptedData = encrypt(sensitiveUserInfo, ENCRYPTION_KEY, aad);
console.log('Encrypted Data:', encryptedData);

// Decrypt the data
try {
  const decryptedData = decrypt(encryptedData, ENCRYPTION_KEY, aad);
  console.log('Decrypted Data:', decryptedData);
} catch (error) {
  console.error(
    'Decryption failed due to tampering or incorrect key/AAD:',
    error.message
  );
}
```

## 🔧 Configuration Options

### CSRF Middleware Options

```javascript
const csrf = createCsrfMiddleware({
  // Name of field containing the token in form data (default: '_csrf')
  tokenField: 'csrf_token',

  // Name of HTTP header for CSRF token (default: 'x-csrf-token')
  headerField: 'x-csrf',
});
```

### Rate Limiter Options

```javascript
const limiter = createRateLimiter({
  // Required: Time window in milliseconds
  windowMs: 15 * 60 * 1000, // 15 minutes

  // Required: Maximum requests per window
  max: 100,

  // Optional: Custom error message
  message: 'Too many requests, please try again later',

  // Optional: Function to generate unique client identifier (e.g., for IP-based limits)
  keyGenerator: (req) => req.ip || req.headers['x-api-key'], // Default is req.ip

  // Optional: Custom store for rate limit data. Default is in-memory Map (single-server only).
  // For multi-server deployments, you should provide a distributed store like Redis.
  store: new Map(), // Example: Use `new RedisStore(...)` for production
});
```

### Sanitization Options

```javascript
// HTML Sanitization Options for `sanitizeHtml()`
const safeHtml = sanitizeHtml(userInput, {
  // Set to true to remove all HTML tags completely (default: false)
  stripAllTags: false,

  // An array of HTML tags that are allowed to remain in the output (default: empty array)
  allowedTags: ['p', 'b', 'i', 'a', 'ul', 'li'],
});
```

## 💡 Common Use Cases

| Category            | Use Case                    | Description                                                | Components Used                               |
| :------------------ | :-------------------------- | :--------------------------------------------------------- | :-------------------------------------------- |
| **Form Protection** | Contact Form                | Prevent forged form submissions                            | `generateCsrfToken`, `createCsrfMiddleware`   |
| **Form Protection** | Admin Actions               | Protect sensitive administrative operations                | `generateCsrfToken`, `validateCsrfToken`      |
| **API Security**    | Public API                  | Prevent abuse and DoS                                      | `createRateLimiter`                           |
| **API Security**    | Authentication              | Block brute force login attempts                           | `createRateLimiter` with strict limits        |
| **Content Safety**  | User Comments               | Allow safe formatting while preventing XSS                 | `sanitizeHtml` with `allowedTags`             |
| **Content Safety**  | Profile Display             | Prevent XSS when displaying user-generated text            | `escapeString`                                |
| **File Handling**   | User Uploads                | Prevent path traversal and malicious filenames             | `sanitizeFilename`                            |
| **Data Security**   | Database Fields             | Encrypt sensitive data at rest in your DB                  | `encrypt`, `decrypt`, `generateEncryptionKey` |
| **Data Security**   | Inter-service Communication | Encrypt payloads between microservices for confidentiality | `encrypt`, `decrypt`                          |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common security scenarios using the `@voilajsx/appkit/security` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality security code.

### Sample Prompts to Try

#### Basic Security Setup

```
Please read the API reference at [https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md) and then create a basic Express application that implements CSRF protection and rate limiting for login attempts.
```

#### Content Sanitization System

```
Please read the API reference at [https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md) and then implement a content sanitization system that allows safe HTML in comments but prevents XSS attacks.
```

#### Complete Security Integration

```
Please read the API reference at [https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md) and then create a complete security setup for an Express application with CSRF protection, tiered rate limiting, and input sanitization.
```

#### Data Encryption Example

```
Using the @voilajsx/appkit/security module, demonstrate how to encrypt a user's sensitive profile data and decrypt it later, including the use of Associated Data.
```

## 📋 Example Code

For complete, working examples, check our examples folder:


- [01-csrf-basic.js](https://github.com/voilajs/appkit/blob/main/src/security/examples/01-csrf-basic.js) -
  CSRF tokens in forms with Express.js
- [02-rate-limiting.js](https://github.com/voilajs/appkit/blob/main/src/security/examples/02-rate-limiting.js) -
  Protecting API endpoints from abuse
- [03-sanitization.js](https://github.com/voilajs/appkit/blob/main/src/security/examples/03-sanitization.js) -
  Safely handling user input
- [04-complete-app.js](https://github.com/voilajs/appkit/blob/main/src/security/examples/04-complete-app.js) -
  All security features working together in an Express app
- [05-fastify-security-integration.js](https://github.com/voilajs/appkit/blob/main/src/security/examples/05-fastify-security-integration.js) -
  Stateful CSRF protection with Fastify (manual adaptation)
- [06-encryption-decryption.js](https://github.com/voilajs/appkit/blob/main/src/security/examples/06-encryption-decryption.js) -
  Demonstrates data encryption and decryption


## 🛡️ Security Best Practices

Following these practices will help ensure your application remains secure:

1.  **Use HTTPS in Production**: All security measures are bypassed if traffic
    can be intercepted.
2.  **Environment Variables**: Store secrets and configuration (especially
    encryption keys and session secrets) in environment variables, not in code.
3.  **Defense in Depth**: Apply multiple security layers; don't rely on a single
    protection mechanism.
4.  **Validate Server-Side**: Never trust client-side validation alone; always
    validate on the server.
5.  **Keep Updated**: Regularly update dependencies to get security patches.
6.  **Error Messages**: Use generic error messages that don't leak
    implementation details.
7.  **Security Headers**: Implement security headers like CSP alongside these
    utilities for comprehensive protection.

## 📊 Performance Considerations

- **Rate Limiter Memory**: The default in-memory store works for single-server
  deployments; use Redis or a distributed store for multiple servers.
- **CSRF Token Size**: The default 16-byte (32 hex character) tokens balance
  security and performance.
- **Sanitization Complexity**: The `stripAllTags` option is faster than
  `allowedTags` when you don't need any HTML.
- **Encryption Overhead**: While secure, encryption adds computational overhead.
  Use it selectively for truly sensitive data.
- **Middleware Order**: Place rate limiting before other middleware to reject
  excessive requests early.

## 🔍 Error Handling

The security module provides helpful errors that should be caught and handled:

```javascript
try {
  const token = generateCsrfToken(req.session);
} catch (error) {
  console.error('CSRF token generation failed:', error.message);
  // Handle gracefully, e.g., redirect to login or show an error page
}

// For middleware errors (e.g., from createCsrfMiddleware or createRateLimiter)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // Handle CSRF errors (e.g., invalid/missing/expired token)
    return res.status(403).send('Form expired or invalid. Please try again.');
  }
  if (err.code === 'ENOSESSION') {
    // Handle session not found for CSRF (configuration error)
    return res
      .status(500)
      .send('Server error: Session not configured for security checks.');
  }
  if (err.statusCode === 429) {
    // Rate limiter typically sets statusCode 429
    // Handle rate limiting errors
    return res.status(429).send(err.message || 'Too many requests.');
  }
  next(err); // Pass on other errors
});

// For encryption/decryption errors
try {
  const decrypted = decrypt(encryptedData, key, aad);
} catch (error) {
  console.error('Decryption failed:', error.message);
  // Handle authentication failure (tampering, wrong key/AAD)
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/security/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/security/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions\! Please see our
[Contributing Guide](https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>

````
