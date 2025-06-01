# Config Module - Developer Reference 🛠️

The `@voilajsx/appkit/config` module provides lightweight configuration
management for Node.js applications. It supports loading configurations from
JSON, JavaScript, or `.env` files, accessing values with dot notation, and
validating configurations with schemas, including automatic type coercion for
environment variables. Designed to be minimal and framework-agnostic, it’s
perfect for bootstrapping your web framework with reliable configuration
handling.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📁 [Loading Configuration](#loading-configuration)
  - [From JSON Files](#from-json-files)
  - [From JavaScript Files](#from-javascript-files)
  - [From .env Files](#from-env-files)
  - [From Objects](#from-objects)
  - [Complete Loading Example](#complete-loading-example)
- 🔍 [Accessing Configuration](#accessing-configuration)
  - [Getting Values](#getting-values)
  - [Checking Existence](#checking-existence)
  - [Complete Access Example](#complete-access-example)
- ✅ [Validating Configuration](#validating-configuration)
  - [Schema Basics](#schema-basics)
  - [Complete Validation Example](#complete-validation-example)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit dotenv
```

**Note**: The `dotenv` package is required to load `.env` files and must be
installed separately.

### Basic Import

```javascript
import {
  loadConfig,
  getConfig,
  hasConfig,
  createConfigSchema,
  validateConfigSchema,
} from '@voilajsx/appkit/config';
```

## Loading Configuration

The config module supports loading configurations from various sources, making
it easy to manage settings for your application.

### From JSON Files

Use `loadConfig` with a file path to load JSON configurations, optionally
merging defaults and environment variables.

```javascript
import { loadConfig } from '@voilajsx/appkit/config';

// Load from JSON file
const config = await loadConfig('./config.json');

// With defaults
const config = await loadConfig('./config.json', {
  defaults: {
    server: { port: 3000, host: 'localhost' },
  },
});
```

**Example `config.json`:**

```json
{
  "server": { "port": 8080 },
  "database": { "url": "mongodb://localhost/myapp" }
}
```

**Output:**

```javascript
{
  server: { port: 8080, host: 'localhost' }, // port from file, host from defaults
  database: { url: 'mongodb://localhost/myapp' }
}
```

**When to use:**

- Load static configuration at startup.
- Provide fallback values for optional settings.
- Manage environment-specific configurations (e.g., `config.dev.json`,
  `config.prod.json`).

### From JavaScript Files

JavaScript files allow dynamic configuration logic, such as using environment
variables.

```javascript
import { loadConfig } from '@voilajsx/appkit/config';

// Load from JavaScript module
const config = await loadConfig('./config.js');
```

**Example `config.js`:**

```javascript
export default {
  server: {
    port: Number(process.env.PORT) || 3000,
    host: 'localhost',
  },
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost/myapp',
  },
};
```

**When to use:**

- Apply logic to configuration values (e.g., conditionals).
- Integrate environment variables directly in the config file.
- Combine multiple configuration sources programmatically.

### From .env Files

The module integrates `.env` files using `dotenv`. When `env: true` and a schema
are provided, environment variables are mapped to configuration paths and
coerced to schema-defined types (e.g., number, boolean).

**Example `.env`:**

```
SERVER_PORT=8080
SERVER_HOST=localhost
```

```javascript
import dotenv from 'dotenv';
import { loadConfig, createConfigSchema } from '@voilajsx/appkit/config';

// Load .env file
dotenv.config();

// Define schema for type coercion
createConfigSchema('app', {
  type: 'object',
  properties: {
    server: {
      type: 'object',
      properties: {
        port: { type: 'number' },
        host: { type: 'string' },
      },
    },
  },
});

// Load configuration with .env integration
await loadConfig(null, {
  schema: 'app',
  env: true,
});

console.log(getConfig('server.port')); // 8080 (number)
console.log(typeof getConfig('server.port')); // 'number'
```

**When to use:**

- Store sensitive data (e.g., API keys) securely.
- Configure settings via environment variables in production.
- Ensure type safety for environment variables using schemas.
- Use with containerized environments like Docker or Kubernetes.

### From Objects

Load configurations directly from JavaScript objects, useful for testing or
programmatic setups.

```javascript
import { loadConfig } from '@voilajsx/appkit/config';

// Load from object
const config = await loadConfig({
  server: { port: 3000, host: 'localhost' },
  database: { url: 'mongodb://localhost/myapp' },
});
```

**When to use:**

- Provide test-specific configurations.
- Generate configurations dynamically at runtime.
- Use with CLI tools or command-line arguments.

### Complete Loading Example

A real-world example combining multiple sources and options:

```javascript
import dotenv from 'dotenv';
import { loadConfig, createConfigSchema } from '@voilajsx/appkit/config';

async function initializeConfig() {
  try {
    // Load .env file
    dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

    // Define schema
    createConfigSchema('app', {
      type: 'object',
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
    const config = await loadConfig('./config.json', {
      defaults: { server: { port: 3000 } },
      validate: true,
      schema: 'app',
      env: true,
    });

    console.log(
      `Configuration loaded for ${process.env.NODE_ENV || 'development'}`
    );
    console.log(
      'Server port:',
      config.server.port,
      `(type: ${typeof config.server.port})`
    );

    return config;
  } catch (error) {
    console.error('Configuration loading failed:', error.message);
    throw error;
  }
}
```

**When to implement:**

- Initialize configurations during application startup.
- Combine file-based and environment variable configurations.
- Ensure type safety and validation for production apps.

## Accessing Configuration

Access configuration values easily with dot notation and existence checks.

### Getting Values

Use `getConfig` to retrieve values, with optional fallbacks for missing paths.

```javascript
import { getConfig } from '@voilajsx/appkit/config';

// Get a specific value
const port = getConfig('server.port'); // e.g., 8080 (number)

// Get with fallback
const timeout = getConfig('api.timeout', 5000);

// Get a nested object
const database = getConfig('database');

// Get entire configuration
const allConfig = getConfig();
```

**When to use:**

- Access settings throughout your application.
- Implement feature flags based on configuration.
- Provide defaults for optional settings.

### Checking Existence

Use `hasConfig` to verify if a configuration path exists.

```javascript
import { hasConfig, getConfig } from '@voilajsx/appkit/config';

// Check if a value exists
if (hasConfig('database.url')) {
  console.log('Database URL is configured');
}

// Conditional access
const logLevel = hasConfig('logging.level')
  ? getConfig('logging.level')
  : 'info';
```

**When to use:**

- Check for optional configurations before use.
- Implement conditional logic based on configuration presence.
- Support graceful fallback when settings are missing.

### Complete Access Example

A practical example of accessing configuration:

```javascript
import { getConfig, hasConfig } from '@voilajsx/appkit/config';

function setupDatabase() {
  const dbConfig = getConfig('database', {});
  const dbUrl = dbConfig.url || 'mongodb://localhost/myapp';

  const sslEnabled = hasConfig('database.ssl.enabled')
    ? getConfig('database.ssl.enabled')
    : false;

  console.log(`Connecting to database: ${dbUrl} (SSL: ${sslEnabled})`);

  return { url: dbUrl, ssl: sslEnabled };
}
```

**When to implement:**

- Initialize services with configuration-dependent settings.
- Create helper functions for common configuration patterns.
- Handle optional settings with fallbacks.

## Validating Configuration

Validate configurations using schemas to ensure correctness and type safety.

### Schema Basics

Define schemas with `createConfigSchema` and validate with
`validateConfigSchema`.

```javascript
import {
  createConfigSchema,
  validateConfigSchema,
} from '@voilajsx/appkit/config';

// Define a schema
createConfigSchema('server', {
  type: 'object',
  required: ['port'],
  properties: {
    port: { type: 'number', minimum: 1024, maximum: 65535 },
    host: { type: 'string', default: 'localhost' },
  },
});

// Validate configuration
try {
  validateConfigSchema({ server: { port: 8080 } }, 'server');
  console.log('Configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

**When to use:**

- Ensure configurations meet requirements at startup.
- Enforce type safety for environment variables.
- Validate nested configuration structures.

### Complete Validation Example

A real-world validation setup:

```javascript
import {
  createConfigSchema,
  validateConfigSchema,
} from '@voilajsx/appkit/config';

function setupValidation() {
  // Define server schema
  createConfigSchema('server', {
    type: 'object',
    required: ['port'],
    properties: {
      port: { type: 'number', minimum: 1024, maximum: 65535 },
      host: { type: 'string', default: 'localhost' },
    },
  });

  // Define app schema
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

  console.log('Validation schemas defined');
}
```

**When to implement:**

- Set up schemas during application initialization.
- Validate module-specific configurations.
- Reuse schemas across different parts of your app.

## Complete Integration Example

An Express application integrating the config module:

```javascript
import express from 'express';
import {
  loadConfig,
  getConfig,
  createConfigSchema,
} from '@voilajsx/appkit/config';
import dotenv from 'dotenv';

async function initApp() {
  try {
    // Load .env file
    dotenv.config();

    // Define configuration schema
    createConfigSchema('app', {
      type: 'object',
      required: ['server'],
      properties: {
        server: {
          type: 'object',
          required: ['port'],
          properties: {
            port: { type: 'number', minimum: 1024, maximum: 65535 },
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
    await loadConfig(null, {
      defaults: { server: { port: 3000 } },
      schema: 'app',
      env: true,
    });

    // Create Express app
    const app = express();

    // Define routes
    app.get('/', (req, res) => {
      res.json({
        message: 'Config server running',
        env: process.env.NODE_ENV || 'development',
      });
    });

    // Start server
    const port = getConfig('server.port');
    const host = getConfig('server.host');
    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });

    return app;
  } catch (error) {
    console.error('Application initialization failed:', error.message);
    process.exit(1);
  }
}

initApp();
```

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/config/docs/API_REFERENCE.md) -
  Complete API documentation
- 📋
  [Example Code](https://github.com/voilajsx/appkit/blob/main/src/config/examples) -
  Working examples

## Best Practices

### 🔐 Security

- Store secrets in `.env` files, not in version-controlled files.
- Add `.env` to `.gitignore` to prevent accidental commits.
- Validate configurations to catch invalid settings early.

### 🏗️ Architecture

- Define clear schemas for each configuration section.
- Use `$ref` for reusable schema components.
- Keep configurations modular and focused.

### 🚀 Performance

- Load configurations once at startup to minimize overhead.
- Use shallow configuration hierarchies for faster access.

### 👥 User Experience

- Provide descriptive error messages for configuration issues.
- Document schemas to clarify expected configuration.
- Set sensible defaults for optional settings.

---

<p align="center"> Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development. </p>
