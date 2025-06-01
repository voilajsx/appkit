/**
 * Tests for error creation and AppError class
 * @module @voilajsx/appkit/error
 * @file src/error/tests/errors.test.js
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ErrorTypes,
  validationError,
  notFoundError,
  authError,
  serverError,
} from '../errors.js';

describe('ErrorTypes', () => {
  it('should have correct error type constants', () => {
    expect(ErrorTypes.VALIDATION).toBe('VALIDATION_ERROR');
    expect(ErrorTypes.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorTypes.AUTH).toBe('AUTH_ERROR');
    expect(ErrorTypes.SERVER).toBe('SERVER_ERROR');
  });
});

describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError(ErrorTypes.VALIDATION, 'Test message');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.type).toBe(ErrorTypes.VALIDATION);
    expect(error.message).toBe('Test message');
    expect(error.details).toBeNull();
    expect(error.statusCode).toBe(400);
  });

  it('should create error with details', () => {
    const details = { field: 'email', code: 'REQUIRED' };
    const error = new AppError(ErrorTypes.VALIDATION, 'Test message', details);

    expect(error.details).toEqual(details);
  });

  it('should map error types to correct status codes', () => {
    const validationErr = new AppError(ErrorTypes.VALIDATION, 'test');
    const notFoundErr = new AppError(ErrorTypes.NOT_FOUND, 'test');
    const authErr = new AppError(ErrorTypes.AUTH, 'test');
    const serverErr = new AppError(ErrorTypes.SERVER, 'test');

    expect(validationErr.statusCode).toBe(400);
    expect(notFoundErr.statusCode).toBe(404);
    expect(authErr.statusCode).toBe(401);
    expect(serverErr.statusCode).toBe(500);
  });

  it('should default to 500 for unknown error types', () => {
    const error = new AppError('UNKNOWN_TYPE', 'test');
    expect(error.statusCode).toBe(500);
  });

  it('should serialize to JSON correctly', () => {
    const details = { field: 'test' };
    const error = new AppError(ErrorTypes.VALIDATION, 'Test message', details);
    const json = error.toJSON();

    expect(json).toEqual({
      type: ErrorTypes.VALIDATION,
      message: 'Test message',
      details: details,
    });
  });

  it('should capture stack trace', () => {
    const error = new AppError(ErrorTypes.SERVER, 'Test message');
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});

describe('validationError', () => {
  it('should create validation error with message only', () => {
    const error = validationError('Email is required');

    expect(error).toBeInstanceOf(AppError);
    expect(error.type).toBe(ErrorTypes.VALIDATION);
    expect(error.message).toBe('Email is required');
    expect(error.statusCode).toBe(400);
    expect(error.details).toBeNull();
  });

  it('should create validation error with details', () => {
    const details = { errors: { email: 'Required', age: 'Invalid' } };
    const error = validationError('Validation failed', details);

    expect(error.type).toBe(ErrorTypes.VALIDATION);
    expect(error.message).toBe('Validation failed');
    expect(error.details).toEqual(details);
  });
});

describe('notFoundError', () => {
  it('should create not found error with custom message', () => {
    const error = notFoundError('User not found');

    expect(error).toBeInstanceOf(AppError);
    expect(error.type).toBe(ErrorTypes.NOT_FOUND);
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create not found error with default message', () => {
    const error = notFoundError();

    expect(error.type).toBe(ErrorTypes.NOT_FOUND);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
  });
});

describe('authError', () => {
  it('should create auth error with custom message', () => {
    const error = authError('Invalid credentials');

    expect(error).toBeInstanceOf(AppError);
    expect(error.type).toBe(ErrorTypes.AUTH);
    expect(error.message).toBe('Invalid credentials');
    expect(error.statusCode).toBe(401);
  });

  it('should create auth error with default message', () => {
    const error = authError();

    expect(error.type).toBe(ErrorTypes.AUTH);
    expect(error.message).toBe('Authentication failed');
    expect(error.statusCode).toBe(401);
  });
});

describe('serverError', () => {
  it('should create server error with custom message', () => {
    const error = serverError('Database connection failed');

    expect(error).toBeInstanceOf(AppError);
    expect(error.type).toBe(ErrorTypes.SERVER);
    expect(error.message).toBe('Database connection failed');
    expect(error.statusCode).toBe(500);
  });

  it('should create server error with default message', () => {
    const error = serverError();

    expect(error.type).toBe(ErrorTypes.SERVER);
    expect(error.message).toBe('Server error');
    expect(error.statusCode).toBe(500);
  });

  it('should create server error with details', () => {
    const details = { code: 'DB_CONNECTION_ERROR', retry: true };
    const error = serverError('Connection failed', details);

    expect(error.details).toEqual(details);
  });
});
