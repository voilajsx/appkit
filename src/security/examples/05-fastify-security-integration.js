/**
 * Fastify CSRF Protection Example with Sessions - @voilajsx/appkit Security Module
 *
 * This example demonstrates stateful CSRF protection in a Fastify application.
 * It integrates:
 * - Fastify framework
 * - @fastify/cookie for cookie parsing
 * - @fastify/session for server-side session management
 * - @fastify/formbody for parsing x-www-form-urlencoded bodies (essential for forms)
 * - @voilajsx/appkit/security/csrf (your module) for CSRF token generation and middleware.
 *
 * It shows how to:
 * 1. Set up session middleware for Fastify.
 * 2. Generate a CSRF token and embed it in a form.
 * 3. Use your `createCsrfMiddleware` to protect a POST route.
 * 4. Handle CSRF-related errors (EBADCSRFTOKEN, ENOSESSION).
 *
 * Run: node 05-fastify-security-integration.js
 * Open: http://localhost:3000
 *
 * Dependencies:
 * npm install fastify @fastify/cookie @fastify/session @fastify/formbody @voilajsx/appkit
 */

import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyFormbody from '@fastify/formbody'; // <--- NEW: Import fastifyFormbody
import { generateCsrfToken, createCsrfMiddleware } from '../csrf.js'; // Adjust path if necessary

// Create Fastify instance
const fastify = Fastify({
  logger: false, // Set to true for more detailed Fastify logs
});

// --- Fastify Plugin Registrations ---

// 1. Register @fastify/cookie: Required by @fastify/session to parse cookies.
fastify.register(fastifyCookie);

// 2. Register @fastify/session: Sets up server-side session management.
//    CSRF tokens will be stored in `request.session`.
fastify.register(fastifySession, {
  secret:
    'a-super-long-and-random-secret-for-fastify-sessions-atleast-32-chars', // !!! IMPORTANT: Use a strong, unique secret in production
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true if running over HTTPS
    httpOnly: true, // Prevent client-side JS access to cookie
    sameSite: 'Lax', // Recommended for CSRF protection
    maxAge: 1000 * 60 * 60 * 24, // Session expiry (e.g., 1 day)
  },
  saveUninitialized: false, // Don't save session if unmodified
  resave: false, // Don't save session if unmodified
});

// 3. Register @fastify/formbody: Essential for parsing x-www-form-urlencoded POST requests.
//    This populates `request.body` for form submissions.
fastify.register(fastifyFormbody); // <--- NEW: Register fastifyFormbody

// --- CSRF Protection Middleware ---

// Create an instance of your CSRF middleware.
// This middleware expects `request.session` to be populated by `@fastify/session`.
const csrfProtection = createCsrfMiddleware();

// --- Fastify Hooks (Error Handling) ---

// Custom error handler for CSRF-specific errors thrown by the middleware.
fastify.setErrorHandler(async (error, request, reply) => {
  console.error('\n❌ Fastify Error Caught:');
  console.error('Code:', error.code);
  console.error('Message:', error.message);
  console.error('URL:', request.url);
  console.error('Method:', request.method);

  if (error.code === 'EBADCSRFTOKEN') {
    return reply.status(403).type('text/html').send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CSRF Error</title>
        <style>body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: red; }</style>
      </head>
      <body>
        <h1>Error: Invalid CSRF Token</h1>
        <p>Your request could not be processed due to an invalid or missing CSRF token.</p>
        <p>This typically indicates a security issue, an expired form, or incorrect submission.</p>
        <a href="/">Go back to the form</a>
      </body>
      </html>
    `);
  }

  if (error.code === 'ENOSESSION') {
    return reply.status(500).type('text/html').send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error</title>
        <style>body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: orange; }</style>
      </head>
      <body>
        <h1>Server Configuration Error</h1>
        <p>A session object was not found for CSRF validation. The server setup is incomplete.</p>
        <p>Please ensure session middleware is correctly registered before the CSRF middleware.</p>
      </body>
      </html>
    `);
  }

  // For any other unexpected errors, send a generic 500
  return reply
    .status(500)
    .send({ error: 'Internal Server Error', message: error.message });
});

// --- Routes ---

// GET /: Displays a form with a CSRF token
fastify.get('/', async (request, reply) => {
  // Ensure session is available before generating token
  if (!request.session) {
    // This should ideally not happen if session plugin is correctly registered,
    // but good for explicit error handling or early detection if hooks misbehave.
    throw new Error(
      'Session not initialized for this request. Check session plugin registration.'
    );
  }

  // Generate a CSRF token for the current session.
  // The token is automatically stored in `request.session` by your `generateCsrfToken` function.
  const token = generateCsrfToken(request.session);

  reply.type('text/html').send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fastify CSRF with Sessions</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        form { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        input[type="text"] { padding: 8px; margin: 5px 0; width: calc(100% - 10px); }
        button { padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #218838; }
        .info { color: blue; }
        .warn { color: orange; }
      </style>
    </head>
    <body>
      <h1>Fastify CSRF Protection (Stateful Sessions)</h1>
      <p class="info">This example uses <code>@fastify/session</code> to manage sessions and store CSRF tokens.</p>
      <p>The form below includes a hidden CSRF token. Submitting it should succeed.</p>
      <p class="warn">To test failure, try these:</p>
      <ul>
        <li>Open browser dev tools, delete the hidden <code>_csrf</code> input field, and submit.</li>
        <li>Reload this page (gets new token), then go back to the previous page's form and submit (old token).</li>
        <li>Manually change a character in the hidden <code>_csrf</code> token and submit.</li>
      </ul>

      <h2>Submit Your Secure Message</h2>
      <p>CSRF Token: <code>${token}</code> (for inspection, not production display)</p>
      <form method="POST" action="/submit">
        <input type="hidden" name="_csrf" value="${token}">
        
        <div>
          <label for="message">Message:</label><br>
          <input type="text" id="message" name="message" value="Hello Fastify!" required>
        </div>
        
        <div style="margin-top: 15px;">
          <button type="submit">Send Message Securely</button>
        </div>
      </form>

      <hr>
      <h3>Simulate Missing Token (Attack)</h3>
      <p class="warn">This form deliberately has NO CSRF token. Submitting it should fail.</p>
      <form method="POST" action="/submit">
        <div>
          <label for="malicious_message">Malicious Content:</label><br>
          <input type="text" id="malicious_message" name="message" value="You got hacked!" required>
        </div>
        <div style="margin-top: 15px;">
          <button type="submit" style="background-color: #dc3545;">Submit Malicious Request (Should Fail)</button>
        </div>
      </form>
    </body>
    </html>
  `);
});

// POST /submit: Handles form submission, protected by CSRF middleware
fastify.post(
  '/submit',
  {
    // Apply your CSRF middleware as a preHandler hook
    // This ensures it runs after body parsing and session initialization, but before the main route handler.
    preHandler: csrfProtection,
  },
  async (request, reply) => {
    // If we reach this point, CSRF validation has passed.
    const message = request.body.message;
    console.log(`✅ Received message: "${message}" (CSRF OK)`);

    reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
      <head><title>Success!</title></head>
      <body>
        <h1>Success! Message Received.</h1>
        <p>Your message: <strong>${message}</strong></p>
        <p>CSRF token validated successfully.</p>
        <a href="/">Back to form</a>
      </body>
      </html>
    `);
  }
);

// --- Start Server ---
const PORT = 3000;
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(
      `\n⚡ Fastify CSRF (Stateful) example running at http://localhost:${PORT}`
    );
    console.log('Open your browser to http://localhost:3000');
    console.log('========================\n');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
