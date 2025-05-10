# Logging Module

The logging module provides structured logging capabilities with file storage and retention for Node.js applications. It offers multiple log levels, contextual logging with child loggers, automatic file rotation, and configurable retention policies to help you track, debug, and monitor your applications effectively.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Log Levels](#log-levels)
  - [Structured Logging](#structured-logging)
  - [Child Loggers](#child-loggers)
  - [File Storage](#file-storage)
- [Basic Usage](#basic-usage)
  - [Creating Loggers](#creating-loggers)
  - [Logging Messages](#logging-messages)
  - [Adding Metadata](#adding-metadata)
  - [File Logging Configuration](#file-logging-configuration)
- [Advanced Features](#advanced-features)
  - [Custom Transports](#custom-transports)
  - [File Rotation](#file-rotation)
  - [Log Retention](#log-retention)
  - [Pretty Printing](#pretty-printing)
  - [Colorized Output](#colorized-output)
- [Integration Patterns](#integration-patterns)
  - [Express Integration](#express-integration)
  - [Database Logging](#database-logging)
  - [Error Tracking](#error-tracking)
  - [Log Analysis](#log-analysis)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)
- [API Reference](#api-reference)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

## Introduction

Effective logging is crucial for understanding application behavior, debugging issues, and monitoring production systems. This logging module provides:

- **Structured Logging**: Log with metadata for better searchability
- **File Storage**: Automatic file logging with rotation and retention
- **Contextual Logging**: Create child loggers with inherited context  
- **Flexible Configuration**: Customize log levels and output formats
- **Production Ready**: Automatic log rotation and retention policies
- **Performance**: Minimal overhead with level-based filtering
- **Developer Experience**: Pretty printing and colors for development

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { createLogger } from '@voilajs/appkit/logging';

// Create a logger with default file logging (5-day retention)
const logger = createLogger({ level: 'info' });

// Log messages with different levels
logger.info('Application started');
logger.error('Database connection failed', { 
  host: 'localhost', 
  port: 5432 
});
logger.debug('Processing user request', { userId: 123 });

// Create child logger with context
const requestLogger = logger.child({ requestId: 'abc123' });
requestLogger.info('Handling request');

// Logs are automatically saved to files with retention
```

## Core Concepts

### Log Levels

The module supports four log levels, each with specific use cases:

```javascript
// Error - Critical issues that need immediate attention
logger.error('Database connection lost', { 
  error: err.message,
  retryCount: 3 
});

// Warn - Issues that don't prevent operation but need attention
logger.warn('API rate limit approaching', { 
  current: 950,
  limit: 1000 
});

// Info - General application events and state changes
logger.info('User logged in', { 
  userId: user.id,
  ip: req.ip 
});

// Debug - Detailed information for development/troubleshooting
logger.debug('Cache miss', { 
  key: 'user:123',
  operation: 'get' 
});
```

Log levels are hierarchical:
- `error`: Logs only errors
- `warn`: Logs errors and warnings
- `info`: Logs errors, warnings, and info (default)
- `debug`: Logs everything

### Structured Logging

Instead of plain text, use structured data for better analysis:

```javascript
// ❌ Unstructured
logger.info(`User ${userId} logged in from ${ip}`);

// ✅ Structured
logger.info('User logged in', {
  userId,
  ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date().toISOString()
});
```

Benefits:
- Searchable in log aggregation tools
- Machine-readable for automation
- Consistent format across services
- Easy to parse and analyze

### Child Loggers

Create specialized loggers with inherited context:

```javascript
const logger = createLogger({
  defaultMeta: { service: 'api' }
});

// Request-specific logger
app.use((req, res, next) => {
  req.logger = logger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });
  next();
});

// All logs include request context
req.logger.info('Processing payment');
// Includes: service, requestId, method, path, userId
```

### File Storage

The module includes automatic file logging with rotation and retention:

```javascript
// Default behavior - logs to 'logs' directory with 5-day retention
const logger = createLogger();

// Logs are automatically written to:
// - logs/app-2024-01-01.log (today's logs)
// - logs/app-2024-01-01.log.1 (rotated when size exceeded)
// - logs/app-2023-12-31.log (yesterday's logs)
// ...older logs are automatically deleted after retention period
```

## Basic Usage

### Creating Loggers

```javascript
import { createLogger } from '@voilajs/appkit/logging';

// Default logger with file storage (5-day retention)
const logger = createLogger();

// Custom configuration
const customLogger = createLogger({
  level: 'debug',                    // Minimum log level
  defaultMeta: {                     // Metadata for all logs
    service: 'payment-service',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION
  },
  dirname: '/var/log/myapp',        // Custom log directory
  filename: 'myapp.log',            // Custom filename
  retentionDays: 7,                 // Keep logs for 7 days
  maxSize: 20 * 1024 * 1024,        // 20MB max file size
  enableFileLogging: true           // Explicitly enable file logging
});

// Console-only logger (no file storage)
const consoleOnly = createLogger({
  enableFileLogging: false
});
```

### Logging Messages

```javascript
// Simple messages
logger.info('Server started');
logger.error('Failed to connect to database');
logger.warn('Deprecated API endpoint used');
logger.debug('Checking cache for user data');

// With metadata
logger.info('Order processed', {
  orderId: 'ORD-123',
  amount: 299.99,
  currency: 'USD',
  items: 3
});

// Error logging with stack trace
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    operation: 'riskyOperation',
    input: { id: 123 }
  });
}
```

### Adding Metadata

```javascript
// Default metadata for all logs
const logger = createLogger({
  defaultMeta: {
    service: 'user-service',
    host: os.hostname(),
    pid: process.pid
  }
});

// Additional metadata per log
logger.info('User action', {
  action: 'profile_update',
  userId: 123,
  changes: ['email', 'phone'],
  duration: 145
});

// Dynamic metadata
function logWithContext(message, meta = {}) {
  logger.info(message, {
    ...meta,
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage().heapUsed
  });
}
```

### File Logging Configuration

```javascript
// Customize file logging behavior
const logger = createLogger({
  dirname: 'logs',              // Directory for log files
  filename: 'app.log',          // Base filename
  retentionDays: 14,            // Keep logs for 14 days
  maxSize: 5 * 1024 * 1024,     // 5MB max file size before rotation
  enableFileLogging: true       // Enable/disable file logging
});

// Multiple log files with different configurations
const errorLogger = createLogger({
  transports: [
    new ConsoleTransport(),
    new FileTransport({
      dirname: 'logs/errors',
      filename: 'error.log',
      retentionDays: 30,      // Keep error logs longer
      level: 'error'          // Only log errors to this file
    })
  ]
});

// Separate logs for different services
const authLogger = createLogger({
  dirname: 'logs/auth',
  filename: 'auth.log',
  defaultMeta: { service: 'auth' }
});

const apiLogger = createLogger({
  dirname: 'logs/api',
  filename: 'api.log',
  defaultMeta: { service: 'api' }
});
```

## Advanced Features

### Custom Transports

Create custom transports for different destinations:

```javascript
import { BaseTransport } from '@voilajs/appkit/logging/transports/base';

// External service transport
class DatadogTransport extends BaseTransport {
  constructor(options) {
    super(options);
    this.apiKey = options.apiKey;
    this.service = options.service;
  }

  async log(entry) {
    await fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.apiKey
      },
      body: JSON.stringify({
        message: entry.message,
        level: entry.level,
        service: this.service,
        ...entry
      })
    });
  }
}

// Use multiple transports
const logger = createLogger({
  transports: [
    new ConsoleTransport({ prettyPrint: true }),
    new FileTransport({ 
      dirname: 'logs',
      retentionDays: 7 
    }),
    new DatadogTransport({ 
      apiKey: process.env.DATADOG_API_KEY,
      service: 'api'
    })
  ]
});
```

### File Rotation

The FileTransport automatically handles log rotation:

```javascript
// Size-based rotation
const logger = createLogger({
  maxSize: 10 * 1024 * 1024  // Rotate when file reaches 10MB
});

// Date-based rotation (automatic)
// Files are automatically rotated daily:
// - app-2024-01-01.log
// - app-2024-01-02.log
// - app-2024-01-03.log

// Size-based rotation creates numbered files:
// - app-2024-01-01.log (current)
// - app-2024-01-01.log.1 (first rotation)
// - app-2024-01-01.log.2 (second rotation)
```

### Log Retention

Automatic cleanup of old log files:

```javascript
// Configure retention period
const logger = createLogger({
  retentionDays: 30  // Keep logs for 30 days
});

// Disable retention (keep all logs)
const permanentLogger = createLogger({
  retentionDays: 0  // 0 means no automatic deletion
});

// Different retention for different log types
const logger = createLogger({
  transports: [
    new FileTransport({
      dirname: 'logs/access',
      filename: 'access.log',
      retentionDays: 7  // Keep access logs for a week
    }),
    new FileTransport({
      dirname: 'logs/errors',
      filename: 'error.log',
      retentionDays: 90,  // Keep error logs for 3 months
      level: 'error'
    })
  ]
});
```

### Pretty Printing

Enhanced readability for development:

```javascript
const devLogger = createLogger({
  transports: [
    new ConsoleTransport({
      prettyPrint: true,
      colorize: true
    }),
    new FileTransport({
      dirname: 'logs',
      retentionDays: 1  // Short retention for dev
    })
  ]
});

devLogger.info('User registered', {
  user: {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com'
  },
  plan: 'premium',
  referral: 'FRIEND20'
});

// Console output (pretty printed):
// 2024-01-01T00:00:00.000Z ℹ️  INFO User registered
// {
//   "user": {
//     "id": 123,
//     "name": "John Doe", 
//     "email": "john@example.com"
//   },
//   "plan": "premium",
//   "referral": "FRIEND20"
// }

// File output (single line JSON):
// {"timestamp":"2024-01-01T00:00:00.000Z","level":"info","message":"User registered","user":{"id":123,"name":"John Doe","email":"john@example.com"},"plan":"premium","referral":"FRIEND20"}
```

### Colorized Output

Better visibility with colored console output:

```javascript
// Colors automatically applied to log levels
logger.error('Database error');     // Red
logger.warn('Deprecation warning'); // Yellow
logger.info('Server started');      // Cyan
logger.debug('Debug info');         // Gray

// Disable colors for production
const prodLogger = createLogger({
  transports: [
    new ConsoleTransport({
      colorize: process.env.NODE_ENV !== 'production'
    }),
    new FileTransport({
      dirname: '/var/log/app',
      retentionDays: 30
    })
  ]
});
```

## Integration Patterns

### Express Integration

```javascript
import express from 'express';
import { createLogger } from '@voilajs/appkit/logging';

const app = express();
const logger = createLogger({ 
  defaultMeta: { service: 'api' },
  dirname: 'logs/api',
  retentionDays: 14
});

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Create request-specific logger
  req.logger = logger.child({
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log request start
  req.logger.info('Request started');
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length')
    });
  });
  
  next();
});

// Use in routes
app.get('/users/:id', async (req, res) => {
  try {
    req.logger.debug('Fetching user', { userId: req.params.id });
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.logger.warn('User not found', { userId: req.params.id });
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.logger.info('User fetched successfully');
    res.json(user);
  } catch (error) {
    req.logger.error('Error fetching user', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error logging middleware
app.use((err, req, res, next) => {
  req.logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    code: err.code
  });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});
```

### Database Logging

```javascript
// MongoDB connection logging with file storage
const dbLogger = createLogger({
  defaultMeta: { component: 'database' },
  dirname: 'logs/database',
  retentionDays: 30
});

mongoose.connection.on('connected', () => {
  dbLogger.info('MongoDB connected', {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.name
  });
});

mongoose.connection.on('error', (err) => {
  dbLogger.error('MongoDB connection error', {
    error: err.message,
    code: err.code
  });
});

// Query logging
mongoose.set('debug', (collectionName, method, query, doc) => {
  dbLogger.debug('MongoDB query', {
    collection: collectionName,
    method,
    query,
    doc
  });
});

// Transaction logging
async function transferFunds(fromId, toId, amount) {
  const txLogger = dbLogger.child({
    operation: 'transferFunds',
    transactionId: generateId()
  });
  
  txLogger.info('Starting funds transfer', {
    from: fromId,
    to: toId,
    amount
  });
  
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      txLogger.debug('Updating sender balance');
      await Account.findByIdAndUpdate(fromId, {
        $inc: { balance: -amount }
      }).session(session);
      
      txLogger.debug('Updating receiver balance');
      await Account.findByIdAndUpdate(toId, {
        $inc: { balance: amount }
      }).session(session);
    });
    
    txLogger.info('Funds transfer completed successfully');
  } catch (error) {
    txLogger.error('Funds transfer failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    await session.endSession();
  }
}
```

### Error Tracking

```javascript
// Centralized error logging with file storage
const errorLogger = createLogger({
  dirname: 'logs/errors',
  filename: 'error.log',
  retentionDays: 90  // Keep error logs for 3 months
});

class ErrorTracker {
  constructor(logger) {
    this.logger = logger;
  }
  
  captureException(error, context = {}) {
    this.logger.error('Exception captured', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString()
    });
    
    // Send to error tracking service
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, { extra: context });
    }
  }
  
  captureMessage(message, level = 'info', context = {}) {
    this.logger[level](message, context);
    
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(message, level);
    }
  }
}

const errorTracker = new ErrorTracker(errorLogger);

// Global error handlers
process.on('uncaughtException', (error) => {
  errorTracker.captureException(error, {
    type: 'uncaughtException'
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  errorTracker.captureException(reason, {
    type: 'unhandledRejection',
    promise: promise.toString()
  });
});
```

### Log Analysis

```javascript
import fs from 'fs';
import readline from 'readline';

// Read and parse log files
async function readLogs(filename) {
  const fileStream = fs.createReadStream(filename);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const logs = [];
  for await (const line of rl) {
    try {
      const log = JSON.parse(line);
      logs.push(log);
    } catch (error) {
      console.error('Invalid log line:', line);
    }
  }

  return logs;
}

// Analyze error patterns
async function analyzeErrors(days = 7) {
  const errors = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const filename = `logs/app-${dateStr}.log`;
    
    if (fs.existsSync(filename)) {
      const logs = await readLogs(filename);
      const dayErrors = logs.filter(log => log.level === 'error');
      errors.push(...dayErrors);
    }
  }
  
  // Group errors by type
  const errorTypes = {};
  errors.forEach(error => {
    const type = error.error || error.message;
    errorTypes[type] = (errorTypes[type] || 0) + 1;
  });
  
  return {
    total: errors.length,
    types: errorTypes,
    timeline: groupByHour(errors)
  };
}

// Generate reports
async function generateDailyReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];
  
  const logs = await readLogs(`logs/app-${dateStr}.log`);
  
  const report = {
    date: dateStr,
    totalLogs: logs.length,
    byLevel: {
      error: logs.filter(l => l.level === 'error').length,
      warn: logs.filter(l => l.level === 'warn').length,
      info: logs.filter(l => l.level === 'info').length,
      debug: logs.filter(l => l.level === 'debug').length
    },
    topErrors: findTopErrors(logs),
    performance: analyzePerformance(logs)
  };
  
  return report;
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```javascript
// ❌ Don't use same level for everything
logger.info('Application started');
logger.info('Database connection error');
logger.info('User clicked button');

// ✅ Use appropriate levels
logger.info('Application started');
logger.error('Database connection error', { error: err.message });
logger.debug('User clicked button', { buttonId: 'submit' });
```

### 2. Structure Your Logs

```javascript
// ❌ Unstructured logs
logger.info(`User ${user.name} (${user.id}) logged in from ${req.ip}`);

// ✅ Structured logs (automatically saved as JSON in files)
logger.info('User logged in', {
  userId: user.id,
  userName: user.name,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString()
});
```

### 3. Use Child Loggers for Context

```javascript
// ❌ Repeating context in every log
logger.info('Starting order processing', { orderId: '123' });
logger.info('Validating order', { orderId: '123' });
logger.info('Processing payment', { orderId: '123' });

// ✅ Use child logger
const orderLogger = logger.child({ orderId: '123' });
orderLogger.info('Starting order processing');
orderLogger.info('Validating order');
orderLogger.info('Processing payment');
```

### 4. Configure File Storage Appropriately

```javascript
// Development environment
const devLogger = createLogger({
  level: 'debug',
  dirname: 'logs/dev',
  retentionDays: 3,          // Short retention for dev
  maxSize: 5 * 1024 * 1024,  // 5MB files
  enableFileLogging: true
});

// Production environment
const prodLogger = createLogger({
  level: 'info',
  dirname: '/var/log/app',
  retentionDays: 30,          // 30 days retention
  maxSize: 50 * 1024 * 1024,  // 50MB files
  transports: [
    new ConsoleTransport({ colorize: false }),
    new FileTransport({
      dirname: '/var/log/app',
      retentionDays: 30
    }),
    new FileTransport({
      dirname: '/var/log/app/errors',
      filename: 'error.log',
      retentionDays: 90,
      level: 'error'
    })
  ]
});
```

### 5. Avoid Logging Sensitive Data

```javascript
// ❌ Don't log sensitive information
logger.info('User login', {
  email: user.email,
  password: user.password,
  creditCard: user.creditCard
});

// ✅ Sanitize sensitive data
logger.info('User login', {
  email: user.email,
  userId: user.id,
  // Omit password and credit card
});

// ✅ Create sanitizer function
function sanitizeUserData(user) {
  const { password, creditCard, ssn, ...safe } = user;
  return safe;
}

logger.info('User updated', {
  user: sanitizeUserData(user)
});
```

### 6. Graceful Shutdown with Log Flushing

```javascript
const logger = createLogger();

// Ensure all logs are written before exit
process.on('SIGTERM', async () => {
  logger.info('Shutting down application');
  
  // Flush and close all transports
  await logger.flush();
  await logger.close();
  
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  
  // Ensure error is written to file
  await logger.flush();
  await logger.close();
  
  process.exit(1);
});
```

### 7. Monitor Log File Sizes

```javascript
// Monitor log directory size
async function monitorLogDirectory(dirname = 'logs') {
  const files = await fs.promises.readdir(dirname);
  let totalSize = 0;
  
  for (const file of files) {
    const stats = await fs.promises.stat(path.join(dirname, file));
    totalSize += stats.size;
  }
  
  logger.info('Log directory stats', {
    directory: dirname,
    fileCount: files.length,
    totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
  });
  
  // Alert if logs are getting too large
  if (totalSize > 1024 * 1024 * 1024) { // 1GB
    logger.warn('Log directory size exceeds 1GB', {
      directory: dirname,
      totalSize
    });
  }
}

// Run periodically
setInterval(() => monitorLogDirectory(), 24 * 60 * 60 * 1000);
```

## Real-World Examples

### Complete Application Logging

```javascript
import { createLogger } from '@voilajs/appkit/logging';
import express from 'express';

// Application logger setup with file storage
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'user-api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0'
  },
  dirname: process.env.LOG_DIR || 'logs',
  retentionDays: process.env.NODE_ENV === 'production' ? 30 : 7,
  maxSize: process.env.NODE_ENV === 'production' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
});

// Application startup logging
async function startApplication() {
  const startTime = Date.now();
  
  logger.info('Starting application');
  
  try {
    // Database connection
    await connectDatabase();
    logger.info('Database connected');
    
    // Cache initialization
    await initializeCache();
    logger.info('Cache initialized');
    
    // Start server
    const server = app.listen(PORT, () => {
      const duration = Date.now() - startTime;
      
      logger.info('Application started successfully', {
        port: PORT,
        startupTime: duration,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        logDirectory: path.resolve('logs')
      });
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, starting graceful shutdown');
      
      try {
        await server.close();
        logger.info('HTTP server closed');
        
        await disconnectDatabase();
        logger.info('Database disconnected');
        
        // Ensure all logs are written
        await logger.flush();
        await logger.close();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', {
          error: error.message,
          stack: error.stack
        });
        process.exit(1);
      }
    });
    
  } catch (error) {
    logger.error('Failed to start application', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
```

### Production Logging Setup

```javascript
// Production configuration with multiple transports
const productionLogger = createLogger({
  level: 'info',
  defaultMeta: {
    service: process.env.SERVICE_NAME,
    environment: 'production',
    region: process.env.AWS_REGION || 'us-east-1'
  },
  transports: [
    // Console output for container logs
    new ConsoleTransport({
      colorize: false,
      prettyPrint: false
    }),
    // General application logs
    new FileTransport({
      dirname: '/var/log/app',
      filename: 'app.log',
      retentionDays: 30,
      maxSize: 50 * 1024 * 1024
    }),
    // Error logs with longer retention
    new FileTransport({
      dirname: '/var/log/app/errors',
      filename: 'error.log',
      retentionDays: 90,
      level: 'error'
    }),
    // Audit logs for compliance
    new FileTransport({
      dirname: '/var/log/app/audit',
      filename: 'audit.log',
      retentionDays: 365  // 1 year retention for compliance
    })
  ]
});

// Audit logging helper
function auditLog(action, userId, details) {
  productionLogger.info('Audit event', {
    audit: true,
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent
  });
}

// Usage
auditLog('user.login', user.id, {
  ip: req.ip,
  userAgent: req.get('user-agent'),
  success: true
});
```

### Background Job Processing with File Logging

```javascript
class JobProcessor {
  constructor() {
    this.logger = createLogger({
      defaultMeta: { component: 'job-processor' },
      dirname: 'logs/jobs',
      retentionDays: 14
    });
    this.queue = new Queue('jobs');
  }
  
  async processJob(job) {
    const jobLogger = this.logger.child({
      jobId: job.id,
      jobType: job.type,
      attempt: job.attempts
    });
    
    jobLogger.info('Starting job processing');
    const startTime = Date.now();
    
    try {
      const result = await this.executeJob(job);
      
      const duration = Date.now() - startTime;
      jobLogger.info('Job completed successfully', {
        duration,
        result: result.summary
      });
      
      return result;
    } catch (error) {
      jobLogger.error('Job failed', {
        error: error.message,
        stack: error.stack,
        duration: Date.now() - startTime
      });
      
      if (job.attempts < job.maxAttempts) {
        jobLogger.info('Scheduling job retry', {
          nextAttempt: job.attempts + 1,
          delay: job.retryDelay
        });
        
        await this.queue.retry(job);
      } else {
        jobLogger.error('Job failed permanently', {
          finalAttempt: job.attempts
        });
        
        await this.handlePermanentFailure(job, error);
      }
      
      throw error;
    }
  }
}
```

### Log Aggregation and Analysis

```javascript
// Log analytics service
class LogAnalytics {
  constructor(logDir = 'logs') {
    this.logDir = logDir;
    this.logger = createLogger({
      defaultMeta: { component: 'analytics' },
      dirname: 'logs/analytics'
    });
  }
  
  async generateDailyReport(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    const filename = path.join(this.logDir, `app-${dateStr}.log`);
    
    if (!fs.existsSync(filename)) {
      this.logger.warn('Log file not found', { filename });
      return null;
    }
    
    const logs = await this.readLogs(filename);
    
    const report = {
      date: dateStr,
      summary: {
        total: logs.length,
        byLevel: this.groupByLevel(logs),
        byHour: this.groupByHour(logs),
        byService: this.groupByService(logs)
      },
      errors: {
        count: logs.filter(l => l.level === 'error').length,
        types: this.groupErrorTypes(logs),
        top5: this.getTopErrors(logs, 5)
      },
      performance: {
        avgResponseTime: this.calculateAvgResponseTime(logs),
        slowRequests: this.findSlowRequests(logs),
        statusCodes: this.groupByStatusCode(logs)
      },
      security: {
        failedLogins: this.findFailedLogins(logs),
        suspiciousActivity: this.detectSuspiciousActivity(logs)
      }
    };
    
    // Save report
    const reportFilename = path.join('logs/reports', `daily-${dateStr}.json`);
    await fs.promises.writeFile(reportFilename, JSON.stringify(report, null, 2));
    
    this.logger.info('Daily report generated', {
      date: dateStr,
      reportFile: reportFilename
    });
    
    return report;
  }
  
  async findSlowRequests(logs) {
    return logs
      .filter(l => l.duration > 1000) // Requests over 1 second
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(l => ({
        timestamp: l.timestamp,
        path: l.path,
        method: l.method,
        duration: l.duration,
        userId: l.userId
      }));
  }
  
  async detectSuspiciousActivity(logs) {
    const suspicious = [];
    
    // Multiple failed login attempts
    const failedLogins = logs.filter(l => 
      l.message === 'Login failed' && 
      l.level === 'warn'
    );
    
    const loginsByIp = {};
    failedLogins.forEach(l => {
      const ip = l.ip;
      loginsByIp[ip] = (loginsByIp[ip] || 0) + 1;
    });
    
    Object.entries(loginsByIp).forEach(([ip, count]) => {
      if (count > 5) {
        suspicious.push({
          type: 'multiple_failed_logins',
          ip,
          count,
          severity: 'high'
        });
      }
    });
    
    return suspicious;
  }
}

// Schedule daily reports
const analytics = new LogAnalytics();
setInterval(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  analytics.generateDailyReport(yesterday);
}, 24 * 60 * 60 * 1000);
```

## API Reference

### createLogger(options?)

Creates a new logger instance with optional file storage.

**Parameters:**
- `options` (Object, optional)
  - `level` (string): Minimum log level ('error', 'warn', 'info', 'debug'). Default: 'info'
  - `defaultMeta` (Object): Default metadata included in all logs
  - `transports` (Array): Array of transport instances. Default: [ConsoleTransport, FileTransport]
  - `enableFileLogging` (boolean): Enable/disable file logging. Default: true
  - `dirname` (string): Directory for log files. Default: 'logs'
  - `filename` (string): Base filename for logs. Default: 'app.log'
  - `retentionDays` (number): Days to retain log files. Default: 5
  - `maxSize` (number): Maximum file size before rotation in bytes. Default: 10MB

**Returns:** Logger instance

```javascript
const logger = createLogger({
  level: 'debug',
  defaultMeta: { service: 'api' },
  dirname: '/var/log/myapp',
  retentionDays: 30
});
```

### Logger Methods

#### logger.info(message, meta?)

Logs an info message.

**Parameters:**
- `message` (string): Log message
- `meta` (Object, optional): Additional metadata

```javascript
logger.info('User logged in', { userId: 123 });
```

#### logger.error(message, meta?)

Logs an error message.

**Parameters:**
- `message` (string): Log message
- `meta` (Object, optional): Additional metadata

```javascript
logger.error('Database error', { error: err.message });
```

#### logger.warn(message, meta?)

Logs a warning message.

**Parameters:**
- `message` (string): Log message
- `meta` (Object, optional): Additional metadata

```javascript
logger.warn('Deprecated API used', { endpoint: '/v1/users' });
```

#### logger.debug(message, meta?)

Logs a debug message.

**Parameters:**
- `message` (string): Log message
- `meta` (Object, optional): Additional metadata

```javascript
logger.debug('Cache lookup', { key: 'user:123', hit: false });
```

#### logger.child(bindings)

Creates a child logger with additional context.

**Parameters:**
- `bindings` (Object): Additional context for all logs

**Returns:** Logger instance

```javascript
const requestLogger = logger.child({ requestId: 'abc123' });
requestLogger.info('Processing request');
```

#### logger.flush()

Flushes all pending log writes to transports.

**Returns:** Promise<void>

```javascript
await logger.flush();
```

#### logger.close()

Closes all transports and releases resources.

**Returns:** Promise<void>

```javascript
await logger.close();
```

### ConsoleTransport

Console transport for outputting logs.

```javascript
new ConsoleTransport({
  colorize: true,      // Enable colors
  prettyPrint: false   // Enable pretty formatting
});
```

### FileTransport

File transport for storing logs with rotation and retention.

```javascript
new FileTransport({
  dirname: 'logs',         // Directory for log files
  filename: 'app.log',     // Base filename
  retentionDays: 7,        // Days to retain logs
  maxSize: 10485760,       // Max file size in bytes (10MB)
  datePattern: 'YYYY-MM-DD' // Date format for filenames
});
```

## Performance Considerations

### Minimize Logging Overhead

```javascript
// Use appropriate log levels
logger.debug('Detailed info'); // Won't execute if level is 'info'

// Avoid expensive computations
if (logger.level === 'debug') {
  logger.debug('Expensive data', {
    computed: expensiveOperation()
  });
}

// Batch logs where possible
const batch = [];
for (const item of items) {
  batch.push(processItem(item));
}
logger.info('Batch processed', { 
  count: batch.length,
  summary: summarize(batch)
});
```

### Async File Operations

The FileTransport uses async I/O to minimize blocking:

```javascript
// Non-blocking file writes
const logger = createLogger({
  transports: [
    new FileTransport({
      dirname: 'logs',
      maxSize: 50 * 1024 * 1024  // 50MB files
    })
  ]
});

// Logs are written asynchronously
logger.info('Non-blocking write');

// Ensure writes complete before exit
process.on('exit', async () => {
  await logger.flush();
});
```

### Memory Management

```javascript
// Proper resource cleanup
async function processRequests() {
  const requestLogger = logger.child({ batch: 'batch-123' });
  
  try {
    // Process requests
    for (const req of requests) {
      requestLogger.info('Processing', { reqId: req.id });
    }
  } finally {
    // No special cleanup needed - child loggers are lightweight
  }
}

// Close transports when done
async function shutdown() {
  await logger.close();
}
```

## Troubleshooting

### Common Issues

#### 1. Logs Not Appearing in Files

```javascript
// Check if file logging is enabled
console.log('File logging enabled:', logger.transports.some(t => t instanceof FileTransport));

// Check permissions
const logDir = 'logs';
try {
  await fs.promises.access(logDir, fs.constants.W_OK);
  console.log('Directory is writable');
} catch (error) {
  console.error('Cannot write to log directory:', error);
}

// Flush logs immediately
await logger.flush();
```

#### 2. Log Files Getting Too Large

```javascript
// Adjust retention and rotation settings
const logger = createLogger({
  retentionDays: 3,           // Shorter retention
  maxSize: 5 * 1024 * 1024    // Smaller files (5MB)
});

// Monitor disk usage
const diskUsage = await checkDiskSpace('/');
if (diskUsage.free < 1024 * 1024 * 1024) { // Less than 1GB
  logger.warn('Low disk space', { free: diskUsage.free });
}
```

#### 3. Performance Issues

```javascript
// Reduce logging in production
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Use sampling for high-traffic routes
let requestCount = 0;
app.use((req, res, next) => {
  if (++requestCount % 100 === 0) {
    logger.info('Request sample', {
      count: requestCount,
      memory: process.memoryUsage()
    });
  }
  next();
});
```

#### 4. Log File Access

```javascript
// Read today's logs
const today = new Date().toISOString().split('T')[0];
const logFile = `logs/app-${today}.log`;

const fileStream = fs.createReadStream(logFile);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

for await (const line of rl) {
  const log = JSON.parse(line);
  console.log(log.timestamp, log.level, log.message);
}
```

### Debug Mode

```javascript
// Enable verbose logging
process.env.DEBUG = 'true';

const logger = createLogger({
  level: process.env.DEBUG ? 'debug' : 'info',
  transports: [
    new ConsoleTransport({
      prettyPrint: process.env.DEBUG === 'true'
    }),
    new FileTransport({
      dirname: 'logs',
      filename: 'debug.log'
    })
  ]
});

// Debug helper
logger.debugMode = () => {
  logger.level = 'debug';
  logger.info('Debug mode enabled');
};
```

## Log File Management

### Log Rotation Examples

```
logs/
├── app-2024-01-05.log       # Current day's logs
├── app-2024-01-05.log.1     # First rotation
├── app-2024-01-05.log.2     # Second rotation
├── app-2024-01-04.log       # Yesterday's logs
├── app-2024-01-03.log       # 2 days ago
├── app-2024-01-02.log       # 3 days ago
├── app-2024-01-01.log       # 4 days ago
└── app-2023-12-31.log       # 5 days ago (will be deleted with 5-day retention)
```

### Log Backup Strategy

```javascript
// Backup logs before deletion
const backupLogger = createLogger({
  transports: [
    new FileTransport({
      dirname: 'logs',
      retentionDays: 7
    })
  ]
});

// Custom backup before rotation
async function backupLogs() {
  const files = await fs.promises.readdir('logs');
  const logFiles = files.filter(f => f.endsWith('.log'));
  
  for (const file of logFiles) {
    const stats = await fs.promises.stat(path.join('logs', file));
    
    // Backup files older than retention period
    if (Date.now() - stats.mtimeMs > 7 * 24 * 60 * 60 * 1000) {
      await fs.promises.copyFile(
        path.join('logs', file),
        path.join('backup', file)
      );
    }
  }
}
```

## Support

For issues and feature requests, visit our [GitHub repository](https://github.com/voilajs/appkit).