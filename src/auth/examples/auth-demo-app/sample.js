/**
 * Basic Authentication System using @voilajsx/appkit/auth
 * Single file Express server with user registration and JWT login
 */

import express from 'express';
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
} from '@voilajsx/appkit/auth';

const app = express();
app.use(express.json());

// In-memory user storage (use a real database in production)
const users = new Map();

// JWT secret (use environment variable in production)
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create authentication middleware
const auth = createAuthMiddleware({
  secret: JWT_SECRET,
  onError: (error, req, res) => {
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message,
    });
  },
});

/**
 * Registers a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 * @throws {Error} If registration fails
 */
async function registerUser(email, password) {
  // Check if user already exists
  if (users.has(email)) {
    throw new Error('User already exists');
  }

  // Hash the password
  const hashedPassword = await hashPassword(password, 12);

  // Create user object
  const user = {
    id: Date.now().toString(), // Simple ID generation
    email,
    password: hashedPassword,
    roles: ['user'],
    createdAt: new Date().toISOString(),
  };

  // Store user
  users.set(email, user);

  // Generate JWT token
  const token = generateToken(
    { userId: user.id, email, roles: user.roles },
    { secret: JWT_SECRET, expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
  };
}

/**
 * Authenticates a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Authentication token and user data
 * @throws {Error} If credentials are invalid
 */
async function loginUser(email, password) {
  // Find user
  const user = users.get(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = generateToken(
    { userId: user.id, email, roles: user.roles },
    { secret: JWT_SECRET, expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
  };
}

// Routes

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Authentication API is running',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      profile: 'GET /auth/profile (protected)',
      users: 'GET /auth/users (protected)',
    },
  });
});

/**
 * User registration endpoint
 */
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long',
      });
    }

    // Register user
    const result = await registerUser(email, password);

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
});

/**
 * User login endpoint
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required',
      });
    }

    // Authenticate user
    const result = await loginUser(email, password);

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

/**
 * Get user profile (protected route)
 */
app.get('/auth/profile', auth, (req, res) => {
  res.json({
    message: 'Profile data',
    user: req.user,
  });
});

/**
 * Get all users (protected route)
 */
app.get('/auth/users', auth, (req, res) => {
  const userList = Array.from(users.values()).map((user) => ({
    id: user.id,
    email: user.email,
    roles: user.roles,
    createdAt: user.createdAt,
  }));

  res.json({
    message: 'Users list',
    users: userList,
    total: userList.length,
  });
});

/**
 * Validate token endpoint
 */
app.post('/auth/validate', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Token is required',
      });
    }

    const payload = verifyToken(token, { secret: JWT_SECRET });

    res.json({
      valid: true,
      payload,
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Authentication server running on port ${PORT}`);
  console.log(`📖 API documentation: http://localhost:${PORT}`);
  console.log('');
  console.log('Example usage:');
  console.log(
    '1. Register: POST /auth/register {"email":"test@example.com","password":"password123"}'
  );
  console.log(
    '2. Login:    POST /auth/login {"email":"test@example.com","password":"password123"}'
  );
  console.log(
    '3. Profile:  GET /auth/profile (with Authorization: Bearer <token>)'
  );
});

export default app;
