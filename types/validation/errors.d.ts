/**
 * @voilajsx/appkit - Validation errors
 * @module @voilajsx/appkit/validation/errors
 * @file src/validation/errors.js
 */
/**
 * Minimal validation error class
 */
export class ValidationError extends Error {
    constructor(message: any, errors?: any[]);
    errors: any[];
    /**
     * Get formatted error messages
     * @returns {Array<string>} Error messages
     */
    getMessages(): Array<string>;
    /**
     * Check if there are any errors
     * @returns {boolean} Has any errors
     */
    hasErrors(): boolean;
}
