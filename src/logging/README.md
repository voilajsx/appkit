## Logging Module

The Logging module of the `@voilajs/appkit` package provides structured logging
capabilities with automatic file storage and retention. It offers multiple log
levels, contextual logging with child loggers, automatic file rotation, and
configurable retention policies to help you track, debug, and monitor your
applications effectively.

### Snapshot of Methods

| S.No. | Method                          | Description                                      |
| ----- | ------------------------------- | ------------------------------------------------ |
| 1     | [`createLogger`](#createlogger) | Creates a new logger instance with configuration |
| 2     | [`info`](#info)                 | Logs an info message with optional metadata      |
| 3     | [`error`](#error)               | Logs an error message with optional metadata     |
| 4     | [`warn`](#warn)                 | Logs a warning message with optional metadata    |
| 5     | [`debug`](#debug)               | Logs a debug message with optional metadata      |
| 6     | [`child`](#child)               | Creates a child logger with additional context   |
| 7     | [`flush`](#flush)               | Flushes all pending log writes to transports     |
| 8     | [`close`](#close)               | Closes all transports and releases resources     |

### Use Cases

| S.No. | Method                          | Use Cases                                                                                                                                                                                                                                                                                                                                                      |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | [`createLogger`](#createlogger) | <ul><li>Setting up application logging with file storage</li><li>Configuring different log levels for environments</li><li>Creating specialized loggers for different services</li><li>Setting up log rotation and retention policies</li><li>Configuring multiple transports for different destinations</li><li>Adding default metadata to all logs</li></ul> |
| 2     | [`info`](#info)                 | <ul><li>Logging general application events</li><li>Recording successful operations</li><li>Tracking user actions and flows</li><li>Monitoring API requests and responses</li><li>Recording system state changes</li><li>Logging application startup and configuration</li></ul>                                                                                |
| 3     | [`error`](#error)               | <ul><li>Logging exceptions and stack traces</li><li>Recording database errors</li><li>Tracking API failures</li><li>Monitoring critical system issues</li><li>Logging security incidents</li><li>Recording validation errors</li></ul>                                                                                                                         |
| 4     | [`warn`](#warn)                 | <ul><li>Warning about deprecated API usage</li><li>Alerting on approaching limits</li><li>Logging recoverable errors</li><li>Recording suspicious activities</li><li>Warning about performance issues</li><li>Alerting on data anomalies</li></ul>                                                                                                             |
| 5     | [`debug`](#debug)               | <ul><li>Detailed troubleshooting information</li><li>Logging internal state for debugging</li><li>Recording detailed request/response data</li><li>Tracking algorithm execution steps</li><li>Monitoring cache operations</li><li>Development and testing logs</li></ul>                                                                                       |
| 6     | [`child`](#child)               | <ul><li>Creating request-specific loggers</li><li>Adding operation context to logs</li><li>Isolating logs for specific features</li><li>Creating user-specific logging contexts</li><li>Building transaction-specific loggers</li><li>Adding correlation IDs to related logs</li></ul>                                                                         |
| 7     | [`flush`](#flush)               | <ul><li>Ensuring logs are written before shutdown</li><li>Flushing logs in serverless environments</li><li>Writing critical logs immediately</li><li>Ensuring error logs are persisted</li><li>Completing log writes in batch operations</li></ul>                                                                                                             |
| 8     | [`close`](#close)               | <ul><li>Graceful application shutdown</li><li>Releasing file handles and resources</li><li>Cleaning up transport connections</li><li>Ensuring all logs are written</li><li>Preventing log data loss on exit</li></ul>                                                                                                                                          |

### Basic Usage Examples

#### createLogger

```javascript
import { createLogger } from '@voilajs/appkit/logging';

// Basic logger with default file storage
const logger = createLogger();

// Custom configuration
const customLogger = createLogger({
  level: 'debug',
  defaultMeta: {
    service: 'user-service',
    environment: process.env.NODE_ENV,
  },
  dirname: '/var/log/myapp',
  retentionDays: 30,
});
```

#### info

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger();

// Simple info message
logger.info('Application started');

// Info with metadata
logger.info('User logged in', {
  userId: '123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});
```

#### error

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger();

try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    operation: 'riskyOperation',
  });
}
```

#### warn

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger();

// Warning about deprecated API
logger.warn('Deprecated API used', {
  endpoint: '/api/v1/users',
  alternative: '/api/v2/users',
});

// Warning about approaching limit
logger.warn('Rate limit approaching', {
  current: 950,
  limit: 1000,
});
```

#### debug

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger({ level: 'debug' });

logger.debug('Cache lookup', {
  key: 'user:123',
  hit: false,
  operation: 'get',
});
```

#### child

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger();

// Create child logger with context
const requestLogger = logger.child({
  requestId: 'abc123',
  userId: '456',
});

requestLogger.info('Processing request');
// All logs include requestId and userId automatically
```

#### flush

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger();

// Ensure all logs are written
process.on('exit', async () => {
  await logger.flush();
});
```

#### close

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down');
  await logger.flush();
  await logger.close();
  process.exit(0);
});
```

### Advanced Examples

#### Express Application Logging

```javascript
import { createLogger } from '@voilajs/appkit/logging';
import express from 'express';

const app = express();
const logger = createLogger({
  defaultMeta: { service: 'api' },
  dirname: 'logs/api',
  retentionDays: 14,
});

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Create request-specific logger
  req.logger = logger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
  });

  req.logger.info('Request started');

  // Log response
  res.on('finish', () => {
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
    });
  });

  next();
});

// Use in routes
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    req.logger.info('User fetched successfully');
    res.json(user);
  } catch (error) {
    req.logger.error('Error fetching user', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### Database Operations Logging

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger({
  defaultMeta: { component: 'database' },
  dirname: 'logs/database',
});

class Database {
  constructor() {
    this.logger = logger;
  }

  async query(sql, params) {
    const queryLogger = this.logger.child({
      operation: 'query',
      queryId: generateId(),
    });

    queryLogger.debug('Executing query', { sql, params });
    const start = Date.now();

    try {
      const result = await this.connection.query(sql, params);
      queryLogger.info('Query completed', {
        duration: Date.now() - start,
        rowCount: result.rowCount,
      });
      return result;
    } catch (error) {
      queryLogger.error('Query failed', {
        error: error.message,
        sql,
        duration: Date.now() - start,
      });
      throw error;
    }
  }
}
```

#### Error Tracking System

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const errorLogger = createLogger({
  transports: [
    new ConsoleTransport(),
    new FileTransport({
      dirname: 'logs/errors',
      filename: 'error.log',
      retentionDays: 90,
      level: 'error',
    }),
  ],
});

class ErrorTracker {
  captureException(error, context = {}) {
    errorLogger.error('Exception captured', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  errorTracker.captureException(error, {
    type: 'uncaughtException',
  });
  process.exit(1);
});
```

#### Production Logger Setup

```javascript
import {
  createLogger,
  ConsoleTransport,
  FileTransport,
} from '@voilajs/appkit/logging';

function createProductionLogger() {
  return createLogger({
    level: 'info',
    defaultMeta: {
      service: process.env.SERVICE_NAME,
      environment: 'production',
      version: process.env.APP_VERSION,
    },
    transports: [
      // Console for container logs
      new ConsoleTransport({
        colorize: false,
        prettyPrint: false,
      }),
      // General application logs
      new FileTransport({
        dirname: '/var/log/app',
        filename: 'app.log',
        retentionDays: 30,
        maxSize: 50 * 1024 * 1024, // 50MB
      }),
      // Error logs with longer retention
      new FileTransport({
        dirname: '/var/log/app/errors',
        filename: 'error.log',
        retentionDays: 90,
        level: 'error',
      }),
    ],
  });
}
```

#### Audit Logging

```javascript
import { createLogger } from '@voilajs/appkit/logging';

const auditLogger = createLogger({
  defaultMeta: { audit: true },
  dirname: 'logs/audit',
  filename: 'audit.log',
  retentionDays: 365, // 1 year for compliance
});

function auditLog(action, userId, details) {
  auditLogger.info('Audit event', {
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
  });
}

// Usage
auditLog('user.login', user.id, {
  ip: req.ip,
  userAgent: req.get('user-agent'),
  success: true,
});
```

#### Log Analysis

```javascript
import { createLogger } from '@voilajs/appkit/logging';
import fs from 'fs';
import readline from 'readline';

// Parse log files for analysis
async function analyzeLogFile(filename) {
  const fileStream = fs.createReadStream(filename);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const stats = {
    total: 0,
    byLevel: { error: 0, warn: 0, info: 0, debug: 0 },
    errors: [],
  };

  for await (const line of rl) {
    try {
      const log = JSON.parse(line);
      stats.total++;
      stats.byLevel[log.level]++;

      if (log.level === 'error') {
        stats.errors.push(log);
      }
    } catch (error) {
      console.error('Failed to parse log line:', error);
    }
  }

  return stats;
}

// Generate daily report
async function generateReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const stats = await analyzeLogFile(`logs/app-${dateStr}.log`);

  console.log('Daily Log Report:');
  console.log(`Total logs: ${stats.total}`);
  console.log(`Errors: ${stats.byLevel.error}`);
  console.log(`Warnings: ${stats.byLevel.warn}`);
}
```

### Detailed Note

To explore advanced features, configuration options, and detailed API
specifications, refer to the developer reference at
[https://github.com/voilajs/appkit/src/logging/DEV_REF.md](https://github.com/voilajs/appkit/src/logging/DEV_REF.md)
and the API documentation at
[https://github.com/voilajs/appkit/src/logging/API.md](https://github.com/voilajs/appkit/src/logging/API.md).
