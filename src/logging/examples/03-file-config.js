/**
 * File Configuration - @voilajs/appkit
 *
 * Configure where and how logs are saved
 *
 * Run: node 03-file-config.js
 */

import { createLogger } from '@voilajs/appkit/logging';

// Custom file settings
const logger = createLogger({
  dirname: 'my-logs', // Save to "my-logs" folder
  filename: 'app.log', // Base filename
  retentionDays: 30, // Keep logs for 30 days
  maxSize: 10 * 1024 * 1024, // 10MB per file
});

logger.info('This log goes to my-logs/app-YYYY-MM-DD.log');

// Console only (no file)
const consoleLogger = createLogger({
  enableFileLogging: false,
});

consoleLogger.info('This only appears in console');
