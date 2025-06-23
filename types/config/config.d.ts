/**
 * VoilaJS AppKit - Core Configuration Class
 * @description Provides methods to access the application's configuration.
 * @module @voilajsx/appkit/config
 * @file src/config/config.js
 */
export class ConfigClass {
    /**
     * Creates a new, immutable Config instance.
     * @param {object} [initialConfig={}] The initial configuration object.
     */
    constructor(initialConfig?: object);
    _config: any;
    /**
     * Gets a specific configuration value using dot notation.
     * @param {string} path - The dot-separated path (e.g., 'database.host').
     * @param {*} [defaultValue=undefined] - The value to return if the path is not found.
     * @returns {*} The configuration value or the default value.
     */
    get(path: string, defaultValue?: any): any;
    /**
     * Checks if a configuration path exists.
     * @param {string} path - The dot-separated path to check.
     * @returns {boolean} True if the path exists, false otherwise.
     */
    has(path: string): boolean;
    /**
     * Returns the entire, immutable configuration object.
     * @returns {object} The complete configuration object.
     */
    getAll(): object;
}
