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

**Expected Output:**

```
2025-05-12T14:35:00.000Z [INFO] User action {"service":"user-api","environment":"production","version":"1.2.3","userId":"123456","action":"profile_update","ip":"192.168.1.1","duration":145}

2025-05-12T14:35:10.500Z [ERROR] Operation failed {"service":"user-api","environment":"production","version":"1.2.3","error":"Database timeout","stack":"Error: Database timeout\n    at riskyOperation...","context":{"userId":"123456","operation":"riskyOperation"}}
```

This advanced configuration is particularly valuable for microservice
architectures where you need to correlate logs across multiple services. The
consistent metadata structure makes it easier to filter and search logs in
centralized logging systems like ELK Stack or Datadog.

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

### Basic Usage

```javascript
// Default file logging (5-day retention)
const logger = createLogger();

// Logs are automatically saved to:
// - logs/app-2024-01-01.log (current day)
// - logs/app-2024-01-01.log.1 (rotated file)
```

**Expected Outcome:**  
With the default settings, log files will be:

1. Created in a `logs` directory in your project root
2. Named with the current date (e.g., `app-2025-05-12.log`)
3. Rotated when they exceed 10MB to `app-2025-05-12.log.1`,
   `app-2025-05-12.log.2`, etc.
4. Automatically deleted after 5 days to manage disk space

💡 **Tip**: Monitor your log directory size and adjust retention settings based
on your needs. In high-traffic applications, log files can grow rapidly and
consume significant disk space, potentially impacting application performance.

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
      maxSize: 100 * 1024 * 1024, // 100MB
    }),
  ],
});
```

**Expected Outcome:**  
This configuration will:

1. Store general logs in `/var/log/myapp/api-YYYY-MM-DD.log`
2. Rotate these files when they reach 50MB
3. Keep these logs for 30 days
4. Store error-only logs in `logs/errors/error-YYYY-MM-DD.log`
5. Keep error logs for 90 days (useful for compliance requirements)

This approach is ideal for applications with different compliance or audit
requirements where error logs need longer retention. It's also useful for
separating high-volume debug logs from critical error information that needs to
be preserved.

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

**Expected Outcome:**  
This production-ready setup:

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

**Expected Output:**

```
2025-05-12T15:00:00.000Z [INFO] Processing request {"requestId":"abc123","userId":"user-456"}
```

💡 **Tip**: Use child loggers instead of repeating the same metadata in every
log call. This not only makes your code cleaner but ensures consistent context
in logs, improving traceability when analyzing issues.

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

**Expected Output (Successful Request):**

```
2025-05-12T15:10:00.000Z [INFO] Request received {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100"}

2025-05-12T15:10:00.010Z [DEBUG] Fetching user from database {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","operation":"getUser","userId":"123"}

2025-05-12T15:10:00.050Z [INFO] User retrieved successfully {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","operation":"getUser","userId":"123"}

2025-05-12T15:10:00.055Z [INFO] Response sent {"service":"api","requestId":"abcd1234","method":"GET","url":"/users/123","ip":"192.168.1.100","statusCode":200,"duration":55,"size":1024}
```

**Expected Output (Failed Request):**

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

**Expected Outcome:**  
This transport will:

1. Format log entries for the Datadog API
2. Send logs to Datadog in real-time
3. Include service name and other metadata
4. Catch and report any transmission errors

This pattern is especially useful for organizations using centralized log
management systems like Datadog, Splunk, or ELK Stack. By implementing custom
transports, you can ensure logs are properly formatted and delivered to the
appropriate service without changing your application's logging code.

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

**Expected Outcome:**  
This multi-transport configuration:

1. Outputs all logs to console and files
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

**Expected Outcome:**  
This comprehensive example:

1. **Startup sequence**:
   - Logs application startup events
   - Captures startup duration
   - Records system information
2. **Request handling**:
   - Creates a child logger for each request
   - Tracks request duration and outcome
   - Adds operation-specific context for specific routes
3. **Error handling**:
   - Captures detailed error information
   - Tracks both expected errors (like validation) and unexpected errors
   - Stores errors with extended retention
4. **Graceful shutdown**:
   - Logs the shutdown sequence
   - Ensures all pending logs are flushed
   - Reports any shutdown errors

This integration shows how a well-structured logging system touches every part
of your application lifecycle - from startup to shutdown, and every request in
between. It provides visibility into application performance, user behavior, and
errors while maintaining a clean separation of concerns in your code.

The approach is particularly valuable for production applications where
observability is critical for maintaining service reliability. By consistently
applying this logging pattern, you create a rich foundation for monitoring,
alerting, and troubleshooting that can help reduce mean time to resolution
(MTTR) when issues occur.

## Additional Resources

- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/logging/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Integration Guide](https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md) -
  AI/LLM code generation
- 📘
  [Examples](https://github.com/voilajs/appkit/blob/main/src/logging/examples/) -
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
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
