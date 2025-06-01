/**
 * Express middleware error handling demonstration using @voilajsx/appkit/error
 * @module @voilajsx/appkit/error
 * @file src/error/examples/02-express-middleware.js
 * Run: node 02-express-middleware.js
 */

import express from 'express';
import {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationError,
  notFoundError,
  authError,
} from '../index.js';

const app = express();
app.use(express.json());

/**
 * Demonstrates error handling in Express routes
 */
function setupRoutes() {
  // Route that throws validation error
  app.get('/validation-error', (req, res) => {
    throw validationError('Missing required parameter');
  });

  // Route that throws not found error
  app.get('/not-found-error', (req, res) => {
    throw notFoundError('Resource not found');
  });

  // Route that throws auth error
  app.get('/auth-error', (req, res) => {
    throw authError('Authentication required');
  });

  // Async route with error handling
  app.get(
    '/async-error',
    asyncHandler(async (req, res) => {
      // Simulate async operation that fails
      await new Promise((resolve) => setTimeout(resolve, 100));
      throw notFoundError('User not found');
    })
  );

  // Successful route
  app.get('/success', (req, res) => {
    res.json({ message: 'Everything works!' });
  });

  // Handle 404 for unmatched routes
  app.use(notFoundHandler());

  // Global error handler (must be last)
  app.use(errorHandler());
}

/**
 * Demonstrates the middleware in action
 */
async function demo() {
  setupRoutes();

  const PORT = 3000;
  const server = app.listen(PORT, () => {
    console.log('=== Express Error Handling Demo ===\n');
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('\nTry these URLs:');
    console.log('✅ http://localhost:3000/success');
    console.log('❌ http://localhost:3000/validation-error');
    console.log('❌ http://localhost:3000/not-found-error');
    console.log('❌ http://localhost:3000/auth-error');
    console.log('❌ http://localhost:3000/async-error');
    console.log('❌ http://localhost:3000/unknown-route');
    console.log('\nPress Ctrl+C to stop server\n');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
      process.exit(0);
    });
  });
}

// Execute the demonstration
demo();
