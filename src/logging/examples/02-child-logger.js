/**
 * Child Loggers - @voilajs/appkit
 *
 * Use child loggers to add context to all logs
 *
 * Run: node 02-child-logger.js
 */

import { createLogger } from '../logger.js';

// Create main logger
const logger = createLogger();

// Create a child logger for a specific user
const userLogger = logger.child({
  userId: '123',
  username: 'john_doe',
});

// All these logs will include userId and username
userLogger.info('User logged in');
userLogger.info('Profile updated');
userLogger.error('Failed to save preferences');

// Create a child logger for a specific request
const requestLogger = logger.child({
  requestId: 'req-456',
  path: '/api/users',
});

requestLogger.info('Request started');
requestLogger.info('Request completed', { duration: 150 });
