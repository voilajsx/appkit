/**
 * Basic Usage - @voilajs/appkit Config Module
 *
 * Simple example showing basic config operations
 * No external dependencies needed - just run it!
 *
 * Run: node 01-basic-usage.js
 */

import { loadConfig, getConfig } from '@voilajs/appkit/config';

async function demo() {
  console.log('=== Basic Config Demo ===\n');

  // Create a simple configuration
  console.log('1. Loading configuration...');
  await loadConfig({
    app: {
      name: 'Demo App',
      version: '1.0.0',
    },
    server: {
      port: 3000,
      host: 'localhost',
    },
  });
  console.log('Configuration loaded\n');

  // Access configuration values
  console.log('2. Accessing configuration values...');
  const appName = getConfig('app.name');
  const port = getConfig('server.port');
  const missingValue = getConfig('database.url', 'mongodb://localhost/demo');

  console.log(`App name: ${appName}`);
  console.log(`Server port: ${port}`);
  console.log(`Database URL: ${missingValue} (default value)`);
  console.log('');

  // Get entire configuration
  console.log('3. Getting entire configuration:');
  const config = getConfig();
  console.log(JSON.stringify(config, null, 2));
}

demo().catch(console.error);

/*
Expected output:

=== Basic Config Demo ===

1. Loading configuration...
Configuration loaded

2. Accessing configuration values...
App name: Demo App
Server port: 3000
Database URL: mongodb://localhost/demo (default value)

3. Getting entire configuration:
{
  "app": {
    "name": "Demo App",
    "version": "1.0.0"
  },
  "server": {
    "port": 3000,
    "host": "localhost"
  }
}
*/
