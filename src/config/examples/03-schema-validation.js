/**
 * Schema validation example
 * @module @voilajsx/appkit/config
 * @file src/config/examples/03-schema-validation.js
 *
 * Run: node 03-schema-validation.js
 */

import {
  loadConfig,
  getConfig,
  createConfigSchema,
  validateConfigSchema,
} from '../index.js';

/**
 * Simple schema validation example
 * @returns {Promise<void>}
 */
async function simpleSchemaExample() {
  console.log('📋 Simple Schema Validation Example\n');

  // Create a schema
  createConfigSchema('server', {
    type: 'object',
    required: ['port'],
    properties: {
      port: { type: 'number', minimum: 1024 },
      host: { type: 'string', default: 'localhost' },
    },
  });

  // Valid configuration that matches the schema structure
  const validConfig = {
    port: 3000,
    host: 'localhost',
  };

  // Load with validation
  await loadConfig(validConfig, {
    schema: 'server',
    validate: true,
  });

  console.log('✅ Configuration validated and loaded');
  console.log(`Server: ${getConfig('host')}:${getConfig('port')}`);

  console.log('\n✅ Schema validation complete!\n');
}

/**
 * Show validation errors
 * @returns {void}
 */
function validationErrorsExample() {
  console.log('❌ Validation Errors Example\n');

  // Try invalid configurations
  const invalidConfigs = [
    {}, // Missing required port
    { port: 'invalid' }, // Wrong type
    { port: 80 }, // Below minimum
  ];

  invalidConfigs.forEach((config, i) => {
    try {
      validateConfigSchema(config, 'server');
      console.log(`❌ Config ${i + 1}: Should have failed`);
    } catch (error) {
      console.log(
        `✅ Config ${i + 1}: ${error.message.split(':')[1]?.trim() || error.message}`
      );
    }
  });

  console.log('\n✅ Error examples complete!\n');
}

/**
 * Schema with defaults
 * @returns {Promise<void>}
 */
async function schemaDefaultsExample() {
  console.log('🔧 Schema with Defaults Example\n');

  createConfigSchema('app', {
    type: 'object',
    properties: {
      port: { type: 'number', default: 3000 },
      debug: { type: 'boolean', default: false },
      timeout: { type: 'number', default: 5000 },
    },
  });

  // Minimal config - schema will add defaults
  await loadConfig(
    { port: 8080 },
    {
      schema: 'app',
      validate: true,
    }
  );

  console.log('Values with schema defaults:');
  console.log(`port: ${getConfig('port')} (provided)`);
  console.log(`debug: ${getConfig('debug')} (default)`);
  console.log(`timeout: ${getConfig('timeout')} (default)`);

  console.log('\n✅ Defaults example complete!');
}

/**
 * Main function
 * @returns {Promise<void>}
 */
async function main() {
  try {
    await simpleSchemaExample();
    validationErrorsExample();
    await schemaDefaultsExample();

    console.log('\n🎉 Schema validation examples complete!');
    console.log('\nKey benefits:');
    console.log('- Catch configuration errors early');
    console.log('- Ensure correct data types');
    console.log('- Provide default values automatically');
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
