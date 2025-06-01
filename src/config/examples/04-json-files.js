/**
 * JSON configuration files example
 * @module @voilajsx/appkit/config
 * @file src/config/examples/04-json-files.js
 *
 * Shows how to load configuration from JSON files
 * Create the JSON files first, then run this example
 *
 * Run: node 04-json-files.js
 */

import { loadConfig, getConfig } from '../index.js';

/**
 * Load basic JSON configuration
 * @returns {Promise<void>}
 */
async function loadBasicJsonConfig() {
  console.log('📋 Loading Basic JSON Config\n');

  try {
    // Load from JSON file
    await loadConfig('./files/config.json');

    console.log('Configuration loaded from config.json:');
    console.log(
      `Server: ${getConfig('server.host')}:${getConfig('server.port')}`
    );
    console.log(`Database: ${getConfig('database.url')}`);

    console.log('\n✅ Basic JSON loading complete!\n');
  } catch (error) {
    console.log('❌ Could not load config.json');
    console.log('Make sure you created the config.json file first!');
    console.log('');
  }
}

/**
 * Load JSON with defaults
 * @returns {Promise<void>}
 */
async function loadJsonWithDefaults() {
  console.log('🔧 Loading JSON with Defaults\n');

  try {
    // Load with defaults
    await loadConfig('./files/config.json', {
      defaults: {
        server: {
          timeout: 30000,
          cors: true,
        },
        logging: {
          level: 'info',
        },
      },
    });

    console.log('Configuration with defaults merged:');
    console.log(
      `Server: ${getConfig('server.host')}:${getConfig('server.port')}`
    );
    console.log(`Timeout: ${getConfig('server.timeout')} (from defaults)`);
    console.log(`CORS: ${getConfig('server.cors')} (from defaults)`);
    console.log(`Log level: ${getConfig('logging.level')} (from defaults)`);

    console.log('\n✅ JSON with defaults complete!\n');
  } catch (error) {
    console.log('❌ Could not load config.json with defaults');
    console.log('');
  }
}

/**
 * Try loading production config
 * @returns {Promise<void>}
 */
async function loadProductionConfig() {
  console.log('🌍 Loading Production Config\n');

  try {
    await loadConfig('./files/config.prod.json');

    console.log('Production configuration loaded:');
    console.log(
      `Server: ${getConfig('server.host')}:${getConfig('server.port')}`
    );
    console.log(`Database SSL: ${getConfig('database.ssl')}`);
    console.log(`Log level: ${getConfig('logging.level')}`);

    console.log('\n✅ Production config complete!\n');
  } catch (error) {
    console.log('❌ Could not load config.prod.json');
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
    console.log('📄 JSON Configuration Files Examples\n');

    await loadBasicJsonConfig();
    await loadJsonWithDefaults();
    await loadProductionConfig();

    console.log('🎉 JSON files examples complete!');
    console.log('\nKey benefits:');
    console.log('- Store configuration separate from code');
    console.log('- Easy to edit without code changes');
    console.log('- Environment-specific configurations');
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
