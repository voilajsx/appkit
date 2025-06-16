/**
 * VoilaJS AppKit - Simple, convention-based configuration management.
 * @module @voilajsx/appkit/config
 * @file src/config/index.js
 */

import { ConfigClass } from './config.js';
import { buildConfigFromEnv } from './defaults.js';

// Module-level singleton instance for performance.
let _instance = null;

/**
 * Gets the singleton configuration instance.
 * Environment variables are parsed only once on the first call.
 *
 * @returns {ConfigClass} The application's configuration instance.
 */
function get() {
  if (!_instance) {
    const rawConfig = buildConfigFromEnv();
    _instance = new ConfigClass(rawConfig);
  }
  return _instance;
}

/**
 * Clears the cached configuration instance.
 * Primarily used for testing purposes to allow for a fresh configuration load.
 */
function clearCache() {
  _instance = null;
}

/**
 * The main config export, providing a simple and consistent API.
 */
export const configure = {
  get,
  clearCache,
};
