# @voilajsx/appkit - Config Module ⚙️

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Zero-config, convention-driven configuration management for Node.js.

The Config module provides **one function** to access a rich, nested
configuration object built automatically from your environment variables. No
more manual parsing or boilerplate.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `configure.get()`, and your entire app config is
  ready.
- **🔩 Convention over Configuration** - `UPPER_SNAKE__CASE` env vars become
  nested `config.objects`.
- **🔧 Zero Configuration** - No setup files needed. It just works.
- **🛡️ Type-Safe** - Automatically converts `"true"`, `"false"`, and numbers to
  their correct types.
- **🌍 Environment-First** - Built around standard `process.env` for perfect
  compatibility with Docker, Vercel, etc.

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (10 seconds)

1.  **Set Environment Variables** (in your `.env` file or shell):

    ```bash
    # Database settings
    DATABASE__HOST=localhost
    DATABASE__PORT=5432
    DATABASE__CREDENTIALS__USER=admin

    # Feature Flags
    FEATURES__ENABLE_BETA=true
    ```

2.  **Use in Your Code:**

    ```javascript
    // One import, one function call
    import { configure } from '@voilajsx/appkit/config';

    const config = configure.get();

    // Access nested values with dot notation
    const dbHost = config.get('database.host'); // 'localhost'
    const dbPort = config.get('database.port'); // 5432 (a number!)
    const dbUser = config.get('database.credentials.user'); // 'admin'
    const isBeta = config.get('features.enable_beta'); // true (a boolean!)

    // Get a default value if one isn't set
    const timeout = config.get('redis.timeout', 5000); // 5000

    console.log(`Connecting to ${dbUser}@${dbHost}:${dbPort}`);
    ```

**That's it!** All your environment variables are available in a clean,
structured, and type-safe object.

## 📖 Complete API Reference

First, get the singleton config instance:

```javascript
import { configure } from '@voilajsx/appkit/config';
const config = configure.get();
```

The `conf` object has the following methods:

### `config.get(path, [defaultValue])`

Retrieves a value from the configuration using dot notation.

- `path` (string): The key to retrieve (e.g., `'app.name'`, `'database.port'`).
- `defaultValue` (any): An optional value to return if the key is not found.

### `config.has(path)`

Checks if a key exists in the configuration.

- `path` (string): The key to check.
- Returns `true` or `false`.

### `config.getAll()`

Returns the entire, immutable configuration object. Useful for debugging or
passing the whole config to other modules.

### `config.clearCache()`

A top-level function to clear the singleton instance. **This should only be used
in tests** where you need to reload the configuration from a modified
environment.

```javascript
import { configure } from '@voilajsx/appkit/config';

describe('My Service', () => {
  beforeEach(() => {
    // Clear the cache before each test to ensure a fresh config
    config.clearCache();
  });

  test('should use production endpoint', () => {
    process.env.API__BASE_URL = 'https://api.prod.com';
    const config = configure.get();
    expect(config.get('api.base_url')).toBe('https://api.prod.com');
  });
});
```

## 📜 The `UPPER_SNAKE__CASE` Convention

This is the core concept of the module.

- Each `__` (double underscore) in an environment variable name creates a new
  level of nesting.
- The entire key is converted to lowercase.

| Environment Variable                   | Resulting Path                           |
| -------------------------------------- | ---------------------------------------- |
| `SERVER__PORT=3000`                    | `config.get('server.port')`              |
| `DATABASE__CONNECTION__HOST=db.domain` | `config.get('database.connection.host')` |
| `STRIPE__API_KEY=sk_test_123`          | `config.get('stripe.api_key')`           |

## 🚀 Migration Guide

### From `voilajs/platform/config`

The new AppKit module is a direct, more modular replacement.

```javascript
// Before
import { getConfig, getConfigValue } from 'voilajs/platform/config.js';
const fullConfig = getConfig();
const port = getConfigValue('server.port');

// After
import { configure } from '@voilajsx/appkit/config';
const config = configure.get();
const port = config.get('server.port');
const fullConfig = config.getAll();
```

The new AppKit version is more generic and does not include application-specific
defaults like `server.host` or validation rules. These should be defined by the
application consuming the configuration.

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
