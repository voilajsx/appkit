/**
 * Tests for @voilajs/appkit/error - Error Types and Classes
 */

import { describe, it, expect } from 'vitest';
import {
  ErrorTypes,
  AppError,
  createError,
  validationError,
  notFoundError,
  authenticationError,
  authorizationError,
  conflictError,
  badRequestError,
  rateLimitError,
  serviceUnavailableError,
  internalError,
} from '../errors.js';

describe('ErrorTypes', () => {
  it('should have all required error types', () => {
    expect(ErrorTypes.VALIDATION).toBe('VALIDATION_ERROR');
    expect(ErrorTypes.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorTypes.AUTHENTICATION).toBe('AUTHENTICATION_ERROR');
    expect(ErrorTypes.AUTHORIZATION).toBe('AUTHORIZATION_ERROR');
    expect(ErrorTypes.CONFLICT).toBe('CONFLICT');
    expect(ErrorTypes.INTERNAL).toBe('INTERNAL_ERROR');
    expect(ErrorTypes.BAD_REQUEST).toBe('BAD_REQUEST');
    expect(ErrorTypes.RATE_LIMIT).toBe('RATE_LIMIT_EXCEEDED');
    expect(ErrorTypes.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
  });
});

describe('AppError', () => {
  it('should create an AppError instance with the correct properties', () => {
    const error = new AppError(
      ErrorTypes.NOT_FOUND,
      'Resource not found',
      { id: '123' },
      404
    );

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.type).toBe(ErrorTypes.NOT_FOUND);
    expect(error.message).toBe('Resource not found');
    expect(error.details).toEqual({ id: '123' });
    expect(error.statusCode).toBe(404);
    expect(error.timestamp).toBeDefined();
    expect(typeof error.timestamp).toBe('string');
    expect(new Date(error.timestamp)).toBeInstanceOf(Date);
  });

  it('should have a working toJSON method', () => {
    const error = new AppError(
      ErrorTypes.NOT_FOUND,
      'Resource not found',
      { id: '123' },
      404
    );

    const json = error.toJSON();

    expect(json).toEqual({
      type: ErrorTypes.NOT_FOUND,
      message: 'Resource not found',
      details: { id: '123' },
      timestamp: error.timestamp,
    });
  });

  it('should use default values when not provided', () => {
    const error = new AppError(ErrorTypes.INTERNAL, 'Internal error');

    expect(error.details).toBeNull();
    expect(error.statusCode).toBe(500);
  });
});

describe('createError', () => {
  it('should create an AppError with the correct type and status code', () => {
    const error = createError(ErrorTypes.BAD_REQUEST, 'Invalid parameters', {
      param: 'id',
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error.type).toBe(ErrorTypes.BAD_REQUEST);
    expect(error.message).toBe('Invalid parameters');
    expect(error.details).toEqual({ param: 'id' });
    expect(error.statusCode).toBe(400); // BAD_REQUEST should map to 400
  });

  it('should map all error types to their correct status codes', () => {
    const errorTypesToStatusCodes = {
      [ErrorTypes.VALIDATION]: 400,
      [ErrorTypes.NOT_FOUND]: 404,
      [ErrorTypes.AUTHENTICATION]: 401,
      [ErrorTypes.AUTHORIZATION]: 403,
      [ErrorTypes.CONFLICT]: 409,
      [ErrorTypes.BAD_REQUEST]: 400,
      [ErrorTypes.RATE_LIMIT]: 429,
      [ErrorTypes.SERVICE_UNAVAILABLE]: 503,
      [ErrorTypes.INTERNAL]: 500,
    };

    Object.entries(errorTypesToStatusCodes).forEach(([type, expectedCode]) => {
      const error = createError(type, 'Test message');
      expect(error.statusCode).toBe(expectedCode);
    });
  });

  it('should use default status code 500 for unknown error types', () => {
    const error = createError('UNKNOWN_TYPE', 'Unknown error');
    expect(error.statusCode).toBe(500);
  });
});

describe('Factory Functions', () => {
  describe('validationError', () => {
    it('should create a validation error with the correct properties', () => {
      const errors = {
        email: 'Email is required',
        password: 'Password is required',
      };
      const error = validationError(errors);

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.VALIDATION);
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual({ errors });
      expect(error.statusCode).toBe(400);
    });
  });

  describe('notFoundError', () => {
    it('should create a not found error with the correct properties', () => {
      const error = notFoundError('User', '123');

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.NOT_FOUND);
      expect(error.message).toBe('User not found');
      expect(error.details).toEqual({ entity: 'User', id: '123' });
      expect(error.statusCode).toBe(404);
    });
  });

  describe('authenticationError', () => {
    it('should create an authentication error with the correct properties', () => {
      const error = authenticationError('Invalid credentials');

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.AUTHENTICATION);
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });

    it('should use default message when not provided', () => {
      const error = authenticationError();
      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('authorizationError', () => {
    it('should create an authorization error with the correct properties', () => {
      const error = authorizationError('Admin access required');

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.AUTHORIZATION);
      expect(error.message).toBe('Admin access required');
      expect(error.statusCode).toBe(403);
    });

    it('should use default message when not provided', () => {
      const error = authorizationError();
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('conflictError', () => {
    it('should create a conflict error with the correct properties', () => {
      const error = conflictError('Email already exists', {
        email: 'test@example.com',
      });

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.CONFLICT);
      expect(error.message).toBe('Email already exists');
      expect(error.details).toEqual({ email: 'test@example.com' });
      expect(error.statusCode).toBe(409);
    });
  });

  describe('badRequestError', () => {
    it('should create a bad request error with the correct properties', () => {
      const error = badRequestError('Invalid query parameters', {
        param: 'sort',
      });

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.BAD_REQUEST);
      expect(error.message).toBe('Invalid query parameters');
      expect(error.details).toEqual({ param: 'sort' });
      expect(error.statusCode).toBe(400);
    });
  });

  describe('rateLimitError', () => {
    it('should create a rate limit error with the correct properties', () => {
      const error = rateLimitError('Too many requests', { retryAfter: 60 });

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.RATE_LIMIT);
      expect(error.message).toBe('Too many requests');
      expect(error.details).toEqual({ retryAfter: 60 });
      expect(error.statusCode).toBe(429);
    });

    it('should use default message when not provided', () => {
      const error = rateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
    });
  });

  describe('serviceUnavailableError', () => {
    it('should create a service unavailable error with the correct properties', () => {
      const error = serviceUnavailableError('Database connection failed');

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.SERVICE_UNAVAILABLE);
      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(503);
    });

    it('should use default message when not provided', () => {
      const error = serviceUnavailableError();
      expect(error.message).toBe('Service temporarily unavailable');
    });
  });

  describe('internalError', () => {
    it('should create an internal error with the correct properties', () => {
      const error = internalError('Unexpected error', { source: 'database' });

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorTypes.INTERNAL);
      expect(error.message).toBe('Unexpected error');
      expect(error.details).toEqual({ source: 'database' });
      expect(error.statusCode).toBe(500);
    });

    it('should use default message when not provided', () => {
      const error = internalError();
      expect(error.message).toBe('Internal server error');
    });
  });
});
