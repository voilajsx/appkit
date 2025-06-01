/**
 * Complete API with comprehensive error handling using @voilajsx/appkit/error
 * @module @voilajsx/appkit/error
 * @file src/error/examples/04-complete-api.js
 * Run: node 04-complete-api.js
 */

import express from 'express';
import {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationError,
  notFoundError,
  authError,
  serverError,
  AppError,
} from '../index.js';

const app = express();
app.use(express.json());

// Mock database
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

// Mock auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    throw authError('Authorization header required');
  }
  if (token !== 'Bearer valid-token') {
    throw authError('Invalid token');
  }
  req.user = { id: '1', role: 'user' };
  next();
}

/**
 * Sets up API routes with comprehensive error handling
 */
function setupAPI() {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get all users
  app.get(
    '/api/users',
    asyncHandler(async (req, res) => {
      // Simulate database delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      res.json({ users });
    })
  );

  // Get user by ID
  app.get(
    '/api/users/:id',
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      // Validate ID format
      if (!id || id.length < 1) {
        throw validationError('Invalid user ID');
      }

      // Find user
      const user = users.find((u) => u.id === id);
      if (!user) {
        throw notFoundError(`User with ID ${id} not found`);
      }

      res.json({ user });
    })
  );

  // Create new user (protected route)
  app.post(
    '/api/users',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { name, email } = req.body;

      // Validation
      if (!name || !email) {
        throw validationError('Name and email are required', {
          errors: {
            name: !name ? 'Name is required' : null,
            email: !email ? 'Email is required' : null,
          },
        });
      }

      // Check email format
      if (!email.includes('@')) {
        throw validationError('Invalid email format');
      }

      // Check if email exists
      if (users.find((u) => u.email === email)) {
        throw validationError('Email already exists');
      }

      // Create user
      const newUser = {
        id: String(users.length + 1),
        name,
        email,
      };
      users.push(newUser);

      res.status(201).json({ user: newUser });
    })
  );

  // Update user (protected route)
  app.put(
    '/api/users/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { name, email } = req.body;

      // Find user
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw notFoundError(`User with ID ${id} not found`);
      }

      // Validation
      if (!name && !email) {
        throw validationError('At least one field (name or email) is required');
      }

      // Update user
      if (name) users[userIndex].name = name;
      if (email) {
        if (!email.includes('@')) {
          throw validationError('Invalid email format');
        }
        users[userIndex].email = email;
      }

      res.json({ user: users[userIndex] });
    })
  );

  // Delete user (protected route)
  app.delete(
    '/api/users/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        throw notFoundError(`User with ID ${id} not found`);
      }

      // Simulate database error occasionally
      if (Math.random() < 0.3) {
        throw serverError('Database operation failed');
      }

      users.splice(userIndex, 1);
      res.json({ message: 'User deleted successfully' });
    })
  );

  // Protected route example
  app.get('/api/profile', requireAuth, (req, res) => {
    const user = users.find((u) => u.id === req.user.id);
    res.json({ profile: user });
  });

  // Handle 404 for unmatched routes
  app.use(notFoundHandler());

  // Global error handler (must be last)
  app.use(errorHandler());
}

/**
 * Demonstrates the complete API with error handling
 */
function demo() {
  setupAPI();

  const PORT = 3001;
  const server = app.listen(PORT, () => {
    console.log('=== Complete API Error Handling Demo ===\n');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('\n📋 Available endpoints:');
    console.log('GET    /health                    - Health check');
    console.log('GET    /api/users                 - Get all users');
    console.log('GET    /api/users/:id             - Get user by ID');
    console.log(
      'POST   /api/users                 - Create user (auth required)'
    );
    console.log(
      'PUT    /api/users/:id             - Update user (auth required)'
    );
    console.log(
      'DELETE /api/users/:id             - Delete user (auth required)'
    );
    console.log(
      'GET    /api/profile               - Get profile (auth required)'
    );

    console.log('\n🧪 Test examples:');
    console.log('curl http://localhost:3001/health');
    console.log('curl http://localhost:3001/api/users');
    console.log('curl http://localhost:3001/api/users/1');
    console.log('curl http://localhost:3001/api/users/999  # Not found');
    console.log(
      'curl -X POST http://localhost:3001/api/users  # Auth required'
    );
    console.log('curl -H "Authorization: Bearer valid-token" \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"name":"Bob","email":"bob@example.com"}\' \\');
    console.log('     http://localhost:3001/api/users');

    console.log('\nPress Ctrl+C to stop server\n');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
      process.exit(0);
    });
  });
}

// Execute the demonstration
demo();
