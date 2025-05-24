/**
 * Basic CSRF Protection - @voilajsx/appkit Security Module
 *
 * This example demonstrates how to implement CSRF tokens in forms
 * to prevent cross-site request forgery attacks.
 *
 * Run: node 01-csrf-basic.js
 */

import express from 'express';
import session from 'express-session';
import { generateCsrfToken, createCsrfMiddleware } from '../index.js'; // Corrected import path

// Create Express app
const app = express();

// Setup middleware
app.use(express.urlencoded({ extended: true })); // For parsing x-www-form-urlencoded body
app.use(express.json()); // For parsing JSON body, though not strictly needed for this example

// Configure express-session middleware
app.use(
  session({
    secret: 'csrf-example-secret-key-very-secret-string', // Replace with a strong, random, long secret
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      sameSite: 'Lax', // Recommended for CSRF protection
    },
  })
);

// Create and apply CSRF middleware
const csrfMiddleware = createCsrfMiddleware();
app.use(csrfMiddleware); // Apply globally or to specific POST routes

// Routes
app.get('/', (req, res) => {
  // Generate a token for the form. This token is stored in the session.
  const token = generateCsrfToken(req.session);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CSRF Protection Example</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        form { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        input[type="text"], textarea { width: calc(100% - 20px); padding: 8px; margin: 5px 0; }
        button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
        .error-message { color: red; font-weight: bold; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>CSRF Protection Example</h1>
      <p>This page demonstrates how to protect forms from Cross-Site Request Forgery (CSRF) attacks.</p>
      <p>The **first form** includes a valid CSRF token in a hidden field. Submitting this form should succeed.</p>
      <p>The **second form** (malicious) lacks the CSRF token. Submitting it should result in a 403 Forbidden error.</p>
      
      <form method="POST" action="/submit">
        <h3>Valid Form (with CSRF token)</h3>
        <input type="hidden" name="_csrf" value="${token}">
        
        <div>
          <label for="message">Your Message:</label><br>
          <input type="text" id="message" name="message" value="Hello, secure world!" required>
        </div>
        
        <div style="margin-top: 15px;">
          <button type="submit">Submit Valid Form</button>
        </div>
      </form>
      
      <form method="POST" action="/submit">
        <h3>Malicious Form (without CSRF token)</h3>
        <p class="error-message">This form is missing the CSRF token. It simulates an attack.</p>
        
        <div>
          <label for="hack">Malicious Message:</label><br>
          <input type="text" id="hack" name="message" value="I was hacked! - from malicious site" required>
        </div>
        
        <div style="margin-top: 15px;">
          <button type="submit">Attempt Attack</button>
        </div>
      </form>

      <p style="margin-top: 30px;">
        <a href="/">Reload page to get a new token</a> (note: submitting an old token after reload will also fail)
      </p>
    </body>
    </html>
  `);
});

app.post('/submit', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Success</title></head>
    <body>
      <h1>Form Submitted Successfully</h1>
      <p>Your message: <strong>${req.body.message}</strong></p>
      <a href="/">Back to form</a>
    </body>
    </html>
  `);
});

// Error handler for CSRF errors
app.use((err, req, res, next) => {
  // Check if the error is specifically due to an invalid CSRF token
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head><title>CSRF Error</title></head>
      <body>
        <h1>CSRF Attack Detected!</h1>
        <p>Invalid or missing CSRF token.</p>
        <p>This usually happens if:</p>
        <ul>
          <li>You try to submit an old form after reloading the page.</li>
          <li>A malicious website tried to submit a form on your behalf.</li>
        </ul>
        <a href="/">Return to home page and try again</a>
      </body>
      </html>
    `);
  }
  // For any other error, pass it to the default error handler
  next(err);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`CSRF example running at http://localhost:${PORT}`);
  console.log('Open http://localhost:3000 in your browser.');
});
