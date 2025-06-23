/**
 * @voilajsx/appkit - Sanitizers
 * @module @voilajsx/appkit/validation/sanitizers
 * @file src/validation/sanitizers.js
 */
/**
 * Sanitizes data based on rules
 * @param {*} data - Data to sanitize
 * @param {Object} rules - Sanitization rules
 * @returns {*} Sanitized data
 */
export function sanitize(data: any, rules: any): any;
/**
 * Sanitizes string value
 * @param {string} input - String to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {string} Sanitized string
 */
export function sanitizeString(input: string, rules?: any): string;
/**
 * Sanitizes number value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(input: any, rules?: any): number;
/**
 * Sanitizes object value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(input: any, rules?: any): any;
