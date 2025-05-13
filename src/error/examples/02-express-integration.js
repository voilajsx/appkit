/**
 * Express Integration - @voilajs/appkit Error Module
 *
 * This example demonstrates using error handlers with Express
 *
 * Dependencies: express
 * Run: npm install express
 *       node 02-express-integration.js
 */

import express from 'express';
import {
  createErrorHandler,
  notFoundHandler,
  asyncHandler,
  validationError,
  notFoundError,
  authenticationError,
} from '@voilajs/appkit/error';

function startServer() {
  console.log('=== Express Integration Demo ===\n');
  console.log('Starting server...');

  const app = express();
  app.use(express.json());

  // 1. Basic Routes
  console.log('1. Setting up routes:');

  // Success route
  app.get('/api/success', (req, res) => {
    console.log('  - Success route accessed');
    res.json({ message: 'Success!' });
  });

  // Route with validation error
  app.post('/api/users', (req, res) => {
    console.log('  - Create user route accessed');
    const { name, email } = req.body;
    const errors = {};

    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';

    if (Object.keys(errors).length > 0) {
      console.log('    Validation failed:', errors);
      throw validationError(errors);
    }

    res.status(201).json({ id: '123', name, email });
  });

  // Route with not found error
  app.get('/api/users/:id', (req, res) => {
    console.log(`  - Get user route accessed: ${req.params.id}`);

    // Only user with ID '123' exists
    if (req.params.id !== '123') {
      console.log(`    User not found: ${req.params.id}`);
      throw notFoundError('User', req.params.id);
    }

    res.json({ id: '123', name: 'John Doe', email: 'john@example.com' });
  });

  // Protected route
  app.get('/api/profile', (req, res) => {
    console.log('  - Profile route accessed');
    const token = req.headers.authorization;

    if (!token || token !== 'valid-token') {
      console.log('    Authentication failed');
      throw authenticationError('Authentication required');
    }

    res.json({ id: '123', name: 'John Doe' });
  });

  // Async route using asyncHandler
  app.get(
    '/api/async',
    asyncHandler(async (req, res) => {
      console.log('  - Async route accessed');

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Randomly throw an error to demonstrate async error handling
      if (Math.random() < 0.5) {
        console.log('    Async error occurred');
        throw new Error('Random async error');
      }

      res.json({ message: 'Async operation completed successfully' });
    })
  );

  // 2. Error Handling Middleware
  console.log('2. Setting up error handling:');

  // Add 404 handler
  app.use(notFoundHandler());
  console.log('  - 404 handler added');

  // Add error handler
  app.use(
    createErrorHandler({
      includeStack: true,
      logger: (error) => {
        console.log('  - Error logged:', {
          type: error.type || 'UNKNOWN',
          message: error.message,
          path: error.url,
        });
      },
    })
  );
  console.log('  - Error handler added');

  // Start the server
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log('\nTry these endpoints with curl or your browser:');
    console.log('- GET  http://localhost:3000/api/success         (success)');
    console.log(
      '- POST http://localhost:3000/api/users           (validation error)'
    );
    console.log('- GET  http://localhost:3000/api/users/123       (success)');
    console.log(
      '- GET  http://localhost:3000/api/users/456       (not found error)'
    );
    console.log(
      '- GET  http://localhost:3000/api/profile         (auth error)'
    );
    console.log(
      '- GET  http://localhost:3000/api/async           (random async error)'
    );
    console.log(
      '- GET  http://localhost:3000/api/unknown         (not found route)'
    );

    console.log('\nExample curl commands:');
    console.log('curl http://localhost:3000/api/success');
    console.log(
      'curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/users -d \'{}\''
    );
    console.log('curl http://localhost:3000/api/users/456');
    console.log(
      'curl -H "Authorization: valid-token" http://localhost:3000/api/profile'
    );
  });
}

startServer();

/* Expected console output:
=== Express Integration Demo ===

Starting server...
1. Setting up routes:
2. Setting up error handling:
  - 404 handler added
  - Error handler added

Server running on http://localhost:3000

Try these endpoints with curl or your browser:
- GET  http://localhost:3000/api/success         (success)
- POST http://localhost:3000/api/users           (validation error)
- GET  http://localhost:3000/api/users/123       (success)
- GET  http://localhost:3000/api/users/456       (not found error)
- GET  http://localhost:3000/api/profile         (auth error)
- GET  http://localhost:3000/api/async           (random async error)
- GET  http://localhost:3000/api/unknown         (not found route)

Example curl commands:
curl http://localhost:3000/api/success
curl -X POST -H "Content-Type: application/json" http://localhost:3000/api/users -d '{}'
curl http://localhost:3000/api/users/456
curl -H "Authorization: valid-token" http://localhost:3000/api/profile

// When endpoints are accessed:
  - Success route accessed
  - Create user route accessed
    Validation failed: { name: 'Name is required', email: 'Email is required' }
  - Error logged: { type: 'VALIDATION_ERROR', message: 'Validation failed', path: '/api/users' }
  - Get user route accessed: 456
    User not found: 456
  - Error logged: { type: 'NOT_FOUND', message: 'User not found', path: '/api/users/456' }
  - Profile route accessed
    Authentication failed
  - Error logged: { type: 'AUTHENTICATION_ERROR', message: 'Authentication required', path: '/api/profile' }
  - Async route accessed
    Async error occurred
  - Error logged: { type: 'INTERNAL_ERROR', message: 'Random async error', path: '/api/async' }
  - Error logged: { type: 'NOT_FOUND', message: 'Route GET /api/unknown not found', path: '/api/unknown' }
*/
