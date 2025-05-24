
# Configuration Module API Reference

## Overview

The `@voilajsx/appkit/config` module provides robust configuration management for
Node.js applications, including configuration loading from multiple sources,
validation, environment variable integration, and real-time configuration
updates.

## Installation

```bash
npm install @voilajsx/appkit
````

## Quick Start

```javascript
import {
  loadConfig,
  getConfig,
  validateConfig,
  defineSchema,
  getEnv,
} from '@voilajsx/appkit/config';

// Load configuration
const config = await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  schema: 'app',
});

// Access configuration values
const port = getConfig('server.port');
const apiKey = getConfig('api.key');
```

## API Reference

### Configuration Loading

#### loadConfig(pathOrConfig, options)

Loads configuration from a file path or object.

##### Parameters

| Name                  | Type             | Required | Default | Description                                                |
| --------------------- | ---------------- | -------- | ------- | ---------------------------------------------------------- |
| `pathOrConfig`        | `string\|Object` | Yes      | -       | File path or configuration object                          |
| `options`             | `Object`         | No       | `{}`    | Configuration options                                      |
| `options.defaults`    | `Object`         | No       | `{}`    | Default values to merge with loaded configuration          |
| `options.validate`    | `boolean`        | No       | `true`  | Whether to validate configuration                          |
| `options.schema`      | `string\|Object` | No       | -       | Schema name or schema object for validation                |
| `options.env`         | `boolean`        | No       | `true`  | Whether to integrate with environment variables            |
| `options.watch`       | `boolean`        | No       | `false` | Whether to watch for file changes and reload automatically |
| `options.interpolate` | `boolean`        | No       | `true`  | Whether to interpolate variables like `${var}`             |

##### Returns

  - `Promise<Object>` - The loaded configuration object

##### Throws

  - `ConfigError` - If configuration file not found
  - `ConfigError` - If JSON parsing fails
  - `ConfigError` - If required fields are missing
  - `ConfigError` - If validation fails
  - `ConfigError` - For other loading errors

##### Example

```javascript
// Load JSON configuration
const config = await loadConfig('./config.json', {
  defaults: {
    server: {
      port: 3000,
      host: 'localhost',
    },
  },
  watch: true,
});

// Load from JavaScript module
const config = await loadConfig('./config.js');

// Load from object
const config = await loadConfig({
  server: { port: 4000 },
  database: { url: 'mongodb://localhost:27017/myapp' },
});
```

-----

#### setConfig(config)

Sets the configuration store directly.

##### Parameters

| Name     | Type     | Required | Description                   |
| -------- | -------- | -------- | ----------------------------- |
| `config` | `Object` | Yes      | Configuration object to store |

##### Throws

  - `ConfigError` - If `config` is not an object

##### Example

```javascript
setConfig({
  server: { port: 3000 },
  database: { url: 'mongodb://localhost/myapp' },
});
```

-----

#### getConfig(key, defaultValue)

Gets a configuration value by key using dot notation.

##### Parameters

| Name           | Type     | Required | Default | Description                                  |
| -------------- | -------- | -------- | ------- | -------------------------------------------- |
| `key`          | `string` | No       | -       | Configuration key using dot notation         |
| `defaultValue` | `any`    | No       | -       | Default value if key not found in the config |

##### Returns

  - If `key` is provided: The value at that path, or `defaultValue` if not found
  - If no `key` is provided: The entire configuration object

##### Example

```javascript
// Get a specific value
const port = getConfig('server.port', 3000);

// Get a nested object
const database = getConfig('database');

// Get the entire config
const allConfig = getConfig();
```

-----

#### getEnv(key, defaultValue)

Gets an environment variable value.

##### Parameters

| Name           | Type     | Required | Default | Description                              |
| -------------- | -------- | -------- | ------- | ---------------------------------------- |
| `key`          | `string` | Yes      | -       | Environment variable name                |
| `defaultValue` | `any`    | No       | -       | Default value if variable is not defined |

##### Returns

  - `string` - The environment variable value, or `defaultValue` if not defined

##### Example

```javascript
// Get NODE_ENV or use 'development' as default
const environment = getEnv('NODE_ENV', 'development');

// Get database URL with no default
const dbUrl = getEnv('DATABASE_URL');
```

-----

#### reloadConfig(filePath)

Reloads configuration from the specified file or the last loaded file.

##### Parameters

| Name       | Type     | Required | Default | Description                            |
| ---------- | -------- | -------- | ------- | -------------------------------------- |
| `filePath` | `string` | No       | -       | Configuration file path to reload from |

##### Returns

  - `Promise<Object>` - The reloaded configuration object

##### Throws

  - `ConfigError` - If no file path is provided and no previous path exists
  - `ConfigError` - If file not found or other loading errors occur

##### Example

```javascript
try {
  // Reload from the same file that was last loaded
  const config = await reloadConfig();
  console.log('Configuration reloaded successfully');
} catch (error) {
  console.error('Failed to reload config:', error.message);
}
```

-----

#### hasConfig(key)

Checks if a configuration key exists.

##### Parameters

| Name  | Type     | Required | Description                          |
| ----- | -------- | -------- | ------------------------------------ |
| `key` | `string` | Yes      | Configuration key using dot notation |

##### Returns

  - `boolean` - `true` if the key exists, `false` otherwise

##### Example

```javascript
// Check if a configuration key exists
if (hasConfig('database.ssl')) {
  console.log('SSL configuration is defined');
}
```

-----

#### clearConfig()

Clears all configuration data and options.

##### Example

```javascript
// Clear all configuration
clearConfig();
```

-----

### Configuration Validation

#### validateConfig(config, schema)

Validates a configuration object against a schema.

##### Parameters

| Name     | Type             | Required | Description                                |
| -------- | ---------------- | -------- | ------------------------------------------ |
| `config` | `Object`         | Yes      | Configuration object to validate           |
| `schema` | `Object\|string` | Yes      | Schema object or name of predefined schema |

##### Returns

  - `boolean` - `true` if configuration is valid

##### Throws

  - `ConfigError` - If validation fails, with details in the error object

##### Example

```javascript
// Validate against a schema object
try {
  validateConfig(config, {
    type: 'object',
    required: ['server.port'],
    properties: {
      server: {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            minimum: 1024,
            maximum: 65535,
          },
        },
      },
    },
  });
  console.log('Configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.details.errors);
}

// Validate against a predefined schema
try {
  validateConfig(config, 'app');
  console.log('App configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.details.errors);
}
```

-----

#### defineSchema(name, schema)

Defines a named schema for later use.

##### Parameters

| Name     | Type     | Required | Description                  |
| -------- | -------- | -------- | ---------------------------- |
| `name`   | `string` | Yes      | Name to assign to the schema |
| `schema` | `Object` | Yes      | Schema definition object     |

##### Throws

  - `ConfigError` - If a schema with the given name already exists

##### Example

```javascript
// Define a server schema
defineSchema('server', {
  type: 'object',
  required: ['port'],
  properties: {
    host: { type: 'string', default: 'localhost' },
    port: { type: 'number', minimum: 1, maximum: 65535 },
  },
});

// Define an app schema that references the server schema
defineSchema('app', {
  type: 'object',
  required: ['server'],
  properties: {
    name: { type: 'string' },
    version: { type: 'string' },
    server: { $ref: 'server' },
  },
});
```

-----

#### getConfigSchema(name)

Retrieves a previously defined schema.

##### Parameters

| Name   | Type     | Required | Description               |
| ------ | -------- | -------- | ------------------------- |
| `name` | `string` | Yes      | Name of the schema to get |

##### Returns

  - `Object` - The schema definition

##### Throws

  - `ConfigError` - If no schema with the given name exists

##### Example

```javascript
// Get a predefined schema
const serverSchema = getConfigSchema('server');
console.log(serverSchema);
```

-----

### Error Handling

#### ConfigError

Custom error class for configuration-related errors.

##### Properties

| Name      | Type     | Description                        |
| --------- | -------- | ---------------------------------- |
| `name`    | `string` | Always set to `'ConfigError'`      |
| `message` | `string` | Human-readable error message       |
| `code`    | `string` | Error code identifying error type  |
| `details` | `Object` | Additional details about the error |

##### Example

```javascript
try {
  await loadConfig('./nonexistent.json');
} catch (error) {
  if (error.name === 'ConfigError') {
    console.error(`Configuration error (${error.code}): ${error.message}`);
    if (error.details && error.details.errors) {
      // Print validation errors
      error.details.errors.forEach((err) => {
        console.error(`- ${err.path}: ${err.message}`);
      });
    }
  }
}
```

## Error Handling

All functions in this module throw errors with descriptive messages. It's
recommended to wrap calls in try-catch blocks:

```javascript
try {
  const config = await loadConfig('./config.json');
} catch (error) {
  console.error('Configuration loading failed:', error.message);
  // Handle specific error types
  if (error.code === 'FILE_NOT_FOUND') {
    // Handle file not found
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    console.error('Validation errors:', error.details.errors);
  }
}
```

### Common Error Codes

| Function          | Error Code                | Cause                              |
| ----------------- | ------------------------- | ---------------------------------- |
| `loadConfig`      | `FILE_NOT_FOUND`          | Configuration file does not exist  |
| `loadConfig`      | `JSON_PARSE_ERROR`        | Invalid JSON in configuration file |
| `loadConfig`      | `MISSING_REQUIRED_FIELDS` | Required fields missing            |
| `validateConfig`  | `VALIDATION_ERROR`        | Schema validation failed           |
| `defineSchema`    | `SCHEMA_EXISTS`           | Schema name already in use         |
| `getConfigSchema` | `SCHEMA_NOT_FOUND`        | Referenced schema does not exist   |
| `setConfig`       | `INVALID_CONFIG_TYPE`     | Configuration is not an object     |
| `reloadConfig`    | `NO_CONFIG_PATH`          | No file path specified for reload  |

## Security Considerations

1.  **Secret Management**: Never store sensitive information like API keys or
       database credentials directly in configuration files that might be committed
       to version control
2.  **Environment Variables**: Use environment variables for sensitive
       configuration in production
3.  **Validation**: Always validate configuration to prevent unexpected runtime
       errors
4.  **File Permissions**: Set appropriate file permissions for configuration
       files containing sensitive information
5.  **Schema References**: Be cautious with circular schema references that might
       cause stack overflows
6.  **Interpolation**: Be aware that interpolation could potentially expose
       sensitive values in logs or error messages

## TypeScript Support

While this module is written in JavaScript, it includes JSDoc comments for
better IDE support. For TypeScript projects, you can create declaration files or
use JSDoc type annotations.

```typescript
// Example type declarations
interface ConfigOptions {
  defaults?: Record<string, any>;
  schema?: string | Record<string, any>;
  validate?: boolean;
  env?: boolean;
  watch?: boolean;
  interpolate?: boolean;
}

interface SchemaDefinition {
  type: string | string[];
  required?: string[];
  properties?: Record<string, SchemaDefinition>;
  // ... other schema properties
}
```

## Performance Tips

1.  **Caching**: The module internally caches environment variables to avoid
       repeated lookups
2.  **File Watching**: Only enable `watch` option when needed, as it consumes
       resources
3.  **Schema Complexity**: Complex schemas with deep nesting can impact
       validation performance
4.  **Interpolation**: Disable interpolation for large configurations if not
       needed
5.  **Predefined Schemas**: Use predefined schemas where possible to avoid
       redundant schema definitions

## License

MIT

-----

\<p align="center"\>
  Built with ❤️ in India by the \<a href="https://github.com/orgs/voilajsx/people"\>VoilaJS Team\</a\> — powering modern web development.
\</p\>

```
