/**
 * Integration tests for @voilajsx/appkit auth module
 * Tests complete authentication workflows including environment variables
 *
 * @file src/auth/tests/integration.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  createAuthMiddleware,
  createAuthorizationMiddleware,
} from '../index.js';

describe('Auth Module Integration', () => {
  let app;
  const SECRET = 'integration-test-secret';
  const users = new Map();

  // Store original environment variables
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };

    // Set up environment variables for integration tests
    process.env.VOILA_AUTH_SECRET = SECRET;
    process.env.VOILA_AUTH_EXPIRES_IN = '1h';
    process.env.VOILA_AUTH_BCRYPT_ROUNDS = '10';
    process.env.VOILA_AUTH_TOKEN_HEADER = 'authorization';
    process.env.VOILA_AUTH_COOKIE_NAME = 'token';

    app = express();
    app.use(express.json());
    users.clear();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Complete Authentication Flow with Environment Variables', () => {
    beforeEach(() => {
      // Auth middleware using environment configuration
      const auth = createAuthMiddleware(); // Uses VOILA_AUTH_SECRET automatically

      // Registration endpoint
      app.post('/auth/register', async (req, res) => {
        try {
          const { email, password, name } = req.body;

          if (users.has(email)) {
            return res.status(400).json({ error: 'User already exists' });
          }

          // Uses VOILA_AUTH_BCRYPT_ROUNDS automatically
          const hashedPassword = await hashPassword(password);
          const user = {
            id: Date.now().toString(),
            email,
            name,
            password: hashedPassword,
            roles: ['user'],
          };

          users.set(email, user);

          // Uses VOILA_AUTH_SECRET and VOILA_AUTH_EXPIRES_IN automatically
          const token = generateToken({
            userId: user.id,
            email,
            roles: user.roles,
          });

          res.status(201).json({ token, user: { id: user.id, email, name } });
        } catch (error) {
          res.status(500).json({ error: 'Registration failed' });
        }
      });

      // Login endpoint
      app.post('/auth/login', async (req, res) => {
        try {
          const { email, password } = req.body;

          const user = users.get(email);
          if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          const isValid = await comparePassword(password, user.password);
          if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Uses environment configuration automatically
          const token = generateToken({
            userId: user.id,
            email,
            roles: user.roles,
          });

          res.json({ token, user: { id: user.id, email, name: user.name } });
        } catch (error) {
          res.status(500).json({ error: 'Login failed' });
        }
      });

      // Protected endpoint using environment-configured middleware
      app.get('/api/profile', auth, (req, res) => {
        const user = Array.from(users.values()).find(
          (u) => u.id === req.user.userId
        );
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    });

    it('should handle complete user registration and login flow with environment config', async () => {
      // 1. Register a new user
      const registerRes = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.token).toBeDefined();
      expect(registerRes.body.user.email).toBe('test@example.com');

      // Verify token was created with environment configuration
      const payload = verifyToken(registerRes.body.token); // Uses env secret
      expect(payload.userId).toBeDefined();
      expect(payload.email).toBe('test@example.com');

      // 2. Login with the same credentials
      const loginRes = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.token).toBeDefined();

      // 3. Access protected route with token
      const profileRes = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.user.email).toBe('test@example.com');
    });

    it('should work with custom environment headers', async () => {
      // Change environment header configuration
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-auth-token';

      // Create new middleware with updated environment
      const customAuth = createAuthMiddleware();

      app.get('/api/custom-auth', customAuth, (req, res) => {
        res.json({ success: true, userId: req.user.userId });
      });

      // Register and login to get a token
      await request(app).post('/auth/register').send({
        email: 'custom@example.com',
        password: 'Password123!',
        name: 'Custom User',
      });

      const loginRes = await request(app).post('/auth/login').send({
        email: 'custom@example.com',
        password: 'Password123!',
      });

      // Test with custom header
      const customRes = await request(app)
        .get('/api/custom-auth')
        .set('x-auth-token', `Bearer ${loginRes.body.token}`);

      expect(customRes.status).toBe(200);
      expect(customRes.body.success).toBe(true);
    });

    it('should prevent duplicate registration', async () => {
      // First registration
      await request(app).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password123!',
        name: 'User One',
      });

      // Attempt duplicate registration
      const duplicateRes = await request(app).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password456!',
        name: 'User Two',
      });

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.error).toBe('User already exists');
    });

    it('should reject invalid login credentials', async () => {
      // Register user
      await request(app).post('/auth/register').send({
        email: 'valid@example.com',
        password: 'CorrectPassword123!',
        name: 'Valid User',
      });

      // Attempt login with wrong password
      const wrongPasswordRes = await request(app).post('/auth/login').send({
        email: 'valid@example.com',
        password: 'WrongPassword123!',
      });

      expect(wrongPasswordRes.status).toBe(401);
      expect(wrongPasswordRes.body.error).toBe('Invalid credentials');

      // Attempt login with non-existent email
      const wrongEmailRes = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      });

      expect(wrongEmailRes.status).toBe(401);
      expect(wrongEmailRes.body.error).toBe('Invalid credentials');
    });

    it('should protect routes from unauthorized access', async () => {
      // Attempt to access protected route without token
      const noTokenRes = await request(app).get('/api/profile');

      expect(noTokenRes.status).toBe(401);

      // Attempt with invalid token
      const invalidTokenRes = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(invalidTokenRes.status).toBe(401);
    });
  });

  describe('Role-Based Access Control with Environment Variables', () => {
    beforeEach(() => {
      const auth = createAuthMiddleware(); // Uses environment configuration
      const adminOnly = createAuthorizationMiddleware(['admin']);
      const userAccess = createAuthorizationMiddleware(['user', 'admin']);

      // Create test users with different roles
      const adminUser = {
        id: '1',
        email: 'admin@example.com',
        roles: ['admin', 'user'],
      };

      const regularUser = {
        id: '2',
        email: 'user@example.com',
        roles: ['user'],
      };

      users.set('admin@example.com', adminUser);
      users.set('user@example.com', regularUser);

      // Admin-only endpoint
      app.get('/api/admin', auth, adminOnly, (req, res) => {
        res.json({ message: 'Admin access granted' });
      });

      // User endpoint (user or admin)
      app.get('/api/user', auth, userAccess, (req, res) => {
        res.json({ message: 'User access granted' });
      });

      // Login endpoint for testing
      app.post('/auth/login', (req, res) => {
        const { email } = req.body;
        const user = users.get(email);

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        // Uses environment configuration for token generation
        const token = generateToken({
          userId: user.id,
          email,
          roles: user.roles,
        });

        res.json({ token });
      });
    });

    it('should allow admin access to admin routes with environment config', async () => {
      // Login as admin
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com' });

      const adminToken = loginRes.body.token;

      // Access admin route
      const adminRes = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.message).toBe('Admin access granted');
    });

    it('should deny regular user access to admin routes', async () => {
      // Login as regular user
      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com' });

      const userToken = loginRes.body.token;

      // Attempt to access admin route
      const adminRes = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${userToken}`);

      expect(adminRes.status).toBe(403);
      expect(adminRes.body.message).toBe('Insufficient permissions');
    });

    it('should allow both admin and user access to user routes', async () => {
      // Test admin access
      const adminLoginRes = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com' });

      const adminUserRes = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${adminLoginRes.body.token}`);

      expect(adminUserRes.status).toBe(200);

      // Test regular user access
      const userLoginRes = await request(app)
        .post('/auth/login')
        .send({ email: 'user@example.com' });

      const userRes = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${userLoginRes.body.token}`);

      expect(userRes.status).toBe(200);
    });
  });

  describe('Token Expiration with Environment Variables', () => {
    beforeEach(() => {
      // Set up middleware and routes for this test block
      const auth = createAuthMiddleware();

      app.get('/api/protected', auth, (req, res) => {
        res.json({ message: 'Access granted' });
      });
    });

    it('should handle expired tokens correctly', async () => {
      // Set very short expiration in environment
      process.env.VOILA_AUTH_EXPIRES_IN = '1ms';

      // Create an expired token using environment config
      const expiredToken = generateToken({
        userId: '123',
        email: 'test@example.com',
      });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Attempt to use expired token
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(
        'Your session has expired. Please sign in again.'
      );
    });

    it('should respect custom expiration from environment', async () => {
      // Set 2 hour expiration
      process.env.VOILA_AUTH_EXPIRES_IN = '2h';

      const token = generateToken({
        userId: '123',
        email: 'test@example.com',
      });

      // Verify token and check expiration time
      const payload = verifyToken(token);
      const expirationTime = payload.exp - payload.iat;
      expect(expirationTime).toBe(2 * 60 * 60); // 2 hours in seconds
    });
  });

  describe('Custom Token Sources with Environment Variables', () => {
    it('should support multiple token sources with environment configuration', async () => {
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-api-key';
      process.env.VOILA_AUTH_COOKIE_NAME = 'sessionToken';

      const auth = createAuthMiddleware();

      app.get('/api/data', auth, (req, res) => {
        res.json({ data: 'Protected data', userId: req.user.userId });
      });

      const token = generateToken({ userId: '123' });

      // Test with environment-configured custom header
      const headerRes = await request(app)
        .get('/api/data')
        .set('x-api-key', `Bearer ${token}`);

      expect(headerRes.status).toBe(200);
      expect(headerRes.body.data).toBe('Protected data');

      // Test with query parameter (fallback)
      const queryRes = await request(app).get(`/api/data?token=${token}`);

      expect(queryRes.status).toBe(200);
      expect(queryRes.body.data).toBe('Protected data');
    });

    it('should handle mixed environment and explicit configuration', async () => {
      process.env.VOILA_AUTH_SECRET = SECRET;
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-env-header';

      // Create middleware that uses environment secret but custom token extraction
      const auth = createAuthMiddleware({
        // Uses VOILA_AUTH_SECRET from environment
        getToken: (req) => {
          // Custom extraction overrides environment header setting
          return (
            req.headers['x-custom-header'] ||
            req.headers['authorization']?.slice(7) ||
            null
          );
        },
      });

      app.get('/api/mixed', auth, (req, res) => {
        res.json({ success: true, userId: req.user.userId });
      });

      const token = generateToken({ userId: '456' });

      const res = await request(app)
        .get('/api/mixed')
        .set('x-custom-header', token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBe('456');
    });
  });

  describe('Environment Variable Priority', () => {
    it('should prioritize explicit options over environment variables', async () => {
      // Set environment variables
      process.env.VOILA_AUTH_SECRET = 'env-secret';
      process.env.VOILA_AUTH_EXPIRES_IN = '1d';
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '8';

      // Create middleware with explicit secret (should override environment)
      const auth = createAuthMiddleware({
        secret: SECRET, // Explicit secret overrides env
      });

      app.post('/test/register', async (req, res) => {
        try {
          // Use explicit rounds (should override environment)
          const hashedPassword = await hashPassword('testpass', 12);

          // Use explicit token options (should override environment)
          const token = generateToken(
            { userId: 'test', email: 'test@example.com' },
            { secret: SECRET, expiresIn: '30m' }
          );

          res.json({ token, hashPattern: hashedPassword.substring(0, 7) });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      app.get('/test/verify', auth, (req, res) => {
        res.json({ verified: true, userId: req.user.userId });
      });

      // Test registration with explicit options
      const registerRes = await request(app).post('/test/register').send({});

      expect(registerRes.status).toBe(200);
      expect(registerRes.body.hashPattern).toBe('$2b$12$'); // Uses explicit rounds=12, not env rounds=8

      // Verify token uses explicit secret, not environment secret
      const verifyRes = await request(app)
        .get('/test/verify')
        .set('Authorization', `Bearer ${registerRes.body.token}`);

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.verified).toBe(true);
    });
  });

  describe('Complete Environment-Driven Application', () => {
    it('should run entire authentication flow using only environment variables', async () => {
      // Set all environment variables
      process.env.VOILA_AUTH_SECRET = SECRET;
      process.env.VOILA_AUTH_EXPIRES_IN = '24h';
      process.env.VOILA_AUTH_BCRYPT_ROUNDS = '12';
      process.env.VOILA_AUTH_TOKEN_HEADER = 'x-mobile-auth';
      process.env.VOILA_AUTH_COOKIE_NAME = 'mobile_session';

      // Create app using only environment configuration
      const envApp = express();
      envApp.use(express.json());
      const envUsers = new Map();

      const envAuth = createAuthMiddleware(); // Uses all environment config
      const adminAuth = createAuthorizationMiddleware(['admin']);

      // Registration using environment config
      envApp.post('/register', async (req, res) => {
        const { email, password, role = 'user' } = req.body;

        const hashedPassword = await hashPassword(password); // Uses env rounds
        const user = {
          id: Date.now().toString(),
          email,
          password: hashedPassword,
          role,
          roles: [role], // Ensure roles array is included
        };
        envUsers.set(email, user);

        const token = generateToken({
          userId: user.id,
          email,
          role,
          roles: [role], // Include roles in token payload
        }); // Uses env config
        res.json({ token, user: { id: user.id, email, role } });
      });

      // Login using environment config
      envApp.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const user = envUsers.get(email);

        if (!user || !(await comparePassword(password, user.password))) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({
          userId: user.id,
          email,
          role: user.role,
          roles: user.roles || [user.role], // Ensure roles array is included
        }); // Uses env config
        res.json({ token });
      });

      // Protected routes using environment config
      envApp.get('/profile', envAuth, (req, res) => {
        res.json({ profile: req.user });
      });

      envApp.get('/admin', envAuth, adminAuth, (req, res) => {
        res.json({ message: 'Admin area' });
      });

      // Test complete flow

      // 1. Register admin user
      const adminRegRes = await request(envApp)
        .post('/register')
        .send({
          email: 'admin@test.com',
          password: 'AdminPass123!',
          role: 'admin',
        });

      expect(adminRegRes.status).toBe(200);

      // 2. Login admin user
      const adminLoginRes = await request(envApp)
        .post('/login')
        .send({ email: 'admin@test.com', password: 'AdminPass123!' });

      expect(adminLoginRes.status).toBe(200);

      // 3. Access profile with custom header (from environment)
      const profileRes = await request(envApp)
        .get('/profile')
        .set('x-mobile-auth', `Bearer ${adminLoginRes.body.token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.profile.email).toBe('admin@test.com');

      // 4. Access admin area
      const adminRes = await request(envApp)
        .get('/admin')
        .set('x-mobile-auth', `Bearer ${adminLoginRes.body.token}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.message).toBe('Admin area');

      // 5. Register regular user and test denied admin access
      const userRegRes = await request(envApp)
        .post('/register')
        .send({ email: 'user@test.com', password: 'UserPass123!' });

      const userLoginRes = await request(envApp)
        .post('/login')
        .send({ email: 'user@test.com', password: 'UserPass123!' });

      const userAdminRes = await request(envApp)
        .get('/admin')
        .set('x-mobile-auth', `Bearer ${userLoginRes.body.token}`);

      expect(userAdminRes.status).toBe(403);
    });
  });
});
