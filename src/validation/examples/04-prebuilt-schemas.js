/**
 * Pre-built Schemas - @voilajsx/appkit
 *
 * Simple example showing how to use pre-built validation schemas
 *
 * Run: node 04-prebuilt-schemas.js
 */

import {
  validate,
  userRegistrationSchema,
  productSchema,
  commentSchema,
  orderSchema,
} from '../index.js';

console.log('📋 Pre-built Schema Examples\n');

// Test user registration
console.log('👤 User Registration Validation:');
const userData = {
  email: 'john@example.com',
  password: 'MyStr0ng!Pass',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  terms: true,
};

const userResult = validate(userData, userRegistrationSchema);
console.log(userResult.valid ? '✅ Valid user data' : '❌ Invalid user data');
if (!userResult.valid) {
  userResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Test product validation
console.log('\n🛍️ Product Validation:');
const productData = {
  name: 'Wireless Headphones',
  price: 99.99,
  category: 'Electronics',
  description: 'High-quality wireless headphones with noise cancellation',
  sku: 'WH-001',
  tags: ['electronics', 'audio', 'wireless'],
  inStock: true,
};

const productResult = validate(productData, productSchema);
console.log(
  productResult.valid ? '✅ Valid product data' : '❌ Invalid product data'
);
if (!productResult.valid) {
  productResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Test comment validation
console.log('\n💬 Comment Validation:');
const commentData = {
  content: 'This is a great product! I highly recommend it.',
  rating: 5,
  authorName: 'Jane Smith',
  authorEmail: 'jane@example.com',
};

const commentResult = validate(commentData, commentSchema);
console.log(
  commentResult.valid ? '✅ Valid comment data' : '❌ Invalid comment data'
);
if (!commentResult.valid) {
  commentResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Test order validation
console.log('\n🛒 Order Validation:');
const orderData = {
  items: [
    {
      productId: 'WH-001',
      quantity: 2,
      price: 99.99,
      total: 199.98,
      name: 'Wireless Headphones',
    },
  ],
  customer: {
    email: 'customer@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
  },
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    country: 'US',
    postalCode: '10001',
  },
  paymentMethod: {
    type: 'credit_card',
    last4: '1234',
  },
  totals: {
    subtotal: 199.98,
    tax: 20.0,
    shipping: 10.0,
    total: 229.98,
  },
};

const orderResult = validate(orderData, orderSchema);
console.log(
  orderResult.valid ? '✅ Valid order data' : '❌ Invalid order data'
);
if (!orderResult.valid) {
  orderResult.errors.forEach((error) =>
    console.log(`  - ${error.path}: ${error.message}`)
  );
}

// Test invalid data
console.log('\n❌ Testing Invalid Data:');
const invalidUser = {
  email: 'invalid-email',
  password: '123', // Too weak
  username: 'jo', // Too short
  terms: false, // Must be true
};

const invalidResult = validate(invalidUser, userRegistrationSchema);
console.log('Invalid user validation errors:');
invalidResult.errors.forEach((error) =>
  console.log(`  - ${error.path}: ${error.message}`)
);

console.log('\n✅ Pre-built schema tests complete!');
