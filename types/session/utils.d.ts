/**
 * Utility function to create a secure session secret
 * @param {number} [length=32] - Length of the secret in bytes
 * @returns {string} Secure random secret
 *
 * @example
 * const secret = createSessionSecret();
 * console.log(secret); // 64-character hex string
 */
export function createSessionSecret(length?: number): string;
/**
 * Utility function to validate session configuration
 * @param {Object} options - Session options to validate
 * @returns {Object} Validation result
 *
 * @example
 * const validation = validateSessionConfig({
 *   secret: 'my-secret',
 *   maxAge: 3600000
 * });
 *
 * if (!validation.valid) {
 *   console.error('Invalid session config:', validation.errors);
 * }
 */
export function validateSessionConfig(options?: any): any;
/**
 * Utility function to sanitize session data before storage
 * @param {Object} data - Session data to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized session data
 *
 * @example
 * const sanitized = sanitizeSessionData({
 *   user: { id: 123, password: 'secret' },
 *   token: 'abc123'
 * }, {
 *   removeKeys: ['password', 'token']
 * });
 */
export function sanitizeSessionData(data: any, options?: any): any;
/**
 * Session manager for handling cookies and session lifecycle
 */
export class SessionManager {
    constructor(options?: {});
    store: any;
    cookieName: any;
    maxAge: any;
    secure: boolean;
    httpOnly: boolean;
    sameSite: any;
    secret: any;
    rolling: boolean;
    path: any;
    domain: any;
    /**
     * Generate a random secret for development
     * @returns {string} Random secret
     */
    generateSecret(): string;
    /**
     * Generate a new session ID
     * @returns {string} Session ID
     */
    generateSessionId(): string;
    /**
     * Sign a session ID to prevent tampering
     * @param {string} sessionId - Session ID to sign
     * @returns {string} Signed session ID
     */
    signSessionId(sessionId: string): string;
    /**
     * Verify and extract session ID from signed value
     * @param {string} signedSessionId - Signed session ID
     * @returns {string|null} Session ID or null if invalid
     */
    unsignSessionId(signedSessionId: string): string | null;
    /**
     * Parse cookie header manually
     * @param {string} cookieHeader - Raw cookie header
     * @returns {Object} Parsed cookies
     */
    parseCookies(cookieHeader: string): any;
    /**
     * Get session cookie from request (framework-agnostic)
     * @param {Object} req - Request object
     * @returns {string|null} Session cookie value
     */
    getCookie(req: any): string | null;
    /**
     * Build cookie string for Set-Cookie header
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {Object} options - Cookie options
     * @returns {string} Cookie string
     */
    buildCookieString(name: string, value: string, options?: any): string;
    /**
     * Set session cookie (framework-agnostic)
     * @param {Object} res - Response object
     * @param {string} value - Cookie value
     * @param {Object} options - Cookie options
     */
    setCookie(res: any, value: string, options?: any): void;
    /**
     * Clear session cookie
     * @param {Object} res - Response object
     */
    clearCookie(res: any): void;
}
declare namespace _default {
    export { SessionManager };
    export { createSessionSecret };
    export { validateSessionConfig };
    export { sanitizeSessionData };
}
export default _default;
