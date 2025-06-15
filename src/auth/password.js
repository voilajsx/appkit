/**
 * @voilajsx/appkit - Password hashing utilities
 * @module @voilajsx/appkit/auth/password
 * @file src/auth/password.js
 *
 * Provides functions to securely hash passwords and verify them using bcrypt.
 * Designed for use within the @voilajsx/appkit authentication module.
 */

import bcrypt from 'bcrypt';

/**
 * Reads password configuration from VOILA_AUTH_* environment variables
 * @returns {Object} Environment configuration object
 */
function getConfigFromEnvironment() {
  const envConfig = {};

  if (process.env.VOILA_AUTH_BCRYPT_ROUNDS) {
    const rounds = parseInt(process.env.VOILA_AUTH_BCRYPT_ROUNDS);
    if (!isNaN(rounds) && rounds >= 4 && rounds <= 31) {
      envConfig.rounds = rounds;
    }
  }

  return envConfig;
}

/**
 * Hashes a password using bcrypt with configurable salt rounds
 *
 * @param {string} password - The plain text password to hash.
 * @param {number} [rounds=10] - The number of salt rounds for bcrypt.
 * @returns {Promise<string>} The resulting hashed password.
 * @throws {Error} If password is invalid or hashing fails.
 */
export async function hashPassword(password, rounds) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  // Minimum length check removed for flexibility, but empty string still invalid
  if (password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  // Merge environment config with provided rounds (explicit rounds take precedence)
  const envConfig = getConfigFromEnvironment();
  const finalRounds = rounds !== undefined ? rounds : envConfig.rounds || 10;

  try {
    return await bcrypt.hash(password, finalRounds);
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
}

/**
 * Compares a plain text password against a hashed password
 *
 * @param {string} password - The plain text password to verify.
 * @param {string} hash - The hashed password to compare against.
 * @returns {Promise<boolean>} Returns true if the password matches the hash.
 * @throws {Error} If inputs are invalid or comparison fails.
 */
export async function comparePassword(password, hash) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (!hash || typeof hash !== 'string') {
    throw new Error('Hash must be a non-empty string');
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Failed to compare password: ${error.message}`);
  }
}
