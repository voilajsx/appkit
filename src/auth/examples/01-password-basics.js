/**
 * Password Basics - @voilajsx/appkit Auth Module
 *
 * Simple example showing password hashing and comparison
 * No external dependencies needed - just run it!
 *
 * Run: node 01-password-basics.js
 */

import { hashPassword, comparePassword } from '../index.js';

async function demo() {
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
}

demo().catch(console.error);
