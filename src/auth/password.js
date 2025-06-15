/**
 * @voilajsx/appkit - Password hashing utilities
 * @module @voilajsx/appkit/auth/password
 * @file src/auth/password.js
 *
 * Production-ready functions to securely hash passwords and verify them using bcrypt.
 */

import bcrypt from 'bcrypt';

/**
 * Validates bcrypt rounds for security and performance
 * @param {number} rounds - Number of salt rounds
 * @throws {Error} If rounds are outside safe range
 */
function validateRounds(rounds) {
  if (rounds < 8) {
    throw new Error('Bcrypt rounds must be at least 8 for security');
  }

  if (rounds > 15) {
    throw new Error('Bcrypt rounds should not exceed 15 for performance');
  }
}

/**
 * Hashes a password using bcrypt
 * @param {string} password - Plain text password to hash
 * @param {number} [rounds=10] - Number of salt rounds (uses VOILA_AUTH_BCRYPT_ROUNDS if not provided)
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password, rounds) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  const saltRounds =
    rounds || parseInt(process.env.VOILA_AUTH_BCRYPT_ROUNDS) || 10;

  // Validate rounds for production security
  validateRounds(saltRounds);

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
}

/**
 * Compares a plain text password against a hashed password
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} True if password matches the hash
 */
export async function comparePassword(password, hash) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (!hash || typeof hash !== 'string') {
    throw new Error('Hash must be a non-empty string');
  }

  // Validate hash format (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (!hash.match(/^\$2[aby]\$\d{2}\$/)) {
    throw new Error('Invalid hash format');
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Failed to compare password: ${error.message}`);
  }
}
