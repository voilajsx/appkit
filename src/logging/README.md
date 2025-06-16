# @voilajsx/appkit - Logging Module 📝

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-simple object-driven logging with 5 production-ready transports

The Logging module provides **one function** that returns a logger object with
all methods. Zero configuration needed, production-ready by default, with
automatic transport detection.

## 🚀 Why Choose This?

- **⚡ One Function** - Just `logger.get()`, everything else is automatic
- **🔧 Zero Configuration** - Smart defaults for everything
- **🌍 Environment-First** - Auto-detects transports from environment
- **📊 5 Transports** - Console, File, Database, HTTP, Webhook
- **🎯 Object-Driven** - Clean API, perfect for AI code generation

## 📦 Installation

```bash
npm install @voilajsx/appkit
```

## 🏃‍♂️ Quick Start (10 seconds)

```javascript
// One import, one function call
import { logger } from '@voilajsx/appkit/logging';

const log = logger.get();
log.info('Application started');
log.error('Something went wrong', { error: 'Connection failed' });

// Component-scoped logging
const authLog = logger.get('auth');
authLog.info('User login attempt');
```

**That's it!** Automatically logs to console + file, with database/HTTP/webhook
when configured.

## 📖 Complete API Reference

### Main Function

#### `logger.get(component?)`

Returns a logger object with all logging methods.

```javascript
// Global logger
const log = logger.get();

// Component-scoped logger
const authLog = logger.get('auth');
const dbLog = logger.get('database');
```

### Logging Methods

All logger objects have these methods:

```javascript
log.info(message, meta); // Info level
log.error(message, meta); // Error level
log.warn(message, meta); // Warning level
log.debug(message, meta); // Debug level
log.child(bindings); // Create child logger
log.flush(); // Flush pending logs
log.close(); // Close logger
```

### Utility Function

#### `logger.clear()`

Clears global logger state for testing.

```javascript
// In test files
afterEach(async () => {
  await logger.clear();
});
```

## 🚀 Transport System

### Automatic Transport Detection

The logger automatically enables transports based on your environment:

| Transport    | Auto-Enabled When               | Purpose                 |
| ------------ | ------------------------------- | ----------------------- |
| **Console**  | Always (except test)            | Development debugging   |
| **File**     | Always (except test)            | Local log files         |
| **Database** | `DATABASE_URL` exists           | Distributed correlation |
| **HTTP**     | `VOILA_LOGGING_HTTP_URL` set    | External services       |
| **Webhook**  | `VOILA_LOGGING_WEBHOOK_URL` set | Real-time alerts        |

### Environment Configuration

```bash
# Core settings
VOILA_LOGGING_LEVEL=debug
VOILA_LOGGING_DIR=./logs

# Database transport (auto-detected)
DATABASE_URL=postgres://localhost/myapp

# HTTP transport (Datadog, Elasticsearch, etc.)
VOILA_LOGGING_HTTP_URL=https://http-intake.logs.datadoghq.com/v1/input/API_KEY

# Webhook transport (Slack, Discord, Teams)
VOILA_LOGGING_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 💡 Real-World Examples

### Express Application

```javascript
import express from 'express';
import { logger } from '@voilajsx/appkit/logging';

const log = logger.get();
const app = express();

// Request logging middleware
app.use((req, res, next) => {
  req.log = logger.get('request').child({
    requestId: req.headers['x-request-id'] || Math.random().toString(36),
    method: req.method,
    url: req.url,
  });

  req.log.info('Request started');
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

### Microservice with Component Loggers

```javascript
import { logger } from '@voilajsx/appkit/logging';

// Different loggers for different components
const serviceLog = logger.get('payment-service');
const dbLog = logger.get('database');
const paymentLog = logger.get('payment-processor');

async function processPayment(orderId, amount) {
  const reqLog = paymentLog.child({ orderId });

  reqLog.info('Payment processing started', { amount });

  try {
    dbLog.debug('Checking order exists', { orderId });
    const order = await db.findOrder(orderId);

    if (!order) {
      reqLog.warn('Order not found', { orderId });
      throw new Error('Order not found');
    }

    reqLog.info('Processing with payment gateway');
    const result = await stripe.charge({ amount, orderId });

    dbLog.info('Updating order status', { orderId, status: 'paid' });
    await db.updateOrder(orderId, { status: 'paid' });

    reqLog.info('Payment completed successfully', {
      transactionId: result.id,
      amount,
    });

    return result;
  } catch (error) {
    reqLog.error('Payment failed', {
      error: error.message,
      amount,
      orderId,
    });
    throw error;
  }
}
```

### Background Job Processing

```javascript
import { logger } from '@voilajsx/appkit/logging';

const workerLog = logger.get('job-worker');

async function processEmailJob(job) {
  const jobLog = workerLog.child({
    jobId: job.id,
    jobType: 'email',
    userId: job.data.userId,
  });

  jobLog.info('Job started', { emailType: job.data.type });

  try {
    jobLog.debug('Rendering email template', { template: job.data.template });
    const html = await renderTemplate(job.data);

    jobLog.debug('Sending email', { to: job.data.email });
    await sendEmail({
      to: job.data.email,
      subject: job.data.subject,
      html,
    });

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

## 🔧 Transport Details

### Console Transport

- **Development**: Pretty, colored output with emojis
- **Production**: Structured, plain text output
- **Features**: Automatic color detection, emoji support

### File Transport

- **Daily rotation**: New file each day (`app-2024-01-15.log`)
- **Size rotation**: Splits files when they get too large
- **Auto cleanup**: Deletes old files based on retention policy
- **JSON format**: All file logs are structured JSON

### Database Transport

- **Multi-database**: PostgreSQL, MySQL, SQLite support
- **Auto-detection**: Uses `DATABASE_URL` automatically
- **Batch processing**: Groups logs for performance
- **Auto-retry**: Handles connection failures gracefully
- **Schema management**: Creates tables and indexes automatically

### HTTP Transport

- **Service optimization**: Datadog, Elasticsearch, Splunk formats
- **Batch processing**: Groups logs for efficiency
- **Retry logic**: Exponential backoff on failures
- **Flexible headers**: Supports authentication headers

### Webhook Transport

- **Real-time alerts**: Immediate sending, no batching
- **Service formatting**: Slack, Discord, Teams formats
- **Rate limiting**: Prevents webhook spam
- **Level filtering**: Only sends important alerts (errors by default)

## 🌍 Environment Variables

| Variable                    | Description         | Default                             | Example                                |
| --------------------------- | ------------------- | ----------------------------------- | -------------------------------------- |
| `VOILA_LOGGING_LEVEL`       | Minimum log level   | `info` (prod: `warn`, dev: `debug`) | `debug`, `info`, `warn`, `error`       |
| `VOILA_LOGGING_DIR`         | Log file directory  | `logs`                              | `./app-logs`, `/var/log/myapp`         |
| `DATABASE_URL`              | Database connection | None                                | `postgres://localhost/myapp`           |
| `VOILA_LOGGING_HTTP_URL`    | HTTP endpoint       | None                                | `https://logs.datadog.com/api/v1/logs` |
| `VOILA_LOGGING_WEBHOOK_URL` | Webhook endpoint    | None                                | `https://hooks.slack.com/services/xxx` |

### Smart Defaults by Environment

**Development:**

- Level: `debug`, Colors: `true`, Pretty: `true`
- Transports: Console + File

**Production:**

- Level: `warn`, Colors: `false`, Retention: `30 days`
- Transports: Console + File + Database (if `DATABASE_URL`)

**Test:**

- Level: `info`, File logging: `disabled`
- Transports: Console only

## 📊 Log Output Examples

### Console Output

**Development:**

```
2024-01-15T10:30:45.123Z ℹ️  INFO User login
{
  "userId": 123,
  "email": "user@example.com",
  "component": "auth"
}
```

**Production:**

```
2024-01-15T10:30:45.123Z [INFO] User login {"userId":123,"email":"user@example.com","component":"auth"}
```

### File Output (JSON)

```json
{"timestamp":"2024-01-15T10:30:45.123Z","level":"info","message":"User login","userId":123,"component":"auth","service":"app"}
{"timestamp":"2024-01-15T10:30:46.456Z","level":"error","message":"Database error","error":"Connection failed","component":"database"}
```

### Database Schema

```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  level VARCHAR(10) NOT NULL,
  message TEXT,
  meta JSONB,
  service VARCHAR(100),
  component VARCHAR(100),
  request_id VARCHAR(100)
);
```

### Webhook Alerts (Slack)

```json
{
  "text": "🚨 *ERROR* Alert",
  "attachments": [
    {
      "color": "danger",
      "fields": [
        {
          "title": "Message",
          "value": "Database connection failed"
        },
        {
          "title": "Service",
          "value": "user-api"
        }
      ]
    }
  ]
}
```

## 🏷️ Log Levels

| Level   | When to Use                | Production | Development |
| ------- | -------------------------- | ---------- | ----------- |
| `error` | System errors, exceptions  | ✅ Always  | ✅ Always   |
| `warn`  | Warnings, potential issues | ✅ Always  | ✅ Always   |
| `info`  | Normal operations, events  | ❌ Hidden  | ✅ Always   |
| `debug` | Detailed debugging info    | ❌ Hidden  | ✅ Always   |

## 🔧 Advanced Usage

### Runtime Logger Management

```javascript
import { logger } from '@voilajsx/appkit/logging';

const log = logger.get();

// Check active transports
console.log(log.getActiveTransports()); // ['console', 'file', 'database']

// Runtime level changes
log.setLevel('debug');
console.log(log.isLevelEnabled('debug')); // true

// Custom transport
log.addTransport('custom', customTransport);
await log.removeTransport('webhook');
```

### Child Logger Patterns

```javascript
// Request correlation
const reqLog = log.child({ requestId: 'req-123' });

// User context
const userLog = log.child({ userId: 456 });

// Combined context
const contextLog = log.child({
  requestId: 'req-123',
  userId: 456,
  operation: 'payment',
});

// All logs include full context automatically
contextLog.info('Processing payment');
// → { requestId: 'req-123', userId: 456, operation: 'payment', message: 'Processing payment' }
```

### Service Integrations

#### Datadog

```bash
VOILA_LOGGING_HTTP_URL=https://http-intake.logs.datadoghq.com/v1/input/YOUR_API_KEY
```

#### Elasticsearch

```bash
VOILA_LOGGING_HTTP_URL=https://your-cluster.elastic.co:9200/logs/_bulk
VOILA_LOGGING_HTTP_HEADERS='{"Authorization":"Basic credentials"}'
```

#### Slack Alerts

```bash
VOILA_LOGGING_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
VOILA_LOGGING_WEBHOOK_LEVEL=error  # Only send errors
```

## 🧪 Testing

```javascript
import { logger } from '@voilajsx/appkit/logging';

describe('My Service', () => {
  afterEach(async () => {
    // Clear logger state between tests
    await logger.clear();
  });

  test('should log user actions', () => {
    const log = logger.get('test');
    log.info('Test started');

    // Test your service
  });
});
```

## 🚀 Migration Guide

### From Console.log

```javascript
// Before
console.log('User logged in:', { userId: 123 });
console.error('Error occurred:', error.message);

// After
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get();
log.info('User logged in', { userId: 123 });
log.error('Error occurred', { error: error.message });
```

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
const log = logger.get(); // That's it! Smart defaults handle everything
```

### From Pino

```javascript
// Before
import pino from 'pino';
const logger = pino({
  level: 'info',
  transport: { target: 'pino-pretty' },
});

// After
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get(); // Auto-detects environment and configures appropriately
```

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajsx/appkit/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [VoilaJSX](https://github.com/voilajsx)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
