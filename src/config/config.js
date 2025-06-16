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
  constructor(initialConfig = {}) {
    // Make the config object deeply immutable for safety.
    this._config = Object.freeze(JSON.parse(JSON.stringify(initialConfig)));
  }

  /**
   * Gets a specific configuration value using dot notation.
   * @param {string} path - The dot-separated path (e.g., 'database.host').
   * @param {*} [defaultValue=undefined] - The value to return if the path is not found.
   * @returns {*} The configuration value or the default value.
   */
  get(path, defaultValue = undefined) {
    if (typeof path !== 'string' || !path) {
      return defaultValue;
    }

    const segments = path.split('.');
    let current = this._config;

    for (const segment of segments) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        return defaultValue;
      }
    }

    return current;
  }

  /**
   * Checks if a configuration path exists.
   * @param {string} path - The dot-separated path to check.
   * @returns {boolean} True if the path exists, false otherwise.
   */
  has(path) {
    return this.get(path) !== undefined;
  }

  /**
   * Returns the entire, immutable configuration object.
   * @returns {object} The complete configuration object.
   */
  getAll() {
    return this._config;
  }
}
