/**
 * @file examples/04-middleware-auth.js
 * Middleware Authentication - @voilajsx/appkit
 *
 * Simple example showing proper usage of session auth middleware
 *
 * Run: node 04-middleware-auth.js
 */

import {
  createSessionMiddleware,
  createSessionAuthMiddleware,
  createSessionAuthorizationMiddleware,
} from '../index.js';
import http from 'http';
import url from 'url';

// Mock users
const users = [
  {
    id: 1,
    username: 'user',
    password: 'password',
    name: 'Regular User',
    role: 'user',
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin',
    name: 'Administrator',
    role: 'admin',
  },
];

// Create middleware
const sessionMiddleware = createSessionMiddleware({
  secret: 'middleware-auth-demo-secret',
});

const authRequired = createSessionAuthMiddleware({
  loginUrl: '/login',
  onAuthRequired: (req, res, next, error) => {
    // Always return JSON for this demo
    if (!res.headersSent) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          message: 'Authentication required',
          error: error.message,
        })
      );
    }
  },
});

const adminOnly = createSessionAuthorizationMiddleware(['admin']);

// Helper to apply middleware with JSON error handling
async function applyMiddleware(req, res, middleware) {
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Helper to apply middleware and handle errors as JSON
async function applyMiddlewareWithJsonErrors(req, res, middleware) {
  return new Promise((resolve, reject) => {
    console.log('Applying middleware, headers sent?', res.headersSent);

    // Set a timeout to detect hanging middleware
    const timeout = setTimeout(() => {
      console.log('MIDDLEWARE TIMEOUT - middleware never called callback');
      console.log('Headers sent during timeout?', res.headersSent);
      if (res.headersSent) {
        console.log('Response was sent by middleware without calling callback');
        reject(new Error('Middleware sent response without calling callback'));
      } else {
        reject(new Error('Middleware timeout'));
      }
    }, 1000);

    middleware(req, res, (err) => {
      clearTimeout(timeout);
      console.log('Middleware callback called with error:', err);
      console.log('Headers sent after middleware?', res.headersSent);

      if (err) {
        console.log('Middleware returned error:', err.message);

        if (!res.headersSent) {
          // Determine status based on error type
          let status = 500;
          let message = err.message;

          if (
            err.message.includes('Authentication required') ||
            err.message.includes('No active session') ||
            err.message.includes('No user in session')
          ) {
            status = 401;
            message = 'Authentication required - please login';
          } else if (
            err.message.includes('Insufficient permissions') ||
            err.message.includes('Admin access required') ||
            err.message.includes('Access forbidden')
          ) {
            status = 403;
            message = 'Admin access required - insufficient permissions';
          }

          console.log('Sending error response:', { status, message });
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              message: message,
              status,
              originalError: err.message,
            })
          );
        } else {
          console.log('Headers already sent, cannot send error response');
        }
        reject(err);
      } else {
        console.log('Middleware passed successfully');
        resolve();
      }
    });
  });
}

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Store original URL string before parsing
    const originalUrl = req.url;
    const parsedUrl = url.parse(req.url, true);

    // Keep original URL as string for middleware compatibility
    req.url = originalUrl;
    req.path = parsedUrl.pathname;
    req.query = parsedUrl.query;

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      await new Promise((resolve) => req.on('end', resolve));
      try {
        req.body = JSON.parse(body || '{}');
      } catch (e) {
        req.body = {};
      }
    }

    // JSON helper
    res.json = (data, status = 200) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data, null, 2));
    };

    // Always apply session middleware
    await applyMiddleware(req, res, sessionMiddleware);

    // Routes - use req.path instead of req.url.pathname
    if (req.path === '/' && req.method === 'GET') {
      // Public home page
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Middleware Auth Demo</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; max-width: 600px; }
            button { padding: 10px 20px; margin: 5px; font-size: 16px; }
            .section { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .success { color: green; }
            .error { color: red; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Middleware Auth Demo</h1>
          
          <div class="section">
            <h3>Login</h3>
            <input type="text" id="username" placeholder="Username" value="user" />
            <input type="password" id="password" placeholder="Password" value="password" />
            <button onclick="login()">Login</button>
            <button onclick="loginAsAdmin()">Login as Admin</button>
          </div>
          
          <div class="section">
            <h3>Test Routes</h3>
            <button onclick="testPublic()">Public Route</button>
            <button onclick="testProtected()">Protected Route</button>
            <button onclick="testAdmin()">Admin Route</button>
            <button onclick="logout()">Logout</button>
          </div>
          
          <div id="status">Ready</div>
          <pre id="output"></pre>
          
          <script>
            const status = document.getElementById('status');
            const output = document.getElementById('output');
            
            function updateStatus(message, isError = false) {
              status.textContent = message;
              status.className = isError ? 'error' : 'success';
            }
            
            async function makeRequest(url, method = 'GET', body = null) {
              try {
                const options = { method, credentials: 'same-origin' };
                if (body) {
                  options.headers = { 'Content-Type': 'application/json' };
                  options.body = JSON.stringify(body);
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                output.textContent = JSON.stringify(data, null, 2);
                
                updateStatus(response.ok ? 'Success' : 'Failed: ' + response.status, !response.ok);
                return data;
              } catch (error) {
                updateStatus('Error: ' + error.message, true);
                output.textContent = JSON.stringify({ error: error.message }, null, 2);
              }
            }
            
            function login() {
              const username = document.getElementById('username').value;
              const password = document.getElementById('password').value;
              makeRequest('/login', 'POST', { username, password });
            }
            
            function loginAsAdmin() {
              document.getElementById('username').value = 'admin';
              document.getElementById('password').value = 'admin';
              makeRequest('/login', 'POST', { username: 'admin', password: 'admin' });
            }
            
            function testPublic() { makeRequest('/public'); }
            function testProtected() { makeRequest('/protected'); }
            function testAdmin() { makeRequest('/admin'); }
            function logout() { makeRequest('/logout', 'POST'); }
          </script>
        </body>
        </html>
      `);
    } else if (req.path === '/login' && req.method === 'POST') {
      // Login route
      const { username, password } = req.body;
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        return res.json(
          { success: false, message: 'Invalid credentials' },
          401
        );
      }

      await req.session.save({ user });
      res.json({ success: true, message: 'Login successful', user });
    } else if (req.path === '/logout' && req.method === 'POST') {
      // Logout route
      await req.session.destroy();
      res.json({ success: true, message: 'Logged out' });
    } else if (req.path === '/public') {
      // Public route - no middleware needed
      res.json({
        success: true,
        message: 'This is a public route',
        user: req.session.data.user || null,
      });
    } else if (req.path === '/protected') {
      // Protected route - requires authentication
      try {
        await applyMiddlewareWithJsonErrors(req, res, authRequired);

        res.json({
          success: true,
          message: 'This is a protected route',
          user: req.user,
        });
      } catch (error) {
        // Error already handled by applyMiddlewareWithJsonErrors
        return;
      }
    } else if (req.path === '/admin') {
      // Admin route - manual auth and authorization checks for JSON responses
      console.log('=== ADMIN ROUTE DEBUG ===');
      console.log('Session user:', req.session?.data?.user);
      console.log('User role:', req.session?.data?.user?.role);

      // Check if user is logged in
      if (!req.session?.data?.user) {
        return res.json(
          {
            success: false,
            message: 'Authentication required - please login first',
          },
          401
        );
      }

      // Check if user has admin role
      if (req.session.data.user.role !== 'admin') {
        return res.json(
          {
            success: false,
            message: 'Access denied - admin role required',
            userRole: req.session.data.user.role,
            requiredRole: 'admin',
          },
          403
        );
      }

      // User is admin, grant access
      res.json({
        success: true,
        message: 'Admin access granted',
        user: req.session.data.user,
        adminData: 'Secret admin information',
      });
    } else {
      res.json({ success: false, message: 'Not found' }, 404);
    }
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      res.json(
        { success: false, message: error.message },
        error.message.includes('Authentication') ? 401 : 500
      );
    }
  }
});

server.listen(3003, () => {
  console.log('Middleware Auth Demo running on http://localhost:3003');
  console.log('\nOpen http://localhost:3003 in your browser');
  console.log('\nTest Users:');
  console.log('• user/password (Regular User)');
  console.log('• admin/admin (Administrator)');
  console.log('\nTry the different routes to see middleware in action!');
});
