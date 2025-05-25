/**
 * API Validation - @voilajsx/appkit
 *
 * Simple example showing how to validate API requests and responses
 * This example simulates an Express.js-like API without requiring Express
 *
 * Run: node 07-api-validation.js
 */

import {
  validate,
  sanitize,
  createValidator,
  ValidationError,
  userRegistrationSchema,
  productSchema,
} from '../index.js';

console.log('🌐 API Validation Examples\n');

// Simulate API request validation middleware
function validateRequest(schema) {
  return function (req, res, next) {
    console.log(`🔍 Validating ${req.method} ${req.url}`);

    // Sanitize request data first
    const sanitizedData = sanitize(req.body, {
      removeEmpty: true,
      properties: {
        email: { trim: true, lowercase: true },
        username: { trim: true, lowercase: true },
        name: { trim: true },
        description: { trim: true },
      },
    });

    const result = validate(sanitizedData, schema);

    if (result.valid) {
      req.validatedData = result.value;
      console.log('✅ Validation passed');
      next();
    } else {
      const error = new ValidationError(
        'Request validation failed',
        result.errors
      );
      console.log('❌ Validation failed:');
      result.errors.forEach((err) =>
        console.log(`  - ${err.path}: ${err.message}`)
      );
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.getErrorsByPath(),
      });
    }
  };
}

// Mock Express-like request/response objects
function createMockReq(method, url, body) {
  return { method, url, body };
}

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      console.log(
        `📤 Response (${this.statusCode}):`,
        JSON.stringify(data, null, 2)
      );
    },
  };
}

// Create validators for different endpoints
const validateUserRegistration = validateRequest(userRegistrationSchema);
const validateProduct = validateRequest(productSchema);

// Mock next function
const next = () => console.log('✅ Proceeding to next middleware\n');

// Test user registration endpoint
console.log('👤 Testing User Registration API:\n');

// Valid user registration
const validUserReq = createMockReq('POST', '/api/users/register', {
  email: '  USER@EXAMPLE.COM  ', // Will be sanitized
  password: 'MyStr0ng!Pass',
  username: '  JOHNDOE  ', // Will be sanitized
  firstName: 'John',
  lastName: 'Doe',
  terms: true,
});

console.log('Valid registration request:');
validateUserRegistration(validUserReq, createMockRes(), next);

// Invalid user registration
const invalidUserReq = createMockReq('POST', '/api/users/register', {
  email: 'invalid-email',
  password: '123', // Too weak
  username: 'jo', // Too short
  terms: false, // Must be true
});

console.log('Invalid registration request:');
validateUserRegistration(invalidUserReq, createMockRes(), next);

// Test product creation endpoint
console.log('🛍️ Testing Product Creation API:\n');

// Valid product
const validProductReq = createMockReq('POST', '/api/products', {
  name: '  Wireless Headphones  ', // Will be sanitized
  price: 99.99,
  category: 'Electronics',
  description: '  High-quality wireless headphones  ', // Will be sanitized
  sku: 'WH-001',
  tags: ['electronics', 'audio', 'wireless'],
});

console.log('Valid product request:');
validateProduct(validProductReq, createMockRes(), next);

// Invalid product
const invalidProductReq = createMockReq('POST', '/api/products', {
  name: '', // Required but empty
  price: -10, // Negative price
  category: '', // Required but empty
  sku: 'invalid sku!', // Invalid format
});

console.log('Invalid product request:');
validateProduct(invalidProductReq, createMockRes(), next);

// Advanced: Query parameter validation
console.log('🔍 Testing Query Parameter Validation:\n');

const querySchema = {
  type: 'object',
  properties: {
    page: { type: 'number', integer: true, min: 1, default: 1 },
    limit: { type: 'number', integer: true, min: 1, max: 100, default: 20 },
    search: { type: 'string', maxLength: 100 },
    category: { type: 'string', enum: ['electronics', 'books', 'clothing'] },
    sort: { type: 'string', enum: ['name', 'price', 'date'], default: 'name' },
  },
};

const validateQuery = createValidator(querySchema);

// Test query parameters
const validQuery = {
  page: '2',
  limit: '10',
  search: 'headphones',
  category: 'electronics',
};
const invalidQuery = { page: '0', limit: '200', category: 'invalid-category' };

console.log('Valid query parameters:');
console.log('Input:', validQuery);
const queryResult1 = validateQuery(validQuery);
console.log(queryResult1.valid ? '✅ Valid query' : '❌ Invalid query');
if (queryResult1.valid) {
  console.log('Validated query:', queryResult1.value);
}

console.log('\nInvalid query parameters:');
console.log('Input:', invalidQuery);
const queryResult2 = validateQuery(invalidQuery);
console.log(queryResult2.valid ? '✅ Valid query' : '❌ Invalid query');
if (!queryResult2.valid) {
  queryResult2.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Response validation
console.log('\n📤 Testing Response Validation:\n');

const apiResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', required: true },
    data: { type: ['object', 'array', 'null'] },
    message: { type: 'string' },
    timestamp: { type: 'number', integer: true },
    meta: {
      type: 'object',
      properties: {
        page: { type: 'number', integer: true },
        total: { type: 'number', integer: true },
        hasMore: { type: 'boolean' },
      },
    },
  },
};

const validateResponse = createValidator(apiResponseSchema);

// Valid API responses
const successResponse = {
  success: true,
  data: { id: 1, name: 'Test Product' },
  message: 'Product retrieved successfully',
  timestamp: Date.now(),
};

const listResponse = {
  success: true,
  data: [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
  ],
  meta: {
    page: 1,
    total: 50,
    hasMore: true,
  },
  timestamp: Date.now(),
};

console.log('Testing success response:');
const responseResult1 = validateResponse(successResponse);
console.log(
  responseResult1.valid
    ? '✅ Valid response format'
    : '❌ Invalid response format'
);

console.log('\nTesting list response:');
const responseResult2 = validateResponse(listResponse);
console.log(
  responseResult2.valid
    ? '✅ Valid response format'
    : '❌ Invalid response format'
);

// Error handling example
console.log('\n🚨 Error Handling Example:\n');

function handleValidationError(error) {
  if (error instanceof ValidationError) {
    console.log('Validation Error Details:');
    console.log(`- Error Count: ${error.getErrorCount()}`);
    console.log(`- Error Paths: ${error.getErrorPaths().join(', ')}`);
    console.log('- Formatted Message:');
    console.log(error.getFormattedMessage({ maxErrors: 3 }));

    return {
      success: false,
      code: error.code,
      message: error.message,
      errors: error.getErrorsByPath(),
      timestamp: Date.now(),
    };
  }

  return {
    success: false,
    message: 'Internal server error',
    timestamp: Date.now(),
  };
}

// Simulate validation error
try {
  const badData = { email: 'bad-email', username: 'x' };
  const result = validate(badData, userRegistrationSchema);

  if (!result.valid) {
    throw new ValidationError('User validation failed', result.errors);
  }
} catch (error) {
  const errorResponse = handleValidationError(error);
  console.log('Error Response:', JSON.stringify(errorResponse, null, 2));
}

console.log('\n✅ API validation examples complete!');
