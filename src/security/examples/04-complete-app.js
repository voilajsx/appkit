/**
 * Complete Security Example - @voilajs/appkit Security Module
 *
 * This example demonstrates all security features working together:
 * - CSRF protection for forms
 * - Rate limiting for API endpoints
 * - Input sanitization for user content
 *
 * Run: node 04-complete-app.js
 */

import express from 'express';
import session from 'express-session';
import {
  // CSRF Protection
  generateCsrfToken,
  createCsrfMiddleware,

  // Rate Limiting
  createRateLimiter,

  // Input Sanitization
  sanitizeHtml,
  escapeString,
  sanitizeFilename,
} from '@voilajs/appkit/security';

// Create Express app
const app = express();

// Setup middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'secure-app-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

// Message store for demo
const messages = [];

// ===== SECURITY MIDDLEWARE =====

// 1. CSRF Protection
const csrf = createCsrfMiddleware();
app.use((req, res, next) => {
  // Skip CSRF for API paths
  if (req.path.startsWith('/api/')) {
    return next();
  }
  csrf(req, res, next);
});

// 2. Rate Limiting
// Standard API rate limit: 10 requests per minute
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});

// Login rate limit: 3 attempts per 5 minutes
const loginLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: 'Too many login attempts, please try again later',
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/login', loginLimiter);

// ===== ROUTES =====

// Home page with form
app.get('/', (req, res) => {
  const token = generateCsrfToken(req.session);

  // Format messages for display
  const messagesList = messages
    .map(
      (msg) =>
        `<div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
      <h4>${msg.username}</h4>
      <div>${msg.message}</div>
      <div style="margin-top: 5px; font-size: 0.8em; color: #666;">
        <strong>Sanitization Applied:</strong> Scripts, event handlers, and unsafe HTML removed
      </div>
    </div>`
    )
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Complete Security Example</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        section { border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        h2 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        button { padding: 8px 16px; margin: 5px 0; }
        input, textarea { width: 100%; margin: 5px 0; padding: 8px; }
        #api-results, #login-results { background: #f5f5f5; padding: 10px; margin-top: 10px; }
      </style>
      <script>
        // API test function
        async function callApi() {
          const resultDiv = document.getElementById('api-results');
          try {
            const response = await fetch('/api/data');
            const data = await response.json();
            resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            resultDiv.innerHTML = '<p>Error: ' + error.message + '</p>';
          }
        }
        
        // Login test function
        async function tryLogin() {
          const resultDiv = document.getElementById('login-results');
          try {
            const response = await fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: 'test', password: 'password' })
            });
            const data = await response.json();
            resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            resultDiv.innerHTML = '<p>Error: ' + error.message + '</p>';
          }
        }
      </script>
    </head>
    <body>
      <h1>Complete Security Example</h1>
      <p>This example demonstrates all security features of @voilajs/appkit/security working together.</p>
      
      <section>
        <h2>1. CSRF Protection</h2>
        <form method="POST" action="/message">
          <input type="hidden" name="_csrf" value="${token}">
          
          <div>
            <label for="username">Your Name:</label>
            <input type="text" id="username" name="username" required>
          </div>
          
          <div>
            <label for="message">Message (HTML allowed):</label>
            <textarea id="message" name="message" required></textarea>
          </div>
          
          <div>
            <button type="submit">Submit Message</button>
          </div>
        </form>
      </section>
      
      <section>
        <h2>2. Rate Limiting</h2>
        <p>API endpoints are limited to 10 requests per minute.</p>
        <button onclick="callApi()">Call API Endpoint</button>
        <div id="api-results"></div>
        
        <p>Login is limited to 3 attempts per 5 minutes.</p>
        <button onclick="tryLogin()">Try Login Endpoint</button>
        <div id="login-results"></div>
      </section>
      
      <section>
        <h2>3. Input Sanitization</h2>
        <p>Try adding HTML or script tags in the message form above. Scripts and unsafe tags will be removed.</p>
      </section>
      
      <section>
        <h2>Submitted Messages:</h2>
        ${messagesList || '<p>No messages yet.</p>'}
      </section>
    </body>
    </html>
  `);
});

// Handle message form submissions (with CSRF and sanitization)
app.post('/message', (req, res) => {
  const { username, message } = req.body;

  // Sanitize user input
  const safeUsername = escapeString(username);
  const safeMessage = sanitizeHtml(message, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p'],
  });

  // Store message
  messages.push({
    username: safeUsername,
    message: safeMessage,
    timestamp: new Date().toISOString(),
  });

  res.redirect('/');
});

// API endpoint (rate limited)
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    message: 'API response successful',
    timestamp: new Date().toISOString(),
  });
});

// Login endpoint (rate limited)
app.post('/login', (req, res) => {
  // In a real app, you would verify credentials here
  res.json({
    success: true,
    message: 'Login request received',
    note: 'This endpoint is rate limited to prevent brute force attacks',
  });
});

// Error handler for CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(`
      <h1>Security Error</h1>
      <p>Invalid security token. This could be due to:</p>
      <ul>
        <li>An expired form</li>
        <li>A CSRF attack attempt</li>
      </ul>
      <a href="/">Return to home page</a>
    `);
  }
  next(err);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Complete security example running at http://localhost:${PORT}`);
});
