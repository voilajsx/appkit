/**
 * @file examples/02-file-sessions.js
 * File Store Sessions - @voilajsx/appkit
 *
 * Example showing file-based session storage
 *
 * Run: node 02-file-sessions.js
 */

import { createSessionMiddleware, FileStore } from '../index.js';
import http from 'http';
import url from 'url';

// Create file store
const fileStore = new FileStore('./example-sessions', {
  cleanupInterval: 30000, // Cleanup every 30 seconds for demo
});

// Create session middleware with file store
const sessionMiddleware = createSessionMiddleware({
  store: fileStore,
  secret: 'file-session-demo-secret',
  maxAge: 2 * 60 * 1000, // 2 minutes for demo
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
        <title>File Sessions Demo</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          button { padding: 10px 20px; margin: 5px; font-size: 16px; }
          .info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .success { color: green; }
          .error { color: red; }
          #output { background: #f4f4f4; padding: 15px; margin-top: 20px; border-radius: 5px; }
          pre { white-space: pre-wrap; }
          .file-list { background: #fff3cd; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>File Sessions Demo</h1>
        
        <div class="info">
          <strong>About File Sessions:</strong><br>
          Sessions are saved to disk in JSON files<br>
          Files persist across server restarts<br>
          Sessions expire after 2 minutes (for demo)<br>
          Check ./example-sessions/ folder to see files
        </div>
        
        <div>
          <button onclick="login()">Login</button>
          <button onclick="addToCart()">Add to Cart</button>
          <button onclick="viewCart()">View Cart</button>
          <button onclick="clearCart()">Clear Cart</button>
          <button onclick="logout()">Logout</button>
        </div>
        
        <div>
          <button onclick="listFiles()">List Session Files</button>
          <button onclick="getStats()">Get Stats</button>
          <button onclick="cleanup()">Manual Cleanup</button>
        </div>
        
        <div id="status">Ready</div>
        <div id="output"></div>
        
        <script>
          const status = document.getElementById('status');
          const output = document.getElementById('output');
          let cartItems = 0;
          
          function updateStatus(message, isError = false) {
            status.textContent = message;
            status.className = isError ? 'error' : 'success';
          }
          
          function updateOutput(data) {
            output.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          }
          
          async function makeRequest(url, method = 'GET', body = null) {
            try {
              const options = { 
                method,
                credentials: 'same-origin',
                headers: {}
              };
              
              if (body) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
              }
              
              const response = await fetch(url, options);
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
            await makeRequest('/login', 'POST', { 
              username: 'demo-user',
              name: 'File Demo User'
            });
          }
          
          async function addToCart() {
            cartItems++;
            const items = [
              { name: 'Laptop', price: 999 },
              { name: 'Mouse', price: 25 },
              { name: 'Keyboard', price: 75 },
              { name: 'Monitor', price: 300 }
            ];
            const item = items[cartItems % items.length];
            
            updateStatus('Adding to cart...');
            await makeRequest('/cart/add', 'POST', item);
          }
          
          async function viewCart() {
            updateStatus('Getting cart...');
            await makeRequest('/cart');
          }
          
          async function clearCart() {
            updateStatus('Clearing cart...');
            await makeRequest('/cart/clear', 'POST');
          }
          
          async function logout() {
            updateStatus('Logging out...');
            await makeRequest('/logout', 'POST');
          }
          
          async function listFiles() {
            updateStatus('Listing session files...');
            await makeRequest('/files');
          }
          
          async function getStats() {
            updateStatus('Getting stats...');
            await makeRequest('/stats');
          }
          
          async function cleanup() {
            updateStatus('Running cleanup...');
            await makeRequest('/cleanup', 'POST');
          }
          
          // Auto-refresh file list every 10 seconds
          setInterval(() => {
            if (document.visibilityState === 'visible') {
              listFiles();
            }
          }, 10000);
          
          updateStatus('Ready - Sessions will be saved to files');
        </script>
      </body>
      </html>
    `);
  } else if (req.url.pathname === '/login' && req.method === 'POST') {
    // Parse request body
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    await new Promise((resolve) => req.on('end', resolve));

    const userData = JSON.parse(body || '{}');

    await req.session.save({
      user: {
        id: Date.now(),
        username: userData.username || 'demo',
        name: userData.name || 'Demo User',
        loginTime: new Date().toISOString(),
      },
      cart: [],
    });

    res.json({
      success: true,
      message: 'Logged in and session saved to file',
      sessionId: req.session.id,
      user: req.session.data.user,
      fileInfo: 'Check ./example-sessions/ folder for session file',
    });
  } else if (req.url.pathname === '/cart/add' && req.method === 'POST') {
    // Add item to cart
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    await new Promise((resolve) => req.on('end', resolve));

    const item = JSON.parse(body || '{}');
    const cart = req.session.data.cart || [];

    cart.push({
      ...item,
      id: Date.now(),
      addedAt: new Date().toISOString(),
    });

    await req.session.save({
      ...req.session.data,
      cart,
    });

    res.json({
      success: true,
      message: 'Item added to cart and saved to file',
      cart,
      total: cart.reduce((sum, item) => sum + (item.price || 0), 0),
    });
  } else if (req.url.pathname === '/cart') {
    // View cart
    const cart = req.session.data.cart || [];
    res.json({
      success: true,
      cart,
      itemCount: cart.length,
      total: cart.reduce((sum, item) => sum + (item.price || 0), 0),
      sessionId: req.session.id,
    });
  } else if (req.url.pathname === '/cart/clear' && req.method === 'POST') {
    // Clear cart
    await req.session.save({
      ...req.session.data,
      cart: [],
    });

    res.json({
      success: true,
      message: 'Cart cleared and file updated',
    });
  } else if (req.url.pathname === '/logout' && req.method === 'POST') {
    // Logout - this will delete the session file
    await req.session.destroy();
    res.json({
      success: true,
      message: 'Logged out and session file deleted',
    });
  } else if (req.url.pathname === '/files') {
    // List session files
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir('./example-sessions');
      const sessionFiles = files.filter((f) => f.endsWith('.json'));

      // Get file details
      const fileDetails = await Promise.all(
        sessionFiles.map(async (file) => {
          try {
            const stats = await fs.stat(`./example-sessions/${file}`);
            return {
              name: file,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
            };
          } catch (e) {
            return { name: file, error: 'Could not read file stats' };
          }
        })
      );

      res.json({
        success: true,
        message: `Found ${sessionFiles.length} session files`,
        files: fileDetails,
        directory: './example-sessions/',
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Session directory not found or empty',
        files: [],
        note: 'Login to create session files',
      });
    }
  } else if (req.url.pathname === '/stats') {
    // Get session stats
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir('./example-sessions');
      const sessionFiles = files.filter((f) => f.endsWith('.json'));

      res.json({
        success: true,
        stats: {
          totalFiles: sessionFiles.length,
          currentSession: req.session.id,
          sessionAge: req.session.getAge() + 'ms',
          isActive: req.session.isActive(),
          maxAge: '2 minutes (demo setting)',
          cleanupInterval: '30 seconds',
        },
      });
    } catch (error) {
      res.json({
        success: true,
        stats: {
          totalFiles: 0,
          currentSession: req.session.id,
          sessionAge: req.session.getAge() + 'ms',
          isActive: req.session.isActive(),
          note: 'Session directory not created yet',
        },
      });
    }
  } else if (req.url.pathname === '/cleanup' && req.method === 'POST') {
    // Manual cleanup of expired sessions
    try {
      await fileStore.clear();
      res.json({
        success: true,
        message: 'Manual cleanup completed - all session files removed',
      });
    } catch (error) {
      res.json({
        success: false,
        message: 'Cleanup failed: ' + error.message,
      });
    }
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

server.listen(3001, () => {
  console.log('File Sessions Demo running on http://localhost:3001');
  console.log('\nOpen http://localhost:3001 in your browser');
  console.log('Sessions will be saved to ./example-sessions/ folder');
  console.log('You can watch the folder to see files being created/deleted');
  console.log('\nSessions expire after 2 minutes for demo purposes');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  fileStore.stopCleanup();
  process.exit(0);
});
