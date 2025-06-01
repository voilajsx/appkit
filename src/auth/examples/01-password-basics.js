/**
 * Password hashing and verification demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/01-password-basics.js
 * Run: node 01-password-basics.js
 */

import { hashPassword, comparePassword } from '@voilajsx/appkit/auth';

/**
 * Demonstrates basic password hashing and verification
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== Password Hashing Demo ===\n');

    const password = 'MyPassword123';

    // Hash a password
    console.log('1. Hashing password...');
    const hash = await hashPassword(password);
    console.log('Hash:', hash);
    console.log('');

    // Compare with correct password
    console.log('2. Checking correct password...');
    const isValid = await comparePassword(password, hash);
    console.log('Is valid?', isValid);
    console.log('');

    // Compare with wrong password
    console.log('3. Checking wrong password...');
    const isWrong = await comparePassword('wrongpassword', hash);
    console.log('Is valid?', isWrong);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Execute the demonstration
demo();
