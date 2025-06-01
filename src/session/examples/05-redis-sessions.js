/**
 * @file examples/05-redis-sessions.js
 * Redis Sessions - @voilajsx/appkit
 *
 * Simple example showing Redis-based session storage for production
 *
 * Prerequisites: Redis server running on localhost:6379
 * Run: node 05-redis-sessions.js
 */

import { createSessionMiddleware, RedisStore } from '../index.js';
import http from 'http';
import url from 'url';

// Check if Redis is available (for future use)
let redisAvailable = false;
try {
  const { createClient } = await import('redis');
  redisAvailable = true;
  console.log('✅ Redis client library available');
} catch (error) {
  console.log('⚠️  Redis client not installed (npm install redis)');
}

// For this demo, we'll simulate Redis-like behavior with enhanced memory storage
// In production, you would use: new RedisStore(redisClient)
console.log('📝 Note: Using enhanced memory storage for demo');
console.log('   In production, replace with: new RedisStore(redisClient)');

// Create session middleware with memory storage (Redis simulation)
const sessionMiddleware = createSessionMiddleware({
  secret: 'redis-demo-secret',
  maxAge: 10 * 60 * 1000, // 10 minutes for demo
  // store: new RedisStore(redisClient), // Uncomment when RedisStore is fixed
});

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Parse URL and body
    const originalUrl = req.url;
    const parsedUrl = url.parse(req.url, true);

    req.url = originalUrl;
    req.path = parsedUrl.pathname;

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
    await new Promise((resolve) => {
      sessionMiddleware(req, res, resolve);
    });

    // Routes
    if (req.path === '/' && req.method === 'GET') {
      // Home page
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redis Sessions Demo</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; max-width: 600px; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            button { padding: 10px 20px; margin: 5px; font-size: 16px; }
            .success { color: green; }
            .error { color: red; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Redis Sessions Demo</h1>
          
          <div class="info">
            <strong>Storage:</strong> Memory (Redis simulation)<br>
            <strong>Session TTL:</strong> 10 minutes<br>
            <strong>Production Note:</strong> Use RedisStore for real Redis<br>
            This demo shows the session patterns you'd use with Redis
          </div>
          
          <div>
            <h3>User Actions</h3>
            <button onclick="login()">Login</button>
            <button onclick="updateProfile()">Update Profile</button>
            <button onclick="viewSession()">View Session</button>
            <button onclick="logout()">Logout</button>
          </div>
          
          <div>
            <h3>Server Actions</h3>
            <button onclick="getStats()">Get Server Stats</button>
            <button onclick="listSessions()">List All Sessions</button>
            <button onclick="clearSessions()">Clear All Sessions</button>
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
                
                updateStatus(response.ok ? 'Success' : 'Failed', !response.ok);
                return data;
              } catch (error) {
                updateStatus('Error: ' + error.message, true);
                output.textContent = JSON.stringify({ error: error.message }, null, 2);
              }
            }
            
            function login() { makeRequest('/login', 'POST', { username: 'demo-user' }); }
            function updateProfile() { makeRequest('/profile', 'POST', { name: 'Updated Name', preferences: { theme: 'dark' } }); }
            function viewSession() { makeRequest('/session'); }
            function logout() { makeRequest('/logout', 'POST'); }
            function getStats() { makeRequest('/stats'); }
            function listSessions() { makeRequest('/sessions'); }
            function clearSessions() { makeRequest('/clear', 'POST'); }
            
            // Auto-refresh stats every 15 seconds
            setInterval(() => {
              if (document.visibilityState === 'visible') {
                makeRequest('/stats');
              }
            }, 15000);
          </script>
        </body>
        </html>
      `);
    } else if (req.path === '/login' && req.method === 'POST') {
      // Login
      await req.session.save({
        user: {
          id: Date.now(),
          username: req.body.username || 'demo-user',
          loginTime: new Date().toISOString(),
        },
        preferences: { theme: 'light', notifications: true },
      });

      res.json({
        success: true,
        message: 'Logged in successfully',
        sessionId: req.session.id,
        storage: 'Memory (Redis simulation)',
      });
    } else if (req.path === '/profile' && req.method === 'POST') {
      // Update profile
      if (!req.session.data.user) {
        return res.json({ success: false, message: 'Not logged in' }, 401);
      }

      await req.session.save({
        ...req.session.data,
        user: { ...req.session.data.user, ...req.body },
        lastUpdated: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: 'Profile updated',
        user: req.session.data.user,
      });
    } else if (req.path === '/session') {
      // View session
      res.json({
        success: true,
        sessionId: req.session.id,
        data: req.session.data,
        age: req.session.getAge() + 'ms',
        storage: 'Memory (Redis simulation)',
      });
    } else if (req.path === '/logout' && req.method === 'POST') {
      // Logout
      await req.session.destroy();
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } else if (req.path === '/stats') {
      // Server stats
      res.json({
        success: true,
        stats: {
          storage: 'Memory (Redis simulation)',
          activeSessions: 'N/A (use RedisStore for counting)',
          uptime: Math.round(process.uptime()) + ' seconds',
          memory:
            Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          currentSession: req.session.id,
          sessionAge: req.session.getAge() + 'ms',
          note: 'In production, use RedisStore for real session management',
        },
      });
    } else if (req.path === '/sessions') {
      // List sessions (Redis simulation)
      res.json({
        success: false,
        message: 'Session listing requires RedisStore in production',
        note: 'This would show all active sessions with Redis',
        example: [
          { key: 'abc123', user: 'user1', loginTime: '2025-01-01T10:00:00Z' },
          { key: 'def456', user: 'user2', loginTime: '2025-01-01T11:00:00Z' },
        ],
      });
    } else if (req.path === '/clear' && req.method === 'POST') {
      // Clear sessions (Redis simulation)
      res.json({
        success: false,
        message: 'Session clearing requires RedisStore in production',
        note: 'This would clear all sessions with Redis.del(keys)',
      });
    } else {
      res.json({ success: false, message: 'Not found' }, 404);
    }
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) {
      res.json({ success: false, message: error.message }, 500);
    }
  }
});

server.listen(3004, () => {
  console.log('Redis Sessions Demo running on http://localhost:3004');
  console.log('\nOpen http://localhost:3004 in your browser');
  console.log(
    '\n📝 This demo shows Redis session patterns using memory storage'
  );
  console.log(
    '   To use actual Redis, fix the RedisStore client detection and use:'
  );
  console.log(
    '   store: new RedisStore(redisClient, { prefix: "demo:sess:" })'
  );
  console.log('\nTo install Redis:');
  console.log('• macOS: brew install redis && brew services start redis');
  console.log('• Ubuntu: sudo apt-get install redis-server');
  console.log('• Windows: Download from https://redis.io/download');
  console.log('• Then: npm install redis');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  process.exit(0);
});
