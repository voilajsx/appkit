/**
 * @voilajsx/appkit - JWT utilities
 * @module @voilajsx/appkit/auth/jwt
 * @file src/auth/jwt.js
 *
 * Production-ready functions for generating and verifying JSON Web Tokens (JWT).
 */

import jwt from 'jsonwebtoken';

/**
 * Validates JWT secret strength for production security
 * @param {string} secret - JWT secret to validate
 * @throws {Error} If secret is weak or invalid
 */
function validateSecret(secret) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('JWT secret must be a non-empty string');
  }

  if (secret.length < 32) {
    throw new Error(
      'JWT secret must be at least 32 characters long for security'
    );
  }

  // Warn about common weak secrets
  const weakSecrets = ['secret', 'password', 'key', 'token', 'jwt'];
  if (weakSecrets.includes(secret.toLowerCase())) {
    throw new Error('JWT secret is too weak. Use a strong, random secret');
  }
}

/**
 * Creates and signs a JWT token
 * @param {Object} payload - Data to encode in the token
 * @param {string} [secret] - JWT secret (uses VOILA_AUTH_SECRET if not provided)
 * @param {string} [expiresIn='7d'] - Token expiration
 * @returns {string} Signed JWT token
 */
export function signToken(payload, secret, expiresIn = '7d') {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  const jwtSecret = secret || process.env.VOILA_AUTH_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT secret required. Provide as argument or set VOILA_AUTH_SECRET'
    );
  }

  // Validate secret strength for production security
  validateSecret(jwtSecret);

  try {
    return jwt.sign(payload, jwtSecret, {
      expiresIn,
      algorithm: 'HS256',
    });
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} [secret] - JWT secret (uses VOILA_AUTH_SECRET if not provided)
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a string');
  }

  const jwtSecret = secret || process.env.VOILA_AUTH_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT secret required. Provide as argument or set VOILA_AUTH_SECRET'
    );
  }

  // Validate secret strength for production security
  validateSecret(jwtSecret);

  try {
    return jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
    });
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
