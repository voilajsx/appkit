/**
 * Password hashing and verification demonstration using @voilajsx/appkit/auth
 * @module @voilajsx/appkit/auth
 * @file src/auth/examples/01-password-basics.js
 * Run: node 01-password-basics.js
 */

import { hashPassword, comparePassword } from '../index.js';

/**
 * Demonstrates basic password hashing and verification with environment configuration
 * @returns {Promise<void>}
 */
async function demo() {
  try {
    console.log('=== Password Hashing Demo ===\n');

    const password = 'MyPassword123';

    // 1. Environment variable configuration
    console.log('1. Setting up environment configuration...');
    process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';
    console.log('   VOILA_AUTH_BCRYPT_ROUNDS=12');
    console.log('');

    // 2. Hash password using environment configuration
    console.log('2. Hashing password with environment configuration...');
    const hashWithEnv = await hashPassword(password);
    console.log('Hash (using env rounds=12):', hashWithEnv);
    console.log('Hash length:', hashWithEnv.length, 'characters');
    console.log('');

    // 3. Hash password with explicit rounds (overrides environment)
    console.log('3. Hashing password with explicit rounds...');
    const hashWithExplicit = await hashPassword(password, 10);
    console.log('Hash (using explicit rounds=10):', hashWithExplicit);
    console.log('Hash length:', hashWithExplicit.length, 'characters');
    console.log('Note: Explicit rounds (10) override environment setting (12)');
    console.log('');

    // 4. Verify passwords with correct password
    console.log('4. Verifying passwords with correct password...');
    const isValidEnv = await comparePassword(password, hashWithEnv);
    const isValidExplicit = await comparePassword(password, hashWithExplicit);
    console.log(
      'Environment hash verification:',
      isValidEnv ? '✅ Valid' : '❌ Invalid'
    );
    console.log(
      'Explicit hash verification:',
      isValidExplicit ? '✅ Valid' : '❌ Invalid'
    );
    console.log('');

    // 5. Verify with wrong password
    console.log('5. Verifying with wrong password...');
    const wrongPassword = 'WrongPassword123';
    const isWrongEnv = await comparePassword(wrongPassword, hashWithEnv);
    const isWrongExplicit = await comparePassword(
      wrongPassword,
      hashWithExplicit
    );
    console.log(
      'Wrong password vs env hash:',
      isWrongEnv ? '✅ Valid' : '❌ Invalid'
    );
    console.log(
      'Wrong password vs explicit hash:',
      isWrongExplicit ? '✅ Valid' : '❌ Invalid'
    );
    console.log('');

    // 6. Different rounds comparison
    console.log('6. Comparing different bcrypt rounds...');

    // Fast rounds (development)
    process.env.VOILA_AUTH_BCRYPT_ROUNDS = '8';
    const fastHash = await hashPassword(password);

    // Secure rounds (production)
    const secureHash = await hashPassword(password, 14);

    console.log('Fast hash (8 rounds):', fastHash.substring(0, 30) + '...');
    console.log(
      'Secure hash (14 rounds):',
      secureHash.substring(0, 30) + '...'
    );
    console.log('');

    // 7. Performance comparison
    console.log('7. Performance comparison...');

    const startTime = Date.now();
    await hashPassword(password, 8);
    const fastTime = Date.now() - startTime;

    const startTimeSecure = Date.now();
    await hashPassword(password, 12);
    const secureTime = Date.now() - startTimeSecure;

    console.log(`8 rounds took: ${fastTime}ms`);
    console.log(`12 rounds took: ${secureTime}ms`);
    console.log(
      `Security vs Speed: ${Math.round(secureTime / fastTime)}x slower for better security`
    );
    console.log('');

    console.log('=== Demo completed successfully! ===');
    console.log('\n📋 Key takeaways:');
    console.log('• Use VOILA_AUTH_BCRYPT_ROUNDS for consistent configuration');
    console.log('• Explicit rounds parameter overrides environment variable');
    console.log('• Higher rounds = more security but slower performance');
    console.log('• Recommended: 10-12 rounds for production applications');
    console.log('• Each hash is unique even for the same password (salt)');
  } catch (error) {
    console.error('❌ Demo error:', error.message);
  }
}

/**
 * Demonstrates real-world password scenarios
 */
async function realWorldScenarios() {
  console.log('\n=== Real-World Scenarios ===\n');

  try {
    // Scenario 1: User registration
    console.log('Scenario 1: User Registration');
    process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12'; // Production setting

    const userPassword = 'UserPassword123!';
    const hashedForStorage = await hashPassword(userPassword);

    console.log('User password hashed for database storage:');
    console.log('Original:', userPassword);
    console.log('Hashed:', hashedForStorage.substring(0, 40) + '...');
    console.log('Ready for database storage ✅');
    console.log('');

    // Scenario 2: User login
    console.log('Scenario 2: User Login');
    const loginAttempt = 'UserPassword123!';
    const isAuthenticated = await comparePassword(
      loginAttempt,
      hashedForStorage
    );

    console.log('Login attempt:', loginAttempt);
    console.log(
      'Authentication result:',
      isAuthenticated ? '✅ Success' : '❌ Failed'
    );
    console.log('');

    // Scenario 3: Password reset
    console.log('Scenario 3: Password Reset');
    const newPassword = 'NewSecurePassword456!';
    const newHashedPassword = await hashPassword(newPassword);

    console.log('New password hashed for update:');
    console.log('New password:', newPassword);
    console.log('New hash:', newHashedPassword.substring(0, 40) + '...');
    console.log('Database can be updated with new hash ✅');
    console.log('');

    // Scenario 4: Environment-specific configuration
    console.log('Scenario 4: Environment-Specific Configuration');

    // Development environment
    process.env.NODE_ENV = 'development';
    process.env.VOILA_AUTH_BCRYPT_ROUNDS = '8'; // Faster for development
    const devHash = await hashPassword('devPassword');

    // Production environment
    process.env.NODE_ENV = 'production';
    process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12'; // More secure for production
    const prodHash = await hashPassword('prodPassword');

    console.log(
      'Development hash (8 rounds):',
      devHash.substring(0, 30) + '...'
    );
    console.log(
      'Production hash (12 rounds):',
      prodHash.substring(0, 30) + '...'
    );
    console.log('Environment-specific security levels configured ✅');
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
