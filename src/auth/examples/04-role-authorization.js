/**
 * Role-based authorization middleware demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/04-role-authorization.js
 * Run: node 04-role-authorization.js
 */

import {
  createAuthorizationMiddleware,
  generateToken,
} from '@voilajsx/appkit/auth';

/**
 * Demonstrates role-based authorization middleware
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== Role Authorization Demo ===\n');

    // Create different role middlewares
    console.log('1. Creating role middlewares...');
    const adminOnly = createAuthorizationMiddleware(['admin']);
    const editorAccess = createAuthorizationMiddleware(['editor', 'admin']);
    console.log('Admin-only and editor middlewares created');
    console.log('');

    // Create custom role middleware
    console.log('2. Creating custom role middleware...');
    const premiumAccess = createAuthorizationMiddleware(['premium'], {
      getRoles: (req) => {
        // Custom logic: check if user has premium subscription
        if (req.user.subscription === 'premium') {
          return ['premium'];
        }
        return req.user.roles || [];
      },
    });
    console.log('Premium access middleware created');
    console.log('');

    // Simulate authorization checks
    console.log('3. Testing authorization...');

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
    console.log('\nTesting admin access:');
    testRoleAccess(adminOnly, { user: adminUser }, 'Admin user');
    testRoleAccess(adminOnly, { user: editorUser }, 'Editor user');

    // Test editor access
    console.log('\nTesting editor access:');
    testRoleAccess(editorAccess, { user: editorUser }, 'Editor user');
    testRoleAccess(editorAccess, { user: adminUser }, 'Admin user');
    testRoleAccess(editorAccess, { user: regularUser }, 'Regular user');

    // Test premium access
    console.log('\nTesting premium access:');
    testRoleAccess(premiumAccess, { user: premiumUser }, 'Premium user');
    testRoleAccess(premiumAccess, { user: regularUser }, 'Regular user');
  } catch (error) {
    console.error('Error:', error.message);
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
      json: (data) =>
        console.log(
          `${userType}: ${code === 403 ? '❌ Access denied' : '✅ Access granted'}`
        ),
    }),
  };

  try {
    middleware(mockReq, mockRes, () => {
      console.log(`${userType}: ✅ Access granted`);
    });
  } catch (error) {
    console.log(`${userType}: ❌ ${error.message}`);
  }
}

// Execute the demonstration
demo();
