/**
 * Ultra-simple, singleton-based logging that just works.
 * @module @voilajsx/appkit/logging
 * @file src/logging/index.js
 */

import { LoggerClass } from './logger.js';
import { getSmartDefaults } from './defaults.js';

// --- Module-level cache for logger instances ---

// The main logger instance, created only once.
let _mainLogger = null;
// A map to store named child loggers for performance.
const _namedLoggers = new Map();

/**
 * Retrieves a logger instance.
 *
 * This function implements a singleton pattern.
 * - Calling `logger.get()` returns the main, app-wide logger.
 * - Calling `logger.get('componentName')` returns a dedicated child logger
 *   with the component name automatically added to its context.
 *
 * @param {string} [name] - The name of the logger (e.g., 'database', 'app-init').
 * @returns {LoggerClass} A ready-to-use logger instance.
 */
function get(name) {
  // 1. Initialize the main logger if it doesn't exist yet.
  if (!_mainLogger) {
    const config = getSmartDefaults();
    _mainLogger = new LoggerClass(config);
  }

  // 2. If no name is provided, return the main singleton logger.
  if (!name) {
    return _mainLogger;
  }

  // 3. If a name is provided, return a cached or new child logger.
  if (_namedLoggers.has(name)) {
    return _namedLoggers.get(name);
  }

  // Create a new child logger with the component name as a default binding.
  const childLogger = _mainLogger.child({ component: name });
  _namedLoggers.set(name, childLogger);
  return childLogger;
}

/**
 * The main logger object, providing the .get() method for a consistent API.
 */
const logger = {
  get,
};

// Main named export (recommended)
export { logger };

// Default export for backward compatibility or different import styles
export default logger;
