/**
 * Authentication middleware demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/03-simple-middleware.js
 * Run: node 03-simple-middleware.js
 */

import { createAuthMiddleware, generateToken } from '@voilajsx/appkit/auth';

/**
 * Demonstrates authentication middleware creation and usage
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== Authentication Middleware Demo ===\n');

    const secret = 'your-secret-key';

    // Create basic middleware
    console.log('1. Creating basic auth middleware...');
    const basicAuth = createAuthMiddleware({ secret });
    console.log('Basic middleware created');
    console.log('');

    // Create custom middleware with token extraction
    console.log('2. Creating custom middleware...');
    const customAuth = createAuthMiddleware({
      secret,
      getToken: (req) => {
        // Check Authorization header first
        if (req.headers.authorization?.startsWith('Bearer ')) {
          return req.headers.authorization.slice(7);
        }
        // Check cookies
        if (req.cookies?.token) {
          return req.cookies.token;
        }
        return null;
      },
      onError: (error, req, res) => {
        console.log('Custom error handler:', error.message);
      },
    });
    console.log('Custom middleware created');
    console.log('');

    // Simulate middleware usage
    console.log('3. Simulating middleware usage...');
    const token = generateToken({ userId: '123' }, { secret });

    // Mock request object
    const mockRequest = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    };

    // Mock response object
    const mockResponse = {
      status: (code) => ({
        json: (data) => console.log(`Response ${code}:`, data),
      }),
    };

    // Simulate middleware execution
    basicAuth(mockRequest, mockResponse, () => {
      console.log('Middleware passed! User data:', mockRequest.user);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Execute the demonstration
demo();
