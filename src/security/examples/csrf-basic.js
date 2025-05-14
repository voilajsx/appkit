/**
 * Basic CSRF Protection - @voilajs/appkit Security Module
 *
 * This example demonstrates how to implement CSRF tokens in forms
 * to prevent cross-site request forgery attacks.
 *
 * Run: node csrf-basic.js
 */

import express from 'express';
import session from 'express-session';
import {
  generateCsrfToken,
  createCsrfMiddleware,
} from '@voilajs/appkit/security';

// Create Express app
const app = express();

// Setup middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'csrf-example-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// Create and apply CSRF middleware
const csrf = createCsrfMiddleware();
app.use(csrf);

// Routes
app.get('/', (req, res) => {
  // Generate a token for the form
  const token = generateCsrfToken(req.session);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CSRF Protection Example</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        form { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>CSRF Protection Example</h1>
      
      <form method="POST" action="/submit">
        <!-- CSRF token in a hidden field -->
        <input type="hidden" name="_csrf" value="${token}">
        
        <div>
          <label for="message">Your Message:</label><br>
          <input type="text" id="message" name="message" required>
        </div>
        
        <div style="margin-top: 10px;">
          <button type="submit">Submit Form</button>
        </div>
      </form>
      
      <div>
        <h3>Try This Attack:</h3>
        <p>This form has no CSRF token and will fail:</p>
        
        <form method="POST" action="/submit">
          <div>
            <label for="hack">Malicious Message:</label><br>
            <input type="text" id="hack" name="message" value="I was hacked!" required>
          </div>
          
          <div style="margin-top: 10px;">
            <button type="submit">Attempt Attack</button>
          </div>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/submit', (req, res) => {
  res.send(`
    <h1>Form Submitted Successfully</h1>
    <p>Your message: ${req.body.message}</p>
    <a href="/">Back to form</a>
  `);
});

// Error handler for CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(`
      <h1>CSRF Attack Detected</h1>
      <p>Invalid or missing CSRF token</p>
      <a href="/">Back to form</a>
    `);
  }
  next(err);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`CSRF example running at http://localhost:${PORT}`);
});
