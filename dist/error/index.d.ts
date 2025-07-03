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
import { type ErrorConfig } from './defaults.js';
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
export type ExpressErrorHandler = (error: AppError, req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => void;
export type AsyncRouteHandler = (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => Promise<any>;
export interface ErrorHandlerOptions {
    showStack?: boolean;
    logErrors?: boolean;
}
/**
 * Get error instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @llm-rule WHEN: Starting any error operation - this is your main entry point
 * @llm-rule AVOID: Calling new ErrorClass() directly - always use this function
 * @llm-rule NOTE: Typical flow - get() → badRequest() → handleErrors()
 */
declare function get(overrides?: Partial<ErrorConfig>): ErrorClass;
/**
 * Reset global instance (useful for testing or config changes)
 * @llm-rule WHEN: Testing error logic with different configurations
 * @llm-rule AVOID: Using in production - only for tests and development
 */
declare function reset(newConfig?: Partial<ErrorConfig>): ErrorClass;
/**
 * Single error export with minimal functionality
 */
export declare const error: {
    readonly get: typeof get;
    readonly reset: typeof reset;
    readonly badRequest: (message?: string) => import("./error.js").AppError;
    readonly unauthorized: (message?: string) => import("./error.js").AppError;
    readonly forbidden: (message?: string) => import("./error.js").AppError;
    readonly notFound: (message?: string) => import("./error.js").AppError;
    readonly conflict: (message?: string) => import("./error.js").AppError;
    readonly serverError: (message?: string) => import("./error.js").AppError;
    readonly createError: (statusCode: number, message: string, type?: string) => import("./error.js").AppError;
    readonly handleErrors: (options?: ErrorHandlerOptions) => import("./error.js").ExpressErrorHandler;
    readonly asyncRoute: (fn: AsyncRouteHandler) => (req: import("./error.js").ExpressRequest, res: import("./error.js").ExpressResponse, next: import("./error.js").ExpressNextFunction) => void;
    readonly isClientError: (err: AppError) => boolean;
    readonly isServerError: (err: AppError) => boolean;
};
export type { ErrorConfig } from './defaults.js';
export { ErrorClass } from './error.js';
//# sourceMappingURL=index.d.ts.map