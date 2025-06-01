/**
 * Basic configuration loading and accessing example
 * @module @voilajsx/appkit/config
 * @file src/config/examples/01-basic-usage.js
 *
 * Run: node 01-basic-usage.js
 */

import { loadConfig, getConfig, hasConfig } from '../index.js';

/**
 * Simple example showing how to load and use configuration
 * @returns {Promise<void>}
 */
async function simpleExample() {
  console.log('🚀 Simple Configuration Example\n');

  // Step 1: Load configuration from an object
  await loadConfig(
    {
      server: {
        port: 3000,
        host: 'localhost',
      },
      database: {
        url: 'mongodb://localhost/myapp',
      },
      features: {
        analytics: true,
      },
    },
    {
      env: false, // Disable environment variable loading for this example
    }
  );

  // Step 2: Get configuration values
  const port = getConfig('server.port');
  const host = getConfig('server.host');
  console.log(`Server will run on ${host}:${port}`);

  // Step 3: Get values with fallbacks
  const timeout = getConfig('api.timeout', 5000); // 5000 if not found
  console.log(`API timeout: ${timeout}ms`);

  // Step 4: Check if a setting exists
  if (hasConfig('features.analytics')) {
    console.log('Analytics is enabled');
  }

  console.log('\n✅ Simple example complete!');
}

/**
 * Example with defaults and merging
 * @returns {Promise<void>}
 */
async function defaultsExample() {
  console.log('\n📋 Configuration with Defaults Example\n');

  // Load config with default values
  await loadConfig(
    {
      server: { port: 8080 }, // Only port specified
      features: { notifications: false },
    },
    {
      defaults: {
        server: {
          port: 3000, // Will be overridden by 8080
          host: 'localhost', // Will be used since not specified above
        },
        database: {
          url: 'mongodb://localhost/defaultapp', // Will be added
        },
      },
      env: false, // Disable environment variable loading
    }
  );

  console.log('Port (from config):', getConfig('server.port')); // 8080
  console.log('Host (from defaults):', getConfig('server.host')); // localhost
  console.log('Database (from defaults):', getConfig('database.url')); // mongodb://localhost/defaultapp

  console.log('\n✅ Defaults example complete!');
}

/**
 * Example showing different ways to access configuration
 * @returns {void}
 */
function accessExample() {
  console.log('\n🔍 Different Ways to Access Configuration\n');

  // Get a single value
  const port = getConfig('server.port');
  console.log('Single value:', port);

  // Get an entire section
  const serverConfig = getConfig('server');
  console.log('Entire section:', serverConfig);

  // Get with fallback
  const maxConnections = getConfig('database.maxConnections', 100);
  console.log('With fallback:', maxConnections);

  // Check existence before getting
  if (hasConfig('features.beta')) {
    console.log('Beta features:', getConfig('features.beta'));
  } else {
    console.log('Beta features not configured');
  }

  // Get all configuration (now clean!)
  const allConfig = getConfig();
  console.log('All config keys:', Object.keys(allConfig));

  console.log('\n✅ Access example complete!');
}

/**
 * Main function to run all examples
 * @returns {Promise<void>}
 */
async function main() {
  try {
    await simpleExample();
    await defaultsExample();
    accessExample();

    console.log('\n🎉 All examples completed successfully!');
    console.log('\nNext steps:');
    console.log('- Try loading from a JSON file');
    console.log('- Check out environment variables example');
    console.log('- Learn about schema validation');
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
