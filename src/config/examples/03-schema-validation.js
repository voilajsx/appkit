/**
 * Schema Validation - @voilajsx/appkit Config Module
 *
 * Simple example of schema validation
 * No external dependencies needed - just run it!
 *
 * Run: node 03-schema-validation.js
 */

import {
  defineSchema,
  validateConfig,
  clearConfig,
} from '@voilajsx/appkit/config'; // Corrected import and added clearConfig

async function demo() {
  // This line is useful for ensuring a clean slate for the example,
  // especially in environments where module state might persist.
  clearConfig();

  console.log('=== Schema Validation Demo ===\n');

  // 1. Define a simple schema with a UNIQUE NAME
  console.log('1. Defining a schema...');
  // Changed 'server' to 'demoServerSchema' to avoid conflicts
  defineSchema('demoServerSchema', {
    // <--- Changed schema name here
    type: 'object',
    required: ['port'],
    properties: {
      port: {
        type: 'number',
        minimum: 1000,
      },
      host: {
        type: 'string',
        default: 'localhost',
      },
    },
  });

  // 2. Validate valid configuration
  console.log('\n2. Validating valid configuration:');
  const validConfig = {
    port: 3000,
    host: 'example.com',
  };

  try {
    // Validate against the new schema name
    validateConfig(validConfig, 'demoServerSchema'); // <--- Changed schema name here
    console.log('✓ Configuration is valid');
  } catch (error) {
    console.error('✗ Validation failed:', error.message);
  }

  // 3. Validate invalid configuration
  console.log('\n3. Validating invalid configuration:');
  const invalidConfig = {
    port: 80, // Below minimum (1000)
  };

  try {
    // Validate against the new schema name
    validateConfig(invalidConfig, 'demoServerSchema'); // <--- Changed schema name here
    console.log('✓ Configuration is valid');
  } catch (error) {
    console.log('✗ Validation failed as expected');
    if (error.details?.errors) {
      console.log('  Error:', error.details.errors[0].message);
    }
  }
}

demo().catch(console.error);

/*
Expected output:

=== Schema Validation Demo ===

1. Defining a schema...

2. Validating valid configuration:
✓ Configuration is valid

3. Validating invalid configuration:
✗ Validation failed as expected
  Error: Value must be at least 1000
*/
