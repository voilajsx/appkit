# @voilajsx/appkit - Config Module 🔧

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Minimal, robust configuration management for Node.js applications

The Config module of `@voilajsx/appkit` provides a lightweight and flexible
solution for managing application configurations, supporting loading from JSON,
JavaScript, or `.env` files, schema validation, and environment variable
integration with automatic type coercion.

## Module Overview

The Config module offers a streamlined set of utilities for configuration
management:

| Feature               | What it does                            | Main functions                                   |
| --------------------- | --------------------------------------- | ------------------------------------------------ |
| **Config Loading**    | Load configuration from various sources | `loadConfig()`                                   |
| **Config Access**     | Retrieve configuration values           | `getConfig()`, `hasConfig()`                     |
| **Schema Validation** | Validate configuration structure        | `createConfigSchema()`, `validateConfigSchema()` |

## 🚀 Features

- **📁 Multiple Sources**: Load configuration from JSON, JavaScript, or `.env`
  files
- **✅ Schema Validation**: Ensure configurations match defined schemas
- **🔄 Environment Integration**: Integrate environment variables with automatic
  type coercion based on schemas
- **🛡️ Type Safety**: Coerce `.env` variables to correct types (e.g., numbers,
  booleans)
- **🎯 Framework Agnostic**: Works with any Node.js application, ideal for web
  frameworks

## 📦 Installation

```bash
npm install @voilajsx/appkit dotenv
```

**Note**: The `dotenv` package is required to load `.env` files and must be
installed separately.

## 🏃‍♂️ Quick Start

Import the functions you need and load configurations from files or `.env`
variables. Use schemas to validate and coerce types.

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
console.log(`Server running on port ${port}`);
```

## 📖 Core Functions

### Configuration Loading

| Function       | Purpose                                      | When to use                                        |
| -------------- | -------------------------------------------- | -------------------------------------------------- |
| `loadConfig()` | Loads configuration from source with options | Application startup, initial configuration loading |

```javascript
import dotenv from 'dotenv';
dotenv.config();

// Load from JSON file and .env
await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  schema: 'app',
  env: true,
});
```

### Configuration Access

| Function      | Purpose                               | When to use                                      |
| ------------- | ------------------------------------- | ------------------------------------------------ |
| `getConfig()` | Retrieves configuration value by path | Reading configuration values throughout your app |
| `hasConfig()` | Checks if configuration path exists   | Feature flags, conditional functionality         |

```javascript
// Get a value
const port = getConfig('server.port'); // Number if coerced by schema

// Get with fallback
const timeout = getConfig('api.timeout', 5000);

// Check if configuration exists
if (hasConfig('database.url')) {
  connectToDatabase();
}
```

### Schema Validation

| Function                 | Purpose                                | When to use                          |
| ------------------------ | -------------------------------------- | ------------------------------------ |
| `createConfigSchema()`   | Defines a named schema                 | Creating reusable validation schemas |
| `validateConfigSchema()` | Validates configuration against schema | Ensuring configuration correctness   |

```javascript
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
  validateConfigSchema(config, 'server');
  console.log('Configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

## 🔧 Configuration Options

Customize `loadConfig` with these options:

| Option     | Description                                           | Default     | Example                            |
| ---------- | ----------------------------------------------------- | ----------- | ---------------------------------- |
| `defaults` | Default values to merge with config                   | `{}`        | `{ server: { port: 3000 } }`       |
| `validate` | Whether to validate configuration                     | `true`      | `false` to skip validation         |
| `schema`   | Schema name to validate against and coerce types      | `undefined` | `'app'`                            |
| `env`      | Enable environment variable integration with coercion | `true`      | `false` to disable env integration |

```javascript
await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  validate: true,
  schema: 'app',
  env: true,
});
```

## 💡 Common Use Cases

| Use Case                      | Description                               | Components Used                        |
| ----------------------------- | ----------------------------------------- | -------------------------------------- |
| **Environment Configuration** | Load configs per environment (dev, prod)  | `loadConfig()`, `env: true`            |
| **Feature Flags**             | Toggle features based on config           | `getConfig()`, `hasConfig()`           |
| **App Initialization**        | Bootstrap app with validated settings     | `loadConfig()`, `createConfigSchema()` |
| **Database Settings**         | Configure database connections            | `loadConfig()` with schema validation  |
| **Type Safety**               | Ensure correct types for `.env` variables | `createConfigSchema()`, `env: true`    |

## 🛠️ Using with .env Files

The module integrates `.env` files via the `dotenv` package. Load `.env` files
before calling `loadConfig`:

```javascript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

await loadConfig(null, { schema: 'app', env: true });
```

Example `.env`:

```
SERVER_PORT=3000
SERVER_HOST=localhost
```

The module maps `UPPER_SNAKE_CASE` (e.g., `SERVER_PORT`) to `lower.dot.notation`
(e.g., `server.port`) and coerces types based on the schema.

## 🛡️ Best Practices

1. **Use .env for Secrets**: Store sensitive data (e.g., API keys) in `.env`
   files
2. **Validate Configurations**: Always define schemas to catch errors early
3. **Environment-Specific Configs**: Use `.env.development`, `.env.production`,
   etc.
4. **Avoid Committing .env**: Add `.env` to `.gitignore`
5. **Document Schemas**: Share schema definitions with your team
6. **Set Defaults**: Provide sensible defaults in schemas or `defaults` option

## 🔍 Error Handling

Handle errors using standard `Error` objects:

```javascript
try {
  await loadConfig('./config.json', { schema: 'app' });
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajsx/appkit/blob/main/src/config/docs/DEVELOPER_REFERENCE.md) -
  Implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/config/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajsx/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 📋 Example Code

Check the examples folder for working code:

- [Basic Usage](https://github.com/voilajsx/appkit/blob/main/src/config/examples/01-basic-usage.js) -
  Loading and accessing configuration
- [Environment Variables](https://github.com/voilajsx/appkit/blob/main/src/config/examples/02-environment-variables.js) -
  Using `.env` files with type coercion
- [Schema Validation](https://github.com/voilajsx/appkit/blob/main/src/config/examples/03-schema-validation.js) -
  Validating with schemas and defaults
- [JSON Files](https://github.com/voilajsx/appkit/blob/main/src/config/examples/04-json-files.js) -
  Loading from JSON configuration files
- [JavaScript Files](https://github.com/voilajsx/appkit/blob/main/src/config/examples/05-javascript-files.js) -
  Dynamic configuration with JavaScript files
- [Multiple Environments](https://github.com/voilajsx/appkit/blob/main/src/config/examples/06-multiple-environments.js) -
  Managing different environments with .env files

## 🧪 Testing

Run the test suite to verify functionality:

```bash
# Run all tests
npx vitest

# Run specific test file
npx vitest config.test.js
npx vitest schema.test.js
npx vitest environment.test.js
```

The test suite covers:

- ✅ Core configuration loading and access
- ✅ Schema validation and type coercion
- ✅ Environment variable integration
- ✅ Error handling and edge cases

## 🤝 Contributing

Contributions are welcome! See our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center"> Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development. </p>
