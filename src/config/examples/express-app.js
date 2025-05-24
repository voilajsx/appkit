/**
 * Express App - @voilajsx/appkit Config Module
 *
 * Simple Express app using config module
 *
 * Dependencies:
 * - express: npm install express
 *
 * Run: node express-app.js
 *
 * To test env variable override: PORT=5000 node express-app.js
 */

import express from 'express';
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Runs the Express app demo.
 *
 * This demo loads a configuration from a default object and environment
 * variables, creates an Express app, defines two routes, and starts the server.
 *
 * The first route returns a JSON object with the app name and a welcome
 * message. The second route returns the entire configuration object.
 *
 * Finally, the demo logs the server's URL and the app name to the console,
 * along with instructions for trying out the two routes.
 */
/*******  a9a91d62-8144-469e-9591-df2983e6e01c  *******/import { loadConfig, getConfig, defineSchema } from '@voilajsx/appkit/config'; // Corrected import and added defineSchema

async function demo() {
  console.log('=== Express App Config Demo ===\n');

  // Define a schema for automatic type coercion for environment variables
  defineSchema('appConfigSchema', {
    type: 'object',
    properties: {
      app: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      server: {
        type: 'object',
        properties: {
          port: { type: 'number', minimum: 1 }, // Define port as a number
        },
      },
    },
  });

  // Load configuration
  // If PORT env var is set (e.g., PORT=5000), it will override server.port
  // and be automatically coerced to a number due to the schema.
  await loadConfig(
    {
      app: {
        name: 'Demo API',
      },
      server: {
        port: 3000, // Default port
      },
    },
    {
      env: true, // Use environment variables
      schema: 'appConfigSchema', // Provide schema for type coercion
      map: {
        // Map env var to config path
        PORT: 'server.port',
      },
    }
  );

  // Create Express app
  const app = express();

  // Define routes
  app.get('/', (req, res) => {
    res.json({
      app: getConfig('app.name'),
      message: 'Welcome to the API!',
    });
  });

  app.get('/config', (req, res) => {
    // getConfig('server.port') will now be a number if overridden by env var
    res.json(getConfig());
  });

  // Start server
  const port = getConfig('server.port'); // This will now be a number even if from env
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`App name: ${getConfig('app.name')}`);
    console.log('\nTry these URLs:');
    console.log(`- http://localhost:${port}/`);
    console.log(`- http://localhost:${port}/config`);
  });
}

demo().catch(console.error);

/*
Expected output (if run without PORT env var):

=== Express App Config Demo ===

Server running at http://localhost:3000
App name: Demo API

Try these URLs:
- http://localhost:3000/
- http://localhost:3000/config

Expected output (if run with PORT=5000 node express-app.js):

=== Express App Config Demo ===

Server running at http://localhost:5000
App name: Demo API

Try these URLs:
- http://localhost:5000/
- http://localhost:5000/config
*/
