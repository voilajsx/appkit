/**
 * @voilajsx/appkit - Data encryption utilities
 * @module @voilajsx/appkit/security/encryption
 * @file src/security/encryption.js
 *
 * Production-ready AES-256-GCM encryption with environment-first design.
 */

import crypto from 'crypto';

// AES-256-GCM configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for GCM IV
const TAG_LENGTH = 16; // 16 bytes for GCM authentication tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

/**
 * Creates security error with status code
 * @private
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Error with statusCode property
 */
function createSecurityError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Validates encryption key format and length
 * @private
 * @param {string|Buffer} key - Encryption key to validate
 * @throws {Error} If key is invalid
 */
function validateKey(key) {
  if (!key) {
    throw createSecurityError('Encryption key is required', 500);
  }

  const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'hex') : key;

  if (keyBuffer.length !== KEY_LENGTH) {
    throw createSecurityError(
      `Invalid key length. Expected ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex chars), got ${keyBuffer.length} bytes`,
      500
    );
  }
}

/**
 * Generates a secure encryption key for production use
 * @returns {string} 32-byte encryption key as hex string
 */
export function generateKey() {
  try {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
  } catch (error) {
    throw createSecurityError(`Key generation failed: ${error.message}`, 500);
  }
}

/**
 * Encrypts sensitive data with environment-first key management
 * @param {string|Buffer} data - Data to encrypt
 * @param {string|Buffer} [key] - Encryption key (uses VOILA_ENCRYPTION_KEY env var)
 * @param {Buffer} [associatedData] - Optional Associated Data (AAD) for additional security
 * @returns {string} Encrypted data as "IV:ciphertext:authTag" hex string
 */
export function encryptData(data, key, associatedData = null) {
  if (!data) {
    throw createSecurityError('Data to encrypt cannot be empty');
  }

  // Environment → Argument → Error pattern
  const encryptionKey = key || process.env.VOILA_ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw createSecurityError(
      'Encryption key required. Provide as argument or set VOILA_ENCRYPTION_KEY environment variable',
      500
    );
  }

  // Validate key
  validateKey(encryptionKey);

  const keyBuffer =
    typeof encryptionKey === 'string'
      ? Buffer.from(encryptionKey, 'hex')
      : encryptionKey;

  try {
    // Generate random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    // Set AAD if provided
    if (associatedData) {
      if (!Buffer.isBuffer(associatedData)) {
        throw createSecurityError('Associated data must be a Buffer');
      }
      cipher.setAAD(associatedData);
    }

    // Encrypt data
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    let encrypted = cipher.update(dataBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine IV, ciphertext, and auth tag
    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  } catch (error) {
    throw createSecurityError(`Encryption failed: ${error.message}`, 500);
  }
}

/**
 * Decrypts previously encrypted data with validation
 * @param {string} encryptedData - Encrypted data string in "IV:ciphertext:authTag" format
 * @param {string|Buffer} [key] - Decryption key (uses VOILA_ENCRYPTION_KEY env var)
 * @param {Buffer} [associatedData] - Optional Associated Data (AAD) used during encryption
 * @returns {string} Original plaintext data
 */
export function decryptData(encryptedData, key, associatedData = null) {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw createSecurityError('Encrypted data must be a non-empty string');
  }

  // Environment → Argument → Error pattern
  const decryptionKey = key || process.env.VOILA_ENCRYPTION_KEY;

  if (!decryptionKey) {
    throw createSecurityError(
      'Decryption key required. Provide as argument or set VOILA_ENCRYPTION_KEY environment variable',
      500
    );
  }

  // Validate key
  validateKey(decryptionKey);

  const keyBuffer =
    typeof decryptionKey === 'string'
      ? Buffer.from(decryptionKey, 'hex')
      : decryptionKey;

  // Parse encrypted data format
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw createSecurityError(
      'Invalid encrypted data format. Expected IV:ciphertext:authTag'
    );
  }

  try {
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');

    // Validate component lengths
    if (iv.length !== IV_LENGTH || authTag.length !== TAG_LENGTH) {
      throw createSecurityError('Invalid IV or authentication tag length');
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);

    // Set AAD if provided
    if (associatedData) {
      if (!Buffer.isBuffer(associatedData)) {
        throw createSecurityError('Associated data must be a Buffer');
      }
      decipher.setAAD(associatedData);
    }

    // Set authentication tag
    decipher.setAuthTag(authTag);

    // Decrypt data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    // Handle authentication failures specifically
    if (error.code === 'EBADTAG') {
      throw createSecurityError(
        'Authentication failed: Data may be tampered with or incorrect key/AAD provided',
        401
      );
    }

    throw createSecurityError(`Decryption failed: ${error.message}`, 500);
  }
}
