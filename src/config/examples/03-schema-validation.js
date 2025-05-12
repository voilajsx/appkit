/**
 * Schema Validation - @voilajs/appkit Config Module
 *
 * Simple example of schema validation
 * No external dependencies needed - just run it!
 *
 * Run: node 03-schema-validation.js
 */

import { defineSchema, validateConfig } from '@voilajs/appkit/config';

async function demo() {
  console.log('=== Schema Validation Demo ===\n');

  // 1. Define a simple schema
  console.log('1. Defining a schema...');
  defineSchema('server', {
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
    validateConfig(validConfig, 'server');
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
    validateConfig(invalidConfig, 'server');
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
