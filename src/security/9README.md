# Security Module

The security module provides essential security utilities to protect your Node.js applications from common vulnerabilities. It includes CSRF protection, rate limiting, and input sanitization tools that work with any web framework.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CSRF Protection](#csrf-protection)
  - [What is CSRF?](#what-is-csrf)
  - [Basic Usage](#basic-usage)
  - [Integration Examples](#integration-examples)
  - [Custom Configuration](#custom-configuration)
- [Rate Limiting](#rate-limiting)
  - [Why Rate Limiting?](#why-rate-limiting)
  - [Basic Setup](#basic-setup)
  - [Advanced Configuration](#advanced-configuration)
  - [Custom Key Generation](#custom-key-generation)
- [Input Sanitization](#input-sanitization)
  - [HTML Sanitization](#html-sanitization)
  - [String Escaping](#string-escaping)
  - [Common Use Cases](#common-use-cases)
- [Security Best Practices](#security-best-practices)
- [API Reference](#api-reference)
- [Real-World Examples](#real-world-examples)
- [Troubleshooting](#troubleshooting)

## Introduction

Web applications face numerous security threats including Cross-Site Request Forgery (CSRF), brute force attacks, and Cross-Site Scripting (XSS). This module provides simple, effective tools to mitigate these common vulnerabilities without the complexity of full-featured security frameworks.

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { 
  createCsrfMiddleware, 
  createRateLimiter,
  sanitizeHtml,
  escapeString
} from '@voilajs/appkit/security';
import express from 'express';
import session from 'express-session';

const app = express();

// Setup session (required for CSRF)
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Add CSRF protection
app.use(createCsrfMiddleware());

// Add rate limiting
app.use('/api', createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
}));

// Sanitize user input
app.post('/comment', (req, res) => {
  const safeComment = sanitizeHtml(req.body.comment);
  // Store safe comment in database
});
```

## CSRF Protection

### What is CSRF?

Cross-Site Request Forgery (CSRF) is an attack that tricks users into performing unwanted actions on a web application where they're authenticated. For example, a malicious site could submit a form to your bank's website using your logged-in session.

### Basic Usage

```javascript
import { generateCsrfToken, validateCsrfToken, createCsrfMiddleware } from '@voilajs/appkit/security';
import express from 'express';
import session from 'express-session';

const app = express();

// Setup session middleware (required)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }
}));

// Add CSRF middleware
app.use(createCsrfMiddleware());

// Generate token for forms
app.get('/transfer-form', (req, res) => {
  const csrfToken = generateCsrfToken(req.session);
  res.render('transfer-form', { csrfToken });
});
```

In your HTML form:
```html
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <input name="amount" type="number">
  <button type="submit">Transfer</button>
</form>
```

### Integration Examples

#### With AJAX Requests

```javascript
// Server: Send token to client
app.get('/api/csrf-token', (req, res) => {
  const token = generateCsrfToken(req.session);
  res.json({ csrfToken: token });
});

// Client: Include token in headers
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ amount: 100 })
});
```

#### With Single Page Applications

```javascript
// Server: Inject token into page
app.get('/', (req, res) => {
  const token = generateCsrfToken(req.session);
  res.send(`
    <script>
      window.CSRF_TOKEN = '${token}';
    </script>
    <div id="app"></div>
  `);
});

// Client: Use token in all requests
axios.defaults.headers.common['X-CSRF-Token'] = window.CSRF_TOKEN;
```

### Custom Configuration

```javascript
const csrfMiddleware = createCsrfMiddleware({
  tokenField: '_csrfToken',      // Custom field name in body
  headerField: 'x-csrf-token'    // Custom header name
});

// Custom error handling
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ 
      error: 'Invalid CSRF token',
      message: 'Form submission failed. Please refresh and try again.'
    });
  } else {
    next(err);
  }
});
```

## Rate Limiting

### Why Rate Limiting?

Rate limiting protects your application from:
- Brute force attacks on login endpoints
- API abuse and excessive usage
- Denial of Service (DoS) attacks
- Web scraping and data harvesting

### Basic Setup

```javascript
import { createRateLimiter } from '@voilajs/appkit/security';

// Basic rate limiting for all routes
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use(generalLimiter);

// Stricter limits for sensitive endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per window
  message: 'Too many login attempts, please try again later.'
});

app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/forgot-password', authLimiter);
```

### Advanced Configuration

```javascript
// Different limits for different routes
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    error: 'Too Many Requests',
    message: 'API rate limit exceeded',
    retryAfter: 60
  }
});

// Bypass rate limiting for certain users
const conditionalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => {
    // Skip rate limiting for premium users
    return req.user?.isPremium === true;
  }
});

// Custom response on rate limit exceeded
const customResponseLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).render('rate-limit-exceeded', {
      retryAfter: Math.ceil(res.getHeader('X-RateLimit-Reset') - Date.now() / 1000)
    });
  }
});
```

### Custom Key Generation

```javascript
// Rate limit by user ID instead of IP
const userLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Rate limit by API key
const apiKeyLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10000,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip
});

// Combine multiple factors
const complexLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Combine user ID and endpoint
    return `${req.user?.id || req.ip}:${req.path}`;
  }
});
```

## Input Sanitization

### HTML Sanitization

Prevents XSS attacks by cleaning dangerous HTML:

```javascript
import { sanitizeHtml } from '@voilajs/appkit/security';

// Basic HTML sanitization
app.post('/article', (req, res) => {
  const cleanContent = sanitizeHtml(req.body.content);
  saveArticle({ content: cleanContent });
});

// Allow specific tags
app.post('/comment', (req, res) => {
  const cleanComment = sanitizeHtml(req.body.comment, {
    allowedTags: ['p', 'br', 'strong', 'em', 'a'],
    allowedAttributes: {
      'a': ['href']
    }
  });
  saveComment({ text: cleanComment });
});

// Strip all HTML tags
app.post('/message', (req, res) => {
  const plainText = sanitizeHtml(req.body.message, {
    stripTags: true
  });
  saveMessage({ text: plainText });
});
```

### String Escaping

Escapes special characters to prevent XSS:

```javascript
import { escapeString } from '@voilajs/appkit/security';

// Escape user input for safe display
app.get('/profile/:username', (req, res) => {
  const user = findUser(req.params.username);
  res.render('profile', {
    username: escapeString(user.username),
    bio: escapeString(user.bio),
    location: escapeString(user.location)
  });
});

// Escape dynamic content in templates
app.get('/search', (req, res) => {
  const query = req.query.q;
  const results = search(query);
  
  res.render('search-results', {
    query: escapeString(query),
    resultCount: results.length,
    results: results.map(r => ({
      ...r,
      title: escapeString(r.title),
      description: escapeString(r.description)
    }))
  });
});
```

### Common Use Cases

#### User-Generated Content

```javascript
// Blog comments with limited HTML
app.post('/blog/:id/comment', async (req, res) => {
  const comment = {
    author: escapeString(req.body.author),
    content: sanitizeHtml(req.body.content, {
      allowedTags: ['p', 'br', 'strong', 'em', 'blockquote'],
      stripTags: false
    }),
    createdAt: new Date()
  };
  
  await saveComment(req.params.id, comment);
  res.redirect(`/blog/${req.params.id}`);
});
```

#### Form Submissions

```javascript
// Contact form with plain text
app.post('/contact', (req, res) => {
  const formData = {
    name: escapeString(req.body.name),
    email: escapeString(req.body.email),
    subject: escapeString(req.body.subject),
    message: sanitizeHtml(req.body.message, { stripTags: true })
  };
  
  sendEmailToSupport(formData);
  res.json({ success: true });
});
```

#### File Uploads

```javascript
import { sanitizeFilename } from '@voilajs/appkit/security';

app.post('/upload', upload.single('file'), (req, res) => {
  const originalName = req.file.originalname;
  const safeName = sanitizeFilename(originalName);
  
  // Save file with sanitized name
  saveFile(req.file.buffer, safeName);
  
  res.json({ 
    message: 'File uploaded',
    filename: safeName 
  });
});
```

## Security Best Practices

### 1. Defense in Depth

```javascript
// Combine multiple security measures
app.use(helmet()); // Security headers
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(createCsrfMiddleware());
app.use(express.json({ limit: '10mb' })); // Limit payload size
```

### 2. Input Validation

```javascript
// Validate before sanitizing
app.post('/register', async (req, res) => {
  // Validate input format
  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Sanitize after validation
  const userData = {
    email: escapeString(req.body.email),
    username: escapeString(req.body.username),
    bio: sanitizeHtml(req.body.bio)
  };
  
  await createUser(userData);
});
```

### 3. Content Security Policy

```javascript
// Set CSP headers to prevent XSS
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

### 4. Secure Sessions

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JS access
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));
```

## API Reference

### CSRF Protection

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `generateCsrfToken(session)` | Generates a CSRF token | `session: Object` - Express session object | `string` - CSRF token |
| `validateCsrfToken(token, session)` | Validates a CSRF token | `token: string`, `session: Object` | `boolean` - True if valid |
| `createCsrfMiddleware(options?)` | Creates CSRF middleware | `options?: { tokenField?: string, headerField?: string }` | `Function` - Express middleware |

### Rate Limiting

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createRateLimiter(options)` | Creates rate limiting middleware | `options: { windowMs: number, max: number, message?: string, keyGenerator?: Function }` | `Function` - Express middleware |

### Input Sanitization

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `sanitizeHtml(input, options?)` | Sanitizes HTML input | `input: string`, `options?: { stripTags?: boolean, allowedTags?: string[] }` | `string` - Sanitized HTML |
| `escapeString(input)` | Escapes special characters | `input: string` | `string` - Escaped string |

## Real-World Examples

### Secure Login System

```javascript
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

app.post('/login', loginLimiter, async (req, res) => {
  try {
    // Sanitize input
    const email = escapeString(req.body.email);
    const password = req.body.password; // Don't escape passwords
    
    // Authenticate user
    const user = await authenticateUser(email, password);
    
    // Generate session
    req.session.userId = user.id;
    
    // Generate CSRF token for future requests
    const csrfToken = generateCsrfToken(req.session);
    
    res.json({ 
      success: true, 
      csrfToken,
      user: {
        id: user.id,
        email: escapeString(user.email),
        name: escapeString(user.name)
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

### API with Rate Limiting

```javascript
// Different limits for different API tiers
const freeTierLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  keyGenerator: (req) => req.user?.apiKey || req.ip
});

const premiumTierLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10000,
  keyGenerator: (req) => req.user?.apiKey
});

// Middleware to choose limiter based on user tier
app.use('/api', (req, res, next) => {
  const limiter = req.user?.tier === 'premium' ? premiumTierLimiter : freeTierLimiter;
  limiter(req, res, next);
});
```

### Secure Comment System

```javascript
app.post('/article/:id/comment', 
  createCsrfMiddleware(),
  createRateLimiter({ windowMs: 60000, max: 5 }),
  async (req, res) => {
    // Validate input
    if (!req.body.content || req.body.content.length > 1000) {
      return res.status(400).json({ error: 'Invalid comment' });
    }
    
    // Sanitize content
    const comment = {
      author: req.user.id,
      content: sanitizeHtml(req.body.content, {
        allowedTags: ['p', 'br', 'strong', 'em'],
        stripTags: false
      }),
      createdAt: new Date()
    };
    
    await saveComment(req.params.id, comment);
    
    res.json({ 
      success: true,
      comment: {
        ...comment,
        authorName: escapeString(req.user.name)
      }
    });
  }
);
```

## Troubleshooting

### CSRF Token Issues

```javascript
// Problem: CSRF token mismatch
// Solution: Ensure session is properly configured
app.use(session({
  secret: 'strong-secret',
  resave: false,
  saveUninitialized: true,
  // Important: same settings across all servers
  name: 'sessionId',
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}));

// Debug CSRF issues
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('CSRF Token in session:', req.session.csrfToken);
  console.log('CSRF Token from request:', req.body._csrf || req.headers['x-csrf-token']);
  next();
});
```

### Rate Limiting Not Working

```javascript
// Problem: Rate limits not applying correctly
// Solution: Check key generation
const debugLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    const key = req.ip;
    console.log('Rate limit key:', key);
    return key;
  }
});

// Behind proxy? Trust proxy headers
app.set('trust proxy', 1);
```

### Sanitization Breaking Content

```javascript
// Problem: sanitizeHtml removing needed tags
// Solution: Configure allowed tags
const richTextSanitizer = (content) => {
  return sanitizeHtml(content, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'ul', 'ol', 'li',
      'blockquote', 'a', 'img', 'pre', 'code'
    ],
    allowedAttributes: {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'width', 'height']
    }
  });
};

// For plain text, strip all HTML
const plainTextSanitizer = (content) => {
  return sanitizeHtml(content, { stripTags: true });
};
```

## Support

For issues and feature requests, visit our [GitHub repository](https://github.com/voilajs/appkit).