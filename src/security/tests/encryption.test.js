/**
 * Encryption Tests - @voilajsx/appkit Security Module
 *
 * Minimal test suite focused on core functionality
 */

import { describe, it, expect } from 'vitest';
import { generateEncryptionKey, encrypt, decrypt } from '../encryption.js';

describe('Encryption Module', () => {
  describe('generateEncryptionKey()', () => {
    it('should generate a 32-byte key by default', () => {
      const key = generateEncryptionKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });

    it('should throw error for invalid length', () => {
      expect(() => generateEncryptionKey(0)).toThrow();
      expect(() => generateEncryptionKey(-1)).toThrow();
    });
  });

  describe('encrypt()', () => {
    let testKey;

    beforeEach(() => {
      testKey = generateEncryptionKey();
    });

    it('should encrypt plaintext successfully', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext, testKey);

      expect(typeof encrypted).toBe('string');
      expect(encrypted.split(':').length).toBe(3); // IV:ciphertext:tag format
    });

    it('should work with Associated Data', () => {
      const plaintext = 'Secret message';
      const aad = Buffer.from('user123', 'utf8');

      const encrypted = encrypt(plaintext, testKey, aad);
      expect(typeof encrypted).toBe('string');
    });

    it('should produce different outputs for same plaintext', () => {
      const plaintext = 'Same message';
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });

    it('should throw error for empty plaintext', () => {
      expect(() => encrypt('', testKey)).toThrow();
      expect(() => encrypt(null, testKey)).toThrow();
    });

    it('should throw error for invalid key length', () => {
      expect(() => encrypt('test', 'short')).toThrow();
    });
  });

  describe('decrypt()', () => {
    let testKey;

    beforeEach(() => {
      testKey = generateEncryptionKey();
    });

    it('should decrypt encrypted data successfully', () => {
      const plaintext = 'Hello, Decryption!';
      const encrypted = encrypt(plaintext, testKey);
      const decrypted = decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it('should work with Associated Data', () => {
      const plaintext = 'Secret with AAD';
      const aad = Buffer.from('context-data', 'utf8');

      const encrypted = encrypt(plaintext, testKey, aad);
      const decrypted = decrypt(encrypted, testKey, aad);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid format', () => {
      expect(() => decrypt('invalid-format', testKey)).toThrow();
      expect(() => decrypt('only:two', testKey)).toThrow();
      expect(() => decrypt('', testKey)).toThrow();
    });

    it('should throw error for wrong key', () => {
      const plaintext = 'Test message';
      const wrongKey = generateEncryptionKey();
      const encrypted = encrypt(plaintext, testKey);

      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });

    it('should throw error for mismatched AAD', () => {
      const plaintext = 'Message with AAD';
      const aad1 = Buffer.from('correct-aad', 'utf8');
      const aad2 = Buffer.from('wrong-aad', 'utf8');

      const encrypted = encrypt(plaintext, testKey, aad1);

      expect(() => decrypt(encrypted, testKey, aad2)).toThrow();
      expect(() => decrypt(encrypted, testKey)).toThrow(); // No AAD when expected
    });

    it('should throw error for tampered data', () => {
      const plaintext = 'Important message';
      const encrypted = encrypt(plaintext, testKey);
      const parts = encrypted.split(':');

      // Tamper with auth tag
      const tamperedTag = parts[0] + ':' + parts[1] + ':ff' + parts[2].slice(2);
      expect(() => decrypt(tamperedTag, testKey)).toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete encrypt-decrypt cycle', () => {
      const key = generateEncryptionKey();
      const plaintext = 'Complete integration test';

      const encrypted = encrypt(plaintext, key);
      const decrypted = decrypt(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle various data types', () => {
      const key = generateEncryptionKey();
      const testCases = [
        'Simple string',
        'Unicode: 你好世界',
        JSON.stringify({ test: true, data: [1, 2, 3] }),
        'Multi\nLine\nString',
      ];

      testCases.forEach((original) => {
        const encrypted = encrypt(original, key);
        const decrypted = decrypt(encrypted, key);
        expect(decrypted).toBe(original);
      });
    });

    it('should provide semantic security', () => {
      const key = generateEncryptionKey();
      const plaintext = 'Repeated message';

      const encryptions = Array.from({ length: 5 }, () =>
        encrypt(plaintext, key)
      );
      const uniqueEncryptions = new Set(encryptions);

      expect(uniqueEncryptions.size).toBe(5); // All different

      // But all decrypt to same plaintext
      encryptions.forEach((encrypted) => {
        expect(decrypt(encrypted, key)).toBe(plaintext);
      });
    });

    it('should prevent cross-key decryption', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const plaintext = 'Secret message';

      const encrypted1 = encrypt(plaintext, key1);
      const encrypted2 = encrypt(plaintext, key2);

      expect(encrypted1).not.toBe(encrypted2);
      expect(() => decrypt(encrypted1, key2)).toThrow();
      expect(() => decrypt(encrypted2, key1)).toThrow();
    });
  });
});
