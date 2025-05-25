/**
 * Data Sanitization - @voilajsx/appkit
 *
 * Simple example showing how to clean and sanitize user input
 *
 * Run: node 02-data-sanitization.js
 */

import {
  sanitize,
  sanitizeString,
  sanitizeHtml,
  sanitizeEmail,
  sanitizeTags,
} from '../index.js';

console.log('🧹 Data Sanitization Examples\n');

// Raw user input (potentially unsafe)
const userInput = {
  name: '  John Doe  ',
  email: '  USER@EXAMPLE.COM  ',
  bio: 'Hello <script>alert("xss")</script> World! I love <b>coding</b>.',
  tags: 'javascript, node.js, web development, , , react',
  website: 'example.com',
};

console.log('Raw input:');
console.log(userInput);

// Sanitize string data
const cleanName = sanitizeString(userInput.name, {
  trim: true,
  maxLength: 50,
});

// Sanitize email
const cleanEmail = sanitizeEmail(userInput.email);

// Sanitize HTML content (remove dangerous scripts)
const cleanBio = sanitizeHtml(userInput.bio, {
  allowedTags: ['b', 'i', 'em', 'strong'],
  stripEmpty: true,
});

// Sanitize tags array
const cleanTags = sanitizeTags(userInput.tags, {
  maxTags: 5,
  maxLength: 20,
});

// Sanitize website URL
const cleanWebsite = sanitizeString(userInput.website, {
  trim: true,
  url: true,
});

// Complete object sanitization
const sanitizedData = sanitize(userInput, {
  properties: {
    name: { trim: true, maxLength: 50 },
    email: { trim: true, lowercase: true, email: true },
    bio: { stripTags: true, maxLength: 200 },
    tags: { compact: true, unique: true },
    website: { trim: true, url: true },
  },
});

console.log('\n🧽 Sanitized data:');
console.log({
  name: cleanName,
  email: cleanEmail,
  bio: cleanBio,
  tags: cleanTags,
  website: cleanWebsite,
});

console.log('\n🔧 Complete object sanitization:');
console.log(sanitizedData);

console.log('\n✅ Data sanitization complete!');
