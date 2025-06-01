/**
 * @file examples/01-basic-session.js
 * Basic Session - @voilajsx/appkit
 *
 * Simple example showing how to create and use sessions with HTML interface
 *
 * Run: node 01-basic-session.js
 */

import { createSessionMiddleware } from '../index.js';
import http from 'http';
import url from 'url';

// Create session middleware
const sessionMiddleware = createSessionMiddleware({
  secret: 'my-development-secret',
});

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  // Parse URL
  req.url = url.parse(req.url, true);

  // Add JSON helper
  res.json = (data) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  };

  // Apply session middleware
  await new Promise((resolve) => {
    sessionMiddleware(req, res, resolve);
  });

  // Routes
  if (req.url.pathname === '/' && req.method === 'GET') {
    // Serve HTML interface
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Session Demo</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          button { padding: 10px 20px; margin: 5px; font-size: 16px; }
          .success { color: green; }
          .error { color: red; }
          #output { background: #f4f4f4; padding: 15px; margin-top: 20px; border-radius: 5px; }
          pre { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>Session Demo</h1>
        <p>Test session management with the buttons below:</p>
        
        <div>
          <button onclick="login()">Login</button>
          <button onclick="getProfile()">Get Profile</button>
          <button onclick="logout()">Logout</button>
          <button onclick="checkSession()">Check Session</button>
        </div>
        
        <div id="status">Ready</div>
        <div id="output"></div>
        
        <script>
          const status = document.getElementById('status');
          const output = document.getElementById('output');
          
          function updateStatus(message, isError = false) {
            status.textContent = message;
            status.className = isError ? 'error' : 'success';
          }
          
          function updateOutput(data) {
            output.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          }
          
          async function makeRequest(url, method = 'GET') {
            try {
              const response = await fetch(url, { 
                method,
                credentials: 'same-origin' // Important for cookies
              });
              const data = await response.json();
              updateOutput(data);
              
              if (response.ok) {
                updateStatus('Request successful');
              } else {
                updateStatus('Request failed: ' + response.status, true);
              }
              
              return data;
            } catch (error) {
              updateStatus('Error: ' + error.message, true);
              updateOutput({ error: error.message });
            }
          }
          
          async function login() {
            updateStatus('Logging in...');
            await makeRequest('/login', 'POST');
          }
          
          async function getProfile() {
            updateStatus('Getting profile...');
            await makeRequest('/profile');
          }
          
          async function logout() {
            updateStatus('Logging out...');
            await makeRequest('/logout', 'POST');
          }
          
          async function checkSession() {
            updateStatus('Checking session...');
            await makeRequest('/session');
          }
          
          // Initial load
          updateStatus('Ready - Click buttons to test sessions');
        </script>
      </body>
      </html>
    `);
  } else if (req.url.pathname === '/login' && req.method === 'POST') {
    // Save user to session
    await req.session.save({
      user: {
        id: 123,
        name: 'Demo User',
        email: 'demo@example.com',
      },
      loginTime: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      sessionId: req.session.id,
      user: req.session.data.user,
    });
  } else if (req.url.pathname === '/profile') {
    // Get user from session
    const user = req.session.data.user;

    if (user) {
      res.json({
        success: true,
        message: 'Profile data retrieved',
        user,
        sessionAge: req.session.getAge() + 'ms',
        sessionId: req.session.id,
      });
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          message: 'Not logged in - please login first',
        })
      );
    }
  } else if (req.url.pathname === '/session') {
    // Check session status
    res.json({
      success: true,
      sessionId: req.session.id,
      isActive: req.session.isActive(),
      data: req.session.data,
      age: req.session.getAge() + 'ms',
    });
  } else if (req.url.pathname === '/logout' && req.method === 'POST') {
    // Destroy session
    await req.session.destroy();
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } else {
    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        message: 'Not found',
      })
    );
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('\nOpen http://localhost:3000 in your browser');
  console.log('Click the buttons to test session functionality');
  console.log('\nSessions are stored in memory');
});
