/**
 * Core error class with semantic HTTP status codes and middleware
 * @module @voilajsx/appkit/error
 * @file src/error/index.ts
 * 
 * @llm-rule WHEN: Building apps that need semantic HTTP error handling
 * @llm-rule AVOID: Using directly - always get instance via error.get()
 * @llm-rule NOTE: Provides semantic error creation (badRequest, unauthorized) and Express middleware
 */

import { ErrorClass } from './error.js';
import { getSmartDefaults, type ErrorConfig } from './defaults.js';

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

// Global error instance for performance
let globalError: ErrorClass | null = null;

/**
 * Get error instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @llm-rule WHEN: Starting any error operation - this is your main entry point
 * @llm-rule AVOID: Calling new ErrorClass() directly - always use this function
 * @llm-rule NOTE: Typical flow - get() → badRequest() → handleErrors()
 */
function get(overrides: Partial<ErrorConfig> = {}): ErrorClass {
  // Lazy initialization - parse environment once
  if (!globalError) {
    const defaults = getSmartDefaults();
    const config: ErrorConfig = { ...defaults, ...overrides };
    globalError = new ErrorClass(config);
  }

  return globalError;
}

/**
 * Reset global instance (useful for testing or config changes)
 * @llm-rule WHEN: Testing error logic with different configurations
 * @llm-rule AVOID: Using in production - only for tests and development
 */
function reset(newConfig: Partial<ErrorConfig> = {}): ErrorClass {
  const defaults = getSmartDefaults();
  const config: ErrorConfig = { ...defaults, ...newConfig };
  globalError = new ErrorClass(config);
  return globalError;
}

/**
 * Single error export with minimal functionality
 */
export const error = {
  // Core method
  get,
  
  // Utility methods
  reset,
  
  // Error creation methods
  badRequest: (message?: string) => get().badRequest(message),
  unauthorized: (message?: string) => get().unauthorized(message),
  forbidden: (message?: string) => get().forbidden(message),
  notFound: (message?: string) => get().notFound(message),
  conflict: (message?: string) => get().conflict(message),
  serverError: (message?: string) => get().serverError(message),
  createError: (statusCode: number, message: string, type?: string) => get().createError(statusCode, message, type),

  // Middleware and utility methods
  handleErrors: (options?: ErrorHandlerOptions) => get().handleErrors(options),
  asyncRoute: (fn: AsyncRouteHandler) => get().asyncRoute(fn),
  isClientError: (err: AppError) => get().isClientError(err),
  isServerError: (err: AppError) => get().isServerError(err),
} as const;

// Re-export types for consumers
export type { ErrorConfig } from './defaults.js';
export { ErrorClass } from './error.js';