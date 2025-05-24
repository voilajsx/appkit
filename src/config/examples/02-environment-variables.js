/**
 * Environment Variables - @voilajsx/appkit Config Module
 *
 * Shows how to work with environment variables, including automatic type coercion via schema.
 * No external dependencies needed - just run it!
 *
 * Run: node 02-environment-variables.js
 */

import { loadConfig, getConfig, getEnv } from '@voilajsx/appkit/config'; // Corrected import

async function demo() {
  console.log('=== Environment Variables Demo ===\n');

  // Set environment variables for demo
  process.env.PORT = '4000';
  process.env.NODE_ENV = 'development';
  process.env.APP_FEATURE_ENABLED = 'true'; // Will be coerced to boolean true

  // 1. Direct environment access
  console.log('1. Direct environment access:');
  const nodeEnv = getEnv('NODE_ENV');
  const portString = getEnv('PORT'); // getEnv always returns string
  const missing = getEnv('MISSING', 'default');

  console.log(`NODE_ENV: ${nodeEnv}`);
  console.log(`PORT (string from getEnv): ${portString}`);
  console.log(`MISSING: ${missing}\n`);

  // Define a schema for loadConfig to enable type coercion
  const configSchema = {
    type: 'object',
    properties: {
      server: {
        type: 'object',
        properties: {
          port: { type: 'number' }, // Define port as number
          host: { type: 'string' },
        },
      },
      feature: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' }, // Define enabled as boolean
        },
      },
    },
  };

  // 2. Environment integration with config and schema for type coercion
  console.log(
    '2. Environment integration with config (with schema for type coercion):'
  );
  await loadConfig(
    {
      server: {
        port: 3000, // Will be overridden by PORT env var and coerced to number
        host: 'localhost',
      },
      feature: {
        enabled: false, // Will be overridden by APP_FEATURE_ENABLED env var and coerced to boolean
      },
    },
    {
      env: true,
      schema: configSchema, // Provide schema to enable type coercion
      map: {
        // Explicitly map env vars to config paths if needed
        PORT: 'server.port',
        APP_FEATURE_ENABLED: 'feature.enabled',
      },
    }
  );

  console.log('Configuration after env integration:');
  // getConfig('server.port') will now be a number (4000)
  console.log(
    `server.port: ${getConfig('server.port')} (type: ${typeof getConfig('server.port')})`
  );
  // getConfig('feature.enabled') will now be a boolean (true)
  console.log(
    `feature.enabled: ${getConfig('feature.enabled')} (type: ${typeof getConfig('feature.enabled')})`
  );
}

demo().catch(console.error);

/*
Expected output:

=== Environment Variables Demo ===

1. Direct environment access:
NODE_ENV: development
PORT (string from getEnv): 4000
MISSING: default

2. Environment integration with config (with schema for type coercion):
Configuration after env integration:
server.port: 4000 (type: number)
feature.enabled: true (type: boolean)
*/
