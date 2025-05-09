# Configuration Module

The configuration module provides flexible, validated configuration management
for Node.js applications. It supports multiple file formats, environment
variables, schema validation, and hot reloading, making it easy to manage
configuration across different environments.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Configuration Sources](#configuration-sources)
  - [Schema Validation](#schema-validation)
  - [Environment Variables](#environment-variables)
  - [Variable Interpolation](#variable-interpolation)
- [Basic Usage](#basic-usage)
  - [Loading Configuration](#loading-configuration)
  - [Accessing Configuration](#accessing-configuration)
  - [Validating Configuration](#validating-configuration)
- [Advanced Features](#advanced-features)
  - [Hot Reloading](#hot-reloading)
  - [Custom Schemas](#custom-schemas)
  - [Environment Mapping](#environment-mapping)
  - [Default Values](#default-values)
- [Configuration Formats](#configuration-formats)
  - [JSON](#json)
  - [JavaScript](#javascript)
  - [YAML](#yaml)
  - [Environment Files](#environment-files)
- [Integration Patterns](#integration-patterns)
  - [Express Application](#express-application)
  - [Database Configuration](#database-configuration)
  - [Multi-environment Setup](#multi-environment-setup)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)

## Introduction

The configuration module helps you:

- **Load configuration** from multiple sources (files, environment variables)
- **Validate configuration** with schemas to catch errors early
- **Support multiple formats** (JSON, JavaScript, YAML, .env)
- **Interpolate variables** for dynamic configuration
- **Hot reload** configuration changes without restart
- **Type safety** with comprehensive validation

## Installation

```bash
npm install @voilajs/appkit

# For YAML support
npm install js-yaml
```

## Quick Start

```javascript
import { loadConfig, getConfig } from '@voilajs/appkit/config';

// Load configuration from file
await loadConfig('./config.json', {
  defaults: {
    port: 3000,
    host: 'localhost',
  },
  required: ['database.url'],
});

// Access configuration
const port = getConfig('server.port');
const dbUrl = getConfig('database.url');

// Use in your app
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## Core Concepts

### Configuration Sources

Configuration can be loaded from:

1. **Files**: JSON, JavaScript, YAML, .env
2. **Environment Variables**: System environment
3. **Objects**: Direct JavaScript objects
4. **Defaults**: Fallback values

### Schema Validation

Define schemas to ensure configuration correctness:

```javascript
const schema = {
  type: 'object',
  required: ['port', 'database'],
  properties: {
    port: { type: 'number', minimum: 1, maximum: 65535 },
    database: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string' },
      },
    },
  },
};
```

### Environment Variables

Environment variables can override configuration:

```javascript
// config.json
{
  "server": {
    "port": 3000
  }
}

// Environment override
PORT=8080 node app.js

// Result: server.port = 8080
```

### Variable Interpolation

Use variables within configuration:

```json
{
  "api": {
    "baseUrl": "https://${env.API_HOST}/api",
    "timeout": "${server.timeout}"
  }
}
```

## Basic Usage

### Loading Configuration

```javascript
import { loadConfig } from '@voilajs/appkit/config';

// From JSON file
await loadConfig('./config.json');

// From JavaScript file
await loadConfig('./config.js');

// From YAML file
await loadConfig('./config.yaml');

// From object
await loadConfig({
  server: { port: 3000 },
  database: { url: 'postgres://localhost/myapp' },
});

// With options
await loadConfig('./config.json', {
  defaults: {
    port: 3000,
    logLevel: 'info',
  },
  required: ['database.url', 'api.key'],
  schema: configSchema,
  watch: true, // Enable hot reload
});
```

### Accessing Configuration

```javascript
import { getConfig, hasConfig } from '@voilajs/appkit/config';

// Get entire config
const config = getConfig();

// Get specific value
const port = getConfig('server.port');
const dbUrl = getConfig('database.url');

// Get with default
const timeout = getConfig('api.timeout', 5000);

// Check if config exists
if (hasConfig('features.caching')) {
  // Enable caching
}

// Get nested values
const poolMin = getConfig('database.pool.min', 2);
```

### Validating Configuration

```javascript
import { validateConfig, defineSchema } from '@voilajs/appkit/config';

// Define a schema
const schema = {
  type: 'object',
  required: ['server', 'database'],
  properties: {
    server: {
      type: 'object',
      required: ['port'],
      properties: {
        port: { type: 'number', minimum: 1 },
        host: { type: 'string', default: 'localhost' },
      },
    },
    database: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', pattern: '^postgres://' },
      },
    },
  },
};

// Validate configuration
try {
  validateConfig(config, schema);
  console.log('Configuration is valid');
} catch (error) {
  console.error('Configuration errors:', error.details.errors);
}

// Use predefined schemas
defineSchema('myapp', schema);
await loadConfig('./config.json', {
  schema: 'myapp',
});
```

## Advanced Features

### Hot Reloading

```javascript
// Enable hot reload
await loadConfig('./config.json', {
  watch: true,
});

// Configuration automatically reloads on file changes
```

### Custom Schemas

```javascript
import { defineSchema, getConfigSchema } from '@voilajs/appkit/config';

// Define reusable schema
defineSchema('redis', {
  type: 'object',
  required: ['url'],
  properties: {
    url: { type: 'string', pattern: '^redis://' },
    options: {
      type: 'object',
      properties: {
        db: { type: 'number', minimum: 0 },
        password: { type: 'string' },
      },
    },
  },
});

// Use in another schema
defineSchema('app', {
  type: 'object',
  properties: {
    cache: { $ref: 'redis' },
    queue: { $ref: 'redis' },
  },
});

// Get schema
const redisSchema = getConfigSchema('redis');
```

### Environment Mapping

```javascript
// Default environment mappings
const defaultMappings = {
  PORT: 'server.port',
  HOST: 'server.host',
  NODE_ENV: 'environment',
  DATABASE_URL: 'database.url',
};

// Custom prefix for environment variables
await loadConfig(
  {
    envPrefix: 'MYAPP_',
  },
  {
    env: true,
  }
);

// MYAPP_API_KEY -> api.key
// MYAPP_DB_HOST -> db.host
```

### Default Values

```javascript
// In schema
const schema = {
  properties: {
    port: { type: 'number', default: 3000 },
    host: { type: 'string', default: 'localhost' },
  },
};

// In load options
await loadConfig('./config.json', {
  defaults: {
    server: { port: 3000 },
    logging: { level: 'info' },
  },
});

// In getConfig
const timeout = getConfig('api.timeout', 5000);
```

## Configuration Formats

### JSON

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "database": {
    "url": "postgres://localhost/myapp",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "features": {
    "caching": true,
    "rateLimit": true
  }
}
```

### JavaScript

```javascript
// config.js
export default {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
  },
  // Dynamic configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      db: parseInt(process.env.REDIS_DB || '0'),
    },
  },
};
```

### YAML

```yaml
server:
  port: 3000
  host: localhost

database:
  url: postgres://localhost/myapp
  pool:
    min: 2
    max: 10

logging:
  level: info
  format: json

features:
  caching: true
  rateLimit: true
```

### Environment Files

```bash
# .env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://user:pass@host/db
REDIS_URL=redis://localhost:6379
API_KEY=secret-key
LOG_LEVEL=info
```

## Integration Patterns

### Express Application

```javascript
import express from 'express';
import { loadConfig, getConfig } from '@voilajs/appkit/config';

// Define configuration schema
const schema = {
  type: 'object',
  required: ['server', 'database'],
  properties: {
    server: {
      type: 'object',
      properties: {
        port: { type: 'number', minimum: 1, maximum: 65535 },
        host: { type: 'string' },
      },
    },
    database: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string' },
      },
    },
    cors: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: true },
        origins: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

async function startApp() {
  // Load configuration
  await loadConfig('./config.json', {
    schema,
    defaults: {
      server: { port: 3000, host: 'localhost' },
      cors: { enabled: true, origins: ['*'] },
    },
  });

  const app = express();

  // CORS configuration
  if (getConfig('cors.enabled')) {
    app.use(
      cors({
        origin: getConfig('cors.origins'),
      })
    );
  }

  // Routes
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      environment: getConfig('environment'),
      version: getConfig('version'),
    });
  });

  // Start server
  const port = getConfig('server.port');
  const host = getConfig('server.host');

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
}

startApp().catch(console.error);
```

### Database Configuration

```javascript
import { loadConfig, getConfig } from '@voilajs/appkit/config';
import pg from 'pg';

async function setupDatabase() {
  await loadConfig('./database.json', {
    schema: 'database',
    required: ['database.url'],
  });

  // Create connection pool
  const pool = new pg.Pool({
    connectionString: getConfig('database.url'),
    min: getConfig('database.pool.min', 2),
    max: getConfig('database.pool.max', 10),
    idleTimeoutMillis: getConfig('database.pool.idleTimeout', 30000),
    ssl: getConfig('database.ssl', false),
  });

  // Test connection
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  return pool;
}
```

### Multi-environment Setup

```javascript
import { loadConfig, getConfig } from '@voilajs/appkit/config';

async function loadEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';

  // Load base configuration
  const baseConfig = await loadConfig('./config/default.json');

  // Load environment-specific configuration
  const envConfig = await loadConfig(`./config/${env}.json`);

  // Merge configurations
  const config = {
    ...baseConfig,
    ...envConfig,
    environment: env,
  };

  // Set merged configuration
  setConfig(config);

  // Validate final configuration
  await validateConfig(config, appSchema);

  return config;
}

// Usage
async function startApp() {
  const config = await loadEnvironmentConfig();

  console.log(`Starting app in ${config.environment} mode`);
  console.log(`API URL: ${getConfig('api.baseUrl')}`);
  console.log(`Database: ${getConfig('database.name')}`);
}
```

## Best Practices

### 1. Use Schema Validation

```javascript
// Always define and validate schemas
const schema = {
  type: 'object',
  required: ['database', 'api'],
  properties: {
    database: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string' },
      },
    },
  },
};

await loadConfig('./config.json', { schema });
```

### 2. Environment-Specific Configs

```javascript
// config/default.json - Shared configuration
{
  "app": {
    "name": "MyApp",
    "version": "1.0.0"
  }
}

// config/production.json - Production overrides
{
  "server": {
    "port": 80
  },
  "database": {
    "ssl": true
  }
}
```

### 3. Use Environment Variables for Secrets

```javascript
// Never store secrets in config files
const config = {
  api: {
    key: process.env.API_KEY,
    secret: process.env.API_SECRET,
  },
  database: {
    password: process.env.DB_PASSWORD,
  },
};
```

### 4. Provide Defaults

```javascript
// Always provide sensible defaults
await loadConfig('./config.json', {
  defaults: {
    server: { port: 3000 },
    logging: { level: 'info' },
    cache: { ttl: 3600 },
  },
});
```

### 5. Validate Early

```javascript
// Validate configuration at startup
try {
  await loadConfig('./config.json', {
    schema: appSchema,
    required: ['database.url', 'api.key'],
  });
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

### 6. Type-Safe Access

```javascript
// Create typed configuration getter
function getTypedConfig<T>(key: string, defaultValue: T): T {
  const value = getConfig(key, defaultValue);
  if (typeof value !== typeof defaultValue) {
    throw new Error(`Invalid type for ${key}`);
  }
  return value;
}

const port = getTypedConfig('server.port', 3000);
```

## API Reference

### loadConfig(pathOrConfig, options?)

Loads configuration from file or object.

**Parameters:**

- `pathOrConfig` (string|Object): File path or configuration object
- `options` (Object, optional):
  - `defaults` (Object): Default values
  - `required` (Array<string>): Required field paths
  - `validate` (boolean): Enable validation (default: true)
  - `schema` (Object|string): Validation schema or schema name
  - `env` (boolean): Enable environment variables (default: true)
  - `watch` (boolean): Enable file watching (default: false)
  - `interpolate` (boolean): Enable variable interpolation (default: true)

**Returns:** Promise<Object>

### getConfig(key?, defaultValue?)

Gets configuration value.

**Parameters:**

- `key` (string, optional): Configuration key (dot notation)
- `defaultValue` (any, optional): Default value if key not found

**Returns:** any

### setConfig(config)

Sets configuration object.

**Parameters:**

- `config` (Object): Configuration object

### hasConfig(key)

Checks if configuration key exists.

**Parameters:**

- `key` (string): Configuration key (dot notation)

**Returns:** boolean

### validateConfig(config, schema)

Validates configuration against schema.

**Parameters:**

- `config` (Object): Configuration to validate
- `schema` (Object): Validation schema

**Returns:** boolean

**Throws:** ConfigError if validation fails

### defineSchema(name, schema)

Defines a reusable schema.

**Parameters:**

- `name` (string): Schema name
- `schema` (Object): Schema definition

### getConfigSchema(name)

Gets a defined schema.

**Parameters:**

- `name` (string): Schema name

**Returns:** Object

### getEnv(key, defaultValue?)

Gets environment variable value.

**Parameters:**

- `key` (string): Environment variable name
- `defaultValue` (any, optional): Default value

**Returns:** string

### reloadConfig(filePath?)

Reloads configuration from file.

**Parameters:**

- `filePath` (string, optional): Configuration file path

**Returns:** Promise<Object>

### clearConfig()

Clears all configuration.

## Error Handling

```javascript
import { ConfigError } from '@voilajs/appkit/config';

try {
  await loadConfig('./config.json');
} catch (error) {
  if (error instanceof ConfigError) {
    console.error('Configuration error:', error.message);
    console.error('Error code:', error.code);
    console.error('Details:', error.details);

    switch (error.code) {
      case 'FILE_NOT_FOUND':
        console.error('Config file missing');
        break;
      case 'VALIDATION_ERROR':
        console.error('Invalid configuration');
        break;
      case 'MISSING_REQUIRED_FIELDS':
        console.error('Required fields:', error.details.missing);
        break;
    }
  }
}
```

### Error Codes

- `CONFIG_ERROR`: Generic configuration error
- `FILE_NOT_FOUND`: Configuration file not found
- `FILE_READ_ERROR`: Unable to read configuration file
- `JSON_PARSE_ERROR`: Invalid JSON in configuration
- `YAML_PARSE_ERROR`: Invalid YAML in configuration
- `VALIDATION_ERROR`: Schema validation failed
- `MISSING_REQUIRED_FIELDS`: Required fields missing
- `INVALID_CONFIG_TYPE`: Invalid configuration type
- `UNSUPPORTED_FILE_TYPE`: Unsupported file format

## Troubleshooting

### Common Issues

#### 1. Configuration File Not Found

```javascript
// Use absolute paths
import path from 'path';

const configPath = path.resolve(process.cwd(), 'config.json');
await loadConfig(configPath);
```

#### 2. Environment Variables Not Loading

```javascript
// Check environment variable loading
console.log('Environment:', process.env);

// Enable environment variables explicitly
await loadConfig('./config.json', {
  env: true,
});

// Use custom prefix
await loadConfig('./config.json', {
  envPrefix: 'MYAPP_',
});
```

#### 3. Schema Validation Failures

```javascript
// Debug validation errors
try {
  await loadConfig('./config.json', { schema });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    error.details.errors.forEach((err) => {
      console.log(`Field: ${err.path}`);
      console.log(`Error: ${err.message}`);
    });
  }
}
```

#### 4. Variable Interpolation Not Working

```javascript
// Check interpolation syntax
const config = {
  api: {
    url: '${baseUrl}/api', // Correct
    timeout: '$timeout', // Incorrect - missing braces
  },
};

// Ensure interpolation is enabled
await loadConfig(config, {
  interpolate: true,
});
```

#### 5. Hot Reload Not Working

```javascript
// Enable file watching
await loadConfig('./config.json', {
  watch: true,
});

// Check file permissions
fs.access('./config.json', fs.constants.W_OK, (err) => {
  if (err) {
    console.error('No write access to config file');
  }
});
```

## Support

For issues and feature requests, visit our
[GitHub repository](https://github.com/voilajs/appkit).
