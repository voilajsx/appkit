/**
 * Ultra-simple logging that just works
 * @module @voilajsx/appkit/logging
 * @file src/logging/index.js
 */

import { LoggerClass } from './logger.js';
import { getSmartDefaults } from './defaults.js';

/**
 * Creates a logger that just works - zero configuration needed
 * @param {string|object} [levelOrOptions] - Log level or options object
 * @returns {LoggerClass} Ready-to-use logger instance
 */
function logger(levelOrOptions) {
  if (typeof levelOrOptions === 'string') {
    return new LoggerClass({
      level: levelOrOptions,
      ...getSmartDefaults(),
    });
  }

  if (typeof levelOrOptions === 'object' && levelOrOptions !== null) {
    return new LoggerClass({
      ...getSmartDefaults(),
      ...levelOrOptions,
    });
  }

  return new LoggerClass(getSmartDefaults());
}

// Main export
export { logger };

// Default export
export default logger;
