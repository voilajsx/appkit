/**
 * Async route error handling demonstration using @voilajsx/appkit/error
 * @module @voilajsx/appkit/error
 * @file src/error/examples/03-async-routes.js
 * Run: node 03-async-routes.js
 */

import {
  asyncHandler,
  validationError,
  notFoundError,
  serverError,
  AppError,
} from '../index.js';

// Simulate database operations
const db = {
  async findUser(id) {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (id === '404') {
      return null; // User not found
    }
    if (id === 'error') {
      throw new Error('Database connection failed');
    }
    return { id, name: 'John Doe', email: 'john@example.com' };
  },

  async createUser(userData) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!userData.email) {
      throw validationError('Email is required');
    }
    if (userData.email === 'exists@example.com') {
      throw validationError('Email already exists');
    }

    return { id: '123', ...userData };
  },
};

/**
 * Simulates async route handlers with proper error handling
 * @returns {Promise<void>}
 */
async function demo() {
  console.log('=== Async Route Error Handling Demo ===\n');

  // 1. Successful async operation
  console.log('1. Testing successful user fetch...');
  const getUserRoute = asyncHandler(async (req, res) => {
    const user = await db.findUser('123');
    res.json({ user });
  });

  try {
    const mockReq = { params: { id: '123' } };
    const mockRes = {
      json: (data) => console.log('Response:', JSON.stringify(data, null, 2)),
    };
    await getUserRoute(mockReq, mockRes, () => {});
    console.log('✅ Success!\n');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // 2. Not found error
  console.log('2. Testing user not found...');
  const getUserNotFoundRoute = asyncHandler(async (req, res) => {
    const user = await db.findUser('404');
    if (!user) {
      throw notFoundError('User not found');
    }
    res.json({ user });
  });

  try {
    const mockReq = { params: { id: '404' } };
    const mockRes = { json: () => {} };
    await getUserNotFoundRoute(mockReq, mockRes, () => {});
  } catch (error) {
    if (error instanceof AppError) {
      console.log('✅ Caught AppError:', error.message);
      console.log('   Type:', error.type);
      console.log('   Status:', error.statusCode);
    }
  }
  console.log('');

  // 3. Database error handling
  console.log('3. Testing database error...');
  const getUserErrorRoute = asyncHandler(async (req, res) => {
    try {
      const user = await db.findUser('error');
      res.json({ user });
    } catch (error) {
      throw serverError('Failed to fetch user');
    }
  });

  try {
    const mockReq = { params: { id: 'error' } };
    const mockRes = { json: () => {} };
    await getUserErrorRoute(mockReq, mockRes, () => {});
  } catch (error) {
    console.log('✅ Caught server error:', error.message);
    console.log('   Status:', error.statusCode);
  }
  console.log('');

  // 4. Validation error in async operation
  console.log('4. Testing validation error...');
  const createUserRoute = asyncHandler(async (req, res) => {
    const user = await db.createUser(req.body);
    res.json({ user });
  });

  try {
    const mockReq = { body: { name: 'John' } }; // Missing email
    const mockRes = { json: () => {} };
    await createUserRoute(mockReq, mockRes, () => {});
  } catch (error) {
    console.log('✅ Caught validation error:', error.message);
    console.log('   Type:', error.type);
  }
  console.log('');

  console.log('Demo completed! All async errors were handled properly.');
}

// Execute the demonstration
demo();
