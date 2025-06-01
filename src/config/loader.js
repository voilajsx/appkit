/**
 * @voilajsx/appkit - Configuration loader
 * @module @voilajsx/appkit/config/loader
 * @file src/config/loader.js
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { validateConfigSchema } from './validator.js';

// Configuration store - Global for the module's lifecycle
let configStore = {};

// Add this line - schemas variable
let schemas = null;

// --- Helper Functions ---

/**
 * Gets a nested value from an object using a dot-notation path.
 * @private
 * @param {Object} obj - The object to traverse.
 * @param {string} path - The dot-notation path (e.g., 'server.port').
 * @returns {*} The value at the specified path, or `undefined` if not found.
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
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
    // Fix: Check if current[key] exists and is not an object, or if it's null/undefined
    if (
      current[key] === undefined ||
      current[key] === null ||
      typeof current[key] !== 'object'
    ) {
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
 * Deep clones an object to avoid side effects.
 * @private
 * @param {*} obj - The object to clone.
 * @returns {*} A deep clone of the object.
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
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
  return deepMerge(defaults || {}, config);
}

/**
 * Gets a nested schema property definition.
 * @private
 * @param {Object} currentSchema - The current schema object.
 * @param {string} path - The dot-notation path.
 * @returns {Object|undefined} The schema definition or undefined.
 */
function getNestedSchemaProperty(currentSchema, path) {
  const keys = path.split('.');
  let tempSchema = currentSchema;

  for (const key of keys) {
    if (tempSchema && tempSchema.properties && tempSchema.properties[key]) {
      tempSchema = tempSchema.properties[key];
    } else if (tempSchema && tempSchema.$ref) {
      // $ref handling is done in validator.js
      return undefined;
    } else {
      return undefined;
    }
  }
  return tempSchema;
}

// Update your existing mergeWithEnv function - just change the parameter name and add schema lookup
function mergeWithEnv(config, schemaName) {
  const result = deepClone(config);

  // Get the actual schema object from the schema name
  let schema = null;
  if (schemaName && schemas) {
    schema = schemas.get(schemaName);
  }

  // Common system environment variables to ignore
  const ignoredEnvVars = new Set([
    'PATH',
    'HOME',
    'USER',
    'SHELL',
    'TERM',
    'PWD',
    'OLDPWD',
    'SHLVL',
    'TMPDIR',
    'LANG',
    'LC_ALL',
    'COLORTERM',
    'LOGNAME',
    'SSH_AUTH_SOCK',
    'XPC_SERVICE_NAME',
    'HOMEBREW_PREFIX',
    'INFOPATH',
    'MANPATH',
    'NVM_DIR',
    'NVM_BIN',
    'NVM_INC',
    'GIT_EXEC_PATH',
    'VSCODE_GIT_ASKPASS_NODE',
    'VSCODE_GIT_ASKPASS_EXTRA_ARGS',
    'VSCODE_GIT_ASKPASS_MAIN',
    'VSCODE_GIT_IPC_HANDLE',
    'VSCODE_INJECTION',
    'TERM_PROGRAM',
    'TERM_PROGRAM_VERSION',
    'ORIGINAL_XDG_CURRENT_DESKTOP',
    'ZDOTDIR',
    'HERD_PHP_81_INI_SCAN_DIR',
    'MALLOCNANOZONE',
  ]);

  // Map environment variables to config paths (e.g., SERVER_PORT → server.port)
  for (const [envKey, value] of Object.entries(process.env)) {
    if (value === undefined || value === null) continue;

    // Skip system environment variables
    if (ignoredEnvVars.has(envKey)) continue;

    // Skip variables that don't look like config variables
    // (contain special characters, are too short, etc.)
    if (envKey.length < 3 || envKey.includes('.') || envKey.includes('/'))
      continue;

    // Convert env key to dot-notation (e.g., SERVER_PORT → server.port)
    const configPath = envKey
      .toLowerCase()
      .replace(/_/g, '.')
      .replace(/([a-z])([A-Z])/g, '$1.$2');

    let coercedValue = value;

    // Type coercion based on schema
    if (schema) {
      const schemaProp = getNestedSchemaProperty(schema, configPath);
      if (schemaProp && schemaProp.type) {
        const expectedType = Array.isArray(schemaProp.type)
          ? schemaProp.type[0]
          : schemaProp.type;
        switch (expectedType) {
          case 'number':
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && isFinite(numValue)) {
              coercedValue = numValue;
            }
            break;
          case 'boolean':
            if (value.toLowerCase() === 'true') coercedValue = true;
            else if (value.toLowerCase() === 'false') coercedValue = false;
            break;
        }
      }
    }

    // Only set if the path doesn't conflict with existing object structure
    try {
      setNestedValue(result, configPath, coercedValue);
    } catch (error) {
      // Skip conflicting environment variables
      console.warn(
        `Warning: Skipping environment variable ${envKey} due to path conflict`
      );
    }
  }
  return result;
}

// --- Main Module Functions ---

/**
 * Loads configuration from file or object.
 * @param {string|Object} source - File path or config object.
 * @param {Object} [options] - Loading options.
 * @param {Object} [options.defaults] - Default configuration values.
 * @param {boolean} [options.validate=true] - Whether to validate the config.
 * @param {string} [options.schema] - Name of the schema to validate against.
 * @param {boolean} [options.env=true] - Whether to merge environment variables.
 * @returns {Promise<Object>} The loaded configuration.
 * @throws {Error} If loading or validation fails.
 */
export async function loadConfig(source, options = {}) {
  // Import schemas from validator if not already imported
  if (!schemas) {
    const validatorModule = await import('./validator.js');
    schemas = validatorModule.getSchemas();
  }

  const configOptions = {
    defaults: options.defaults || {},
    validate: options.validate !== false,
    schema: options.schema,
    env: options.hasOwnProperty('env') ? options.env : true,
  };

  try {
    let config;

    if (typeof source === 'string') {
      config = await loadFromFile(source);
    } else if (typeof source === 'object' && source !== null) {
      config = source;
    } else {
      throw new Error('Configuration must be a file path or object');
    }

    config = mergeWithDefaults(config, configOptions.defaults);

    // Only merge environment variables if explicitly enabled
    if (configOptions.env === true) {
      config = mergeWithEnv(config, configOptions.schema);
    }

    if (configOptions.validate && configOptions.schema) {
      validateConfigSchema(config, configOptions.schema);
    }

    // Reset the config store completely to avoid conflicts
    configStore = deepClone(config);
    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

/**
 * Loads configuration from a file.
 * @private
 * @param {string} filePath - Path to the configuration file.
 * @returns {Promise<Object>} The parsed configuration.
 * @throws {Error} If file operations fail.
 */
async function loadFromFile(filePath) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Configuration file not found: ${absolutePath}`);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  let content;

  try {
    content = await fs.promises.readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read configuration file: ${error.message}`);
  }

  switch (ext) {
    case '.json':
      try {
        return JSON.parse(content);
      } catch (error) {
        throw new Error(`Invalid JSON in configuration file: ${absolutePath}`);
      }
    case '.js':
    case '.mjs':
      try {
        const fileUrl = pathToFileURL(absolutePath).href;
        const module = await import(fileUrl);
        return module.default || module;
      } catch (error) {
        throw new Error(
          `Failed to load JavaScript configuration: ${error.message}`
        );
      }
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Retrieves a configuration value by key.
 * @param {string} [path] - The dot-notation path. If omitted, returns entire config.
 * @param {*} [fallback] - Value to return if path is not found.
 * @returns {*} The configuration value or fallback.
 */
export function getConfig(path, fallback) {
  if (!path) {
    return deepClone(configStore);
  }
  const value = getNestedValue(configStore, path);
  return value !== undefined ? deepClone(value) : fallback;
}

/**
 * Checks if a configuration path exists.
 * @param {string} path - The dot-notation path.
 * @returns {boolean} True if the path exists.
 */
export function hasConfig(path) {
  return getNestedValue(configStore, path) !== undefined;
}
