/**
 * Basic Error Creation - @voilajsx/appkit Error Module
 *
 * This example demonstrates creating different types of errors
 * No external dependencies needed - just run it!
 *
 * Run: node 01-error-creation.js
 */

import {
  ErrorTypes,
  AppError,
  createError,
  validationError,
  notFoundError,
  authenticationError,
  authorizationError,
  conflictError,
  badRequestError,
  rateLimitError,
  serviceUnavailableError,
  internalError,
} from '@voilajsx/appkit/error';

function demo() {
  console.log('=== Error Creation Demo ===\n');

  // 1. Create a basic AppError
  console.log('1. Creating a basic AppError:');
  const basicError = new AppError(
    ErrorTypes.NOT_FOUND,
    'User not found',
    { userId: '123' },
    404
  );

  console.log(`Error type: ${basicError.type}`);
  console.log(`Error message: ${basicError.message}`);
  console.log(`Status code: ${basicError.statusCode}`);
  console.log(`Details: ${JSON.stringify(basicError.details)}`);
  console.log(`JSON format: ${JSON.stringify(basicError.toJSON())}`);
  console.log('');

  // 2. Using factory functions
  console.log('2. Using factory functions:');

  // Validation error
  const valError = validationError({
    email: 'Email is required',
    password: 'Password must be at least 8 characters',
  });
  console.log('- Validation Error:');
  console.log(`  Type: ${valError.type}`);
  console.log(`  Status: ${valError.statusCode}`);
  console.log(`  Details: ${JSON.stringify(valError.details)}`);

  // Not found error
  const notFound = notFoundError('User', '123');
  console.log('- Not Found Error:');
  console.log(`  Message: ${notFound.message}`);
  console.log(`  Type: ${notFound.type}`);
  console.log(`  Status: ${notFound.statusCode}`);

  // Authentication error
  const authError = authenticationError('Invalid credentials');
  console.log('- Authentication Error:');
  console.log(`  Message: ${authError.message}`);
  console.log(`  Type: ${authError.type}`);
  console.log(`  Status: ${authError.statusCode}`);

  // Authorization error
  const permError = authorizationError('Admin access required');
  console.log('- Authorization Error:');
  console.log(`  Message: ${permError.message}`);
  console.log(`  Type: ${permError.type}`);
  console.log(`  Status: ${permError.statusCode}`);

  // Conflict error
  const confError = conflictError('Email already exists', {
    email: 'user@example.com',
  });
  console.log('- Conflict Error:');
  console.log(`  Message: ${confError.message}`);
  console.log(`  Type: ${confError.type}`);
  console.log(`  Status: ${confError.statusCode}`);

  // Bad Request error
  const badReqError = badRequestError('Invalid query parameters');
  console.log('- Bad Request Error:');
  console.log(`  Message: ${badReqError.message}`);
  console.log(`  Type: ${badReqError.type}`);
  console.log(`  Status: ${badReqError.statusCode}`);

  // Rate Limit error
  const rateError = rateLimitError('Too many requests', { retryAfter: 60 });
  console.log('- Rate Limit Error:');
  console.log(`  Message: ${rateError.message}`);
  console.log(`  Type: ${rateError.type}`);
  console.log(`  Status: ${rateError.statusCode}`);
  console.log(`  Details: ${JSON.stringify(rateError.details)}`);

  // Service Unavailable error
  const unavailError = serviceUnavailableError('Database connection failed');
  console.log('- Service Unavailable Error:');
  console.log(`  Message: ${unavailError.message}`);
  console.log(`  Type: ${unavailError.type}`);
  console.log(`  Status: ${unavailError.statusCode}`);

  // Internal error
  const intError = internalError('Unexpected error occurred');
  console.log('- Internal Error:');
  console.log(`  Message: ${intError.message}`);
  console.log(`  Type: ${intError.type}`);
  console.log(`  Status: ${intError.statusCode}`);
  console.log('');

  // 3. Generic error creation
  console.log('3. Using createError function:');
  const customError = createError(
    ErrorTypes.BAD_REQUEST,
    'Invalid parameters',
    { param: 'userId', value: 'abc' }
  );

  console.log(`Error type: ${customError.type}`);
  console.log(`Error message: ${customError.message}`);
  console.log(`Status code: ${customError.statusCode}`);
  console.log(`Details: ${JSON.stringify(customError.details)}`);
}

demo();

/* Expected output:
  === Error Creation Demo ===
  
  1. Creating a basic AppError:
  Error type: NOT_FOUND
  Error message: User not found
  Status code: 404
  Details: {"userId":"123"}
  JSON format: {"type":"NOT_FOUND","message":"User not found","details":{"userId":"123"},"timestamp":"..."}
  
  2. Using factory functions:
  - Validation Error:
    Type: VALIDATION_ERROR
    Status: 400
    Details: {"errors":{"email":"Email is required","password":"Password must be at least 8 characters"}}
  - Not Found Error:
    Message: User not found
    Type: NOT_FOUND
    Status: 404
  - Authentication Error:
    Message: Invalid credentials
    Type: AUTHENTICATION_ERROR
    Status: 401
  - Authorization Error:
    Message: Admin access required
    Type: AUTHORIZATION_ERROR
    Status: 403
  - Conflict Error:
    Message: Email already exists
    Type: CONFLICT
    Status: 409
  - Bad Request Error:
    Message: Invalid query parameters
    Type: BAD_REQUEST
    Status: 400
  - Rate Limit Error:
    Message: Too many requests
    Type: RATE_LIMIT_EXCEEDED
    Status: 429
    Details: {"retryAfter":60}
  - Service Unavailable Error:
    Message: Database connection failed
    Type: SERVICE_UNAVAILABLE
    Status: 503
  - Internal Error:
    Message: Unexpected error occurred
    Type: INTERNAL_ERROR
    Status: 500
  
  3. Using createError function:
  Error type: BAD_REQUEST
  Error message: Invalid parameters
  Status code: 400
  Details: {"param":"userId","value":"abc"}
  */
