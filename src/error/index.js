/**
 * Ultra-simple object-driven error handling that just works
 * @module @voilajsx/appkit/error
 * @file src/error/index.js
 */

import { ErrorClass } from './error.js';
import { getSmartDefaults } from './defaults.js';

// Global error instance for performance
let globalError = null;

/**
 * Get error instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @returns {ErrorClass} Error instance with all methods
 */
function get() {
  // Lazy initialization - parse environment once
  if (!globalError) {
    globalError = new ErrorClass(getSmartDefaults());
  }

  return globalError;
}

/**
 * Single error export with minimal functionality
 */
export const error = {
  get,
};
