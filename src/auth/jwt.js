/**
 * @voilajsx/appkit - JWT utilities
 * @module @voilajsx/appkit/auth/jwt
 * @file src/auth/jwt.js
 *
 * Functions for generating and verifying JSON Web Tokens (JWT) using `jsonwebtoken`.
 */

import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token with the given payload and options.
 *
 * @param {Object} payload - The data to encode in the JWT payload.
 * @param {Object} options - Token generation options.
 * @param {string} options.secret - Secret key used to sign the token.
 * @param {string} [options.expiresIn='7d'] - Token expiration duration (e.g., '1h', '7d').
 * @param {string} [options.algorithm='HS256'] - Signing algorithm to use.
 * @returns {string} Signed JWT token.
 * @throws {Error} If payload is not an object or secret is missing.
 */
export function generateToken(payload, options) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  if (!options?.secret) {
    throw new Error('JWT secret is required');
  }

  const {
    secret,
    expiresIn = '7d', // default expiration for better user experience
    algorithm = 'HS256',
  } = options;

  try {
    return jwt.sign(payload, secret, {
      expiresIn,
      algorithm,
    });
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
}

/**
 * Verifies a JWT token and returns its decoded payload.
 *
 * @param {string} token - The JWT token to verify.
 * @param {Object} options - Verification options.
 * @param {string} options.secret - Secret key used to verify the token.
 * @param {string[]} [options.algorithms=['HS256']] - Allowed algorithms for verification.
 * @returns {Object} Decoded token payload.
 * @throws {Error} If token is invalid, expired, or verification fails.
 */
export function verifyToken(token, options) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a string');
  }

  if (!options?.secret) {
    throw new Error('JWT secret is required');
  }

  const { secret, algorithms = ['HS256'] } = options;

  try {
    return jwt.verify(token, secret, { algorithms });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
}
