# @voilajsx/config/appkit - LLM Prompt Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - Use ESM imports, single quotes, 2-space indentation, and semicolons.
   - Include JSDoc comments for all functions.

2. **JSDoc Format** (required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {Type} Description of return value
    * @throws {Error} Conditions under which errors are thrown
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions.
   - Validate parameters before use.
   - Throw standard `Error` objects with clear messages.

4. **Framework Agnostic**:
   - Ensure code works with any Node.js framework.
   - Avoid framework-specific dependencies unless explicitly requested.

## Function Signatures

### 1. `loadConfig`

```typescript
async function loadConfig(
  source: string | Record<string, any>,
  options?: {
    defaults?: Record<string, any>;
    validate?: boolean;
    schema?: string;
    env?: boolean;
  }
): Promise<Record<string, any>>;
```

- **Behavior**: Loads configuration from a file or object. When `options.env` is
  `true` and `options.schema` is provided, coerces environment variable strings
  to schema-defined types (e.g., `number`, `boolean`). For example, if `schema`
  defines `server.port` as `type: 'number'` and `process.env.SERVER_PORT` is
  `'3000'`, `config.server.port` will be the number `3000`.
- **Defaults**:
  - `options`: `{}`
  - `options.defaults`: `{}`
  - `options.validate`: `true`
  - `options.env`: `true`
- **Throws**: `Error` for file not found, invalid JSON, validation failures, or
  other loading issues.

### 2. `getConfig`

```typescript
function getConfig(path?: string, fallback?: any): any;
```

- Returns the entire configuration object if no `path` is provided.
- Uses dot notation for nested paths (e.g., `'server.port'`).
- Returns `fallback` if the path is not found.
- **Note**: Values are type-coerced if loaded with `env: true` and a schema.

### 3. `hasConfig`

```typescript
function hasConfig(path: string): boolean;
```

- Returns `true` if the configuration path exists, `false` otherwise.

### 4. `createConfigSchema`

```typescript
function createConfigSchema(name: string, schema: Record<string, any>): void;
```

- Defines a named schema for validation and type coercion.
- **Throws**: `Error` if the schema name is already defined.

### 5. `validateConfigSchema`

```typescript
function validateConfigSchema(
  config: Record<string, any>,
  schemaName: string
): boolean;
```

- Validates a configuration object against a named schema.
- Returns `true` if valid.
- **Throws**: `Error` for invalid configurations or missing schemas.

## Example Implementations

### Basic Configuration Setup

```javascript
/**
 * Loads application configuration
 * @param {string} env - Environment name (e.g., 'development', 'production')
 * @returns {Promise<Object>} Configuration object
 * @throws {Error} If configuration loading fails
 */
async function loadAppConfig(env) {
  try {
    const { loadConfig, createConfigSchema } = await import(
      '@voilajsx/appkit/config'
    );
    const dotenv = await import('dotenv');

    // Load .env file
    dotenv.config({ path: `.env.${env}` });

    // Define schema
    createConfigSchema('app', {
      type: 'object',
      required: ['server'],
      properties: {
        server: {
          type: 'object',
          properties: {
            port: { type: 'number', default: 3000 },
            host: { type: 'string', default: 'localhost' },
          },
        },
        database: {
          type: 'object',
          properties: {
            url: { type: 'string' },
          },
        },
      },
    });

    // Load configuration
    const config = await loadConfig(null, {
      defaults: { server: { port: 3000 } },
      validate: true,
      schema: 'app',
      env: true,
    });

    console.log(`Configuration loaded for ${env}`);
    console.log(
      `Server port: ${config.server.port} (type: ${typeof config.server.port})`
    );

    return config;
  } catch (error) {
    console.error(`Failed to load ${env} configuration: ${error.message}`);
    throw error;
  }
}
```

### Configuration Schema Definition

```javascript
/**
 * Defines application schemas
 * @returns {void}
 * @throws {Error} If schema definition fails
 */
async function defineAppSchemas() {
  const { createConfigSchema } = await import('@voilajsx/appkit/config');

  // Define server schema
  createConfigSchema('server', {
    type: 'object',
    required: ['port'],
    properties: {
      port: { type: 'number', minimum: 1024, maximum: 65535 },
      host: { type: 'string', default: 'localhost' },
    },
  });

  // Define application schema
  createConfigSchema('app', {
    type: 'object',
    required: ['server'],
    properties: {
      server: { $ref: 'server' },
      database: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
      },
    },
  });
}
```

### Configuration Access

```javascript
/**
 * Provides configuration access utilities
 * @returns {Object} Configuration utilities
 */
async function createConfigManager() {
  const { getConfig, hasConfig } = await import('@voilajsx/appkit/config');

  return {
    /**
     * Gets a configuration value
     * @param {string} path - Configuration path (dot notation)
     * @param {*} fallback - Fallback value if not found
     * @returns {*} Configuration value
     */
    get(path, fallback) {
      return getConfig(path, fallback);
    },

    /**
     * Checks if a configuration path exists
     * @param {string} path - Configuration path
     * @returns {boolean} True if path exists
     */
    has(path) {
      return hasConfig(path);
    },

    /**
     * Gets the entire configuration
     * @returns {Object} Complete configuration
     */
    getAll() {
      return getConfig();
    },
  };
}
```

### Complete Express App Integration

```javascript
/**
 * Initializes Express app with configuration
 * @param {string} [env] - Environment name
 * @returns {Promise<Object>} Express app
 * @throws {Error} If initialization fails
 */
async function initializeApp(env = process.env.NODE_ENV || 'development') {
  try {
    // Load configuration
    const config = await loadAppConfig(env);

    // Create Express app
    const express = await import('express');
    const app = express.default();

    // Define routes
    app.get('/', (req, res) => {
      res.json({
        message: 'Config server running',
        env,
        port: config.server.port,
      });
    });

    // Start server
    const port = config.server.port;
    const host = config.server.host;

    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });

    return app;
  } catch (error) {
    console.error('Failed to initialize app:', error.message);
    throw error;
  }
}
```

## Code Generation Rules

1. **Use async/await** for file operations and configuration loading.
2. **Include error handling** with try/catch and descriptive `Error` messages.
3. **Enable `env: true` and provide `schema`** when loading configurations with
   environment variables to ensure type coercion.
4. **Avoid manual type coercion** (e.g., `parseInt`, `value === 'true'`) for
   values from `getConfig` when `loadConfig` uses a schema; values are already
   coerced.
5. **Follow JSDoc format** exactly as shown.
6. **Check for null/undefined** before operations.
7. **Support dot notation** for nested configuration access.
8. **Include schema validation** for data integrity.
9. **Use `dotenv`** to load `.env` files before calling `loadConfig`.

---

<p align="center"> Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development. </p>
