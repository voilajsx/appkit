/**
 * Express App - @voilajs/appkit Config Module
 *
 * Simple Express app using config module
 *
 * Dependencies:
 * - express: npm install express
 *
 * Run: node express-app.js
 */

import express from 'express';
import { loadConfig, getConfig } from '@voilajs/appkit/config';

async function demo() {
  console.log('=== Express App Config Demo ===\n');

  // Load configuration
  await loadConfig(
    {
      app: {
        name: 'Demo API',
      },
      server: {
        port: 3000,
      },
    },
    {
      env: true, // Use environment variables
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
    res.json(getConfig());
  });

  // Start server
  const port = getConfig('server.port');
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
Expected output:

=== Express App Config Demo ===

Server running at http://localhost:3000
App name: Demo API

Try these URLs:
- http://localhost:3000/
- http://localhost:3000/config
*/
