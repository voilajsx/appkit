/**
 * Environment variables with .env file example
 * @module @voilajsx/appkit/config
 * @file src/config/examples/02-environment-variables.js
 *
 * Run: node 02-environment-variables.js
 */

import { loadConfig, getConfig, createConfigSchema } from '../index.js';
import dotenv from 'dotenv';

/**
 * Simple example showing .env file loading with type coercion
 * @returns {Promise<void>}
 */
async function simpleEnvExample() {
  console.log('🌍 Simple .env File Example\n');

  // Load .env file
  dotenv.config({ path: './files/.env' });

  // Define schema for type coercion
  createConfigSchema('app', {
    type: 'object',
    properties: {
      server: {
        type: 'object',
        properties: {
          port: { type: 'number' },
          host: { type: 'string' },
        },
      },
      database: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          pool: {
            type: 'object',
            properties: {
              size: { type: 'number' },
            },
          },
        },
      },
      features: {
        type: 'object',
        properties: {
          analytics: { type: 'boolean' },
        },
      },
    },
  });

  // Load config with .env integration
  await loadConfig(
    {
      server: { port: 3000 },
      features: { analytics: false },
    },
    {
      env: true,
      schema: 'app',
    }
  );

  // Show the results
  console.log('Values from .env with type coercion:');
  console.log(
    `server.port: ${getConfig('server.port')} (${typeof getConfig('server.port')})`
  );
  console.log(
    `server.host: ${getConfig('server.host')} (${typeof getConfig('server.host')})`
  );
  console.log(
    `database.pool.size: ${getConfig('database.pool.size')} (${typeof getConfig('database.pool.size')})`
  );
  console.log(
    `features.analytics: ${getConfig('features.analytics')} (${typeof getConfig('features.analytics')})`
  );

  console.log('\n✅ Example complete!');
}

/**
 * Shows the environment variable mapping
 * @returns {void}
 */
function showMapping() {
  console.log('\n📝 Environment Variable Mapping:\n');
  console.log('SERVER_PORT=8080      → server.port (number)');
  console.log('SERVER_HOST=localhost → server.host (string)');
  console.log('DATABASE_POOL_SIZE=25 → database.pool.size (number)');
  console.log('FEATURES_ANALYTICS=true → features.analytics (boolean)');
  console.log('\nRule: UPPER_SNAKE_CASE → lower.dot.notation');
}

/**
 * Main function
 * @returns {Promise<void>}
 */
async function main() {
  try {
    await simpleEnvExample();
    showMapping();

    console.log('\n🎉 Environment variables example complete!');
    console.log('\nNext: Try changing values in your .env file and run again');
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
    console.log('Make sure you created a .env file in this directory!');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
