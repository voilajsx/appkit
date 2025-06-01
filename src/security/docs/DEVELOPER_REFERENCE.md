# Security Module - Developer REFERENCE 🛠️

The security module provides essential protection tools for Node.js
applications. It includes CSRF token management, rate limiting, input
sanitization, and data encryption - all with simple interfaces and sensible
defaults to protect against common web vulnerabilities.

Whether you're building a simple website or a complex API, these utilities help
protect your application from common security threats with minimal configuration
while keeping sensitive data secure through strong encryption.

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
- 🔐 [Data Encryption](#data-encryption)
  - [Generating Encryption Keys](#generating-encryption-keys)
  - [Encrypting Data](#encrypting-data)
  - [Decrypting Data](#decrypting-data)
  - [Complete Encryption Example](#complete-encryption-example)
- 🔒 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit
```

### Basic Import

```javascript
import {
  // CSRF Protection
  generateCsrfToken,
  verifyCsrfToken,
  createCsrfMiddleware,

  // Rate Limiting
  createRateLimiter,

  // Input Sanitization
  sanitizeHtml,
  escapeString,
  sanitizeFilename,

  // Data Encryption
  generateEncryptionKey,
  encrypt,
  decrypt,
} from '@voilajsx/appkit/security';
```

## CSRF Protection

CSRF protection prevents cross-site request forgery attacks by ensuring that
form submissions and API requests come from your site, not from malicious
sources.

### Generating Tokens

Use `generateCsrfToken` to create a token for your forms:

```javascript
import { generateCsrfToken } from '@voilajsx/appkit/security';
import express from 'express';

const app = express();

app.get('/form', (req, res) => {
  // Generate a token and store it in the session
  const csrfToken = generateCsrfToken(req.session);

  // Pass token to your template
  res.render('form', { csrfToken });
});

// With custom expiry (default is 60 minutes)
app.get('/quick-form', (req, res) => {
  const csrfToken = generateCsrfToken(req.session, 15); // Expires in 15 minutes
  res.render('quick-form', { csrfToken });
});
```

**Expected Output:**

The function returns a random hex string like:

```
'a4f16c9b8d2e5f7c1b3d9e7f1a3b5c8d'
```

**When to use:**

- **Form Rendering**: In routes that render forms requiring submission
  protection
- **Single-Page Applications**: Before displaying sensitive action buttons or
  forms
- **API Token Generation**: In endpoints that generate tokens for SPAs or mobile
  apps
- **Administrative Actions**: For protecting sensitive operations like user
  management or system configuration

### Validating Tokens

Use `verifyCsrfToken` to check if a submitted token is valid:

```javascript
import { verifyCsrfToken } from '@voilajsx/appkit/security';

app.post('/submit-form', (req, res) => {
  const isValid = verifyCsrfToken(req.body._csrf, req.session);

  if (!isValid) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message:
        'Security token validation failed. Please refresh and try again.',
    });
  }

  // Process the form safely
  res.json({ message: 'Form submitted successfully' });
});

// For API endpoints with custom token validation
app.post('/api/sensitive-action', (req, res) => {
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!verifyCsrfToken(token, req.session)) {
    return res.status(403).json({
      error: 'CSRF_TOKEN_INVALID',
      message: 'Request blocked for security reasons',
    });
  }

  // Perform the sensitive action
  performSensitiveAction(req.body);
  res.json({ success: true });
});
```

**Expected Output:**

The function returns a boolean:

```
true  // Valid token that matches session and hasn't expired
false // Invalid, expired, or missing token
```

**When to use:**

- **Manual Form Processing**: When you need custom validation logic beyond
  middleware
- **API Endpoints**: For REST APIs that need token validation with custom error
  handling
- **Conditional Protection**: When CSRF protection is needed only under certain
  conditions
- **Custom Validation Logic**: For complex scenarios where you need additional
  checks alongside CSRF validation

### Middleware Setup

For most applications, use `createCsrfMiddleware` to automatically handle CSRF
validation:

```javascript
import { createCsrfMiddleware } from '@voilajsx/appkit/security';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const app = express();

// Required middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Create CSRF middleware with default settings
const csrf = createCsrfMiddleware();

// Create CSRF middleware with custom settings
const customCsrf = createCsrfMiddleware({
  tokenField: 'csrf_token', // Custom form field name
  headerField: 'x-csrf', // Custom header field name
});

// Apply to all routes that need protection
app.use(csrf);
```

**Expected Behavior:**

- **GET Requests**: Automatically bypassed (safe methods don't need CSRF
  protection)
- **POST/PUT/DELETE Requests**: Token automatically validated from form field or
  header
- **Missing Token**: Returns 403 Forbidden with descriptive error message
- **Invalid Token**: Returns 403 Forbidden indicating security token failure
- **Valid Token**: Request proceeds to next middleware/handler

**When to use:**

- **Web Applications**: For traditional server-rendered applications with forms
- **Consistent Protection**: When you want automatic CSRF protection across
  multiple routes
- **Rapid Development**: To quickly add CSRF protection without manual
  validation in each route
- **Standard Compliance**: For applications that need to meet security
  compliance requirements

### Complete CSRF Example

Here's a complete example showing a protected form with error handling:

```javascript
import express from 'express';
import session from 'express-session';
import {
  generateCsrfToken,
  createCsrfMiddleware,
} from '@voilajsx/appkit/security';

const app = express();

// Setup middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Create CSRF middleware (automatically skips GET requests)
const csrf = createCsrfMiddleware();
app.use(csrf);

// Add CSRF token to all responses
app.use((req, res, next) => {
  if (req.session) {
    res.locals.csrfToken = generateCsrfToken(req.session);
  }
  next();
});

// Display a form
app.get('/contact', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contact Form</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; }
        form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; }
        button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; }
        .error { color: red; background: #ffebee; padding: 10px; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Contact Us</h1>
      <form method="POST" action="/contact">
        <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
        
        <label>Name</label>
        <input type="text" name="name" required>
        
        <label>Email</label>
        <input type="email" name="email" required>
        
        <label>Message</label>
        <textarea name="message" rows="5" required></textarea>
        
        <button type="submit">Send Message</button>
      </form>
    </body>
    </html>
  `);
});

// Process the form (CSRF is automatically validated by middleware)
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Process the contact form (save to database, send email, etc.)
    await saveContactMessage({ name, email, message });

    res.send(`
      <h1>Thank you!</h1>
      <p>Your message has been received. We'll get back to you soon.</p>
      <a href="/contact">Send another message</a>
    `);
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).send('Something went wrong. Please try again.');
  }
});

// Error handler for CSRF failures
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(`
      <h1>Security Error</h1>
      <p>Invalid security token. This might happen if:</p>
      <ul>
        <li>You took too long to submit the form</li>
        <li>You opened the form in multiple tabs</li>
        <li>Your session expired</li>
      </ul>
      <p><a href="${req.originalUrl}">Please try again</a></p>
    `);
  }
  next(err);
});

async function saveContactMessage(data) {
  // Simulate saving to database
  console.log('Saving contact message:', data);
}

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

**When to implement:**

- **Contact Forms**: For user-facing contact or feedback forms
- **User Account Changes**: When users update profiles, passwords, or sensitive
  settings
- **Administrative Interfaces**: For admin panels and management systems
- **E-commerce Checkouts**: To protect payment and order submission processes

## Rate Limiting

Rate limiting prevents abuse of your API by limiting how many requests a client
can make in a given time period, protecting against DoS attacks and API abuse.

### Basic Rate Limiting

Use `createRateLimiter` to create a simple rate limiter:

```javascript
import { createRateLimiter } from '@voilajsx/appkit/security';
import express from 'express';

const app = express();

// Create a rate limiter: 100 requests per 15 minutes
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply to all routes
app.use(limiter);

// Create different limiters for different scenarios
const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Very restrictive
  message: 'Rate limit exceeded. Please wait before making more requests.',
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello World', timestamp: Date.now() });
});
```

**Expected Behavior:**

- **Within Limit**: Users can make up to 100 requests in 15 minutes normally
- **Limit Exceeded**: Returns 429 status with custom error message
- **Response Headers**: Includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
  and `X-RateLimit-Reset`
- **Automatic Reset**: Counter resets after the time window expires

**When to use:**

- **Public APIs**: To protect publicly accessible APIs from abuse and scraping
- **Resource-Intensive Endpoints**: For endpoints that consume significant
  server resources
- **General Protection**: As a baseline defense against automated attacks and
  excessive usage
- **Fair Usage**: To ensure all users get fair access to your service

### API Rate Limiting

Create multiple rate limiters for different routes and use cases:

```javascript
import { createRateLimiter } from '@voilajsx/appkit/security';
import express from 'express';

const app = express();

// Regular API rate limit: 1000 requests per hour
const apiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: {
    error: 'API_RATE_LIMIT_EXCEEDED',
    message: 'You have exceeded the API rate limit.',
    retryAfter: '1 hour',
  },
});

// Stricter limit for authentication: 5 attempts per 15 minutes
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes',
  },
});

// Search rate limiter: 100 searches per 10 minutes
const searchLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: 'Search rate limit exceeded. Please try again in a few minutes.',
});

// Apply limiters to specific route groups
app.use('/api/', apiLimiter);
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/api/search', searchLimiter);

// API endpoints
app.get('/api/users', (req, res) => {
  res.json({ users: ['user1', 'user2'] });
});

app.post('/auth/login', (req, res) => {
  // Login logic here
  res.json({ token: 'fake-jwt-token' });
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  res.json({ results: [`Results for: ${q}`] });
});
```

**When to use:**

- **Authentication Endpoints**: To prevent brute force attacks on login and
  registration
- **Search APIs**: To prevent abuse of computationally expensive search
  operations
- **Different Service Tiers**: When you need different rate limits for different
  types of operations
- **Resource Protection**: For endpoints that access external APIs or databases
  intensively

### Complete Rate Limiting Example

Here's a complete example with custom key generation and store:

```javascript
import express from 'express';
import { createRateLimiter } from '@voilajsx/appkit/security';

const app = express();
app.use(express.json());

// API rate limiter with custom key generation
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again after 15 minutes',
    limit: 100,
    window: '15 minutes',
  },
  // Custom key generator - use API key or fall back to IP
  keyGenerator: (req) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      return `api_key:${apiKey}`;
    }
    return `ip:${req.ip}`;
  },
});

// Premium user limiter (higher limits)
const premiumLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 10x higher limit
  message: 'Premium rate limit exceeded',
  keyGenerator: (req) => `premium:${req.headers['x-api-key']}`,
});

// Middleware to check user tier
const checkUserTier = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Check if this is a premium user (in real app, check database)
  const isPremium = apiKey.startsWith('premium_');
  req.isPremium = isPremium;

  next();
};

// Apply appropriate rate limiter based on user tier
const conditionalRateLimit = (req, res, next) => {
  if (req.isPremium) {
    return premiumLimiter(req, res, next);
  } else {
    return apiLimiter(req, res, next);
  }
};

// Apply middleware
app.use('/api', checkUserTier, conditionalRateLimit);

// Public endpoint (no rate limiting)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to our API',
    rateLimit: 'Use /api endpoints with X-API-Key header',
  });
});

// Protected API endpoints
app.get('/api/data', (req, res) => {
  const tier = req.isPremium ? 'Premium' : 'Standard';
  res.json({
    message: 'Here is your data',
    tier,
    timestamp: Date.now(),
  });
});

app.post('/api/process', (req, res) => {
  // Simulate processing
  setTimeout(() => {
    res.json({
      result: 'Processing complete',
      tier: req.isPremium ? 'Premium' : 'Standard',
    });
  }, 100);
});

// Error handling for rate limit exceeded
app.use((err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: err.message,
      retryAfter: err.retryAfter,
    });
  }
  next(err);
});

app.listen(3000, () => {
  console.log('API server started on http://localhost:3000');
  console.log('Try:');
  console.log(
    '  curl -H "X-API-Key: standard_key_123" http://localhost:3000/api/data'
  );
  console.log(
    '  curl -H "X-API-Key: premium_key_456" http://localhost:3000/api/data'
  );
});
```

**When to implement:**

- **SaaS APIs**: For tiered service offerings with different rate limits
- **Multi-tenant Applications**: When different clients need different rate
  limits
- **Resource-Intensive APIs**: For endpoints that require careful resource
  management
- **Public-Facing Services**: To protect against automated abuse and ensure
  service availability

## Input Sanitization

Input sanitization prevents XSS (Cross-Site Scripting) and other injection
attacks by cleaning user input before processing, storing, or displaying it.

### Escaping Strings

Use `escapeString` to safely display user input in HTML:

```javascript
import { escapeString } from '@voilajsx/appkit/security';
import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: true }));

// User profile display
app.get('/profile/:username', (req, res) => {
  const username = escapeString(req.params.username);
  const bio = escapeString(req.query.bio || 'No bio provided');

  // Safe to include in HTML - XSS prevented
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Profile for ${username}</title>
    </head>
    <body>
      <h1>Profile for ${username}</h1>
      <p>Bio: ${bio}</p>
      <p>User status: <span title="${username}">Active</span></p>
    </body>
    </html>
  `);
});

// Comment display with escaping
app.post('/comments', express.json(), (req, res) => {
  const { author, comment } = req.body;

  const safeAuthor = escapeString(author);
  const safeComment = escapeString(comment);

  // Store safely escaped comment
  const commentData = {
    author: safeAuthor,
    comment: safeComment,
    timestamp: new Date().toISOString(),
  };

  saveComment(commentData);

  res.json({
    message: 'Comment saved successfully',
    preview: `${safeAuthor}: ${safeComment}`,
  });
});

function saveComment(comment) {
  // Simulate saving to database
  console.log('Saved comment:', comment);
}
```

**Expected Output:**

For malicious input like `<script>alert('XSS')</script>`:

```
&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;
```

For normal input like `Hello & welcome!`:

```
Hello &amp; welcome!
```

**When to use:**

- **Template Rendering**: When displaying user input in server-rendered HTML
  templates
- **Dynamic Content**: For user-generated content that needs to be displayed
  safely
- **Form Data Display**: When showing submitted form data back to users
- **Search Results**: For displaying search terms or results that contain user
  input
- **Error Messages**: When including user input in error messages

### Sanitizing HTML

Use `sanitizeHtml` when you need to allow some HTML but remove dangerous
elements:

```javascript
import { sanitizeHtml } from '@voilajsx/appkit/security';
import express from 'express';

const app = express();
app.use(express.json());

// Blog comment system - allow basic formatting
app.post('/blog/comments', (req, res) => {
  const { comment, author } = req.body;

  // Allow basic formatting but remove dangerous elements
  const safeComment = sanitizeHtml(comment, {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
  });

  const commentData = {
    author: escapeString(author),
    comment: safeComment,
    timestamp: new Date(),
  };

  saveBlogComment(commentData);
  res.json({ message: 'Comment posted successfully' });
});

// Rich text editor - more permissive
app.post('/articles', (req, res) => {
  const { title, content } = req.body;

  const safeTitle = escapeString(title);
  const safeContent = sanitizeHtml(content, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'b',
      'i',
      'em',
      'strong',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'br',
      'hr',
    ],
  });

  const article = {
    title: safeTitle,
    content: safeContent,
    publishedAt: new Date(),
  };

  saveArticle(article);
  res.json({ message: 'Article saved successfully' });
});

// Strip all HTML for plain text contexts
app.post('/notifications', (req, res) => {
  const { message } = req.body;

  // Remove all HTML tags for notifications
  const plainMessage = sanitizeHtml(message, {
    stripAllTags: true,
  });

  sendNotification(plainMessage);
  res.json({ message: 'Notification sent' });
});

function saveBlogComment(comment) {
  console.log('Blog comment saved:', comment);
}

function saveArticle(article) {
  console.log('Article saved:', article);
}

function sendNotification(message) {
  console.log('Notification:', message);
}
```

**Expected Output:**

For input `<p>Hello <script>alert("bad")</script><b>world</b></p>`:

With `allowedTags: ['p', 'b']`:

```
<p>Hello <b>world</b></p>
```

With `stripAllTags: true`:

```
Hello world
```

**When to use:**

- **Content Management Systems**: For rich text editors where users need
  formatting options
- **Comment Systems**: When you want to allow basic formatting in user comments
- **Forum Posts**: For discussion forums where users can use basic HTML
- **Email Content**: When processing HTML email content from users
- **Documentation**: For user-generated documentation or wiki systems

### Sanitizing Filenames

Use `sanitizeFilename` to prevent path traversal attacks and ensure safe
filenames:

```javascript
import { sanitizeFilename } from '@voilajsx/appkit/security';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const app = express();

// Set up secure file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Sanitize the original filename
    const safeName = sanitizeFilename(file.originalname);
    const timestamp = Date.now();
    const finalName = `${timestamp}-${safeName}`;

    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Additional security: check file type
    const allowedTypes = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.pdf',
      '.doc',
      '.docx',
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

// File download with sanitized filename
app.get('/download/:filename', async (req, res) => {
  try {
    const requestedFile = sanitizeFilename(req.params.filename);
    const filePath = path.join('./uploads/', requestedFile);

    // Additional security: ensure file is within uploads directory
    const realPath = await fs.realpath(filePath);
    const uploadsPath = await fs.realpath('./uploads/');

    if (!realPath.startsWith(uploadsPath)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    await fs.access(filePath);

    res.download(filePath);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Create file with user-provided name
app.post('/create-file', express.json(), async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content required' });
    }

    const safeFilename = sanitizeFilename(filename);
    if (!safeFilename) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join('./user-files/', safeFilename);
    await fs.writeFile(filePath, content, 'utf8');

    res.json({
      message: 'File created successfully',
      filename: safeFilename,
    });
  } catch (error) {
    console.error('File creation error:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});
```

**Expected Output:**

For malicious input `../../../etc/passwd`:

```
etcpasswd
```

For normal input `my-document.pdf`:

```
my-document.pdf
```

For input with special characters `My File (2023)!@#.txt`:

```
My File 2023.txt
```

**When to use:**

- **File Upload Systems**: Essential for any application accepting file uploads
- **User-Generated Files**: When users can specify filenames for created files
- **File Management Systems**: For applications that allow file organization and
  renaming
- **Document Management**: In systems where users can create, rename, or
  organize documents
- **Backup Systems**: When creating backup files based on user input or dynamic
  naming

### Complete Sanitization Example

Here's a comprehensive example combining all sanitization methods:

````javascript
import express from 'express';
import multer from 'multer';
import {
  escapeString,
  sanitizeHtml,
  sanitizeFilename,
} from '@voilajsx/appkit/security';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

```javascript
// Configure file upload with sanitized names
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      const safeName = sanitizeFilename(file.originalname);
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// User profile update with comprehensive sanitization
app.post('/profile/update', upload.single('avatar'), (req, res) => {
  try {
    const { username, bio, website, location } = req.body;

    // Sanitize all inputs appropriately
    const sanitizedProfile = {
      // Simple text fields - escape for safe display
      username: escapeString(username?.trim() || ''),
      location: escapeString(location?.trim() || ''),
      website: escapeString(website?.trim() || ''),

      // Rich text content - allow basic formatting
      bio: sanitizeHtml(bio || '', {
        allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'br'],
        // Remove potentially dangerous attributes
        allowedAttributes: {
          'a': ['href', 'title'],
        },
      }),

      // File handling
      avatar: req.file ? {
        filename: req.file.filename,
        originalName: sanitizeFilename(req.file.originalname),
        size: req.file.size,
      } : null,

      updatedAt: new Date(),
    };

    // Validate sanitized data
    if (!sanitizedProfile.username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (sanitizedProfile.username.length > 50) {
      return res.status(400).json({ error: 'Username too long' });
    }

    // Save the sanitized profile
    saveUserProfile(sanitizedProfile);

    res.json({
      message: 'Profile updated successfully',
      profile: sanitizedProfile,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Blog post creation with rich content
app.post('/blog/posts', (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    // Sanitize blog post data
    const sanitizedPost = {
      // Title - escape for safe display
      title: escapeString(title?.trim() || ''),

      // Content - allow rich formatting for blog posts
      content: sanitizeHtml(content || '', {
        allowedTags: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'b', 'i', 'em', 'strong', 'u', 's',
          'a', 'ul', 'ol', 'li', 'blockquote',
          'code', 'pre', 'br', 'hr', 'img',
        ],
        allowedAttributes: {
          'a': ['href', 'title', 'target'],
          'img': ['src', 'alt', 'title', 'width', 'height'],
        },
      }),

      // Tags - escape each tag individually
      tags: Array.isArray(tags)
        ? tags.map(tag => escapeString(tag?.trim() || '')).filter(Boolean)
        : [],

      // Category - escape for safe display
      category: escapeString(category?.trim() || 'uncategorized'),

      createdAt: new Date(),
      status: 'draft',
    };

    // Validate required fields
    if (!sanitizedPost.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!sanitizedPost.content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Save the sanitized blog post
    saveBlogPost(sanitizedPost);

    res.json({
      message: 'Blog post created successfully',
      post: {
        title: sanitizedPost.title,
        category: sanitizedPost.category,
        tags: sanitizedPost.tags,
        createdAt: sanitizedPost.createdAt,
      },
    });
  } catch (error) {
    console.error('Blog post creation error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Comment system with moderation
app.post('/comments', (req, res) => {
  try {
    const { postId, author, email, comment, parentId } = req.body;

    // Sanitize comment data
    const sanitizedComment = {
      postId: parseInt(postId) || 0,
      parentId: parentId ? parseInt(parentId) : null,

      // Author info - escape for display
      author: escapeString(author?.trim() || 'Anonymous'),
      email: escapeString(email?.trim() || ''),

      // Comment content - allow minimal formatting
      comment: sanitizeHtml(comment || '', {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
        allowedAttributes: {
          'a': ['href', 'title'],
        },
      }),

      // Metadata
      createdAt: new Date(),
      approved: false, // Require moderation
      ipAddress: req.ip,
    };

    // Validate comment data
    if (!sanitizedComment.comment.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    if (sanitizedComment.comment.length > 1000) {
      return res.status(400).json({ error: 'Comment too long (max 1000 characters)' });
    }

    // Save comment for moderation
    saveComment(sanitizedComment);

    res.json({
      message: 'Comment submitted successfully and is pending moderation',
      comment: {
        author: sanitizedComment.author,
        comment: sanitizedComment.comment,
        createdAt: sanitizedComment.createdAt,
      },
    });
  } catch (error) {
    console.error('Comment submission error:', error);
    res.status(500).json({ error: 'Failed to submit comment' });
  }
});

// Helper functions for data persistence
function saveUserProfile(profile) {
  console.log('Saving user profile:', profile);
  // In real app: database.users.update(profile)
}

function saveBlogPost(post) {
  console.log('Saving blog post:', post);
  // In real app: database.posts.create(post)
}

function saveComment(comment) {
  console.log('Saving comment:', comment);
  // In real app: database.comments.create(comment)
}

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
````

**When to implement this comprehensive approach:**

- **Content Management Systems**: For platforms where users create and manage
  various types of content
- **Social Platforms**: For applications with user profiles, posts, and comments
- **E-learning Platforms**: Where users create courses, lessons, and discussions
- **Documentation Sites**: For user-generated documentation with rich formatting
  needs

## Data Encryption

Data encryption protects sensitive information by converting it into an
unreadable format that can only be decrypted with the proper key, essential for
protecting user data, API keys, and other confidential information.

### Generating Encryption Keys

Use `generateEncryptionKey` to create cryptographically secure keys:

```javascript
import { generateEncryptionKey } from '@voilajsx/appkit/security';

// Generate AES-256 key (default - 32 bytes)
const encryptionKey = generateEncryptionKey();
console.log('Encryption key:', encryptionKey);
// Output: '4a7d8f2b9c1e5a3f7b2d9e4c8a6f1b3d5e7c9a2f4b6d8e1c3a5f7b9d2e4c6a8f'

// Generate AES-128 key (16 bytes)
const key128 = generateEncryptionKey(16);

// Generate custom length key
const customKey = generateEncryptionKey(64); // 512-bit key

// Store key securely in environment variables
console.log('Add this to your .env file:');
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
```

**Expected Output:**

The function returns a hexadecimal string:

```
// 32-byte (256-bit) key
'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890'

// 16-byte (128-bit) key
'a1b2c3d4e5f67890123456789012345'
```

**When to use:**

- **Application Setup**: During initial application configuration or deployment
- **Key Rotation**: When implementing regular key rotation for enhanced security
- **Multi-Environment Setup**: For generating separate keys for development,
  staging, and production
- **Database Encryption**: When setting up field-level encryption for sensitive
  database columns
- **Configuration Management**: For encrypting configuration files or
  environment variables

### Encrypting Data

Use `encrypt` to protect sensitive information:

```javascript
import { encrypt, generateEncryptionKey } from '@voilajsx/appkit/security';

// Setup encryption key (in real app, load from environment)
const encryptionKey = process.env.ENCRYPTION_KEY || generateEncryptionKey();

// Basic encryption
const sensitiveData = 'user-secret-password';
const encrypted = encrypt(sensitiveData, encryptionKey);
console.log('Encrypted:', encrypted);

// Encrypt JSON data
const userData = {
  ssn: '123-45-6789',
  creditCard: '4111-1111-1111-1111',
  bankAccount: '987654321',
};

const encryptedUserData = encrypt(JSON.stringify(userData), encryptionKey);
console.log('Encrypted user data:', encryptedUserData);

// Encrypt with Associated Data (AAD) for context binding
const userID = 'user_12345';
const aad = Buffer.from(`profile_${userID}`, 'utf8');
const contextBoundEncryption = encrypt(sensitiveData, encryptionKey, aad);

// Database field encryption example
async function saveUserWithEncryption(user) {
  const encryptedUser = {
    id: user.id,
    email: user.email, // Keep searchable fields unencrypted
    name: user.name,

    // Encrypt sensitive fields
    ssn: encrypt(user.ssn, encryptionKey, Buffer.from(`user_${user.id}`)),
    phone: encrypt(user.phone, encryptionKey, Buffer.from(`user_${user.id}`)),
    address: encrypt(
      JSON.stringify(user.address),
      encryptionKey,
      Buffer.from(`user_${user.id}`)
    ),

    createdAt: new Date(),
  };

  // Save to database
  await database.users.create(encryptedUser);
  return encryptedUser;
}

// API key encryption for storage
function encryptApiKeys(apiKeys) {
  const encryptedKeys = {};

  Object.entries(apiKeys).forEach(([service, key]) => {
    const aad = Buffer.from(`api_key_${service}`, 'utf8');
    encryptedKeys[service] = encrypt(key, encryptionKey, aad);
  });

  return encryptedKeys;
}

// Example usage
const apiKeys = {
  stripe: 'sk_live_abc123',
  sendgrid: 'SG.xyz789',
  aws: 'AKIA1234567890',
};

const encryptedKeys = encryptApiKeys(apiKeys);
console.log('Encrypted API keys:', encryptedKeys);
```

**Expected Output:**

```
// Encrypted data format: IV:ciphertext:authTag (all in hex)
'a1b2c3d4e5f67890:9f8e7d6c5b4a39281746352819:1a2b3c4d5e6f7890abcdef1234567890'
```

**When to use:**

- **Sensitive User Data**: For protecting PII, financial information, and health
  records
- **API Key Storage**: When storing third-party API keys and secrets
- **Configuration Files**: For encrypting sensitive configuration data
- **Database Fields**: For field-level encryption of sensitive database columns
- **Temporary Data**: For protecting sensitive data in temporary storage or
  caches

### Decrypting Data

Use `decrypt` to retrieve protected information:

```javascript
import { decrypt } from '@voilajsx/appkit/security';

// Basic decryption
const encryptionKey = process.env.ENCRYPTION_KEY;
const encryptedData =
  'a1b2c3d4e5f67890:9f8e7d6c5b4a39281746352819:1a2b3c4d5e6f7890abcdef1234567890';

try {
  const decrypted = decrypt(encryptedData, encryptionKey);
  console.log('Decrypted:', decrypted);
} catch (error) {
  console.error('Decryption failed:', error.message);
}

// Decrypt with Associated Data
const userID = 'user_12345';
const aad = Buffer.from(`profile_${userID}`, 'utf8');

try {
  const decryptedWithAAD = decrypt(encryptedData, encryptionKey, aad);
  console.log('Context-bound decryption successful:', decryptedWithAAD);
} catch (error) {
  console.error('Context verification failed:', error.message);
}

// Database retrieval with decryption
async function getUserWithDecryption(userId) {
  try {
    const encryptedUser = await database.users.findById(userId);
    if (!encryptedUser) return null;

    const aad = Buffer.from(`user_${userId}`, 'utf8');

    // Decrypt sensitive fields
    const decryptedUser = {
      id: encryptedUser.id,
      email: encryptedUser.email,
      name: encryptedUser.name,

      // Decrypt sensitive data
      ssn: decrypt(encryptedUser.ssn, encryptionKey, aad),
      phone: decrypt(encryptedUser.phone, encryptionKey, aad),
      address: JSON.parse(decrypt(encryptedUser.address, encryptionKey, aad)),

      createdAt: encryptedUser.createdAt,
    };

    return decryptedUser;
  } catch (error) {
    console.error('User decryption failed:', error);
    throw new Error('Failed to retrieve user data');
  }
}

// API key decryption
function decryptApiKeys(encryptedKeys) {
  const decryptedKeys = {};

  Object.entries(encryptedKeys).forEach(([service, encryptedKey]) => {
    try {
      const aad = Buffer.from(`api_key_${service}`, 'utf8');
      decryptedKeys[service] = decrypt(encryptedKey, encryptionKey, aad);
    } catch (error) {
      console.error(`Failed to decrypt ${service} API key:`, error.message);
      decryptedKeys[service] = null;
    }
  });

  return decryptedKeys;
}

// Error handling for different failure scenarios
function safeDecrypt(encryptedData, key, aad = null) {
  try {
    return {
      success: true,
      data: decrypt(encryptedData, key, aad),
      error: null,
    };
  } catch (error) {
    let errorType = 'UNKNOWN_ERROR';

    if (error.message.includes('Authentication failed')) {
      errorType = 'AUTHENTICATION_FAILED';
    } else if (error.message.includes('Invalid encrypted data format')) {
      errorType = 'INVALID_FORMAT';
    } else if (error.message.includes('Invalid key length')) {
      errorType = 'INVALID_KEY';
    }

    return {
      success: false,
      data: null,
      error: {
        type: errorType,
        message: error.message,
      },
    };
  }
}

// Usage example
const result = safeDecrypt(encryptedData, encryptionKey);
if (result.success) {
  console.log('Decrypted data:', result.data);
} else {
  console.error('Decryption error:', result.error);
}
```

**When to use:**

- **Data Retrieval**: When accessing encrypted data from databases or storage
- **API Operations**: For decrypting API keys and secrets when making external
  calls
- **User Data Access**: When displaying or processing sensitive user information
- **Configuration Loading**: For decrypting configuration data at application
  startup
- **Data Migration**: When moving encrypted data between systems or formats

### Complete Encryption Example

Here's a comprehensive example showing encryption in a user management system:

```javascript
import express from 'express';
import {
  generateEncryptionKey,
  encrypt,
  decrypt,
  escapeString,
} from '@voilajsx/appkit/security';

const app = express();
app.use(express.json());

// Setup encryption (in production, load from secure environment)
const encryptionKey = process.env.ENCRYPTION_KEY || generateEncryptionKey();

// User registration with encryption
app.post('/users/register', async (req, res) => {
  try {
    const { email, name, ssn, phone, address } = req.body;

    // Validate required fields
    if (!email || !name || !ssn) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate user ID (in real app, might be UUID or database-generated)
    const userId = `user_${Date.now()}`;
    const aad = Buffer.from(userId, 'utf8');

    // Create user with encrypted sensitive data
    const user = {
      id: userId,
      email: escapeString(email.toLowerCase().trim()),
      name: escapeString(name.trim()),

      // Encrypt PII with context binding
      ssn: encrypt(ssn.replace(/\D/g, ''), encryptionKey, aad),
      phone: encrypt(phone.replace(/\D/g, ''), encryptionKey, aad),
      address: address
        ? encrypt(JSON.stringify(address), encryptionKey, aad)
        : null,

      createdAt: new Date(),
      status: 'active',
    };

    // Save to database (simulated)
    await saveUser(user);

    // Return safe user data (no sensitive info)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get user profile with decryption
app.get('/users/:id/profile', async (req, res) => {
  try {
    const userId = req.params.id;

    // Retrieve user from database
    const encryptedUser = await getUser(userId);
    if (!encryptedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const aad = Buffer.from(userId, 'utf8');

    // Decrypt sensitive data for authorized access
    const decryptResult = safeDecryptUser(encryptedUser, encryptionKey, aad);

    if (!decryptResult.success) {
      console.error(
        `Decryption failed for user ${userId}:`,
        decryptResult.error
      );
      return res.status(500).json({ error: 'Failed to retrieve user data' });
    }

    res.json({
      user: decryptResult.user,
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Update user profile with re-encryption
app.put('/users/:id/profile', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, address } = req.body;

    // Get existing user
    const existingUser = await getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const aad = Buffer.from(userId, 'utf8');

    // Update user with new encrypted data
    const updatedUser = {
      ...existingUser,
      name: name ? escapeString(name.trim()) : existingUser.name,
      phone: phone
        ? encrypt(phone.replace(/\D/g, ''), encryptionKey, aad)
        : existingUser.phone,
      address: address
        ? encrypt(JSON.stringify(address), encryptionKey, aad)
        : existingUser.address,
      updatedAt: new Date(),
    };

    await saveUser(updatedUser);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Secure configuration management
const secureConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    username: 'app_user',
    password: encrypt(
      process.env.DB_PASSWORD || 'default_password',
      encryptionKey
    ),
  },

  externalServices: {
    stripe: encrypt(
      process.env.STRIPE_SECRET_KEY || '',
      encryptionKey,
      Buffer.from('stripe_api')
    ),
    sendgrid: encrypt(
      process.env.SENDGRID_API_KEY || '',
      encryptionKey,
      Buffer.from('sendgrid_api')
    ),
    aws: encrypt(
      process.env.AWS_SECRET_KEY || '',
      encryptionKey,
      Buffer.from('aws_api')
    ),
  },
};

// Function to get decrypted configuration
function getDecryptedConfig() {
  try {
    return {
      database: {
        ...secureConfig.database,
        password: decrypt(secureConfig.database.password, encryptionKey),
      },

      externalServices: {
        stripe: decrypt(
          secureConfig.externalServices.stripe,
          encryptionKey,
          Buffer.from('stripe_api')
        ),
        sendgrid: decrypt(
          secureConfig.externalServices.sendgrid,
          encryptionKey,
          Buffer.from('sendgrid_api')
        ),
        aws: decrypt(
          secureConfig.externalServices.aws,
          encryptionKey,
          Buffer.from('aws_api')
        ),
      },
    };
  } catch (error) {
    console.error('Configuration decryption failed:', error);
    throw new Error('Failed to load secure configuration');
  }
}

// Helper functions
function safeDecryptUser(encryptedUser, key, aad) {
  try {
    const decryptedUser = {
      id: encryptedUser.id,
      email: encryptedUser.email,
      name: encryptedUser.name,
      ssn: decrypt(encryptedUser.ssn, key, aad),
      phone: decrypt(encryptedUser.phone, key, aad),
      address: encryptedUser.address
        ? JSON.parse(decrypt(encryptedUser.address, key, aad))
        : null,
      createdAt: encryptedUser.createdAt,
      updatedAt: encryptedUser.updatedAt,
      status: encryptedUser.status,
    };

    return { success: true, user: decryptedUser, error: null };
  } catch (error) {
    return {
      success: false,
      user: null,
      error: {
        message: error.message,
        type: error.message.includes('Authentication failed')
          ? 'TAMPERED_DATA'
          : 'DECRYPTION_ERROR',
      },
    };
  }
}

// Simulated database functions
async function saveUser(user) {
  // In real app: await database.users.upsert(user);
  console.log('Saving user (encrypted sensitive data):', {
    id: user.id,
    email: user.email,
    name: user.name,
    hasEncryptedSSN: !!user.ssn,
    hasEncryptedPhone: !!user.phone,
    hasEncryptedAddress: !!user.address,
  });
}

async function getUser(userId) {
  // In real app: return await database.users.findById(userId);
  // Simulate returning encrypted user data
  const aad = Buffer.from(userId, 'utf8');

  return {
    id: userId,
    email: 'user@example.com',
    name: 'John Doe',
    ssn: encrypt('123456789', encryptionKey, aad),
    phone: encrypt('5551234567', encryptionKey, aad),
    address: encrypt(
      JSON.stringify({
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      }),
      encryptionKey,
      aad
    ),
    createdAt: new Date('2023-01-01'),
    status: 'active',
  };
}

app.listen(3000, () => {
  console.log('Secure user management API started on http://localhost:3000');

  // Log configuration status (don't log actual keys!)
  try {
    const config = getDecryptedConfig();
    console.log('Configuration loaded successfully');
    console.log(
      'External services configured:',
      Object.keys(config.externalServices)
    );
  } catch (error) {
    console.error('Configuration load failed:', error.message);
  }
});
```

**When to implement this comprehensive approach:**

- **Healthcare Applications**: For protecting patient data and medical records
- **Financial Services**: For encrypting sensitive financial information and
  transactions
- **HR Systems**: For protecting employee personal information and payroll data
- **Legal Applications**: For protecting client confidentiality and case
  information
- **Any Application Handling PII**: When storing or processing personally
  identifiable information

## Complete Integration Example

Here's a production-ready Express application that combines all security
features:

````javascript
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import {
  // CSRF Protection
  generateCsrfToken,
  createCsrfMiddleware,

  // Rate Limiting
  createRateLimiter,

  // Input Sanitization
  sanitizeHtml,
  escapeString,
  sanitizeFilename,

  // Data Encryption
  generateEncryptionKey,
  encrypt,
  decrypt,
} from '@voilajsx/appkit/security';

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict',
  },
}));

// Encryption setup
const encryptionKey = process.env.ENCRYPTION_KEY || generateEncryptionKey();

// Rate limiters for different endpoints
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous limit for general use
  message: 'Too many requests, please try again later.',
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit for authentication
  message: {
    error: 'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

const apiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // API requests per hour
  keyGenerator: (req) => {
    // Use API key if available, otherwise IP
    return req.headers['x-api-key'] || req.ip;
  },
});

// CSRF protection
const csrf = createCsrfMiddleware();

// Apply rate limiting
app.use('/auth/', authLimiter);
app.use('/api/', apiLimiter);
app.use(generalLimiter);

// Apply CSRF protection to state-changing routes
app.use(csrf);

// Add CSRF token to all responses
app.use((req, res, next) => {
  if (req.session) {
    res.locals.csrfToken = generateCsrfToken(req.session);
  }
  next();
});

// Routes

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Secure Application Demo</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .feature { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .security-badge { background: #e8f5e8; color: #2d5a2d; padding: 5px 10px; border-radius: 3px; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <h1>🔐 Secure Application Demo</h1>
      <p>This application demonstrates comprehensive security implementation using @voilajsx/appkit/security.</p>

      <h2>Security Features Active:</h2>
      <div class="feature">
        <h3>🛡️ CSRF Protection</h3>
        <span class="security-badge">ACTIVE</span>
        <p>All forms and state-changing operations are protected against Cross-Site Request Forgery attacks.</p>
      </div>

      <div class="feature">
        <h3>⏱️ Rate Limiting</h3>
        <span class="security-badge">ACTIVE</span>
        <p>API endpoints are protected against abuse with intelligent rate limiting.</p>
      </div>

     ```javascript
      <div class="feature">
        <h3>🧹 Input Sanitization</h3>
        <span class="security-badge">ACTIVE</span>
        <p>All user input is sanitized to prevent XSS and injection attacks.</p>
      </div>

      <div class="feature">
        <h3>🔐 Data Encryption</h3>
        <span class="security-badge">ACTIVE</span>
        <p>Sensitive data is encrypted using AES-256-GCM with authenticated encryption.</p>
      </div>

      <h2>Try It Out:</h2>
      <ul>
        <li><a href="/demo/form">Protected Form Demo</a></li>
        <li><a href="/demo/comments">Comment System Demo</a></li>
        <li><a href="/api/status">API Status (Rate Limited)</a></li>
        <li><a href="/demo/encryption">Encryption Demo</a></li>
      </ul>
    </body>
    </html>
  `);
});

// Protected form demo
app.get('/demo/form', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Protected Form Demo</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        form { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        input, textarea, select { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #005a8b; }
        .security-info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>🛡️ Protected Form Demo</h1>

      <div class="security-info">
        <strong>Security Features:</strong>
        <ul>
          <li>CSRF token protection</li>
          <li>Input sanitization</li>
          <li>Rate limiting</li>
          <li>Data encryption for sensitive fields</li>
        </ul>
      </div>

      <form method="POST" action="/demo/form">
        <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">

        <label>Name (will be escaped):</label>
        <input type="text" name="name" placeholder="Enter your name" required>

        <label>Bio (HTML will be sanitized):</label>
        <textarea name="bio" placeholder="Tell us about yourself (basic HTML allowed)" rows="4"></textarea>

        <label>Sensitive Data (will be encrypted):</label>
        <input type="text" name="sensitive" placeholder="This will be encrypted before storage">

        <label>Profile Type:</label>
        <select name="profileType">
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="business">Business</option>
        </select>

        <button type="submit">Submit Secure Form</button>
      </form>

      <p><a href="/">← Back to Home</a></p>
    </body>
    </html>
  `);
});

// Process protected form
app.post('/demo/form', async (req, res) => {
  try {
    const { name, bio, sensitive, profileType } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      name: escapeString(name?.trim() || ''),
      bio: sanitizeHtml(bio || '', {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      }),
      profileType: escapeString(profileType || 'public'),
    };

    // Encrypt sensitive data
    let encryptedSensitive = null;
    if (sensitive?.trim()) {
      const aad = Buffer.from('demo_form_data', 'utf8');
      encryptedSensitive = encrypt(sensitive.trim(), encryptionKey, aad);
    }

    // Simulate saving to database
    const savedData = {
      ...sanitizedData,
      sensitiveData: encryptedSensitive,
      submittedAt: new Date(),
      id: `demo_${Date.now()}`,
    };

    console.log('Form submission processed:', {
      id: savedData.id,
      name: savedData.name,
      hasSensitiveData: !!savedData.sensitiveData,
      submittedAt: savedData.submittedAt,
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Form Submitted Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { background: #e8f5e8; color: #2d5a2d; padding: 15px; border-radius: 5px; }
          .data-preview { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          pre { background: #fff; padding: 10px; border-radius: 3px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="success">
          <h2>✅ Form Submitted Successfully!</h2>
          <p>Your data has been processed securely with all protection measures active.</p>
        </div>

        <div class="data-preview">
          <h3>Processed Data Preview:</h3>
          <p><strong>Name:</strong> ${sanitizedData.name}</p>
          <p><strong>Bio:</strong> ${sanitizedData.bio}</p>
          <p><strong>Profile Type:</strong> ${sanitizedData.profileType}</p>
          <p><strong>Sensitive Data:</strong> ${encryptedSensitive ? '🔐 Encrypted and stored securely' : 'None provided'}</p>
          <p><strong>Submission ID:</strong> ${savedData.id}</p>
        </div>

        <p><a href="/demo/form">← Submit Another Form</a> | <a href="/">Home</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Form processing error:', error);
    res.status(500).send(`
      <h1>❌ Error</h1>
      <p>Something went wrong processing your form. Please try again.</p>
      <p><a href="/demo/form">← Try Again</a></p>
    `);
  }
});

// Comment system demo
app.get('/demo/comments', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Comment System Demo</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .comment-form { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .comment { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
        .security-note { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>💬 Comment System Demo</h1>

      <div class="security-note">
        <strong>Security Note:</strong> This comment system demonstrates HTML sanitization.
        Try submitting comments with HTML tags to see how they're safely processed.
      </div>

      <div class="comment-form">
        <h3>Leave a Comment</h3>
        <form method="POST" action="/demo/comments">
          <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">

          <input type="text" name="author" placeholder="Your name" required>
          <input type="email" name="email" placeholder="Your email (optional)">
          <textarea name="comment" placeholder="Your comment (basic HTML allowed: &lt;b&gt;, &lt;i&gt;, &lt;em&gt;, &lt;strong&gt;, &lt;a&gt;)" rows="4" required></textarea>

          <button type="submit">Post Comment</button>
        </form>
      </div>

      <h3>Sample Comments (Sanitized)</h3>
      <div class="comment">
        <strong>Security Demo</strong>
        <p>This comment shows how <strong>basic formatting</strong> is preserved while <em>dangerous content</em> is removed.</p>
        <small>Posted: Just now</small>
      </div>

      <p><a href="/">← Back to Home</a></p>
    </body>
    </html>
  `);
});

// Process comments
app.post('/demo/comments', (req, res) => {
  try {
    const { author, email, comment } = req.body;

    // Sanitize comment data
    const sanitizedComment = {
      author: escapeString(author?.trim() || 'Anonymous'),
      email: email ? escapeString(email.trim()) : '',
      comment: sanitizeHtml(comment || '', {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
        allowedAttributes: {
          'a': ['href', 'title'],
        },
      }),
      timestamp: new Date(),
      id: `comment_${Date.now()}`,
    };

    // Validate
    if (!sanitizedComment.comment.trim()) {
      throw new Error('Comment cannot be empty');
    }

    console.log('Comment processed:', sanitizedComment);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comment Posted</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { background: #e8f5e8; color: #2d5a2d; padding: 15px; border-radius: 5px; }
          .comment-preview { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="success">
          <h2>✅ Comment Posted Successfully!</h2>
          <p>Your comment has been sanitized and is safe to display.</p>
        </div>

        <div class="comment-preview">
          <h3>Your Comment Preview:</h3>
          <p><strong>Author:</strong> ${sanitizedComment.author}</p>
          <p><strong>Comment:</strong> ${sanitizedComment.comment}</p>
          <p><strong>Posted:</strong> ${sanitizedComment.timestamp.toLocaleString()}</p>
        </div>

        <p><a href="/demo/comments">← Post Another Comment</a> | <a href="/">Home</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Comment processing error:', error);
    res.status(400).send(`
      <h1>❌ Error</h1>
      <p>Error processing comment: ${escapeString(error.message)}</p>
      <p><a href="/demo/comments">← Try Again</a></p>
    `);
  }
});

// API status endpoint (rate limited)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    security: {
      rateLimiting: 'active',
      encryption: 'active',
      inputSanitization: 'active',
      csrfProtection: 'active',
    },
    rateLimit: {
      remaining: res.getHeader('X-RateLimit-Remaining'),
      reset: res.getHeader('X-RateLimit-Reset'),
    },
  });
});

// Encryption demo
app.get('/demo/encryption', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Encryption Demo</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .demo-section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .result { background: #fff; padding: 15px; border-radius: 5px; margin: 10px 0; border: 1px solid #ddd; }
        .encrypted { font-family: monospace; word-break: break-all; background: #f0f0f0; padding: 10px; }
      </style>
    </head>
    <body>
      <h1>🔐 Encryption Demo</h1>
      <p>This demo shows how sensitive data is encrypted and decrypted using AES-256-GCM.</p>

      <div class="demo-section">
        <h3>Encrypt Data</h3>
        <form method="POST" action="/demo/encrypt">
          <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
          <textarea name="plaintext" placeholder="Enter text to encrypt" rows="3" required></textarea>
          <input type="text" name="context" placeholder="Context (optional - for Associated Data)">
          <button type="submit">🔒 Encrypt</button>
        </form>
      </div>

      <div class="demo-section">
        <h3>Decrypt Data</h3>
        <form method="POST" action="/demo/decrypt">
          <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
          <textarea name="encrypted" placeholder="Enter encrypted data to decrypt" rows="3" required></textarea>
          <input type="text" name="context" placeholder="Context (must match encryption context)">
          <button type="submit">🔓 Decrypt</button>
        </form>
      </div>

      <p><a href="/">← Back to Home</a></p>
    </body>
    </html>
  `);
});

// Encrypt demo endpoint
app.post('/demo/encrypt', (req, res) => {
  try {
    const { plaintext, context } = req.body;

    if (!plaintext?.trim()) {
      throw new Error('Plaintext is required');
    }

    // Use context for Associated Data if provided
    const aad = context?.trim() ? Buffer.from(context.trim(), 'utf8') : null;
    const encrypted = encrypt(plaintext.trim(), encryptionKey, aad);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Encryption Result</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .result { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .encrypted { font-family: monospace; word-break: break-all; background: #f0f0f0; padding: 15px; border-radius: 5px; }
          .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>🔒 Encryption Successful</h1>

        <div class="result">
          <h3>Original Text:</h3>
          <p>${escapeString(plaintext)}</p>

          <h3>Context Used:</h3>
          <p>${context?.trim() ? escapeString(context) : 'None'}</p>

          <h3>Encrypted Data:</h3>
          <div class="encrypted">${encrypted}</div>
        </div>

        <div class="info">
          <strong>Note:</strong> This encrypted data can only be decrypted with the correct key
          ${context?.trim() ? 'and matching context' : ''}. Copy the encrypted data above to test decryption.
        </div>

        <p><a href="/demo/encryption">← Try Another Encryption</a> | <a href="/">Home</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(400).send(`
      <h1>❌ Encryption Failed</h1>
      <p>Error: ${escapeString(error.message)}</p>
      <p><a href="/demo/encryption">← Try Again</a></p>
    `);
  }
});

// Decrypt demo endpoint
app.post('/demo/decrypt', (req, res) => {
  try {
    const { encrypted, context } = req.body;

    if (!encrypted?.trim()) {
      throw new Error('Encrypted data is required');
    }

    // Use context for Associated Data if provided
    const aad = context?.trim() ? Buffer.from(context.trim(), 'utf8') : null;
    const decrypted = decrypt(encrypted.trim(), encryptionKey, aad);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Decryption Result</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .result { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .decrypted { background: #fff; padding: 15px; border-radius: 5px; border: 2px solid #4caf50; }
        </style>
      </head>
      <body>
        <h1>🔓 Decryption Successful</h1>

        <div class="result">
          <h3>Context Used:</h3>
          <p>${context?.trim() ? escapeString(context) : 'None'}</p>

          <h3>Decrypted Text:</h3>
          <div class="decrypted">${escapeString(decrypted)}</div>
        </div>

        <p><a href="/demo/encryption">← Try Another Encryption/Decryption</a> | <a href="/">Home</a></p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Decryption error:', error);

    let errorMessage = error.message;
    let suggestion = '';

    if (error.message.includes('Authentication failed')) {
      suggestion = 'This usually means the data was tampered with, the wrong key was used, or the context doesn\'t match.';
    } else if (error.message.includes('Invalid encrypted data format')) {
      suggestion = 'Make sure you\'re using properly formatted encrypted data from the encryption demo.';
    }

    res.status(400).send(`
      <h1>❌ Decryption Failed</h1>
      <p><strong>Error:</strong> ${escapeString(errorMessage)}</p>
      ${suggestion ? `<p><strong>Suggestion:</strong> ${suggestion}</p>` : ''}
      <p><a href="/demo/encryption">← Try Again</a></p>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Application error:', err);

  // Handle specific error types
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(`
      <h1>🛡️ Security Error</h1>
      <p>Invalid security token. This can happen if:</p>
      <ul>
        <li>You took too long to submit the form</li>
        <li>You opened the form in multiple tabs</li>
        <li>Your session expired</li>
      </ul>
      <p><a href="${req.originalUrl || '/'}">Please try again</a></p>
    `);
  }

  if (err.status === 429) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter: err.retryAfter || 'in a few minutes',
    });
  }

  // Generic error response
  res.status(500).send(`
    <h1>❌ Something went wrong</h1>
    <p>An unexpected error occurred. Please try again later.</p>
    <p><a href="/">← Return Home</a></p>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <h1>🔍 Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <p><a href="/">← Return Home</a></p>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Secure application started on http://localhost:${PORT}`);
  console.log('\n🔐 Security Features Active:');
  console.log('  ✅ CSRF Protection');
  console.log('  ✅ Rate Limiting');
  console.log('  ✅ Input Sanitization');
  console.log('  ✅ Data Encryption');
  console.log('  ✅ Security Headers');

  if (!process.env.ENCRYPTION_KEY) {
    console.log('\n⚠️  WARNING: Using generated encryption key for demo purposes');
    console.log('   In production, set ENCRYPTION_KEY environment variable');
  }

  if (!process.env.SESSION_SECRET) {
    console.log('⚠️  WARNING: Using default session secret for demo purposes');
    console.log('   In production, set SESSION_SECRET environment variable');
  }
});
````

**When to implement this comprehensive approach:**

- **Production Web Applications**: For applications that need multiple layers of
  security protection
- **Enterprise Applications**: When building applications that handle sensitive
  business data
- **Customer-Facing Platforms**: For applications where users submit and manage
  personal information
- **Compliance Requirements**: When applications need to meet security standards
  like GDPR, HIPAA, or PCI DSS

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/security/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- **Environment Variables**: Store all secrets (JWT secrets, encryption keys,
  session secrets) in environment variables, never in code
- **HTTPS Only**: Always use HTTPS in production to protect data in transit
- **Key Management**: Implement proper key rotation and use dedicated key
  management services for production
- **Input Validation**: Validate all inputs on both client and server side
- **Defense in Depth**: Apply multiple security layers rather than relying on a
  single protection method
- **Error Handling**: Never expose sensitive information in error messages to
  clients
- **Security Headers**: Use security headers to protect against common attacks
- **Regular Updates**: Keep all dependencies updated and monitor for security
  vulnerabilities

### 🏗️ Architecture

- **Separation of Concerns**: Keep security logic separate from business logic
  for maintainability
- **Middleware Approach**: Use middleware for cross-cutting security concerns
  like CSRF and rate limiting
- **Centralized Configuration**: Centralize security configuration to ensure
  consistency across the application
- **Logging and Monitoring**: Log security events for monitoring and incident
  response
- **Graceful Degradation**: Ensure the application handles security failures
  gracefully
- **Testing**: Include security testing in your test suite

### 🚀 Performance

- **Rate Limit Storage**: For high-traffic applications, use Redis or similar
  for distributed rate limiting
- **Encryption Caching**: Cache frequently used encryption keys rather than
  regenerating them
- **Sanitization Optimization**: For applications with heavy user-generated
  content, consider caching sanitized content
- **Async Operations**: Use async/await properly with all security operations
- **Resource Limits**: Set appropriate limits on request sizes and processing
  times

### 👥 User Experience

- **Clear Error Messages**: Provide helpful error messages that guide users
  without revealing security details
- **Progressive Enhancement**: Apply security measures without breaking the user
  experience
- **Performance Impact**: Monitor the performance impact of security measures
  and optimize as needed
- **Accessibility**: Ensure security measures don't negatively impact
  accessibility
- **Mobile Considerations**: Test security features on mobile devices and slower
  connections

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
