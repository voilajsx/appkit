# Logging Module - Developer Reference 🛠️

The logging module provides structured logging capabilities with file storage
and retention for Node.js applications. It offers multiple log levels,
contextual logging with child loggers, automatic file rotation, and configurable
retention policies to help you track, debug, and monitor your applications
effectively.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📊 [Basic Logging](#basic-logging)
  - [Basic Usage](#basic-usage)
  - [Advanced Usage](#advanced-usage)
  - [Complete Example](#complete-example)
- 📁 [File Storage and Rotation](#file-storage-and-rotation)
  - [Basic Usage](#basic-usage-1)
  - [Advanced Usage](#advanced-usage-1)
  - [Complete Example](#complete-example-1)
- 🔗 [Child Loggers](#child-loggers)
  - [Basic Usage](#basic-usage-2)
  - [Advanced Usage](#advanced-usage-2)
  - [Complete Example](#complete-example-2)
- 🚛 [Custom Transports](#custom-transports)
  - [Basic Usage](#basic-usage-3)
  - [Advanced Usage](#advanced-usage-3)
  - [Complete Example](#complete-example-3)
- 🚀 [Complete Integration Example](#complete-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajs/appkit
```

### Basic Import

```javascript
import { createLogger } from '@voilajs/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajs/appkit/logging/transports';
```

## Basic Logging

The module supports four log levels (error, warn, info, debug) with structured
metadata for better searchability and analysis.

### Basic Usage

```javascript
import { createLogger } from '@voilajs/appkit/logging';

// Create a logger with default settings
const logger = createLogger();

// Log messages at different levels
logger.info('Application started');
logger.error('Database connection failed');
logger.warn('Deprecated API used');
logger.debug('Processing user request');
```

💡 **Tip**: Use appropriate log levels for different scenarios to make filtering
and analysis easier.

### Advanced Usage

```javascript
// Configure logger with custom settings
const logger = createLogger({
  level: 'debug',
  defaultMeta: {
    service: 'user-api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
});

// Log with additional metadata
logger.info('User action', {
  userId: user.id,
  action: 'profile_update',
  ip: req.ip,
  duration: 145,
});

// Structured error logging
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: { userId: user.id, operation: 'riskyOperation' },
  });
}
```

### Complete Example

```javascript
import { createLogger } from '@voilajs/appkit/logging';

// Configure logger for production
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'payment-service',
    environment: process.env.NODE_ENV,
    hostname: os.hostname(),
    pid: process.pid,
  },
});

// Logging helper function
function logDatabaseOperation(operation, duration, success, error = null) {
  const metadata = {
    operation,
    duration,
    success,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    logger.error('Database operation failed', {
      ...metadata,
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger.info('Database operation completed', metadata);
  }
}

// Use in application
async function updateUser(userId, data) {
  const startTime = Date.now();

  try {
    const result = await db.users.update(userId, data);
    logDatabaseOperation('updateUser', Date.now() - startTime, true);
    return result;
  } catch (error) {
    logDatabaseOperation('updateUser', Date.now() - startTime, false, error);
    throw error;
  }
}
```

## File Storage and Rotation

The module includes automatic file logging with rotation based on size and date,
plus configurable retention policies.

### Basic Usage

```javascript
// Default file logging (5-day retention)
const logger = createLogger();

// Logs are automatically saved to:
// - logs/app-2024-01-01.log (current day)
// - logs/app-2024-01-01.log.1 (rotated file)
```

💡 **Tip**: Monitor your log directory size and adjust retention settings based
on your needs.

### Advanced Usage

```javascript
import { createLogger } from '@voilajs/appkit/logging';
import { FileTransport } from '@voilajs/appkit/logging/transports';

// Custom file logging configuration
const logger = createLogger({
  transports: [
    new ConsoleTransport(),
    new FileTransport({
      dirname: '/var/log/myapp',
      filename: 'api.log',
      retentionDays: 30,
      maxSize: 50 * 1024 * 1024, // 50MB
    }),
  ],
});

// Separate logs for different purposes
const errorLogger = createLogger({
  transports: [
    new FileTransport({
      dirname: 'logs/errors',
      filename: 'error.log',
      retentionDays: 90,
      level: 'error',
    }),
  ],
});
```

### Complete Example

```javascript
import { createLogger } from '@voilajs/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajs/appkit/logging/transports';

// Production logging setup with multiple transports
function createProductionLogger(service) {
  return createLogger({
    level: 'info',
    defaultMeta: {
      service,
      environment: 'production',
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
        filename: `${service}.log`,
        retentionDays: 30,
        maxSize: 50 * 1024 * 1024,
      }),
      // Error logs with longer retention
      new FileTransport({
        dirname: '/var/log/app/errors',
        filename: `${service}-error.log`,
        retentionDays: 90,
        level: 'error',
      }),
    ],
  });
}

// Monitor log directory
async function monitorLogs(logger) {
  const stats = await fs.promises.stat('/var/log/app');

  logger.info('Log directory statistics', {
    size: stats.size,
    files: await fs.promises.readdir('/var/log/app').length,
  });

  // Alert if logs are too large
  if (stats.size > 1024 * 1024 * 1024) {
    // 1GB
    logger.warn('Log directory exceeds 1GB');
  }
}

const logger = createProductionLogger('user-api');
setInterval(() => monitorLogs(logger), 24 * 60 * 60 * 1000);
```

## Child Loggers

Child loggers inherit context from their parent while adding their own metadata,
perfect for request-specific or operation-specific logging.

### Basic Usage

```javascript
const logger = createLogger();

// Create child logger with additional context
const requestLogger = logger.child({
  requestId: 'abc123',
  userId: user.id,
});

requestLogger.info('Processing request');
// All logs include requestId and userId
```

💡 **Tip**: Use child loggers instead of repeating the same metadata in every
log call.

### Advanced Usage

```javascript
// Express middleware for request logging
function requestLoggingMiddleware(logger) {
  return (req, res, next) => {
    // Create request-specific logger
    req.logger = logger.child({
      requestId: req.id,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Log request lifecycle
    req.logger.info('Request started');

    res.on('finish', () => {
      req.logger.info('Request completed', {
        statusCode: res.statusCode,
        duration: Date.now() - req.startTime,
      });
    });

    next();
  };
}
```

### Complete Example

```javascript
import { createLogger } from '@voilajs/appkit/logging';
import express from 'express';

const app = express();
const logger = createLogger({
  defaultMeta: { service: 'api' },
});

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();

  // Create request-specific logger
  req.logger = logger.child({
    requestId: req.id || generateId(),
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  // Log request
  req.logger.info('Request received');

  // Log response
  const originalSend = res.send;
  res.send = function (body) {
    req.logger.info('Response sent', {
      statusCode: res.statusCode,
      duration: Date.now() - req.startTime,
      size: Buffer.byteLength(body),
    });
    return originalSend.call(this, body);
  };

  next();
});

// Use in routes
app.get('/users/:id', async (req, res) => {
  const userLogger = req.logger.child({
    operation: 'getUser',
    userId: req.params.id,
  });

  try {
    userLogger.debug('Fetching user from database');
    const user = await User.findById(req.params.id);

    if (!user) {
      userLogger.warn('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    userLogger.info('User retrieved successfully');
    res.json(user);
  } catch (error) {
    userLogger.error('Error fetching user', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Custom Transports

Create custom transports to send logs to external services or implement
specialized logging behavior.

### Basic Usage

```javascript
import { BaseTransport } from '@voilajs/appkit/logging/transports/base';

class CustomTransport extends BaseTransport {
  async log(entry) {
    // Custom logging logic
    console.log('Custom:', entry);
  }
}

const logger = createLogger({
  transports: [new CustomTransport()],
});
```

💡 **Tip**: Extend BaseTransport to inherit level filtering and other base
functionality.

### Advanced Usage

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
    try {
      await fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.apiKey,
        },
        body: JSON.stringify({
          message: entry.message,
          level: entry.level,
          service: this.service,
          ...entry,
        }),
      });
    } catch (error) {
      console.error('Failed to send log to Datadog:', error);
    }
  }
}
```

### Complete Example

```javascript
import { BaseTransport } from '@voilajs/appkit/logging/transports/base';
import { createLogger } from '@voilajs/appkit/logging';

// Database transport for audit logging
class DatabaseTransport extends BaseTransport {
  constructor(options) {
    super(options);
    this.db = options.db;
    this.table = options.table || 'audit_logs';
  }

  async log(entry) {
    // Only log audit events
    if (!entry.audit) return;

    try {
      await this.db.query(
        `INSERT INTO ${this.table} (timestamp, level, message, metadata) VALUES (?, ?, ?, ?)`,
        [
          new Date(entry.timestamp),
          entry.level,
          entry.message,
          JSON.stringify(entry),
        ]
      );
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }
}

// Email alert transport
class EmailAlertTransport extends BaseTransport {
  constructor(options) {
    super({ ...options, level: 'error' }); // Only errors
    this.emailService = options.emailService;
    this.alertEmail = options.alertEmail;
  }

  async log(entry) {
    if (entry.level !== 'error') return;

    try {
      await this.emailService.send({
        to: this.alertEmail,
        subject: `Error Alert: ${entry.message}`,
        text: JSON.stringify(entry, null, 2),
      });
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }
}

// Usage
const logger = createLogger({
  transports: [
    new ConsoleTransport(),
    new FileTransport({
      dirname: 'logs',
      retentionDays: 30,
    }),
    new DatabaseTransport({
      db: dbConnection,
      table: 'audit_logs',
    }),
    new EmailAlertTransport({
      emailService: emailService,
      alertEmail: 'alerts@example.com',
    }),
  ],
});

// Audit logging helper
function auditLog(action, userId, details) {
  logger.info(action, {
    audit: true,
    userId,
    details,
    timestamp: new Date().toISOString(),
  });
}
```

## Complete Integration Example

Here's a production-ready example showing all features working together:

```javascript
import express from 'express';
import { createLogger } from '@voilajs/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajs/appkit/logging/transports';

// Create main application logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'user-api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [
    new ConsoleTransport({
      colorize: process.env.NODE_ENV !== 'production',
      prettyPrint: process.env.NODE_ENV === 'development',
    }),
    new FileTransport({
      dirname: process.env.LOG_DIR || 'logs',
      filename: 'app.log',
      retentionDays: process.env.NODE_ENV === 'production' ? 30 : 7,
      maxSize: 50 * 1024 * 1024,
    }),
    new FileTransport({
      dirname: process.env.LOG_DIR || 'logs',
      filename: 'error.log',
      retentionDays: 90,
      level: 'error',
    }),
  ],
});

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Create request logger
  req.logger = logger.child({
    requestId: req.id || generateId(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
  });

  req.logger.info('Request started');

  // Log response
  res.on('finish', () => {
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      contentLength: res.get('content-length'),
    });
  });

  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  req.logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    code: err.code,
  });

  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

// User routes with logging
app.post('/users', async (req, res) => {
  const operationLogger = req.logger.child({
    operation: 'createUser',
  });

  try {
    operationLogger.info('Creating new user');

    const user = await User.create(req.body);

    operationLogger.info('User created successfully', {
      userId: user.id,
      email: user.email,
    });

    res.status(201).json(user);
  } catch (error) {
    operationLogger.error('User creation failed', {
      error: error.message,
      code: error.code,
      details: error.details,
    });

    res.status(400).json({
      error: error.message,
    });
  }
});

// Application startup
async function startApp() {
  const startTime = Date.now();

  logger.info('Starting application');

  try {
    // Database connection
    await connectDatabase();
    logger.info('Database connected');

    // Start server
    const server = app.listen(process.env.PORT || 3000, () => {
      logger.info('Application started successfully', {
        port: process.env.PORT || 3000,
        startupTime: Date.now() - startTime,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, starting graceful shutdown');

      try {
        await server.close();
        logger.info('HTTP server closed');

        await logger.flush();
        await logger.close();

        logger.info('Application shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', {
          error: error.message,
          stack: error.stack,
        });
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Failed to start application', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

startApp();
```

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/logging/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Integration Guide](https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md) -
  AI/LLM code generation
- 📘 [Examples Repository](https://github.com/voilajs/appkit-examples) - Full
  example applications

## Best Practices

### 🔐 Security

- Never log sensitive information (passwords, API keys, PII)
- Sanitize user input before including in logs
- Use appropriate log levels to avoid exposing sensitive details
- Configure file permissions properly for log directories

### 🏗️ Architecture

- Use child loggers for request/operation context
- Separate logs by purpose (errors, audit, general)
- Implement centralized logging for distributed systems
- Use structured logging for better searchability

### 🚀 Performance

- Use appropriate log levels to reduce I/O
- Configure reasonable file sizes and retention
- Avoid logging in tight loops
- Use batch logging for high-frequency operations

### 👥 User Experience

- Include helpful context in error logs
- Use consistent message formats
- Add correlation IDs for request tracing
- Monitor and alert on critical errors

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
