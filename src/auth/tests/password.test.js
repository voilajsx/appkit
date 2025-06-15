/**
 * Password functionality tests for @voilajsx/appkit auth module
 * Tests password hashing and comparison features including environment variables
 *
 * @file src/auth/tests/password.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { hashPassword, comparePassword } from '../password.js';
import { TEST_PASSWORD } from './setup.js';

describe('Password Module', () => {
  // Store original environment variables
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear environment variables before each test
    delete process.env.VOILA_AUTH_BCRYPT_ROUNDS;
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('hashPassword', () => {
    it('should hash a password successfully with default rounds', async () => {
      const hash = await hashPassword(TEST_PASSWORD);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(TEST_PASSWORD);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should hash password with environment rounds', async () => {
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';

      const hash = await hashPassword(TEST_PASSWORD);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(TEST_PASSWORD);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should prioritize explicit rounds over environment', async () => {
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '8';

      // Explicit rounds should override environment
      const hash = await hashPassword(TEST_PASSWORD, 12);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');

      // Verify it's a valid bcrypt hash (should start with $2b$ and have the right structure)
      expect(hash).toMatch(/^\$2b\$12\$/); // Should use rounds=12, not env rounds=8
    });

    it('should use default rounds when no environment or explicit rounds set', async () => {
      const hash = await hashPassword(TEST_PASSWORD);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');

      // Should use default rounds (10)
      expect(hash).toMatch(/^\$2b\$10\$/);
    });

    it('should handle invalid environment rounds gracefully', async () => {
      // Invalid string value
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = 'invalid';

      const hash = await hashPassword(TEST_PASSWORD);
      expect(hash).toBeDefined();

      // Should use default rounds (10)
      expect(hash).toMatch(/^\$2b\$10\$/);
    });

    it('should handle out-of-range environment rounds', async () => {
      // Too low (below 4)
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '2';

      const hash1 = await hashPassword(TEST_PASSWORD);
      expect(hash1).toMatch(/^\$2b\$10\$/); // Should use default

      // Too high (above 31)
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '35';

      const hash2 = await hashPassword(TEST_PASSWORD);
      expect(hash2).toMatch(/^\$2b\$10\$/); // Should use default
    });

    it('should handle valid environment rounds within range', async () => {
      const validRounds = ['4', '8', '10', '12', '14', '16'];

      for (const rounds of validRounds) {
        process.env.VOILA_AUTH_BCRYPT_ROUNDS = rounds;

        const hash = await hashPassword(TEST_PASSWORD);
        expect(hash).toBeDefined();

        // bcrypt pads single digit rounds with zero (e.g., '4' becomes '04')
        const paddedRounds = rounds.padStart(2, '0');
        expect(hash).toMatch(new RegExp(`^\\$2b\\$${paddedRounds}\\$`));
      }
    });

    it('should generate different hashes for same password', async () => {
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '10';

      const hash1 = await hashPassword(TEST_PASSWORD);
      const hash2 = await hashPassword(TEST_PASSWORD);
      expect(hash1).not.toBe(hash2);
    });

    it('should hash with custom rounds overriding environment', async () => {
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '8';

      const hash = await hashPassword(TEST_PASSWORD, 12);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2b\$12\$/); // Uses explicit 12, not env 8
    });

    it('should throw error for invalid password', async () => {
      await expect(hashPassword('')).rejects.toThrow(
        'Password must be a non-empty string'
      );
      await expect(hashPassword(null)).rejects.toThrow(
        'Password must be a non-empty string'
      );
      await expect(hashPassword(undefined)).rejects.toThrow(
        'Password must be a non-empty string'
      );
      await expect(hashPassword(123)).rejects.toThrow(
        'Password must be a non-empty string'
      );
    });
  });

  describe('comparePassword', () => {
    let validHash;
    let envHash;

    beforeEach(async () => {
      validHash = await hashPassword(TEST_PASSWORD, 10);

      // Create hash using environment configuration
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';
      envHash = await hashPassword(TEST_PASSWORD);
    });

    it('should return true for matching password with explicit hash', async () => {
      const isValid = await comparePassword(TEST_PASSWORD, validHash);
      expect(isValid).toBe(true);
    });

    it('should return true for matching password with environment-generated hash', async () => {
      const isValid = await comparePassword(TEST_PASSWORD, envHash);
      expect(isValid).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const isValid = await comparePassword('WrongPassword', validHash);
      expect(isValid).toBe(false);
    });

    it('should return false for non-matching password with env hash', async () => {
      const isValid = await comparePassword('WrongPassword', envHash);
      expect(isValid).toBe(false);
    });

    it('should work with hashes generated with different rounds', async () => {
      // Generate hashes with different rounds
      const hash8 = await hashPassword(TEST_PASSWORD, 8);
      const hash10 = await hashPassword(TEST_PASSWORD, 10);
      const hash12 = await hashPassword(TEST_PASSWORD, 12);

      // All should verify correctly regardless of rounds used
      expect(await comparePassword(TEST_PASSWORD, hash8)).toBe(true);
      expect(await comparePassword(TEST_PASSWORD, hash10)).toBe(true);
      expect(await comparePassword(TEST_PASSWORD, hash12)).toBe(true);
    });

    it('should throw error for invalid password parameter', async () => {
      await expect(comparePassword('', validHash)).rejects.toThrow(
        'Password must be a non-empty string'
      );
      await expect(comparePassword(null, validHash)).rejects.toThrow(
        'Password must be a non-empty string'
      );
      await expect(comparePassword(undefined, validHash)).rejects.toThrow(
        'Password must be a non-empty string'
      );
    });

    it('should throw error for invalid hash parameter', async () => {
      await expect(comparePassword(TEST_PASSWORD, '')).rejects.toThrow(
        'Hash must be a non-empty string'
      );
      await expect(comparePassword(TEST_PASSWORD, null)).rejects.toThrow(
        'Hash must be a non-empty string'
      );
      await expect(comparePassword(TEST_PASSWORD, undefined)).rejects.toThrow(
        'Hash must be a non-empty string'
      );
    });

    it('should handle invalid hash format gracefully', async () => {
      // Bcrypt compare can handle invalid formats and returns false instead of throwing
      const invalidHash = 'invalid-hash-format';
      const result = await comparePassword(TEST_PASSWORD, invalidHash);
      expect(result).toBe(false);
    });
  });

  describe('Environment Variable Integration', () => {
    it('should handle complete password workflow with environment configuration', async () => {
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';

      const password = 'MySecurePassword123!';

      // Hash the password using environment rounds
      const hash = await hashPassword(password);
      expect(hash).toMatch(/^\$2b\$12\$/);

      // Verify correct password
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);

      // Verify wrong password
      const isInvalid = await comparePassword('wrongpassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should handle special characters in passwords with environment config', async () => {
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '10';

      const specialPasswords = [
        'Pass@word!123',
        'P@$$w0rd!',
        'Test_123#$%',
        '你好世界123!', // Unicode characters
        'emoji🔒key🗝️',
      ];

      for (const password of specialPasswords) {
        const hash = await hashPassword(password);
        const isValid = await comparePassword(password, hash);
        expect(isValid).toBe(true);
      }
    });

    it('should work with different environment configurations', async () => {
      const testConfigs = [
        { rounds: '8', expectedPattern: /^\$2b\$08\$/ },
        { rounds: '10', expectedPattern: /^\$2b\$10\$/ },
        { rounds: '12', expectedPattern: /^\$2b\$12\$/ },
      ];

      for (const config of testConfigs) {
        process.env.VOILA_AUTH_BCRYPT_ROUNDS = config.rounds;

        const hash = await hashPassword(TEST_PASSWORD);
        expect(hash).toMatch(config.expectedPattern);

        const isValid = await comparePassword(TEST_PASSWORD, hash);
        expect(isValid).toBe(true);
      }
    });

    it('should handle mixed environment and explicit configuration', async () => {
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '8';

      // Hash with environment rounds
      const envHash = await hashPassword(TEST_PASSWORD);
      expect(envHash).toMatch(/^\$2b\$08\$/);

      // Hash with explicit rounds (should override environment)
      const explicitHash = await hashPassword(TEST_PASSWORD, 12);
      expect(explicitHash).toMatch(/^\$2b\$12\$/);

      // Both should verify correctly
      expect(await comparePassword(TEST_PASSWORD, envHash)).toBe(true);
      expect(await comparePassword(TEST_PASSWORD, explicitHash)).toBe(true);
    });
  });
});
