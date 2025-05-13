import { describe, it, expect, vi } from 'vitest';
import {
  formatErrorResponse,
  createErrorHandler,
  asyncHandler,
  notFoundHandler,
} from '../handlers.js';
import { AppError, ErrorTypes, validationError } from '../errors.js';

describe('Error Handlers', () => {
  describe('formatErrorResponse', () => {
    it('should format AppError correctly', () => {
      const error = new AppError(
        ErrorTypes.NOT_FOUND,
        'Resource not found',
        { id: '123' },
        404
      );

      const formatted = formatErrorResponse(error);

      expect(formatted).toEqual({
        error: {
          type: ErrorTypes.NOT_FOUND,
          message: 'Resource not found',
          details: { id: '123' },
          timestamp: error.timestamp,
        },
      });
    });
  });

  describe('createErrorHandler', () => {
    it('should create a middleware function', () => {
      const handler = createErrorHandler();

      expect(typeof handler).toBe('function');
      expect(handler.length).toBe(4); // Should have 4 parameters (error, req, res, next)
    });
  });

  describe('asyncHandler', () => {
    it('should return a middleware function', () => {
      const handler = asyncHandler(() => {});

      expect(typeof handler).toBe('function');
      expect(handler.length).toBe(3); // Should have 3 parameters (req, res, next)
    });

    it('should pass errors to next middleware', async () => {
      const error = new Error('Async error');
      const asyncFn = async () => {
        throw error;
      };

      const handler = asyncHandler(asyncFn);
      const next = vi.fn();

      await handler({}, {}, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('notFoundHandler', () => {
    it('should return a middleware function', () => {
      const handler = notFoundHandler();

      expect(typeof handler).toBe('function');
      expect(handler.length).toBe(3); // Should have 3 parameters (req, res, next)
    });
  });
});
