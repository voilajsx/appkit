/**
 * Custom Schemas - @voilajsx/appkit
 *
 * Simple example showing how to create and extend custom validation schemas
 *
 * Run: node 06-custom-schemas.js
 */

import {
  validate,
  createSchema,
  mergeSchemas,
  extendSchema,
  userRegistrationSchema,
} from '../index.js';

console.log('🔧 Custom Schema Examples\n');

// Create a simple custom schema
const blogPostSchema = createSchema({
  type: 'object',
  properties: {
    title: {
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 100,
    },
    content: {
      type: 'string',
      required: true,
      minLength: 50,
      maxLength: 5000,
    },
    tags: {
      type: 'array',
      items: { type: 'string', slug: true },
      maxItems: 10,
      unique: true,
    },
    published: {
      type: 'boolean',
      default: false,
    },
  },
});

console.log('📝 Testing custom blog post schema:');
const blogPost = {
  title: 'Getting Started with Node.js',
  content:
    'Node.js is a powerful JavaScript runtime that allows you to build server-side applications. In this post, we will explore the basics of Node.js and how to get started with building your first application.',
  tags: ['nodejs', 'javascript', 'tutorial'],
  published: true,
};

const blogResult = validate(blogPost, blogPostSchema);
console.log(blogResult.valid ? '✅ Valid blog post' : '❌ Invalid blog post');
if (!blogResult.valid) {
  blogResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Extend existing schema
console.log('\n🔄 Extending user registration schema:');
const extendedUserSchema = extendSchema(userRegistrationSchema, {
  properties: {
    phoneNumber: {
      type: 'string',
      required: true,
      phone: true,
    },
    dateOfBirth: {
      type: 'string',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    newsletter: {
      type: 'boolean',
      default: false,
    },
  },
  required: ['phoneNumber', 'dateOfBirth'],
});

const extendedUser = {
  email: 'user@example.com',
  password: 'MyStr0ng!Pass',
  username: 'newuser',
  firstName: 'John',
  lastName: 'Doe',
  terms: true,
  phoneNumber: '+1234567890',
  dateOfBirth: '1990-05-15',
  newsletter: true,
};

const extendedResult = validate(extendedUser, extendedUserSchema);
console.log(
  extendedResult.valid
    ? '✅ Valid extended user data'
    : '❌ Invalid extended user data'
);
if (!extendedResult.valid) {
  extendedResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Merge multiple schemas
console.log('\n🔀 Merging multiple schemas:');
const addressSchema = createSchema({
  type: 'object',
  properties: {
    street: { type: 'string', required: true },
    city: { type: 'string', required: true },
    country: { type: 'string', required: true },
    postalCode: { type: 'string', required: true },
  },
});

const contactSchema = createSchema({
  type: 'object',
  properties: {
    phone: { type: 'string', phone: true },
    website: { type: 'string', url: true },
  },
});

const profileSchema = mergeSchemas(addressSchema, contactSchema, {
  type: 'object',
  properties: {
    bio: { type: 'string', maxLength: 500 },
    avatar: { type: 'string', url: true },
  },
});

const profileData = {
  street: '123 Main St',
  city: 'New York',
  country: 'US',
  postalCode: '10001',
  phone: '+1234567890',
  website: 'https://example.com',
  bio: 'Software developer and tech enthusiast',
  avatar: 'https://example.com/avatar.jpg',
};

const profileResult = validate(profileData, profileSchema);
console.log(
  profileResult.valid
    ? '✅ Valid merged profile data'
    : '❌ Invalid merged profile data'
);
if (!profileResult.valid) {
  profileResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Schema with custom validation function
console.log('\n⚙️ Schema with custom validation:');
const passwordConfirmSchema = createSchema({
  type: 'object',
  properties: {
    password: {
      type: 'string',
      required: true,
      minLength: 8,
    },
    confirmPassword: {
      type: 'string',
      required: true,
    },
  },
  validate: function (data) {
    if (data.password !== data.confirmPassword) {
      return 'Passwords do not match';
    }
    return true;
  },
});

const passwordData = {
  password: 'MyPassword123',
  confirmPassword: 'MyPassword123',
};

const passwordMismatch = {
  password: 'MyPassword123',
  confirmPassword: 'DifferentPassword',
};

console.log('Testing matching passwords:');
const matchResult = validate(passwordData, passwordConfirmSchema);
console.log(
  matchResult.valid ? '✅ Passwords match' : '❌ Passwords do not match'
);

console.log('\nTesting mismatched passwords:');
const mismatchResult = validate(passwordMismatch, passwordConfirmSchema);
console.log(
  mismatchResult.valid ? '✅ Passwords match' : '❌ Passwords do not match'
);
if (!mismatchResult.valid) {
  mismatchResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

console.log('\n✅ Custom schema examples complete!');
