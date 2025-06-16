# @voilajsx/appkit/logging - LLM API Reference

**Implementation**: JavaScript ES6 modules with object-driven API design.

## LLM Code Generation Guidelines

### File Structure Requirements

1. **File Header** (mandatory):

   ```javascript
   /**
    * Brief description of what the file does
    * @module @voilajsx/appkit/logging
    * @file path/to/filename.js
    */
   ```

2. **Function Documentation** (mandatory):

   ```javascript
   /**
    * One clear sentence describing what the function does
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    */
   ```

3. **Code Style**:
   - ESM imports with single quotes
   - 2-space indentation
   - Semicolons required
   - Minimal comments (only for complex logic)

### Environment Variable Strategy

- **Always use .env files** in examples
- **Show VOILA*LOGGING*\* variables** in all examples
- **Never hardcode configuration** in code examples
- **Auto-detect transports** from environment variables

## Complete API Reference

### Single Export Pattern

#### `logger.get(component?)`

**The only function you need to learn** - returns logger object with all
methods.

```javascript
import { logger } from '@voilajsx/appkit/logging';

// Global logger
const log = logger.get();

// Component-scoped logger
const authLog = logger.get('auth');
const dbLog = logger.get('database');
```

#### `logger.clear()`

Clears global logger state for testing.

```javascript
// In test files only
afterEach(async () => {
  await logger.clear();
});
```

### Logger Object Methods

All logger objects returned by `logger.get()` have these methods:

#### `log.info(message, meta?)`

Logs informational messages.

```javascript
log.info('User login successful', { userId: 123, email: 'user@test.com' });
```

#### `log.error(message, meta?)`

Logs error messages.

```javascript
log.error('Database connection failed', {
  error: err.message,
  host: 'localhost',
});
```

#### `log.warn(message, meta?)`

Logs warning messages.

```javascript
log.warn('API rate limit approaching', { current: 950, limit: 1000 });
```

#### `log.debug(message, meta?)`

Logs debug messages.

```javascript
log.debug('Cache operation', { operation: 'set', key: 'user:123', ttl: 3600 });
```

#### `log.child(bindings)`

Creates child logger with additional context.

```javascript
// Request-scoped logger
const reqLog = log.child({ requestId: 'req-123', userId: 'user-456' });
reqLog.info('Processing request');

// Service-scoped logger
const serviceLog = log.child({ service: 'payment-api', version: '2.1.0' });
serviceLog.info('Service started');
```

#### `log.flush()` and `log.close()`

Lifecycle management methods.

```javascript
// Flush pending logs
await log.flush();

// Close logger and cleanup resources
await log.close();
```

## Environment Variables

**Required .env file structure:**

```bash
# Core Configuration (minimal)
VOILA_LOGGING_LEVEL=debug

# Database transport (auto-detected)
DATABASE_URL=postgres://localhost/myapp

# HTTP transport (external services)
VOILA_LOGGING_HTTP_URL=https://logs.datadog.com/api/v1/logs

# Webhook transport (alerts)
VOILA_LOGGING_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

**Complete .env example:**

```bash
# Development
NODE_ENV=development
VOILA_LOGGING_LEVEL=debug
VOILA_LOGGING_DIR=logs
VOILA_SERVICE_NAME=user-api

# Production
NODE_ENV=production
VOILA_LOGGING_LEVEL=warn
VOILA_LOGGING_DIR=/var/log/myapp
DATABASE_URL=postgres://user:pass@localhost/myapp
VOILA_LOGGING_HTTP_URL=https://logs.datadog.com/api/v1/logs
VOILA_LOGGING_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

## Transport Auto-Detection

**The logger automatically enables transports based on environment:**

- **Console + File**: Always enabled (except test environment)
- **Database**: Enabled if `DATABASE_URL` or `VOILA_LOGGING_DB_URL` exists
- **HTTP**: Enabled if `VOILA_LOGGING_HTTP_URL` exists
- **Webhook**: Enabled if `VOILA_LOGGING_WEBHOOK_URL` exists

## Standard Code Patterns

### 1. Basic Application Logging

```javascript
/**
 * Basic application with object-driven logging setup
 * @module @voilajsx/appkit/logging
 * @file examples/basic-app.js
 */

import { logger } from '@voilajsx/appkit/logging';

const log = logger.get();

async function startApp() {
  log.info('Application starting', { version: '1.0.0' });

  try {
    await connectDatabase();
    log.info('Database connected successfully');

    startServer();
    log.info('Server started', { port: 3000 });
  } catch (error) {
    log.error('Application startup failed', { error: error.message });
    process.exit(1);
  }
}

startApp();
```

### 2. Express Application with Request Logging

```javascript
/**
 * Express application with object-driven request logging
 * @module @voilajsx/appkit/logging
 * @file examples/express-app.js
 */

import express from 'express';
import { logger } from '@voilajsx/appkit/logging';

const log = logger.get();
const app = express();

app.use(express.json());

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
  log.info('Server listening', { port: 3000 });
});
```

### 3. Microservice with Component-Based Logging

```javascript
/**
 * Microservice with component-scoped object loggers
 * @module @voilajsx/appkit/logging
 * @file examples/microservice.js
 */

import { logger } from '@voilajsx/appkit/logging';

// Component-scoped loggers
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

    reqLog.info('Processing with payment gateway', { gateway: 'stripe' });
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

### 4. Background Job Processing

```javascript
/**
 * Background job worker with structured object logging
 * @module @voilajsx/appkit/logging
 * @file examples/job-worker.js
 */

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
    jobLog.debug('Preparing email template', { template: job.data.template });
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

async function workerLoop() {
  workerLog.info('Worker started');

  while (true) {
    try {
      const job = await queue.getNextJob();
      if (job) {
        await processEmailJob(job);
      } else {
        await sleep(1000);
      }
    } catch (error) {
      workerLog.error('Worker error', { error: error.message });
      await sleep(5000);
    }
  }
}
```

### 5. Testing Pattern with Logger Cleanup

```javascript
/**
 * Testing pattern with proper logger cleanup
 * @module @voilajsx/appkit/logging
 * @file examples/test-example.js
 */

import { logger } from '@voilajsx/appkit/logging';

describe('User Service', () => {
  afterEach(async () => {
    // Clear logger state between tests
    await logger.clear();
  });

  test('should create user successfully', async () => {
    const log = logger.get('test');
    log.info('Test started');

    const userData = { email: 'test@example.com', name: 'Test User' };
    const user = await createUser(userData);

    expect(user.id).toBeDefined();
    log.info('Test completed', { userId: user.id });
  });
});
```

## LLM Instructions

**When generating code, always follow these patterns:**

1. **Use object-driven API**: Always `logger.get()` then call methods on
   returned object
2. **Component scoping**: Use `logger.get('component-name')` for different parts
   of application
3. **Include file headers** with @module and @file tags
4. **Use try/catch blocks** for error handling with structured logging
5. **Child loggers for context**: Use `.child({ key: value })` for
   request/operation context
6. **Testing cleanup**: Always include `logger.clear()` in test teardown

**Standard import pattern:**

```javascript
import { logger } from '@voilajsx/appkit/logging';

const log = logger.get(); // Global logger
const componentLog = logger.get('auth'); // Component logger
```

**Standard context pattern:**

```javascript
// Request context
const reqLog = log.child({ requestId: 'req-123' });

// Service context
const serviceLog = logger.get('payment-service');

// Operation context
const operationLog = serviceLog.child({
  orderId: '456',
  operation: 'process-payment',
});
```

**Standard error logging pattern:**

```javascript
try {
  // Operation
  const result = await someOperation();
  log.info('Operation successful', { result });
} catch (error) {
  log.error('Operation failed', { error: error.message });
  throw error;
}
```

## Log Levels and Best Practices

### Log Level Guidelines

**Use appropriate log levels for production readiness:**

```javascript
// ERROR - System failures, exceptions (always visible in production)
log.error('Database connection failed', {
  error: err.message,
  host: 'localhost',
  retryCount: 3,
});

// WARN - Potential issues, degraded performance (visible in production)
log.warn('API rate limit at 80%', { current: 800, limit: 1000 });
log.warn('Slow database query detected', {
  query: 'SELECT users',
  duration: '2.3s',
});

// INFO - Normal operations, business events (hidden in production by default)
log.info('User login successful', { userId: 123, method: 'email' });
log.info('Order created', { orderId: '456', amount: 99.99, userId: 123 });

// DEBUG - Detailed debugging information (development only)
log.debug('Cache operation', { operation: 'set', key: 'user:123', ttl: 3600 });
log.debug('SQL query executed', { sql: 'SELECT * FROM users', params: [123] });
```

### Context and Metadata Best Practices

**Always include relevant context for troubleshooting:**

```javascript
// Good - Includes actionable context
log.error('User registration failed', {
  email: 'user@example.com',
  error: 'Email already exists',
  timestamp: Date.now(),
  userAgent: req.headers['user-agent'],
});

// Bad - Lacks context
log.error('Registration failed');
```

**Use child loggers for request correlation:**

```javascript
// Request middleware - creates correlated logs
app.use((req, res, next) => {
  req.log = logger.get('request').child({
    requestId: req.headers['x-request-id'] || generateId(),
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
  });
  next();
});

// All logs in this request will include the context
req.log.info('Processing user registration');
req.log.error('Validation failed', { field: 'email' });
```

### Security and Privacy Guidelines

**Never log sensitive information:**

```javascript
// Good - Logs safe information
log.info('User login attempt', {
  userId: user.id,
  email: user.email,
  success: true,
});

// Bad - Logs sensitive data
log.info('User login', {
  password: user.password, // Never log passwords
  token: user.apiToken, // Never log tokens
});

// Good - Redact sensitive fields
log.info('Payment processed', {
  orderId: payment.orderId,
  amount: payment.amount,
  cardLast4: payment.card.slice(-4), // Only last 4 digits
  // cardNumber: payment.card         // Never log full card
});
```

## Common Anti-Patterns to Avoid

**Don't do these:**

```javascript
// ❌ Wrong - Function imports (old pattern)
import { logInfo, logError } from '@voilajsx/appkit/logging';

// ✅ Correct - Object-driven pattern
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get();

// ❌ Wrong - String concatenation
log.info('User ' + userId + ' logged in at ' + new Date());

// ✅ Correct - Structured logging
log.info('User logged in', { userId, timestamp: new Date().toISOString() });

// ❌ Wrong - No context
log.error('Operation failed');

// ✅ Correct - Rich context
log.error('Payment processing failed', {
  orderId: '123',
  error: error.message,
  amount: 99.99,
  gateway: 'stripe'
});

// ❌ Wrong - Bypassing logging system
catch (error) {
  console.log('Error:', error);
}

// ✅ Correct - Use the logging system
catch (error) {
  log.error('Operation failed', { error: error.message });
}
```

## Quick Reference

```javascript
// Single import pattern
import { logger } from '@voilajsx/appkit/logging';

// Get logger objects
const log = logger.get(); // Global logger
const authLog = logger.get('auth'); // Component logger
const reqLog = log.child({ requestId }); // Context logger

// Log messages
log.info('Message', { key: 'value' });
log.error('Error', { error: error.message });
log.warn('Warning', { metric: 'high' });
log.debug('Debug info', { operation: 'cache-set' });

// Testing cleanup
await logger.clear();
```

**Remember: One import, one function (`logger.get()`), infinite logging
possibilities with 5 automatic transports!**

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
