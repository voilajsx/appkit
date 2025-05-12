/**
 * Dynamic Config - @voilajs/appkit Config Module
 *
 * Shows how to update configuration dynamically
 * No external dependencies needed - just run it!
 *
 * Run: node 04-dynamic-config.js
 */

import {
  setConfig,
  getConfig,
  hasConfig,
  clearConfig,
} from '@voilajs/appkit/config';

async function demo() {
  console.log('=== Dynamic Config Demo ===\n');

  // 1. Set initial configuration
  console.log('1. Setting initial configuration:');
  setConfig({
    app: { name: 'Demo App' },
    server: { port: 3000 },
  });
  console.log(JSON.stringify(getConfig(), null, 2));

  // 2. Check if config exists
  console.log('\n2. Checking config existence:');
  console.log(`Has server.port? ${hasConfig('server.port')}`);
  console.log(`Has database.url? ${hasConfig('database.url')}`);

  // 3. Update configuration
  console.log('\n3. Updating configuration:');
  const current = getConfig();
  setConfig({
    ...current,
    server: { ...current.server, port: 4000 },
    database: { url: 'mongodb://localhost/demo' },
  });
  console.log(JSON.stringify(getConfig(), null, 2));

  // 4. Clear configuration
  console.log('\n4. Clearing configuration:');
  clearConfig();
  console.log(`Config after clearing: ${JSON.stringify(getConfig())}`);
}

demo().catch(console.error);

/*
Expected output:

=== Dynamic Config Demo ===

1. Setting initial configuration:
{
  "app": {
    "name": "Demo App"
  },
  "server": {
    "port": 3000
  }
}

2. Checking config existence:
Has server.port? true
Has database.url? false

3. Updating configuration:
{
  "app": {
    "name": "Demo App"
  },
  "server": {
    "port": 4000
  },
  "database": {
    "url": "mongodb://localhost/demo"
  }
}

4. Clearing configuration:
Config after clearing: {}
*/
