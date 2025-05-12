# @voilajs/appkit - Config Module 🔧

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Robust, flexible configuration management for Node.js applications

The Config module of `@voilajs/appkit` provides powerful configuration
management utilities including loading from multiple sources, validation,
environment variable integration, and real-time configuration updates.

## 🚀 Features

- **📁 Multiple Sources** - Load configuration from JSON, JavaScript, or .env
  files
- **✅ Schema Validation** - Validate your configuration against schemas
- **🔄 Environment Integration** - Automatically integrate with environment
  variables
- **🔍 Variable Interpolation** - Reference values within your configuration
- **👀 Auto-Reload** - Watch for file changes and reload configuration
- **🛡️ Type Safety** - Strong typing support with JSDoc annotations
- **🎯 Framework Agnostic** - Works with any Node.js application

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import { loadConfig, getConfig } from '@voilajs/appkit/config';

// Load configuration
const config = await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  required: ['database.url'],
});

// Access configuration values
const port = getConfig('server.port'); // 3000
const dbUrl = getConfig('database.url');
console.log(`Server running on port ${port}`);
```

## 📋 Examples

### Loading Configuration

```javascript
// From JSON file
const config = await loadConfig('./config.json');

// From JavaScript file
const config = await loadConfig('./config.js');

// From .env file
const config = await loadConfig('./.env');

// From object
const config = await loadConfig({
  server: { port: 3000 },
  database: { url: 'mongodb://localhost/myapp' },
});

// With options
const config = await loadConfig('./config.json', {
  defaults: {
    server: { port: 3000, host: 'localhost' },
    logging: { level: 'info' },
  },
  required: ['api.key'],
  env: true, // Integrate with environment variables
  watch: true, // Auto-reload on file changes
  schema: 'app', // Validate against predefined schema
});
```

### Accessing Configuration

```javascript
// Get specific values
const port = getConfig('server.port');
const dbUrl = getConfig('database.url');

// With default value
const timeout = getConfig('api.timeout', 5000);

// Check if configuration exists
if (hasConfig('feature.darkMode')) {
  enableDarkMode();
}

// Get environment variable
const nodeEnv = getEnv('NODE_ENV', 'development');
```

### LLM Code Generation

You can use large language models like ChatGPT or Claude to generate code for
common configuration scenarios using the `@voilajs/appkit/config` module. The
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md)
document is designed specifically for LLMs to understand the module's
capabilities.

#### Sample Prompt

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md and then implement a configuration system for my Express app that includes:
- Loading from different files per environment (dev, staging, prod)
- Schema validation for required fields
- Environment variable integration
- Auto-reload during development
```

## 📖 Core Functions

### Configuration Loading

| Function         | Description                              | Usage                            |
| ---------------- | ---------------------------------------- | -------------------------------- |
| `loadConfig()`   | Loads configuration from various sources | App startup, config loading      |
| `setConfig()`    | Sets configuration directly              | Manual configuration updates     |
| `clearConfig()`  | Clears all configuration                 | Testing, configuration reset     |
| `reloadConfig()` | Reloads configuration from file          | Config updates, refresh settings |

```javascript
// Load configuration
const config = await loadConfig('./config.json');

// Set configuration programmatically
setConfig({ server: { port: 3000 } });

// Reload configuration
await reloadConfig();
```

### Configuration Access

| Function      | Description                    | Usage                            |
| ------------- | ------------------------------ | -------------------------------- |
| `getConfig()` | Gets configuration values      | Accessing settings, app config   |
| `hasConfig()` | Checks if configuration exists | Feature flags, optional settings |
| `getEnv()`    | Gets environment variable      | Runtime settings, secrets        |

```javascript
// Get configuration value
const port = getConfig('server.port');

// Check if configuration exists
if (hasConfig('features.newUi')) {
  enableNewUi();
}

// Get environment variable
const apiKey = getEnv('API_KEY');
```

### Validation

| Function            | Description                              | Usage                             |
| ------------------- | ---------------------------------------- | --------------------------------- |
| `validateConfig()`  | Validates configuration against a schema | Config validation, type checking  |
| `defineSchema()`    | Defines a validation schema              | Schema creation, type definitions |
| `getConfigSchema()` | Gets a defined schema                    | Schema reuse, validation          |

```javascript
// Define a schema
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

// Validate configuration
validateConfig(config, 'server');
```

## 🔧 Configuration Options

### Loading Options

```javascript
loadConfig('./config.json', {
  // Default values to merge with loaded configuration
  defaults: {
    server: {
      port: 3000,
      host: 'localhost',
    },
  },

  // Required configuration paths
  required: ['database.url', 'api.key'],

  // Enable schema validation
  validate: true,

  // Schema to validate against
  schema: 'app',

  // Enable environment variable integration
  env: true,

  // Watch for configuration file changes
  watch: true,

  // Enable variable interpolation
  interpolate: true,
});
```

## 💡 Common Use Cases

### Environment-specific Configuration

```javascript
// Load environment-specific configuration
const env = process.env.NODE_ENV || 'development';
const config = await loadConfig(`./config/${env}.json`, {
  defaults: require('./config/defaults.json'),
  env: true,
});
```

### Schema Validation

```javascript
// Define schemas
defineSchema('database', {
  type: 'object',
  required: ['url'],
  properties: {
    url: { type: 'string' },
    pool: {
      type: 'object',
      properties: {
        min: { type: 'number', default: 2 },
        max: { type: 'number', default: 10 },
      },
    },
  },
});

defineSchema('app', {
  type: 'object',
  required: ['database'],
  properties: {
    server: {
      type: 'object',
      properties: {
        port: { type: 'number', default: 3000 },
      },
    },
    database: { $ref: 'database' },
  },
});

// Load and validate
const config = await loadConfig('./config.json', {
  schema: 'app',
});
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Store secrets in environment variables, not config
   files
2. **Validation**: Always validate configuration to prevent unexpected inputs
3. **Configuration Files**: Never commit sensitive configuration to version
   control
4. **Least Privilege**: Only expose necessary configuration to different parts
   of your app
5. **Schema Validation**: Use schemas to ensure type safety and required fields

## 📊 Performance Tips

- Only enable file watching in development environments
- Use shallow object paths for frequently accessed configuration
- Cache configuration values that are accessed often
- Optimize schema complexity to minimize validation overhead
- Use environment variables for production configuration

## 🔍 Error Handling

All functions throw descriptive errors that should be caught and handled
appropriately:

```javascript
try {
  await loadConfig('./config.json', {
    required: ['api.key'],
  });
} catch (error) {
  if (error.code === 'MISSING_REQUIRED_FIELDS') {
    console.error(
      'Missing required configuration fields:',
      error.details.missing
    );
  } else if (error.code === 'FILE_NOT_FOUND') {
    console.error('Configuration file not found');
  } else {
    console.error('Configuration error:', error.message);
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajs/appkit/blob/main/src/config/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/config/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
