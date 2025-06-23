/**
 * Core error class with built-in error creation and middleware methods
 * @module @voilajsx/appkit/error
 * @file src/error/error.js
 */
/**
 * Error class with built-in error creation and middleware functionality
 */
export class ErrorClass {
    /**
     * Creates a new Error instance
     * @param {object} [config={}] - Error configuration
     */
    constructor(config?: object);
    config: any;
    /**
     * Creates a 400 Bad Request error
     * @param {string} [message] - Error message
     * @returns {Error} Error with statusCode 400
     */
    badRequest(message?: string): Error;
    /**
     * Creates a 401 Unauthorized error
     * @param {string} [message] - Error message
     * @returns {Error} Error with statusCode 401
     */
    unauthorized(message?: string): Error;
    /**
     * Creates a 403 Forbidden error
     * @param {string} [message] - Error message
     * @returns {Error} Error with statusCode 403
     */
    forbidden(message?: string): Error;
    /**
     * Creates a 404 Not Found error
     * @param {string} [message] - Error message
     * @returns {Error} Error with statusCode 404
     */
    notFound(message?: string): Error;
    /**
     * Creates a 409 Conflict error
     * @param {string} [message] - Error message
     * @returns {Error} Error with statusCode 409
     */
    conflict(message?: string): Error;
    /**
     * Creates a 500 Server Error
     * @param {string} [message] - Error message
     * @returns {Error} Error with statusCode 500
     */
    serverError(message?: string): Error;
    /**
     * Creates production-ready error handling middleware
     * @param {Object} [options] - Configuration options
     * @param {boolean} [options.showStack] - Show stack traces
     * @param {boolean} [options.logErrors] - Log errors
     * @returns {Function} Express error middleware
     */
    handleErrors(options?: {
        showStack?: boolean;
        logErrors?: boolean;
    }): Function;
    /**
     * Wraps async route handlers to catch errors
     * @param {Function} fn - Async function to wrap
     * @returns {Function} Wrapped function
     */
    asyncRoute(fn: Function): Function;
}
