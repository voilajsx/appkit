# Configuration Module API Reference

## Overview

The `@voilajsx/appkit/config` module provides a lightweight and robust
configuration management solution for Node.js applications, supporting loading
from JSON, JavaScript, or `.env` files, schema validation, and environment
variable integration with automatic type coercion.

## Installation

```bash
npm install @voilajsx/appkit dotenv
```

**Note**: The `dotenv` package is required to load `.env` files and must be
installed separately.

## Quick Start

```javascript
import {
  loadConfig,
  getConfig,
  createConfigSchema,
} from '@voilajsx/appkit/config';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Define a schema
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
  },
});

// Load configuration
await loadConfig(null, {
  schema: 'app',
  env: true,
  defaults: { server: { port: 3000 } },
});

// Access configuration
const port = getConfig('server.port'); // 3000 (number, coerced from .env)
```

## API Reference

### Configuration Loading

#### loadConfig(source, options)

Loads configuration from a file path or object. When `options.env` is `true` and
`options.schema` is provided, `loadConfig` coerces environment variable strings
to match schema-defined types (e.g., `number`, `boolean`).

##### Parameters

| Name               | Type             | Required | Default | Description                                                                |
| ------------------ | ---------------- | -------- | ------- | -------------------------------------------------------------------------- |
| `source`           | `string\|Object` | Yes      | -       | File path or configuration object                                          |
| `options`          | `Object`         | No       | `{}`    | Configuration options                                                      |
| `options.defaults` | `Object`         | No       | `{}`    | Default values to merge with loaded configuration                          |
| `options.validate` | `boolean`        | No       | `true`  | Whether to validate configuration                                          |
| `options.schema`   | `string`         | No       | -       | Schema name for validation and type coercion of environment variables      |
| `options.env`      | `boolean`        | No       | `true`  | Whether to integrate environment variables with schema-based type coercion |

##### Returns

- `Promise<Object>` - The loaded configuration object (with values coerced to
  schema-defined types where applicable)

##### Throws

- `Error` - If the configuration file is not found, JSON parsing fails,
  validation fails, or other loading errors occur

##### Example

```javascript
import dotenv from 'dotenv';
dotenv.config();

// Load from JSON file and .env with type coercion
// If process.env.SERVER_PORT is "8080" and schema defines server.port as number, config.server.port will be 8080 (number).
await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  schema: 'app',
  env: true,
});

// Load from JavaScript module
await loadConfig('./config.js');

// Load from object
await loadConfig({
  server: { port: 4000 },
  database: { url: 'mongodb://localhost:27017/myapp' },
});
```

---

### Configuration Access

#### getConfig(path, fallback)

Retrieves a configuration value by path using dot notation.

##### Parameters

| Name       | Type     | Required | Default | Description                           |
| ---------- | -------- | -------- | ------- | ------------------------------------- |
| `path`     | `string` | No       | -       | Configuration path using dot notation |
| `fallback` | `any`    | No       | -       | Fallback value if path is not found   |

##### Returns

- If `path` is provided: The value at that path, or `fallback` if not found
- If no `path` is provided: The entire configuration object

##### Example

```javascript
// Get a specific value (coerced to number if schema defines it)
const port = getConfig('server.port', 3000);

// Get a nested object
const database = getConfig('database');

// Get the entire config
const allConfig = getConfig();
```

---

#### hasConfig(path)

Checks if a configuration path exists.

##### Parameters

| Name   | Type     | Required | Description                           |
| ------ | -------- | -------- | ------------------------------------- |
| `path` | `string` | Yes      | Configuration path using dot notation |

##### Returns

- `boolean` - `true` if the path exists, `false` otherwise

##### Example

```javascript
// Check if a configuration path exists
if (hasConfig('database.ssl')) {
  console.log('SSL configuration is defined');
}
```

---

### Configuration Validation

#### createConfigSchema(name, schema)

Defines a named schema for validation and type coercion.

##### Parameters

| Name     | Type     | Required | Description                 |
| -------- | -------- | -------- | --------------------------- |
| `name`   | `string` | Yes      | Unique name for the schema  |
| `schema` | `Object` | Yes      | JSON Schema-like definition |

##### Throws

- `Error` - If a schema with the given name already exists

##### Example

```javascript
// Define a server schema
createConfigSchema('server', {
  type: 'object',
  required: ['port'],
  properties: {
    host: { type: 'string', default: 'localhost' },
    port: { type: 'number', minimum: 1024, maximum: 65535 },
  },
});

// Define an app schema referencing the server schema
createConfigSchema('app', {
  type: 'object',
  required: ['server'],
  properties: {
    name: { type: 'string' },
    server: { $ref: 'server' },
  },
});
```

---

#### validateConfigSchema(config, schemaName)

Validates a configuration object against a named schema.

##### Parameters

| Name         | Type     | Required | Description                      |
| ------------ | -------- | -------- | -------------------------------- |
| `config`     | `Object` | Yes      | Configuration object to validate |
| `schemaName` | `string` | Yes      | Name of the predefined schema    |

##### Returns

- `boolean` - `true` if configuration is valid

##### Throws

- `Error` - If validation fails or the schema is not found

##### Example

```javascript
// Validate against a named schema
try {
  validateConfigSchema(config, 'app');
  console.log('Configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

---

### Error Handling

All functions throw standard `Error` objects with descriptive messages. Use
try-catch blocks to handle errors:

```javascript
try {
  await loadConfig('./config.json', { schema: 'app' });
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

#### Common Error Messages

| Function               | Error Message Example                | Cause                               |
| ---------------------- | ------------------------------------ | ----------------------------------- |
| `loadConfig`           | `Configuration file not found`       | File does not exist                 |
| `loadConfig`           | `Invalid JSON in configuration file` | JSON parsing error                  |
| `loadConfig`           | `Configuration validation failed`    | Schema validation error             |
| `createConfigSchema`   | `Schema 'name' already defined`      | Schema name already in use          |
| `validateConfigSchema` | `Schema 'name' not found`            | Referenced schema does not exist    |
| `validateConfigSchema` | `Configuration validation failed`    | Configuration does not match schema |

---

### Security Considerations

1. **Secret Management**: Store sensitive data (e.g., API keys, database
   credentials) in `.env` files, not in version-controlled configuration files.
2. **Environment Variables**: Use `dotenv` to load `.env` files for secure
   configuration in production.
3. **Validation**: Always use schemas to prevent runtime errors from invalid
   configurations.
4. **File Permissions**: Ensure configuration files have restricted permissions
   if they contain sensitive data.
5. **Schema References**: Avoid circular `$ref` schema references to prevent
   validation issues.

---

### TypeScript Support

The module uses JSDoc for IDE support. For TypeScript, you can use these
annotations or create declaration files:

```typescript
interface ConfigOptions {
  defaults?: Record<string, any>;
  validate?: boolean;
  schema?: string;
  env?: boolean;
}

interface SchemaDefinition {
  type: string | string[];
  required?: string[];
  properties?: Record<string, SchemaDefinition>;
  default?: any;
  minimum?: number;
  maximum?: number;
  $ref?: string;
}
```

---

### License

MIT

---

<p align="center"> Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development. </p>
