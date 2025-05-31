/**
 * JWT Basics - @voilajsx/appkit Auth Module
 *
 * Simple example showing JWT token generation and verification
 * No external dependencies needed - just run it!
 *
 * Run: node 02-jwt-basics.js
 * @file src/auth/examples/02-jwt-basics.js
 */

import { generateToken, verifyToken } from '../index.js';

function demo() {
  console.log('=== JWT Token Demo ===\n');

  const secret = 'my-secret-key';

  // Generate a token
  console.log('1. Generating token...');
  const token = generateToken(
    { userId: '123', email: 'user@example.com' },
    { secret }
  );
  console.log('Token:', token);
  console.log('');

  // Verify the token
  console.log('2. Verifying token...');
  try {
    const payload = verifyToken(token, { secret });
    console.log('Token is valid!');
    console.log('Payload:', payload);
  } catch (error) {
    console.log('Token verification failed:', error.message);
  }
  console.log('');

  // Try with wrong secret
  console.log('3. Verifying with wrong secret...');
  try {
    verifyToken(token, { secret: 'wrong-secret' });
  } catch (error) {
    console.log('Expected error:', error.message);
  }
}

demo();
