/**
 * Data Sanitization - @voilajsx/appkit
 * @file src/validation/examples/02-sanitization.js
 *
 * Simple example showing how to sanitize and clean input data
 *
 * Run: node 02-sanitization.js
 */

import {
  sanitize,
  sanitizeString,
  sanitizeNumber,
  sanitizeObject,
} from '../index.js';

console.log('🧹 Testing string sanitization...\n');

// String sanitization examples
const messyString = '   Hello WORLD!   ';
console.log('Original string:', JSON.stringify(messyString));

// Basic string cleaning
const trimmed = sanitizeString(messyString, { trim: true });
console.log('Trimmed:', JSON.stringify(trimmed));

const lowercase = sanitizeString(messyString, { trim: true, lowercase: true });
console.log('Lowercase:', JSON.stringify(lowercase));

const uppercase = sanitizeString(messyString, { trim: true, uppercase: true });
console.log('Uppercase:', JSON.stringify(uppercase));

// String truncation
const longText =
  'This is a very long text that needs to be truncated for safety';
const truncated = sanitizeString(longText, { truncate: 20 });
console.log('Truncated (20 chars):', JSON.stringify(truncated));

// String replacement and removal
const textWithNumbers = 'Hello123World456!';
const numbersRemoved = sanitizeString(textWithNumbers, { remove: ['[0-9]'] });
console.log('Numbers removed:', JSON.stringify(numbersRemoved));

const replaced = sanitizeString(textWithNumbers, {
  replace: { '[0-9]': '_', '!': '?' },
});
console.log('Numbers replaced with _, ! with ?:', JSON.stringify(replaced));

console.log('\n🧹 Testing number sanitization...\n');

// Number sanitization examples
console.log('Original numbers:', '3.14159', '"42"', 'NaN', '10.7');

// Basic number conversion
const pi = sanitizeNumber('3.14159', { precision: 2 });
console.log('Pi rounded to 2 decimals:', pi);

const stringNumber = sanitizeNumber('"42"');
console.log('String "42" converted:', stringNumber);

const invalidNumber = sanitizeNumber('invalid', { default: 0 });
console.log('Invalid number with default:', invalidNumber);

// Integer conversion
const decimal = sanitizeNumber('10.7', { integer: true });
console.log('Decimal truncated to integer:', decimal);

// Number clamping
const tooLarge = sanitizeNumber(150, { min: 0, max: 100, clamp: true });
console.log('150 clamped to 0-100 range:', tooLarge);

const tooSmall = sanitizeNumber(-50, { min: 0, max: 100, clamp: true });
console.log('-50 clamped to 0-100 range:', tooSmall);

console.log('\n🧹 Testing object sanitization...\n');

// Object sanitization examples
const messyUserData = {
  name: '  John Doe  ',
  email: '  JOHN@EXAMPLE.COM  ',
  age: '25',
  bio: '  Software developer with 5+ years experience  ',
  password: 'secret123',
  confirmPassword: 'secret123',
  extraField: 'should be removed',
  emptyField: '',
  nullField: null,
};

console.log('Original object:', messyUserData);

// Basic object cleaning
const cleanedObject = sanitizeObject(messyUserData, {
  pick: ['name', 'email', 'age', 'bio'], // Only keep these fields
  properties: {
    name: { trim: true },
    email: { trim: true, lowercase: true },
    age: { integer: true },
    bio: { trim: true, truncate: 50 },
  },
});

console.log('\nCleaned object (picked fields only):');
console.log(cleanedObject);

// Object with defaults
const userWithDefaults = sanitizeObject(
  {
    name: 'Jane',
    email: 'jane@test.com',
  },
  {
    defaults: {
      role: 'user',
      active: true,
      loginCount: 0,
    },
  }
);

console.log('\nObject with defaults applied:');
console.log(userWithDefaults);

// Remove empty values
const dataWithEmpties = {
  name: 'John',
  email: '',
  phone: null,
  age: 0,
  bio: 'Developer',
};

const withoutEmpties = sanitizeObject(dataWithEmpties, { removeEmpty: true });
console.log('\nData with empty values removed:');
console.log('Original:', dataWithEmpties);
console.log('Cleaned:', withoutEmpties);

console.log('\n🧹 Testing general sanitize function...\n');

// Using the general sanitize function
const mixedData = {
  title: '  MY BLOG POST  ',
  content: 'This is a very long blog post content that should be truncated...',
  views: '1500',
  published: 'true',
  tags: ['javascript', 'nodejs', 'validation'],
};

const sanitizedData = sanitize(mixedData, {
  properties: {
    title: { trim: true, lowercase: true, truncate: 20 },
    content: { trim: true, truncate: 50 },
    views: { integer: true },
    published: {
      /* boolean conversion would need custom logic */
    },
  },
});

console.log('Mixed data sanitization:');
console.log('Original:', mixedData);
console.log('Sanitized:', sanitizedData);

console.log('\n🧹 Real-world example: Form data cleaning...\n');

// Simulate form data from a web request
const formData = {
  firstName: '  john  ',
  lastName: '  DOE  ',
  email: '  JOHN.DOE@EXAMPLE.COM  ',
  phone: '  +1-555-123-4567  ',
  age: '28',
  salary: '75000.50',
  bio: '  I am a software engineer with experience in web development. I love coding and solving problems.  ',
  terms: 'on',
  newsletter: '',
  source: 'google-ads',
  timestamp: Date.now(),
};

console.log('Raw form data:', formData);

// Clean form data
const cleanFormData = sanitize(formData, {
  pick: [
    'firstName',
    'lastName',
    'email',
    'phone',
    'age',
    'salary',
    'bio',
    'terms',
    'newsletter',
  ],
  properties: {
    firstName: { trim: true, lowercase: true },
    lastName: { trim: true, uppercase: true },
    email: { trim: true, lowercase: true },
    phone: { trim: true },
    age: { integer: true, min: 18, max: 120, clamp: true },
    salary: { precision: 2, min: 0, clamp: true },
    bio: { trim: true, truncate: 200 },
    terms: {
      /* would need custom boolean logic */
    },
    newsletter: {
      /* would need custom boolean logic */
    },
  },
  removeEmpty: true,
});

console.log('\nCleaned form data:', cleanFormData);

console.log('\n✅ Data sanitization examples complete!');
