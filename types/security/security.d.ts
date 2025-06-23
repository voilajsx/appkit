/**
 * Security class with built-in protection functionality
 */
export class SecurityClass {
    /**
     * Creates a new Security instance
     * @param {object} [config={}] - Security configuration
     */
    constructor(config?: object);
    config: any;
    requestStore: Map<any, any>;
    cleanupInitialized: boolean;
    /**
     * Creates CSRF protection middleware
     * @param {Object} [options] - CSRF options
     * @param {string} [options.secret] - CSRF secret override
     * @param {string} [options.tokenField] - Form field name override
     * @param {string} [options.headerField] - Header name override
     * @param {number} [options.expiryMinutes] - Token expiry override
     * @returns {Function} Express middleware for CSRF protection
     */
    forms(options?: {
        secret?: string;
        tokenField?: string;
        headerField?: string;
        expiryMinutes?: number;
    }): Function;
    /**
     * Creates rate limiting middleware
     * @param {number} [maxRequests] - Max requests per window
     * @param {number} [windowMs] - Time window in milliseconds
     * @param {Object} [options] - Rate limiting options
     * @param {string} [options.message] - Custom error message
     * @param {Function} [options.keyGenerator] - Custom key generation function
     * @returns {Function} Express middleware for rate limiting
     */
    requests(maxRequests?: number, windowMs?: number, options?: {
        message?: string;
        keyGenerator?: Function;
    }): Function;
    /**
     * Cleans text input with XSS prevention
     * @param {string} text - Text to clean
     * @param {Object} [options] - Cleaning options
     * @param {number} [options.maxLength] - Maximum length override
     * @param {boolean} [options.trim] - Trim whitespace (default: true)
     * @param {boolean} [options.removeXSS] - Remove XSS patterns (default: true)
     * @returns {string} Cleaned text safe for storage/display
     */
    input(text: string, options?: {
        maxLength?: number;
        trim?: boolean;
        removeXSS?: boolean;
    }): string;
    /**
     * Cleans HTML allowing specific tags
     * @param {string} html - HTML to clean
     * @param {Object} [options] - HTML cleaning options
     * @param {string[]} [options.allowedTags] - Allowed HTML tags override
     * @param {boolean} [options.stripAllTags] - Remove all HTML tags override
     * @returns {string} Safe HTML with dangerous elements removed
     */
    html(html: string, options?: {
        allowedTags?: string[];
        stripAllTags?: boolean;
    }): string;
    /**
     * Escapes HTML special characters for safe display
     * @param {string} text - Text to escape
     * @returns {string} HTML-safe text with entities escaped
     */
    escape(text: string): string;
    /**
     * Encrypts sensitive data with AES-256-GCM
     * @param {string|Buffer} data - Data to encrypt
     * @param {string|Buffer} [key] - Encryption key override
     * @param {Buffer} [associatedData] - Optional Associated Data (AAD)
     * @returns {string} Encrypted data as "IV:ciphertext:authTag" hex string
     */
    encrypt(data: string | Buffer, key?: string | Buffer, associatedData?: Buffer): string;
    /**
     * Decrypts previously encrypted data
     * @param {string} encryptedData - Encrypted data string in "IV:ciphertext:authTag" format
     * @param {string|Buffer} [key] - Decryption key override
     * @param {Buffer} [associatedData] - Optional Associated Data (AAD)
     * @returns {string} Original plaintext data
     */
    decrypt(encryptedData: string, key?: string | Buffer, associatedData?: Buffer): string;
    /**
     * Generates a secure encryption key for production use
     * @returns {string} 32-byte encryption key as hex string
     */
    generateKey(): string;
    /**
     * Generates a cryptographically secure CSRF token
     * @private
     */
    private _generateCSRFToken;
    /**
     * Verifies CSRF token using timing-safe comparison
     * @private
     */
    private _verifyCSRFToken;
    /**
     * Gets unique identifier for the client
     * @private
     */
    private _getClientKey;
    /**
     * Initializes cleanup interval for memory management
     * @private
     */
    private _initializeCleanup;
    /**
     * Validates encryption key format and length
     * @private
     */
    private _validateEncryptionKey;
}
