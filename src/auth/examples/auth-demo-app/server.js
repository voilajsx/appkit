/**
 * Simple Auth Demo Server - @voilajs/appkit
 *
 * A minimal Express server demonstrating auth features
 * with a simple in-memory database
 *
 * Run: node server.js
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  generateToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
} from '@voilajs/appkit/auth';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'demo-secret-key';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(
  express.static(__dirname, {
    extensions: ['html', 'css', 'js'],
    index: false,
  })
);

// Simple in-memory database
const users = new Map();

// Create auth middleware
const auth = createAuthMiddleware({ secret: JWT_SECRET });

// Routes

// Serve static files explicitly
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(join(__dirname, 'style.css'));
});

app.get('/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(join(__dirname, 'app.js'));
});

// Register new user
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    if (users.has(email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    };

    users.set(email, user);

    // Generate token
    const token = generateToken(
      { userId: user.id, email: user.email },
      { secret: JWT_SECRET }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(
      { userId: user.id, email: user.email },
      { secret: JWT_SECRET }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Protected route example
app.get('/api/protected', auth, (req, res) => {
  res.json({
    message: 'This is a protected route!',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     @voilajs/appkit Auth Demo Server       ║
╚════════════════════════════════════════════╝

Server running at: http://localhost:${PORT}

Instructions:
1. Open http://localhost:${PORT} in your browser
2. Try registering a new user
3. Login with your credentials
4. Test the protected endpoint

The demo includes:
- User registration
- Password hashing
- JWT authentication  
- Protected routes

Press Ctrl+C to stop the server
    `);
});
