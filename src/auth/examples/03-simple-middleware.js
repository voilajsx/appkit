/**
 * Authentication middleware demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/03-simple-middleware.js
 * Run: node 03-simple-middleware.js
 */

import { createAuthMiddleware, generateToken } from '../index.js';

/**
 * Demonstrates authentication middleware creation and usage with environment configuration
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== Authentication Middleware Demo ===\n');

    // 1. Environment variable configuration
    console.log('1. Setting up environment configuration...');
    process.env.VOILA_AUTH_SECRET = 'demo-middleware-secret-key';
    process.env.VOILA_AUTH_TOKEN_HEADER = 'authorization';
    process.env.VOILA_AUTH_COOKIE_NAME = 'token';

    console.log('   VOILA_AUTH_SECRET=demo-middleware-secret-key');
    console.log('   VOILA_AUTH_TOKEN_HEADER=authorization');
    console.log('   VOILA_AUTH_COOKIE_NAME=token');
    console.log('');

    // 2. Create basic middleware using environment configuration
    console.log(
      '2. Creating basic auth middleware with environment configuration...'
    );
    const basicAuth = createAuthMiddleware();
    console.log('Basic middleware created using environment variables ✅');
    console.log('');

    // 3. Create custom middleware with explicit options
    console.log('3. Creating custom middleware with explicit options...');
    const customAuth = createAuthMiddleware({
      secret: 'explicit-secret-override',
      getToken: (req) => {
        // Custom token extraction logic
        console.log('  🔍 Custom token extraction called');

        // Check custom header first
        if (req.headers['x-api-key']) {
          console.log('  📝 Token found in x-api-key header');
          return req.headers['x-api-key'];
        }

        // Check Authorization header
        if (req.headers.authorization?.startsWith('Bearer ')) {
          console.log('  📝 Token found in Authorization header');
          return req.headers.authorization.slice(7);
        }

        // Check cookies
        if (req.cookies?.token) {
          console.log('  📝 Token found in cookies');
          return req.cookies.token;
        }

        console.log('  ❌ No token found');
        return null;
      },
      onError: (error, req, res) => {
        console.log('  🚨 Custom error handler called:', error.message);
        // In a real app, this would send an HTTP response
        console.log('  📤 Would send 401 response with custom error format');
      },
    });
    console.log('Custom middleware created with explicit options ✅');
    console.log('Note: Explicit secret overrides environment variable');
    console.log('');

    // 4. Simulate middleware usage with different token sources
    console.log('4. Simulating middleware usage...');

    // Generate test tokens
    const envToken = generateToken({ userId: '123', role: 'user' }); // Uses env secret
    const explicitToken = generateToken(
      { userId: '456', role: 'admin' },
      { secret: 'explicit-secret-override' }
    );

    console.log('Test tokens generated:');
    console.log('  Environment token:', envToken.substring(0, 40) + '...');
    console.log('  Explicit token:', explicitToken.substring(0, 40) + '...');
    console.log('');

    // Test 1: Authorization header with basic middleware
    console.log('Test 1: Authorization header with basic middleware');
    const mockRequest1 = {
      headers: { authorization: `Bearer ${envToken}` },
      cookies: {},
    };

    await simulateMiddleware(
      basicAuth,
      mockRequest1,
      'Basic auth with Authorization header'
    );
    console.log('');

    // Test 2: Cookie with basic middleware
    console.log('Test 2: Cookie with basic middleware');
    const mockRequest2 = {
      headers: {},
      cookies: { token: envToken },
    };

    await simulateMiddleware(basicAuth, mockRequest2, 'Basic auth with cookie');
    console.log('');

    // Test 3: Custom header with custom middleware
    console.log('Test 3: Custom header with custom middleware');
    const mockRequest3 = {
      headers: { 'x-api-key': explicitToken },
      cookies: {},
    };

    await simulateMiddleware(
      customAuth,
      mockRequest3,
      'Custom auth with x-api-key header'
    );
    console.log('');

    // Test 4: No token (should fail)
    console.log('Test 4: No token provided (should fail)');
    const mockRequest4 = {
      headers: {},
      cookies: {},
    };

    await simulateMiddleware(
      basicAuth,
      mockRequest4,
      'Basic auth with no token'
    );
    console.log('');

    // Test 5: Invalid token (should fail)
    console.log('Test 5: Invalid token (should fail)');
    const mockRequest5 = {
      headers: { authorization: 'Bearer invalid.token.here' },
      cookies: {},
    };

    await simulateMiddleware(
      basicAuth,
      mockRequest5,
      'Basic auth with invalid token'
    );
    console.log('');

    // 5. Advanced middleware configuration
    console.log('5. Advanced middleware configuration...');

    // Environment-based middleware with custom token sources
    process.env.VOILA_AUTH_TOKEN_HEADER = 'x-auth-token';
    process.env.VOILA_AUTH_COOKIE_NAME = 'sessionToken';

    const advancedAuth = createAuthMiddleware({
      // Uses VOILA_AUTH_SECRET from environment
      getToken: (req) => {
        const headerName =
          process.env.VOILA_AUTH_TOKEN_HEADER || 'authorization';
        const cookieName = process.env.VOILA_AUTH_COOKIE_NAME || 'token';

        console.log(`  🔍 Checking header: ${headerName}`);
        console.log(`  🔍 Checking cookie: ${cookieName}`);

        // Check custom header
        const headerValue = req.headers[headerName.toLowerCase()];
        if (headerValue) {
          if (headerValue.startsWith('Bearer ')) {
            return headerValue.slice(7);
          }
          return headerValue;
        }

        // Check custom cookie
        if (req.cookies?.[cookieName]) {
          return req.cookies[cookieName];
        }

        return null;
      },
    });

    console.log(
      'Advanced middleware created with environment-driven token sources ✅'
    );
    console.log('');

    // Test advanced middleware
    console.log('Test: Advanced middleware with custom environment settings');
    const mockRequest6 = {
      headers: { 'x-auth-token': envToken },
      cookies: {},
    };

    await simulateMiddleware(
      advancedAuth,
      mockRequest6,
      'Advanced auth with custom header'
    );
    console.log('');

    console.log('=== Demo completed successfully! ===');
    console.log('\n📋 Key takeaways:');
    console.log(
      '• Environment variables provide consistent middleware configuration'
    );
    console.log(
      '• Custom token extraction can use environment-driven header/cookie names'
    );
    console.log('• Explicit options override environment variables');
    console.log(
      '• Middleware automatically handles token verification and user context'
    );
    console.log(
      '• Custom error handlers allow application-specific error responses'
    );
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  }
}

/**
 * Simulates middleware execution with mock request/response objects
 * @param {Function} middleware - The middleware function to test
 * @param {Object} mockRequest - Mock request object
 * @param {string} testName - Name of the test for logging
 */
async function simulateMiddleware(middleware, mockRequest, testName) {
  console.log(`  🧪 ${testName}:`);

  // Mock response object
  const mockResponse = {
    status: (code) => ({
      json: (data) => {
        console.log(`    📤 Response ${code}:`, JSON.stringify(data, null, 6));
        return mockResponse;
      },
    }),
  };

  // Mock next function
  const mockNext = () => {
    console.log('    ✅ Middleware passed! User authenticated.');
    if (mockRequest.user) {
      console.log(
        '    👤 User data:',
        JSON.stringify(mockRequest.user, null, 6)
      );
    }
  };

  try {
    await middleware(mockRequest, mockResponse, mockNext);
  } catch (error) {
    console.log(`    ❌ Middleware error: ${error.message}`);
  }
}

/**
 * Demonstrates real-world middleware scenarios
 */
async function realWorldScenarios() {
  console.log('\n=== Real-World Middleware Scenarios ===\n');

  try {
    // Setup production-like environment
    process.env.VOILA_AUTH_SECRET = 'production-middleware-secret-2024';
    process.env.VOILA_AUTH_TOKEN_HEADER = 'authorization';
    process.env.VOILA_AUTH_COOKIE_NAME = 'authToken';

    // Scenario 1: Express.js integration
    console.log('Scenario 1: Express.js Integration');
    const expressAuth = createAuthMiddleware();

    console.log('Express middleware created with environment config ✅');
    console.log('Usage: app.get("/protected", auth, (req, res) => { ... })');
    console.log('');

    // Scenario 2: Fastify integration
    console.log('Scenario 2: Fastify Integration');
    const fastifyAuth = createAuthMiddleware({
      // Uses environment secret
      getToken: (req) => {
        // Fastify-specific token extraction
        return req.headers.authorization?.slice(7) || req.cookies?.authToken;
      },
      onError: (error, req, reply) => {
        // Fastify-specific error response
        console.log('Fastify error handler:', error.message);
        // reply.status(401).send({ error: error.message });
      },
    });

    console.log('Fastify middleware created with custom handlers ✅');
    console.log('Usage: fastify.addHook("preHandler", auth)');
    console.log('');

    // Scenario 3: API Gateway middleware
    console.log('Scenario 3: API Gateway Middleware');
    const gatewayAuth = createAuthMiddleware({
      getToken: (req) => {
        // Check multiple sources for API gateway
        return (
          req.headers['x-api-key'] ||
          req.headers.authorization?.slice(7) ||
          req.query?.token
        );
      },
      onError: (error, req, res) => {
        // Structured API error response
        const errorResponse = {
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        };
        console.log(
          'API Gateway error response:',
          JSON.stringify(errorResponse, null, 2)
        );
      },
    });

    console.log(
      'API Gateway middleware created with structured error handling ✅'
    );
    console.log('');

    // Scenario 4: Mobile app middleware
    console.log('Scenario 4: Mobile App Middleware');
    const mobileAuth = createAuthMiddleware({
      getToken: (req) => {
        // Mobile apps often use custom headers
        return (
          req.headers['x-mobile-token'] ||
          req.headers['x-app-auth'] ||
          req.headers.authorization?.slice(7)
        );
      },
    });

    console.log('Mobile app middleware created for custom token headers ✅');
    console.log('Supports: x-mobile-token, x-app-auth, authorization');
    console.log('');

    // Scenario 5: Multi-environment configuration
    console.log('Scenario 5: Multi-Environment Configuration');

    // Development
    process.env.NODE_ENV = 'development';
    process.env.VOILA_AUTH_SECRET = 'dev-secret-2024';
    process.env.VOILA_AUTH_TOKEN_HEADER = 'authorization';

    const devAuth = createAuthMiddleware();
    console.log('Development middleware: Uses env secret and standard headers');

    // Production
    process.env.NODE_ENV = 'production';
    process.env.VOILA_AUTH_SECRET = 'prod-ultra-secure-secret-2024';
    process.env.VOILA_AUTH_TOKEN_HEADER = 'x-secure-token';

    const prodAuth = createAuthMiddleware();
    console.log(
      'Production middleware: Uses secure env secret and custom headers'
    );
    console.log('Environment-specific middleware configuration ✅');
  } catch (error) {
    console.error('❌ Real-world scenario error:', error.message);
  }
}

// Execute the demonstrations
async function main() {
  await demo();
  await realWorldScenarios();
}

main().catch(console.error);
