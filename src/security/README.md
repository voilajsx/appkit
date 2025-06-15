# @voilajsx/appkit - Security Module 🔒

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Production-ready security utilities with environment-first design and smart
> defaults

The Security module provides essential protection against common web
vulnerabilities including CSRF attacks, brute force attempts, XSS injections,
and data breaches. Each utility is designed for production use with zero
configuration required.

## Module Overview

Complete security protection for production applications:

| Feature             | What it does                   | Main functions                                    |
| ------------------- | ------------------------------ | ------------------------------------------------- |
| **Form Protection** | CSRF attack prevention         | `protectForms()`                                  |
| **Rate Limiting**   | Brute force and DoS protection | `limitRequests()`                                 |
| **Input Safety**    | XSS and injection prevention   | `cleanInput()`, `cleanHtml()`, `escapeHtml()`     |
| **Data Encryption** | Sensitive data protection      | `encryptData()`, `decryptData()`, `generateKey()` |

## 🚀 Features

- **🛡️ Complete Protection** - CSRF, rate limiting, input sanitization,
  encryption
- **⚡ Zero Configuration** - Smart defaults from environment variables
- **🌍 Environment-First** - Production vs development aware
- **🔧 Framework Agnostic** - Works with Express, Fastify, and others
- **📦 Independent Module** - No dependencies on other @voilajsx/appkit modules
- **🎯 Production-Ready** - Cryptographically secure implementations

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import {
  protectForms,
  limitRequests,
  cleanInput,
  encryptData
} from '@voilajsx/appkit/security';

// Complete security setup in 3 lines
app.use(protectForms());           // CSRF protection
app.use('/api', limitRequests());  // Rate limiting

// Secure user input handling
app.post('/profile', (req, res) => {
  const safeBio = cleanInput(req.body.bio);
  const encryptedSSN = encryptData(req.body.ssn);

  await saveUser({ bio: safeBio, ssn: encryptedSSN });
  res.json({ success: true });
});
```

## 📖 Core Functions

### Form Protection (1 function)

CSRF protection with cryptographically secure tokens:

| Function         | Purpose               | When to use                 |
| ---------------- | --------------------- | --------------------------- |
| `protectForms()` | Prevents CSRF attacks | All applications with forms |

```javascript
// Zero-config CSRF protection
app.use(protectForms()); // Uses VOILA_CSRF_SECRET

// Generate tokens in forms
app.get('/contact', (req, res) => {
  const csrfToken = req.csrfToken(); // Added by middleware
  res.render('contact', { csrfToken });
});

// Automatic verification on POST/PUT/DELETE
app.post('/contact', (req, res) => {
  // CSRF already verified by middleware
  // Handle form submission...
});
```

### Rate Limiting (1 function)

Protect against brute force and DoS attacks:

| Function          | Purpose                    | When to use                |
| ----------------- | -------------------------- | -------------------------- |
| `limitRequests()` | Controls request frequency | API endpoints, login pages |

```javascript
// Global API rate limiting
app.use('/api', limitRequests()); // Uses VOILA_RATE_LIMIT + VOILA_RATE_WINDOW

// Strict login protection
app.use('/auth/login', limitRequests(5, 3600000)); // 5 attempts per hour

// Custom rate limiting
app.use('/upload', limitRequests(10, 60000)); // 10 uploads per minute
```

### Input Safety (3 functions)

Comprehensive protection against XSS and injection attacks:

| Function       | Purpose                    | When to use                |
| -------------- | -------------------------- | -------------------------- |
| `cleanInput()` | Basic text sanitization    | User input, search queries |
| `cleanHtml()`  | Advanced HTML sanitization | Rich text, comments, bios  |
| `escapeHtml()` | HTML entity escaping       | Displaying user content    |

```javascript
// Basic input cleaning
const cleanEmail = cleanInput(req.body.email);
const cleanName = cleanInput(req.body.name, { maxLength: 50 });

// Rich text with allowed HTML
const safeBio = cleanHtml(req.body.bio, {
  allowedTags: ['p', 'b', 'i', 'a', 'ul', 'li'],
});

// Safe text display
const safeComment = escapeHtml(userComment);
res.send(`<p>User said: ${safeComment}</p>`);
```

### Data Encryption (3 functions)

AES-256-GCM encryption for sensitive data protection:

| Function        | Purpose                 | When to use                 |
| --------------- | ----------------------- | --------------------------- |
| `encryptData()` | Encrypts sensitive data | PII, payment info, secrets  |
| `decryptData()` | Decrypts encrypted data | Retrieving sensitive data   |
| `generateKey()` | Creates encryption keys | Initial setup, key rotation |

```javascript
// Generate encryption key (one-time setup)
const key = generateKey();
console.log('Save this key securely:', key);

// Encrypt sensitive data
const encryptedSSN = encryptData(user.ssn); // Uses VOILA_ENCRYPTION_KEY
const encryptedCard = encryptData(paymentInfo, customKey);

// Decrypt when needed
const originalSSN = decryptData(encryptedSSN);
const originalCard = decryptData(encryptedCard, customKey);
```

## 🔧 Environment Variables

### Required for Production

```bash
# CSRF Protection
VOILA_CSRF_SECRET=your-csrf-secret-key  # Required for form protection

# Data Encryption
VOILA_ENCRYPTION_KEY=your-256-bit-hex-key  # Required for data encryption
```

### Optional Configuration (Smart Defaults)

```bash
# CSRF Settings
VOILA_CSRF_FIELD=_csrf              # Form field name (default: _csrf)
VOILA_CSRF_HEADER=x-csrf-token      # Header name (default: x-csrf-token)
VOILA_CSRF_EXPIRY=60                # Token expiry minutes (default: 60)

# Rate Limiting
VOILA_RATE_LIMIT=100                # Max requests (default: 100)
VOILA_RATE_WINDOW=900000            # Window in ms (default: 15 min)
VOILA_RATE_MESSAGE="Too many requests" # Custom error message

# Input Sanitization
VOILA_MAX_INPUT_LENGTH=1000         # Max input length (default: 1000)
VOILA_ALLOWED_TAGS=p,b,i,a          # Allowed HTML tags (comma-separated)
VOILA_STRIP_ALL_TAGS=false          # Strip all HTML (default: false)
```

## 💡 Common Use Cases

| Scenario           | Functions Used                      | Example                          |
| ------------------ | ----------------------------------- | -------------------------------- |
| **Web Forms**      | `protectForms()`, `cleanInput()`    | Contact forms, user registration |
| **API Security**   | `limitRequests()`, `cleanInput()`   | REST APIs, GraphQL endpoints     |
| **Rich Content**   | `cleanHtml()`, `escapeHtml()`       | Comments, blogs, user profiles   |
| **Data Privacy**   | `encryptData()`, `decryptData()`    | PII storage, payment processing  |
| **Authentication** | `limitRequests()`, `protectForms()` | Login pages, password reset      |

## 📋 Complete Example

```javascript
import express from 'express';
import session from 'express-session';
import {
  protectForms,
  limitRequests,
  cleanInput,
  cleanHtml,
  escapeHtml,
  encryptData,
  decryptData,
  generateKey,
} from '@voilajsx/appkit/security';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for CSRF)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' },
  })
);

// Security middleware
app.use(protectForms()); // CSRF protection for all forms
app.use('/api', limitRequests()); // Rate limiting for API routes

// Strict rate limiting for authentication
app.use('/auth', limitRequests(5, 3600000)); // 5 attempts per hour

// User registration with complete security
app.post('/auth/register', async (req, res) => {
  try {
    // Clean and validate input
    const email = cleanInput(req.body.email?.toLowerCase());
    const name = cleanInput(req.body.name, { maxLength: 50 });
    const bio = cleanHtml(req.body.bio, {
      allowedTags: ['p', 'b', 'i'],
    });

    // Encrypt sensitive data
    const encryptedPhone = encryptData(req.body.phone);

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
});

// Profile display with safe output
app.get('/profile/:id', async (req, res) => {
  const user = await getUser(req.params.id);

  // Decrypt sensitive data
  const phone = decryptData(user.encryptedPhone);

  // Safe HTML output
  const safeName = escapeHtml(user.name);
  const safeBio = user.bio; // Already cleaned during input

  res.send(`
    <h1>${safeName}</h1>
    <div>${safeBio}</div>
    <p>Phone: ${escapeHtml(phone)}</p>
  `);
});

// File upload with security
app.post('/upload', limitRequests(5, 60000), async (req, res) => {
  // Clean filename
  const safeFilename = cleanInput(req.body.filename, {
    maxLength: 100,
    removeXSS: true,
  });

  // Process upload...
  res.json({ filename: safeFilename });
});

// API endpoint with comprehensive protection
app.post('/api/comments', async (req, res) => {
  try {
    // Clean comment content
    const content = cleanHtml(req.body.content, {
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Secure server running on port ${port}`);
});
```

## 🛡️ Security Features

### CSRF Protection

- **Cryptographically secure tokens** using `crypto.randomBytes()`
- **Timing-safe verification** with `crypto.timingSafeEqual()`
- **Session-based storage** preventing token prediction
- **Automatic expiry** with configurable timeouts

### Rate Limiting

- **In-memory tracking** with automatic cleanup
- **Configurable windows** and request limits
- **Client identification** via IP address
- **Standard headers** (X-RateLimit-\*, Retry-After)

### Input Sanitization

- **XSS prevention** removing dangerous scripts and protocols
- **Length limiting** preventing memory exhaustion
- **HTML filtering** with configurable allowed tags
- **Entity escaping** for safe text display

### Data Encryption

- **AES-256-GCM** authenticated encryption
- **Random IVs** for each encryption operation
- **Authentication tags** preventing tampering
- **Associated data** support for additional security

## 🔍 Error Handling

All security functions return standard Error objects with `statusCode`
properties:

```javascript
try {
  const encrypted = encryptData(sensitiveData);
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

## 📚 API Reference

### Form Protection

- `protectForms(secret?, options?)` - CSRF protection middleware

### Rate Limiting

- `limitRequests(maxRequests?, windowMs?, options?)` - Rate limiting middleware

### Input Safety

- `cleanInput(text, options?)` - Basic text sanitization
- `cleanHtml(html, options?)` - HTML sanitization with allowed tags
- `escapeHtml(text)` - HTML entity escaping

### Data Encryption

- `generateKey()` - Generate 256-bit encryption key
- `encryptData(data, key?, associatedData?)` - AES-256-GCM encryption
- `decryptData(encryptedData, key?, associatedData?)` - Authenticated decryption

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
