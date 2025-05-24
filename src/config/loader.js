/**
 * @voilajsx/appkit - Configuration loader
 * @module @voilajsx/appkit/config/loader
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// Using built-in 'url' module for pathToFileURL, which is more robust
import { pathToFileURL } from 'url';
import { ConfigError } from './errors.js';
import { validateConfig } from './validator.js';

// Configuration store - Global for the module's lifecycle
let configStore = {};
let configOptions = {};
let envCache = {}; // Cache for process.env values

// --- Helper Functions (Defined at top level for correct scope) ---

/**
 * Gets a nested value from an object using a dot-notation path.
 * @private
 * @param {Object} obj - The object to traverse.
 * @param {string} path - The dot-notation path (e.g., 'user.profile.name').
 * @returns {*} The value at the specified path, or `undefined` if not found.
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    // If current is null or undefined, or not an object, stop traversal
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    return current[key];
  }, obj);
}

/**
 * Sets a nested value in an object using a dot-notation path, creating intermediate objects if necessary.
 * @private
 * @param {Object} obj - The object to modify.
 * @param {string} path - The dot-notation path.
 * @param {*} value - The value to set at the path.
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    // Ensure current[key] is an object before proceeding, create if not
    if (
      current === null ||
      typeof current !== 'object' ||
      Array.isArray(current)
    ) {
      // If current is primitive, null, or array, and we try to set a key on it,
      // it means the path is invalid for direct object traversal.
      // We create a new object here to allow setting.
      current[key] = {};
    } else if (
      !(key in current) ||
      current[key] === null ||
      typeof current[key] !== 'object' ||
      Array.isArray(current[key])
    ) {
      // If key doesn't exist, or is null/primitive/array, initialize it as an object
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}

/**
 * Deep merges two objects, source into target.
 * @private
 * @param {Object} target - The target object to merge into.
 * @param {Object} source - The source object to merge from.
 * @returns {Object} The merged object.
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
 * Helper to deep clone an object.
 * Used to avoid side-effects when modifying config objects.
 * @private
 * @param {*} obj - The object to clone.
 * @returns {*} A deep clone of the object.
 */
function deepClone(obj) {
  // Handles primitives, null, undefined directly
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  // Simple JSON-based deep clone for objects/arrays of JSON-compatible values
  // This is efficient but doesn't handle functions, Dates, RegExps, etc.
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merges configuration with defaults.
 * @private
 * @param {Object} config - The base configuration object.
 * @param {Object} defaults - The default values to apply.
 * @returns {Object} The configuration merged with defaults.
 */
function mergeWithDefaults(config, defaults) {
  return deepMerge(defaults, config); // Defaults are applied first, then overridden by config
}

/**
 * Helper to get a nested schema property definition.
 * It traverses the schema object based on a dot-notation path.
 * @private
 * @param {Object} currentSchema - The current part of the schema object.
 * @param {string} path - The dot-notation path to the property (e.g., 'server.port').
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
      // Basic warning for $ref; a full implementation would resolve this
      console.warn(
        `[ConfigLoader] Complex $ref resolution for path '${path}' not fully supported in simple getNestedSchemaProperty. Ensure schema is pre-resolved if $ref is used.`
      );
      return undefined;
    } else {
      return undefined; // Path not found in schema properties
    }
  }
  return tempSchema;
}

/**
 * Merges configuration with environment variables and performs type coercion based on schema.
 * Environment variable values are always strings, so coercion is necessary if schema
 * expects numbers, booleans, etc.
 * @private
 * @param {Object} config - The configuration object to merge into.
 * @param {Object} envMap - An object mapping environment variable names to configuration paths.
 * @param {Object} schema - The validation schema for type coercion.
 * @returns {Object} The merged configuration object with coerced values.
 */
function mergeWithEnv(config, envMap, schema) {
  const result = deepClone(config); // Work on a clone to avoid side effects during merging

  // Cache all environment variables (already done by loadDotEnvFiles, but good to ensure fresh state)
  for (const [key, value] of Object.entries(process.env)) {
    envCache[key] = value;
  }

  // Apply mapped environment variables to the config with type coercion
  if (envMap) {
    for (const [envVarName, configPath] of Object.entries(envMap)) {
      const envValue = process.env[envVarName]; // Get raw string value from env

      if (envValue !== undefined) {
        let coercedValue = envValue; // Default to raw string

        // Perform Type Coercion based on schema if schema is provided
        if (schema) {
          const schemaProp = getNestedSchemaProperty(schema, configPath);
          if (schemaProp && schemaProp.type) {
            // Handle array of types (e.g., ['string', 'number']) by taking the first
            const expectedType = Array.isArray(schemaProp.type)
              ? schemaProp.type[0]
              : schemaProp.type;

            switch (expectedType) {
              case 'number':
                // Check if it's a valid number string (not NaN or Infinity)
                const numValue = parseFloat(envValue);
                if (!isNaN(numValue) && isFinite(numValue)) {
                  coercedValue = numValue;
                } else {
                  console.warn(
                    `[ConfigLoader] Env var '${envVarName}' ('${envValue}') mapped to '${configPath}' expected 'number' but is not valid. Keeping as string.`
                  );
                }
                break;
              case 'boolean':
                if (envValue.toLowerCase() === 'true') {
                  coercedValue = true;
                } else if (envValue.toLowerCase() === 'false') {
                  coercedValue = false;
                } else {
                  console.warn(
                    `[ConfigLoader] Env var '${envVarName}' ('${envValue}') mapped to '${configPath}' expected 'boolean' but is not valid. Keeping as string.`
                  );
                }
                break;
              // Add other type coercions if needed (e.g., array/object from JSON string)
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
 * Interpolates variables within a single string.
 * @private
 * @param {string} str - The string containing interpolation placeholders (e.g., "${variable}").
 * @param {Object} context - The context object providing values for variables.
 * @returns {string} The string with placeholders replaced by their values.
 */
function interpolateString(str, context) {
  // Regex to find ${variable} placeholders
  return str.replace(/\${([^}]+)}/g, (match, expression) => {
    try {
      // Get the value from the context using dot notation
      const value = getNestedValue(context, expression);
      // If value is undefined, keep the original placeholder; otherwise, convert to string
      return value !== undefined ? String(value) : match;
    } catch (error) {
      // If an error occurs during evaluation (e.g., invalid path), keep the original placeholder
      console.warn(
        `[ConfigLoader] Interpolation failed for expression '${expression}': ${error.message}. Keeping placeholder.`
      );
      return match;
    }
  });
}

/**
 * Recursively interpolates variables in an object (single pass).
 * This function is called repeatedly by `interpolateVariables` for multi-pass resolution.
 * @private
 * @param {*} obj - The object to interpolate.
 * @param {Object} context - The context containing variables for interpolation.
 * @returns {*} The interpolated object.
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
 * Interpolates variables in configuration.
 * Applies interpolation repeatedly until no more variables are resolved
 * or a maximum number of iterations is reached (to prevent infinite loops with circular refs).
 * @private
 * @param {Object} config - Configuration object.
 * @returns {Object} Interpolated configuration.
 */
function interpolateVariables(config) {
  let currentConfig = deepClone(config); // Start with a deep clone of the original config
  let changed = true;
  const maxIterations = 10; // Max passes to prevent infinite loops (e.g., circular references)
  let iterations = 0;

  let context = {
    ...currentConfig, // Initial context includes values from the config itself
    env: process.env, // Allows ${env.VAR_NAME}
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  while (changed && iterations < maxIterations) {
    changed = false;
    const oldConfigString = JSON.stringify(currentConfig); // Snapshot before this pass

    // Perform one pass of interpolation
    currentConfig = interpolateObject(currentConfig, context);

    // Update context with any values resolved in this pass for subsequent passes
    // This is crucial for resolving nested interpolations like ${A} where A contains ${B}
    Object.assign(context, currentConfig); // Update context for next iteration

    // Check if any values actually changed in this pass
    if (JSON.stringify(currentConfig) !== oldConfigString) {
      changed = true;
    }
    iterations++;
  }

  if (iterations === maxIterations && changed) {
    console.warn(
      '[ConfigLoader] Max interpolation iterations reached. Possible circular reference or complex nested interpolation unresolved.'
    );
  }

  return currentConfig;
}

// --- Main Module Functions ---

// Load .env files early upon module load
loadDotEnvFiles();

/**
 * Loads .env files for different environments.
 * This function should be called once when the module is loaded.
 * @private
 */
function loadDotEnvFiles() {
  dotenv.config(); // Load base .env
  const env = process.env.NODE_ENV || 'development';
  dotenv.config({ path: `.env.${env}`, override: true }); // Load env-specific
  dotenv.config({ path: '.env.local', override: true }); // Load local overrides

  // Cache all environment variables immediately after loading .env files
  envCache = { ...process.env };
}

/**
 * Loads configuration from file or object based on provided options.
 * This is the main entry point for loading configuration.
 * @param {string|Object} pathOrConfig - File path to load from, or an initial configuration object.
 * @param {Object} [options] - Configuration loading options.
 * @returns {Promise<Object>} The loaded and processed configuration object.
 * @throws {ConfigError} If configuration loading, parsing, or validation fails.
 */
export async function loadConfig(pathOrConfig, options = {}) {
  configOptions = {
    defaults: options.defaults || {},
    validate: options.validate !== false,
    schema: options.schema,
    env: options.env !== false,
    watch: options.watch || false,
    interpolate: options.interpolate !== false,
    map: options.map || {},
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

    // Call helper functions that are now correctly scoped
    config = mergeWithDefaults(config, configOptions.defaults);

    if (configOptions.env) {
      config = mergeWithEnv(config, configOptions.map, configOptions.schema);
    }

    if (configOptions.interpolate) {
      config = interpolateVariables(config);
    }

    if (configOptions.validate && configOptions.schema) {
      validateConfig(config, configOptions.schema);
    }

    configStore = config;

    if (configOptions.watch && typeof pathOrConfig === 'string') {
      watchConfigFile(pathOrConfig);
    }

    return config;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    // Catch generic errors and wrap them as ConfigError
    throw new ConfigError(
      `Failed to load configuration: ${error.message}`,
      'CONFIG_LOAD_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Loads configuration from a file.
 * @private
 * @param {string} filePath - The path to the configuration file.
 * @returns {Promise<Object>} The parsed configuration object.
 * @throws {ConfigError} If the file is not found, cannot be read, or is of an unsupported type.
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
        `Unsupported configuration file type: ${ext} for ${absolutePath}`,
        'UNSUPPORTED_FILE_TYPE'
      );
  }
}

/**
 * Parses JSON content.
 * @private
 * @param {string} content - The JSON string content.
 * @param {string} filePath - The path to the file (for error reporting).
 * @returns {Object} The parsed JSON object.
 * @throws {ConfigError} If JSON parsing fails.
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
 * Loads a JavaScript module.
 * @private
 * @param {string} filePath - The path to the JavaScript file.
 * @returns {Promise<Object>} The module's exports (default export preferred).
 * @throws {ConfigError} If loading the JavaScript module fails.
 */
async function loadJavaScript(filePath) {
  try {
    const fileUrl = pathToFileURL(filePath).href; // Convert to file URL for dynamic import
    const module = await import(fileUrl);
    return module.default || module;
  } catch (error) {
    throw new ConfigError(
      `Failed to load JavaScript configuration from ${filePath}: ${error.message}`,
      'JS_LOAD_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Watches configuration file for changes and triggers a reload.
 * @private
 * @param {string} filePath - The path to the configuration file to watch.
 */
function watchConfigFile(filePath) {
  let reloadTimeout;
  fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(async () => {
        try {
          await reloadConfig(filePath);
          console.log(`[ConfigLoader] Configuration reloaded from ${filePath}`);
        } catch (error) {
          console.error(
            `[ConfigLoader] Failed to reload configuration from ${filePath}:`,
            error.message
          );
        }
      }, 100);
    }
  });
}

/**
 * Sets the global configuration store.
 * @param {Object} config - The configuration object to set.
 * @throws {ConfigError} If the provided configuration is not a valid object.
 */
export function setConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new ConfigError(
      'Configuration must be an object',
      'INVALID_CONFIG_TYPE'
    );
  }
  configStore = deepClone(config); // Store a clone to prevent external modification
}

/**
 * Retrieves a configuration value by key using dot notation.
 * @param {string} [key] - The configuration key (e.g., 'server.port'). If not provided, returns the entire configuration.
 * @param {*} [defaultValue] - A default value to return if the key is not found.
 * @returns {*} The configuration value, or the `defaultValue` if the key is not found.
 */
export function getConfig(key, defaultValue) {
  if (!key) {
    return deepClone(configStore); // Return a clone to prevent external modification
  }
  const value = getNestedValue(configStore, key);
  return value !== undefined ? deepClone(value) : defaultValue; // Clone value if found
}

/**
 * Retrieves an environment variable value directly from the cache.
 * Note: This function returns the raw string value of the environment variable.
 * For type-coerced values, rely on `loadConfig` with `env: true` and a `schema`.
 * @param {string} key - The name of the environment variable.
 * @param {*} [defaultValue] - A default value to return if the environment variable is not defined.
 * @returns {string|*} The environment variable's string value, or `defaultValue` if not found.
 */
export function getEnv(key, defaultValue) {
  // Use cached value if available, otherwise read from process.env and cache
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
 * Reloads configuration from the last loaded file path, or a new specified path.
 * This will re-apply defaults, env vars, interpolation, and validation.
 * @param {string} [filePath] - Optional new file path to load from. If not provided, uses the last loaded path.
 * @returns {Promise<Object>} The reloaded configuration object.
 * @throws {ConfigError} If no file path is available or if reloading fails.
 */
export async function reloadConfig(filePath) {
  loadDotEnvFiles(); // Reload .env files to pick up any external changes
  const path = filePath || configOptions.lastPath;
  if (!path) {
    throw new ConfigError(
      'No configuration file path provided to reload from',
      'NO_CONFIG_PATH'
    );
  }
  return loadConfig(path, configOptions); // Reload using the current options
}

/**
 * Checks if a configuration key exists in the current configuration store.
 * @param {string} key - The configuration key to check (dot notation).
 * @returns {boolean} `true` if the key exists, `false` otherwise.
 */
export function hasConfig(key) {
  return getNestedValue(configStore, key) !== undefined;
}

/**
 * Clears all configuration data, options, and cached environment variables.
 * Useful for testing or completely resetting the module's state.
 */
export function clearConfig() {
  configStore = {};
  configOptions = {};
  envCache = {};
  // Schemas are handled by validator.js. A separate clearSchemas() function
  // would typically be called from the main index.js clearConfig to reset schemas.
}
