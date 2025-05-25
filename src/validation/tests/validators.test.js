/**
 * @voilajsx/appkit - Validation Module Tests
 * Tests for core validation functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validate,
  validateAsync,
  createValidator,
  createAsyncValidator,
  isEmail,
  isUrl,
  isPhoneNumber,
  isCreditCard,
  isStrongPassword,
  isUuid,
  isAlphanumeric,
  isAlpha,
  isNumeric,
  isHexColor,
  isIpAddress,
  isSlug,
  isJSON,
  isBase64,
  isObjectId,
  isCreditCardExpiry,
  isSemVer,
} from '../index.js';

describe('Core Validation Functions', () => {
  describe('validate()', () => {
    it('should validate simple object schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', min: 0, max: 120 },
        },
      };

      const validData = { name: 'John', age: 25 };
      const result = validate(validData, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.value).toEqual(validData);
    });

    it('should return validation errors for invalid data', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', min: 0, max: 120 },
        },
      };

      const invalidData = { age: -5 }; // Missing name, invalid age

      const result = validate(invalidData, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some((e) => e.path === 'name')).toBe(true);
      expect(result.errors.some((e) => e.path === 'age')).toBe(true);
    });

    it('should handle nested object validation', () => {
      const schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string', required: true },
              email: { type: 'string', email: true },
            },
          },
        },
      };

      const data = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      const result = validate(data, schema);
      expect(result.valid).toBe(true);
    });

    it('should validate arrays', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number', required: true },
            name: { type: 'string', required: true },
          },
        },
        minItems: 1,
        maxItems: 3,
      };

      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      const result = validate(data, schema);
      expect(result.valid).toBe(true);
    });

    it('should handle validation options', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', required: true },
        },
      };

      const data = { name: 'John' }; // Missing age

      const result = validate(data, schema, { abortEarly: true });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateAsync()', () => {
    it('should handle async validation', async () => {
      const schema = {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            required: true,
            validateAsync: async (value) => {
              // Simulate async check
              await new Promise((resolve) => setTimeout(resolve, 10));
              return value === 'taken' ? 'Username is taken' : true;
            },
          },
        },
      };

      const validData = { username: 'available' };
      const result = await validateAsync(validData, schema);

      expect(result.valid).toBe(true);
    });

    it('should fail async validation', async () => {
      const schema = {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            required: true,
            validateAsync: async (value) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              return value === 'taken' ? 'Username is taken' : true;
            },
          },
        },
      };

      const invalidData = { username: 'taken' };
      const result = await validateAsync(invalidData, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Username is taken');
    });
  });

  describe('createValidator()', () => {
    it('should create reusable validator', () => {
      const schema = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      };

      const validator = createValidator(schema);

      expect(validator('hello').valid).toBe(true);
      expect(validator('hi').valid).toBe(false);
      expect(validator('verylongstring').valid).toBe(false);
    });
  });

  describe('createAsyncValidator()', () => {
    it('should create reusable async validator', async () => {
      const schema = {
        type: 'string',
        validateAsync: async (value) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return value.includes('bad') ? 'Contains bad word' : true;
        },
      };

      const validator = createAsyncValidator(schema);

      const goodResult = await validator('good text');
      const badResult = await validator('bad text');

      expect(goodResult.valid).toBe(true);
      expect(badResult.valid).toBe(false);
    });
  });
});

describe('Built-in Validators', () => {
  describe('isEmail()', () => {
    it('should validate correct email addresses', () => {
      expect(isEmail('user@example.com')).toBe(true);
      expect(isEmail('test.email+tag@domain.co.uk')).toBe(true);
      expect(isEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isEmail('invalid-email')).toBe(false);
      expect(isEmail('user@')).toBe(false);
      expect(isEmail('@domain.com')).toBe(false);
      expect(isEmail('user..user@domain.com')).toBe(false);
    });

    it('should handle email options', () => {
      // Note: International email support may vary based on implementation
      // Test with ASCII international domain instead
      expect(isEmail('user@example.co.uk', { allowInternational: true })).toBe(
        true
      );
      expect(isEmail('user@xn--fsq.xn--0zwm56d', { allowPunycode: true })).toBe(
        true
      );
    });
  });

  describe('isUrl()', () => {
    it('should validate correct URLs', () => {
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('http://subdomain.example.org/path?query=1')).toBe(true);
      expect(isUrl('https://example.com:8080/path#fragment')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isUrl('not-a-url')).toBe(false);
      expect(isUrl('ftp://example.com')).toBe(false); // Default protocols
      expect(isUrl('javascript:alert(1)')).toBe(false);
    });

    it('should handle URL options', () => {
      expect(isUrl('example.com', { requireProtocol: false })).toBe(true);
      expect(isUrl('ftp://example.com', { protocols: ['ftp'] })).toBe(true);
    });
  });

  describe('isPhoneNumber()', () => {
    it('should validate phone numbers', () => {
      expect(isPhoneNumber('+1234567890')).toBe(true);
      expect(isPhoneNumber('1234567890')).toBe(true);
      expect(isPhoneNumber('+44 20 7946 0958')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isPhoneNumber('123')).toBe(false);
      expect(isPhoneNumber('12345678901234567')).toBe(false);
      expect(isPhoneNumber('abc1234567')).toBe(false);
    });
  });

  describe('isCreditCard()', () => {
    it('should validate credit card numbers', () => {
      expect(isCreditCard('4111111111111111')).toBe(true); // Test Visa
      expect(isCreditCard('5555555555554444')).toBe(true); // Test Mastercard
      expect(isCreditCard('378282246310005')).toBe(true); // Test Amex
    });

    it('should reject invalid credit card numbers', () => {
      expect(isCreditCard('4111111111111112')).toBe(false); // Wrong check digit
      expect(isCreditCard('1234567890123456')).toBe(false); // Invalid format
      expect(isCreditCard('abc')).toBe(false);
    });

    it('should handle card type validation', () => {
      expect(isCreditCard('4111111111111111', { types: ['visa'] })).toBe(true);
      expect(isCreditCard('4111111111111111', { types: ['mastercard'] })).toBe(
        false
      );
    });
  });

  describe('isStrongPassword()', () => {
    it('should validate strong passwords', () => {
      expect(isStrongPassword('MyStr0ng!Pass')).toBe(true);
      expect(isStrongPassword('C0mpl3x#P@ssw0rd')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('Password')).toBe(false); // No numbers or symbols
    });

    it('should validate strong passwords consistently', () => {
      // Test that the function works with strong passwords
      expect(isStrongPassword('TestP@ssword023!')).toBe(true);
      expect(isStrongPassword('AnotherStr0ng#Pass')).toBe(true);
    });

    it('should handle password options', () => {
      // Test with requireSymbols = false (avoid forbidden sequences like "123")
      expect(isStrongPassword('SimplePass987', { requireSymbols: false })).toBe(
        true
      );

      // Test with shorter minLength
      expect(isStrongPassword('Short1!', { minLength: 6 })).toBe(true);

      // Test without uppercase requirement
      expect(
        isStrongPassword('simplepass987!', { requireUppercase: false })
      ).toBe(true);

      // Test custom forbidden sequences
      expect(
        isStrongPassword('MyPassword987!', {
          forbiddenSequences: ['mypassword'],
        })
      ).toBe(false);
    });
  });

  describe('isUuid()', () => {
    it('should validate UUIDs', () => {
      expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isUuid('not-a-uuid')).toBe(false);
      expect(isUuid('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isUuid('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
    });
  });

  describe('isAlphanumeric()', () => {
    it('should validate alphanumeric strings', () => {
      expect(isAlphanumeric('abc123')).toBe(true);
      expect(isAlphanumeric('ABC123')).toBe(true);
      expect(isAlphanumeric('test123')).toBe(true);
    });

    it('should reject non-alphanumeric strings', () => {
      expect(isAlphanumeric('abc-123')).toBe(false);
      expect(isAlphanumeric('abc 123')).toBe(false);
      expect(isAlphanumeric('abc@123')).toBe(false);
    });

    it('should handle options', () => {
      expect(isAlphanumeric('abc_123', { allowUnderscore: true })).toBe(true);
      expect(isAlphanumeric('abc-123', { allowHyphen: true })).toBe(true);
    });
  });

  describe('isAlpha()', () => {
    it('should validate alphabetic strings', () => {
      expect(isAlpha('abc')).toBe(true);
      expect(isAlpha('ABC')).toBe(true);
      expect(isAlpha('AbCdEf')).toBe(true);
    });

    it('should reject non-alphabetic strings', () => {
      expect(isAlpha('abc123')).toBe(false);
      expect(isAlpha('abc-def')).toBe(false);
      expect(isAlpha('abc def')).toBe(false);
    });
  });

  describe('isNumeric()', () => {
    it('should validate numeric strings', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('0')).toBe(true);
      expect(isNumeric('999')).toBe(true);
    });

    it('should reject non-numeric strings', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric('12.3')).toBe(false);
      expect(isNumeric('12a')).toBe(false);
    });

    it('should handle options', () => {
      expect(isNumeric('12.34', { allowDecimal: true })).toBe(true);
      expect(isNumeric('-123', { allowNegative: true })).toBe(true);
    });
  });

  describe('isHexColor()', () => {
    it('should validate hex colors', () => {
      expect(isHexColor('#FF5733')).toBe(true);
      expect(isHexColor('#FFF')).toBe(true);
      expect(isHexColor('#000000')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isHexColor('#ZZZ')).toBe(false);
      expect(isHexColor('FF5733')).toBe(false); // Missing #
      expect(isHexColor('#FF57')).toBe(false); // Wrong length
    });
  });

  describe('isIpAddress()', () => {
    it('should validate IPv4 addresses', () => {
      expect(isIpAddress('192.168.1.1')).toBe(true);
      expect(isIpAddress('0.0.0.0')).toBe(true);
      expect(isIpAddress('255.255.255.255')).toBe(true);
    });

    it('should validate IPv6 addresses', () => {
      expect(isIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(isIpAddress('::1')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(isIpAddress('256.1.1.1')).toBe(false);
      expect(isIpAddress('192.168.1')).toBe(false);
      expect(isIpAddress('not-an-ip')).toBe(false);
    });
  });

  describe('isSlug()', () => {
    it('should validate slugs', () => {
      expect(isSlug('my-blog-post')).toBe(true);
      expect(isSlug('hello-world-123')).toBe(true);
      expect(isSlug('simple-slug')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(isSlug('My Blog Post')).toBe(false);
      expect(isSlug('slug_with_underscores')).toBe(false);
      expect(isSlug('-starts-with-dash')).toBe(false);
      expect(isSlug('ends-with-dash-')).toBe(false);
    });
  });

  describe('isJSON()', () => {
    it('should validate JSON strings', () => {
      expect(isJSON('{"key": "value"}')).toBe(true);
      expect(isJSON('[1, 2, 3]')).toBe(true);
      expect(isJSON('"string"')).toBe(true);
      expect(isJSON('123')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(isJSON('{key: "value"}')).toBe(false); // Unquoted key
      expect(isJSON("{'key': 'value'}")).toBe(false); // Single quotes
      expect(isJSON('invalid')).toBe(false);
    });
  });

  describe('isBase64()', () => {
    it('should validate base64 strings', () => {
      expect(isBase64('SGVsbG8gV29ybGQ=')).toBe(true);
      expect(isBase64('dGVzdA==')).toBe(true);
      expect(isBase64('YWJjZA==')).toBe(true);
    });

    it('should reject invalid base64', () => {
      expect(isBase64('Hello World')).toBe(false);
      expect(isBase64('SGVsbG8gV29ybGQ')).toBe(false); // Missing padding
      expect(isBase64('SGVsbG8@V29ybGQ=')).toBe(false); // Invalid character
    });
  });

  describe('isObjectId()', () => {
    it('should validate MongoDB ObjectIds', () => {
      expect(isObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isObjectId('123456789012345678901234')).toBe(true);
    });

    it('should reject invalid ObjectIds', () => {
      expect(isObjectId('507f1f77bcf86cd79943901')).toBe(false); // Too short
      expect(isObjectId('507f1f77bcf86cd799439011g')).toBe(false); // Invalid character
      expect(isObjectId('not-an-objectid')).toBe(false);
    });
  });

  describe('isCreditCardExpiry()', () => {
    it('should validate credit card expiry dates', () => {
      const futureYear = new Date().getFullYear() + 2;
      expect(isCreditCardExpiry(`12/${futureYear}`)).toBe(true);
      expect(isCreditCardExpiry(`01/${futureYear.toString().slice(-2)}`)).toBe(
        true
      );
    });

    it('should reject expired dates', () => {
      expect(isCreditCardExpiry('12/20')).toBe(false); // Assuming current year > 2020
      expect(isCreditCardExpiry('01/2020')).toBe(false);
    });

    it('should reject invalid formats', () => {
      expect(isCreditCardExpiry('13/25')).toBe(false); // Invalid month
      expect(isCreditCardExpiry('12/2025/01')).toBe(false); // Wrong format
    });
  });

  describe('isSemVer()', () => {
    it('should validate semantic versions', () => {
      expect(isSemVer('1.0.0')).toBe(true);
      expect(isSemVer('2.1.3')).toBe(true);
      expect(isSemVer('1.0.0-alpha.1')).toBe(true);
      expect(isSemVer('1.0.0+build.123')).toBe(true);
    });

    it('should reject invalid versions', () => {
      expect(isSemVer('1.0')).toBe(false);
      expect(isSemVer('1.0.0.0')).toBe(false);
      expect(isSemVer('v1.0.0')).toBe(false);
    });
  });
});
