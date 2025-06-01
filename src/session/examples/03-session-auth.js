/**
 * @file examples/03-session-auth.js
 * Session Authentication - @voilajsx/appkit
 *
 * Simple example showing session-based authentication and authorization
 *
 * Run: node 03-session-auth.js
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

// Session middleware
const sessionMiddleware = createSessionMiddleware({
  secret: 'simple-auth-demo-secret',
});

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Parse URL
    req.url = url.parse(req.url, true);
    req.path = req.url.pathname; // Fix for middleware compatibility

    // Parse body for POST requests
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

    // Apply session middleware
    await new Promise((resolve, reject) => {
      sessionMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Routes
    if (req.url.pathname === '/' && req.method === 'GET') {
      // Serve HTML interface
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Simple Session Auth</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; max-width: 800px; }
            .section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .user-info { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .success { color: #155724; }
            button { padding: 10px 20px; margin: 5px; font-size: 16px; cursor: pointer; }
            input, select { padding: 8px; margin: 5px; font-size: 14px; }
            #output { background: #f4f4f4; padding: 15px; margin-top: 20px; border-radius: 5px; max-height: 400px; overflow-y: auto; }
            pre { white-space: pre-wrap; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Simple Session Authentication</h1>
          
          <div class="section">
            <h3>Login</h3>
            <div>
              <select id="userSelect" onchange="fillCredentials()">
                <option value="">Choose user...</option>
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <input type="text" id="username" placeholder="Username" />
              <input type="password" id="password" placeholder="Password" />
              <button onclick="login()">Login</button>
            </div>
            <small>Try: user/password or admin/admin</small>
          </div>
          
          <div id="userInfo" style="display: none;" class="user-info">
            <h3>Logged in as:</h3>
            <div id="currentUser"></div>
            <button onclick="logout()">Logout</button>
          </div>
          
          <div class="section">
            <h3>Test Endpoints</h3>
            <button onclick="testHome()">Home (Public)</button>
            <button onclick="testProfile()">Profile (Login Required)</button>
            <button onclick="testAdmin()">Admin (Admin Only)</button>
          </div>
          
          <div id="status">Ready</div>
          <div id="output"></div>
          
          <script>
            const status = document.getElementById('status');
            const output = document.getElementById('output');
            const userInfo = document.getElementById('userInfo');
            const currentUser = document.getElementById('currentUser');
            
            function updateStatus(message, isError = false) {
              status.textContent = message;
              status.className = isError ? 'error' : 'success';
            }
            
            function updateOutput(data) {
              output.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            }
            
            function fillCredentials() {
              const select = document.getElementById('userSelect');
              const username = document.getElementById('username');
              const password = document.getElementById('password');
              
              if (select.value === 'user') {
                username.value = 'user';
                password.value = 'password';
              } else if (select.value === 'admin') {
                username.value = 'admin';
                password.value = 'admin';
              }
            }
            
            async function makeRequest(url, method = 'GET', body = null) {
              try {
                const options = { 
                  method,
                  credentials: 'same-origin'
                };
                
                if (body) {
                  options.headers = { 'Content-Type': 'application/json' };
                  options.body = JSON.stringify(body);
                }
                
                const response = await fetch(url, options);
                const data = await response.json();
                updateOutput(data);
                
                if (response.ok) {
                  updateStatus('Success');
                } else {
                  updateStatus('Failed: ' + data.message, true);
                }
                
                return data;
              } catch (error) {
                updateStatus('Error: ' + error.message, true);
                updateOutput({ error: error.message });
              }
            }
            
            async function login() {
              const username = document.getElementById('username').value;
              const password = document.getElementById('password').value;
              
              if (!username || !password) {
                updateStatus('Please enter username and password', true);
                return;
              }
              
              const result = await makeRequest('/login', 'POST', { username, password });
              
              if (result && result.success) {
                userInfo.style.display = 'block';
                currentUser.innerHTML = '<strong>' + result.user.name + '</strong> (' + result.user.role + ')';
              }
            }
            
            async function logout() {
              const result = await makeRequest('/logout', 'POST');
              if (result && result.success) {
                userInfo.style.display = 'none';
                currentUser.innerHTML = '';
              }
            }
            
            async function testHome() {
              await makeRequest('/home');
            }
            
            async function testProfile() {
              await makeRequest('/profile');
            }
            
            async function testAdmin() {
              await makeRequest('/admin');
            }
            
            updateStatus('Ready - Login to test authentication');
          </script>
        </body>
        </html>
      `);
    } else if (req.url.pathname === '/login' && req.method === 'POST') {
      // Login
      const { username, password } = req.body;
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        return res.json(
          {
            success: false,
            message: 'Invalid username or password',
          },
          401
        );
      }

      await req.session.save({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: req.session.data.user,
      });
    } else if (req.url.pathname === '/logout' && req.method === 'POST') {
      // Logout
      await req.session.destroy();
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } else if (req.url.pathname === '/profile') {
      // Protected route - check if user is logged in
      const user = req.session.data.user;

      if (!user) {
        return res.json(
          {
            success: false,
            message: 'Login required to access profile',
          },
          401
        );
      }

      res.json({
        success: true,
        message: 'Your profile',
        user: user,
        sessionAge: req.session.getAge() + 'ms',
      });
    } else if (req.url.pathname === '/admin') {
      // Admin only route
      const user = req.session.data.user;

      if (!user) {
        return res.json(
          {
            success: false,
            message: 'Login required',
          },
          401
        );
      }

      if (user.role !== 'admin') {
        return res.json(
          {
            success: false,
            message: 'Admin access required',
          },
          403
        );
      }

      res.json({
        success: true,
        message: 'Admin panel',
        user: user,
        adminData: 'Secret admin information',
        serverInfo: {
          uptime: Math.round(process.uptime()) + ' seconds',
          memory:
            Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        },
      });
    } else if (req.url.pathname === '/home') {
      // Home endpoint (public) - returns JSON
      res.json({
        success: true,
        message: 'Welcome to the session auth demo',
        user: req.session.data.user || null,
        authenticated: !!req.session.data.user,
        note: 'This is a public endpoint - no login required',
      });
    } else {
      // Default route for other paths
      res.json({
        success: true,
        message: 'Session auth demo API',
        user: req.session.data.user || null,
        note: 'This endpoint returns JSON data',
      });
    }
  } catch (error) {
    console.error('Server error:', error);

    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          message: 'Server error',
          error: error.message,
        })
      );
    }
  }
});

server.listen(3002, () => {
  console.log('Simple Session Auth running on http://localhost:3002');
  console.log('\nOpen http://localhost:3002 in your browser');
  console.log('\nTest Users:');
  console.log('• user/password (Regular User)');
  console.log('• admin/admin (Administrator)');
  console.log('\nTry accessing different endpoints!');
});
