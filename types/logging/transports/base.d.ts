/**
 * @voilajs/appkit - Base transport interface
 * @module @voilajs/appkit/logging/transports/base
 */
/**
 * Base transport class
 * @abstract
 */
export class BaseTransport {
    constructor(options?: {});
    options: {};
    /**
     * Logs an entry
     * @abstract
     * @param {Object} entry - Log entry
     */
    log(entry: any): void;
    /**
     * Formats log entry
     * @param {Object} entry - Log entry
     * @returns {string} Formatted entry
     */
    format(entry: any): string;
}
