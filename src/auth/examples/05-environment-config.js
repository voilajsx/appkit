/**
 * Environment configuration demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/05-environment-config.js
 * Run: node 05-environment-config.js
 */

import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '@voilajsx/appkit/auth';

/**
 * Demonstrates environment variable configuration for all auth functions
 * @returns {Promise<void>}
 */
async function demo() {
  console.log('=== Environment Configuration Demo ===\n');

  // Set environment variables (in real apps, these would be in .env file or deployment config)
  process.env.VOILA_AUTH_SECRET = 'demo-secret-key-do-not-use-in-production';
  process.env.VOILA_AUTH_EXPIRES_IN = '1h';
  process.env.VOILA_AUTH_ALGORITHM = 'HS256';
  process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';
  process.env.VOILA_AUTH_TOKEN_HEADER = 'x-auth-token';
  process.env.VOILA_AUTH_COOKIE_NAME = 'authToken';

  console.log('Environment variables set:');
  console.log('- VOILA_AUTH_SECRET: [HIDDEN]');
  console.log('- VOILA_AUTH_EXPIRES_IN:', process.env.VOILA_AUTH_EXPIRES_IN);
  console.log('- VOILA_AUTH_ALGORITHM:', process.env.VOILA_AUTH_ALGORITHM);
  console.log(
    '- VOILA_AUTH_BCRYPT_ROUNDS:',
    process.env.VOILA_AUTH_BCRYPT_ROUNDS
  );
  console.log(
    '- VOILA_AUTH_TOKEN_HEADER:',
    process.env.VOILA_AUTH_TOKEN_HEADER
  );
  console.log('- VOILA_AUTH_COOKIE_NAME:', process.env.VOILA_AUTH_COOKIE_NAME);
  console.log('');

  try {
    // 1. Password hashing using environment configuration
    console.log('1. Password Hashing with Environment Config');
    console.log('-------------------------------------------');

    const password = 'MySecurePassword123!';
    console.log('Hashing password with environment rounds (12)...');

    const hash = await hashPassword(password); // Uses VOILA_AUTH_BCRYPT_ROUNDS
    console.log('Hash created successfully');

    const isValid = await comparePassword(password, hash);
    console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
    console.log('');

    // 2. JWT token generation using environment configuration
    console.log('2. JWT Token Generation with Environment Config');
    console.log('-----------------------------------------------');

    const userData = {
      userId: 'user_123',
      email: 'user@example.com',
      roles: ['user', 'premium'],
    };

    console.log('Generating token with environment config...');
    const token = generateToken(userData); // Uses VOILA_AUTH_SECRET, EXPIRES_IN, ALGORITHM
    console.log('Token generated successfully');
    console.log('Token preview:', token.substring(0, 50) + '...');
    console.log('');

    // 3. JWT token verification using environment configuration
    console.log('3. JWT Token Verification with Environment Config');
    console.log('-------------------------------------------------');

    console.log('Verifying token with environment secret...');
    const payload = verifyToken(token); // Uses VOILA_AUTH_SECRET
    console.log('Token verified successfully');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('');

    // 4. Authentication middleware using environment configuration
    console.log('4. Authentication Middleware with Environment Config');
    console.log('---------------------------------------------------');

    console.log('Creating auth middleware with environment config...');
    const auth = createAuthMiddleware(); // Uses VOILA_AUTH_SECRET, TOKEN_HEADER, COOKIE_NAME
    console.log('Auth middleware created successfully');

    // Simulate middleware usage
    console.log('Simulating request with custom header...');
    const mockRequest = {
      headers: { 'x-auth-token': token }, // Uses VOILA_AUTH_TOKEN_HEADER
      cookies: {},
      query: {},
    };

    const mockResponse = {
      status: (code) => ({
        json: (data) => console.log(`Response ${code}:`, data),
      }),
    };

    await new Promise((resolve) => {
      auth(mockRequest, mockResponse, () => {
        console.log('✅ Authentication successful');
        console.log('User data from token:', mockRequest.user);
        resolve();
      });
    });
    console.log('');

    // 5. Authorization middleware
    console.log('5. Authorization Middleware');
    console.log('---------------------------');

    console.log('Creating role-based authorization middleware...');
    const premiumOnly = createAuthorizationMiddleware(['premium']);
    const adminOnly = createAuthorizationMiddleware(['admin']);

    // Test premium access (should succeed)
    console.log('Testing premium access...');
    await new Promise((resolve) => {
      premiumOnly(mockRequest, mockResponse, () => {
        console.log('✅ Premium access granted');
        resolve();
      });
    });

    // Test admin access (should fail)
    console.log('Testing admin access...');
    try {
      await new Promise((resolve, reject) => {
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              console.log('❌ Admin access denied:', data.message);
              resolve();
            },
          }),
        };
        adminOnly(mockRequest, mockRes, resolve);
      });
    } catch (error) {
      console.log('❌ Admin access denied:', error.message);
    }
    console.log('');

    // 6. Demonstrate precedence (explicit options override environment)
    console.log('6. Configuration Precedence Demo');
    console.log('--------------------------------');

    console.log('Environment EXPIRES_IN:', process.env.VOILA_AUTH_EXPIRES_IN);
    console.log(
      'Generating token with explicit expiresIn (overrides environment)...'
    );

    const shortToken = generateToken(
      { userId: 'test' },
      { expiresIn: '5m' } // Explicit option overrides VOILA_AUTH_EXPIRES_IN
    );

    const shortPayload = verifyToken(shortToken);
    const envPayload = verifyToken(token);

    console.log(
      'Environment token expires at:',
      new Date(envPayload.exp * 1000).toISOString()
    );
    console.log(
      'Explicit token expires at:',
      new Date(shortPayload.exp * 1000).toISOString()
    );
    console.log(
      '✅ Explicit options successfully override environment variables'
    );
    console.log('');

    // 7. Real-world usage patterns
    console.log('7. Real-World Usage Patterns');
    console.log('-----------------------------');

    console.log('✅ Environment variables provide:');
    console.log('   - Consistent configuration across the application');
    console.log('   - Easy deployment configuration');
    console.log('   - Framework integration (e.g., Singlet, Express)');
    console.log('   - Security best practices (secrets in environment)');
    console.log('');

    console.log('✅ Explicit options provide:');
    console.log('   - Function-specific overrides');
    console.log('   - Testing flexibility');
    console.log('   - Special case handling');
    console.log('   - Migration from existing code');
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  } finally {
    // Clean up environment variables
    delete process.env.VOILA_AUTH_SECRET;
    delete process.env.VOILA_AUTH_EXPIRES_IN;
    delete process.env.VOILA_AUTH_ALGORITHM;
    delete process.env.VOILA_AUTH_BCRYPT_ROUNDS;
    delete process.env.VOILA_AUTH_TOKEN_HEADER;
    delete process.env.VOILA_AUTH_COOKIE_NAME;

    console.log('\n✨ Demo completed - environment variables cleaned up');
  }
}

// Execute the demonstration
demo();
