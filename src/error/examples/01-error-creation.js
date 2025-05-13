/**
 * Basic Usage - @voilajs/appkit Error Module
 *
 * Simple example showing basic error creation and handling
 * No external dependencies needed - just run it!
 *
 * Run: node 01-basic-usage.js
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
} from '@voilajs/appkit/error';

function demo() {
  console.log('=== Basic Error Usage Demo ===\n');

  // 1. Create errors with factory functions
  console.log('1. Creating errors with factory functions:');

  const validationErr = validationError({
    email: 'Email is required',
    password: 'Password must be at least 8 characters',
  });

  const notFoundErr = notFoundError('User', '123');

  const authErr = authenticationError('Invalid credentials');

  const permissionErr = authorizationError('Admin access required');

  // Display error properties
  console.log(`Validation Error: 
  - Type: ${validationErr.type}
  - Status: ${validationErr.statusCode}
  - Message: ${validationErr.message}
  - Details: ${JSON.stringify(validationErr.details.errors)}`);

  console.log(`\nNot Found Error: 
  - Type: ${notFoundErr.type}
  - Status: ${notFoundErr.statusCode}
  - Message: ${notFoundErr.message}`);

  console.log(`\nAuthentication Error: 
  - Type: ${authErr.type}
  - Status: ${authErr.statusCode}
  - Message: ${authErr.message}`);

  console.log(`\nAuthorization Error: 
  - Type: ${permissionErr.type}
  - Status: ${permissionErr.statusCode}
  - Message: ${permissionErr.message}`);
  console.log('');

  // 2. Create additional error types
  console.log('2. Creating additional error types:');

  const conflictErr = conflictError('Email already exists', {
    email: 'user@example.com',
  });

  const badReqErr = badRequestError('Invalid query parameters', {
    param: 'sort',
    value: 'invalidValue',
  });

  const rateErr = rateLimitError('Too many requests', { retryAfter: 60 });

  const unavailErr = serviceUnavailableError('Database connection failed');

  const internalErr = internalError('Unexpected error', {
    stack: 'Error stack...',
  });

  console.log(`Conflict Error: 
  - Type: ${conflictErr.type}
  - Status: ${conflictErr.statusCode}
  - Message: ${conflictErr.message}
  - Details: ${JSON.stringify(conflictErr.details)}`);

  console.log(`\nBad Request Error: 
  - Type: ${badReqErr.type}
  - Status: ${badReqErr.statusCode}
  - Message: ${badReqErr.message}
  - Details: ${JSON.stringify(badReqErr.details)}`);

  console.log(`\nRate Limit Error: 
  - Type: ${rateErr.type}
  - Status: ${rateErr.statusCode}
  - Message: ${rateErr.message}
  - Details: ${JSON.stringify(rateErr.details)}`);

  console.log(`\nService Unavailable Error: 
  - Type: ${unavailErr.type}
  - Status: ${unavailErr.statusCode}
  - Message: ${unavailErr.message}`);

  console.log(`\nInternal Error: 
  - Type: ${internalErr.type}
  - Status: ${internalErr.statusCode}
  - Message: ${internalErr.message}
  - Details: ${JSON.stringify(internalErr.details)}`);
  console.log('');

  // 3. Generic error creation with custom type
  console.log('3. Generic error creation with createError:');

  const customErr = createError(
    ErrorTypes.BAD_REQUEST,
    'Custom error message',
    { custom: 'details' }
  );

  console.log(`Custom Error:
  - Type: ${customErr.type}
  - Status: ${customErr.statusCode}
  - Message: ${customErr.message}
  - Details: ${JSON.stringify(customErr.details)}`);
  console.log('');

  // 4. Error handling example
  console.log('4. Error handling example:');

  function getUserById(id) {
    const users = { 1: { id: '1', name: 'John' } };

    if (!users[id]) {
      throw notFoundError('User', id);
    }

    return users[id];
  }

  try {
    console.log('  - Trying to get user with ID 999');
    getUserById('999');
  } catch (error) {
    console.log('  - Error caught!');
    console.log(`  - Type: ${error.type}`);
    console.log(`  - Message: ${error.message}`);
    console.log(`  - Status: ${error.statusCode}`);
    console.log(`  - Details: ${JSON.stringify(error.details)}`);
  }
}

demo();

/* Expected output:
=== Basic Error Usage Demo ===

1. Creating errors with factory functions:
Validation Error: 
  - Type: VALIDATION_ERROR
  - Status: 400
  - Message: Validation failed
  - Details: {"email":"Email is required","password":"Password must be at least 8 characters"}

Not Found Error: 
  - Type: NOT_FOUND
  - Status: 404
  - Message: User not found

Authentication Error: 
  - Type: AUTHENTICATION_ERROR
  - Status: 401
  - Message: Invalid credentials

Authorization Error: 
  - Type: AUTHORIZATION_ERROR
  - Status: 403
  - Message: Admin access required

2. Creating additional error types:
Conflict Error: 
  - Type: CONFLICT
  - Status: 409
  - Message: Email already exists
  - Details: {"email":"user@example.com"}

Bad Request Error: 
  - Type: BAD_REQUEST
  - Status: 400
  - Message: Invalid query parameters
  - Details: {"param":"sort","value":"invalidValue"}

Rate Limit Error: 
  - Type: RATE_LIMIT_EXCEEDED
  - Status: 429
  - Message: Too many requests
  - Details: {"retryAfter":60}

Service Unavailable Error: 
  - Type: SERVICE_UNAVAILABLE
  - Status: 503
  - Message: Database connection failed

Internal Error: 
  - Type: INTERNAL_ERROR
  - Status: 500
  - Message: Unexpected error
  - Details: {"stack":"Error stack..."}

3. Generic error creation with createError:
Custom Error:
  - Type: BAD_REQUEST
  - Status: 400
  - Message: Custom error message
  - Details: {"custom":"details"}

4. Error handling example:
  - Trying to get user with ID 999
  - Error caught!
  - Type: NOT_FOUND
  - Message: User not found
  - Status: 404
  - Details: {"entity":"User","id":"999"}
*/
