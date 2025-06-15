# @voilajsx/appkit - Logging Module 📝

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple logging that just works - zero configuration needed

The Logging module provides **one essential function** that covers 90% of
logging needs with zero learning curve. Production-ready file storage with the
simplest possible API.

## 🚀 Why Choose This?

- **⚡ Zero Learning Curve** - Just `logger()`, start in 5 seconds
- **🔧 Zero Configuration** - Works out of the box with smart defaults
- **🌍 Environment-First** - Auto-detects `VOILA_LOGGING_*` variables
- **📁 Production Features** - File rotation, retention, structured logging
- **🎯 Ultra Simple** - One function, infinite possibilities

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (5 seconds)

### Just import and use:

```javascript
import { logger } from '@voilajsx/appkit/logging';

const log = logger();
log.info('Application started');
log.error('Something went wrong', { error: 'Connection failed' });
log.warn('High memory usage', { usage: '85%' });
log.debug('User query', { sql: query, params });
```

That's it! Logs to console AND files automatically.

## 🌍 Environment Configuration

Optional - configure via environment variables:

```bash
# .env
VOILA_LOGGING_LEVEL=debug
VOILA_LOGGING_DIR=./logs
VOILA_LOGGING_FILE=app.log
VOILA_LOGGING_RETENTION_DAYS=30
```

## 📖 Complete API Reference

### Main Function

#### `logger(levelOrOptions?)`

Creates a logger that just works.

```javascript
// 90% case - zero configuration
const log = logger();

// 8% case - with custom level
const log = logger('debug');

// 2% case - full customization
const log = logger({
  level: 'debug',
  dirname: './custom-logs',
  filename: 'service.log',
  retentionDays: 90,
});
```

### Logging Methods

#### `log.info(message, meta?)`

```javascript
log.info('User logged in', { userId: 123, email: 'user@example.com' });
```

#### `log.error(message, meta?)`

```javascript
log.error('Database connection failed', {
  error: err.message,
  host: 'localhost',
  port: 5432,
});
```

#### `log.warn(message, meta?)`

```javascript
log.warn('API rate limit approaching', { current: 950, limit: 1000 });
```

#### `log.debug(message, meta?)`

```javascript
log.debug('Cache operation', { operation: 'set', key: 'user:123', ttl: 3600 });
```

### Child Loggers

#### `log.child(bindings)`

Creates a logger with additional context.

```javascript
// Request-scoped logging
const reqLog = log.child({ requestId: 'req-123', userId: 'user-456' });
reqLog.info('Processing request');
reqLog.error('Request failed');

// Service-scoped logging
const serviceLog = log.child({ service: 'user-api', version: '2.1.0' });
serviceLog.info('Service started');

// All logs from reqLog and serviceLog will include the context
```

## 🌍 Environment Variables

| Variable                       | Description         | Default                             | Example                          |
| ------------------------------ | ------------------- | ----------------------------------- | -------------------------------- |
| `VOILA_LOGGING_LEVEL`          | Log level           | `info` (prod: `warn`, dev: `debug`) | `debug`, `info`, `warn`, `error` |
| `VOILA_LOGGING_DIR`            | Log directory       | `logs`                              | `./app-logs`, `/var/log/myapp`   |
| `VOILA_LOGGING_FILE`           | Log filename        | `app.log`                           | `service.log`, `api.log`         |
| `VOILA_LOGGING_RETENTION_DAYS` | Days to keep logs   | `7` (prod: `30`)                    | `30`, `90`, `365`                |
| `VOILA_LOGGING_MAX_SIZE`       | Max file size       | `10MB` (prod: `50MB`)               | `52428800` (50MB)                |
| `VOILA_LOGGING_FILE_ENABLED`   | Enable file logging | `true` (test: `false`)              | `false`                          |
| `VOILA_LOGGING_COLORIZE`       | Colorize console    | `true` (prod: `false`)              | `false`                          |
| `VOILA_LOGGING_PRETTY`         | Pretty print JSON   | `false` (dev: `true`)               | `true`                           |
| `VOILA_SERVICE_NAME`           | Service name        | `app`                               | `user-api`, `payment-service`    |

### Smart Defaults by Environment:

**Development:**

- Level: `debug`, Colors: `true`, Pretty: `true`

**Production:**

- Level: `warn`, Colors: `false`, Retention: `30 days`, Size: `50MB`

**Test:**

- Level: `info`, File logging: `disabled`

## 💡 Real-World Examples

### Express Application

```javascript
import express from 'express';
import { logger } from '@voilajsx/appkit/logging';

const log = logger();
const app = express();

// Request logging middleware
app.use((req, res, next) => {
  req.log = log.child({
    requestId: req.headers['x-request-id'] || Math.random().toString(36),
    method: req.method,
    url: req.url,
  });

  req.log.info('Request started');

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    req.log.info('Request completed', {
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

// Route handlers
app.get('/api/users', async (req, res) => {
  try {
    req.log.debug('Fetching users from database');
    const users = await db.getUsers();
    req.log.info('Users fetched successfully', { count: users.length });
    res.json({ users });
  } catch (error) {
    req.log.error('Failed to fetch users', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  log.info('Server started', { port: 3000, env: process.env.NODE_ENV });
});
```

### Microservice with Different Loggers

```javascript
import { logger } from '@voilajsx/appkit/logging';

// Service-level logger
const serviceLog = logger().child({
  service: 'payment-api',
  version: '1.2.0',
});

// Database logger
const dbLog = serviceLog.child({ component: 'database' });

// Payment processor logger
const paymentLog = serviceLog.child({ component: 'payment-processor' });

// Usage
serviceLog.info('Service starting up');

dbLog.info('Connected to database', { host: 'localhost', port: 5432 });
dbLog.warn('Slow query detected', {
  query: 'SELECT * FROM orders',
  duration: '2.3s',
});

paymentLog.info('Processing payment', { orderId: 'ord-123', amount: 99.99 });
paymentLog.error('Payment failed', {
  orderId: 'ord-123',
  error: 'Insufficient funds',
  provider: 'stripe',
});
```

### Background Jobs & Workers

```javascript
import { logger } from '@voilajsx/appkit/logging';

const log = logger().child({ component: 'job-worker' });

async function processEmailJob(job) {
  const jobLog = log.child({
    jobId: job.id,
    jobType: 'email',
    userId: job.data.userId,
  });

  jobLog.info('Job started', { emailType: job.data.type });

  try {
    await sendEmail(job.data);
    jobLog.info('Job completed successfully');
  } catch (error) {
    jobLog.error('Job failed', {
      error: error.message,
      retryCount: job.attemptsMade,
    });
    throw error;
  }
}
```

### Database Operations

```javascript
import { logger } from '@voilajsx/appkit/logging';

const dbLog = logger().child({ component: 'database' });

class UserRepository {
  async findById(id) {
    const queryLog = dbLog.child({ operation: 'findById', userId: id });

    queryLog.debug('Executing query', {
      sql: 'SELECT * FROM users WHERE id = ?',
      params: [id],
    });

    const start = Date.now();
    try {
      const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      const duration = Date.now() - start;

      queryLog.info('Query completed', {
        duration: `${duration}ms`,
        found: !!user,
      });
      return user;
    } catch (error) {
      const duration = Date.now() - start;
      queryLog.error('Query failed', {
        duration: `${duration}ms`,
        error: error.message,
      });
      throw error;
    }
  }
}
```

## 🛡️ Production Features

### Automatic File Management

- **Daily Rotation** - New file each day (`app-2024-01-15.log`)
- **Size-based Rotation** - Splits files when they exceed max size
- **Automatic Cleanup** - Deletes old files based on retention policy
- **Directory Creation** - Creates log directories automatically

### Structured Logging

```javascript
// All logs are JSON for easy parsing
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "User logged in",
  "userId": 123,
  "email": "user@example.com",
  "service": "user-api",
  "requestId": "req-abc123"
}
```

### Console Output Formatting

**Development (pretty, colorized):**

```
2024-01-15T10:30:45.123Z ℹ️  INFO User logged in
{
  "userId": 123,
  "email": "user@example.com"
}
```

**Production (structured, no colors):**

```
2024-01-15T10:30:45.123Z [INFO] User logged in {"userId":123,"email":"user@example.com"}
```

## 🔧 Advanced Configuration

```javascript
import { logger } from '@voilajsx/appkit/logging';

// Custom configuration for specific services
const apiLogger = logger({
  level: 'debug',
  dirname: './api-logs',
  filename: 'api-service.log',
  retentionDays: 90,
  maxSize: 100 * 1024 * 1024, // 100MB
  defaultMeta: {
    service: 'api-gateway',
    version: '2.1.0',
    datacenter: 'us-east-1',
  },
});
```

## 📊 Performance

- **Async File Writes** - Non-blocking file operations
- **Memory Efficient** - Streaming approach, no memory leaks
- **Fast Console Output** - Optimized formatting
- **Child Logger Efficiency** - Shared configuration, lightweight instances

## 🚀 Migration from Other Loggers

### From Winston

```javascript
// Before
import winston from 'winston';
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.Console(),
  ],
});

// After
import { logger } from '@voilajsx/appkit/logging';
const log = logger(); // That's it!
```

### From Console.log

```javascript
// Before
console.log('User logged in:', { userId: 123 });
console.error('Error occurred:', error.message);

// After
import { logger } from '@voilajsx/appkit/logging';
const log = logger();
log.info('User logged in', { userId: 123 });
log.error('Error occurred', { error: error.message });
```

### From Pino

```javascript
// Before
import pino from 'pino';
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
  },
});

// After
import { logger } from '@voilajsx/appkit/logging';
const log = logger(); // Smart defaults handle everything
```

## 🏷️ Log Levels

| Level   | When to Use                | Production        | Development     |
| ------- | -------------------------- | ----------------- | --------------- |
| `error` | System errors, exceptions  | ✅ Always shown   | ✅ Always shown |
| `warn`  | Warnings, potential issues | ✅ Always shown   | ✅ Always shown |
| `info`  | Normal operations, events  | ❌ Usually hidden | ✅ Always shown |
| `debug` | Detailed debugging info    | ❌ Never shown    | ✅ Always shown |

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJS](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJS Team</a> — powering modern web development.
</p>
