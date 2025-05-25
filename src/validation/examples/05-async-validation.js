/**
 * Async Validation - @voilajsx/appkit
 *
 * Simple example showing asynchronous validation with external checks
 *
 * Run: node 05-async-validation.js
 */

import { validateAsync, createAsyncValidator } from '../index.js';

console.log('⏳ Async Validation Examples\n');

// Mock database functions (simulate real database calls)
const mockDatabase = {
  usernames: ['admin', 'john123', 'jane_doe'],
  emails: ['admin@example.com', 'john@example.com'],
};

// Simulate checking if username exists
async function checkUsernameExists(username) {
  console.log(`  🔍 Checking username: ${username}`);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockDatabase.usernames.includes(username);
}

// Simulate checking if email exists
async function checkEmailExists(email) {
  console.log(`  🔍 Checking email: ${email}`);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockDatabase.emails.includes(email);
}

// Define schema with async validators
const userSchema = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 20,
      validateAsync: async (value) => {
        const exists = await checkUsernameExists(value);
        return exists ? 'Username is already taken' : true;
      },
    },
    email: {
      type: 'string',
      required: true,
      email: true,
      validateAsync: async (value) => {
        const exists = await checkEmailExists(value);
        return exists ? 'Email is already registered' : true;
      },
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
      strongPassword: true,
    },
  },
};

// Test data
const newUser = {
  username: 'newuser123',
  email: 'newuser@example.com',
  password: 'MyStr0ng!Pass',
};

const existingUser = {
  username: 'admin', // This exists in our mock database
  email: 'admin@example.com', // This also exists
  password: 'MyStr0ng!Pass',
};

console.log('✅ Testing new user (should pass):');
console.log('User data:', newUser);

try {
  const result = await validateAsync(newUser, userSchema);

  if (result.valid) {
    console.log('✅ User validation passed!');
    console.log('Validated data:', result.value);
  } else {
    console.log('❌ Validation failed:');
    result.errors.forEach((error) => {
      console.log(`  - ${error.path}: ${error.message}`);
    });
  }
} catch (error) {
  console.log('❌ Validation error:', error.message);
}

console.log('\n❌ Testing existing user (should fail):');
console.log('User data:', existingUser);

try {
  const result = await validateAsync(existingUser, userSchema);

  if (result.valid) {
    console.log('✅ User validation passed!');
  } else {
    console.log('❌ Validation failed:');
    result.errors.forEach((error) => {
      console.log(`  - ${error.path}: ${error.message}`);
    });
  }
} catch (error) {
  console.log('❌ Validation error:', error.message);
}

// Create reusable async validator
console.log('\n🔧 Creating reusable async validator...');
const userValidator = createAsyncValidator(userSchema);

console.log('\n⚡ Testing with reusable validator:');
const quickTest = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'TestP@ss123',
};

try {
  const result = await userValidator(quickTest);
  console.log(
    result.valid ? '✅ Quick validation passed!' : '❌ Quick validation failed'
  );

  if (!result.valid) {
    result.errors.forEach((error) => {
      console.log(`  - ${error.path}: ${error.message}`);
    });
  }
} catch (error) {
  console.log('❌ Quick validation error:', error.message);
}

console.log('\n✅ Async validation complete!');
