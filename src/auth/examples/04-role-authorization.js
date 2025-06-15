/**
 * Role-based authorization middleware demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/04-role-authorization.js
 * Run: node 04-role-authorization.js
 */

import { createAuthorizationMiddleware, generateToken } from '../index.js';

/**
 * Demonstrates role-based authorization middleware with environment configuration
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== Role Authorization Demo ===\n');

    // 1. Environment variable configuration
    console.log('1. Setting up environment configuration...');
    process.env.VOILA_AUTH_SECRET = 'role-demo-secret-key';
    process.env.VOILA_AUTH_EXPIRES_IN = '1h';

    console.log('   VOILA_AUTH_SECRET=role-demo-secret-key');
    console.log('   VOILA_AUTH_EXPIRES_IN=1h');
    console.log('');

    // 2. Create different role middlewares
    console.log('2. Creating role middlewares...');
    const adminOnly = createAuthorizationMiddleware(['admin']);
    const editorAccess = createAuthorizationMiddleware(['editor', 'admin']);
    const userAccess = createAuthorizationMiddleware([
      'user',
      'editor',
      'admin',
    ]);

    console.log('Admin-only middleware created ✅');
    console.log('Editor access middleware created ✅');
    console.log('User access middleware created ✅');
    console.log('');

    // 3. Create custom role middleware
    console.log('3. Creating custom role middleware...');
    const premiumAccess = createAuthorizationMiddleware(['premium'], {
      getRoles: (req) => {
        // Custom logic: check if user has premium subscription
        if (req.user.subscription === 'premium') {
          return ['premium'];
        }
        return req.user.roles || [];
      },
    });
    console.log('Premium access middleware created ✅');
    console.log('');

    // 4. Test authorization with different users
    console.log('4. Testing authorization...\n');

    // Mock users with different roles
    const adminUser = { userId: '1', roles: ['admin'] };
    const editorUser = { userId: '2', roles: ['editor'] };
    const regularUser = { userId: '3', roles: ['user'] };
    const premiumUser = {
      userId: '4',
      roles: ['user'],
      subscription: 'premium',
    };

    // Test admin access
    console.log('🧪 Testing admin access:');
    testRoleAccess(adminOnly, { user: adminUser }, 'Admin user');
    testRoleAccess(adminOnly, { user: editorUser }, 'Editor user');
    testRoleAccess(adminOnly, { user: regularUser }, 'Regular user');
    console.log('');

    // Test editor access
    console.log('🧪 Testing editor access:');
    testRoleAccess(editorAccess, { user: adminUser }, 'Admin user');
    testRoleAccess(editorAccess, { user: editorUser }, 'Editor user');
    testRoleAccess(editorAccess, { user: regularUser }, 'Regular user');
    console.log('');

    // Test user access
    console.log('🧪 Testing user access:');
    testRoleAccess(userAccess, { user: adminUser }, 'Admin user');
    testRoleAccess(userAccess, { user: editorUser }, 'Editor user');
    testRoleAccess(userAccess, { user: regularUser }, 'Regular user');
    console.log('');

    // Test premium access
    console.log('🧪 Testing premium access:');
    testRoleAccess(premiumAccess, { user: premiumUser }, 'Premium user');
    testRoleAccess(premiumAccess, { user: regularUser }, 'Regular user');
    testRoleAccess(
      premiumAccess,
      { user: adminUser },
      'Admin user (no premium)'
    );
    console.log('');

    // 5. Generate tokens with environment configuration
    console.log('5. Generating tokens with environment configuration...');

    // Uses VOILA_AUTH_SECRET and VOILA_AUTH_EXPIRES_IN automatically
    const adminToken = generateToken(adminUser);
    const editorToken = generateToken(editorUser);
    const userToken = generateToken(regularUser);

    console.log('Tokens generated using environment variables:');
    console.log('  Admin token:', adminToken.substring(0, 30) + '...');
    console.log('  Editor token:', editorToken.substring(0, 30) + '...');
    console.log('  User token:', userToken.substring(0, 30) + '...');
    console.log('');

    console.log('=== Demo completed successfully! ===');
    console.log('\n📋 Key takeaways:');
    console.log('• Role-based authorization provides granular access control');
    console.log('• Multiple roles can be allowed for flexible access');
    console.log('• Custom role logic enables subscription-based access');
    console.log('• Environment variables provide consistent token generation');
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  }
}

/**
 * Tests role access with mock request and response
 * @param {Function} middleware - Authorization middleware
 * @param {Object} mockReq - Mock request object
 * @param {string} userType - Description of user type
 */
function testRoleAccess(middleware, mockReq, userType) {
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        const result = code === 403 ? '❌ Access denied' : '✅ Access granted';
        console.log(`  ${userType}: ${result}`);
      },
    }),
  };

  const mockNext = () => {
    console.log(`  ${userType}: ✅ Access granted`);
  };

  try {
    middleware(mockReq, mockRes, mockNext);
  } catch (error) {
    console.log(`  ${userType}: ❌ ${error.message}`);
  }
}

// Execute the demonstration
demo();
