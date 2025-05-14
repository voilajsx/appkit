/**
 * Input Sanitization - @voilajs/appkit Security Module
 *
 * This example demonstrates how to safely handle user input
 * to prevent XSS and injection attacks.
 *
 * Run: node sanitization.js
 */

import express from 'express';
import {
  sanitizeHtml,
  escapeString,
  sanitizeFilename,
} from '@voilajs/appkit/security';

// Create Express app
const app = express();
app.use(express.urlencoded({ extended: true }));

// Simple in-memory storage for examples
const comments = [];

// Routes
app.get('/', (req, res) => {
  // Display form and existing comments
  const commentsList = comments
    .map(
      (comment) =>
        `<div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
      <h4>${comment.username}</h4>
      <div style="background: #f5f5f5; padding: 10px;">
        ${comment.content}
      </div>
      <div style="margin-top: 5px; font-size: 0.8em; color: #666;">
        <strong>Original Input:</strong> <code>${comment.original}</code>
      </div>
    </div>`
    )
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Input Sanitization Example</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        form { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        textarea { width: 100%; min-height: 100px; }
        .code-example { background: #f5f5f5; padding: 10px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Input Sanitization Example</h1>
      
      <h2>Comment Form</h2>
      <form method="POST" action="/comment">
        <div>
          <label for="username">Username:</label><br>
          <input type="text" id="username" name="username" required>
        </div>
        
        <div style="margin-top: 10px;">
          <label for="content">Comment (try adding HTML):</label><br>
          <textarea id="content" name="content" required></textarea>
        </div>
        
        <div style="margin-top: 10px;">
          <button type="submit">Submit Comment</button>
        </div>
      </form>
      
      <h2>Filename Sanitization</h2>
      <form method="POST" action="/upload">
        <div>
          <label for="filename">File Path/Name:</label><br>
          <input type="text" id="filename" name="filename" 
                 value="../../../etc/passwd" required>
        </div>
        
        <div style="margin-top: 10px;">
          <button type="submit">Test Filename</button>
        </div>
      </form>
      
      <h2>Try these examples:</h2>
      <div class="code-example">
        <strong>XSS Attempt:</strong><br>
        <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code><br>
        <code>&lt;img src="x" onerror="alert('XSS')"&gt;</code><br>
        <code>&lt;a href="javascript:alert('XSS')"&gt;Click me&lt;/a&gt;</code>
      </div>
      
      <h2>Comments:</h2>
      ${commentsList || '<p>No comments yet.</p>'}
    </body>
    </html>
  `);
});

// Handle comment submission
app.post('/comment', (req, res) => {
  const { username, content } = req.body;

  // Save original input for demonstration
  const original = content;

  // 1. Sanitize username (escape all HTML)
  const safeUsername = escapeString(username);

  // 2. Sanitize content (allow some HTML tags but remove scripts and events)
  const safeContent = sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p'],
  });

  // Store sanitized comment
  comments.push({
    username: safeUsername,
    content: safeContent,
    original,
    date: new Date(),
  });

  res.redirect('/');
});

// Handle filename test
app.post('/upload', (req, res) => {
  const { filename } = req.body;

  // Sanitize the filename
  const safeFilename = sanitizeFilename(filename);

  res.send(`
    <h1>Filename Sanitization Result</h1>
    <p><strong>Original filename:</strong> ${filename}</p>
    <p><strong>Sanitized filename:</strong> ${safeFilename}</p>
    <a href="/">Back to examples</a>
  `);
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Sanitization example running at http://localhost:${PORT}`);
});
