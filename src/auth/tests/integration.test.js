/**
 * Integration tests for @voilajsx/appkit auth module
 * Tests complete authentication workflows
 *
 * @file src/auth/tests/integration.test.js
 */

import { describe, it, expect, beforeEach } from 'vitest';
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

  beforeEach(() => {
    app = express();
    app.use(express.json());
    users.clear();
  });

  describe('Complete Authentication Flow', () => {
    beforeEach(() => {
      // Auth middleware
      const auth = createAuthMiddleware({ secret: SECRET });

      // Registration endpoint
      app.post('/auth/register', async (req, res) => {
        try {
          const { email, password, name } = req.body;

          if (users.has(email)) {
            return res.status(400).json({ error: 'User already exists' });
          }

          const hashedPassword = await hashPassword(password);
          const user = {
            id: Date.now().toString(),
            email,
            name,
            password: hashedPassword,
            roles: ['user'],
          };

          users.set(email, user);

          const token = generateToken(
            { userId: user.id, email, roles: user.roles },
            { secret: SECRET }
          );

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

          const token = generateToken(
            { userId: user.id, email, roles: user.roles },
            { secret: SECRET }
          );

          res.json({ token, user: { id: user.id, email, name: user.name } });
        } catch (error) {
          res.status(500).json({ error: 'Login failed' });
        }
      });

      // Protected endpoint
      app.get('/api/profile', auth, (req, res) => {
        const user = Array.from(users.values()).find(
          (u) => u.id === req.user.userId
        );
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
      });
    });

    it('should handle complete user registration and login flow', async () => {
      // 1. Register a new user
      const registerRes = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.token).toBeDefined();
      expect(registerRes.body.user.email).toBe('test@example.com');

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

  describe('Role-Based Access Control', () => {
    beforeEach(() => {
      const auth = createAuthMiddleware({ secret: SECRET });
      const adminOnly = createAuthorizationMiddleware(['admin']);
      const userAccess = createAuthorizationMiddleware(['user', 'admin']);

      // Create test users
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

        const token = generateToken(
          { userId: user.id, email, roles: user.roles },
          { secret: SECRET }
        );

        res.json({ token });
      });
    });

    it('should allow admin access to admin routes', async () => {
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

  describe('Token Expiration', () => {
    it('should handle expired tokens correctly', async () => {
      const auth = createAuthMiddleware({ secret: SECRET });

      app.get('/api/protected', auth, (req, res) => {
        res.json({ message: 'Access granted' });
      });

      // Create an expired token
      const expiredToken = generateToken(
        { userId: '123', email: 'test@example.com' },
        { secret: SECRET, expiresIn: '1ms' }
      );

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
  });

  describe('Custom Token Sources', () => {
    it('should support multiple token sources', async () => {
      const auth = createAuthMiddleware({
        secret: SECRET,
        getToken: (req) => {
          // Check multiple sources
          if (req.headers['x-api-key']) return req.headers['x-api-key'];
          if (req.query.token) return req.query.token;
          if (req.headers.authorization?.startsWith('Bearer ')) {
            return req.headers.authorization.slice(7);
          }
          return null;
        },
      });

      app.get('/api/data', auth, (req, res) => {
        res.json({ data: 'Protected data' });
      });

      const token = generateToken({ userId: '123' }, { secret: SECRET });

      // Test with custom header
      const headerRes = await request(app)
        .get('/api/data')
        .set('X-API-Key', token);

      expect(headerRes.status).toBe(200);

      // Test with query parameter
      const queryRes = await request(app).get(`/api/data?token=${token}`);

      expect(queryRes.status).toBe(200);

      // Test with Authorization header
      const authRes = await request(app)
        .get('/api/data')
        .set('Authorization', `Bearer ${token}`);

      expect(authRes.status).toBe(200);
    });
  });
});
