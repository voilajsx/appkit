/**
 * Basic Validation - @voilajsx/appkit
 * @file src/validation/examples/01-basic-validation.js
 *
 * Simple example showing how to validate data with schemas and built-in validators
 *
 * Run: node 01-basic-validation.js
 *
 */

import {
  validate,
  createValidator,
  commonSchemas,
  createSchema,
  isEmail,
  isUrl,
  isAlphanumeric,
} from '../index.js';

// Sample user data
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  password: 'MyStr0ng!Pass',
  website: 'https://johndoe.com',
  username: 'johndoe123',
};

console.log('🔍 Testing built-in validators...\n');

// Test built-in validators
console.log(
  'Email validation:',
  isEmail('john@example.com') ? '✅ Valid' : '❌ Invalid'
);
console.log(
  'URL validation:',
  isUrl('https://johndoe.com') ? '✅ Valid' : '❌ Invalid'
);
console.log(
  'Username validation:',
  isAlphanumeric('johndoe123') ? '✅ Valid' : '❌ Invalid'
);
console.log(
  'Invalid email:',
  isEmail('invalid-email') ? '✅ Valid' : '❌ Invalid'
);

console.log('\n🔍 Using common schemas...\n');

// Test individual common schemas
const emailResult = validate('john@example.com', commonSchemas.email);
console.log('Email schema:', emailResult.valid ? '✅ Valid' : '❌ Invalid');

const passwordResult = validate('MyStr0ng!Pass', commonSchemas.password);
console.log(
  'Password schema:',
  passwordResult.valid ? '✅ Valid' : '❌ Invalid'
);

const usernameResult = validate('johndoe123', commonSchemas.username);
console.log(
  'Username schema:',
  usernameResult.valid ? '✅ Valid' : '❌ Invalid'
);

console.log('\n🔍 Creating and using custom schema...\n');

// Create a custom user schema using common schemas
const userSchema = createSchema({
  type: 'object',
  properties: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    email: commonSchemas.email,
    age: { type: 'number', required: true, min: 18, max: 120 },
    password: commonSchemas.password,
    website: commonSchemas.url,
    username: commonSchemas.username,
  },
});

// Validate the complete user data
const result = validate(userData, userSchema);

if (result.valid) {
  console.log('✅ User data is valid!');
  console.log('Validated data:', result.value);
} else {
  console.log('❌ Validation failed:');
  result.errors.forEach((error) => {
    console.log(`  - ${error.path}: ${error.message}`);
  });
}

console.log('\n🔍 Testing validation with invalid data...\n');

// Test with invalid data
const invalidUserData = {
  name: 'J', // Too short
  email: 'invalid-email', // Invalid email
  age: 15, // Too young
  password: '123', // Weak password
  website: 'not-a-url', // Invalid URL
  username: 'user@name!', // Invalid characters
};

const invalidResult = validate(invalidUserData, userSchema);

console.log('Invalid data validation result:');
if (!invalidResult.valid) {
  console.log('❌ Validation failed as expected:');
  invalidResult.errors.forEach((error) => {
    console.log(`  - ${error.path}: ${error.message}`);
  });
}

console.log('\n🔍 Creating reusable validator...\n');

// Create a reusable validator
const userValidator = createValidator(userSchema);

// Test the reusable validator
const reusableResult = userValidator(userData);
console.log(
  'Reusable validator result:',
  reusableResult.valid ? '✅ Valid' : '❌ Invalid'
);

// Test with abort early option
const abortEarlyResult = userValidator(invalidUserData, { abortEarly: true });
console.log(
  '\nWith abortEarly=true, errors found:',
  abortEarlyResult.errors.length
);

const allErrorsResult = userValidator(invalidUserData, { abortEarly: false });
console.log(
  'With abortEarly=false, errors found:',
  allErrorsResult.errors.length
);

console.log('\n✅ Basic validation examples complete!');
