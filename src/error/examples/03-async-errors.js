/**
 * Async Error Handling - @voilajs/appkit Error Module
 *
 * This example demonstrates handling errors in async functions
 *
 * Dependencies: express
 * Run: npm install express
 *       node 03-async-errors.js
 */

import express from 'express';
import {
  asyncHandler,
  notFoundError,
  validationError,
  createErrorHandler,
} from '@voilajs/appkit/error';

// Simulated database functions with artificial delays
async function findUser(id) {
  // Simulate database delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log(`Finding user with ID: ${id}`);

  // Mock database
  const users = {
    1: { id: '1', name: 'John Doe', email: 'john@example.com' },
    2: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  };

  return users[id] || null;
}

async function createUser(data) {
  // Simulate database delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log(`Creating user: ${JSON.stringify(data)}`);

  // Validate data
  if (!data.name || !data.email) {
    throw new Error('Invalid user data');
  }

  // Create a new user (simulation)
  return {
    id: '3',
    name: data.name,
    email: data.email,
    createdAt: new Date().toISOString(),
  };
}

function demoAsyncHandling() {
  console.log('=== Async Error Handling Demo ===\n');

  const app = express();
  app.use(express.json());

  // 1. Unsafe Async Route (NO asyncHandler)
  console.log('1. Setting up unsafe async route (will crash on error):');
  app.get('/unsafe/:id', async (req, res) => {
    console.log(`  - Unsafe route accessed: ${req.params.id}`);

    // This will crash the server if an error occurs!
    const user = await findUser(req.params.id);

    if (!user) {
      // Inconsistent error handling
      console.log(`    User not found, sending 404 response`);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });

  // 2. Safe Async Route (WITH asyncHandler)
  console.log('2. Setting up safe async route (with asyncHandler):');
  app.get(
    '/users/:id',
    asyncHandler(async (req, res) => {
      console.log(`  - Safe route accessed: ${req.params.id}`);

      // This will be caught by asyncHandler
      const user = await findUser(req.params.id);

      if (!user) {
        console.log('    User not found, throwing notFoundError');
        throw notFoundError('User', req.params.id);
      }

      res.json(user);
    })
  );

  // 3. Async Route with Validation
  console.log('3. Setting up route with validation:');
  app.post(
    '/users',
    asyncHandler(async (req, res) => {
      console.log('  - Create user route accessed');
      const { name, email } = req.body;
      const errors = {};

      // Validate input
      if (!name) errors.name = 'Name is required';
      if (!email) errors.email = 'Email is required';

      if (Object.keys(errors).length > 0) {
        console.log(`    Validation failed: ${JSON.stringify(errors)}`);
        throw validationError(errors);
      }

      try {
        // Create user
        const user = await createUser({ name, email });
        res.status(201).json(user);
      } catch (error) {
        console.log(`    Error caught inside handler: ${error.message}`);

        // Transform to validation error if needed
        if (error.message === 'Invalid user data') {
          throw validationError({ general: 'Invalid user data provided' });
        }

        // Re-throw the error (will be caught by asyncHandler)
        throw error;
      }
    })
  );

  // 4. Error handling middleware
  console.log('4. Setting up error handling middleware:');
  app.use(
    createErrorHandler({
      logger: (error) => {
        console.log(
          `  - Error logged: Type=${error.type || 'UNKNOWN'}, Message=${error.message}`
        );
      },
    })
  );

  // Start the server
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log('\nTry these endpoints with curl or your browser:');
    console.log('- GET  http://localhost:3000/users/1            (success)');
    console.log(
      '- GET  http://localhost:3000/users/999          (not found error - properly handled)'
    );
    console.log(
      '- GET  http://localhost:3000/unsafe/1           (success but unsafe implementation)'
    );
    console.log(
      '- GET  http://localhost:3000/unsafe/999         (not found - inconsistent error format)'
    );
    console.log(
      '- POST http://localhost:3000/users              (validation error if missing fields)'
    );

    console.log('\nExample curl commands:');
    console.log('curl http://localhost:3000/users/1');
    console.log('curl http://localhost:3000/users/999');
    console.log(
      'curl -X POST -H "Content-Type: application/json" http://localhost:3000/users -d \'{"name":"Alice","email":"alice@example.com"}\''
    );
    console.log(
      'curl -X POST -H "Content-Type: application/json" http://localhost:3000/users -d \'{}\''
    );
  });
}

demoAsyncHandling();

/* Expected console output:
=== Async Error Handling Demo ===

1. Setting up unsafe async route (will crash on error):
2. Setting up safe async route (with asyncHandler):
3. Setting up route with validation:
4. Setting up error handling middleware:

Server running on http://localhost:3000

Try these endpoints with curl or your browser:
- GET  http://localhost:3000/users/1            (success)
- GET  http://localhost:3000/users/999          (not found error - properly handled)
- GET  http://localhost:3000/unsafe/1           (success but unsafe implementation)
- GET  http://localhost:3000/unsafe/999         (not found - inconsistent error format)
- POST http://localhost:3000/users              (validation error if missing fields)

Example curl commands:
curl http://localhost:3000/users/1
curl http://localhost:3000/users/999
curl -X POST -H "Content-Type: application/json" http://localhost:3000/users -d '{"name":"Alice","email":"alice@example.com"}'
curl -X POST -H "Content-Type: application/json" http://localhost:3000/users -d '{}'

// When endpoints are accessed:
  - Safe route accessed: 1
Finding user with ID: 1
  - Safe route accessed: 999
Finding user with ID: 999
    User not found, throwing notFoundError
  - Error logged: Type=NOT_FOUND, Message=User not found
  - Unsafe route accessed: 1
Finding user with ID: 1
  - Unsafe route accessed: 999
Finding user with ID: 999
    User not found, sending 404 response
  - Create user route accessed
    Validation failed: {"name":"Name is required","email":"Email is required"}
  - Error logged: Type=VALIDATION_ERROR, Message=Validation failed
  - Create user route accessed
Creating user: {"name":"Alice","email":"alice@example.com"}
*/
