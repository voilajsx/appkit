# @voilajsx/appkit - Security Module 🔒

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple object-driven security with enterprise-grade protection and smart
> defaults

The Security module provides **one function** that returns a secure object with
all methods. Zero configuration needed, production-ready security by default,
with environment-aware smart defaults.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `security.get()`, everything else is automatic
- **🔒 Enterprise Security** - Production-grade protection by default
- **🔧 Zero Configuration** - Smart defaults for everything
- **🌍 Environment-First** - Auto-detects from `VOILA_SECURITY_*` variables
- **🎯 Object-Driven** - Clean API, perfect for AI code generation
- **🛡️ Complete Protection** - CSRF, rate limiting, input sanitization,
  encryption

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (30 seconds)

```bash
# Set your environment variables
echo "VOILA_SECURITY_CSRF_SECRET=your-csrf-secret-key-2024-minimum-32-chars" > .env
echo "VOILA_SECURITY_ENCRYPTION_KEY=64-char-hex-key-for-aes256-encryption" >> .env
```

```javascript
// One import, one function call
import { security } from '@voilajsx/appkit/security';

const secure = security.get();

// Complete security setup in 3 lines
app.use(secure.forms());           // CSRF protection
app.use('/api', secure.requests()); // Rate limiting

// Secure user input handling
app.post('/profile', (req, res) => {
  const safeBio = secure.input(req.body.bio);
  const encryptedSSN = secure.encrypt(req.body.ssn);

  await saveUser({ bio: safeBio, ssn: encryptedSSN });
  res.json({ success: true });
});
```

**That's it!** Enterprise-grade security with zero configuration.

## 📖 Essential API Reference

### Main Function

#### `security.get()`

Returns a security object with all protection methods.

```javascript
import { security } from '@voilajsx/appkit/security';

const secure = security.get(); // Environment parsed once for performance
```

### Security Methods

```javascript
// Form protection
secure.forms(options); // CSRF protection middleware

// Rate limiting
secure.requests(max, window, options); // Rate limiting middleware

// Input safety
secure.input(text, options); // Basic text sanitization
secure.html(html, options); // HTML sanitization with allowed tags
secure.escape(text); // HTML entity escaping

// Data encryption
secure.encrypt(data, key, aad); // AES-256-GCM encryption
secure.decrypt(data, key, aad); // Authenticated decryption
secure.generateKey(); // Generate 256-bit encryption keys
```

## 💡 Simple Examples

### Basic Express App with Security

```javascript
/**
 * Complete Express application with comprehensive security
 * @module @voilajsx/appkit/security
 * @file examples/secure-app.js
 */

import express from 'express';
import session from 'express-session';
import { security } from '@voilajsx/appkit/security';

const app = express();
const secure = security.get();

// Middleware setup
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Security middleware
app.use(secure.forms()); // CSRF protection
app.use('/api', secure.requests()); // Rate limiting

// Strict rate limiting for auth
app.use('/auth', secure.requests(5, 3600000)); // 5 attempts per hour

// Form with CSRF protection
app.get('/contact', (req, res) => {
  const csrfToken = req.csrfToken(); // Added by secure.forms()
  res.send(`
    <form method="POST" action="/contact">
      <input type="hidden" name="_csrf" value="${csrfToken}">
      <input type="text" name="name" placeholder="Your name">
      <textarea name="message" placeholder="Your message"></textarea>
      <button type="submit">Send</button>
    </form>
  `);
});

// Handle form with input cleaning
app.post('/contact', async (req, res) => {
  try {
    // CSRF already verified by middleware

    const name = secure.input(req.body.name, { maxLength: 50 });
    const message = secure.html(req.body.message, {
      allowedTags: ['p', 'b', 'i', 'br'],
    });

    await saveContactMessage({ name, message });
    res.json({ success: true });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log('Secure server running on port 3000');
});
```

### Input Sanitization Patterns

```javascript
// Basic text cleaning
const cleanEmail = secure.input(req.body.email);
const cleanName = secure.input(req.body.name, { maxLength: 50 });

// Rich text with allowed HTML
const safeBio = secure.html(req.body.bio, {
  allowedTags: ['p', 'b', 'i', 'a', 'ul', 'li'],
});

// Safe text display
const safeComment = secure.escape(userComment);
res.send(`<p>User said: ${safeComment}</p>`);
```

### Data Encryption Patterns

```javascript
// Generate encryption key (one-time setup)
const key = secure.generateKey();
console.log('Save this key securely:', key);

// Encrypt sensitive data
const encryptedSSN = secure.encrypt(user.ssn); // Uses VOILA_SECURITY_ENCRYPTION_KEY
const encryptedCard = secure.encrypt(paymentInfo, customKey);

// Decrypt when needed
const originalSSN = secure.decrypt(encryptedSSN);
const originalCard = secure.decrypt(encryptedCard, customKey);
```

### Complete Secure Registration

```javascript
/**
 * User registration with comprehensive security
 * @module @voilajsx/appkit/security
 * @file routes/auth.js
 */

import { security } from '@voilajsx/appkit/security';

const secure = security.get();

export const registerUser = async (req, res) => {
  try {
    // Clean and validate input
    const email = secure.input(req.body.email?.toLowerCase());
    const name = secure.input(req.body.name, { maxLength: 50 });
    const bio = secure.html(req.body.bio, {
      allowedTags: ['p', 'b', 'i'],
    });

    // Encrypt sensitive data
    const encryptedPhone = secure.encrypt(req.body.phone);

    // Save user
    const user = await createUser({
      email,
      name,
      bio,
      phone: encryptedPhone,
    });

    res.json({ success: true, userId: user.id });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
};
```

### API Security Patterns

```javascript
// API endpoint with comprehensive protection
app.post('/api/comments', secure.requests(10, 60000), async (req, res) => {
  try {
    // Clean comment content
    const content = secure.html(req.body.content, {
      allowedTags: ['p', 'b', 'i', 'a'],
    });

    const comment = await createComment({
      content,
      userId: req.user.id,
    });

    res.json(comment);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
});

// File upload security
app.post('/upload', secure.requests(5, 60000), async (req, res) => {
  try {
    // Clean filename
    const safeFilename = secure.input(req.body.filename, {
      maxLength: 100,
      removeXSS: true,
    });

    // Process upload...
    res.json({ filename: safeFilename });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
});
```

## 🌍 Environment Variables

### Essential Configuration

```bash
# Required for CSRF protection
VOILA_SECURITY_CSRF_SECRET=your-csrf-secret-key-2024-minimum-32-chars

# Required for data encryption
VOILA_SECURITY_ENCRYPTION_KEY=64-char-hex-key-for-aes256-encryption

# Optional rate limiting
VOILA_SECURITY_RATE_LIMIT=100               # Default: 100 requests
VOILA_SECURITY_RATE_WINDOW=900000           # Default: 15 minutes
VOILA_SECURITY_RATE_MESSAGE="Too many requests" # Custom error message

# Optional input sanitization
VOILA_SECURITY_MAX_INPUT_LENGTH=1000        # Default: 1000 chars
VOILA_SECURITY_ALLOWED_TAGS=p,b,i,a         # Allowed HTML tags
VOILA_SECURITY_STRIP_ALL_TAGS=false         # Strip all HTML (default: false)

# Optional CSRF settings
VOILA_SECURITY_CSRF_FIELD=_csrf             # Form field name (default: _csrf)
VOILA_SECURITY_CSRF_HEADER=x-csrf-token     # Header name (default: x-csrf-token)
VOILA_SECURITY_CSRF_EXPIRY=60               # Token expiry minutes (default: 60)
```

## 🔒 Security Features

### CSRF Protection (`secure.forms()`)

- **Cryptographically secure tokens** using `crypto.randomBytes()`
- **Timing-safe verification** with `crypto.timingSafeEqual()`
- **Session-based storage** preventing token prediction
- **Automatic expiry** with configurable timeouts

### Rate Limiting (`secure.requests()`)

- **In-memory tracking** with automatic cleanup
- **Configurable windows** and request limits
- **Client identification** via IP address
- **Standard headers** (X-RateLimit-\*, Retry-After)

### Input Sanitization (`secure.input()`, `secure.html()`, `secure.escape()`)

- **XSS prevention** removing dangerous scripts and protocols
- **Length limiting** preventing memory exhaustion
- **HTML filtering** with configurable allowed tags
- **Entity escaping** for safe text display

### Data Encryption (`secure.encrypt()`, `secure.decrypt()`)

- **AES-256-GCM** authenticated encryption
- **Random IVs** for each encryption operation
- **Authentication tags** preventing tampering
- **Associated data** support for additional security

## 🛡️ Method Details

### Form Protection

#### `secure.forms(options?)`

Creates CSRF protection middleware for forms.

```javascript
// Basic CSRF protection
app.use(secure.forms());

// Custom configuration
app.use(
  secure.forms({
    tokenField: 'custom_csrf',
    headerField: 'x-custom-token',
    expiryMinutes: 30,
  })
);
```

### Rate Limiting

#### `secure.requests(maxRequests?, windowMs?, options?)`

Creates rate limiting middleware.

```javascript
// Default rate limiting (100 req/15min)
app.use('/api', secure.requests());

// Custom limits
app.use('/auth/login', secure.requests(5, 3600000)); // 5/hour

// With custom message
app.use(
  '/upload',
  secure.requests(10, 60000, {
    message: 'Upload limit exceeded',
  })
);
```

### Input Safety

#### `secure.input(text, options?)`

Basic text sanitization with XSS prevention.

```javascript
const clean = secure.input(userInput);
const cleanWithLimit = secure.input(userInput, { maxLength: 100 });
```

#### `secure.html(html, options?)`

HTML sanitization with allowed tags.

```javascript
const safeHtml = secure.html(userHtml, {
  allowedTags: ['p', 'b', 'i', 'a'],
});
```

#### `secure.escape(text)`

HTML entity escaping for safe display.

```javascript
const safeText = secure.escape(userText);
```

### Data Encryption

#### `secure.encrypt(data, key?, associatedData?)`

Encrypts data with AES-256-GCM.

```javascript
const encrypted = secure.encrypt(sensitiveData);
const encryptedWithKey = secure.encrypt(data, customKey);
```

#### `secure.decrypt(encryptedData, key?, associatedData?)`

Decrypts authenticated data.

```javascript
const original = secure.decrypt(encryptedData);
const originalWithKey = secure.decrypt(encryptedData, customKey);
```

#### `secure.generateKey()`

Generates 256-bit encryption key.

```javascript
const newKey = secure.generateKey(); // 64-char hex string
```

## 🤖 LLM Code Generation Guidelines

### File Headers (Required)

```javascript
/**
 * Brief description of what the file does
 * @module @voilajsx/appkit/security
 * @file path/to/filename.js
 */
```

### Function Documentation (Required)

```javascript
/**
 * Clear description of what the function does
 * @param {Type} paramName - Parameter description
 * @returns {ReturnType} Return value description
 */
```

### Code Style Requirements

- **ESM imports** with single quotes:
  `import { security } from '@voilajsx/appkit/security';`
- **Semicolons required** for all statements
- **2-space indentation** for consistency
- **Always include JSDoc** for function documentation

### Essential Patterns for LLM Generation

#### 1. Basic Security Setup

```javascript
// Always start with this pattern
import { security } from '@voilajsx/appkit/security';
const secure = security.get();

// Always apply security middleware first
app.use(secure.forms()); // CSRF protection
app.use('/api', secure.requests()); // Rate limiting

// Session middleware required for CSRF
app.use(session({ secret: process.env.SESSION_SECRET }));
```

#### 2. Safe Input Handling Pattern

```javascript
// ✅ ALWAYS clean user input before processing
const cleanName = secure.input(req.body.name);
const safeHtml = secure.html(req.body.content, {
  allowedTags: ['p', 'b', 'i'],
});

// ✅ ALWAYS encrypt sensitive data before storage
const encryptedSSN = secure.encrypt(user.ssn);

// ✅ ALWAYS escape output for safe display
const safeText = secure.escape(userContent);
```

#### 3. Error Handling Pattern

```javascript
// ✅ ALWAYS handle security errors properly
try {
  const cleanData = secure.input(userInput);
  const encrypted = secure.encrypt(sensitiveData);
} catch (error) {
  res.status(error.statusCode || 500).json({
    error: error.message,
  });
}
```

#### 4. Form Security Pattern

```javascript
// ✅ ALWAYS include CSRF tokens in forms
app.get('/form', (req, res) => {
  const csrfToken = req.csrfToken(); // Added by secure.forms()
  res.send(`
    <form method="POST">
      <input type="hidden" name="_csrf" value="${csrfToken}">
      <!-- form fields -->
    </form>
  `);
});

app.post('/form', (req, res) => {
  // CSRF automatically verified by middleware
  const cleanData = secure.input(req.body.data);
  // Process form...
});
```

### Anti-Patterns to Avoid

```javascript
// ❌ DON'T store user input without cleaning
await db.createPost({ content: req.body.content }); // XSS vulnerability

// ❌ DON'T store sensitive data without encryption
await db.createUser({ ssn: req.body.ssn }); // Data breach risk

// ❌ DON'T display user content without escaping
res.send(`<p>${userComment}</p>`); // XSS vulnerability

// ❌ DON'T forget CSRF protection on forms
app.post('/transfer', (req, res) => {
  /* No CSRF check */
});

// ❌ DON'T forget rate limiting on sensitive endpoints
app.post('/auth/login', loginHandler); // No rate limiting

// ❌ DON'T hardcode encryption keys
const encrypted = secure.encrypt(data, 'hardcoded-key');
```

### Response Format Guidelines

#### Standard Success Response

```javascript
res.json({
  success: true,
  data: cleanedData, // Always use cleaned/validated data
});
```

#### Standard Error Response

```javascript
res.status(error.statusCode || 500).json({
  error: error.message,
  // Never expose sensitive error details
});
```

### Security Checklist for LLM Generation

```javascript
// ✅ Security middleware applied first
app.use(secure.forms());
app.use(secure.requests());

// ✅ User input cleaned
const clean = secure.input(userInput);

// ✅ HTML sanitized with allowed tags
const safeHtml = secure.html(userHtml, { allowedTags: ['p'] });

// ✅ Sensitive data encrypted
const encrypted = secure.encrypt(sensitiveData);

// ✅ Output escaped for display
const safe = secure.escape(userContent);

// ✅ Error handling with proper status codes
catch (error) {
  res.status(error.statusCode || 500).json({ error: error.message });
}
```

## 📈 Performance

- **CSRF Operations**: ~1ms per token generation/verification
- **Rate Limiting**: In-memory tracking with automatic cleanup
- **Input Sanitization**: ~0.1ms per input cleaning operation
- **Encryption**: ~2ms per encrypt/decrypt operation (AES-256-GCM)
- **Memory Usage**: <2MB additional overhead
- **Environment Parsing**: Once per application lifecycle

## 🔍 Error Handling

All security functions return standard Error objects with `statusCode`
properties:

```javascript
try {
  const encrypted = secure.encrypt(sensitiveData);
} catch (error) {
  console.log(`Error ${error.statusCode}: ${error.message}`);
  // Handle security error appropriately
}
```

### Common Error Status Codes

- **400** - Invalid input format or parameters
- **401** - Authentication failure (tampered data)
- **403** - Access denied (CSRF, rate limit)
- **429** - Rate limit exceeded
- **500** - Server configuration error

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
