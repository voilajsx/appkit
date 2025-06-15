# @voilajsx/appkit/security - LLM API Reference

**Note**: Implementation is in JavaScript. TypeScript signatures are for
reference only.

## LLM Code Generation Guidelines

1. **File Header Comments** (Required for all files):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/security
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
   - **Inline comments**: Only for complex security logic
   - **No basic comments**: Avoid obvious comments
   - **Focus on minimal file size**: Comment only when necessary

5. **Security Philosophy**:
   - Use the 8 security functions consistently
   - Always include environment variable support
   - Create standard Error objects with statusCode
   - Focus on production-ready implementations

## Function Signatures

### 1. Form Protection (1 function)

```typescript
function protectForms(secret?: string, options?: object): ExpressMiddleware;
```

**Environment Variables:**

- `VOILA_CSRF_SECRET` - CSRF secret key (required)
- `VOILA_CSRF_FIELD` - Form field name (default: '\_csrf')
- `VOILA_CSRF_HEADER` - Header name (default: 'x-csrf-token')
- `VOILA_CSRF_EXPIRY` - Token expiry in minutes (default: 60)

### 2. Rate Limiting (1 function)

```typescript
function limitRequests(
  maxRequests?: number,
  windowMs?: number,
  options?: object
): ExpressMiddleware;
```

**Environment Variables:**

- `VOILA_RATE_LIMIT` - Max requests per window (default: 100)
- `VOILA_RATE_WINDOW` - Time window in milliseconds (default: 900000)
- `VOILA_RATE_MESSAGE` - Custom error message

### 3. Input Safety (3 functions)

```typescript
function cleanInput(text: string, options?: object): string;
function cleanHtml(html: string, options?: object): string;
function escapeHtml(text: string): string;
```

**Environment Variables:**

- `VOILA_MAX_INPUT_LENGTH` - Maximum input length (default: 1000)
- `VOILA_ALLOWED_TAGS` - Comma-separated allowed HTML tags
- `VOILA_STRIP_ALL_TAGS` - Strip all HTML tags (default: false)

### 4. Data Encryption (3 functions)

```typescript
function generateKey(): string;
function encryptData(
  data: string | Buffer,
  key?: string,
  associatedData?: Buffer
): string;
function decryptData(
  encryptedData: string,
  key?: string,
  associatedData?: Buffer
): string;
```

**Environment Variables:**

- `VOILA_ENCRYPTION_KEY` - 256-bit encryption key as hex string (required)

## Basic Usage Examples

### CSRF Protection

```javascript
import { protectForms } from '@voilajsx/appkit/security';

// Auto-protect all forms
app.use(protectForms()); // Uses VOILA_CSRF_SECRET

// Generate tokens in forms
app.get('/contact', (req, res) => {
  const csrfToken = req.csrfToken(); // Added by middleware
  res.render('contact', { csrfToken });
});
```

### Rate Limiting

```javascript
import { limitRequests } from '@voilajsx/appkit/security';

// Global API rate limiting
app.use('/api', limitRequests()); // Uses VOILA_RATE_LIMIT + VOILA_RATE_WINDOW

// Strict login protection
app.use('/auth/login', limitRequests(5, 3600000)); // 5 attempts per hour
```

### Input Sanitization

```javascript
import { cleanInput, cleanHtml, escapeHtml } from '@voilajsx/appkit/security';

// Basic input cleaning
const cleanEmail = cleanInput(req.body.email);

// Rich text with allowed HTML
const safeBio = cleanHtml(req.body.bio, {
  allowedTags: ['p', 'b', 'i', 'a'],
});

// Safe text display
const safeComment = escapeHtml(userComment);
```

### Data Encryption

```javascript
import {
  encryptData,
  decryptData,
  generateKey,
} from '@voilajsx/appkit/security';

// Generate key (one-time setup)
const key = generateKey();

// Encrypt sensitive data
const encryptedSSN = encryptData(user.ssn); // Uses VOILA_ENCRYPTION_KEY

// Decrypt when needed
const originalSSN = decryptData(encryptedSSN);
```

## Complete Security Setup Example

```javascript
/**
 * Secure Express application with comprehensive protection
 * @module @voilajsx/appkit/security
 * @file examples/secure-app.js
 */

import express from 'express';
import session from 'express-session';
import {
  protectForms,
  limitRequests,
  cleanInput,
  cleanHtml,
  encryptData,
  decryptData,
} from '@voilajsx/appkit/security';

/**
 * Creates secure Express application with full protection
 * @returns {Object} Configured Express application
 */
function createSecureApp() {
  const app = express();

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
  app.use(protectForms()); // CSRF protection
  app.use('/api', limitRequests()); // Rate limiting

  return app;
}

/**
 * Secure user registration with input validation and encryption
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const registerUser = async (req, res) => {
  try {
    // Clean and validate input
    const email = cleanInput(req.body.email?.toLowerCase());
    const name = cleanInput(req.body.name, { maxLength: 50 });
    const bio = cleanHtml(req.body.bio, {
      allowedTags: ['p', 'b', 'i'],
    });

    // Encrypt sensitive data
    const encryptedPhone = encryptData(req.body.phone);

    const user = await db.createUser({
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

## Error Handling Patterns

### Standard Error Objects

```javascript
// All security functions throw standard Error objects
try {
  const encrypted = encryptData(sensitiveData);
} catch (error) {
  // Error has statusCode property
  console.log(`Security Error ${error.statusCode}: ${error.message}`);
}
```

### Error Status Codes

- **400** - Invalid input format or parameters
- **401** - Authentication failure (tampered data)
- **403** - Access denied (CSRF, rate limit exceeded)
- **429** - Rate limit exceeded (with retryAfter property)
- **500** - Server configuration error

## Environment Configuration Patterns

### Required Environment Variables

```bash
# CSRF Protection (required)
VOILA_CSRF_SECRET=your-csrf-secret-key

# Data Encryption (required for encryption functions)
VOILA_ENCRYPTION_KEY=your-256-bit-hex-key
```

### Optional Environment Variables

```bash
# CSRF Settings
VOILA_CSRF_FIELD=_csrf
VOILA_CSRF_EXPIRY=60

# Rate Limiting
VOILA_RATE_LIMIT=100
VOILA_RATE_WINDOW=900000

# Input Sanitization
VOILA_MAX_INPUT_LENGTH=1000
VOILA_ALLOWED_TAGS=p,b,i,a
```

## Security Implementation Patterns

### CSRF Token Flow

```javascript
// Form rendering with token
app.get('/form', (req, res) => {
  const csrfToken = req.csrfToken();
  res.render('form', { csrfToken });
});

// Automatic verification on submission
app.post('/form', (req, res) => {
  // CSRF already verified by protectForms() middleware
  // Process form data safely
});
```

### Rate Limiting with Custom Logic

```javascript
// Different limits for different endpoints
app.use('/auth', limitRequests(5, 3600000)); // 5/hour for auth
app.use('/api/upload', limitRequests(10, 60000)); // 10/minute for uploads
app.use('/api', limitRequests(100, 900000)); // 100/15min for general API
```

### Input Sanitization Levels

```javascript
// Level 1: Basic cleaning
const cleanText = cleanInput(userInput);

// Level 2: HTML with allowed tags
const richText = cleanHtml(userInput, { allowedTags: ['p', 'b', 'i', 'a'] });

// Level 3: Complete escaping for display
const safeDisplay = escapeHtml(userInput);
```

### Encryption with Associated Data

```javascript
// Basic encryption
const encrypted = encryptData(sensitiveData);

// Encryption with context binding
const userId = 'user123';
const contextBound = encryptData(sensitiveData, null, Buffer.from(userId));
```

## Code Generation Rules

1. **Always include file header** with @module and @file tags
2. **Use JSDoc for all functions** with one clear sentence descriptions
3. **Use the 8 security functions consistently** based on protection needs
4. **Include environment variable usage** when relevant
5. **Create standard Error objects** with statusCode properties
6. **Focus on production-ready implementations** with proper validation
7. **Use generic `db` object** for database operations without imports
8. **Apply security middleware** in correct order for Express apps
9. **Focus on minimal file size** - avoid unnecessary comments
10. **Follow ESM import style** with single quotes and semicolons

## Common Security Patterns

### Authentication Flow Protection

```javascript
// Protect login form with CSRF and rate limiting
app.use('/auth', limitRequests(5, 3600000));
app.use('/auth', protectForms());

app.post('/auth/login', async (req, res) => {
  const email = cleanInput(req.body.email);
  const password = req.body.password;

  // Authenticate user...
});
```

### File Upload Security

```javascript
app.post('/upload', limitRequests(5, 60000), async (req, res) => {
  const filename = cleanInput(req.body.filename, {
    maxLength: 100,
    removeXSS: true,
  });

  // Process upload with clean filename...
});
```

### API Data Protection

```javascript
app.post('/api/users', async (req, res) => {
  try {
    const userData = {
      email: cleanInput(req.body.email),
      profile: cleanHtml(req.body.profile, { allowedTags: ['p', 'b', 'i'] }),
      ssn: encryptData(req.body.ssn),
    };

    const user = await db.createUser(userData);
    res.json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});
```

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
