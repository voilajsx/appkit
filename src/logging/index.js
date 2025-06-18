/**
 * Ultra-simple logging that just works.
 * @module @voilajsx/appkit/logging
 * @file src/logging/index.js
 */

import { LoggerClass } from './logger.js';
import { getSmartDefaults } from './defaults.js';

// Singleton instances
let _mainLogger = null;
const _namedLoggers = new Map();

/**
 * Get a logger instance.
 *
 * @param {string} [name] - Component name for child logger
 * @returns {LoggerClass} Ready-to-use logger
 *
 * @example
 * // Main logger
 * logger.get().info('App started');
 *
 * // Component logger
 * logger.get('database').error('Connection failed');
 */
function get(name) {
  // Initialize main logger if needed
  if (!_mainLogger) {
    const config = getSmartDefaults();
    _mainLogger = new LoggerClass(config);
  }

  // Return main logger if no name provided
  if (!name) {
    return _mainLogger;
  }

  // Return cached or create new child logger
  if (_namedLoggers.has(name)) {
    return _namedLoggers.get(name);
  }

  const childLogger = _mainLogger.child({ component: name });
  _namedLoggers.set(name, childLogger);
  return childLogger;
}

/**
 * Clear all loggers and close transports.
 * Essential for testing to prevent memory leaks.
 *
 * @returns {Promise<void>}
 */
async function clear() {
  if (_mainLogger) {
    await _mainLogger.close();
    _mainLogger = null;
  }
  _namedLoggers.clear();
}

/**
 * The main logger object
 */
const logger = { get, clear };

export { logger };
export default logger;
