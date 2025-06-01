/**
 * Basic error creation and usage demonstration using @voilajsx/appkit/error
 * @module @voilajsx/appkit/error
 * @file src/error/examples/01-basic-errors.js
 * Run: node 01-basic-errors.js
 */

import {
  validationError,
  notFoundError,
  authError,
  serverError,
  AppError,
  ErrorTypes,
} from '../index.js';

/**
 * Demonstrates basic error creation and properties
 * @returns {Promise<void>}
 */
async function demo() {
  console.log('=== Basic Error Creation Demo ===\n');

  // 1. Validation Error
  console.log('1. Creating validation error...');
  const validationErr = validationError('Email is required');
  console.log('Type:', validationErr.type);
  console.log('Message:', validationErr.message);
  console.log('Status Code:', validationErr.statusCode);
  console.log('JSON:', JSON.stringify(validationErr.toJSON(), null, 2));
  console.log('');

  // 2. Not Found Error
  console.log('2. Creating not found error...');
  const notFoundErr = notFoundError('User not found');
  console.log('Type:', notFoundErr.type);
  console.log('Status Code:', notFoundErr.statusCode);
  console.log('');

  // 3. Auth Error
  console.log('3. Creating auth error...');
  const authErr = authError('Invalid credentials');
  console.log('Type:', authErr.type);
  console.log('Status Code:', authErr.statusCode);
  console.log('');

  // 4. Server Error
  console.log('4. Creating server error...');
  const serverErr = serverError('Database connection failed');
  console.log('Type:', serverErr.type);
  console.log('Status Code:', serverErr.statusCode);
  console.log('');

  // 5. Error with details
  console.log('5. Creating error with details...');
  const detailedErr = validationError('Validation failed', {
    errors: {
      email: 'Email is required',
      age: 'Must be at least 18',
    },
  });
  console.log('Details:', detailedErr.details);
  console.log('');

  // 6. Checking error types
  console.log('6. Checking error types...');
  console.log(
    'Is validation error?',
    validationErr.type === ErrorTypes.VALIDATION
  );
  console.log('Is AppError instance?', validationErr instanceof AppError);
}

// Execute the demonstration
demo();
