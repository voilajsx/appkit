/**
 * JWT token creation and verification demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/02-jwt-basics.js
 * Run: node 02-jwt-basics.js
 */

import { generateToken, verifyToken } from '../index.js';

/**
 * Demonstrates basic JWT token operations with environment configuration
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== JWT Token Demo ===\n');

    const userData = {
      userId: '123',
      email: 'user@example.com',
      role: 'admin',
    };

    // 1. Environment variable configuration
    console.log('1. Setting up environment configuration...');
    process.env.VOILA_AUTH_SECRET = 'my-super-secret-jwt-key-for-demo';
    process.env.VOILA_AUTH_EXPIRES_IN = '1h';
    process.env.VOILA_AUTH_ALGORITHM = 'HS256';

    console.log('   VOILA_AUTH_SECRET=my-super-secret-jwt-key-for-demo');
    console.log('   VOILA_AUTH_EXPIRES_IN=1h');
    console.log('   VOILA_AUTH_ALGORITHM=HS256');
    console.log('');

    // 2. Create token using environment configuration
    console.log('2. Creating JWT token with environment configuration...');
    const tokenWithEnv = generateToken(userData);
    console.log('Token (using env config):', tokenWithEnv);
    console.log(
      'Token parts:',
      tokenWithEnv.split('.').length === 3
        ? '✅ Valid JWT structure'
        : '❌ Invalid structure'
    );
    console.log('');

    // 3. Create token with explicit options (overrides environment)
    console.log('3. Creating JWT token with explicit options...');
    const tokenExplicit = generateToken(userData, {
      secret: 'explicit-secret-key',
      expiresIn: '30m',
      algorithm: 'HS512',
    });
    console.log('Token (explicit options):', tokenExplicit);
    console.log('Note: Explicit options override environment variables');
    console.log('');

    // 4. Verify token using environment configuration
    console.log('4. Verifying token with environment configuration...');
    try {
      const payloadEnv = verifyToken(tokenWithEnv);
      console.log('✅ Token verified successfully');
      console.log('Payload:', JSON.stringify(payloadEnv, null, 2));
      console.log(
        'Token expiration:',
        new Date(payloadEnv.exp * 1000).toISOString()
      );
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }
    console.log('');

    // 5. Verify explicit token with explicit secret
    console.log('5. Verifying explicit token with matching secret...');
    try {
      const payloadExplicit = verifyToken(tokenExplicit, {
        secret: 'explicit-secret-key',
      });
      console.log('✅ Explicit token verified successfully');
      console.log('Payload:', JSON.stringify(payloadExplicit, null, 2));
    } catch (error) {
      console.log('❌ Explicit token verification failed:', error.message);
    }
    console.log('');

    // 6. Cross-verification (should fail)
    console.log('6. Cross-verification test (should fail)...');
    try {
      // Try to verify env token with explicit secret
      verifyToken(tokenWithEnv, { secret: 'explicit-secret-key' });
      console.log('❌ Unexpected success - this should have failed');
    } catch (error) {
      console.log('✅ Expected failure:', error.message);
      console.log('Different secrets produce different signatures');
    }
    console.log('');

    // 7. Different expiration times
    console.log('7. Different expiration times...');

    // Short-lived token
    process.env.VOILA_AUTH_EXPIRES_IN = '5m';
    const shortToken = generateToken({
      userId: '456',
      action: 'password-reset',
    });

    // Long-lived token
    const longToken = generateToken(
      { userId: '789', type: 'refresh' },
      { expiresIn: '7d' }
    );

    const shortPayload = verifyToken(shortToken);
    const longPayload = verifyToken(longToken);

    console.log(
      'Short-lived token expires:',
      new Date(shortPayload.exp * 1000).toISOString()
    );
    console.log(
      'Long-lived token expires:',
      new Date(longPayload.exp * 1000).toISOString()
    );
    console.log('');

    // 8. Different algorithms
    console.log('8. Different algorithms...');

    // HS256 (environment default)
    process.env.VOILA_AUTH_ALGORITHM = 'HS256';
    const hs256Token = generateToken({ test: 'hs256' });

    // HS512 (explicit)
    const hs512Token = generateToken({ test: 'hs512' }, { algorithm: 'HS512' });

    console.log('HS256 token:', hs256Token.substring(0, 50) + '...');
    console.log('HS512 token:', hs512Token.substring(0, 50) + '...');

    // Verify with correct algorithms
    const hs256Payload = verifyToken(hs256Token);
    const hs512Payload = verifyToken(hs512Token, { algorithms: ['HS512'] });

    console.log(
      'HS256 verification:',
      hs256Payload ? '✅ Success' : '❌ Failed'
    );
    console.log(
      'HS512 verification:',
      hs512Payload ? '✅ Success' : '❌ Failed'
    );
    console.log('');

    console.log('=== Demo completed successfully! ===');
    console.log('\n📋 Key takeaways:');
    console.log(
      '• Use VOILA_AUTH_* environment variables for consistent configuration'
    );
    console.log('• Explicit options always override environment variables');
    console.log('• Different secrets create different token signatures');
    console.log('• Token expiration is embedded in the payload');
    console.log('• Algorithm choice affects token signature');
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  }
}

/**
 * Demonstrates real-world JWT scenarios
 */
async function realWorldScenarios() {
  console.log('\n=== Real-World JWT Scenarios ===\n');

  try {
    // Setup production-like environment
    process.env.VOILA_AUTH_SECRET = 'production-grade-secret-key-2024';
    process.env.VOILA_AUTH_EXPIRES_IN = '15m';

    // Scenario 1: User login flow
    console.log('Scenario 1: User Login Flow');
    const loginData = {
      userId: 'user_12345',
      email: 'john.doe@example.com',
      role: 'user',
      permissions: ['read', 'write'],
    };

    const accessToken = generateToken(loginData);
    console.log('Access token generated for user login ✅');
    console.log('Token:', accessToken.substring(0, 50) + '...');

    // Verify the login token
    const userInfo = verifyToken(accessToken);
    console.log('User authenticated:', userInfo.email);
    console.log('User role:', userInfo.role);
    console.log('');

    // Scenario 2: Refresh token flow
    console.log('Scenario 2: Refresh Token Flow');
    const refreshTokenData = {
      userId: 'user_12345',
      type: 'refresh',
      sessionId: 'session_abc123',
    };

    const refreshToken = generateToken(refreshTokenData, { expiresIn: '7d' });
    console.log('Refresh token generated (7 days) ✅');
    console.log('Refresh token:', refreshToken.substring(0, 50) + '...');
    console.log('');

    // Scenario 3: Password reset token
    console.log('Scenario 3: Password Reset Token');
    const resetTokenData = {
      userId: 'user_12345',
      action: 'password-reset',
      timestamp: Date.now(),
    };

    const resetToken = generateToken(resetTokenData, { expiresIn: '1h' });
    console.log('Password reset token generated (1 hour) ✅');
    console.log('Reset token:', resetToken.substring(0, 50) + '...');

    // Verify reset token
    const resetInfo = verifyToken(resetToken);
    console.log('Reset token valid for user:', resetInfo.userId);
    console.log('Reset action:', resetInfo.action);
    console.log('');

    // Scenario 4: API key token
    console.log('Scenario 4: API Key Token');
    const apiKeyData = {
      clientId: 'api_client_789',
      scope: ['read:users', 'write:posts'],
      rateLimitTier: 'premium',
    };

    const apiToken = generateToken(apiKeyData, { expiresIn: '30d' });
    console.log('API key token generated (30 days) ✅');
    console.log('API token:', apiToken.substring(0, 50) + '...');
    console.log('');

    // Scenario 5: Token expiration handling
    console.log('Scenario 5: Token Expiration Handling');

    // Create a token that expires very soon
    const shortLivedToken = generateToken(
      { test: 'expiration' },
      { expiresIn: '1ms' }
    );

    // Wait for it to expire
    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      verifyToken(shortLivedToken);
      console.log('❌ Token should have expired');
    } catch (error) {
      console.log('✅ Token expiration handled correctly:', error.message);
    }
    console.log('');

    // Scenario 6: Environment-specific secrets
    console.log('Scenario 6: Environment-Specific Configuration');

    // Development environment
    process.env.NODE_ENV = 'development';
    process.env.VOILA_AUTH_SECRET = 'dev-secret-key';
    process.env.VOILA_AUTH_EXPIRES_IN = '24h'; // Longer for development

    const devToken = generateToken({ env: 'development' });
    console.log(
      'Development token (24h expiry):',
      devToken.substring(0, 30) + '...'
    );

    // Production environment
    process.env.NODE_ENV = 'production';
    process.env.VOILA_AUTH_SECRET = 'prod-ultra-secure-secret-key-2024';
    process.env.VOILA_AUTH_EXPIRES_IN = '15m'; // Shorter for production

    const prodToken = generateToken({ env: 'production' });
    console.log(
      'Production token (15m expiry):',
      prodToken.substring(0, 30) + '...'
    );
    console.log('Environment-specific token configuration ✅');
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
