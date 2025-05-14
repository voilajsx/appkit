/**
 * Rate Limiting API - @voilajs/appkit Security Module
 *
 * This example demonstrates how to protect API endpoints
 * from abuse using rate limiting middleware.
 *
 * Run: node 02-rate-limiting.js
 */

import express from 'express';
import { createRateLimiter } from '@voilajs/appkit/security';

// Create Express app
const app = express();

// Create rate limiters with different configurations
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute (short window for demo purposes)
  max: 5, // 5 requests per minute
  message: 'Too many requests, please try again after 1 minute',
});

const loginLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 login attempts per 5 minutes
  message: 'Too many login attempts, please try again later',
});

// Apply rate limiters to specific routes
app.use('/api', apiLimiter);
app.use('/login', loginLimiter);

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rate Limiting Example</title>
      <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        button { margin: 5px; padding: 8px 16px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
        #results { margin-top: 20px; }
      </style>
      <script>
        // Simple function to call the API
        async function callEndpoint(endpoint) {
          const resultDiv = document.getElementById('results');
          try {
            const response = await fetch(endpoint);
            const data = await response.json();
            
            // Display rate limit headers
            const headers = {};
            response.headers.forEach((value, key) => {
              if (key.startsWith('x-ratelimit')) {
                headers[key] = value;
              }
            });
            
            resultDiv.innerHTML = 
              '<h3>Response Status: ' + response.status + '</h3>' +
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>' +
              '<h3>Rate Limit Headers:</h3>' +
              '<pre>' + JSON.stringify(headers, null, 2) + '</pre>';
          } catch (error) {
            resultDiv.innerHTML = '<h3>Error</h3><pre>' + error + '</pre>';
          }
        }
      </script>
    </head>
    <body>
      <h1>Rate Limiting Example</h1>
      <p>This example demonstrates rate limiting for API endpoints:</p>
      <ul>
        <li><strong>API Endpoint:</strong> Limited to 5 requests per minute</li>
        <li><strong>Login Endpoint:</strong> Limited to 3 requests per 5 minutes</li>
      </ul>
      
      <div>
        <button onclick="callEndpoint('/api/data')">Call API Endpoint</button>
        <button onclick="callEndpoint('/login')">Try Login</button>
      </div>
      
      <p>Click a button repeatedly to see the rate limiting in action.</p>
      
      <div id="results"></div>
    </body>
    </html>
  `);
});

// API endpoints
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    message: 'API response successful',
    timestamp: new Date().toISOString(),
  });
});

app.get('/login', (req, res) => {
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
});
