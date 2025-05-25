/**
 * Simple Middleware - @voilajsx/appkit Auth Module
 *
 * Basic example showing how auth middleware works
 * Minimal Express server with protected routes
 *
 * Run: node 03-simple-middleware.js
 */

import express from 'express';
import { createAuthMiddleware, generateToken } from '@voilajsx/appkit/auth';

const app = express();
const secret = 'my-secret-key';

// Create auth middleware
const auth = createAuthMiddleware({ secret });

// Public route
app.get('/', (req, res) => {
  res.json({ message: 'Public route - anyone can access' });
});

// Protected route
app.get('/protected', auth, (req, res) => {
  res.json({
    message: 'Protected route - requires valid token',
    user: req.user,
  });
});

// Get a token for testing
app.get('/get-token', (req, res) => {
  const token = generateToken(
    { userId: '123', email: 'test@example.com' },
    { secret }
  );
  res.json({
    token,
    usage: `curl http://localhost:3000/protected -H "Authorization: Bearer ${token}"`,
  });
});

app.listen(3000, () => {
  console.log(`
Simple Middleware Example
-------------------------
Server running on http://localhost:3000

Try these URLs:
1. http://localhost:3000/           (public)
2. http://localhost:3000/get-token  (get a token)
3. http://localhost:3000/protected  (needs token)
  `);
});
