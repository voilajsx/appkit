# Config Module - Developer REFERENCE 🛠️

The config module provides robust configuration management for Node.js
applications. It offers configuration loading from multiple sources, validation,
environment variable integration, and automatic reloading - all with sensible
defaults to get you started quickly.

Whether you need simple config loading, schema validation, or environment
variable integration, this module provides flexible utilities that work with any
Node.js framework.

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
  - [Environment Variables](#environment-variables)
  - [Complete Access Example](#complete-access-example)
- ✅ [Validating Configuration](#validating-configuration)
  - [Schema Basics](#schema-basics)
  - [Predefined Schemas](#predefined-schemas)
  - [Custom Validation](#custom-validation)
  - [Complete Validation Example](#complete-validation-example)
- 🔄 [Dynamic Configuration](#dynamic-configuration)
  - [Auto-Reloading](#auto-reloading)
  - [Manual Updates](#manual-updates)
  - [Complete Dynamic Example](#complete-dynamic-example)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit
```

### Basic Import

```javascript
import {
  loadConfig,
  getConfig,
  validateConfig,
  defineSchema,
  getEnv,
} from '@voilajsx/appkit/config';
```

## Loading Configuration

The config module supports loading configuration from various sources.

### From JSON Files

Use `loadConfig` with a file path to load JSON configuration:

```javascript
import { loadConfig } from '@voilajsx/appkit/config';

// Basic usage - load from JSON file
const config = await loadConfig('./config.json');

// With defaults - provides fallback values
const config = await loadConfig('./config.json', {
  defaults: {
    server: {
      port: 3000,
      host: 'localhost',
    },
  },
});

// With required fields - ensures critical config exists (via schema)
const config = await loadConfig('./config.json');
```

**Expected Output:**

```javascript
// For config.json containing:
// {
//   "server": {
//     "port": 8080
//   },
//   "database": {
//     "url": "mongodb://localhost/myapp"
//   }
// }

// Result with defaults:
{
  server: {
    port: 8080,  // From config.json
    host: 'localhost'  // From defaults
  },
  database: {
    url: 'mongodb://localhost/myapp'  // From config.json
  }
}
```

**When to use:**

- **Application Configuration**: Load app settings at startup
- **Environment-specific Configuration**: Separate configs for dev/staging/prod
- **Default Settings**: Provide sensible defaults with override capability
- **Required Validation**: Ensure critical configuration exists (via schema)

### From JavaScript Files

JavaScript configuration files give you more flexibility:

```javascript
import { loadConfig } from '@voilajsx/appkit/config';

// Load from JavaScript module
const config = await loadConfig('./config.js');
```

Your `config.js` file can export an object:

```javascript
// config.js
export default {
  server: {
    port: process.env.PORT || 3000,
    host: 'localhost',
  },
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost/myapp',
  },
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  },
};
```

**When to use:**

- **Dynamic Configuration**: When config needs to run code
- **Environment Integration**: Easily use environment variables
- **Conditional Settings**: Apply logic to determine values
- **Configuration Composition**: Import and combine other configs

### From .env Files

The `config` module can automatically integrate with environment variables
defined in `.env` files (loaded by `dotenv`). When you use the `env: true`
option in `loadConfig` along with a `map` and `schema`, the module will not only
map environment variables to your configuration paths but also automatically
**coerce their types** (`string` to `number` or `boolean`) based on your schema
definition.

Consider this `.env` file and `envMap`:

```
PORT=8080
SERVER_SSL_ENABLED=true
LOG_RETENTION_DAYS=7
```

```javascript
// In app.config.js (or similar)
export const configSchema = {
  type: 'object',
  properties: {
    server: {
      type: 'object',
      properties: {
        port: { type: 'number' },
        ssl: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
          },
        },
      },
    },
    logging: {
      type: 'object',
      properties: {
        retentionDays: { type: 'number' },
      },
    },
  },
};

export const envMap = {
  PORT: 'server.port',
  SERVER_SSL_ENABLED: 'server.ssl.enabled',
  LOG_RETENTION_DAYS: 'logging.retentionDays',
};
```

```javascript
import { loadConfig, getConfig } from '@voilajsx/appkit/config';
import { configSchema, envMap } from './app.config.js'; // Your schema and map

// Load configuration, allowing env vars to be mapped and coerced
const config = await loadConfig(
  {},
  {
    env: true,
    map: envMap,
    schema: configSchema,
    // Other options like defaults, validate etc.
  }
);

console.log(config.server.port); // Will be the NUMBER 8080
console.log(typeof config.server.port); // 'number'

console.log(config.server.ssl.enabled); // Will be the BOOLEAN true
console.log(typeof config.server.ssl.enabled); // 'boolean'

console.log(config.logging.retentionDays); // Will be the NUMBER 7
console.log(typeof config.logging.retentionDays); // 'number'
```

**When to use:**

- **Environment Variables**: When you prefer the .env format for config.
- **Production Deployments**: For injecting configuration via host environment.
- **Type Safety**: Automatically convert string env vars to numbers/booleans as
  defined in schema.
- **Docker Environments**: When using with Docker compose or Kubernetes.

### From Objects

You can load configuration directly from objects:

```javascript
import { loadConfig } from '@voilajsx/appkit/config';

// Load from object
const config = await loadConfig({
  server: {
    port: 3000,
    host: 'localhost',
  },
  database: {
    url: 'mongodb://localhost/myapp',
  },
});
```

**When to use:**

- **In-memory Configuration**: When config is generated programmatically
- **Testing**: To provide test-specific configuration
- **CLI Tools**: When config comes from command-line arguments
- **Dynamic Settings**: When configuration is built at runtime

### Complete Loading Example

Here's a real-world example loading configuration with all options:

```javascript
import { loadConfig } from '@voilajsx/appkit/config';
import { configSchema, envMap } from './app.config.js'; // Your schema and map

async function initializeConfig() {
  try {
    // Determine environment
    const env = process.env.NODE_ENV || 'development'; // Set up configuration options

    const options = {
      // Default values
      defaults: {
        server: {
          port: 3000,
          host: 'localhost',
        },
        logging: {
          level: 'info',
          format: 'json',
        },
      }, // Validate against schema (schema will handle required fields and type coercion)

      validate: true,
      schema: configSchema, // Pass your schema object or name
      // Environment variables integration with mapping

      env: true,
      map: envMap, // Your environment variable map
      // Auto-reload on file changes (dev only)

      watch: env === 'development', // Enable variable interpolation

      interpolate: true,
    }; // Load configuration

    // If you have a config file, pass its path:
    const config = await loadConfig(`./config/${env}.json`, options);
    // If you're building config primarily from defaults/env:
    // const config = await loadConfig({}, options); // No file loaded, just defaults and env vars

    console.log(`Configuration loaded for ${env} environment`);

    // No need for manual parseInt/boolean conversions here, loadConfig handles it!
    console.log(
      `Server port is: ${config.server.port} (type: ${typeof config.server.port})`
    );
    console.log(
      `File logging enabled: ${config.logging.enableFileLogging} (type: ${typeof config.logging.enableFileLogging})`
    );

    return config;
  } catch (error) {
    console.error('Configuration loading failed:', error.message); // Show validation errors if available

    if (error.code === 'VALIDATION_ERROR' && error.details?.errors) {
      console.error('Validation errors:');
      error.details.errors.forEach((err) => {
        console.error(`- ${err.path}: ${err.message}`);
      });
    }

    throw error;
  }
}
```

**When to implement:**

- **Application Startup**: Load configuration during app initialization
- **Complex Configuration**: When you need multiple configuration sources
- **Production Applications**: Ensure all required configuration exists
- **Development Workflow**: Auto-reload during development

## Accessing Configuration

Once loaded, you can easily access configuration values.

### Getting Values

Use `getConfig` to retrieve configuration values. Note that values loaded via
`loadConfig` with `env: true` and a `schema` will already be coerced to their
appropriate JavaScript types.

```javascript
import { getConfig } from '@voilajsx/appkit/config';

// Get a specific value with dot notation
const port = getConfig('server.port');
console.log('Server port:', port); // e.g., 3000 (as a number)

// Get a value with default
const apiTimeout = getConfig('api.timeout', 5000);
console.log('API timeout:', apiTimeout); // 5000 if not in config

// Get a nested object
const database = getConfig('database');
console.log('Database config:', database); // { url: '...', ... }

// Get the entire configuration
const allConfig = getConfig();
console.log('All configuration:', allConfig);
```

**When to use:**

- **Application Settings**: Access configuration throughout your app
- **Feature Flags**: Check if features are enabled
- **Default Values**: Provide fallbacks for optional configuration
- **Dynamic Settings**: Access configuration that might change

### Checking Existence

Use `hasConfig` to check if a configuration value exists:

```javascript
import { hasConfig } from '@voilajsx/appkit/config';

// Check if a configuration value exists
if (hasConfig('database.ssl')) {
  console.log('SSL configuration is available');
}

// Use existence check to make decisions
const logFormat = hasConfig('logging.format')
  ? getConfig('logging.format')
  : 'simple';
```

**When to use:**

- **Optional Features**: Check if optional configuration exists
- **Conditional Logic**: Make decisions based on config presence
- **Graceful Degradation**: Fall back gracefully when config is missing
- **Validation**: Check for required configuration

### Environment Variables

Use `getEnv` to access environment variables directly. **Note:** `getEnv` will
still return the raw string value of the environment variable. If you need
type-coerced values, you should rely on `loadConfig` with `env: true` and a
`schema`, and then access the configuration via `getConfig`.

```javascript
import { getEnv } from '@voilajsx/appkit/config';

// Get environment variable (returns raw string)
const nodeEnv = getEnv('NODE_ENV', 'development');
console.log('Environment (raw string):', nodeEnv);

// Get database URL with fallback (returns raw string)
const dbUrl = getEnv('DATABASE_URL', 'mongodb://localhost/myapp');
console.log('Database URL (raw string):', dbUrl);
```

**When to use:**

- **Environment Settings**: Access environment-specific settings
- **Secrets**: Get sensitive information from environment
- **Runtime Configuration**: Access values that might change between runs
- **Containerized Apps**: Get configuration injected by container platforms

### Complete Access Example

Here's a real-world example showing how to access configuration:

```javascript
import { getConfig, hasConfig, getEnv } from '@voilajsx/appkit/config';

function setupDatabase() {
  // Get primary database configuration (values will already be coerced by loadConfig)
  const dbConfig = getConfig('database', {}); // Get database URL. Now, dbConfig.url should already be the correct type if defined in schema.
  // If you still need to prioritize raw env, you can, but typically loadConfig handles it.

  const dbUrl = dbConfig.url; // Assuming loadConfig already processed DATABASE_URL from env or default
  if (!dbUrl) {
    throw new Error('Database URL is required');
  } // Determine if SSL is enabled (will be boolean if schema defines it)

  const sslEnabled = dbConfig.ssl.enabled; // Directly access, no need for manual conversion
  // Get connection pool settings (values will be numbers if schema defines them)

  const pool = getConfig('database.pool', {
    min: 2,
    max: 10,
  });

  console.log(`Connecting to database: ${dbUrl}`);
  console.log(`SSL enabled: ${sslEnabled}`);
  console.log(`Connection pool: min=${pool.min}, max=${pool.max}`); // Return database configuration

  return {
    url: dbUrl,
    ssl: sslEnabled,
    pool,
  };
}
```

**When to implement:**

- **Service Initialization**: When setting up application services
- **Configuration Access**: Create helper functions for common config patterns
- **Environment Override**: Allow environment variables to override config
- **Default Values**: Provide sensible defaults for missing configuration

## Validating Configuration

Validation ensures your configuration meets your application's requirements.

### Schema Basics

Define a schema and validate configuration against it:

```javascript
import { validateConfig } from '@voilajsx/appkit/config';

// Define a simple schema
const schema = {
  type: 'object',
  required: ['server', 'database'],
  properties: {
    server: {
      type: 'object',
      required: ['port'],
      properties: {
        port: {
          type: 'number',
          minimum: 1024,
          maximum: 65535,
        },
        host: {
          type: 'string',
          default: 'localhost',
        },
      },
    },
    database: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          pattern: '^mongodb://',
        },
      },
    },
  },
};

// Validate configuration
try {
  validateConfig(config, schema);
  console.log('Configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.message);
  if (error.details?.errors) {
    error.details.errors.forEach((err) => {
      console.error(`- ${err.path}: ${err.message}`);
    });
  }
}
```

**When to use:**

- **Application Startup**: Validate configuration at startup
- **Type Checking**: Ensure values have the correct type
- **Range Validation**: Check numerical constraints
- **Pattern Matching**: Validate string formats

### Predefined Schemas

Define reusable schemas with `defineSchema`:

```javascript
import {
  defineSchema,
  getConfigSchema,
  validateConfig,
} from '@voilajsx/appkit/config';

// Define server schema
defineSchema('server', {
  type: 'object',
  required: ['port'],
  properties: {
    port: {
      type: 'number',
      minimum: 1024,
      maximum: 65535,
    },
    host: {
      type: 'string',
      default: 'localhost',
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
    },
    ssl: {
      type: 'boolean',
      default: false,
    },
  },
});

// Define app schema with references
defineSchema('app', {
  type: 'object',
  required: ['server', 'database'],
  properties: {
    server: { $ref: 'server' },
    database: { $ref: 'database' },
    logging: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['error', 'warn', 'info', 'debug'],
          default: 'info',
        },
      },
    },
  },
});

// Get schema and validate
const appSchema = getConfigSchema('app');
validateConfig(config, appSchema);
```

**When to use:**

- **Modular Validation**: Split schemas into reusable components
- **Complex Schemas**: Build complex schemas from simpler ones
- **Consistent Validation**: Use the same schema across your application
- **Self-documenting Configuration**: Schemas document expected configuration

### Custom Validation

Add custom validation logic:

```javascript
import { defineSchema, validateConfig } from '@voilajsx/appkit/config';

// Schema with custom validation
const schema = {
  type: 'object',
  properties: {
    cache: {
      type: 'object',
      properties: {
        ttl: {
          type: 'number',
          minimum: 0,
        },
        checkPeriod: {
          type: 'number',
        },
      }, // Custom validation function
      validate: (value, path) => {
        if (value.checkPeriod && value.ttl && value.checkPeriod > value.ttl) {
          return 'checkPeriod must be less than or equal to ttl';
        }
        return true;
      },
    },
  },
};

try {
  validateConfig(config, schema);
  console.log('Cache configuration is valid');
} catch (error) {
  console.error('Invalid cache configuration:', error.message);
}
```

**When to use:**

- **Complex Rules**: Validate relationships between fields
- **Context-dependent Validation**: Rules that depend on other values
- **Custom Types**: Validate custom data structures
- **Format Validation**: Check specific string formats

### Complete Validation Example

Here's a real-world example of configuration validation:

```javascript
import { defineSchema, validateConfig } from '@voilajsx/appkit/config';

function setupValidation() {
  // Define server schema
  defineSchema('server', {
    type: 'object',
    required: ['port'],
    properties: {
      port: {
        type: 'number',
        minimum: 1,
        maximum: 65535,
      },
      host: {
        type: 'string',
        default: 'localhost',
      },
    },
  }); // Define database schema

  defineSchema('database', {
    type: 'object',
    required: ['url'],
    properties: {
      url: {
        type: 'string',
        pattern: '^(postgres|mongodb|mysql)://',
      },
      ssl: {
        type: 'boolean',
        default: false,
      },
    },
  }); // Define app schema

  defineSchema('app', {
    type: 'object',
    required: ['server', 'database'],
    properties: {
      server: { $ref: 'server' },
      database: { $ref: 'database' },
      logging: {
        type: 'object',
        properties: {
          level: {
            type: 'string',
            enum: ['error', 'warn', 'info', 'debug'],
            default: 'info',
          },
          format: {
            type: 'string',
            enum: ['json', 'text'],
            default: 'json',
          },
        },
      },
    },
  });

  console.log('Validation schemas defined');
}
```

**When to implement:**

- **Application Initialization**: Set up schemas during app initialization
- **Module Configuration**: Validate configuration for specific modules
- **API Parameters**: Validate incoming API configuration
- **User Settings**: Validate user preferences

## Dynamic Configuration

The config module supports dynamic configuration updates.

### Auto-Reloading

Enable automatic config reloading during development:

```javascript
import { loadConfig } from '@voilajsx/appkit/config';

// Enable watching for file changes
const config = await loadConfig('./config.json', {
  watch: true,
});

console.log('Configuration loaded with auto-reload enabled');
```

**When to use:**

- **Development Environment**: Reload configuration during development
- **Long-running Processes**: Update configuration without restart
- **Feature Flags**: Enable/disable features on the fly
- **A/B Testing**: Change settings without redeployment

### Manual Updates

Manually update or reload configuration:

```javascript
import { setConfig, reloadConfig } from '@voilajsx/appkit/config';

// Update configuration manually
function updateConfig(updates) {
  // Get current config
  const current = getConfig(); // Merge updates

  const updated = { ...current, ...updates }; // Set new configuration

  setConfig(updated);

  console.log('Configuration updated');
}

// Reload configuration from file
async function refreshConfig() {
  try {
    await reloadConfig();
    console.log('Configuration reloaded successfully');
  } catch (error) {
    console.error('Failed to reload config:', error.message);
  }
}

// Example usage
updateConfig({
  features: {
    darkMode: true,
    betaAccess: false,
  },
});
```

**When to use:**

- **User Preferences**: Update configuration based on user actions
- **Runtime Changes**: Modify configuration at runtime
- **Admin Actions**: Allow administrators to update settings
- **Rollback**: Revert to previously known good configuration

### Complete Dynamic Example

Here's a real-world example of dynamic configuration:

```javascript
import { getConfig, setConfig, reloadConfig } from '@voilajsx/appkit/config';

function createConfigManager() {
  // Track configuration history
  const history = [];

  return {
    // Get current configuration
    getCurrent() {
      return getConfig();
    }, // Update configuration

    update(path, value) {
      // Save current state to history
      history.push(getConfig()); // Get current config

      const current = getConfig(); // Build new configuration with update

      const updated = { ...current };
      const keys = path.split('.');
      let target = updated; // Navigate to the appropriate nesting level

      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) {
          target[keys[i]] = {};
        }
        target = target[keys[i]];
      } // Set the value

      target[keys[keys.length - 1]] = value; // Update configuration

      setConfig(updated);

      console.log(`Updated configuration: ${path} = ${JSON.stringify(value)}`);
      return updated;
    }, // Reload from file

    async reload() {
      // Save current state to history
      history.push(getConfig());

      try {
        const config = await reloadConfig();
        console.log('Configuration reloaded from file');
        return config;
      } catch (error) {
        console.error('Reload failed:', error.message);
        throw error;
      }
    }, // Revert to previous configuration

    revert() {
      if (history.length === 0) {
        console.log('No previous configuration to revert to');
        return getConfig();
      }

      const previous = history.pop();
      setConfig(previous);

      console.log('Reverted to previous configuration');
      return previous;
    },
  };
}
```

**When to implement:**

- **Configuration UI**: Backend for configuration interfaces
- **Admin Panels**: Allow admins to modify settings
- **Undo Functionality**: Revert configuration changes
- **Periodic Refresh**: Reload configuration periodically

## Complete Integration Example

Here's a complete Express application example integrating configuration:

```javascript
import express from 'express';
import {
  loadConfig,
  getConfig,
  defineSchema,
  validateConfig,
  getEnv,
} from '@voilajsx/appkit/config';

// Initialize application with configuration
async function initApp() {
  try {
    // Define configuration schema
    defineSchema('app', {
      type: 'object',
      properties: {
        server: {
          type: 'object',
          required: ['port'],
          properties: {
            port: { type: 'number', minimum: 1, maximum: 65535 },
            host: { type: 'string', default: 'localhost' },
          },
        },
        database: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string' },
          },
        },
        logging: {
          type: 'object',
          properties: {
            level: {
              type: 'string',
              enum: ['error', 'warn', 'info', 'debug'],
              default: 'info',
            },
          },
        },
      },
    }); // Determine environment

    const env = getEnv('NODE_ENV', 'development'); // Load configuration (env vars will be coerced to schema types automatically)

    await loadConfig(`./config/${env}.json`, {
      defaults: {
        server: {
          port: 3000,
          host: 'localhost',
        },
        logging: {
          level: env === 'production' ? 'warn' : 'debug',
        },
      },
      schema: 'app',
      watch: env === 'development',
    });

    console.log(`Configuration loaded for ${env} environment`); // Create Express app

    const app = express(); // Add config middleware

    app.use((req, res, next) => {
      req.config = {
        get: (key, defaultValue) => getConfig(key, defaultValue),
      };
      next();
    }); // Define routes

    app.get('/', (req, res) => {
      res.json({
        message: 'Config server running',
        env: env,
      });
    });

    app.get('/config', (req, res) => {
      // Only return safe configuration (omit secrets)
      const safeConfig = {
        server: getConfig('server'),
        logging: getConfig('logging'),
      };

      res.json(safeConfig);
    }); // Start server

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

// Start the application
initApp();
```

## Additional Resources

- 📘  
  [Developer Reference](https://www.google.com/search?q=https://github.com/voilajsx/appkit/blob/main/src/config/docs/DEVELOPER_REFERENCE.md) -
    Detailed implementation guide with examples
- 📗  
  [API Reference](https://www.google.com/search?q=https://github.com/voilajsx/appkit/blob/main/src/config/docs/API_REFERENCE.md) -
    Complete API documentation
- 📙  
  [LLM Code Generation Reference](https://www.google.com/search?q=https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md) -
    Guide for AI/LLM code generation

## Best Practices

### 🔐 Security

- Store secrets in environment variables, not configuration files
- Never commit sensitive information to version control
- Use different configuration files for different environments
- Validate configuration to prevent injection attacks

### 🏗️ Architecture

- Keep configuration modular and focused
- Define clear schemas for each configuration section
- Use references for shared schema components
- Separate configuration loading from usage

### 🚀 Performance

- Only enable file watching in development environments
- Cache configuration access for frequently used values
- Use shallow configuration hierarchies for faster access
- Minimize configuration reloading in production

### 👥 User Experience

- Provide clear error messages for configuration issues
- Document expected configuration structure
- Implement graceful fallbacks for missing configuration
- Make configuration changes easy to revert

---

\<p align="center"\>   Built with ❤️ in India by the \<a
href="https://github.com/orgs/voilajsx/people"\>VoilaJS Team\</a\> — powering
modern web development. \</p\>

```

```
