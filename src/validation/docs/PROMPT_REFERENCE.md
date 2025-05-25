# @voilajsx/appkit/validation - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions
   - Prefer async/await over callbacks or raw promises

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

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages
   - Handle validation errors gracefully

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Avoid dependencies on specific frameworks like Express

## Function Signatures

### 1. Core Validation Functions

#### `validate`

```typescript
function validate<T = any>(
  data: T,
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    context?: object;
    strict?: boolean;
  }
): {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    code: string;
    value: any;
  }>;
  value: T;
};
```

#### `validateAsync`

```typescript
async function validateAsync<T = any>(
  data: T,
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    context?: object;
    strict?: boolean;
    timeout?: number;
  }
): Promise<{
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    code: string;
    value: any;
  }>;
  value: T;
}>;
```

#### `createValidator`

```typescript
function createValidator<T = any>(
  schema: object,
  options?: {
    abortEarly?: boolean;
    allowUnknown?: boolean;
    stripUnknown?: boolean;
    context?: object;
    strict?: boolean;
  }
): (data: T) => {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    code: string;
    value: any;
  }>;
  value: T;
};
```

### 2. Core Sanitization Functions

#### `sanitize`

```typescript
function sanitize<T = any>(
  data: T,
  rules: object | Array<object> | ((data: T) => T)
): T;
```

#### `sanitizeString`

```typescript
function sanitizeString(
  input: string,
  rules?: {
    trim?: boolean;
    lowercase?: boolean;
    uppercase?: boolean;
    capitalize?: boolean;
    titleCase?: boolean;
    escape?: boolean;
    unescape?: boolean;
    stripTags?: boolean;
    truncate?: number;
    slug?: boolean;
    alphanumeric?: boolean;
    alpha?: boolean;
    numeric?: boolean;
    email?: boolean;
    url?: boolean;
    replace?: { [pattern: string]: string };
    remove?: string | string[];
    normalize?: boolean | string;
    whitespace?: 'single' | 'remove';
    linebreaks?: 'unix' | 'windows' | 'remove';
  }
): string;
```

#### `sanitizeHtml`

```typescript
function sanitizeHtml(
  input: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: { [tag: string]: string[] };
    allowedSchemes?: string[];
    stripEmpty?: boolean;
    maxLength?: number;
    allowDataAttributes?: boolean;
    allowClassNames?: boolean;
  }
): string;
```

#### `sanitizeNumber`

```typescript
function sanitizeNumber(
  input: any,
  rules?: {
    default?: number;
    integer?: boolean;
    round?: 'ceil' | 'floor' | 'round';
    min?: number;
    max?: number;
    clamp?: boolean;
    precision?: number;
    positive?: boolean;
    negative?: boolean;
    absolute?: boolean;
    finite?: boolean;
  }
): number;
```

#### `sanitizeArray`

```typescript
function sanitizeArray(
  input: any,
  rules?: {
    parse?: boolean;
    delimiter?: string;
    compact?: boolean;
    flatten?: boolean | number;
    unique?: boolean;
    uniqueBy?: string | ((item: any) => any);
    items?: object;
    skipInvalid?: boolean;
    filter?: (item: any, index: number) => boolean;
    sort?: boolean | string | ((a: any, b: any) => number);
    reverse?: boolean;
    limit?: number;
    offset?: number;
  }
): any[];
```

#### `sanitizeObject`

```typescript
function sanitizeObject(
  input: any,
  rules?: {
    parse?: boolean;
    defaults?: object;
    pick?: string[];
    omit?: string[];
    rename?: { [oldKey: string]: string };
    properties?: { [key: string]: object };
    skipInvalid?: boolean;
    filter?: (value: any, key: string) => boolean;
    mapKeys?: (key: string, value: any) => string;
    mapValues?: (value: any, key: string) => any;
    removeEmpty?: boolean;
    maxProperties?: number;
  }
): object;
```

#### `createSanitizer`

```typescript
function createSanitizer<T = any>(
  rules: object | Array<object> | ((data: T) => T)
): (data: T) => T;
```

### 3. Built-in Validators

#### `validateString`

```typescript
function validateString(
  input: string,
  rules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    exactLength?: number;
    pattern?: RegExp;
    enum?: string[];
    startsWith?: string;
    endsWith?: string;
    contains?: string;
    alphanumeric?: boolean;
    alpha?: boolean;
    numeric?: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
    email?: boolean;
    url?: boolean;
    uuid?: boolean;
    slug?: boolean;
    hexColor?: boolean;
    base64?: boolean;
    json?: boolean;
    custom?: (value: string) => boolean | string;
  }
): boolean;
```

#### `validateNumber`

```typescript
function validateNumber(
  input: number,
  rules?: {
    required?: boolean;
    min?: number;
    max?: number;
    exclusiveMin?: number;
    exclusiveMax?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    nonZero?: boolean;
    finite?: boolean;
    multipleOf?: number;
    precision?: number;
    enum?: number[];
    custom?: (value: number) => boolean | string;
  }
): boolean;
```

#### `validateEmail`

```typescript
function validateEmail(
  email: string,
  options?: {
    allowInternational?: boolean;
    allowSmtpUTF8?: boolean;
    maxLength?: number;
    blacklistDomains?: string[];
    whitelistDomains?: string[];
    requireTld?: boolean;
    allowLocal?: boolean;
  }
): boolean;
```

#### `validateUrl`

```typescript
function validateUrl(
  url: string,
  options?: {
    protocols?: string[];
    requireTld?: boolean;
    requireProtocol?: boolean;
    allowLocal?: boolean;
    allowPort?: boolean;
    allowQuery?: boolean;
    allowFragment?: boolean;
    maxLength?: number;
  }
): boolean;
```

#### `validatePhone`

```typescript
function validatePhone(
  phone: string,
  options?: {
    country?: string;
    format?: 'e164' | 'national' | 'international' | 'any';
    allowExtensions?: boolean;
    minLength?: number;
    maxLength?: number;
  }
): boolean;
```

### 4. Common Sanitizers

#### `sanitizeEmail`

```typescript
function sanitizeEmail(email: string): string;
```

#### `sanitizeUsername`

```typescript
function sanitizeUsername(username: string): string;
```

#### `sanitizePassword`

```typescript
function sanitizePassword(password: string): string;
```

#### `sanitizePhone`

```typescript
function sanitizePhone(
  phone: string,
  options?: { format?: 'e164' | 'national'; country?: string }
): string;
```

#### `sanitizeUrl`

```typescript
function sanitizeUrl(url: string): string;
```

#### `sanitizeSlug`

```typescript
function sanitizeSlug(slug: string): string;
```

#### `sanitizeSearch`

```typescript
function sanitizeSearch(query: string): string;
```

#### `sanitizeTags`

```typescript
function sanitizeTags(
  tags: string | string[],
  options?: { maxTags?: number; maxLength?: number; delimiter?: string }
): string[];
```

### 5. Schema Functions

#### `commonSchemas`

```typescript
const commonSchemas: {
  email: object;
  password: object;
  username: object;
  phone: object;
  url: object;
  id: object;
  uuid: object;
  slug: object;
  tags: object;
  date: object;
  integer: object;
  positiveInteger: object;
  percentage: object;
  address: object;
  coordinates: object;
  timeRange: object;
  pagination: object;
  searchQuery: object;
  fileUpload: object;
  creditCard: object;
  postalCode: object;
  hexColor: object;
  ipAddress: object;
  macAddress: object;
  domain: object;
  filename: object;
};
```

#### `createSchema`

```typescript
function createSchema(definition: object): object;
```

#### `mergeSchemas`

```typescript
function mergeSchemas(...schemas: object[]): object;
```

#### `extendSchema`

```typescript
function extendSchema(baseSchema: object, extension: object): object;
```

### 6. Error Handling

#### `ValidationError`

```typescript
class ValidationError extends Error {
  constructor(
    message: string,
    errors: Array<{
      path: string;
      message: string;
      code: string;
      value: any;
    }>
  );
  getMessages(): string[];
  getFieldErrors(field: string): Array<object>;
  hasFieldErrors(field: string): boolean;
  getErrorsByCode(code: string): Array<object>;
  toJSON(): object;
}
```

## Example Implementations

### Example 1: Basic User Registration Validation

```javascript
/**
 * Validates user registration data
 * @param {Object} userData - User registration data
 * @returns {Object} Validation result with clean data
 * @throws {ValidationError} If validation fails in strict mode
 */
function validateUserRegistration(userData) {
  if (!userData || typeof userData !== 'object') {
    throw new Error('User data must be an object');
  }

  try {
    // Define schema
    const schema = {
      type: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          maxLength: 20,
          pattern: /^[a-zA-Z0-9_]+$/,
        },
        email: {
          type: 'string',
          email: true,
          maxLength: 255,
        },
        password: {
          type: 'string',
          minLength: 8,
          pattern:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        },
        firstName: { type: 'string', minLength: 1, maxLength: 50 },
        lastName: { type: 'string', minLength: 1, maxLength: 50 },
      },
      additionalProperties: false,
    };

    // Sanitize first
    const cleanData = sanitize(userData, {
      username: { trim: true, lowercase: true },
      email: { trim: true, lowercase: true },
      firstName: { trim: true, capitalize: true },
      lastName: { trim: true, capitalize: true },
    });

    // Then validate
    const result = validate(cleanData, schema, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (!result.valid) {
      const error = new ValidationError(
        'User registration validation failed',
        result.errors
      );
      throw error;
    }

    return {
      success: true,
      data: result.value,
      message: 'User data is valid',
    };
  } catch (error) {
    console.error('User registration validation error:', error.message);
    throw error;
  }
}
```

### Example 2: API Request Sanitization and Validation

```javascript
/**
 * Creates a middleware for Express.js that sanitizes and validates API requests
 * @param {Object} schema - Validation schema
 * @param {Object} sanitizationRules - Sanitization rules
 * @returns {Function} Express middleware function
 */
function createValidationMiddleware(schema, sanitizationRules = {}) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema is required and must be an object');
  }

  const validator = createValidator(schema, {
    abortEarly: false,
    stripUnknown: true,
  });

  const sanitizer =
    Object.keys(sanitizationRules).length > 0
      ? createSanitizer(sanitizationRules)
      : null;

  return (req, res, next) => {
    try {
      // Sanitize request data if rules provided
      const dataToValidate = sanitizer ? sanitizer(req.body) : req.body;

      // Validate the data
      const result = validator(dataToValidate);

      if (result.valid) {
        req.validatedData = result.value;
        next();
      } else {
        // Format errors for API response
        const fieldErrors = {};
        result.errors.forEach((error) => {
          if (!fieldErrors[error.path]) {
            fieldErrors[error.path] = [];
          }
          fieldErrors[error.path].push({
            message: error.message,
            code: error.code,
            value: error.value,
          });
        });

        res.status(400).json({
          error: 'Validation failed',
          message: 'Please check your input and try again',
          fields: fieldErrors,
        });
      }
    } catch (error) {
      console.error('Validation middleware error:', error.message);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Validation processing failed',
      });
    }
  };
}
```

### Example 3: Async Validation with Database Checks

```javascript
/**
 * Validates user data with async database uniqueness checks
 * @param {Object} userData - User data to validate
 * @param {Object} database - Database connection object
 * @returns {Promise<Object>} Validation result
 * @throws {ValidationError} If validation fails
 */
async function validateUserWithAsyncChecks(userData, database) {
  if (!userData || typeof userData !== 'object') {
    throw new Error('User data must be an object');
  }

  if (!database) {
    throw new Error('Database connection is required');
  }

  try {
    const schema = {
      type: 'object',
      required: ['username', 'email'],
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          maxLength: 20,
          asyncValidator: async (username) => {
            const exists = await database.users.findOne({ username });
            return exists ? 'Username is already taken' : true;
          },
        },
        email: {
          type: 'string',
          email: true,
          asyncValidator: async (email) => {
            const exists = await database.users.findOne({ email });
            return exists ? 'Email is already registered' : true;
          },
        },
      },
    };

    // Sanitize data first
    const cleanData = sanitize(userData, {
      username: { trim: true, lowercase: true },
      email: { trim: true, lowercase: true },
    });

    // Perform async validation
    const result = await validateAsync(cleanData, schema, {
      timeout: 5000, // 5 second timeout
      abortEarly: false,
    });

    if (!result.valid) {
      throw new ValidationError('Async validation failed', result.errors);
    }

    return {
      success: true,
      data: result.value,
      message: 'User data validated successfully',
    };
  } catch (error) {
    console.error('Async validation error:', error.message);
    throw error;
  }
}
```

### Example 4: Content Sanitization for Blog Posts

```javascript
/**
 * Sanitizes and validates blog post content
 * @param {Object} postData - Blog post data
 * @returns {Object} Sanitized and validated post data
 * @throws {Error} If validation fails
 */
function sanitizeBlogPost(postData) {
  if (!postData || typeof postData !== 'object') {
    throw new Error('Post data must be an object');
  }

  try {
    // Define sanitization rules
    const sanitizationRules = {
      title: {
        trim: true,
        titleCase: true,
        stripTags: true,
        truncate: 100,
      },
      content: {
        // Will be handled by sanitizeHtml separately
      },
      excerpt: {
        stripTags: true,
        truncate: 300,
        whitespace: 'single',
      },
      tags: {
        compact: true,
        unique: true,
        items: { slug: true },
        limit: 10,
      },
      author: {
        trim: true,
        capitalize: true,
        stripTags: true,
      },
    };

    // Sanitize basic fields
    const sanitizedPost = sanitize(postData, sanitizationRules);

    // Sanitize HTML content separately with specific rules
    if (sanitizedPost.content) {
      sanitizedPost.content = sanitizeHtml(sanitizedPost.content, {
        allowedTags: [
          'p',
          'br',
          'strong',
          'em',
          'b',
          'i',
          'u',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'blockquote',
          'pre',
          'code',
          'a',
          'img',
        ],
        allowedAttributes: {
          a: ['href', 'title', 'target'],
          img: ['src', 'alt', 'title', 'width', 'height'],
          pre: ['class'],
          code: ['class'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        stripEmpty: true,
        maxLength: 50000,
      });
    }

    // Validate the sanitized data
    const schema = {
      type: 'object',
      required: ['title', 'content'],
      properties: {
        title: { type: 'string', minLength: 5, maxLength: 100 },
        content: { type: 'string', minLength: 50 },
        excerpt: { type: 'string', maxLength: 300 },
        tags: {
          type: 'array',
          maxItems: 10,
          items: { type: 'string', minLength: 2, maxLength: 30 },
        },
        author: { type: 'string', minLength: 1, maxLength: 100 },
      },
    };

    const validationResult = validate(sanitizedPost, schema);

    if (!validationResult.valid) {
      throw new ValidationError(
        'Blog post validation failed',
        validationResult.errors
      );
    }

    return {
      success: true,
      data: validationResult.value,
      message: 'Blog post sanitized and validated successfully',
    };
  } catch (error) {
    console.error('Blog post sanitization error:', error.message);
    throw error;
  }
}
```

### Example 5: Data Import Validation Pipeline

```javascript
/**
 * Validates and processes bulk data import
 * @param {Array} dataArray - Array of data objects to validate
 * @param {Object} schema - Validation schema
 * @param {Object} sanitizationRules - Sanitization rules
 * @returns {Promise<Object>} Processing results
 */
async function processBulkDataImport(
  dataArray,
  schema,
  sanitizationRules = {}
) {
  if (!Array.isArray(dataArray)) {
    throw new Error('Data must be an array');
  }

  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema is required and must be an object');
  }

  try {
    const validator = createValidator(schema, {
      abortEarly: false,
      stripUnknown: true,
    });

    const sanitizer =
      Object.keys(sanitizationRules).length > 0
        ? createSanitizer(sanitizationRules)
        : null;

    const results = {
      total: dataArray.length,
      valid: [],
      invalid: [],
      processed: 0,
    };

    // Process each item
    for (let i = 0; i < dataArray.length; i++) {
      try {
        const item = dataArray[i];

        // Sanitize if rules provided
        const cleanItem = sanitizer ? sanitizer(item) : item;

        // Validate
        const validationResult = validator(cleanItem);

        if (validationResult.valid) {
          results.valid.push({
            index: i,
            data: validationResult.value,
          });
        } else {
          results.invalid.push({
            index: i,
            data: item,
            errors: validationResult.errors,
          });
        }

        results.processed++;

        // Log progress for large datasets
        if (results.processed % 1000 === 0) {
          console.log(`Processed ${results.processed}/${results.total} items`);
        }
      } catch (error) {
        results.invalid.push({
          index: i,
          data: dataArray[i],
          errors: [
            {
              path: 'root',
              message: error.message,
              code: 'PROCESSING_ERROR',
              value: dataArray[i],
            },
          ],
        });
        results.processed++;
      }
    }

    console.log(
      `Bulk validation complete: ${results.valid.length} valid, ${results.invalid.length} invalid`
    );

    return {
      success: true,
      results,
      summary: {
        totalProcessed: results.processed,
        validCount: results.valid.length,
        invalidCount: results.invalid.length,
        successRate:
          ((results.valid.length / results.total) * 100).toFixed(2) + '%',
      },
    };
  } catch (error) {
    console.error('Bulk data import error:', error.message);
    throw error;
  }
}
```

### Example 6: Schema Composition and Reuse

```javascript
/**
 * Creates reusable schemas using composition patterns
 * @returns {Object} Collection of reusable schemas
 */
function createReusableSchemas() {
  try {
    // Base schemas
    const timestampSchema = createSchema({
      properties: {
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    });

    const auditSchema = createSchema({
      properties: {
        createdBy: { type: 'string', minLength: 1 },
        updatedBy: { type: 'string', minLength: 1 },
        version: { type: 'number', minimum: 1 },
      },
    });

    // User schemas
    const baseUserSchema = createSchema({
      type: 'object',
      required: ['username', 'email'],
      properties: {
        username: commonSchemas.username,
        email: commonSchemas.email,
        firstName: { type: 'string', minLength: 1, maxLength: 50 },
        lastName: { type: 'string', minLength: 1, maxLength: 50 },
      },
    });

    const fullUserSchema = mergeSchemas(
      baseUserSchema,
      timestampSchema,
      auditSchema
    );

    const adminUserSchema = extendSchema(fullUserSchema, {
      required: ['role', 'permissions'],
      properties: {
        role: { type: 'string', enum: ['admin', 'super_admin'] },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
        },
      },
    });

    // Product schemas
    const baseProductSchema = createSchema({
      type: 'object',
      required: ['name', 'price'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        description: { type: 'string', maxLength: 1000 },
        price: { type: 'number', minimum: 0 },
        category: {
          type: 'string',
          enum: ['electronics', 'clothing', 'books', 'home', 'sports'],
        },
      },
    });

    const fullProductSchema = mergeSchemas(baseProductSchema, timestampSchema, {
      properties: {
        tags: commonSchemas.tags,
        images: {
          type: 'array',
          maxItems: 5,
          items: commonSchemas.url,
        },
      },
    });

    return {
      users: {
        base: baseUserSchema,
        full: fullUserSchema,
        admin: adminUserSchema,
      },
      products: {
        base: baseProductSchema,
        full: fullProductSchema,
      },
      common: {
        timestamp: timestampSchema,
        audit: auditSchema,
      },
    };
  } catch (error) {
    console.error('Schema creation error:', error.message);
    throw error;
  }
}
```

## Code Generation Rules

1. **Always use async/await** for asynchronous validation operations
2. **Include comprehensive error handling** with try/catch blocks
3. **Validate function parameters** before processing
4. **Include detailed JSDoc comments** for all functions
5. **Use const and let** appropriately, avoid var
6. **Follow TypeScript function signatures** exactly as provided
7. **Include meaningful logging** for validation operations and errors
8. **Handle edge cases** like null/undefined values, empty objects/arrays
9. **Use environment variables** for sensitive configuration like database URLs
10. **Prefer named exports** for better import experience
11. **Sanitize before validating** to ensure data cleanliness and security
12. **Use ValidationError class** for structured error handling
13. **Leverage commonSchemas** for standard data types
14. **Create reusable validators and sanitizers** for better performance
15. **Format validation errors** appropriately for API responses

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
