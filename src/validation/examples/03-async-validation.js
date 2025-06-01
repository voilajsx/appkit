/**
 * Async Validation - @voilajsx/appkit
 * @file src/validation/examples/03-async-validation.js
 *
 * Simple example showing how to perform asynchronous validation
 *
 * Run: node 03-async-validation.js
 */

import {
  validateAsync,
  createAsyncValidator,
  commonSchemas,
  createSchema,
} from '../index.js';

// Simulate database/API calls with delays
const simulateDbCall = (delay = 100) =>
  new Promise((resolve) => setTimeout(resolve, delay));

// Mock database of existing users
const existingUsers = [
  { email: 'john@example.com', username: 'john123' },
  { email: 'jane@example.com', username: 'jane456' },
  { email: 'admin@example.com', username: 'admin' },
];

// Mock API service for email validation
const mockEmailService = {
  async checkEmailExists(email) {
    await simulateDbCall(50);
    return existingUsers.some((user) => user.email === email);
  },

  async checkEmailDeliverable(email) {
    await simulateDbCall(100);
    // Simulate some emails being undeliverable
    const undeliverableEmails = ['test@fake-domain.com', 'invalid@bounce.com'];
    return !undeliverableEmails.includes(email);
  },
};

// Mock username service
const mockUsernameService = {
  async checkUsernameExists(username) {
    await simulateDbCall(75);
    return existingUsers.some((user) => user.username === username);
  },

  async checkUsernameReserved(username) {
    await simulateDbCall(25);
    const reservedUsernames = ['admin', 'root', 'system', 'api', 'support'];
    return reservedUsernames.includes(username.toLowerCase());
  },
};

console.log('🔄 Testing basic async validation...\n');

// Basic async validation example
const basicAsyncSchema = {
  type: 'string',
  email: true,
  validateAsync: async (email) => {
    console.log(`  📧 Checking if email ${email} already exists...`);
    const exists = await mockEmailService.checkEmailExists(email);
    return exists ? 'Email already registered' : true;
  },
};

// Test with existing email
console.log('Testing existing email:');
const existingEmailResult = await validateAsync(
  'john@example.com',
  basicAsyncSchema
);
console.log('Result:', existingEmailResult.valid ? '✅ Valid' : '❌ Invalid');
if (!existingEmailResult.valid) {
  console.log(
    'Errors:',
    existingEmailResult.errors.map((e) => e.message)
  );
}

// Test with new email
console.log('\nTesting new email:');
const newEmailResult = await validateAsync(
  'newuser@example.com',
  basicAsyncSchema
);
console.log('Result:', newEmailResult.valid ? '✅ Valid' : '❌ Invalid');

console.log('\n🔄 Testing complex async validation schema...\n');

// Complex schema with multiple async validators
const userRegistrationSchema = createSchema({
  type: 'object',
  properties: {
    email: {
      ...commonSchemas.email,
      validateAsync: async (email) => {
        console.log(`  📧 Validating email: ${email}`);

        // Check if email already exists
        const exists = await mockEmailService.checkEmailExists(email);
        if (exists) {
          return 'Email already registered';
        }

        // Check if email is deliverable
        const deliverable = await mockEmailService.checkEmailDeliverable(email);
        if (!deliverable) {
          return 'Email address is not deliverable';
        }

        return true;
      },
    },

    username: {
      ...commonSchemas.username,
      validateAsync: async (username) => {
        console.log(`  👤 Validating username: ${username}`);

        // Check if username is reserved
        const reserved =
          await mockUsernameService.checkUsernameReserved(username);
        if (reserved) {
          return 'Username is reserved and cannot be used';
        }

        // Check if username already exists
        const exists = await mockUsernameService.checkUsernameExists(username);
        if (exists) {
          return 'Username already taken';
        }

        return true;
      },
    },

    password: commonSchemas.password, // No async validation for password

    age: {
      type: 'number',
      required: true,
      min: 18,
      max: 120,
    },
  },
});

// Test user registration data
const userData = {
  email: 'newuser@example.com',
  username: 'newuser123',
  password: 'MyStr0ng!Pass',
  age: 25,
};

console.log('Testing valid user registration:');
console.log('Data:', userData);

const validationResult = await validateAsync(userData, userRegistrationSchema);
console.log(
  '\nValidation result:',
  validationResult.valid ? '✅ Valid' : '❌ Invalid'
);

if (validationResult.valid) {
  console.log('✅ User can be registered!');
  console.log('Validated data:', validationResult.value);
} else {
  console.log('❌ Registration failed:');
  validationResult.errors.forEach((error) => {
    console.log(`  - ${error.path}: ${error.message}`);
  });
}

console.log('\n🔄 Testing with conflicting data...\n');

// Test with existing email and username
const conflictingData = {
  email: 'john@example.com', // Already exists
  username: 'admin', // Reserved
  password: 'MyStr0ng!Pass',
  age: 25,
};

console.log('Testing conflicting user data:');
console.log('Data:', conflictingData);

const conflictResult = await validateAsync(
  conflictingData,
  userRegistrationSchema
);
console.log(
  '\nValidation result:',
  conflictResult.valid ? '✅ Valid' : '❌ Invalid'
);

if (!conflictResult.valid) {
  console.log('❌ Validation failed as expected:');
  conflictResult.errors.forEach((error) => {
    console.log(`  - ${error.path}: ${error.message}`);
  });
}

console.log('\n🔄 Testing createAsyncValidator...\n');

// Create reusable async validators
const emailValidator = createAsyncValidator({
  type: 'string',
  email: true,
  validateAsync: async (email) => {
    const exists = await mockEmailService.checkEmailExists(email);
    const deliverable = await mockEmailService.checkEmailDeliverable(email);

    if (exists) return 'Email already registered';
    if (!deliverable) return 'Email is not deliverable';
    return true;
  },
});

const usernameValidator = createAsyncValidator({
  type: 'string',
  alphanumeric: true,
  minLength: 3,
  maxLength: 32,
  validateAsync: async (username) => {
    const reserved = await mockUsernameService.checkUsernameReserved(username);
    const exists = await mockUsernameService.checkUsernameExists(username);

    if (reserved) return 'Username is reserved';
    if (exists) return 'Username already taken';
    return true;
  },
});

// Test reusable validators
console.log('Testing reusable email validator:');
const emailTest1 = await emailValidator('test@fake-domain.com'); // Undeliverable
console.log(
  'Undeliverable email:',
  emailTest1.valid ? '✅ Valid' : '❌ Invalid'
);
if (!emailTest1.valid) {
  console.log('Error:', emailTest1.errors[0].message);
}

const emailTest2 = await emailValidator('valid@example.com'); // Valid
console.log('Valid email:', emailTest2.valid ? '✅ Valid' : '❌ Invalid');

console.log('\nTesting reusable username validator:');
const usernameTest1 = await usernameValidator('admin'); // Reserved
console.log(
  'Reserved username:',
  usernameTest1.valid ? '✅ Valid' : '❌ Invalid'
);
if (!usernameTest1.valid) {
  console.log('Error:', usernameTest1.errors[0].message);
}

const usernameTest2 = await usernameValidator('availableuser'); // Available
console.log(
  'Available username:',
  usernameTest2.valid ? '✅ Valid' : '❌ Invalid'
);

console.log('\n🔄 Testing abort early option...\n');

// Test abort early behavior with async validation
const multiErrorData = {
  email: 'john@example.com', // Exists
  username: 'jane456', // Exists
  password: 'weak', // Too weak
  age: 15, // Too young
};

console.log('Testing with abortEarly=true:');
const abortEarlyResult = await validateAsync(
  multiErrorData,
  userRegistrationSchema,
  {
    abortEarly: true,
  }
);
console.log('Errors found:', abortEarlyResult.errors.length);
console.log('First error:', abortEarlyResult.errors[0]?.message);

console.log('\nTesting with abortEarly=false:');
const allErrorsResult = await validateAsync(
  multiErrorData,
  userRegistrationSchema,
  {
    abortEarly: false,
  }
);
console.log('All errors found:', allErrorsResult.errors.length);
allErrorsResult.errors.forEach((error, index) => {
  console.log(`  ${index + 1}. ${error.path}: ${error.message}`);
});

console.log('\n🔄 Testing mixed sync and async validation...\n');

// Schema with both sync and async validation
const mixedSchema = createSchema({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      required: true,
      email: true, // Sync validation
      validateAsync: async (email) => {
        // Async validation
        const exists = await mockEmailService.checkEmailExists(email);
        return exists ? 'Email already exists' : true;
      },
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8, // Sync validation
      validate: (password) => {
        // Sync custom validation
        if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter';
        if (!/[0-9]/.test(password)) return 'Must contain number';
        return true;
      },
    },
  },
});

const mixedData = {
  email: 'valid@test.com',
  password: 'ValidPass123',
};

console.log('Testing mixed sync/async validation:');
const mixedResult = await validateAsync(mixedData, mixedSchema);
console.log('Result:', mixedResult.valid ? '✅ Valid' : '❌ Invalid');

console.log('\n✅ Async validation examples complete!');
