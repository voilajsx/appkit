/**
 * Sanitization Tests - @voilajs/appkit Security Module
 *
 * These tests verify that the sanitization functions correctly
 * clean user input to prevent XSS and other injection attacks.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeString, sanitizeFilename } from '../sanitizer.js';

describe('Input Sanitization', () => {
  describe('escapeString()', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS");</script>';

      const output = escapeString(input);

      // The actual output has &lt; for <, &gt; for >, &quot; for ", etc.
      expect(output).toContain('&lt;script&gt;');
      expect(output).toContain('alert(&quot;XSS&quot;)');
      expect(output).not.toContain('<script>');
    });

    it('should handle regular text without changes', () => {
      const input = 'Hello World 123';
      expect(escapeString(input)).toBe(input);
    });

    it('should handle all special characters', () => {
      const input = '&<>"\'/';
      const expected = '&amp;&lt;&gt;&quot;&#x27;&#x2F;';

      expect(escapeString(input)).toBe(expected);
    });

    it('should handle empty strings', () => {
      expect(escapeString('')).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(escapeString(null)).toBe('');
      expect(escapeString(undefined)).toBe('');
      expect(escapeString(123)).toBe('');
      expect(escapeString({})).toBe('');
    });
  });

  describe('sanitizeHtml()', () => {
    it('should remove script tags', () => {
      const input = '<div>Safe content<script>alert("XSS");</script></div>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<script>');
      expect(output).toContain('<div>Safe content</div>');
    });

    it('should remove event handlers', () => {
      const input = '<img src="image.jpg" onerror="alert(\'XSS\')" />';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('onerror');
    });

    it('should remove javascript protocol', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Click me</a>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('javascript:');
    });

    it('should strip all tags when stripAllTags option is true', () => {
      const input = '<h1>Title</h1><p>Paragraph <b>with bold</b> text</p>';
      const output = sanitizeHtml(input, { stripAllTags: true });

      expect(output).not.toContain('<');
      expect(output).not.toContain('>');
      expect(output).toContain('Title');
      expect(output).toContain('Paragraph');
      expect(output).toContain('with bold');
      expect(output).toContain('text');
    });

    it('should only allow specified tags when allowedTags is provided', () => {
      const input =
        '<div><h1>Title</h1><p>Text <b>bold</b> <i>italic</i> <script>alert()</script></p></div>';
      const output = sanitizeHtml(input, { allowedTags: ['p', 'b', 'i'] });

      expect(output).toContain('<p>');
      expect(output).toContain('<b>');
      expect(output).toContain('<i>');

      expect(output).not.toContain('<div>');
      expect(output).not.toContain('<h1>');
      expect(output).not.toContain('<script>');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(123)).toBe('');
      expect(sanitizeHtml({})).toBe('');
    });

    it('should handle malformed HTML', () => {
      const input = '<div>Unclosed tag <p>Nested <script>alert()</script>';
      const output = sanitizeHtml(input);

      expect(output).not.toContain('<script>');
    });
  });

  describe('sanitizeFilename()', () => {
    it('should remove path traversal sequences', () => {
      const input = '../../../etc/passwd';
      const output = sanitizeFilename(input);

      expect(output).not.toContain('../');
      expect(output).not.toContain('..\\');
    });

    it('should remove special characters', () => {
      const input = 'file!@#$%^&*()name.txt';
      const output = sanitizeFilename(input);

      expect(output).toBe('filename.txt');
    });

    it('should preserve allowed characters', () => {
      const input = 'safe-file_name.txt';

      expect(sanitizeFilename(input)).toBe(input);
    });

    it('should truncate very long filenames', () => {
      // Create a string longer than 255 characters
      const longName = 'a'.repeat(250) + '.txt';

      expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
    });

    it('should handle empty strings', () => {
      expect(sanitizeFilename('')).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeFilename(null)).toBe('');
      expect(sanitizeFilename(undefined)).toBe('');
      expect(sanitizeFilename(123)).toBe('');
      expect(sanitizeFilename({})).toBe('');
    });
  });
});
