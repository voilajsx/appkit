/**
 * Encryption & Decryption Example - @voilajsx/appkit Security Module
 *
 * This example demonstrates how to use the encryption and decryption utilities
 * provided by @voilajsx/appkit/security. It covers key generation, encryption,
 * decryption, and the use of Associated Data (AAD) for integrity.
 *
 * IMPORTANT: In a real application, encryption keys MUST be managed securely.
 * Never hardcode keys in your application code for production environments.
 * Use environment variables, a secure key vault, or a dedicated Key Management System (KMS).
 *
 * Run: node 06-encryption-decryption.js
 */

import { generateEncryptionKey, encrypt, decrypt } from '../index.js'; // Corrected import path
import { Buffer } from 'buffer'; // Explicitly import Buffer for clarity

console.log('--- Encryption and Decryption Example ---');
console.log('\n--- 1. Generating a Cryptographically Secure Key ---');
try {
  const encryptionKey = generateEncryptionKey();
  console.log('Generated AES-256 Key (hex):', encryptionKey);
  console.log('Key length (bytes):', Buffer.from(encryptionKey, 'hex').length);

  console.log('\n--- 2. Encrypting Data ---');
  const plaintext = 'This is a secret message that needs to be protected.';
  const sensitiveId = 'user_12345_profile'; // Example of Associated Data (AAD)
  const associatedDataBuffer = Buffer.from(sensitiveId, 'utf8');

  console.log('Original Plaintext:', plaintext);
  console.log('Associated Data (AAD):', sensitiveId);

  const encryptedData = encrypt(plaintext, encryptionKey, associatedDataBuffer);
  console.log('Encrypted Data (IV:Ciphertext:Tag hex string):', encryptedData);

  console.log('\n--- 3. Decrypting Data ---');
  const decryptedText = decrypt(
    encryptedData,
    encryptionKey,
    associatedDataBuffer
  );
  console.log('Decrypted Plaintext:', decryptedText);
  console.log('Decryption successful:', decryptedText === plaintext);

  console.log(
    '\n--- 4. Demonstrating Data Tampering Detection (Authentication Failure) ---'
  );
  const tamperedEncryptedData = encryptedData.slice(0, -2) + 'ff'; // Corrupt the last two hex chars of the tag or ciphertext
  console.log('Tampered Encrypted Data:', tamperedEncryptedData);

  try {
    decrypt(tamperedEncryptedData, encryptionKey, associatedDataBuffer);
    console.log('ERROR: Tampering was NOT detected (this should not happen!)');
  } catch (error) {
    console.log('Tampering detected (expected behavior):', error.message);
    if (error.message.includes('Authentication failed')) {
      console.log(
        'The "Authentication failed" error indicates that data integrity was compromised.'
      );
    }
  }

  console.log('\n--- 5. Demonstrating Incorrect Key Detection ---');
  const wrongKey = generateEncryptionKey(); // A completely different key
  console.log('Attempting decryption with a WRONG Key:', wrongKey);

  try {
    decrypt(encryptedData, wrongKey, associatedDataBuffer);
    console.log(
      'ERROR: Decryption with wrong key SUCCEEDED (this should not happen!)'
    );
  } catch (error) {
    console.log('Incorrect key detected (expected behavior):', error.message);
    if (error.message.includes('Authentication failed')) {
      console.log(
        'Even with a wrong key, GCM will usually fail authentication (EBADTAG).'
      );
    }
  }

  console.log('\n--- 6. Demonstrating AAD Mismatch Detection ---');
  const incorrectAssociatedData = Buffer.from('user_DIFFERENT_id', 'utf8');
  console.log(
    'Attempting decryption with Mismatched AAD:',
    incorrectAssociatedData.toString()
  );

  try {
    decrypt(encryptedData, encryptionKey, incorrectAssociatedData);
    console.log(
      'ERROR: AAD mismatch was NOT detected (this should not happen!)'
    );
  } catch (error) {
    console.log('AAD mismatch detected (expected behavior):', error.message);
    if (error.message.includes('Authentication failed')) {
      console.log(
        'Mismatch in AAD also results in an authentication failure (EBADTAG).'
      );
    }
  }
} catch (e) {
  console.error('\nAn unhandled error occurred during the example:', e);
}

console.log('\n--- IMPORTANT KEY MANAGEMENT WARNING ---');
console.warn('NEVER HARDCODE ENCRYPTION KEYS IN PRODUCTION CODE!');
console.warn(
  'Keys should be loaded from secure environment variables, a secure key vault (e.g., AWS KMS, Azure Key Vault), or a dedicated Key Management System.'
);
console.warn(
  'Loss of encryption keys means permanent data loss. Compromise of encryption keys means compromise of all encrypted data.'
);
