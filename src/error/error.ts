/**
 * Core error class with semantic HTTP status codes and middleware
 * @module @voilajsx/appkit/error
 * @file src/error/error.ts
 * 
 * @llm-rule WHEN: Building apps that need semantic HTTP error handling
 * @llm-rule AVOID: Using directly - always get instance via error.get()
 * @llm-rule NOTE: Provides semantic error creation (badRequest, unauthorized) and Express middleware
 */

import type { ErrorConfig } from './defaults.js';

export interface AppError extends Error {
  statusCode: number;
  type: string;
}

export interface ExpressRequest {
  [key: string]: any;
}

export interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (data: any) => void;
}

export interface ExpressNextFunction {
  (error?: any): void;
}

export type ExpressErrorHandler = (
  error: AppError,
  req: ExpressRequest,
  res: ExpressResponse,
  next: ExpressNextFunction
) => void;

export type AsyncRouteHandler = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: ExpressNextFunction
) => Promise<any>;

export interface ErrorHandlerOptions {
  showStack?: boolean;
  logErrors?: boolean;
}

/**
 * Error class with semantic HTTP status codes and middleware functionality
 */
export class ErrorClass {
  public config: ErrorConfig;

  constructor(config: ErrorConfig) {
    this.config = config;
  }

  /**
   * Creates a 400 Bad Request error
   * @llm-rule WHEN: Client sends invalid input data (missing fields, wrong format)
   * @llm-rule AVOID: Using for server-side validation errors - use conflict() instead
   * @llm-rule NOTE: For client input validation - missing email, invalid JSON, etc.
   */
  badRequest(message?: string): AppError {
    const error = new Error(message || this.config.messages.badRequest) as AppError;
    error.statusCode = 400;
    error.type = 'BAD_REQUEST';
    return error;
  }

  /**
   * Creates a 401 Unauthorized error
   * @llm-rule WHEN: Authentication is required but missing or invalid
   * @llm-rule AVOID: Using for permission issues - use forbidden() for access control
   * @llm-rule NOTE: For missing/invalid tokens, expired sessions, login required
   */
  unauthorized(message?: string): AppError {
    const error = new Error(message || this.config.messages.unauthorized) as AppError;
    error.statusCode = 401;
    error.type = 'UNAUTHORIZED';
    return error;
  }

  /**
   * Creates a 403 Forbidden error
   * @llm-rule WHEN: User is authenticated but lacks permission for the action
   * @llm-rule AVOID: Using for authentication issues - use unauthorized() instead
   * @llm-rule NOTE: For insufficient roles, blocked users, access control violations
   */
  forbidden(message?: string): AppError {
    const error = new Error(message || this.config.messages.forbidden) as AppError;
    error.statusCode = 403;
    error.type = 'FORBIDDEN';
    return error;
  }

  /**
   * Creates a 404 Not Found error
   * @llm-rule WHEN: Requested resource does not exist
   * @llm-rule AVOID: Using for business logic failures - use conflict() instead
   * @llm-rule NOTE: For missing users, posts, files, or any resource lookup failures
   */
  notFound(message?: string): AppError {
    const error = new Error(message || this.config.messages.notFound) as AppError;
    error.statusCode = 404;
    error.type = 'NOT_FOUND';
    return error;
  }

  /**
   * Creates a 409 Conflict error
   * @llm-rule WHEN: Business logic conflicts or resource already exists
   * @llm-rule AVOID: Using for validation errors - use badRequest() for input validation
   * @llm-rule NOTE: For duplicate emails, business rule violations, state conflicts
   */
  conflict(message?: string): AppError {
    const error = new Error(message || this.config.messages.conflict) as AppError;
    error.statusCode = 409;
    error.type = 'CONFLICT';
    return error;
  }

  /**
   * Creates a 500 Server Error
   * @llm-rule WHEN: Internal server failures like database errors, external API failures
   * @llm-rule AVOID: Using for business logic issues - use appropriate 4xx errors instead
   * @llm-rule NOTE: For database connection failures, external API timeouts, unexpected errors
   */
  serverError(message?: string): AppError {
    const error = new Error(message || this.config.messages.serverError) as AppError;
    error.statusCode = 500;
    error.type = 'SERVER_ERROR';
    return error;
  }

  /**
   * Creates production-ready Express error handling middleware
   * @llm-rule WHEN: Setting up Express app error handling - use as last middleware
   * @llm-rule AVOID: Using multiple error handlers - this should be the final middleware
   * @llm-rule NOTE: Automatically handles dev vs production error responses and logging
   */
  handleErrors(options: ErrorHandlerOptions = {}): ExpressErrorHandler {
    // Use instance config as defaults, allow options to override
    const showStack = options.showStack !== undefined 
      ? options.showStack 
      : this.config.middleware.showStack;

    const logErrors = options.logErrors !== undefined 
      ? options.logErrors 
      : this.config.middleware.logErrors;

    return (error: AppError, req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
      const statusCode = error.statusCode || 500;

      // Environment-aware error logging
      if (logErrors && statusCode >= 500) {
        console.error(`[${new Date().toISOString()}] ${error.message}`);
        if (showStack) {
          console.error(error.stack);
        }
      }

      // Production-safe error response
      const response: any = {
        error: error.type || 'ERROR',
        message: statusCode === 500 && !this.config.environment.isDevelopment
          ? 'Server error'
          : error.message,
      };

      // Include stack trace in development only
      if (showStack && this.config.environment.isDevelopment) {
        response.stack = error.stack;
      }

      res.status(statusCode).json(response);
    };
  }

  /**
   * Wraps async route handlers to automatically catch and forward errors
   * @llm-rule WHEN: Using async/await in Express route handlers
   * @llm-rule AVOID: Manual try/catch in every async route - use this wrapper instead
   * @llm-rule NOTE: Automatically catches promise rejections and forwards to error middleware
   */
  asyncRoute(fn: AsyncRouteHandler): (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => void {
    return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Checks if an error is a client error (4xx status code)
   * @llm-rule WHEN: Need to categorize errors for logging or retry logic
   * @llm-rule AVOID: Manual status code checking - use this for consistency
   * @llm-rule NOTE: Returns true for 400-499 status codes (client errors)
   */
  isClientError(error: AppError): boolean {
    const statusCode = error.statusCode || 500;
    return statusCode >= 400 && statusCode < 500;
  }

  /**
   * Checks if an error is a server error (5xx status code)
   * @llm-rule WHEN: Need to determine if error should be retried or logged differently
   * @llm-rule AVOID: Manual status code checking - use this for consistency
   * @llm-rule NOTE: Returns true for 500+ status codes (server errors)
   */
  isServerError(error: AppError): boolean {
    const statusCode = error.statusCode || 500;
    return statusCode >= 500;
  }

  /**
   * Creates a custom error with specific status code and type
   * @llm-rule WHEN: Need custom HTTP status codes not covered by semantic methods
   * @llm-rule AVOID: Using for common status codes - use semantic methods instead
   * @llm-rule NOTE: For custom status codes like 422, 429, etc.
   */
  createError(statusCode: number, message: string, type?: string): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.type = type || `HTTP_${statusCode}`;
    return error;
  }
}