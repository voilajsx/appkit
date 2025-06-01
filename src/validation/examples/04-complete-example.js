/**
 * Complete Example - @voilajsx/appkit
 * @file src/validation/examples/04-complete-example.js
 *
 * Real-world example combining validation, sanitization, and error handling
 * Demonstrates a complete user registration flow with all framework features
 *
 * Run: node 04-complete-example.js
 */

import {
  validate,
  validateAsync,
  createValidator,
  createAsyncValidator,
  sanitize,
  commonSchemas,
  createValidationSchema,
  isEmail,
  isUrl,
  isAlphanumeric,
  ValidationError,
  utils,
} from '../index.js';

// Mock services for realistic validation
const mockServices = {
  async checkEmailExists(email) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const existingEmails = [
      'admin@company.com',
      'test@example.com',
      'user@demo.com',
    ];
    return existingEmails.includes(email.toLowerCase());
  },

  async checkUsernameExists(username) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const existingUsernames = ['admin', 'test', 'demo', 'user123'];
    return existingUsernames.includes(username.toLowerCase());
  },

  async validateDomain(email) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const blockedDomains = ['tempmail.com', '10minutemail.com', 'fake.com'];
    const domain = email.split('@')[1];
    return !blockedDomains.includes(domain);
  },
};

console.log('🏗️ Complete User Registration System Example\n');
console.log('='.repeat(50));

// Step 1: Define comprehensive user registration schema
console.log('\n📋 Step 1: Creating comprehensive registration schema...\n');

const userRegistrationSchema = createValidationSchema({
  type: 'object',
  properties: {
    // Personal Information
    firstName: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50,
      trim: true,
      validate: (value) => {
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          return 'First name can only contain letters and spaces';
        }
        return true;
      },
    },

    lastName: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50,
      trim: true,
      validate: (value) => {
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          return 'Last name can only contain letters and spaces';
        }
        return true;
      },
    },

    // Account Information
    email: {
      ...commonSchemas.email,
      validateAsync: async (email) => {
        // Check if email already exists
        const exists = await mockServices.checkEmailExists(email);
        if (exists) {
          return 'Email address is already registered';
        }

        // Check if domain is allowed
        const validDomain = await mockServices.validateDomain(email);
        if (!validDomain) {
          return 'Email domain is not allowed (temporary email services blocked)';
        }

        return true;
      },
    },

    username: {
      ...commonSchemas.username,
      validateAsync: async (username) => {
        const exists = await mockServices.checkUsernameExists(username);
        return exists ? 'Username is already taken' : true;
      },
    },

    password: commonSchemas.password,

    confirmPassword: {
      type: 'string',
      required: true,
      validate: (value, context) => {
        if (value !== context.data.password) {
          return 'Passwords do not match';
        }
        return true;
      },
    },

    // Optional Information
    age: {
      type: 'number',
      min: 18,
      max: 120,
      integer: true,
    },

    website: {
      ...commonSchemas.url,
      required: false,
    },

    bio: {
      type: 'string',
      maxLength: 500,
      trim: true,
      required: false,
    },

    // Terms and Privacy
    acceptTerms: {
      type: 'boolean',
      required: true,
      validate: (value) => {
        return value === true
          ? true
          : 'You must accept the terms and conditions';
      },
    },

    newsletter: {
      type: 'boolean',
      default: false,
    },
  },
});

// Step 2: Create data sanitization rules
console.log('🧹 Step 2: Setting up data sanitization...\n');

const sanitizationRules = {
  properties: {
    firstName: { trim: true },
    lastName: { trim: true },
    email: { trim: true, lowercase: true },
    username: { trim: true, lowercase: true },
    password: { trim: false }, // Never trim passwords
    confirmPassword: { trim: false },
    age: { integer: true },
    website: { trim: true },
    bio: { trim: true, truncate: 500 },
  },
  // Don't use pick/removeEmpty - preserve all fields for validation
};

// Step 3: Create validation pipeline
console.log('⚙️ Step 3: Building validation pipeline...\n');

const registrationPipeline = utils.pipeline(
  // Step 1: Sanitize input data
  async (data) => {
    console.log('  🧹 Sanitizing input data...');
    const sanitized = sanitize(data, sanitizationRules);
    return { valid: true, value: sanitized };
  },

  // Step 2: Comprehensive async validation
  createAsyncValidator(userRegistrationSchema)
);

// Step 4: Test with valid data
console.log('✅ Step 4: Testing with valid registration data...\n');

const validUserData = {
  firstName: '  john  ', // Will be sanitized
  lastName: '  DOE  ', // Will be sanitized
  email: '  NEWUSER@EXAMPLE.COM  ', // Will be sanitized
  username: '  johndoe2024  ', // Will be sanitized
  password: 'MySecureP@ssw0rd!',
  confirmPassword: 'MySecureP@ssw0rd!',
  age: '28', // Will be converted to number
  website: 'https://johndoe.dev',
  bio: '  Software developer passionate about web technologies  ',
  acceptTerms: true,
  newsletter: false,
};

console.log('Input data:', validUserData);

try {
  const result = await registrationPipeline(validUserData);

  if (result.valid) {
    console.log('\n🎉 Registration successful!');
    console.log('Processed user data:', result.value);
  } else {
    console.log('\n❌ Registration failed:');
    result.errors.forEach((error) => {
      console.log(`  - ${error.path}: ${error.message}`);
    });
  }
} catch (error) {
  console.log('\n💥 System error:', error.message);
}

// Step 5: Test with invalid data
console.log('\n' + '='.repeat(50));
console.log('❌ Step 5: Testing with invalid registration data...\n');

const invalidUserData = {
  firstName: 'J', // Too short
  lastName: '', // Missing
  email: 'admin@company.com', // Already exists
  username: 'admin', // Already exists
  password: 'weak', // Too weak
  confirmPassword: 'different', // Doesn't match
  age: 16, // Too young
  website: 'not-a-url', // Invalid URL
  bio: 'A'.repeat(600), // Too long
  acceptTerms: false, // Must be true
  newsletter: 'yes', // Wrong type
};

console.log('Invalid data:', invalidUserData);

try {
  const invalidResult = await registrationPipeline(invalidUserData);

  console.log('\n❌ Validation failed as expected:');
  console.log(`Found ${invalidResult.errors.length} errors:`);

  invalidResult.errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error.path}: ${error.message}`);
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('\n💥 Validation Error:');
    console.log('Error messages:', error.getMessages());
    console.log('Has errors:', error.hasErrors());
  } else {
    console.log('\n💥 System error:', error.message);
  }
}

// Step 6: Individual validator testing
console.log('\n' + '='.repeat(50));
console.log('🔍 Step 6: Testing individual validators...\n');

// Test built-in validators
const testCases = [
  { validator: isEmail, input: 'test@example.com', expected: true },
  { validator: isEmail, input: 'invalid-email', expected: false },
  { validator: isUrl, input: 'https://example.com', expected: true },
  { validator: isUrl, input: 'not-a-url', expected: false },
  { validator: isAlphanumeric, input: 'user123', expected: true },
  { validator: isAlphanumeric, input: 'user@123', expected: false },
];

testCases.forEach(({ validator, input, expected }) => {
  const result = validator(input);
  const status = result === expected ? '✅' : '❌';
  console.log(
    `${status} ${validator.name}('${input}') → ${result} (expected: ${expected})`
  );
});

// Step 7: Error handling demonstration
console.log('\n' + '='.repeat(50));
console.log('🛠️ Step 7: Error handling patterns...\n');

// Create a validator that can throw ValidationError
const strictEmailValidator = createValidator({
  type: 'string',
  email: true,
  validate: (email) => {
    if (email.includes('forbidden')) {
      throw new ValidationError('Forbidden email pattern detected', [
        {
          path: 'email',
          message: 'Email contains forbidden content',
          type: 'security',
        },
      ]);
    }
    return true;
  },
});

// Test error handling
try {
  console.log('Testing error handling with forbidden email...');
  const errorResult = strictEmailValidator('test@forbidden.com');

  if (!errorResult.valid) {
    console.log('✅ Validation failed as expected:');
    console.log(
      '  - Error messages:',
      errorResult.errors.map((e) => e.message)
    );
  } else {
    console.log('❌ Expected validation to fail');
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('✅ Caught ValidationError:');
    console.log('  - Has errors:', error.hasErrors());
    console.log('  - Error messages:', error.getMessages());
    console.log('  - Error details:', error.errors);
  } else {
    console.log('💥 Unexpected error:', error.message);
  }
}

// Step 8: Performance testing
console.log('\n' + '='.repeat(50));
console.log('⚡ Step 8: Performance comparison...\n');

const testData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'performance@test.com',
  username: 'perftest123',
  password: 'TestP@ssw0rd123',
  confirmPassword: 'TestP@ssw0rd123',
  acceptTerms: true,
};

// Test with abort early
console.log('Testing with abortEarly=true...');
const startTime1 = Date.now();
const quickResult = await validateAsync(testData, userRegistrationSchema, {
  abortEarly: true,
});
const duration1 = Date.now() - startTime1;
console.log(
  `✅ Quick validation completed in ${duration1}ms (found ${quickResult.errors.length} errors)`
);

// Test without abort early
console.log('\nTesting with abortEarly=false...');
const startTime2 = Date.now();
const fullResult = await validateAsync(testData, userRegistrationSchema, {
  abortEarly: false,
});
const duration2 = Date.now() - startTime2;
console.log(
  `✅ Full validation completed in ${duration2}ms (found ${fullResult.errors.length} errors)`
);

console.log('\n' + '='.repeat(50));
console.log('🎯 Summary: All validation features demonstrated!\n');

console.log('✅ Core Functions Used:');
console.log('  - validate() and validateAsync()');
console.log('  - createValidator() and createAsyncValidator()');
console.log('  - sanitize() and sanitization functions');
console.log('  - Built-in validators (isEmail, isUrl, isAlphanumeric)');
console.log('  - commonSchemas and createValidationSchema()');
console.log('  - ValidationError class with methods');
console.log('  - utils.pipeline() for validation workflows');

console.log('\n✅ Real-world Patterns Covered:');
console.log('  - Complete user registration flow');
console.log('  - Data sanitization before validation');
console.log('  - Async database uniqueness checks');
console.log('  - Cross-field validation (password confirmation)');
console.log('  - Custom validation rules');
console.log('  - Error handling and reporting');
console.log('  - Performance optimization strategies');

console.log('\n✅ Framework complete! Ready for production use. 🚀');
