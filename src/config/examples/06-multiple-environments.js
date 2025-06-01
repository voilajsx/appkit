/**
 * Multiple environments with .env files example
 * @module @voilajsx/appkit/config
 * @file src/config/examples/06-multiple-environments.js
 *
 * Shows how to manage different .env files for different environments
 *
 * Run: node 06-multiple-environments.js
 * Run: NODE_ENV=development node 06-multiple-environments.js
 */

import { loadConfig, getConfig, createConfigSchema } from '../index.js';
import dotenv from 'dotenv';

/**
 * Load environment-specific .env files
 * @returns {Promise<void>}
 */
async function loadEnvironmentSpecificEnv() {
  console.log('🌍 Environment-Specific .env Files\n');

  const env = process.env.NODE_ENV || 'production';
  console.log(`Current environment: ${env}`);

  // Load environment-specific .env file from files folder
  const envFiles = [`./files/.env.${env}`, './files/.env'];

  console.log('Loading .env files in order:');
  for (const envFile of envFiles) {
    try {
      dotenv.config({ path: envFile });
      console.log(`✅ Loaded: ${envFile}`);
    } catch (error) {
      console.log(`❌ Not found: ${envFile}`);
    }
  }

  // Create schema for type coercion
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
          cache: { type: 'boolean' },
        },
      },
      app: {
        type: 'object',
        properties: {
          debug: { type: 'boolean' },
        },
      },
    },
  });

  // Load config with environment variables
  await loadConfig(
    {
      server: { port: 3000, host: 'localhost' },
      app: { debug: false },
    },
    {
      env: true,
      schema: 'app',
    }
  );

  console.log('\nLoaded configuration:');
  console.log(
    `Server: ${getConfig('server.host')}:${getConfig('server.port')}`
  );
  console.log(`Database: ${getConfig('database.url')}`);
  console.log(`Pool size: ${getConfig('database.pool.size')}`);
  console.log(`Analytics: ${getConfig('features.analytics')}`);
  console.log(`Cache: ${getConfig('features.cache')}`);
  console.log(`Debug: ${getConfig('app.debug')}`);

  console.log('\n✅ Environment-specific .env loading complete!\n');
}

/**
 * Demonstrate switching between environments
 * @returns {Promise<void>}
 */
async function demonstrateEnvironments() {
  console.log('🔄 Different Environment Examples\n');

  const environments = ['production', 'development'];

  for (const env of environments) {
    console.log(`--- ${env.toUpperCase()} ENVIRONMENT ---`);

    // Clear previous environment variables
    delete process.env.SERVER_PORT;
    delete process.env.SERVER_HOST;
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_POOL_SIZE;
    delete process.env.APP_DEBUG;
    delete process.env.FEATURES_ANALYTICS;
    delete process.env.FEATURES_CACHE;

    // Load environment-specific .env file
    try {
      dotenv.config({ path: `./files/.env.${env}` });
      console.log(`✅ Loaded .env.${env}`);
    } catch (error) {
      console.log(`❌ No .env.${env} file found`);
    }

    // Load config with current environment variables
    await loadConfig(
      {
        server: { port: 3000, host: 'localhost' },
        app: { debug: false },
      },
      {
        env: true,
        schema: 'app',
      }
    );

    console.log(
      `  Server: ${getConfig('server.host')}:${getConfig('server.port')}`
    );
    console.log(`  Database: ${getConfig('database.url', 'not set')}`);
    console.log(`  Analytics: ${getConfig('features.analytics', 'not set')}`);
    console.log(`  Debug: ${getConfig('app.debug')}`);
    console.log('');
  }

  console.log('✅ Environment demonstration complete!\n');
}

/**
 * Show how environment files override each other
 * @returns {Promise<void>}
 */
async function showEnvironmentOverrides() {
  console.log('📋 Environment Override Example\n');

  // Clear environment first
  delete process.env.SERVER_PORT;
  delete process.env.FEATURES_ANALYTICS;

  // Load base .env first (production values)
  dotenv.config({ path: './files/.env' });
  console.log(
    `Base .env - PORT: ${process.env.SERVER_PORT}, ANALYTICS: ${process.env.FEATURES_ANALYTICS}`
  );

  // Now load development .env (will override some values)
  dotenv.config({ path: './files/.env.development' });
  console.log(
    `After .env.development - PORT: ${process.env.SERVER_PORT}, ANALYTICS: ${process.env.FEATURES_ANALYTICS}`
  );

  await loadConfig(
    {},
    {
      env: true,
      schema: 'app',
    }
  );

  console.log('\nFinal configuration:');
  console.log(
    `Port: ${getConfig('server.port')} (${typeof getConfig('server.port')})`
  );
  console.log(
    `Analytics: ${getConfig('features.analytics')} (${typeof getConfig('features.analytics')})`
  );

  console.log('\n✅ Override example complete!\n');
}

/**
 * Main function
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('🌍 Multiple Environments (.env files) Examples\n');

    await loadEnvironmentSpecificEnv();
    await demonstrateEnvironments();
    await showEnvironmentOverrides();

    console.log('🎉 Multiple environments examples complete!');
    console.log('\nKey patterns:');
    console.log('- Use .env for base/production values');
    console.log('- Use .env.development for development overrides');
    console.log('- Load environment-specific file first, then base file');
    console.log('- Environment files override base .env values');
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
