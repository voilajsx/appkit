/**
 * @voilajs/appkit - Configuration loader
 * @module @voilajs/appkit/config/loader
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ConfigError } from './errors.js';
import { validateConfig } from './validator.js';

// Configuration store
let configStore = {};
let configOptions = {};
let envCache = {};

// Load .env files early
loadDotEnvFiles();

/**
 * Loads .env files for different environments
 * @private
 */
function loadDotEnvFiles() {
  // Load base .env file (lowest precedence)
  dotenv.config();

  // Load environment-specific .env file, overriding base
  const env = process.env.NODE_ENV || 'development';
  dotenv.config({ path: `.env.${env}`, override: true });

  // Load local overrides (highest precedence)
  dotenv.config({ path: '.env.local', override: true });
}

/**
 * Loads configuration from file or object
 * @param {string|Object} pathOrConfig - File path or configuration object
 * @param {Object} [options] - Load options
 * @returns {Object} Loaded configuration
 */
export async function loadConfig(pathOrConfig, options = {}) {
  // Removed 'required' option as it's now handled solely by schema
  configOptions = {
    defaults: options.defaults || {},
    validate: options.validate !== false,
    schema: options.schema,
    env: options.env !== false,
    watch: options.watch || false,
    interpolate: options.interpolate !== false,
    map: options.map, // Ensure map is stored in configOptions
  };

  try {
    let config;

    if (typeof pathOrConfig === 'string') {
      config = await loadFromFile(pathOrConfig);
      configOptions.lastPath = pathOrConfig;
    } else if (typeof pathOrConfig === 'object' && pathOrConfig !== null) {
      config = pathOrConfig;
    } else {
      throw new ConfigError(
        'Configuration must be a file path or object',
        'INVALID_CONFIG_SOURCE'
      );
    }

    // Merge with defaults first (important for building structure)
    config = mergeWithDefaults(config, configOptions.defaults);

    // Load environment variables using the map and schema for coercion
    if (configOptions.env) {
      config = mergeWithEnv(config, configOptions.map, configOptions.schema);
    }

    // Interpolate variables
    if (configOptions.interpolate) {
      config = interpolateVariables(config);
    }

    // Removed validateRequiredFields as schema validation handles required fields

    // Validate against schema if provided
    if (configOptions.validate && configOptions.schema) {
      validateConfig(config, configOptions.schema);
    }

    // Store configuration
    configStore = config;

    // Setup file watching if requested
    if (configOptions.watch && typeof pathOrConfig === 'string') {
      watchConfigFile(pathOrConfig);
    }

    return config;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    throw new ConfigError(
      `Failed to load configuration: ${error.message}`,
      'CONFIG_LOAD_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Loads configuration from file
 * @private
 * @param {string} filePath - Configuration file path
 * @returns {Promise<Object>} Configuration object
 */
async function loadFromFile(filePath) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new ConfigError(
      `Configuration file not found: ${absolutePath}`,
      'FILE_NOT_FOUND'
    );
  }

  const ext = path.extname(absolutePath).toLowerCase();
  let content;

  try {
    content = await fs.promises.readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new ConfigError(
      `Failed to read configuration file: ${error.message}`,
      'FILE_READ_ERROR'
    );
  }

  switch (ext) {
    case '.json':
      return parseJSON(content, absolutePath);
    case '.js':
    case '.mjs':
      return loadJavaScript(absolutePath);
    default:
      throw new ConfigError(
        `Unsupported configuration file type: ${ext}`,
        'UNSUPPORTED_FILE_TYPE'
      );
  }
}

/**
 * Parses JSON configuration
 * @private
 * @param {string} content - JSON content
 * @param {string} filePath - File path for error reporting
 * @returns {Object} Parsed configuration
 */
function parseJSON(content, filePath) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new ConfigError(
      `Invalid JSON in configuration file: ${filePath}`,
      'JSON_PARSE_ERROR',
      { parseError: error.message }
    );
  }
}

/**
 * Loads JavaScript configuration module
 * @private
 * @param {string} filePath - JavaScript file path
 * @returns {Promise<Object>} Module exports
 */
async function loadJavaScript(filePath) {
  try {
    const module = await import(filePath);
    return module.default || module;
  } catch (error) {
    throw new ConfigError(
      `Failed to load JavaScript configuration: ${error.message}`,
      'JS_LOAD_ERROR'
    );
  }
}

/**
 * Merges configuration with defaults
 * @private
 * @param {Object} config - Configuration object
 * @param {Object} defaults - Default values
 * @returns {Object} Merged configuration
 */
function mergeWithDefaults(config, defaults) {
  return deepMerge(defaults, config);
}

/**
 * Merges configuration with environment variables and performs type coercion based on schema.
 * @private
 * @param {Object} config - Configuration object
 * @param {Object} envMap - The environment variable mapping
 * @param {Object} schema - The validation schema for type coercion.
 * @returns {Object} Merged configuration with coerced values.
 */
function mergeWithEnv(config, envMap, schema) {
  const result = { ...config };

  // Cache all environment variables
  for (const [key, value] of Object.entries(process.env)) {
    envCache[key] = value;
  }

  // Apply mapped environment variables to the config with type coercion
  if (envMap) {
    for (const [envVarName, configPath] of Object.entries(envMap)) {
      const envValue = process.env[envVarName];

      if (envValue !== undefined) {
        let coercedValue = envValue;

        // Type Coercion based on schema
        if (schema) {
          const schemaProp = getNestedSchemaProperty(schema, configPath);
          if (schemaProp && schemaProp.type) {
            const expectedType = Array.isArray(schemaProp.type) ? schemaProp.type[0] : schemaProp.type;

            switch (expectedType) {
              case 'number':
                if (!isNaN(parseFloat(envValue)) && isFinite(envValue)) {
                  coercedValue = parseFloat(envValue);
                } else {
                  console.warn(`[ConfigLoader] Env var '${envVarName}' expected to be 'number', but received non-numeric string '${envValue}'. Keeping as string.`);
                }
                break;
              case 'boolean':
                if (envValue.toLowerCase() === 'true') {
                  coercedValue = true;
                } else if (envValue.toLowerCase() === 'false') {
                  coercedValue = false;
                } else {
                  console.warn(`[ConfigLoader] Env var '${envVarName}' expected to be 'boolean', but received non-boolean string '${envValue}'. Keeping as string.`);
                }
                break;
              // Add other type coercions if needed (e.g., array, object from JSON string)
            }
          }
        }
        setNestedValue(result, configPath, coercedValue);
      }
    }
  }

  return result;
}

/**
 * Helper to get nested schema property definition.
 * @private
 * @param {Object} currentSchema - The current part of the schema object.
 * @param {string} path - The dot-notation path to the property.
 * @returns {Object|undefined} The schema definition for the property or undefined if not found.
 */
function getNestedSchemaProperty(currentSchema, path) {
  const keys = path.split('.');
  let tempSchema = currentSchema;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (tempSchema && tempSchema.properties && tempSchema.properties[key]) {
      tempSchema = tempSchema.properties[key];
    } else if (tempSchema && tempSchema.$ref) {
      // A more robust appkit would have a schema resolver here.
      // For this direct file modification, assuming schema passed is already fully resolved.
      console.warn(`[ConfigLoader] Cannot resolve $ref in schema path for '${path}'. Direct $ref resolution needed for complex schemas.`);
      return undefined;
    }
    else {
      return undefined; // Path not found in schema
    }
  }
  return tempSchema;
}

/**
 * Interpolates variables in configuration
 * @private
 * @param {Object} config - Configuration object
 * @returns {Object} Interpolated configuration
 */
function interpolateVariables(config) {
  const context = {
    ...config,
    env: process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  return interpolateObject(config, context);
}

/**
 * Recursively interpolates variables in an object
 * @private
 * @param {*} obj - Object to interpolate
 * @param {Object} context - Variable context
 * @returns {*} Interpolated object
 */
function interpolateObject(obj, context) {
  if (typeof obj === 'string') {
    return interpolateString(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, context));
  }

  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, context);
    }
    return result;
  }

  return obj;
}

/**
 * Interpolates variables in a string
 * @private
 * @param {string} str - String to interpolate
 * @param {Object} context - Variable context
 * @returns {string} Interpolated string
 */
function interpolateString(str, context) {
  return str.replace(/\${([^}]+)}/g, (match, expression) => {
    try {
      // Simple property access
      const value = getNestedValue(context, expression);
      return value !== undefined ? value : match;
    } catch (error) {
      // Return original if interpolation fails
      return match;
    }
  });
}

// Removed validateRequiredFields as schema validation now handles required fields

/**
 * Watches configuration file for changes
 * @private
 * @param {string} filePath - File path to watch
 */
function watchConfigFile(filePath) {
  let reloadTimeout;

  fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
      // Debounce reloads
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(async () => {
        try {
          await reloadConfig(filePath);
          console.log('Configuration reloaded');
        } catch (error) {
          console.error('Failed to reload configuration:', error.message);
        }
      }, 100);
    }
  });
}

/**
 * Sets configuration value
 * @param {Object} config - Configuration object
 */
export function setConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new ConfigError(
      'Configuration must be an object',
      'INVALID_CONFIG_TYPE'
    );
  }

  configStore = { ...config };
}

/**
 * Gets configuration value by key
 * @param {string} [key] - Configuration key (dot notation)
 * @param {*} [defaultValue] - Default value if key not found
 * @returns {*} Configuration value
 */
export function getConfig(key, defaultValue) {
  if (!key) {
    return { ...configStore };
  }

  const value = getNestedValue(configStore, key);
  return value !== undefined ? value : defaultValue;
}

/**
 * Gets environment variable value
 * @param {string} key - Environment variable name
 * @param {*} [defaultValue] - Default value if not found
 * @returns {string} Environment variable value
 */
export function getEnv(key, defaultValue) {
  // Check cache first
  if (key in envCache) {
    return envCache[key];
  }

  const value = process.env[key];
  if (value !== undefined) {
    envCache[key] = value;
    return value;
  }

  return defaultValue;
}

/**
 * Reloads configuration from file
 * @param {string} [filePath] - Configuration file path
 * @returns {Promise<Object>} Reloaded configuration
 */
export async function reloadConfig(filePath) {
  // Reload .env files first
  loadDotEnvFiles();

  if (!filePath && !configOptions.lastPath) {
    throw new ConfigError(
      'No configuration file path provided',
      'NO_CONFIG_PATH'
    );
  }

  const path = filePath || configOptions.lastPath;
  configOptions.lastPath = path;

  // Pass current configOptions to loadConfig for consistent reload
  return loadConfig(path, configOptions);
}

/**
 * Checks if configuration has a key
 * @param {string} key - Configuration key (dot notation)
 * @returns {boolean} True if key exists
 */
export function hasConfig(key) {
  return getNestedValue(configStore, key) !== undefined;
}

/**
 * Clears configuration
 */
export function clearConfig() {
  configStore = {};
  envCache = {};
  configOptions = {};
}

/**
 * Deep merges two objects
 * @private
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Gets nested value from object
 * @private
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot notation path
 * @returns {*} Value at path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key];
  }, obj);
}

/**
 * Sets nested value in object
 * @private
 * @param {Object} obj - Object to set value in
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}