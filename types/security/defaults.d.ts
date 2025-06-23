/**
 * Smart defaults and environment validation for security
 * @module @voilajsx/appkit/security
 * @file src/security/defaults.js
 */
/**
 * Gets smart defaults using VOILA_SECURITY_* environment variables
 * @returns {object} Configuration object with smart defaults
 */
export function getSmartDefaults(): object;
/**
 * Creates security error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {Error} Error with statusCode property
 */
export function createSecurityError(message: string, statusCode?: number, details?: any): Error;
