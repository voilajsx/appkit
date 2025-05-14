# @voilajs/appkit/security - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Check parameters before using them
   - Throw descriptive error messages
   - Use try/catch blocks where appropriate

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Middleware patterns should be adaptable

## Function Signatures

### 1. `generateCsrfToken`

```typescript
function generateCsrfToken(
  session: Record<string, any>,
  expiryMinutes?: number
): string;
```

- Default `expiryMinutes`: `60`
- Throws: `'Session object is required'`

### 2. `validateCsrfToken`

```typescript
function validateCsrfToken(
  token: string,
  session: Record<string, any>
): boolean;
```

### 3. `createCsrfMiddleware`

```typescript
function createCsrfMiddleware(options?: {
  tokenField?: string;
  headerField?: string;
}): Function;
```

- Default `tokenField`: `'_csrf'`
- Default `headerField`: `'x-csrf-token'`

### 4. `createRateLimiter`

```typescript
function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: any) => string;
  store?: Map<string, any>;
}): Function;
```

- Default `message`: `'Too many requests, please try again later.'`
- Default `keyGenerator`: IP address function
- Default `store`: In-memory Map
- Throws: `'windowMs and max are required options'`

### 5. `escapeString`

```typescript
function escapeString(input: string): string;
```

### 6. `sanitizeHtml`

```typescript
function sanitizeHtml(
  input: string,
  options?: {
    stripAllTags?: boolean;
    allowedTags?: string[];
  }
): string;
```

- Default `stripAllTags`: `false`

### 7. `sanitizeFilename`

```typescript
function sanitizeFilename(filename: string): string;
```

## Example Implementations

### CSRF Protection

```javascript
/**
 * Creates CSRF protection for a form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function setupCsrfProtection(req, res) {
  /**
   * Generates and sets CSRF token
   * @returns {string} CSRF token
   */
  function generateToken() {
    const token = generateCsrfToken(req.session);
    res.locals.csrfToken = token;
    return token;
  }

  /**
   * Validates submitted CSRF token
   * @param {string} token - Token to validate
   * @returns {boolean} True if valid
   */
  function validateToken(token) {
    return validateCsrfToken(token, req.session);
  }

  // Generate token and add to response
  const token = generateToken();

  // Add hidden field to form
  return `<input type="hidden" name="_csrf" value="${token}">`;
}

/**
 * Sets up CSRF middleware for an Express app
 * @param {Object} app - Express app
 */
function configureCsrf(app) {
  const csrf = createCsrfMiddleware({
    tokenField: '_csrf',
    headerField: 'x-csrf-token',
  });

  // Skip CSRF for API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/public/')) {
      return next();
    }
    csrf(req, res, next);
  });
}
```

### Rate Limiting

```javascript
/**
 * Configures rate limiting for an Express app
 * @param {Object} app - Express app
 */
function configureRateLimits(app) {
  // General API rate limit
  const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  });

  // Stricter login rate limit
  const loginLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 login attempts per hour
    message: 'Too many login attempts, please try again later',
    keyGenerator: (req) => {
      // Rate limit by username + IP for login attempts
      return `${req.body.username}:${req.ip}`;
    },
  });

  // Apply rate limiters
  app.use('/api/', apiLimiter);
  app.post('/auth/login', loginLimiter);
}
```

### Input Sanitization

```javascript
/**
 * Sanitizes user input for safe storage and display
 * @param {Object} input - User input object
 * @returns {Object} Sanitized object
 */
function sanitizeUserInput(input) {
  const { name, bio, website, filename } = input;

  // Create sanitized object
  const sanitized = {
    // Basic text sanitization for display
    name: escapeString(name || ''),

    // HTML content with restricted tags
    bio: sanitizeHtml(bio || '', {
      allowedTags: ['p', 'b', 'i', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    }),

    // URL sanitization
    website: (() => {
      const url = website || '';
      // Only allow http/https URLs
      if (!/^https?:\/\//i.test(url)) {
        return '';
      }
      return escapeString(url);
    })(),

    // Filename sanitization
    filename: sanitizeFilename(filename || ''),
  };

  return sanitized;
}
```

### Complete Security Configuration

```javascript
/**
 * Configures security middleware for an Express app
 * @param {Object} app - Express app
 */
function configureSecurityMiddleware(app) {
  // Session configuration (required for CSRF)
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
      },
    })
  );

  // CSRF protection
  const csrf = createCsrfMiddleware();
  app.use((req, res, next) => {
    // Skip for API endpoints that use other auth methods
    if (req.path.startsWith('/api/v1/')) {
      return next();
    }
    csrf(req, res, next);
  });

  // Generate CSRF tokens for templates
  app.use((req, res, next) => {
    res.locals.csrfToken = generateCsrfToken(req.session);
    next();
  });

  // Rate limiting
  const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP per 15 minutes
  });

  app.use('/api/', apiLimiter);

  // Error handler for CSRF errors
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        error: 'Invalid or expired security token',
        message: 'Please refresh the page and try again',
      });
    }
    next(err);
  });
}
```

## Code Generation Rules

1. **Check inputs**: Always validate all function parameters
2. **Handle special cases**: Consider empty strings, null values, etc.
3. **Avoid sync operations** for file system or network operations
4. **Use environment variables** for configuration
5. **Follow security best practices** in examples
6. **Include proper error handling** in all examples

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
