/**
 * Basic Validation - @voilajsx/appkit
 *
 * Simple example showing how to validate data with schemas
 *
 * Run: node 01-basic-validation.js
 */

import { validate, isEmail, isStrongPassword } from '../index.js';

// Sample user data
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  password: 'MyStr0ng!Pass',
};

// Define a simple validation schema
const userSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', required: true, minLength: 2 },
    email: { type: 'string', required: true, email: true },
    age: { type: 'number', required: true, min: 18, max: 120 },
    password: { type: 'string', required: true, strongPassword: true },
  },
};

console.log('🔍 Validating user data...\n');

// Validate the data
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

console.log('\n🔍 Quick validator checks...\n');

// Quick validation checks
console.log(
  'Email check:',
  isEmail('user@example.com') ? '✅ Valid' : '❌ Invalid'
);
console.log(
  'Password strength:',
  isStrongPassword('MyStr0ng!Pass') ? '✅ Strong' : '❌ Weak'
);
console.log(
  'Weak password:',
  isStrongPassword('123456') ? '✅ Strong' : '❌ Weak'
);

console.log('\n✅ Basic validation complete!');
