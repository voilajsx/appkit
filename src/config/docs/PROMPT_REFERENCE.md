# @voilajsx/appkit/config - LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

- ESM imports, single quotes, 2-space indentation, semicolons
- Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

```javascript
/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {ReturnType} Return value description
 * @throws {Error} Error conditions
 */
```

3.  **Error Handling**:

<!-- end list -->

- Use try/catch blocks for async functions
- Check parameters before using them
- Throw descriptive ConfigError instances with appropriate error codes

<!-- end list -->

4.  **Framework Agnostic**:

<!-- end list -->

- Code should work with any Node.js framework
- Avoid framework-specific dependencies

## Function Signatures

### 1\. `loadConfig`

```typescript
async function loadConfig(
  pathOrConfig: string | Record<string, any>,
  options?: {
    defaults?: Record<string, any>;
    validate?: boolean;
    schema?: string | Record<string, any>; // Used for automatic type coercion
    env?: boolean; // Enables environment variable processing and type coercion
    watch?: boolean;
    interpolate?: boolean;
  }
): Promise<Record<string, any>>;
```

- **Important Behavior:** When `options.env` is `true` and `options.schema` is
  provided, `loadConfig` will automatically attempt to coerce string values from
  `process.env` into `number` or `boolean` types based on the `schema`
  definition. For example, if `schema.properties.server.port` is
  `type: 'number'`, and `process.env.PORT` is `"3000"`, `config.server.port`
  will be the JavaScript number `3000`. Similarly, `"true"` and `"false"`
  (case-insensitive) will be coerced to `true` and `false` booleans.
- Default `options`: `{}`
- Default `options.defaults`: `{}`
- Default `options.validate`: `true`
- Default `options.env`: `true`
- Default `options.watch`: `false`
- Default `options.interpolate`: `true`
- Throws: Various `ConfigError` types with different codes

### 2\. `setConfig`

```typescript
function setConfig(config: Record<string, any>): void;
```

- Throws: `ConfigError` with code `'INVALID_CONFIG_TYPE'` if config is not an
  object

### 3\. `getConfig`

```typescript
function getConfig(key?: string, defaultValue?: any): any;
```

- Returns entire config object if no key is provided
- Returns nested value if key uses dot notation (e.g., `'server.port'`)
- Returns `defaultValue` if the key is not found
- **Note:** Values returned by `getConfig` will already be type-coerced if
  `loadConfig` was used with `env: true` and a schema.

### 4\. `getEnv`

```typescript
function getEnv(key: string, defaultValue?: any): string | undefined;
```

- Returns the environment variable value from cache or process.env.
- **Important:** `getEnv` _always_ returns the raw string value of the
  environment variable. Use `loadConfig` with `env: true` and a `schema` to get
  type-coerced values into your application config.
- Returns `defaultValue` if the environment variable is not defined

### 5\. `reloadConfig`

```typescript
async function reloadConfig(filePath?: string): Promise<Record<string, any>>;
```

- If `filePath` is not provided, uses the last loaded file path
- Throws: `ConfigError` with code `'NO_CONFIG_PATH'` if no path is available

### 6\. `hasConfig`

```typescript
function hasConfig(key: string): boolean;
```

- Returns `true` if the key exists in the configuration, `false` otherwise

### 7\. `clearConfig`

```typescript
function clearConfig(): void;
```

- Clears all configuration data and options

### 8\. `validateConfig`

```typescript
function validateConfig(
  config: Record<string, any>,
  schema: Record<string, any> | string
): boolean;
```

- Validates configuration against schema
- Returns `true` if valid
- Throws: `ConfigError` with code `'VALIDATION_ERROR'` and errors list in
  details

### 9\. `defineSchema`

```typescript
function defineSchema(name: string, schema: Record<string, any>): void;
```

- Throws: `ConfigError` with code `'SCHEMA_EXISTS'` if schema name is already
  defined

### 10\. `getConfigSchema`

```typescript
function getConfigSchema(name: string): Record<string, any>;
```

- Throws: `ConfigError` with code `'SCHEMA_NOT_FOUND'` if schema name is not
  found

### 11\. `ConfigError`

```typescript
class ConfigError extends Error {
  constructor(message: string, code?: string, details?: Record<string, any>);
}
```

- Default `code`: `'CONFIG_ERROR'`
- Default `details`: `{}`

## Example Implementations

### Basic Configuration Setup

```javascript
/**
 * Loads application configuration
 * @param {string} env - Environment name (development, staging, production)
 * @returns {Promise<Object>} Configuration object
 * @throws {ConfigError} If configuration loading fails
 */
async function loadAppConfig(env) {
  // Assume configSchema and envMap are defined elsewhere (e.g., app.config.js)
  // import { configSchema, envMap } from './app.config.js';

  try {
    // Choose the right config file based on environment
    const configPath = `./config/${env}.json`; // Optional: can pass {} to load from defaults/env only

    // Define defaults
    const defaults = {
      server: {
        host: 'localhost',
        port: 3000,
      },
      logging: {
        level: 'info',
        format: 'json',
      },
      features: {
        welcomeMessage: true, // Ensure defaults are set if not from env
      },
    };

    // Load configuration, utilizing automatic type coercion for environment variables
    const config = await loadConfig(configPath, {
      defaults,
      validate: true,
      schema: configSchema, // The schema guides type coercion for env vars
      env: true, // Enables environment variable mapping and coercion
      map: envMap, // Maps env var names to config paths
      watch: env === 'development',
    });

    console.log(`Configuration loaded for ${env} environment`);
    // Example: if PORT=8080 and schema.server.port is number, config.server.port will be number 8080
    console.log(
      `Server port: ${config.server.port} (type: ${typeof config.server.port})`
    );
    console.log(
      `Welcome feature enabled: ${config.features.welcomeMessage} (type: ${typeof config.features.welcomeMessage})`
    );

    return config;
  } catch (error) {
    console.error(`Failed to load ${env} configuration:`, error.message);
    if (error.code === 'VALIDATION_ERROR' && error.details?.errors) {
      error.details.errors.forEach((err) => {
        console.error(`- ${err.path}: ${err.message}`);
      });
    }
    throw error;
  }
}
```

### Configuration Schema Definition

```javascript
/**
 * Defines application schemas
 * @returns {void}
 */
function defineAppSchemas() {
  // Define server schema
  defineSchema('server', {
    type: 'object',
    required: ['port'],
    properties: {
      host: {
        type: 'string',
        default: 'localhost',
      },
      port: {
        type: 'number', // LLM: Note the 'number' type
        minimum: 1,
        maximum: 65535,
      },
      ssl: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: false }, // LLM: Note the 'boolean' type
          key: { type: 'string' },
          cert: { type: 'string' },
        },
      },
    },
  });

  // Define database schema
  defineSchema('database', {
    type: 'object',
    required: ['url'],
    properties: {
      url: {
        type: 'string',
        pattern: '^(postgres|mysql|mongodb)://',
      },
      pool: {
        type: 'object',
        properties: {
          min: { type: 'number', minimum: 0, default: 2 },
          max: { type: 'number', minimum: 1, default: 10 },
        },
      },
    },
  });

  // Define application schema
  defineSchema('app', {
    type: 'object',
    required: ['server', 'database'],
    properties: {
      name: { type: 'string' },
      version: { type: 'string' },
      environment: {
        type: 'string',
        enum: ['development', 'staging', 'production'],
        default: 'development',
      },
      server: { $ref: 'server' },
      database: { $ref: 'database' },
      features: {
        type: 'object',
        // LLM: If env vars like FEATURE_X are mapped to features.X, define their types here
        // If FEATURE_WELCOME="true", it will be coerced to boolean true
        patternProperties: {
          '^feature_.*$': { type: 'boolean' },
        },
        additionalProperties: { type: 'boolean' },
      },
    },
  });
}
```

### Configuration Access and Updates

```javascript
/**
 * Provides configuration access utilities
 * @param {Object} initialConfig - Initial configuration object
 * @returns {Object} Configuration utilities
 */
function createConfigManager(initialConfig) {
  // Set initial configuration
  setConfig(initialConfig);

  return {
    /**
     * Gets a configuration value
     * @param {string} key - Configuration key (dot notation)
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Configuration value (will be type-coerced if loaded via env/schema)
     */
    get(key, defaultValue) {
      return getConfig(key, defaultValue);
    },

    /**
     * Checks if configuration has a value
     * @param {string} key - Configuration key to check
     * @returns {boolean} True if exists
     */
    has(key) {
      return hasConfig(key);
    },

    /**
     * Gets the entire configuration object
     * @returns {Object} Complete configuration
     */
    getAll() {
      return getConfig();
    },

    /**
     * Updates configuration and validates against schema
     * @param {Object} newConfig - Configuration updates
     * @param {string} [schemaName] - Schema to validate against
     * @returns {Object} Updated configuration
     * @throws {ConfigError} If validation fails
     */
    update(newConfig, schemaName) {
      try {
        // Get current config
        const currentConfig = getConfig();

        // Merge with new config
        const mergedConfig = deepMerge(currentConfig, newConfig);

        // Validate if schema provided
        if (schemaName) {
          validateConfig(mergedConfig, schemaName);
        }

        // Update config store
        setConfig(mergedConfig);

        return mergedConfig;
      } catch (error) {
        console.error('Failed to update configuration:', error.message);
        throw error;
      }
    },

    /**
     * Reloads configuration from file
     * @param {string} [filePath] - Configuration file path
     * @returns {Promise<Object>} Reloaded configuration
     */
    async reload(filePath) {
      try {
        const config = await reloadConfig(filePath);
        console.log('Configuration reloaded successfully');
        return config;
      } catch (error) {
        console.error('Failed to reload configuration:', error.message);
        throw error;
      }
    },
  };
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
```

### Complete Express App Integration

```javascript
/**
 * Initializes application with configuration
 * @param {string} [env] - Environment name
 * @returns {Promise<Object>} Express app and config
 */
async function initializeApp(env = process.env.NODE_ENV || 'development') {
  // Define schemas
  defineAppSchemas();

  // Load configuration (will automatically coerce env vars based on schema)
  const config = await loadAppConfig(env); // Uses the loadAppConfig from "Basic Configuration Setup"

  // Create Express app
  const express = await import('express');
  const app = express.default();

  // Middleware to add config to req
  app.use((req, res, next) => {
    req.config = {
      get: (key, defaultValue) => getConfig(key, defaultValue),
    };
    next();
  });

  // Define routes
  app.get('/', (req, res) => {
    res.json({
      message: 'Config server running',
      env: env,
      // Accessing config.server.port directly, it's already a number
      port: config.server.port,
    });
  });

  app.get('/config', (req, res) => {
    // Only return safe configuration (omit secrets)
    const safeConfig = {
      server: getConfig('server'),
      logging: getConfig('logging'),
      features: getConfig('features'), // Will contain coerced boolean values
    };

    res.json(safeConfig);
  });

  // Start server
  const port = getConfig('server.port');
  const host = getConfig('server.host');

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log(`File logging enabled: ${config.logging.enableFileLogging}`); // Will be boolean
  });

  return app;
}
```

## Code Generation Rules

1.  **Always use async/await** for file operations and loading
2.  **Include error handling** with specific error codes
3.  **Always enable `env: true` and provide `map` and `schema`** when loading
    config that relies on environment variables, to ensure automatic type
    coercion.
4.  **Do NOT implement manual type coercion** (e.g., `parseInt`,
    `value.toLowerCase() === 'true'`) for values retrieved via `getConfig` if
    `loadConfig` was used with a schema. These values will already be correctly
    typed.
5.  **Follow JSDoc format** exactly as shown
6.  **Check for null/undefined** before operations
7.  **Use ConfigError** for all configuration-related errors
8.  **Support dot notation** for accessing nested configuration
9.  **Include validation** where data integrity is important

---

\<p align="center"\> Built with ❤️ in India by the \<a
href="https://github.com/orgs/voilajsx/people"\>VoilaJS Team\</a\> — powering
modern web development. \</p\>

```

```
