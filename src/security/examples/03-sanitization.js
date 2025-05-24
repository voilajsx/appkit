/**
 * Input Sanitization - @voilajsx/appkit Security Module
 *
 * This example demonstrates how to safely handle user input
 * to prevent XSS and path traversal attacks using sanitization utilities.
 *
 * Run: node 03-sanitization.js
 */

import express from 'express';
import {
  sanitizeHtml,
  escapeString,
  sanitizeFilename,
} from '@voilajsx/appkit/security';

// Create Express app
const app = express();
app.use(express.urlencoded({ extended: true })); // For parsing x-www-form-urlencoded body

// Simple in-memory storage for comments (limited to 100 for demo)
const comments = [];
const MAX_COMMENTS = 100;

// Shared CSS for consistent styling
const CSS = `
  body { font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; }
  form { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
  textarea, input[type="text"] { width: calc(100% - 20px); min-height: 80px; padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
  input[type="text"] { min-height: unset; height: 38px; }
  button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
  button:hover { background-color: #0056b3; }
  .code-example { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
  h2 { margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  label { display: block; margin-bottom: 5px; font-weight: bold; }
  .comment { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
  .comment-content { background: #f5f5f5; padding: 10px; border-radius: 3px; }
  .comment-meta { margin-top: 5px; font-size: 0.8em; color: #666; }
`;

// Shared HTML template function
const renderPage = ({ title, content }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${title}</title>
    <style>${CSS}</style>
  </head>
  <body>
    ${content}
  </body>
  </html>
`;

// Input validation helper
const validateInput = (input, name, maxLength) => {
  if (!input || input.trim().length === 0) {
    throw new Error(`${name} cannot be empty`);
  }
  if (input.length > maxLength) {
    throw new Error(
      `${name} exceeds maximum length of ${maxLength} characters`
    );
  }
  return input.trim();
};

// Routes
app.get('/', (req, res) => {
  // Generate comments list safely
  const commentsList = comments
    .map(
      (comment) => `
        <div class="comment">
          <h4>${escapeString(comment.username)}</h4>
          <div class="comment-content">${comment.content}</div>
          <div class="comment-meta">
            <strong>Original Input:</strong> <code>${escapeString(comment.original)}</code>
          </div>
          <div class="comment-meta">
            <em>Sanitized at: ${comment.date.toLocaleString()}</em>
          </div>
        </div>
      `
    )
    .join('');

  const content = `
    <h1>Input Sanitization Example</h1>
    <p>This example demonstrates how to use the security module's sanitization utilities to prevent XSS and path traversal attacks.</p>
    
    <h2>Comment Form (HTML Sanitization)</h2>
    <p>Try submitting comments with <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code>, <code>&lt;img src="x" onerror="alert('XSS')"&gt;</code>, or <code>&lt;a href="javascript:alert('XSS')"&gt;Click me&lt;/a&gt;</code>.
    Allowed tags are <code>&lt;b&gt;</code>, <code>&lt;i&gt;</code>, <code>&lt;em&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;div&gt;</code>.</p>
    <form method="POST" action="/comment">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
      </div>
      
      <div style="margin-top: 10px;">
        <label for="content">Comment (try adding HTML):</label>
        <textarea id="content" name="content" required></textarea>
      </div>
      
      <div style="margin-top: 10px;">
        <button type="submit">Submit Comment</button>
      </div>
    </form>
    
    <h2>Filename Sanitization Example</h2>
    <p>Try submitting filenames like <code>../../../etc/passwd</code> or <code>image.jpg%00.exe</code>.</p>
    <form method="POST" action="/upload">
      <div>
        <label for="filename">File Path/Name:</label>
        <input type="text" id="filename" name="filename" required>
      </div>
      
      <div style="margin-top: 10px;">
        <button type="submit">Test Filename</button>
      </div>
    </form>
    
    <h2>Sanitization Logic (from <code>@voilajsx/appkit/security</code>):</h2>
    <div class="code-example">
      <p><strong><code>escapeString(input)</code>:</strong> Converts special characters (<code>&</code>, <code>&lt;</code>, <code>&gt;</code>, <code>"</code>, <code>'</code>, <code>/</code>) to HTML entities for safe rendering as plain text.</p>
      <p><strong><code>sanitizeHtml(input, options)</code>:</strong></p>
      <ul>
        <li>Removes all <code>&lt;script&gt;</code> tags and event handlers (<code>onclick</code>, <code>onerror</code>, etc.).</li>
        <li>Strips dangerous protocols (<code>javascript:</code>, <code>data:</code>).</li>
        <li>Keeps only specified tags if <code>options.allowedTags</code> is provided (e.g., <code>['b', 'i', 'p']</code>).</li>
        <li>Removes all tags if <code>options.stripAllTags</code> is <code>true</code>.</li>
      </ul>
      <p><strong><code>sanitizeFilename(filename)</code>:</strong></p>
      <ul>
        <li>Removes path traversal sequences (<code>..</code>, <code>/</code>, <code>\</code>).</li>
        <li>Allows only alphanumeric, underscore, dot, and hyphen characters.</li>
        <li>Truncates to 255 characters to prevent filesystem issues.</li>
      </ul>
    </div>
    
    <h2>Comments:</h2>
    ${commentsList || '<p>No comments yet. Submit one above!</p>'}
  `;

  res.send(renderPage({ title: 'Input Sanitization Example', content }));
});

// Handle comment submission
app.post('/comment', async (req, res) => {
  try {
    const { username, content } = req.body;

    // Validate inputs
    validateInput(username, 'Username', 50);
    validateInput(content, 'Comment', 1000);

    // Save original input for demonstration purposes
    const original = content;

    // Sanitize username (for plain text rendering)
    const safeUsername = escapeString(username);

    // Sanitize content (allow limited HTML)
    const safeContent = sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'div'],
    });

    // Limit comments to prevent unbounded growth
    if (comments.length >= MAX_COMMENTS) {
      comments.shift(); // Remove oldest comment
    }

    // Store sanitized comment
    comments.push({
      username: safeUsername,
      content: safeContent,
      original,
      date: new Date(),
    });

    res.redirect('/');
  } catch (error) {
    res.status(400).send(
      renderPage({
        title: 'Error',
        content: `
          <h1>Error</h1>
          <p>${escapeString(error.message)}</p>
          <a href="/">Back to form</a>
        `,
      })
    );
  }
});

// Handle filename test
app.post('/upload', async (req, res) => {
  try {
    const { filename } = req.body;

    // Validate input
    validateInput(filename, 'Filename', 255);

    // Sanitize the filename
    const safeFilename = sanitizeFilename(filename);

    const content = `
      <h1>Filename Sanitization Result</h1>
      <p><strong>Original filename:</strong> <code>${escapeString(filename)}</code></p>
      <p><strong>Sanitized filename:</strong> <code>${safeFilename}</code></p>
      <p><strong>Why this is safe:</strong></p>
      <ul>
        <li>Path traversal attempts (e.g., <code>..</code>, <code>/</code>) are removed to prevent accessing unintended directories.</li>
        <li>Only safe characters (alphanumeric, <code>_</code>, <code>.</code>, <code>-</code>) are allowed to prevent injection or filesystem errors.</li>
        <li>Length is capped at 255 characters to comply with filesystem limits.</li>
      </ul>
      <p><strong>Recommendation:</strong> For production, combine with strict file extension whitelisting (e.g., only <code>.pdf</code>, <code>.jpg</code>) and validate file content.</p>
      <a href="/">Back to examples</a>
    `;

    res.send(renderPage({ title: 'Filename Sanitization Result', content }));
  } catch (error) {
    res.status(400).send(
      renderPage({
        title: 'Error',
        content: `
          <h1>Error</h1>
          <p>${escapeString(error.message)}</p>
          <a href="/">Back to form</a>
        `,
      })
    );
  }
});

// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Sanitization example running at http://localhost:${PORT}`);
  console.log('Open http://localhost:3002 in your browser.');
});
