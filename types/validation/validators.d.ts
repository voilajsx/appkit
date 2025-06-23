/**
 * Validates data against schema
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {{valid: boolean, errors: Array, value: *}} Validation result
 */
export function validate(data: any, schema: any, options?: any): {
    valid: boolean;
    errors: any[];
    value: any;
};
/**
 * Creates a reusable validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Validator function
 */
export function createValidator(schema: any, options?: any): Function;
/**
 * Validates data asynchronously
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {Promise<{valid: boolean, errors: Array, value: *}>} Validation result
 */
export function validateAsync(data: any, schema: any, options?: any): Promise<{
    valid: boolean;
    errors: any[];
    value: any;
}>;
/**
 * Creates a reusable async validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Async validator function
 */
export function createAsyncValidator(schema: any, options?: any): Function;
/**
 * Validates email format
 * @param {string} value - Email to validate
 * @returns {boolean} Is valid email
 */
export function isEmail(value: string): boolean;
/**
 * Validates URL format
 * @param {string} value - URL to validate
 * @returns {boolean} Is valid URL
 */
export function isUrl(value: string): boolean;
/**
 * Validates alphanumeric string
 * @param {string} value - String to validate
 * @returns {boolean} Is alphanumeric
 */
export function isAlphanumeric(value: string): boolean;
