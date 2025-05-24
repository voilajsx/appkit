/**
 * @voilajsx/appkit - Symmetric encryption utilities
 * @module @voilajsx/appkit/security/encryption
 */

import crypto from 'crypto';

// Recommended algorithm and key length for strong symmetric encryption
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for GCM IV (Initialization Vector)
const TAG_LENGTH = 16; // 16 bytes for GCM Authentication Tag (in hex)

/**
 * Generates a cryptographically secure random key suitable for AES-256 encryption.
 * The key is returned as a hexadecimal string.
 *
 * @param {number} [lengthBytes=32] - The length of the key in bytes. AES-256 requires 32 bytes (256 bits).
 * @returns {string} The generated key as a hexadecimal string.
 */
export function generateEncryptionKey(lengthBytes = 32) {
  if (typeof lengthBytes !== 'number' || lengthBytes <= 0) {
    throw new Error('Key length must be a positive number of bytes.');
  }
  return crypto.randomBytes(lengthBytes).toString('hex');
}

/**
 * Encrypts a plaintext string or Buffer using AES-256-GCM.
 * The output is a combined hexadecimal string of IV, ciphertext, and authentication tag,
 * separated by colons (:). This format allows for secure decryption.
 *
 * @param {string | Buffer} plaintext - The data to encrypt.
 * @param {string | Buffer} key - The encryption key. Must be 32 bytes (256 bits).
 * If a string, it's assumed to be a hex-encoded key.
 * @param {Buffer} [associatedData] - Optional Associated Data (AAD) that is authenticated but not encrypted.
 * @returns {string} The encrypted data as a combined hex string (IV:ciphertext:tag).
 * @throws {Error} If key is invalid or encryption fails.
 */
export function encrypt(plaintext, key, associatedData = null) {
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty.');
  }
  if (
    !key ||
    (typeof key === 'string' && key.length !== 64) ||
    (Buffer.isBuffer(key) && key.length !== 32)
  ) {
    throw new Error(
      `Invalid key length. Key must be 32 bytes (64 hex characters). Got ${typeof key === 'string' ? key.length / 2 : key.length} bytes.`
    );
  }

  const encryptionKey = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a unique IV for each encryption

  try {
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    if (associatedData) {
      if (!Buffer.isBuffer(associatedData)) {
        throw new Error('Associated data must be a Buffer.');
      }
      cipher.setAAD(associatedData);
    }

    let encrypted = cipher.update(
      plaintext instanceof Buffer ? plaintext : Buffer.from(plaintext, 'utf8')
    );
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag(); // Get the authentication tag

    // Combine IV, ciphertext, and auth tag into a single string, separated by colons
    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts data previously encrypted with AES-256-GCM.
 * It expects the input to be a combined hexadecimal string (IV:ciphertext:tag).
 *
 * @param {string} encryptedData - The encrypted data string (IV:ciphertext:tag).
 * @param {string | Buffer} key - The decryption key. Must be 32 bytes (256 bits).
 * If a string, it's assumed to be a hex-encoded key.
 * @param {Buffer} [associatedData] - Optional Associated Data (AAD) used during encryption. Must match exactly.
 * @returns {string} The decrypted plaintext as a UTF-8 string.
 * @throws {Error} If key is invalid, data format is incorrect, or decryption/authentication fails.
 */
export function decrypt(encryptedData, key, associatedData = null) {
  if (typeof encryptedData !== 'string' || !encryptedData) {
    throw new Error('Encrypted data must be a non-empty string.');
  }
  if (
    !key ||
    (typeof key === 'string' && key.length !== 64) ||
    (Buffer.isBuffer(key) && key.length !== 32)
  ) {
    throw new Error(
      `Invalid key length. Key must be 32 bytes (64 hex characters). Got ${typeof key === 'string' ? key.length / 2 : key.length} bytes.`
    );
  }

  const decryptionKey = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error(
      'Invalid encrypted data format. Expected IV:ciphertext:tag.'
    );
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');

  if (iv.length !== IV_LENGTH || authTag.length !== TAG_LENGTH) {
    throw new Error(
      'Invalid IV or Authentication Tag length in encrypted data.'
    );
  }

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, decryptionKey, iv);

    if (associatedData) {
      if (!Buffer.isBuffer(associatedData)) {
        throw new Error('Associated data must be a Buffer.');
      }
      decipher.setAAD(associatedData);
    }

    decipher.setAuthTag(authTag); // Set the authentication tag BEFORE decryption

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    // If the authentication tag is invalid or data is tampered, an 'EBADTAG' error is thrown.
    if (error.code === 'EBADTAG') {
      throw new Error(
        'Authentication failed: Data may be tampered or key/AAD incorrect.'
      );
    }
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
