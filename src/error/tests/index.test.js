/**
 * Tests for @voilajs/appkit/error - Module Exports
 */

import { describe, it, expect } from 'vitest';
import * as ErrorModule from '../index.js';
import {
  AppError,
  ErrorTypes,
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
import {
  formatErrorResponse,
  createErrorHandler,
  asyncHandler,
  notFoundHandler,
  handleUnhandledRejections,
  handleUncaughtExceptions,
  validateRequest,
} from '../handlers.js';

describe('Module Exports', () => {
  it('should export all error types and classes', () => {
    // Error types
    expect(ErrorModule.ErrorTypes).toBe(ErrorTypes);
    expect(ErrorModule.AppError).toBe(AppError);

    // Factory functions
    expect(ErrorModule.createError).toBe(createError);
    expect(ErrorModule.validationError).toBe(validationError);
    expect(ErrorModule.notFoundError).toBe(notFoundError);
    expect(ErrorModule.authenticationError).toBe(authenticationError);
    expect(ErrorModule.authorizationError).toBe(authorizationError);
    expect(ErrorModule.conflictError).toBe(conflictError);
    expect(ErrorModule.badRequestError).toBe(badRequestError);
    expect(ErrorModule.rateLimitError).toBe(rateLimitError);
    expect(ErrorModule.serviceUnavailableError).toBe(serviceUnavailableError);
    expect(ErrorModule.internalError).toBe(internalError);

    // Handler functions
    expect(ErrorModule.formatErrorResponse).toBe(formatErrorResponse);
    expect(ErrorModule.createErrorHandler).toBe(createErrorHandler);
    expect(ErrorModule.asyncHandler).toBe(asyncHandler);
    expect(ErrorModule.notFoundHandler).toBe(notFoundHandler);
    expect(ErrorModule.handleUnhandledRejections).toBe(
      handleUnhandledRejections
    );
    expect(ErrorModule.handleUncaughtExceptions).toBe(handleUncaughtExceptions);
    expect(ErrorModule.validateRequest).toBe(validateRequest);
  });

  it('should not export any unexpected functions', () => {
    const expectedExports = [
      'ErrorTypes',
      'AppError',
      'createError',
      'validationError',
      'notFoundError',
      'authenticationError',
      'authorizationError',
      'conflictError',
      'badRequestError',
      'rateLimitError',
      'serviceUnavailableError',
      'internalError',
      'formatErrorResponse',
      'createErrorHandler',
      'asyncHandler',
      'notFoundHandler',
      'handleUnhandledRejections',
      'handleUncaughtExceptions',
      'validateRequest',
    ];

    const actualExports = Object.keys(ErrorModule);

    // Check if there are any exports not in our expected list
    const unexpectedExports = actualExports.filter(
      (exp) => !expectedExports.includes(exp)
    );

    expect(unexpectedExports).toEqual([]);
    expect(actualExports.length).toBe(expectedExports.length);
  });
});
