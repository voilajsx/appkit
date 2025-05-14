# Security Module - Developer REFERENCE 🛠️

The security module provides essential protection tools for Node.js
applications. It includes CSRF token management, rate limiting, and input
sanitization - all with simple interfaces and sensible defaults.

Whether you're building a simple website or a complex API, these utilities help
protect your application from common security threats with minimal
configuration.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🛡️ [CSRF Protection](#csrf-protection)
  - [Generating Tokens](#generating-tokens)
  - [Validating Tokens](#validating-tokens)
  - [Middleware Setup](#middleware-setup)
  - [Complete CSRF Example](#complete-csrf-example)
- ⏱️ [Rate Limiting](#rate-limiting)
  - [Basic Rate Limiting](#basic-rate-limiting)
  - [API Rate Limiting](#api-rate-limiting)
  - [Complete Rate Limiting Example](#complete-rate-limiting-example)
- 🧹 [Input Sanitization](#input-sanitization)
  - [Escaping Strings](#escaping-strings)
  - [Sanitizing HTML](#sanitizing-html)
  - [Sanitizing Filenames](#sanitizing-filenames)
  - [Complete Sanitization Example](#complete-sanitization-example)
- 🔒 [Complete Integration Example](#complete-integration-example)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajs/appkit
```

### Basic Import

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
} from '@voilajs/appkit/security';
```

## CSRF Protection

CSRF protection prevents cross-site request forgery attacks by ensuring that
form submissions and API requests come from your site, not from malicious
sources.

### Generating Tokens

Use `generateCsrfToken` to create a token for your forms:

```javascript
import { generateCsrfToken } from '@voilajs/appkit/security';
import express from 'express';

const app = express();

app.get('/form', (req, res) => {
  // Generate a token and store it in the session
  const csrfToken = generateCsrfToken(req.session);

  // Pass token to your template
  res.render('form', { csrfToken });
});
```

**Expected Output:**

The function returns a random hex string like:

```
'a4f16c9b8d2e5f7c1b3d9e7f1a3b5c8d'
```

**When to use:**

- In routes that render forms
- Before displaying sensitive action buttons
- In API endpoints that generate tokens for SPAs

### Validating Tokens

Use `validateCsrfToken` to check if a submitted token is valid:

```javascript
import { validateCsrfToken } from '@voilajs/appkit/security';

app.post('/submit-form', (req, res) => {
  const isValid = validateCsrfToken(req.body._csrf, req.session);

  if (!isValid) {
    return res.status(403).send('Invalid CSRF token');
  }

  // Process the form
  res.send('Form submitted successfully');
});
```

**Expected Output:**

The function returns a boolean:

```
true  // Valid token
false // Invalid token
```

**When to use:**

- When manually handling form submissions
- In API routes that need token validation
- For custom validation scenarios

### Middleware Setup

For most applications, use `createCsrfMiddleware` to automatically handle CSRF
validation:

```javascript
import { createCsrfMiddleware } from '@voilajs/appkit/security';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const app = express();

// Required middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// Create CSRF middleware
const csrf = createCsrfMiddleware();

// Apply to all routes that need protection
app.use(csrf);
```

**When to use:**

- For most web applications with forms
- When you want automatic CSRF protection
- For consistent protection across multiple routes

### Complete CSRF Example

Here's a complete example showing a protected form:

```javascript
import express from 'express';
import session from 'express-session';
import {
  generateCsrfToken,
  createCsrfMiddleware,
} from '@voilajs/appkit/security';

const app = express();

// Setup middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// Create CSRF middleware (skips GET requests automatically)
const csrf = createCsrfMiddleware();
app.use(csrf);

// Add CSRF token to all responses
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req.session);
  next();
});

// Display a form
app.get('/form', (req, res) => {
  res.send(`
    <form method="POST" action="/submit">
      <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
      <input type="text" name="message" placeholder="Your message">
      <button type="submit">Submit</button>
    </form>
  `);
});

// Process the form (CSRF is checked automatically by middleware)
app.post('/submit', (req, res) => {
  res.send('Message received: ' + req.body.message);
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

**When to implement:**

- For new web applications with form submissions
- When adding security to existing web applications
- For protecting single-page apps that make API calls

## Rate Limiting

Rate limiting prevents abuse of your API by limiting how many requests a client
can make in a given time period.

### Basic Rate Limiting

Use `createRateLimiter` to create a simple rate limiter:

```javascript
import { createRateLimiter } from '@voilajs/appkit/security';
import express from 'express';

const app = express();

// Create a rate limiter: 100 requests per 15 minutes
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
});

// Apply to all routes
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Hello World');
});
```

**Expected Behavior:**

- Users can make up to 100 requests in 15 minutes
- After limit is reached, they receive a 429 status with error message
- Headers include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and
  `X-RateLimit-Reset`

**When to use:**

- To protect public APIs from abuse
- For high-traffic routes that could be targets for scraping
- When you need a simple solution for rate limiting all routes

### API Rate Limiting

Create multiple rate limiters for different routes:

```javascript
import { createRateLimiter } from '@voilajs/appkit/security';
import express from 'express';

const app = express();

// Regular API rate limit: 100 requests per 15 minutes
const standardLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Stricter limit for authentication: 5 attempts per hour
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many login attempts, please try again later',
});

// Apply limiters to specific routes
app.use('/api/', standardLimiter);
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
```

**When to use:**

- When different routes need different rate limits
- For protecting authentication endpoints from brute force attacks
- When you need to apply different policies to different API endpoints

### Complete Rate Limiting Example

Here's a complete example with custom key generation:

```javascript
import express from 'express';
import { createRateLimiter } from '@voilajs/appkit/security';

const app = express();
app.use(express.json());

// API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again after 15 minutes',
  // Custom key generator using API key or IP
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
});

// Apply to API routes
app.use('/api', apiLimiter);

// Public endpoint (not rate limited)
app.get('/', (req, res) => {
  res.send('Welcome to our API');
});

// Protected endpoint (rate limited)
app.get('/api/data', (req, res) => {
  res.json({ message: 'Here is your data', timestamp: Date.now() });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

**When to implement:**

- For APIs that need protection from abuse
- When implementing authentication endpoints
- For public-facing services with potential DoS concerns

## Input Sanitization

Input sanitization prevents XSS (Cross-Site Scripting) and other injection
attacks by cleaning user input before using or storing it.

### Escaping Strings

Use `escapeString` to safely display user input in HTML:

```javascript
import { escapeString } from '@voilajs/appkit/security';
import express from 'express';

const app = express();

app.get('/profile/:username', (req, res) => {
  const username = escapeString(req.params.username);

  // Safe to include in HTML
  res.send(`
    <h1>Profile for ${username}</h1>
    <p>Welcome to your profile page!</p>
  `);
});
```

**Expected Output:**

For input `<script>alert('XSS')</script>`:

```
&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;
```

**When to use:**

- When displaying user input in HTML
- For user-generated content in templates
- When outputting data in attributes

### Sanitizing HTML

Use `sanitizeHtml` when you need to allow some HTML but remove dangerous
elements:

```javascript
import { sanitizeHtml } from '@voilajs/appkit/security';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/comments', (req, res) => {
  // Allow basic formatting but remove scripts and events
  const safeComment = sanitizeHtml(req.body.comment, {
    allowedTags: ['p', 'b', 'i', 'em', 'strong'],
  });

  // Store and display safe comment
  saveComment(safeComment);
  res.send('Comment posted successfully');
});
```

**Expected Output:**

For input `<p>Hello <script>alert('XSS')</script><b>world</b></p>`:

```
<p>Hello <b>world</b></p>
```

**When to use:**

- For comment systems or forums
- When users need basic formatting options
- For rich text content in CMS systems

### Sanitizing Filenames

Use `sanitizeFilename` to prevent path traversal and ensure safe filenames:

```javascript
import { sanitizeFilename } from '@voilajs/appkit/security';
import express from 'express';
import multer from 'multer';
import path from 'path';

const app = express();

// Set up file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Sanitize the original filename
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully');
});
```

**Expected Output:**

For input `../../../etc/passwd`:

```
etcpasswd
```

For input `my-document.pdf`:

```
my-document.pdf
```

**When to use:**

- When accepting file uploads
- Before writing files to disk
- When creating files based on user input

### Complete Sanitization Example

Here's a complete example of form sanitization:

```javascript
import express from 'express';
import {
  escapeString,
  sanitizeHtml,
  sanitizeFilename,
} from '@voilajs/appkit/security';

const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/submit-profile', (req, res) => {
  // Get form data
  const { username, bio, avatar } = req.body;

  // Sanitize all inputs
  const sanitizedProfile = {
    // Simple text - escape for display
    username: escapeString(username),

    // Rich text - allow some tags
    bio: sanitizeHtml(bio, {
      allowedTags: ['p', 'b', 'i', 'a', 'ul', 'li'],
    }),

    // Filename - prevent path traversal
    avatar: sanitizeFilename(avatar),
  };

  // Now safe to use or store
  saveProfile(sanitizedProfile);

  res.send('Profile updated successfully');
});

function saveProfile(profile) {
  // Save to database or file
  console.log('Saved profile:', profile);
}

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

**When to implement:**

- For any application accepting user input
- When storing user-generated content
- Before displaying dynamic content in templates

## Complete Integration Example

Here's a simple Express app that combines all security features:

```javascript
import express from 'express';
import session from 'express-session';
import {
  generateCsrfToken,
  createCsrfMiddleware,
  createRateLimiter,
  sanitizeHtml,
  escapeString,
} from '@voilajs/appkit/security';

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

// Setup CSRF protection
const csrf = createCsrfMiddleware();
app.use(csrf);

// Add CSRF token to all responses
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req.session);
  next();
});

// Setup rate limiting
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const loginLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
});

// Apply rate limiters
app.use('/api', apiLimiter);
app.use('/login', loginLimiter);

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Security Demo</h1>
    <form method="POST" action="/submit">
      <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
      <textarea name="comment" placeholder="Leave a comment"></textarea>
      <button type="submit">Submit</button>
    </form>
  `);
});

app.post('/submit', (req, res) => {
  // Sanitize comment
  const safeComment = sanitizeHtml(req.body.comment, {
    allowedTags: ['b', 'i', 'em', 'strong'],
  });

  res.send(`
    <h1>Comment Received</h1>
    <p>Here's your sanitized comment:</p>
    <div>${safeComment}</div>
    <a href="/">Back to form</a>
  `);
});

// API endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is rate limited data' });
});

// Error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid security token. Please try again.');
  }
  console.error(err);
  res.status(500).send('Something went wrong');
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

**When to implement this comprehensive approach:**

- For new web applications requiring multiple security layers
- When upgrading security on existing applications
- For applications storing or displaying user-generated content

## Best Practices

### 🔐 Security

- Always use HTTPS in production
- Store session secrets in environment variables
- Apply rate limiting to authentication endpoints
- Sanitize all user inputs, especially when stored in databases
- Use CSRF protection for all state-changing operations

### 🏗️ Architecture

- Apply security at the middleware level where possible
- Separate security concerns from business logic
- Use consistent error messages that don't leak internal details
- Consider defense in depth - apply multiple security layers

### 🚀 Performance

- Use reasonable rate limit windows (15-60 minutes) for most APIs
- For high-traffic applications, consider distributed rate limiting with Redis
- Apply sanitization once before storage rather than on every display

### 👥 User Experience

- Provide clear error messages for rate limiting
- Make CSRF token renewal automatic
- Set reasonable timeouts on security tokens
- Add clear retry-after information for rate limited responses

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
