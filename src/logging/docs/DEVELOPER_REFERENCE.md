# Logging Module - Developer Reference 🛠️

The logging module provides structured logging capabilities with file storage
and retention for Node.js applications. It offers multiple log levels,
contextual logging with child loggers, automatic file rotation, and configurable
retention policies to help you track, debug, and monitor your applications
effectively.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📊 [Basic Logging](#basic-logging)
  - [Basic Usage](#basic-logging-basic-usage)
  - [Advanced Usage](#basic-logging-advanced-usage)
  - [Complete Example](#basic-logging-complete-example)
- 📁 [File Storage and Rotation](#file-storage-and-rotation)
  - [Basic Usage](#file-storage-and-rotation-basic-usage)
  - [Advanced Usage](#file-storage-and-rotation-advanced-usage)
  - [Complete Example](#file-storage-and-rotation-complete-example)
- 🔗 [Child Loggers](#child-loggers)
  - [Basic Usage](#child-loggers-basic-usage)
  - [Advanced Usage](#child-loggers-advanced-usage)
  - [Complete Example](#child-loggers-complete-example)
- 🚛 [Custom Transports](#custom-transports)
  - [Basic Usage](#custom-transports-basic-usage)
  - [Advanced Usage](#custom-transports-advanced-usage)
  - [Complete Example](#custom-transports-complete-example)
- ⚙️ [Integration with Popular Frameworks](#integration-with-popular-frameworks)
  - [Fastify](#integration-with-popular-frameworks-fastify)
- 🚀
  [Complete Express Integration Example](#complete-express-integration-example)
- 📚 [Additional Resources](#additional-resources)
- 💡 [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @voilajsx/appkit
```

### Basic Import

```javascript
import { createLogger } from '@voilajsx/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging/transports'; // Assumes 'transports/index.js' re-exports these
```

## Basic Logging

The module supports four log levels (error, warn, info, debug) with structured
metadata for better searchability and analysis.

### Basic Usage <a name="basic-logging-basic-usage"></a>

```javascript
import { createLogger } from '@voilajsx/appkit/logging';

// Create a logger with default settings
const logger = createLogger();

// Log messages at different levels
logger.info('Application started');
logger.error('Database connection failed');
logger.warn('Deprecated API used');
logger.debug('Processing user request');
```

**Expected Output:**

```
2025-05-12T14:30:00.000Z [INFO] Application started
2025-05-12T14:30:01.235Z [ERROR] Database connection failed
2025-05-12T14:30:02.457Z [WARN] Deprecated API used
2025-05-12T14:30:03.789Z [DEBUG] Processing user request
```

💡 **Tip**: Use appropriate log levels for different scenarios to make filtering
and analysis easier. In production environments, you might want to set the
minimum level to 'info' to reduce log volume, while using 'debug' during
development and troubleshooting.

### Advanced Usage <a name="basic-logging-advanced-usage"></a>

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

**Expected Output:**

```
2025-05-12T14:35:00.000Z [INFO] User action {"service":"user-api","environment":"production","version":"1.2.3","userId":"123456","action":"profile_update","ip":"192.168.1.1","duration":145}

2025-05-12T14:35:10.500Z [ERROR] Operation failed {"service":"user-api","environment":"production","version":"1.2.3","error":"Database timeout","stack":"Error: Database timeout\n    at riskyOperation...","context":{"userId":"123456","operation":"riskyOperation"}}
```

This advanced configuration is particularly valuable for microservice
architectures where you need to correlate logs across multiple services. The
consistent metadata structure makes it easier to filter and search logs in
centralized logging systems like ELK Stack or Datadog.

### Complete Example <a name="basic-logging-complete-example"></a>

```javascript
import { createLogger } from '@voilajsx/appkit/logging';
import os from 'os'; // Don't forget to import os for os.hostname()

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
  // Dummy db and user object for example
  const db = {
    users: {
      update: async (id, userData) => {
        return new Promise((resolve) =>
          setTimeout(() => resolve({ id, ...userData }), 50)
        );
      },
    },
  };
  const user = { id: 'dummy-user-id', name: 'dummy-user-name' };

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

// Example usage call
// (async () => {
//   await updateUser('test-user-id', { email: 'test@example.com' });
// })();
```

**Expected Output (Success):**

```
2025-05-12T14:40:00.000Z [INFO] Database operation completed {"service":"payment-service","environment":"production","hostname":"app-server-01","pid":12345,"operation":"updateUser","duration":45,"success":true,"timestamp":"2025-05-12T14:40:00.045Z"}
```

**Expected Output (Failure):**

```
2025-05-12T14:41:00.000Z [ERROR] Database operation failed {"service":"payment-service","environment":"production","hostname":"app-server-01","pid":12345,"operation":"updateUser","duration":78,"success":false,"timestamp":"2025-05-12T14:41:00.078Z","error":"User not found","stack":"Error: User not found\n    at updateUser..."}
```

This pattern is particularly useful for performance monitoring and
troubleshooting. By consistently logging operation durations and outcomes, you
can track system performance over time, identify slow database queries, and
quickly pinpoint the source of errors. This approach works well with monitoring
tools that can alert on error rates or performance degradations.

## File Storage and Rotation

The module includes automatic file logging with rotation based on size and date,
plus configurable retention policies.

### Basic Usage <a name="file-storage-and-rotation-basic-usage"></a>

```javascript
// Default file logging (7-day retention)
const logger = createLogger();

// Logs are automatically saved to:
// - logs/app-2024-01-01.log (current day)
// - logs/app-2024-01-01.log.1 (rotated file)
```

**Expected Outcome:** With the default settings, log files will be:

1. Created in a `logs` directory in your project root
2. Named with the current date (e.g., `app-2025-05-12.log`)
3. Rotated when they exceed 10MB to `app-2025-05-12.log.1`,
   `app-2025-05-12.log.2`, etc.
4. Automatically deleted after **7 days** to manage disk space

💡 **Tip**: Monitor your log directory size and adjust retention settings based
on your needs. In high-traffic applications, log files can grow rapidly and
consume significant disk space, potentially impacting application performance.

### Advanced Usage <a name="file-storage-and-rotation-advanced-usage"></a>

```javascript
import { createLogger } from '@voilajsx/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging/transports';

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
      maxSize: 100 * 1024 * 1024, // 100MB
    }),
  ],
});
```

**Expected Outcome:** This configuration will:

1. Store general logs in `/var/log/myapp/api-YYYY-MM-DD.log`
2. Rotate these files when they reach 50MB
3. Keep these logs for 30 days
4. Store error-only logs in `logs/errors/error-YYYY-MM-DD.log`
5. Keep error logs for 90 days (useful for compliance requirements)

This approach is ideal for applications with different compliance or audit
requirements where error logs need longer retention. It's also useful for
separating high-volume debug logs from critical error information that needs to
be preserved.

### Complete Example <a name="file-storage-and-rotation-complete-example"></a>

```javascript
import { createLogger } from '@voilajsx/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging/transports';
import fs from 'fs'; // Import fs for fs.promises.stat and fs.promises.readdir
import os from 'os'; // Import os for os.hostname()

// Production logging setup with multiple transports
function createProductionLogger(service) {
  return createLogger({
    level: 'info',
    defaultMeta: {
      service,
      environment: 'production',
      hostname: os.hostname(),
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
  const logDir = '/var/log/app'; // Define the directory
  try {
    const stats = await fs.promises.stat(logDir);
    const files = await fs.promises.readdir(logDir);

    logger.info('Log directory statistics', {
      size: stats.size,
      files: files.length,
    });

    // Alert if logs are too large
    if (stats.size > 1024 * 1024 * 1024) {
      // 1GB
      logger.warn('Log directory exceeds 1GB');
    }
  } catch (error) {
    logger.error('Error monitoring log directory', {
      path: logDir,
      error: error.message,
    });
  }
}

const logger = createProductionLogger('user-api');
// setInterval(() => monitorLogs(logger), 24 * 60 * 60 * 1000); // Uncomment for production
```

**Expected Outcome:** This production-ready setup:

1. Creates separate log files for each microservice (e.g.,
   `user-api-2025-05-12.log`)
2. Outputs plain JSON logs to console (ideal for container environments like
   Docker)
3. Separates error logs with longer retention periods
4. Monitors log directory size to prevent disk space issues
5. Sends a warning when log volume exceeds 1GB

This configuration is particularly valuable in containerized environments
(Docker, Kubernetes) where logs from the console are typically collected by the
container orchestration system, while file logs can be mounted to persistent
volumes. The monitoring function helps prevent disk space issues that could
impact application availability.

## Child Loggers

Child loggers inherit context from their parent while adding their own metadata,
perfect for request-specific or operation-specific logging.

### Basic Usage <a name="child-loggers-basic-usage"></a>

```javascript
const logger = createLogger();

// Create child logger with additional context
const requestLogger = logger.child({
  requestId: 'abc123',
  userId: 'user-456', // Assuming user.id is 'user-456' for example
});

requestLogger.info('Processing request');
// All logs include requestId and userId
```

**Expected Output:**

```
2025-05-12T15:00:00.000Z [INFO] Processing request {"requestId":"abc123","userId":"user-456"}
```

💡 **Tip**: Use child loggers instead of repeating the same metadata in every
log call. This not only makes your code cleaner but ensures consistent context
in logs, improving traceability when analyzing issues.

### Advanced Usage <a name="child-loggers-advanced-usage"></a>

```javascript
// Dummy express imports for example
const express = () => ({
  use: () => {},
  get: () => {},
  post: () => {},
  listen: () => {},
});
const app = express();
const req = {
  id: 'req-789',
  method: 'GET',
  path: '/users/123',
  ip: '203.0.113.42',
  get: (header) => (header === 'user-agent' ? 'Mozilla/5.0...' : undefined),
  startTime: Date.now(),
};
const res = {
  on: (event, cb) => {
    if (event === 'finish') {
      setTimeout(() => cb(), 100); // Simulate finish event
    }
  },
  statusCode: 200,
};
const next = () => {};
// End dummy express imports

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

// Example usage (uncomment to run)
// import { createLogger } from '@voilajsx/appkit/logging';
// const logger = createLogger();
// requestLoggingMiddleware(logger)(req, res, next);
```

**Expected Output:**

```
2025-05-12T15:05:00.000Z [INFO] Request started {"requestId":"req-789","method":"GET","path":"/users/123","ip":"203.0.113.42","userAgent":"Mozilla/5.0..."}

2025-05-12T15:05:00.120Z [INFO] Request completed {"requestId":"req-789","method":"GET","path":"/users/123","ip":"203.0.113.42","userAgent":"Mozilla/5.0...","statusCode":200,"duration":120}
```

This middleware approach is especially valuable for request tracing in
microservice architectures. By attaching a logger with request context to the
request object, you create a clean way to track the entire request lifecycle
across all middleware and route handlers, making it easier to trace issues
through the system.

### Complete Example <a name="child-loggers-complete-example"></a>

```javascript
import { createLogger } from '@voilajsx/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging/transports';
import express from 'express'; // Assuming express is installed
import { Buffer } from 'buffer'; // Explicitly import Buffer
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed for generateId
// Dummy User object for example
const User = {
  findById: async (id) => {
    if (id === '123') return { id: '123', name: 'Test User' };
    if (id === '999') return null;
    throw new Error('Database error');
  },
  create: async (data) => {
    return { id: uuidv4(), ...data };
  },
};
const connectDatabase = async () => console.log('Database connected (dummy)');
// End dummy imports

const app = express();
app.use(express.json()); // For req.body parsing

const logger = createLogger({
  defaultMeta: { service: 'api' },
});

// Helper to generate IDs if req.id is not available
function generateId() {
  return uuidv4();
}

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();

  // Create request-specific logger
  req.logger = logger.child({
    requestId: req.id || generateId(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id,
  });

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

// Error handling middleware
app.use((err, req, res, next) => {
  // Ensure req.logger exists before using it
  const currentLogger = req.logger || logger;
  currentLogger.error('Unhandled error', {
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

app.get('/users/:id', async (req, res) => {
  const operationLogger = req.logger.child({
    operation: 'getUser',
    userId: req.params.id,
  });

  try {
    operationLogger.debug('Fetching user from database');
    const user = await User.findById(req.params.id);

    if (!user) {
      operationLogger.warn('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    operationLogger.info('User retrieved successfully');
    res.json(user);
  } catch (error) {
    operationLogger.error('Error fetching user', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
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
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) return reject(err);
            resolve();
          });
        });
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

// startApp(); // Uncomment to run this example directly
```

**Expected Outcome (Successful Request):**

```
2025-05-12T15:10:00.000Z [INFO] Request received {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100"}

2025-05-12T15:10:00.010Z [DEBUG] Fetching user from database {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","operation":"getUser","userId":"123"}

2025-05-12T15:10:00.050Z [INFO] User retrieved successfully {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","operation":"getUser","userId":"123"}

2025-05-12T15:10:00.055Z [INFO] Response sent {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","statusCode":200,"duration":55,"size":1024}
```

**Expected Outcome (Failed Request):**

```
2025-05-12T15:15:00.000Z [INFO] Request received {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100"}

2025-05-12T15:15:00.010Z [DEBUG] Fetching user from database {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100","operation":"getUser","userId":"999"}

2025-05-12T15:15:00.030Z [WARN] User not found {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100","operation":"getUser","userId":"999"}

2025-05-12T15:15:00.035Z [INFO] Response sent {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100","statusCode":404,"duration":35,"size":27}
```

This example demonstrates the power of nested child loggers, which are
particularly useful in complex web applications. The pattern creates a hierarchy
of context (request → operation) that makes it easy to:

1. Track complete request lifecycles from receipt to response
2. Associate specific operations with requests
3. Measure performance at different stages
4. Quickly identify problematic requests in logs
5. See the complete request context when errors occur

This approach scales well to complex applications with many routes and
operations, maintaining consistent logging context throughout the request
lifecycle.

## Custom Transports

Create custom transports to send logs to external services or implement
specialized logging behavior.

### Basic Usage <a name="custom-transports-basic-usage"></a>

```javascript
import { BaseTransport } from '@voilajsx/appkit/logging/transports/base';
import { createLogger } from '@voilajsx/appkit/logging'; // Import createLogger for example

class CustomTransport extends BaseTransport {
  async log(entry) {
    // Custom logging logic
    console.log('Custom:', entry);
  }
}

const logger = createLogger({
  transports: [new CustomTransport()],
});

// Example usage (uncomment to run)
// logger.info('Test message for custom transport');
```

**Expected Output:**

```
Custom: {
  timestamp: '2025-05-12T15:20:00.000Z',
  level: 'info',
  message: 'Test message',
  ...other metadata
}
```

💡 **Tip**: Extend BaseTransport to inherit level filtering and other base
functionality. Custom transports are ideal for integrating with specialized log
management systems or for implementing organization-specific logging
requirements.

### Advanced Usage <a name="custom-transports-advanced-usage"></a>

```javascript
import { BaseTransport } from '@voilajsx/appkit/logging/transports/base';
import fetch from 'node-fetch'; // Assuming node-fetch is installed for examples if not browser env

// External service transport
class DatadogTransport extends BaseTransport {
  constructor(options) {
    super(options);
    this.apiKey = options.apiKey;
    this.service = options.service;
    if (!this.apiKey) {
      console.error('DatadogTransport: API Key is required!');
    }
  }

  async log(entry) {
    if (!this.apiKey) {
      console.error('DatadogTransport: Cannot send log, API Key missing.');
      return;
    }
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
          ...entry, // Include all metadata
        }),
      });
    } catch (error) {
      console.error('Failed to send log to Datadog:', error);
    }
  }
}

// Example usage (uncomment and provide API key)
// import { createLogger } from '@voilajsx/appkit/logging';
// const logger = createLogger({
//   transports: [
//     new DatadogTransport({
//       apiKey: process.env.DATADOG_API_KEY,
//       service: 'my-web-service'
//     })
//   ]
// });
// logger.info('This log should go to Datadog');
```

**Expected Outcome:** This transport will:

1. Format log entries for the Datadog API
2. Send logs to Datadog in real-time
3. Include service name and other metadata
4. Catch and report any transmission errors

This pattern is especially useful for organizations using centralized log
management systems like Datadog, Splunk, or ELK Stack. By implementing custom
transports, you can ensure logs are properly formatted and delivered to the
appropriate service without changing your application's logging code.

### Complete Example <a name="custom-transports-complete-example"></a>

```javascript
import { BaseTransport } from '@voilajsx/appkit/logging/transports/base';
import {
  ConsoleTransport,
  FileTransport,
  createLogger,
} from '@voilajsx/appkit/logging'; // Import createLogger here

// Dummy database and email service for example
const dbConnection = {
  query: async (sql, params) => {
    console.log('DB Query:', sql, params);
    return new Promise((resolve) =>
      setTimeout(() => resolve({ rows: [] }), 10)
    );
  },
};
const emailService = {
  send: async ({ to, subject, text }) => {
    console.log(`Email sent to ${to} with subject "${subject}"`);
  },
};
// End dummy imports

// Database transport for audit logging
class DatabaseTransport extends BaseTransport {
  constructor(options) {
    super(options);
    this.db = options.db;
    this.table = options.table || 'audit_logs';
  }

  async log(entry) {
    // Only log audit events if 'audit' flag is true in metadata
    if (!entry.meta || !entry.meta.audit) return; // Access 'meta' property

    try {
      await this.db.query(
        `INSERT INTO ${this.table} (timestamp, level, message, metadata) VALUES (?, ?, ?, ?)`,
        [
          new Date(entry.timestamp),
          entry.level,
          entry.message,
          JSON.stringify(entry), // Store full entry including meta
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
    super({ ...options, level: 'error' }); // Only errors for this transport
    this.emailService = options.emailService;
    this.alertEmail = options.alertEmail;
    if (!this.emailService || !this.alertEmail) {
      console.error(
        'EmailAlertTransport: emailService and alertEmail are required!'
      );
    }
  }

  async log(entry) {
    // This transport only processes 'error' level messages
    if (entry.level !== 'error') return;

    if (!this.emailService || !this.alertEmail) {
      console.error(
        'EmailAlertTransport: Cannot send alert, service or email missing.'
      );
      return;
    }

    try {
      await this.emailService.send({
        to: this.alertEmail,
        subject: `Error Alert: ${entry.message}`,
        text: JSON.stringify(entry, null, 2), // Send formatted JSON of the entry
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
    audit: true, // Flag to trigger DatabaseTransport
    userId,
    details,
    // timestamp: new Date().toISOString(), // Logger automatically adds timestamp
  });
}

// Example usage (uncomment to run)
// auditLog('UserLoggedIn', 'user-123', { ip: '192.168.1.1' });
// logger.error('Critical process failed', { component: 'worker', pid: 1234 });
// logger.info('Regular info message');
```

**Expected Outcome:** This multi-transport configuration:

1. Outputs all logs to console and file
2. Stores audit logs in a database table for compliance
3. Sends email alerts for all error logs
4. Uses a helper function to standardize audit logging

The outcomes of different log types:

- **Regular log**: Goes to console and file
- **Audit log**: Goes to console, file, and database
- **Error log**: Goes to console, file, and triggers an email alert

This pattern is particularly valuable for:

- **Compliance requirements**: Storing audit logs in a database for legal or
  regulatory requirements
- **Operations monitoring**: Sending immediate alerts for critical errors
- **Security analysis**: Maintaining separate audit trails for security reviews
- **Legacy system integration**: Connecting with existing logging infrastructure

Such a setup provides both real-time monitoring capability and long-term audit
trails while maintaining a clean, consistent logging API in your application
code.

## Integration with Popular Frameworks

While `@voilajsx/appkit/logging` is designed to be framework-agnostic, various
Node.js frameworks and libraries have their own conventions or expected
interfaces for logging. To ensure seamless integration and leverage your logger
within such frameworks, you may need to provide a small adapter object that maps
their expected logging methods to your logger's available methods.

This approach allows your core logger to remain minimal and independent, while
still being compatible with a wide ecosystem of tools.

### Fastify <a name="integration-with-popular-frameworks-fastify"></a>

Fastify, by default, uses `pino` for logging and expects a logger instance with
methods like `fatal`, `error`, `warn`, `info`, `debug`, and `trace`. Since
`@voilajsx/appkit/logging` does not include `fatal` or `trace` by default, you
can create a simple adapter to map these calls to your existing log levels
(e.g., `fatal` to `error`, `trace` to `debug`).

**Example File: `src/logging/examples/05-fastify-integration.js`**

```javascript
// src/logging/examples/05-fastify-integration.js

import Fastify from 'fastify';
import { createLogger } from '@voilajsx/appkit/logging'; // Using the installed package

async function startFastifyApp() {
  // 1. Initialize your @voilajsx/appkit logger
  const appLogger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    dirname: 'logs',
    filename: 'fastify-app.log',
    retentionDays: 7, // Consistent with updated logger and README
    maxSize: 10485760, // 10MB
  });

  // 2. Define the custom logger options for Fastify.
  const fastifyLoggerOptions = {
    // Crucial: Pass 'null' for the initial 'logger' option to prevent Fastify
    // from setting up its own default pino instance for startup messages.
    logger: null,

    // Fastify still needs a 'level' to manage internal log filtering.
    level: appLogger.level,

    // The 'customFactory' is the key here. Fastify will call this
    // to get the logger instance it will use internally (e.g., for request.log).
    customFactory: (factoryLogLevel, factoryLogStream) => {
      // Return an object that has all the logging methods Fastify expects.
      // These methods will route Fastify's internal logs to your appLogger.
      return {
        fatal: (msg, meta) =>
          appLogger.error(msg, { ...meta, fastifyLevel: 'fatal' }),
        error: (msg, meta) => appLogger.error(msg, meta),
        warn: (msg, meta) => appLogger.warn(msg, meta),
        info: (msg, meta) => appLogger.info(msg, meta),
        debug: (msg, meta) => appLogger.debug(msg, meta),
        trace: (msg, meta) =>
          appLogger.debug(msg, { ...meta, fastifyLevel: 'trace' }),
        silent: () => {},
        // The child method is crucial for request.log and contextual logging within Fastify
        child: (bindings) => appLogger.child(bindings),
      };
    },
  };

  // 3. Initialize Fastify with your custom logger factory options
  const fastify = Fastify({
    ...fastifyLoggerOptions,
  });

  // Register a simple route
  fastify.get('/', async (request, reply) => {
    // Fastify's request.log will now use your adapter (created by customFactory)
    request.log.info('Incoming request to root path');
    reply.send({ hello: 'world' });
  });

  // Register a route to test internal error logging
  fastify.get('/error', async (request, reply) => {
    request.log.error('Simulating an error in /error route');
    throw new Error('This is an intentional error from Fastify route');
  });

  // Start the server
  try {
    await fastify.listen({ port: 3000 });
    // You can still use your direct appLogger instance for application-level logs
    appLogger.info('Fastify server listening on port 3000');
  } catch (err) {
    // If an error occurs during Fastify startup, its log instance (your adapter) will be used.
    fastify.log.error(err);
    process.exit(1);
  }

  return fastify; // Return the fastify instance for shutdown
}

// Global variable to hold Fastify instance for shutdown
let fastifyInstance;

// Start the application
startFastifyApp()
  .then((instance) => {
    fastifyInstance = instance;
  })
  .catch((err) => {
    console.error('Failed to start Fastify app:', err);
    process.exit(1);
  });

// Graceful shutdown handling
// Declare appLogger in a scope accessible by the cleanup handlers
let appLoggerForShutdown; // A separate reference for the logger in the outer scope
const cleanupAndExit = async () => {
  console.log('Initiating graceful shutdown...');

  // 1. Close Fastify server
  if (fastifyInstance) {
    try {
      console.log('Attempting to close Fastify server...');
      await fastifyInstance.close();
      console.log('Fastify server closed successfully.');
    } catch (err) {
      console.error('Error closing Fastify server:', err);
    }
  }

  // 2. Close app logger
  // Need to ensure the appLogger reference from startFastifyApp is used.
  // The 'appLogger' variable in startFastifyApp is local to that function.
  // We need to capture it if createLogger doesn't return singletons.
  // Otherwise, 'appLoggerForShutdown' must be assigned the instance created in 'startFastifyApp'.
  // For this example, we will assume `appLoggerForShutdown` is assigned the correct instance.
  // A common robust pattern would be to pass the logger instance to cleanupAndExit directly.
  if (appLoggerForShutdown) {
    // Use the reference made available to the outer scope
    try {
      console.log('Attempting to flush and close app logger...');
      await appLoggerForShutdown.flush();
      await appLoggerForShutdown.close();
      console.log('App logger flushed and closed successfully.');
    } catch (err) {
      console.error('Error flushing/closing app logger:', err);
    }
  } else {
    console.warn(
      'App logger not initialized or not accessible for graceful shutdown.'
    );
  }

  // 3. Final exit. A small delay can help if there are very subtle pending I/O operations.
  console.log(
    'All major services reportedly closed. Exiting process in 100ms...'
  );
  setTimeout(() => {
    process.exit(0);
  }, 100);
};

process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);
```

## Complete Express Integration Example <a name="complete-express-integration-example"></a>

Here's a production-ready example showing all features working together:

```javascript
import express from 'express';
import { createLogger } from '@voilajsx/appkit/logging';
import {
  ConsoleTransport,
  FileTransport,
} from '@voilajsx/appkit/logging/transports';
import { Buffer } from 'buffer'; // Explicitly import Buffer
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed for generateId
import os from 'os'; // Import os for os.hostname()

// Dummy User object for example
const User = {
  findById: async (id) => {
    if (id === '123') return { id: '123', name: 'Test User' };
    if (id === '999') return null;
    throw new Error('Database error');
  },
  create: async (data) => {
    return { id: uuidv4(), ...data };
  },
};
const connectDatabase = async () => console.log('Database connected (dummy)');
// End dummy imports

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
app.use(express.json()); // For req.body parsing

// Request logging middleware
app.use((req, res, next) => {
  req.startTime = Date.now();

  // Create request logger
  req.logger = logger.child({
    requestId: req.id || uuidv4(), // Use uuidv4 for req.id if not provided by framework
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
  });

  req.logger.info('Request received');

  // Log response
  const originalSend = res.send;
  res.send = function (body) {
    req.logger.info('Response sent', {
      statusCode: res.statusCode,
      duration: Date.now() - req.startTime,
      size: Buffer.byteLength(body || ''), // Handle empty body
    });
    return originalSend.call(this, body);
  };

  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  const currentLogger = req.logger || logger; // Use request-specific logger or main logger
  currentLogger.error('Unhandled error', {
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

app.get('/users/:id', async (req, res) => {
  const operationLogger = req.logger.child({
    operation: 'getUser',
    userId: req.params.id,
  });

  try {
    operationLogger.debug('Fetching user from database');
    const user = await User.findById(req.params.id);

    if (!user) {
      operationLogger.warn('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    operationLogger.info('User retrieved successfully');
    res.json(user);
  } catch (error) {
    operationLogger.error('Error fetching user', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
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
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) return reject(err);
            resolve();
          });
        });
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

// startApp(); // Uncomment to run this example directly
```

**Expected Outcome (Successful Request):**

```
2025-05-12T15:10:00.000Z [INFO] Request received {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100"}

2025-05-12T15:10:00.010Z [DEBUG] Fetching user from database {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","operation":"getUser","userId":"123"}

2025-05-12T15:10:00.050Z [INFO] User retrieved successfully {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","operation":"getUser","userId":"123"}

2025-05-12T15:10:00.055Z [INFO] Response sent {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","statusCode":200,"duration":55,"size":1024}
```

**Expected Outcome (Failed Request):**

```
2025-05-12T15:15:00.000Z [INFO] Request received {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100"}

2025-05-12T15:15:00.010Z [DEBUG] Fetching user from database {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100","operation":"getUser","userId":"999"}

2025-05-12T15:15:00.030Z [WARN] User not found {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100","operation":"getUser","userId":"999"}

2025-05-12T15:15:00.035Z [INFO] Response sent {"service":"api","requestId":"efgh5678","method":"GET","url":"/users/999","ip":"192.168.1.100","statusCode":404,"duration":35,"size":27}
```

This example demonstrates the power of nested child loggers, which are
particularly useful in complex web applications. The pattern creates a hierarchy
of context (request → operation) that makes it easy to:

1. Track complete request lifecycles from receipt to response
2. Associate specific operations with requests
3. Measure performance at different stages
4. Quickly identify problematic requests in logs
5. See the complete request context when errors occur

This approach scales well to complex applications with many routes and
operations, maintaining consistent logging context throughout the request
lifecycle.

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajsx/appkit/blob/main/src/logging/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Integration Guide](https://github.com/voilajsx/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md) -
  AI/LLM code generation
- 📘
  [Examples](https://github.com/voilajsx/appkit/blob/main/src/logging/examples/) -
  Full example code

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
Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
