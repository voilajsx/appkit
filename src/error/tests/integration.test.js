/**
 * Integration tests for error handling in Express applications
 * @module @voilajsx/appkit/error
 * @file src/error/tests/integration.test.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationError,
  notFoundError,
  authError,
  serverError,
} from '../index.js';

describe('Error Handling Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  afterEach(() => {
    // Cleanup any server instances
  });

  describe('Express Integration', () => {
    it('should handle validation errors correctly', async () => {
      app.get('/validation-error', (req, res) => {
        throw validationError('Email is required');
      });
      app.use(errorHandler());

      const response = await request(app).get('/validation-error').expect(400);

      expect(response.body).toEqual({
        type: 'VALIDATION_ERROR',
        message: 'Email is required',
        details: null,
      });
    });

    it('should handle not found errors correctly', async () => {
      app.get('/not-found-error', (req, res) => {
        throw notFoundError('User not found');
      });
      app.use(errorHandler());

      const response = await request(app).get('/not-found-error').expect(404);

      expect(response.body).toEqual({
        type: 'NOT_FOUND',
        message: 'User not found',
        details: null,
      });
    });

    it('should handle auth errors correctly', async () => {
      app.get('/auth-error', (req, res) => {
        throw authError('Invalid token');
      });
      app.use(errorHandler());

      const response = await request(app).get('/auth-error').expect(401);

      expect(response.body).toEqual({
        type: 'AUTH_ERROR',
        message: 'Invalid token',
        details: null,
      });
    });

    it('should handle server errors correctly', async () => {
      app.get('/server-error', (req, res) => {
        throw serverError('Database connection failed');
      });
      app.use(errorHandler());

      const response = await request(app).get('/server-error').expect(500);

      expect(response.body).toEqual({
        type: 'SERVER_ERROR',
        message: 'Database connection failed',
        details: null,
      });
    });

    it('should handle errors with details', async () => {
      app.post('/validation-with-details', (req, res) => {
        throw validationError('Validation failed', {
          errors: {
            email: 'Email is required',
            age: 'Must be at least 18',
          },
        });
      });
      app.use(errorHandler());

      const response = await request(app)
        .post('/validation-with-details')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        type: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          errors: {
            email: 'Email is required',
            age: 'Must be at least 18',
          },
        },
      });
    });
  });

  describe('Async Handler Integration', () => {
    it('should handle async route errors', async () => {
      app.get(
        '/async-error',
        asyncHandler(async (req, res) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          throw notFoundError('Async resource not found');
        })
      );
      app.use(errorHandler());

      const response = await request(app).get('/async-error').expect(404);

      expect(response.body).toEqual({
        type: 'NOT_FOUND',
        message: 'Async resource not found',
        details: null,
      });
    });

    it('should handle successful async routes', async () => {
      app.get(
        '/async-success',
        asyncHandler(async (req, res) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          res.json({ message: 'Success' });
        })
      );
      app.use(errorHandler());

      const response = await request(app).get('/async-success').expect(200);

      expect(response.body).toEqual({
        message: 'Success',
      });
    });

    it('should handle promise rejections in async routes', async () => {
      app.get(
        '/async-rejection',
        asyncHandler(async (req, res) => {
          await Promise.reject(authError('Token expired'));
        })
      );
      app.use(errorHandler());

      const response = await request(app).get('/async-rejection').expect(401);

      expect(response.body).toEqual({
        type: 'AUTH_ERROR',
        message: 'Token expired',
        details: null,
      });
    });
  });

  describe('Not Found Handler Integration', () => {
    it('should handle unmatched routes', async () => {
      app.get('/existing-route', (req, res) => {
        res.json({ message: 'Found' });
      });
      app.use(notFoundHandler());
      app.use(errorHandler());

      const response = await request(app)
        .get('/non-existing-route')
        .expect(404);

      expect(response.body).toEqual({
        type: 'NOT_FOUND',
        message: 'Route GET /non-existing-route not found',
        details: null,
      });
    });

    it('should not affect existing routes', async () => {
      app.get('/existing-route', (req, res) => {
        res.json({ message: 'Found' });
      });
      app.use(notFoundHandler());
      app.use(errorHandler());

      const response = await request(app).get('/existing-route').expect(200);

      expect(response.body).toEqual({
        message: 'Found',
      });
    });
  });

  describe('Complete Application Flow', () => {
    beforeEach(() => {
      // Setup a complete app with all middleware
      app.get('/success', (req, res) => {
        res.json({ message: 'Success' });
      });

      app.get('/sync-error', (req, res) => {
        throw validationError('Sync validation error');
      });

      app.get(
        '/async-error',
        asyncHandler(async (req, res) => {
          throw authError('Async auth error');
        })
      );

      app.post(
        '/create-user',
        asyncHandler(async (req, res) => {
          const { name, email } = req.body;

          if (!name || !email) {
            throw validationError('Name and email are required', {
              errors: {
                name: !name ? 'Name is required' : null,
                email: !email ? 'Email is required' : null,
              },
            });
          }

          // Simulate user creation
          res.status(201).json({
            user: { id: '1', name, email },
          });
        })
      );

      app.use(notFoundHandler());
      app.use(errorHandler());
    });

    it('should handle successful requests', async () => {
      const response = await request(app).get('/success').expect(200);

      expect(response.body).toEqual({
        message: 'Success',
      });
    });

    it('should handle sync errors', async () => {
      await request(app).get('/sync-error').expect(400);
    });

    it('should handle async errors', async () => {
      await request(app).get('/async-error').expect(401);
    });

    it('should handle validation in POST requests', async () => {
      const response = await request(app)
        .post('/create-user')
        .send({ name: 'John' }) // Missing email
        .expect(400);

      expect(response.body.type).toBe('VALIDATION_ERROR');
      expect(response.body.details.errors.email).toBe('Email is required');
    });

    it('should handle successful POST requests', async () => {
      const response = await request(app)
        .post('/create-user')
        .send({ name: 'John', email: 'john@example.com' })
        .expect(201);

      expect(response.body.user).toEqual({
        id: '1',
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('should handle 404 for unknown routes', async () => {
      await request(app).get('/unknown-route').expect(404);
    });
  });
});
