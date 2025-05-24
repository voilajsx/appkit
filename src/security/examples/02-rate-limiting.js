/**
 * Rate Limiting API - @voilajsx/appkit Security Module
 *
 * This example demonstrates how to protect API endpoints
 * from abuse using rate limiting middleware.
 *
 * Run: node 02-rate-limiting.js
 */

import express from 'express';
import { createRateLimiter } from '../index.js'; // Corrected import path

// Create Express app
const app = express();

// Create rate limiters with different configurations
const apiLimiter = createRateLimiter({
  windowMs: 15 * 1000, // 15 seconds (short window for quick demo)
  max: 5, // 5 requests per 15 seconds
  message: 'API: Too many requests, please try again after 15 seconds.',
});

const loginLimiter = createRateLimiter({
  windowMs: 30 * 1000, // 30 seconds
  max: 3, // 3 login attempts per 30 seconds
  message: 'Login: Too many login attempts, please try again later.',
});

// Apply rate limiters to specific routes or globally
// All requests to /api/* will be limited by apiLimiter
app.use('/api', apiLimiter);
// All requests to /login will be limited by loginLimiter
app.use('/login', loginLimiter);

// Home page with instructions and buttons
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rate Limiting Example</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        button { margin: 5px; padding: 10px 18px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #218838; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
        #results { margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
      <script>
        // Simple function to call the API endpoints
        async function callEndpoint(endpoint) {
          const resultDiv = document.getElementById('results');
          resultDiv.innerHTML = 'Loading...';
          try {
            const response = await fetch(endpoint);
            const data = await response.json(); // Our middleware always sends JSON

            // Display rate limit headers from the response
            const headers = {};
            response.headers.forEach((value, key) => {
              if (key.startsWith('x-ratelimit') || key.startsWith('retry-after')) {
                headers[key] = value;
              }
            });
            
            resultDiv.innerHTML = 
              '<h3>Response Status: ' + response.status + ' (' + response.statusText + ')</h3>' +
              '<h4>Response Body:</h4>' +
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>' +
              '<h4>Rate Limit Headers:</h4>' +
              '<pre>' + JSON.stringify(headers, null, 2) + '</pre>';

          } catch (error) {
            resultDiv.innerHTML = '<h3>Error</h3><pre>' + error + '</pre>';
            console.error('Fetch error:', error);
          }
        }
      </script>
    </head>
    <body>
      <h1>Rate Limiting Example</h1>
      <p>This example demonstrates rate limiting for API endpoints:</p>
      <ul>
        <li><strong>API Endpoint (/api/data):</strong> Limited to 5 requests per 15 seconds.</li>
        <li><strong>Login Endpoint (/login):</strong> Limited to 3 requests per 30 seconds.</li>
      </ul>
      
      <div>
        <button onclick="callEndpoint('/api/data')">Call API Endpoint</button>
        <button onclick="callEndpoint('/login')">Try Login Endpoint</button>
      </div>
      
      <p style="margin-top: 20px;">Click a button repeatedly to see the rate limiting in action. Observe the status code 429 and the <code>X-RateLimit-*</code> headers.</p>
      
      <div id="results"></div>
    </body>
    </html>
  `);
});

// API endpoints (rate limited)
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
    message: 'Login endpoint accessed',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Rate limiting example running at http://localhost:${PORT}`);
  console.log('Open http://localhost:3001 in your browser.');
});
