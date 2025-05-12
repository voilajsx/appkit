/**
 * Express Logging - @voilajs/appkit
 *
 * Add logging to an Express app
 *
 * Run: node 04-express-basic.js
 * Visit: http://localhost:3000
 */

import express from 'express';
import { createLogger } from '@voilajs/appkit/logging';

const app = express();
const logger = createLogger();

// Log all requests
app.use((req, res, next) => {
  logger.info('Request', {
    method: req.method,
    path: req.path,
  });
  next();
});

// Routes
app.get('/', (req, res) => {
  logger.info('Home page visited');
  res.send('Hello! Check the logs.');
});

app.get('/error', (req, res) => {
  logger.error('Error endpoint hit');
  res.status(500).send('Error logged!');
});

// Start server
app.listen(3000, () => {
  logger.info('Server started on port 3000');
  console.log('Visit http://localhost:3000');
});
