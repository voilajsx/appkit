/**
 * Environment Variables - @voilajs/appkit Config Module
 *
 * Shows how to work with environment variables
 * No external dependencies needed - just run it!
 *
 * Run: node 02-environment-variables.js
 */

import { loadConfig, getConfig, getEnv } from '@voilajs/appkit/config';

async function demo() {
  console.log('=== Environment Variables Demo ===\n');

  // Set environment variables for demo
  process.env.PORT = '4000';
  process.env.NODE_ENV = 'development';
  process.env.APP_FEATURE_ENABLED = 'true';

  // 1. Direct environment access
  console.log('1. Direct environment access:');
  const nodeEnv = getEnv('NODE_ENV');
  const port = getEnv('PORT');
  const missing = getEnv('MISSING', 'default');

  console.log(`NODE_ENV: ${nodeEnv}`);
  console.log(`PORT: ${port}`);
  console.log(`MISSING: ${missing}\n`);

  // 2. Environment integration with config
  console.log('2. Environment integration with config:');
  await loadConfig(
    {
      server: {
        port: 3000, // Will be overridden by PORT env var
        host: 'localhost',
      },
    },
    { env: true }
  );

  console.log('Configuration after env integration:');
  console.log(`server.port: ${getConfig('server.port')}`);
  console.log(`feature.enabled: ${getConfig('feature.enabled')}`);
}

demo().catch(console.error);

/*
Expected output:

=== Environment Variables Demo ===

1. Direct environment access:
NODE_ENV: development
PORT: 4000
MISSING: default

2. Environment integration with config:
Configuration after env integration:
server.port: 4000
feature.enabled: true
*/
