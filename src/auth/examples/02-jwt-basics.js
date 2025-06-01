/**
 * JWT token creation and verification demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/02-jwt-basics.js
 * Run: node 02-jwt-basics.js
 */

import { generateToken, verifyToken } from '@voilajsx/appkit/auth';

/**
 * Demonstrates basic JWT token operations
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== JWT Token Demo ===\n');

    const userData = { userId: '123', email: 'user@example.com' };
    const secret = 'your-secret-key';

    // Generate a token
    console.log('1. Creating JWT token...');
    const token = generateToken(userData, { secret, expiresIn: '1h' });
    console.log('Token:', token);
    console.log('');

    // Verify the token
    console.log('2. Verifying token...');
    const payload = verifyToken(token, { secret });
    console.log('Payload:', payload);
    console.log('');

    // Try with wrong secret
    console.log('3. Verifying with wrong secret...');
    try {
      verifyToken(token, { secret: 'wrong-secret' });
    } catch (error) {
      console.log('Error:', error.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Execute the demonstration
demo();
