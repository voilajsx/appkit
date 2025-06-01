/**
 * @voilajsx/appkit - Sanitizer Tests
 * Tests for sanitization functions
 */

import { describe, it, expect } from 'vitest';
import {
  sanitize,
  sanitizeString,
  sanitizeNumber,
  sanitizeObject,
} from '../index.js';

describe('Core Sanitization Functions', () => {
  describe('sanitize()', () => {
    it('should auto-detect string type and sanitize', () => {
      const result = sanitize('  hello world  ', {
        trim: true,
        uppercase: true,
      });

      expect(result).toBe('HELLO WORLD');
    });

    it('should auto-detect number type and sanitize', () => {
      const result = sanitize(3.14159, {
        precision: 2,
      });

      expect(result).toBe(3.14);
    });

    it('should auto-detect object type and sanitize', () => {
      const result = sanitize(
        { name: '  John  ', age: '25' },
        {
          properties: {
            name: { trim: true },
            age: { integer: true },
          },
        }
      );

      expect(result.name).toBe('John');
      expect(result.age).toBe(25);
    });

    it('should handle function rules', () => {
      const customSanitizer = (value) => {
        return typeof value === 'string' ? value.toUpperCase() : value;
      };

      const result = sanitize('hello', customSanitizer);
      expect(result).toBe('HELLO');
    });

    it('should handle null and undefined', () => {
      expect(sanitize(null, {})).toBe(null);
      expect(sanitize(undefined, {})).toBe(undefined);
    });

    it('should handle array type', () => {
      const result = sanitize([1, 2, 3], {});
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle date type', () => {
      const date = new Date('2023-01-01');
      const result = sanitize(date, {});
      expect(result).toEqual(date);
    });

    it('should handle boolean type', () => {
      const result = sanitize(true, {});
      expect(result).toBe(true);
    });
  });
});

describe('String Sanitization', () => {
  describe('sanitizeString()', () => {
    it('should trim whitespace by default', () => {
      const result = sanitizeString('  hello world  ');
      expect(result).toBe('hello world');
    });

    it('should not trim when trim is false', () => {
      const result = sanitizeString('  hello world  ', { trim: false });
      expect(result).toBe('  hello world  ');
    });

    it('should convert to lowercase', () => {
      const result = sanitizeString('HELLO WORLD', { lowercase: true });
      expect(result).toBe('hello world');
    });

    it('should convert to uppercase', () => {
      const result = sanitizeString('hello world', { uppercase: true });
      expect(result).toBe('HELLO WORLD');
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(100);
      const result = sanitizeString(longString, { truncate: 10 });
      expect(result).toBe('a'.repeat(10));
      expect(result.length).toBe(10);
    });

    it('should use default truncate length of 255', () => {
      const longString = 'a'.repeat(300);
      const result = sanitizeString(longString, { truncate: true });
      expect(result.length).toBe(255);
    });

    it('should not truncate short strings', () => {
      const result = sanitizeString('hello', { truncate: 10 });
      expect(result).toBe('hello');
    });

    it('should handle replace rules', () => {
      const result = sanitizeString('hello world test', {
        replace: {
          world: 'universe',
          test: 'example',
        },
      });
      expect(result).toBe('hello universe example');
    });

    it('should handle global replace with regex patterns', () => {
      const result = sanitizeString('abc123def456', {
        replace: {
          '\\d+': 'X',
        },
      });
      expect(result).toBe('abcXdefX');
    });

    it('should handle remove rules as array', () => {
      const result = sanitizeString('hello123world456', {
        remove: ['\\d+', 'hello'],
      });
      expect(result).toBe('world');
    });

    it('should handle remove rules as string', () => {
      const result = sanitizeString('hello123world', {
        remove: '\\d+',
      });
      expect(result).toBe('helloworld');
    });

    it('should handle complex sanitization chain', () => {
      const result = sanitizeString('  HELLO WORLD 123  ', {
        trim: true,
        lowercase: true,
        remove: '\\d+',
        replace: { world: 'universe' },
      });
      expect(result).toBe('hello universe ');
    });

    it('should convert non-strings to strings', () => {
      expect(sanitizeString(123)).toBe('123');
      expect(sanitizeString(true)).toBe('true');
      expect(sanitizeString(null)).toBe('null');
      expect(sanitizeString(undefined)).toBe('undefined');
    });

    it('should handle empty string', () => {
      const result = sanitizeString('', {
        trim: true,
        uppercase: true,
      });
      expect(result).toBe('');
    });

    it('should handle special characters in replace', () => {
      const result = sanitizeString('hello@world.com', {
        replace: {
          '@': ' at ',
          '\\.': ' dot ',
        },
      });
      expect(result).toBe('hello at world dot com');
    });

    it('should handle multiple operations in correct order', () => {
      // Order: trim -> case -> truncate -> replace -> remove
      const result = sanitizeString('  HELLO WORLD 123  ', {
        trim: true,
        lowercase: true,
        truncate: 15,
        replace: { hello: 'hi' },
        remove: '\\d+',
      });
      expect(result).toBe('hi world ');
    });
  });
});

describe('Number Sanitization', () => {
  describe('sanitizeNumber()', () => {
    it('should convert string numbers to numbers', () => {
      expect(sanitizeNumber('123')).toBe(123);
      expect(sanitizeNumber('3.14')).toBe(3.14);
      expect(sanitizeNumber('-42')).toBe(-42);
    });

    it('should handle quoted strings', () => {
      expect(sanitizeNumber('"123"')).toBe(123);
      expect(sanitizeNumber("'456'")).toBe(456);
      expect(sanitizeNumber('"3.14"')).toBe(3.14);
    });

    it('should handle invalid numbers with default value', () => {
      expect(sanitizeNumber('not a number')).toBe(0);
      expect(sanitizeNumber('not a number', { default: 42 })).toBe(42);
      // Empty string converts to 0, not using default
      expect(sanitizeNumber('', { default: 100 })).toBe(0);
    });

    it('should convert to integer', () => {
      expect(sanitizeNumber(3.14159, { integer: true })).toBe(3);
      expect(sanitizeNumber(-2.7, { integer: true })).toBe(-2);
      expect(sanitizeNumber(5.9, { integer: true })).toBe(5);
    });

    it('should handle precision', () => {
      expect(sanitizeNumber(3.14159, { precision: 2 })).toBe(3.14);
      expect(sanitizeNumber(2.7, { precision: 0 })).toBe(3);
      // JavaScript floating point precision may cause slight differences
      expect(sanitizeNumber(1.005, { precision: 2 })).toBe(1);
    });

    it('should handle min constraints without clamping', () => {
      const result = sanitizeNumber(5, { min: 10 });
      expect(result).toBe(5); // Not clamped by default
    });

    it('should handle max constraints without clamping', () => {
      const result = sanitizeNumber(15, { max: 10 });
      expect(result).toBe(15); // Not clamped by default
    });

    it('should clamp to min when clamp is true', () => {
      const result = sanitizeNumber(5, { min: 10, clamp: true });
      expect(result).toBe(10);
    });

    it('should clamp to max when clamp is true', () => {
      const result = sanitizeNumber(15, { max: 10, clamp: true });
      expect(result).toBe(10);
    });

    it('should handle complex number sanitization', () => {
      // The input has whitespace and quotes which may cause parsing issues
      const result = sanitizeNumber('"3.14159"', {
        integer: false,
        precision: 2,
        min: 0,
        max: 5,
        clamp: true,
      });
      expect(result).toBe(3.14);
    });

    it('should handle zero values', () => {
      expect(sanitizeNumber(0)).toBe(0);
      expect(sanitizeNumber('0')).toBe(0);
      expect(sanitizeNumber(0, { min: 5, clamp: true })).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(sanitizeNumber(-5)).toBe(-5);
      expect(sanitizeNumber('-10.5')).toBe(-10.5);
      expect(sanitizeNumber(-3, { integer: true })).toBe(-3);
    });

    it('should handle NaN input', () => {
      expect(sanitizeNumber(NaN)).toBe(0);
      expect(sanitizeNumber(NaN, { default: 42 })).toBe(42);
    });

    it('should handle Infinity', () => {
      expect(sanitizeNumber(Infinity)).toBe(Infinity);
      expect(sanitizeNumber(-Infinity)).toBe(-Infinity);
    });

    it('should handle boolean input', () => {
      expect(sanitizeNumber(true)).toBe(1);
      expect(sanitizeNumber(false)).toBe(0);
    });

    it('should handle null and undefined', () => {
      expect(sanitizeNumber(null)).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
      // null converts to 0, not using default
      expect(sanitizeNumber(null, { default: 99 })).toBe(0);
    });
  });
});

describe('Object Sanitization', () => {
  describe('sanitizeObject()', () => {
    it('should handle non-object inputs', () => {
      expect(sanitizeObject(null)).toEqual({});
      expect(sanitizeObject(undefined)).toEqual({});
      expect(sanitizeObject('string')).toEqual({});
      expect(sanitizeObject(123)).toEqual({});
      expect(sanitizeObject([])).toEqual({});
    });

    it('should clone input object', () => {
      const input = { name: 'John', age: 30 };
      const result = sanitizeObject(input);

      expect(result).toEqual(input);
      expect(result).not.toBe(input); // Different reference
    });

    it('should apply default values', () => {
      const result = sanitizeObject(
        { name: 'John' },
        {
          defaults: {
            name: 'Anonymous',
            age: 18,
            active: true,
          },
        }
      );

      expect(result).toEqual({
        name: 'John', // Existing value preserved
        age: 18, // Default applied
        active: true, // Default applied
      });
    });

    it('should pick only specified properties', () => {
      const result = sanitizeObject(
        {
          name: 'John',
          age: 30,
          email: 'john@example.com',
          password: 'secret',
        },
        {
          pick: ['name', 'email'],
        }
      );

      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('should omit specified properties', () => {
      const result = sanitizeObject(
        {
          name: 'John',
          age: 30,
          password: 'secret',
          apiKey: 'key123',
        },
        {
          omit: ['password', 'apiKey'],
        }
      );

      expect(result).toEqual({
        name: 'John',
        age: 30,
      });
    });

    it('should sanitize individual properties with string rules', () => {
      const result = sanitizeObject(
        {
          name: '  JOHN DOE  ',
          email: '  USER@EXAMPLE.COM  ',
        },
        {
          properties: {
            name: {
              trim: true,
              lowercase: true,
            },
            email: {
              trim: true,
              lowercase: true,
            },
          },
        }
      );

      expect(result).toEqual({
        name: 'john doe',
        email: 'user@example.com',
      });
    });

    it('should sanitize individual properties with number rules', () => {
      const result = sanitizeObject(
        {
          age: '25',
          score: '85.678',
          id: '"123"',
        },
        {
          properties: {
            age: {
              integer: true,
            },
            score: {
              precision: 1,
            },
            id: {
              integer: true,
            },
          },
        }
      );

      expect(result).toEqual({
        age: 25,
        score: 85.7,
        id: 123,
      });
    });

    it('should handle mixed property sanitization', () => {
      const result = sanitizeObject(
        {
          name: '  John Doe  ',
          age: '25.5',
          bio: 'Software developer',
          tags: ['dev', 'js'],
        },
        {
          properties: {
            name: {
              trim: true,
              uppercase: true,
            },
            age: {
              integer: true,
              min: 18,
              clamp: true,
            },
            bio: {
              truncate: 10,
            },
            // tags property will be passed through as-is
          },
        }
      );

      expect(result).toEqual({
        name: 'JOHN DOE',
        age: 25,
        bio: 'Software d', // Truncated to 10 characters
        tags: ['dev', 'js'],
      });
    });

    it('should remove empty values', () => {
      const result = sanitizeObject(
        {
          name: 'John',
          email: '',
          age: null,
          bio: undefined,
          active: false, // Should be preserved
          count: 0, // Should be preserved
        },
        {
          removeEmpty: true,
        }
      );

      expect(result).toEqual({
        name: 'John',
        active: false,
        count: 0,
      });
    });

    it('should handle complex sanitization with all options', () => {
      const result = sanitizeObject(
        {
          firstName: '  john  ',
          lastName: '  DOE  ',
          age: '25.7',
          email: '  JOHN@EXAMPLE.COM  ',
          password: 'secret123',
          bio: '',
          tags: ['user'],
        },
        {
          defaults: {
            role: 'user',
            active: true,
          },
          pick: [
            'firstName',
            'lastName',
            'age',
            'email',
            'bio',
            'role',
            'active',
          ],
          properties: {
            firstName: {
              trim: true,
              lowercase: true,
            },
            lastName: {
              trim: true,
              uppercase: true,
            },
            age: {
              integer: true,
              min: 18,
              clamp: true,
            },
            email: {
              trim: true,
              lowercase: true,
            },
          },
          removeEmpty: true,
        }
      );

      expect(result).toEqual({
        firstName: 'john',
        lastName: 'DOE',
        age: 25,
        email: 'john@example.com',
        role: 'user',
        active: true,
      });
    });

    it('should handle nested object sanitization', () => {
      const result = sanitizeObject(
        {
          user: {
            name: '  John  ',
            age: '25',
          },
          settings: {
            theme: 'DARK',
          },
        },
        {
          properties: {
            user: {
              properties: {
                name: { trim: true },
                age: { integer: true },
              },
            },
            settings: {
              properties: {
                theme: { lowercase: true },
              },
            },
          },
        }
      );

      expect(result).toEqual({
        user: {
          name: 'John',
          age: 25,
        },
        settings: {
          theme: 'dark',
        },
      });
    });

    it('should handle missing properties', () => {
      const result = sanitizeObject(
        {
          name: 'John',
        },
        {
          properties: {
            name: { trim: true },
            age: { integer: true, default: 18 },
            email: { lowercase: true },
          },
        }
      );

      expect(result).toEqual({
        name: 'John',
        // age and email are not in the result because they weren't in the input
      });
    });

    it('should preserve property order', () => {
      const input = {
        c: 'third',
        a: 'first',
        b: 'second',
      };

      const result = sanitizeObject(input);
      const keys = Object.keys(result);

      expect(keys).toEqual(['c', 'a', 'b']);
    });

    it('should handle empty object', () => {
      const result = sanitizeObject(
        {},
        {
          defaults: { name: 'Anonymous' },
          removeEmpty: true,
        }
      );

      expect(result).toEqual({ name: 'Anonymous' });
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  describe('sanitizeString edge cases', () => {
    it('should handle special Unicode characters', () => {
      const result = sanitizeString('  🚀 Hello 世界  ', {
        trim: true,
        uppercase: true,
      });
      expect(result).toBe('🚀 HELLO 世界');
    });

    it('should handle very long strings', () => {
      const veryLongString = 'a'.repeat(10000);
      const result = sanitizeString(veryLongString, {
        truncate: 100,
      });
      expect(result.length).toBe(100);
    });

    it('should handle regex special characters in replace', () => {
      const result = sanitizeString('$100.50', {
        replace: {
          '\\$': 'USD ',
          '\\.': ' and ',
        },
      });
      expect(result).toBe('USD 100 and 50');
    });
  });

  describe('sanitizeNumber edge cases', () => {
    it('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const result = sanitizeNumber(largeNumber);
      expect(result).toBe(largeNumber);
    });

    it('should handle very small numbers', () => {
      const smallNumber = Number.MIN_SAFE_INTEGER;
      const result = sanitizeNumber(smallNumber);
      expect(result).toBe(smallNumber);
    });

    it('should handle scientific notation', () => {
      expect(sanitizeNumber('1.23e+2')).toBe(123);
      expect(sanitizeNumber('1.23e-2')).toBe(0.0123);
    });

    it('should handle hexadecimal strings', () => {
      expect(sanitizeNumber('0xFF')).toBe(255);
      expect(sanitizeNumber('0x10')).toBe(16);
    });
  });

  describe('sanitizeObject edge cases', () => {
    it('should handle objects with symbol keys', () => {
      const sym = Symbol('test');
      const obj = {
        [sym]: 'symbol value',
        name: 'John',
      };

      const result = sanitizeObject(obj, {
        properties: {
          name: { uppercase: true },
        },
      });

      expect(result.name).toBe('JOHN');
      expect(result[sym]).toBe('symbol value');
    });

    it('should handle frozen objects', () => {
      const frozenObj = Object.freeze({ name: 'John', age: 30 });

      const result = sanitizeObject(frozenObj, {
        properties: {
          name: { uppercase: true },
        },
      });

      expect(result.name).toBe('JOHN');
      expect(Object.isFrozen(result)).toBe(false);
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complete user data sanitization', () => {
    const rawUserData = {
      firstName: '  john  ',
      lastName: '  DOE  ',
      email: '  JOHN.DOE@EXAMPLE.COM  ',
      age: '25.5',
      bio: '  Software developer with 5+ years of experience in JavaScript and Node.js. Passionate about clean code and best practices.  ',
      website: '  HTTPS://JOHNDOE.DEV  ',
      salary: '"75000"',
      isActive: 'true',
      tags: ['developer', 'javascript'],
      metadata: null,
      internalId: '',
    };

    const sanitizedUser = sanitizeObject(rawUserData, {
      defaults: {
        role: 'user',
        createdAt: new Date('2023-01-01'),
      },
      pick: [
        'firstName',
        'lastName',
        'email',
        'age',
        'bio',
        'website',
        'salary',
        'tags',
        'role',
        'createdAt',
      ],
      properties: {
        firstName: {
          trim: true,
          lowercase: true,
        },
        lastName: {
          trim: true,
          uppercase: true,
        },
        email: {
          trim: true,
          lowercase: true,
        },
        age: {
          integer: true,
          min: 18,
          max: 100,
          clamp: true,
        },
        bio: {
          trim: true,
          truncate: 100,
        },
        website: {
          trim: true,
          lowercase: true,
        },
        salary: {
          integer: true,
          min: 0,
          clamp: true,
        },
      },
      removeEmpty: true,
    });

    expect(sanitizedUser).toEqual({
      firstName: 'john',
      lastName: 'DOE',
      email: 'john.doe@example.com',
      age: 25,
      bio: 'Software developer with 5+ years of experience in JavaScript and Node.js. Passionate about clean cod', // Truncated to 100 chars
      website: 'https://johndoe.dev',
      salary: 75000,
      tags: ['developer', 'javascript'],
      role: 'user',
      createdAt: new Date('2023-01-01'),
    });
  });

  it('should handle API request sanitization', () => {
    const apiRequest = {
      query: '  search term  ',
      page: '2.7',
      limit: '"25"',
      sort: 'CREATED_AT',
      order: 'desc',
      filters: {
        category: '  ELECTRONICS  ',
        minPrice: '10.50',
        maxPrice: '500.99',
        inStock: 'true',
      },
      userId: null,
      debug: '',
    };

    const sanitizedRequest = sanitizeObject(apiRequest, {
      defaults: {
        page: 1,
        limit: 10,
        sort: 'created_at',
        order: 'asc',
      },
      properties: {
        query: {
          trim: true,
          truncate: 100,
        },
        page: {
          integer: true,
          min: 1,
          clamp: true,
        },
        limit: {
          integer: true,
          min: 1,
          max: 100,
          clamp: true,
        },
        sort: {
          trim: true,
          lowercase: true,
        },
        order: {
          trim: true,
          lowercase: true,
        },
        filters: {
          properties: {
            category: {
              trim: true,
              lowercase: true,
            },
            minPrice: {
              precision: 2,
              min: 0,
              clamp: true,
            },
            maxPrice: {
              precision: 2,
              min: 0,
              clamp: true,
            },
          },
        },
      },
      removeEmpty: true,
    });

    expect(sanitizedRequest).toEqual({
      query: 'search term',
      page: 2,
      limit: 25,
      sort: 'created_at',
      order: 'desc',
      filters: {
        category: 'electronics',
        minPrice: 10.5,
        maxPrice: 500.99,
        inStock: 'true', // String properties not being sanitized unless rules specified
      },
    });
  });
});
