/**
 * JavaScript configuration files example
 * @module @voilajsx/appkit/config
 * @file src/config/examples/05-javascript-files.js
 *
 * Shows how to load configuration from JavaScript files
 * Create the JavaScript config files first, then run this example
 *
 * Run: node 05-javascript-files.js
 */

import { loadConfig, getConfig } from '../index.js';

/**
 * Load basic JavaScript configuration
 * @returns {Promise<void>}
 */
async function loadBasicJsConfig() {
  console.log('📋 Loading Basic JavaScript Config\n');

  try {
    // Load from JavaScript file
    await loadConfig('./files/config.js');

    console.log('Configuration loaded from config.js:');
    console.log(
      `Server: ${getConfig('server.host')}:${getConfig('server.port')}`
    );
    console.log(`Database: ${getConfig('database.url')}`);
    console.log(`Environment: ${getConfig('environment')}`);

    console.log('\n✅ Basic JavaScript loading complete!\n');
  } catch (error) {
    console.log('❌ Could not load config.js');
    console.log('Make sure you created the config.js file first!');
    console.log('');
  }
}

/**
 * Load JavaScript config with dynamic values
 * @returns {Promise<void>}
 */
async function loadDynamicJsConfig() {
  console.log('🔧 Loading Dynamic JavaScript Config\n');

  try {
    // Load config that uses environment variables and logic
    await loadConfig('./files/config.dynamic.js');

    console.log('Dynamic configuration loaded:');
    console.log(
      `Server: ${getConfig('server.host')}:${getConfig('server.port')}`
    );
    console.log(`Database: ${getConfig('database.url')}`);
    console.log(`Debug mode: ${getConfig('debug')}`);
    console.log(`Log level: ${getConfig('logging.level')}`);
    console.log(`Features: ${JSON.stringify(getConfig('features'))}`);

    console.log('\n✅ Dynamic JavaScript loading complete!\n');
  } catch (error) {
    console.log('❌ Could not load config.dynamic.js');
    console.log('This file is optional for this example');
    console.log('');
  }
}

/**
 * Load JavaScript config with functions
 * @returns {Promise<void>}
 */
async function loadAdvancedJsConfig() {
  console.log('⚡ Loading Advanced JavaScript Config\n');

  try {
    // Load config that exports functions or complex logic
    await loadConfig('./files/config.advanced.js');

    console.log('Advanced configuration loaded:');
    console.log(`Database URL: ${getConfig('database.url')}`);
    console.log(`API endpoints: ${JSON.stringify(getConfig('api.endpoints'))}`);
    console.log(`Cache settings: ${JSON.stringify(getConfig('cache'))}`);

    console.log('\n✅ Advanced JavaScript loading complete!\n');
  } catch (error) {
    console.log('❌ Could not load config.advanced.js');
    console.log('This file is optional for this example');
    console.log('');
  }
}

/**
 * Main function
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('⚙️ JavaScript Configuration Files Examples\n');

    await loadBasicJsConfig();
    await loadDynamicJsConfig();
    await loadAdvancedJsConfig();

    console.log('🎉 JavaScript files examples complete!');
    console.log('\nKey benefits:');
    console.log('- Use JavaScript logic in configuration');
    console.log('- Access environment variables dynamically');
    console.log('- Conditional configuration based on environment');
    console.log('- Reusable configuration patterns');
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
