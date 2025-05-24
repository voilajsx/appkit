/**
 * Complete Security Example - @voilajsx/appkit Security Module
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
import { v4 as uuidv4 } from 'uuid'; // For requestId
import {
  // CSRF Protection
  generateCsrfToken,
  createCsrfMiddleware,

  // Rate Limiting
  createRateLimiter,

  // Input Sanitization
  sanitizeHtml,
  escapeString,
  sanitizeFilename, // Included for completeness
} from '../index.js';
import {
  createLogger,
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging';

// Create Express app
const app = express();

// Setup logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'security-demo' },
  transports: [
    new ConsoleTransport({ colorize: process.env.NODE_ENV !== 'production' }),
    new FileTransport({
      dirname: 'logs',
      filename: 'security-demo.log',
      retentionDays: 30,
      maxSize: 50 * 1024 * 1024, // 50MB
    }),
  ],
});

// Check session secret
const sessionSecret =
  process.env.SESSION_SECRET || 'fallback-secret-please-set-in-env';
if (!process.env.SESSION_SECRET) {
  logger.warn(
    'SESSION_SECRET not set, using fallback. Set a secure secret in production.'
  );
}

// Setup middleware
app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(express.json()); // For API endpoints
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Requires HTTPS
      httpOnly: true,
      sameSite: 'Lax',
    },
  })
);

// Add requestId for logging
app.use((req, res, next) => {
  req.logger = logger.child({ requestId: uuidv4() });
  next();
});

// Simple in-memory message store (limited to 100)
const messages = [];
const MAX_MESSAGES = 100;

// Shared CSS
const CSS = `
  body { font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; }
  section { border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
  h2 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
  button { padding: 10px 18px; margin: 5px 0; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
  button:hover { background-color: #218838; }
  input[type="text"], textarea { width: calc(100% - 20px); padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
  label { display: block; margin-bottom: 5px; font-weight: bold; }
  #api-results, #login-results { background: #f5f5f5; padding: 15px; margin-top: 10px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
  .message { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
  .message-meta { margin-top: 5px; font-size: 0.8em; color: #666; }
  .code-example { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
  .error { color: red; }
`;

// Shared HTML template
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

// ===== SECURITY MIDDLEWARE =====

// CSRF Protection
const csrfMiddleware = createCsrfMiddleware();
app.use((req, res, next) => {
  const csrfExemptPaths = ['/api/data', '/login'];
  if (csrfExemptPaths.includes(req.path) || req.path.startsWith('/api/')) {
    req.logger.info('CSRF skipped', { path: req.path });
    return next();
  }
  if (!req.session) {
    req.logger.error('Session not initialized for CSRF', { path: req.path });
    return res.status(500).send(
      renderPage({
        title: 'Server Error',
        content: `<h1>Server Error</h1><p class="error">Session not initialized.</p><a href="/">Back</a>`,
      })
    );
  }
  csrfMiddleware(req, res, next);
});

// Rate Limiting
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests. Please try again after 1 minute.' },
  headers: true, // Enable X-RateLimit-* headers
});
const loginLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: {
    error: 'Too many login attempts. Please try again after 5 minutes.',
  },
  headers: true,
});

app.use('/api/', apiLimiter);
app.post('/login', loginLimiter);

// ===== ROUTES =====

app.get('/', (req, res) => {
  if (!req.session) {
    req.logger.error('Session not initialized for CSRF token generation');
    return res.status(500).send(
      renderPage({
        title: 'Server Error',
        content: `<h1>Server Error</h1><p class="error">Session not initialized.</p><a href="/">Back</a>`,
      })
    );
  }
  const token = generateCsrfToken(req.session);

  const messagesList = messages
    .map(
      (msg) => `
        <div class="message">
          <h4>${escapeString(msg.username)}</h4>
          <div>${msg.message}</div>
          <div class="message-meta">
            <em>Received at: ${msg.timestamp.toLocaleString()}</em>
          </div>
        </div>
      `
    )
    .join('');

  const content = `
    <h1>Complete Security Example</h1>
    <p>This example demonstrates how <code>@voilajsx/appkit/security</code> protects an Express app.</p>
    
    <section>
      <h2>Security Features</h2>
      <div class="code-example">
        <p><strong>CSRF Protection:</strong> Uses session-based tokens to prevent unauthorized form submissions from other sites.</p>
        <p><strong>Rate Limiting:</strong> Limits requests to prevent abuse (10/min for API, 3/5min for login).</p>
        <p><strong>Input Sanitization:</strong></p>
        <ul>
          <li><code>escapeString</code>: Escapes special characters for plain text.</li>
          <li><code>sanitizeHtml</code>: Allows safe HTML tags, removes scripts and dangerous attributes.</li>
          <li><code>sanitizeFilename</code>: Ensures safe filenames (not used here).</li>
        </ul>
      </div>
    </section>
    
    <section>
      <h2>1. CSRF Protection & Input Sanitization</h2>
      <p>Submit a message with HTML like <code><b>bold</b></code> or <code><script>alert('XSS')</script></code>. Requires a CSRF token.</p>
      <form method="POST" action="/message">
        <input type="hidden" name="_csrf" value="${token}">
        <div>
          <label for="username">Your Name:</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div>
          <label for="message">Message (HTML content):</label>
          <textarea id="message" name="message" required></textarea>
        </div>
        <div>
          <button type="submit">Submit Message</button>
        </div>
      </form>
    </section>
    
    <section>
      <h2>2. Rate Limiting</h2>
      <p><strong>API Endpoint (<code>/api/data</code>):</strong> 10 requests per minute per IP.</p>
      <button onclick="callApi()">Call API Endpoint</button>
      <div id="api-results"></div>
      <p><strong>Login Endpoint (<code>/login</code>):</strong> 3 attempts per 5 minutes per IP.</p>
      <button onclick="tryLogin()">Try Login Endpoint</button>
      <div id="login-results"></div>
    </section>
    
    <section>
      <h2>Submitted Messages:</h2>
      ${messagesList || '<p>No messages yet. Submit one above!</p>'}
    </section>

    <script>
      async function callApi() {
        const resultDiv = document.getElementById('api-results');
        resultDiv.innerHTML = 'Loading...';
        try {
          const response = await fetch('/api/data');
          const data = await response.json();
          if (!response.ok) {
            let errorMsg = data.error || 'API request failed';
            if (response.status === 429 && response.headers.get('retry-after')) {
              const retryAfter = parseInt(response.headers.get('retry-after'), 10);
              errorMsg += \`. Retry in \${retryAfter} seconds.\`;
            }
            throw new Error(errorMsg);
          }
          resultDiv.innerHTML = '<h4>Response Body:</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          const headers = {};
          response.headers.forEach((value, key) => {
            if (key.startsWith('x-ratelimit') || key === 'retry-after') headers[key] = value;
          });
          resultDiv.innerHTML += '<h4>Rate Limit Headers:</h4><pre>' + JSON.stringify(headers, null, 2) + '</pre>';
        } catch (error) {
          resultDiv.innerHTML = '<p class="error">Error calling API: ' + error.message + '</p>';
        }
      }

      async function tryLogin() {
        const resultDiv = document.getElementById('login-results');
        resultDiv.innerHTML = 'Attempting login...';
        try {
          const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'password' })
          });
          const data = await response.json();
          if (!response.ok) {
            let errorMsg = data.error || 'Login request failed';
            if (response.status === 429 && response.headers.get('retry-after')) {
              const retryAfter = parseInt(response.headers.get('retry-after'), 10);
              errorMsg += \`. Retry in \${retryAfter} seconds.\`;
            }
            throw new Error(errorMsg);
          }
          resultDiv.innerHTML = '<h4>Response Body:</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
          const headers = {};
          response.headers.forEach((value, key) => {
            if (key.startsWith('x-ratelimit') || key === 'retry-after') headers[key] = value;
          });
          resultDiv.innerHTML += '<h4>Rate Limit Headers:</h4><pre>' + JSON.stringify(headers, null, 2) + '</pre>';
        } catch (error) {
          resultDiv.innerHTML = '<p class="error">Error during login attempt: ' + error.message + '</p>';
        }
      }
    </script>
  `;

  res.send(renderPage({ title: 'Complete Security Example', content }));
});

app.post('/message', (req, res) => {
  try {
    const { username, message } = req.body;

    // Validate inputs
    validateInput(username, 'Username', 50);
    validateInput(message, 'Message', 1000);

    // Sanitize inputs
    const safeUsername = escapeString(username);
    const safeMessage = sanitizeHtml(message, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'div'],
    });

    // Limit messages
    if (messages.length >= MAX_MESSAGES) {
      messages.shift();
    }

    // Store message
    messages.push({
      username: safeUsername,
      message: safeMessage,
      timestamp: new Date(),
    });

    req.logger.info('Message submitted', {
      username: safeUsername,
      messageLength: safeMessage.length,
    });

    res.redirect('/');
  } catch (error) {
    req.logger.error('Message submission failed', { error: error.message });
    res.status(400).send(
      renderPage({
        title: 'Error',
        content: `
          <h1>Error</h1>
          <p class="error">${escapeString(error.message)}</p>
          <a href="/">Back</a>
        `,
      })
    );
  }
});

app.get('/api/data', (req, res) => {
  req.logger.info('API data requested', { ip: req.ip });
  res.json({
    success: true,
    message: 'API response successful',
    timestamp: new Date().toISOString(),
  });
});

app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    validateInput(username, 'Username', 50);
    validateInput(password, 'Password', 100);
    req.logger.info('Login attempt', { username, ip: req.ip });
    res.json({
      success: true,
      message: 'Login request received',
      note: 'This endpoint is rate limited to prevent brute-force attacks.',
    });
  } catch (error) {
    req.logger.error('Login failed', { error: error.message, ip: req.ip });
    res.status(400).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  const logger = req.logger || logger; // Fallback to main logger
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).send(
      renderPage({
        title: 'Security Error',
        content: `
          <h1>Security Error: Invalid Token</h1>
          <p class="error">Invalid or missing CSRF token. This could be due to:</p>
          <ul>
            <li>Submitting an old form after page reload.</li>
            <li>A potential Cross-Site Request Forgery (CSRF) attack.</li>
          </ul>
          <a href="/">Back</a>
        `,
      })
    );
  } else if (err.status === 429) {
    res.status(429).send(
      renderPage({
        title: 'Too Many Requests',
        content: `
          <h1>Too Many Requests</h1>
          <p class="error">${escapeString(err.message)}</p>
          <a href="/">Back</a>
        `,
      })
    );
  } else {
    res.status(err.status || 500).send(
      renderPage({
        title: `Error ${err.status || 500}`,
        content: `
          <h1>Error ${err.status || 500}</h1>
          <p class="error">${
            process.env.NODE_ENV === 'production'
              ? 'An internal server error occurred.'
              : escapeString(err.message)
          }</p>
          <a href="/">Back</a>
        `,
      })
    );
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, async () => {
  logger.info('Server started', { port: PORT });
  console.log(`Complete security example running at http://localhost:${PORT}`);
  console.log('Open http://localhost:3000 in your browser.');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  try {
    await logger.flush();
    await logger.close();
    logger.info('Application shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Shutdown error', { error: error.message });
    process.exit(1);
  }
});
