# @voilajsx/appkit/security - LLM API Reference

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

### 8. `generateEncryptionKey`

```typescript
function generateEncryptionKey(lengthBytes?: number): string;
```

- Default `lengthBytes`: `32` (256-bit key for AES-256)
- Returns: Hexadecimal string
- Throws: `'Key length must be a positive number'`

### 9. `encrypt`

```typescript
function encrypt(
  plaintext: string | Buffer,
  key: string | Buffer,
  associatedData?: Buffer
): string;
```

- Returns: Combined hex string (IV:ciphertext:authTag)
- Throws: `'Plaintext cannot be empty'`, `'Invalid key length'`,
  `'Associated data must be a Buffer'`

### 10. `decrypt`

```typescript
function decrypt(
  encryptedData: string,
  key: string | Buffer,
  associatedData?: Buffer
): string;
```

- Returns: Decrypted plaintext as UTF-8 string
- Throws: `'Invalid encrypted data format'`, `'Authentication failed'`,
  `'Invalid key length'`

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

### Data Encryption

```javascript
/**
 * Sets up encryption utilities for an application
 * @returns {Object} Encryption utilities
 */
function setupEncryption() {
  // Generate or load encryption key
  const encryptionKey = process.env.ENCRYPTION_KEY || generateEncryptionKey();

  /**
   * Encrypts sensitive user data
   * @param {Object} userData - User data to encrypt
   * @param {string} userContext - Context for associated data
   * @returns {Object} Object with encrypted fields
   */
  function encryptUserData(userData, userContext) {
    const aad = Buffer.from(userContext, 'utf8');

    return {
      id: userData.id,
      email: userData.email, // Keep searchable fields unencrypted
      name: userData.name,

      // Encrypt sensitive fields
      ssn: userData.ssn ? encrypt(userData.ssn, encryptionKey, aad) : null,
      phone: userData.phone
        ? encrypt(userData.phone, encryptionKey, aad)
        : null,
      address: userData.address
        ? encrypt(JSON.stringify(userData.address), encryptionKey, aad)
        : null,
    };
  }

  /**
   * Decrypts user data
   * @param {Object} encryptedData - Encrypted user data
   * @param {string} userContext - Context for associated data
   * @returns {Object} Object with decrypted fields
   */
  function decryptUserData(encryptedData, userContext) {
    const aad = Buffer.from(userContext, 'utf8');

    try {
      return {
        id: encryptedData.id,
        email: encryptedData.email,
        name: encryptedData.name,

        // Decrypt sensitive fields
        ssn: encryptedData.ssn
          ? decrypt(encryptedData.ssn, encryptionKey, aad)
          : null,
        phone: encryptedData.phone
          ? decrypt(encryptedData.phone, encryptionKey, aad)
          : null,
        address: encryptedData.address
          ? JSON.parse(decrypt(encryptedData.address, encryptionKey, aad))
          : null,
      };
    } catch (error) {
      console.error('Decryption failed:', error.message);
      throw new Error('Failed to decrypt user data');
    }
  }

  /**
   * Encrypts configuration secrets
   * @param {Object} config - Configuration object
   * @returns {Object} Configuration with encrypted secrets
   */
  function encryptConfigSecrets(config) {
    const encryptedConfig = { ...config };

    // Encrypt database password
    if (config.database?.password) {
      encryptedConfig.database.password = encrypt(
        config.database.password,
        encryptionKey,
        Buffer.from('db_config', 'utf8')
      );
    }

    // Encrypt API keys
    if (config.apiKeys) {
      encryptedConfig.apiKeys = {};
      Object.entries(config.apiKeys).forEach(([service, key]) => {
        const aad = Buffer.from(`api_${service}`, 'utf8');
        encryptedConfig.apiKeys[service] = encrypt(key, encryptionKey, aad);
      });
    }

    return encryptedConfig;
  }

  return {
    encryptUserData,
    decryptUserData,
    encryptConfigSecrets,
    encryptionKey,
  };
}
```

### Complete Security Configuration

```javascript
/**
 * Configures comprehensive security middleware for an Express app
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
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Rate limiting configuration
  const generalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // General requests per window
    message: 'Too many requests, please try again later.',
  });

  const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Auth attempts per window
    message: 'Too many authentication attempts, please try again later.',
    keyGenerator: (req) => `${req.body.username || 'anonymous'}:${req.ip}`,
  });

  const apiLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // API requests per hour
    keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  });

  // Apply rate limiters
  app.use('/auth/', authLimiter);
  app.use('/api/', apiLimiter);
  app.use(generalLimiter);

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
    if (req.session) {
      res.locals.csrfToken = generateCsrfToken(req.session);
    }
    next();
  });

  // Setup encryption utilities
  const { encryptUserData, decryptUserData } = setupEncryption();

  // Add encryption utilities to app locals for easy access
  app.locals.encrypt = encryptUserData;
  app.locals.decrypt = decryptUserData;

  // Error handler for security-related errors
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        error: 'Invalid or expired security token',
        message: 'Please refresh the page and try again',
      });
    }

    if (err.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: err.retryAfter,
      });
    }

    next(err);
  });
}

/**
 * Creates a secure user registration handler
 * @param {Object} encryptionUtils - Encryption utilities
 * @returns {Function} Express route handler
 */
function createSecureUserRegistration(encryptionUtils) {
  return async (req, res) => {
    try {
      const { email, name, ssn, phone, address } = req.body;

      // Validate and sanitize inputs
      const sanitizedData = {
        email: escapeString(email?.toLowerCase().trim() || ''),
        name: escapeString(name?.trim() || ''),
        ssn: ssn?.replace(/\D/g, '') || '', // Remove non-digits
        phone: phone?.replace(/\D/g, '') || '', // Remove non-digits
        address: address || null,
      };

      // Validate required fields
      if (!sanitizedData.email || !sanitizedData.name) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Email and name are required',
        });
      }

      // Generate user ID and encrypt sensitive data
      const userId = `user_${Date.now()}`;
      const encryptedUser = encryptionUtils.encryptUserData(
        sanitizedData,
        userId
      );

      // Save user to database (implementation depends on your database)
      await saveUserToDatabase(encryptedUser);

      // Return success without sensitive data
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: userId,
          email: sanitizedData.email,
          name: sanitizedData.name,
        },
      });
    } catch (error) {
      console.error('User registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: 'Please try again later',
      });
    }
  };
}
```

## Code Generation Rules

1. **Always validate inputs**: Check all function parameters before using them
2. **Handle edge cases**: Consider empty strings, null values, undefined
3. **Use environment variables**: For secrets, keys, and configuration
4. **Include proper error handling**: Use try/catch blocks appropriately
5. **Follow security best practices**: Never expose sensitive data in responses
6. **Use JSDoc comments**: Document all functions with proper JSDoc format
7. **Encryption context**: Always use Associated Data (AAD) for context-bound
   encryption
8. **Key management**: Never hardcode encryption keys, always use environment
   variables
9. **Sanitize all inputs**: Apply appropriate sanitization for the context
   (display, storage, filename)
10. **Rate limiting strategy**: Apply different limits for different types of
    operations

## Security Implementation Patterns

### Pattern 1: Form Protection

```javascript
// Always combine CSRF protection with input sanitization
const csrf = createCsrfMiddleware();
app.use(csrf);

app.post('/submit', (req, res) => {
  const sanitizedData = {
    title: escapeString(req.body.title),
    content: sanitizeHtml(req.body.content, { allowedTags: ['p', 'b', 'i'] }),
  };
  // Process sanitized data
});
```

### Pattern 2: API Protection

```javascript
// Layer multiple protections for APIs
const apiLimiter = createRateLimiter({ windowMs: 60000, max: 100 });
app.use('/api', apiLimiter);

// Use different sanitization for API responses
app.get('/api/search', (req, res) => {
  const query = escapeString(req.query.q || '');
  // Return sanitized results
});
```

### Pattern 3: Sensitive Data Handling

```javascript
// Always encrypt sensitive data with context
const userContext = `user_${userId}`;
const aad = Buffer.from(userContext, 'utf8');
const encryptedSSN = encrypt(ssn, encryptionKey, aad);

// Decrypt with matching context
const decryptedSSN = decrypt(encryptedSSN, encryptionKey, aad);
```

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web  
</p>
