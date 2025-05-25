/**
 * Built-in Validators - @voilajsx/appkit
 *
 * Simple example showing various built-in validation functions
 *
 * Run: node 03-built-in-validators.js
 */

import {
  isEmail,
  isUrl,
  isPhoneNumber,
  isCreditCard,
  isStrongPassword,
  isUuid,
  isHexColor,
  isSlug,
  isAlphanumeric,
} from '../index.js';

console.log('🔍 Built-in Validator Examples\n');

// Test data
const testData = {
  email: 'user@example.com',
  badEmail: 'invalid-email',
  url: 'https://example.com',
  badUrl: 'not-a-url',
  phone: '+1234567890',
  badPhone: '123',
  creditCard: '4111111111111111', // Test Visa number
  badCreditCard: '1234567890',
  strongPassword: 'MyStr0ng!P@ss',
  weakPassword: '123456',
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  badUuid: 'not-a-uuid',
  hexColor: '#FF5733',
  badHexColor: '#ZZZ',
  slug: 'my-blog-post',
  badSlug: 'My Blog Post!',
  alphanumeric: 'abc123',
  badAlphanumeric: 'abc-123!',
};

// Test each validator
const tests = [
  {
    name: 'Email',
    validator: isEmail,
    good: testData.email,
    bad: testData.badEmail,
  },
  { name: 'URL', validator: isUrl, good: testData.url, bad: testData.badUrl },
  {
    name: 'Phone',
    validator: isPhoneNumber,
    good: testData.phone,
    bad: testData.badPhone,
  },
  {
    name: 'Credit Card',
    validator: isCreditCard,
    good: testData.creditCard,
    bad: testData.badCreditCard,
  },
  {
    name: 'Strong Password',
    validator: isStrongPassword,
    good: testData.strongPassword,
    bad: testData.weakPassword,
  },
  {
    name: 'UUID',
    validator: isUuid,
    good: testData.uuid,
    bad: testData.badUuid,
  },
  {
    name: 'Hex Color',
    validator: isHexColor,
    good: testData.hexColor,
    bad: testData.badHexColor,
  },
  {
    name: 'Slug',
    validator: isSlug,
    good: testData.slug,
    bad: testData.badSlug,
  },
  {
    name: 'Alphanumeric',
    validator: isAlphanumeric,
    good: testData.alphanumeric,
    bad: testData.badAlphanumeric,
  },
];

// Run tests
tests.forEach((test) => {
  console.log(`${test.name}:`);
  console.log(
    `  ✅ "${test.good}" -> ${test.validator(test.good) ? 'Valid' : 'Invalid'}`
  );
  console.log(
    `  ❌ "${test.bad}" -> ${test.validator(test.bad) ? 'Valid' : 'Invalid'}`
  );
  console.log('');
});

// Advanced validator options
console.log('🔧 Advanced Validator Options:\n');

// Email with options
const internationalEmail = 'пользователь@пример.рф';
console.log('International Email:');
console.log(
  `  "${internationalEmail}" -> ${isEmail(internationalEmail, { allowInternational: true }) ? 'Valid' : 'Invalid'}`
);

// URL with protocol requirements
const urlWithoutProtocol = 'example.com';
console.log('\nURL without protocol:');
console.log(
  `  "${urlWithoutProtocol}" -> ${isUrl(urlWithoutProtocol, { requireProtocol: false }) ? 'Valid' : 'Invalid'}`
);

// Password with custom requirements
const customPassword = 'SimplePass123';
console.log('\nCustom password requirements:');
console.log(
  `  "${customPassword}" -> ${isStrongPassword(customPassword, { requireSymbols: false }) ? 'Valid' : 'Invalid'}`
);

console.log('\n✅ Built-in validator tests complete!');
