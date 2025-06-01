# @voilajsx/appkit/validation - LLM API Reference

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

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Throw descriptive error messages

4. **Framework Agnostic**:
   - Code should work with any Node.js framework
   - Validation patterns should be adaptable

## Function Signatures

### 1. `validate`

```typescript
function validate(
  data: any,
  schema: {
    type?: string | string[];
    required?: boolean;
    default?: any | (() => any);
    validate?: (value: any) => boolean | string;
    properties?: Record<string, Schema>;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    integer?: boolean;
    email?: boolean;
    url?: boolean;
    alphanumeric?: boolean;
    pattern?: RegExp | string;
    trim?: boolean;
  },
  options?: {
    abortEarly?: boolean;
  }
): {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    type: string;
    value: any;
  }>;
  value: any;
};
```

### 2. `validateAsync`

```typescript
async function validateAsync(
  data: any,
  schema: Schema & {
    validateAsync?: (value: any) => Promise<boolean | string>;
  },
  options?: {
    abortEarly?: boolean;
  }
): Promise<ValidationResult>;
```

### 3. `createValidator`

```typescript
function createValidator(
  schema: Schema,
  options?: { abortEarly?: boolean }
): (data: any, overrideOptions?: ValidationOptions) => ValidationResult;
```

### 4. `createAsyncValidator`

```typescript
function createAsyncValidator(
  schema: Schema,
  options?: { abortEarly?: boolean }
): (
  data: any,
  overrideOptions?: ValidationOptions
) => Promise<ValidationResult>;
```

### 5. Built-in Validators

```typescript
function isEmail(value: string): boolean;
function isUrl(value: string): boolean;
function isAlphanumeric(value: string): boolean;
```

- **isEmail**: Validates RFC-compliant email addresses with length limits
- **isUrl**: Validates HTTP/HTTPS URLs only, rejects other protocols
- **isAlphanumeric**: Validates strings containing only letters and numbers

### 6. Sanitization Functions

```typescript
function sanitize(data: any, rules: SanitizationRules | Function): any;

function sanitizeString(
  input: string,
  rules?: {
    trim?: boolean; // Default: true
    lowercase?: boolean;
    uppercase?: boolean;
    truncate?: number | boolean; // true = 255 chars
    replace?: Record<string, string>; // regex patterns as keys
    remove?: string | string[]; // regex patterns to remove
  }
): string;

function sanitizeNumber(
  input: any,
  rules?: {
    default?: number; // Default: 0 for NaN
    integer?: boolean; // Truncate decimals
    precision?: number; // Round to decimal places
    min?: number;
    max?: number;
    clamp?: boolean; // Enforce min/max bounds
  }
): number;

function sanitizeObject(
  input: any,
  rules?: {
    defaults?: Record<string, any>; // Default property values
    pick?: string[]; // Include only these properties
    omit?: string[]; // Exclude these properties
    properties?: Record<string, SanitizationRules>; // Per-property rules
    removeEmpty?: boolean; // Remove null/undefined/empty string
  }
): object;
```

### 7. Schema Management

```typescript
const commonSchemas: {
  email: Schema; // RFC email with max 254 chars
  password: Schema; // 8-128 chars, mixed case + number + special
  username: Schema; // 3-32 chars, alphanumeric only
  url: Schema; // Valid URL, max 2048 chars
  boolean: Schema; // Boolean type validation
  integer: Schema; // Integer number validation
};

function createValidationSchema(definition: Schema): Schema;
```

### 8. Error Handling

```typescript
class ValidationError extends Error {
  constructor(message: string, errors?: Array<ErrorObject>);
  getMessages(): string[]; // Formatted error messages
  hasErrors(): boolean; // Check if errors exist
  errors: Array<{
    path: string;
    message: string;
    type: string;
    value: any;
  }>;
}
```

### 9. Pipeline Utilities

```typescript
const utils: {
  pipeline: (...validators: Function[]) => (
    data: any,
    options?: {
      abortEarly?: boolean;
    }
  ) => Promise<{
    valid: boolean;
    errors: Array<ErrorObject>;
    value: any;
  }>;
};
```

- **Pipeline behavior**: Chains validators, passes transformed values between
  steps
- **Error handling**: Collects all errors unless `abortEarly: true`
- **Value transformation**: Each validator can modify the value for the next
  step

## Example Implementations

### Basic Validation

```javascript
/**
 * Validates user input data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result
 * @throws {Error} If validation setup fails
 */
function validateUser(userData) {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', required: true, minLength: 2 },
      age: { type: 'number', min: 0, max: 120 },
      email: { type: 'string', email: true },
    },
  };

  const result = validate(userData, schema);

  if (!result.valid) {
    console.log('Validation errors:', result.errors);
  }

  return result;
}

/**
 * Validates email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function validateEmail(email) {
  return isEmail(email);
}
```

### Async Validation

```javascript
/**
 * Validates username availability
 * @param {string} username - Username to check
 * @returns {Promise<Object>} Validation result
 * @throws {Error} If validation fails
 */
async function validateUsername(username) {
  const schema = {
    type: 'string',
    required: true,
    alphanumeric: true,
    minLength: 3,
    validateAsync: async (value) => {
      // Simulate database check
      const existingUsers = await getUsernames();
      return existingUsers.includes(value) ? 'Username already taken' : true;
    },
  };

  return await validateAsync(username, schema);
}

/**
 * Creates async user validator
 * @returns {Function} Async validator function
 */
function createUserValidator() {
  return createAsyncValidator({
    type: 'object',
    properties: {
      email: {
        type: 'string',
        email: true,
        validateAsync: async (email) => {
          const exists = await checkEmailExists(email);
          return exists ? 'Email already registered' : true;
        },
      },
      username: {
        type: 'string',
        alphanumeric: true,
        validateAsync: async (username) => {
          const taken = await checkUsernameTaken(username);
          return taken ? 'Username not available' : true;
        },
      },
    },
  });
}
```

### Data Sanitization

```javascript
/**
 * Sanitizes user input data
 * @param {Object} rawData - Raw user input
 * @returns {Object} Sanitized data
 * @throws {Error} If sanitization fails
 */
function sanitizeUserInput(rawData) {
  return sanitizeObject(rawData, {
    pick: ['name', 'email', 'age'],
    properties: {
      name: { trim: true, truncate: 50 },
      email: { trim: true, lowercase: true },
      age: { integer: true, min: 0, clamp: true },
    },
    removeEmpty: true,
  });
}

/**
 * Sanitizes form data
 * @param {Object} formData - Form input data
 * @returns {Object} Clean form data
 */
function sanitizeForm(formData) {
  const sanitized = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, {
        trim: true,
        truncate: 1000,
      });
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value, {
        precision: 2,
      });
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
```

### Reusable Validators

```javascript
/**
 * Creates email validator
 * @returns {Function} Email validator function
 */
function createEmailValidator() {
  return createValidator({
    type: 'string',
    required: true,
    email: true,
    maxLength: 254,
  });
}

/**
 * Creates password validator
 * @returns {Function} Password validator function
 */
function createPasswordValidator() {
  return createValidator({
    type: 'string',
    required: true,
    minLength: 8,
    validate: (password) => {
      if (!/[A-Z]/.test(password)) {
        return 'Password must contain uppercase letter';
      }
      if (!/[a-z]/.test(password)) {
        return 'Password must contain lowercase letter';
      }
      if (!/[0-9]/.test(password)) {
        return 'Password must contain number';
      }
      return true;
    },
  });
}

/**
 * Creates product validator
 * @returns {Function} Product validator function
 */
function createProductValidator() {
  return createValidator({
    type: 'object',
    properties: {
      name: { type: 'string', required: true, minLength: 2 },
      price: { type: 'number', required: true, min: 0 },
      category: { type: 'string', required: true },
      inStock: { type: 'boolean', default: true },
    },
  });
}
```

### Schema Usage

```javascript
/**
 * Validates user registration data
 * @param {Object} userData - Registration data
 * @returns {Object} Validation result
 */
function validateRegistration(userData) {
  const schema = {
    type: 'object',
    properties: {
      email: commonSchemas.email,
      password: commonSchemas.password,
      username: commonSchemas.username,
      age: { type: 'number', min: 13, required: true },
      terms: {
        type: 'boolean',
        validate: (value) => (value === true ? true : 'Must accept terms'),
      },
    },
  };

  return validate(userData, schema);
}

/**
 * Creates custom schema
 * @param {Object} definition - Schema definition
 * @returns {Object} Schema object
 */
function createApiSchema(definition) {
  return createValidationSchema({
    type: 'object',
    properties: {
      page: { type: 'number', min: 1, default: 1 },
      limit: { type: 'number', min: 1, max: 100, default: 10 },
      search: { type: 'string', maxLength: 100 },
      ...definition,
    },
  });
}
```

### Pipeline Usage

```javascript
/**
 * Creates validation pipeline with multiple steps
 * @returns {Function} Pipeline validator
 */
function createValidationPipeline() {
  const stringValidator = createValidator({
    type: 'string',
    required: true,
    minLength: 3,
  });

  const emailValidator = createValidator({
    type: 'string',
    email: true,
  });

  // Pipeline passes value through each validator
  return utils.pipeline(stringValidator, emailValidator);
}

/**
 * Creates sanitization and validation pipeline
 * @returns {Function} Combined pipeline
 */
function createDataPipeline() {
  const sanitizer = (data) => ({
    valid: true,
    value: sanitizeString(data, { trim: true, lowercase: true }),
  });

  const validator = createValidator({
    type: 'string',
    email: true,
  });

  return utils.pipeline(sanitizer, validator);
}

/**
 * Validates data through pipeline with options
 * @param {string} email - Email to validate
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Validation result
 */
async function validateThroughPipeline(email, options = {}) {
  const pipeline = createValidationPipeline();

  // Pipeline supports abortEarly option
  return await pipeline(email, { abortEarly: options.abortEarly || false });
}

/**
 * Creates complex validation pipeline
 * @returns {Function} Multi-step validator
 */
function createComplexPipeline() {
  // Step 1: Sanitize
  const sanitizeStep = (data) => ({
    valid: true,
    value: sanitizeObject(data, {
      pick: ['email', 'name'],
      properties: {
        email: { trim: true, lowercase: true },
        name: { trim: true },
      },
    }),
  });

  // Step 2: Validate structure
  const structureValidator = createValidator({
    type: 'object',
    properties: {
      email: { type: 'string', required: true },
      name: { type: 'string', required: true },
    },
  });

  // Step 3: Validate content
  const contentValidator = createValidator({
    type: 'object',
    properties: {
      email: { type: 'string', email: true },
      name: { type: 'string', minLength: 2 },
    },
  });

  return utils.pipeline(sanitizeStep, structureValidator, contentValidator);
}
```

### Error Handling

```javascript
/**
 * Handles validation errors
 * @param {Object} validationResult - Result from validation
 * @returns {Object} Formatted error response
 */
function handleValidationErrors(validationResult) {
  if (validationResult.valid) {
    return { success: true, data: validationResult.value };
  }

  const error = new ValidationError(
    'Validation failed',
    validationResult.errors
  );

  return {
    success: false,
    errors: error.getMessages(),
    details: validationResult.errors,
  };
}

/**
 * Validates and handles errors
 * @param {any} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Result with error handling
 */
function validateWithErrorHandling(data, schema) {
  try {
    const result = validate(data, schema);
    return handleValidationErrors(result);
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### Complete Integration Example

```javascript
/**
 * User registration service with validation and sanitization
 * @class UserService
 */
class UserService {
  constructor() {
    this.emailValidator = createValidator(commonSchemas.email);
    this.passwordValidator = createValidator(commonSchemas.password);
  }

  /**
   * Registers a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   * @throws {Error} If registration fails
   */
  async registerUser(userData) {
    try {
      // Sanitize input
      const sanitized = sanitizeObject(userData, {
        pick: ['email', 'password', 'name'],
        properties: {
          email: { trim: true, lowercase: true },
          name: { trim: true, truncate: 50 },
        },
        removeEmpty: true,
      });

      // Validate sanitized data
      const emailResult = this.emailValidator(sanitized.email);
      const passwordResult = this.passwordValidator(sanitized.password);

      if (!emailResult.valid || !passwordResult.valid) {
        const errors = [...emailResult.errors, ...passwordResult.errors];

        throw new ValidationError('Validation failed', errors);
      }

      // Check uniqueness
      const uniqueResult = await this.validateUniqueness(sanitized.email);
      if (!uniqueResult.valid) {
        throw new ValidationError('Email already exists', uniqueResult.errors);
      }

      // Create user
      const user = await this.createUser(sanitized);
      return { success: true, user };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.getMessages(),
        };
      }
      throw error;
    }
  }

  /**
   * Validates email uniqueness
   * @param {string} email - Email to check
   * @returns {Promise<Object>} Validation result
   */
  async validateUniqueness(email) {
    const schema = {
      type: 'string',
      validateAsync: async (value) => {
        const exists = await this.emailExists(value);
        return exists ? 'Email already registered' : true;
      },
    };

    return await validateAsync(email, schema);
  }

  /**
   * Creates user in database
   * @param {Object} userData - Validated user data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    // Implementation here
    return { id: 'user-123', ...userData };
  }

  /**
   * Checks if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} Email exists
   */
  async emailExists(email) {
    // Implementation here
    return false;
  }
}
```

## Code Generation Rules

1. **Always use async/await** for async validation functions and pipeline
   operations
2. **Include comprehensive error handling** with try/catch blocks for all
   validation
3. **Use JSDoc format** exactly as shown with proper type annotations
4. **Check for null/undefined** before operations, especially in custom
   validators
5. **Return consistent response formats** with `{ valid, errors, value }`
   structure
6. **Use descriptive variable names** that explain purpose (e.g.,
   `emailValidator`, `sanitizedData`)
7. **Include validation before processing** in all data handling functions
8. **Sanitize before validation** when both operations are needed
9. **Handle edge cases** like empty strings, null values, and type mismatches
10. **Implement proper pipeline error handling** with abortEarly support
11. **Use utils.pipeline correctly** - always return async function, handle
    value transformation
12. **Apply commonSchemas** when appropriate instead of recreating standard
    validations
13. **Structure complex validations** as pipelines rather than single large
    validators
14. **Include ValidationError usage** for proper error reporting and handling

## Common Patterns to Generate

### API Endpoint Validation

```javascript
/**
 * Validates API request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
async function validateApiRequest(req, res, next) {
  // Implementation with validation and error handling
}
```

### Form Data Processing

```javascript
/**
 * Processes and validates form submission
 * @param {Object} formData - Raw form data
 * @returns {Promise<Object>} Processing result
 */
async function processFormData(formData) {
  // Implementation with sanitization and validation
}
```

### Database Model Validation

```javascript
/**
 * Validates model before database save
 * @param {Object} model - Model data
 * @returns {Object} Validation result
 */
function validateModel(model) {
  // Implementation with schema validation
}
```

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
