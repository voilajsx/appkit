/**
 * Basic Logging - @voilajs/appkit
 * @file 01-basic-logging.js
 * Simple example showing how to create a logger and use it
 *
 * Run: node 01-basic-logging.js
 */

import { createLogger } from '../logger.js';

// Create a logger
const logger = createLogger({ level: 'debug' });

// Log some messages
logger.info('Application started');
logger.error('Database connection failed');
logger.warn('Using default configuration');
logger.debug('Loading user data');

// Log with extra information
logger.info('User logged in', {
  userId: '123',
  email: 'user@example.com',
});

console.log('\n✅ Logs saved to the "logs" folder');
