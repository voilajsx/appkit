/**
 * VoilaJS AppKit - Configuration Smart Defaults
 * @description Loads and parses environment variables using the UPPER_SNAKE__CASE convention.
 * @module @voilajsx/appkit/config
 * @file src/config/defaults.js
 */

/**
 * Parses a string value to its appropriate type (boolean, number, or string).
 * @param {string} value The environment variable string value.
 * @returns {string|boolean|number} The parsed value.
 */
function parseValue(value) {
  if (typeof value !== 'string') return value;

  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true') return true;
  if (lowerValue === 'false') return false;

  if (value.trim() !== '' && !isNaN(Number(value))) {
    return Number(value);
  }

  return value;
}

/**
 * Sets a value on a nested object using a dot-notation path.
 * @param {Object} obj The target object to modify.
 * @param {string[]} path Array of path segments.
 * @param {*} value The value to set.
 */
function setNestedValue(obj, path, value) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    if (typeof current[segment] !== 'object' || current[segment] === null) {
      current[segment] = {};
    }
    current = current[segment];
  }
  current[path[path.length - 1]] = value;
}

/**
 * Validates the NODE_ENV for common conventions.
 */
function validateEnvironment() {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    console.warn(
      `[Voila AppKit] Unusual NODE_ENV: "${nodeEnv}". Expected: development, production, or test.`
    );
  }
}

/**
 * Builds the entire configuration object from `process.env`.
 * @returns {object} The complete, nested application configuration object.
 */
export function buildConfigFromEnv() {
  validateEnvironment();

  const config = {
    app: {
      name: process.env.VOILA_SERVICE_NAME || 'voila-app',
      environment: process.env.NODE_ENV || 'development',
    },
  };

  // Process all environment variables using the UPPER_SNAKE__CASE convention.
  for (const envKey in process.env) {
    if (envKey.includes('__')) {
      const path = envKey.toLowerCase().split('__');
      const value = parseValue(process.env[envKey]);
      setNestedValue(config, path, value);
    }
  }

  return config;
}
