# @voilajsx/appkit/logging - LLM API Reference

**Implementation**: JavaScript ES6 modules with ultra-minimal API design.

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
- **Load with dotenv.config()** at top of files
- **Never hardcode configuration** in code examples

## Complete API Reference

### Main Function

#### `logger(levelOrOptions?)`

Creates a logger that just works.

```javascript
// Uses VOILA_LOGGING_LEVEL from .env
const log = logger();

// With explicit level
const log = logger('debug');

// With full options
const log = logger({ level: 'debug', dirname: './logs' });
```

### Logging Methods

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

### Child Logger

#### `log.child(bindings)`

Creates logger with additional context.

```javascript
// Request-scoped logger
const reqLog = log.child({ requestId: 'req-123', userId: 'user-456' });
reqLog.info('Processing request');
```

## Environment Variables

**Required .env file structure:**

```bash
# Core Configuration
VOILA_LOGGING_LEVEL=debug
VOILA_LOGGING_DIR=logs
VOILA_LOGGING_FILE=app.log

# Advanced Configuration
VOILA_LOGGING_RETENTION_DAYS=30
VOILA_LOGGING_MAX_SIZE=52428800
```

**Complete .env example:**

```bash
# Development
NODE_ENV=development
VOILA_LOGGING_LEVEL=debug
VOILA_LOGGING_PRETTY=true
VOILA_SERVICE_NAME=user-api

# Production
NODE_ENV=production
VOILA_LOGGING_LEVEL=warn
VOILA_LOGGING_DIR=/var/log/myapp
VOILA_LOGGING_RETENTION_DAYS=30
```

## Standard Code Patterns

### 1. Basic Application Logging

```javascript
/**
 * Basic application with logging setup
 * @module @voilajsx/appkit/logging
 * @file examples/basic-app.js
 */

import dotenv from 'dotenv';
import { logger } from '@voilajsx/appkit/logging';

dotenv.config();

const log = logger();

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

### 2. Express Application

```javascript
/**
 * Express application with request logging
 * @module @voilajsx/appkit/logging
 * @file examples/express-app.js
 */

import dotenv from 'dotenv';
import express from 'express';
import { logger } from '@voilajsx/appkit/logging';

dotenv.config();

const log = logger();
const app = express();

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  req.log = log.child({
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

### 3. Service with Different Components

```javascript
/**
 * Microservice with component-based logging
 * @module @voilajsx/appkit/logging
 * @file examples/microservice.js
 */

import dotenv from 'dotenv';
import { logger } from '@voilajsx/appkit/logging';

dotenv.config();

const serviceLog = logger().child({ service: 'payment-api' });
const dbLog = serviceLog.child({ component: 'database' });
const paymentLog = serviceLog.child({ component: 'payment' });

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
 * Background job worker with structured logging
 * @module @voilajsx/appkit/logging
 * @file examples/job-worker.js
 */

import dotenv from 'dotenv';
import { logger } from '@voilajsx/appkit/logging';

dotenv.config();

const log = logger().child({ component: 'job-worker' });

async function processEmailJob(job) {
  const jobLog = log.child({
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
  log.info('Worker started');

  while (true) {
    try {
      const job = await queue.getNextJob();
      if (job) {
        await processEmailJob(job);
      } else {
        await sleep(1000);
      }
    } catch (error) {
      log.error('Worker error', { error: error.message });
      await sleep(5000);
    }
  }
}
```

## LLM Instructions

**When generating code:**

1. **Always start with** `import dotenv from 'dotenv';` and `dotenv.config();`
2. **Always include** `.env` file example with `VOILA_LOGGING_*` variables
3. **Use simple patterns** - avoid complex configurations
4. **Include file headers** with @module and @file tags
5. **Use try/catch blocks** for error handling
6. **Keep database operations generic** using `db.methodName()`
7. **Focus on the main function**: `logger()` and logging methods
8. **Use child loggers** for context (requests, components, jobs)

**Default .env template for all examples:**

```bash
# Required
NODE_ENV=development
VOILA_LOGGING_LEVEL=debug
VOILA_LOGGING_DIR=logs
VOILA_LOGGING_FILE=app.log

# Optional
VOILA_LOGGING_RETENTION_DAYS=7
VOILA_SERVICE_NAME=my-app
```

**Standard import pattern:**

```javascript
import dotenv from 'dotenv';
import { logger } from '@voilajsx/appkit/logging';

dotenv.config();

const log = logger();
```

**Child logger pattern:**

```javascript
// Request context
const reqLog = log.child({ requestId: 'req-123' });

// Service context
const serviceLog = log.child({ service: 'user-api' });

// Component context
const dbLog = log.child({ component: 'database' });
```

**Error logging pattern:**

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

## Standard Guidelines for Effective Usage

### 1. Log Level Guidelines

**Use appropriate log levels for production readiness:**

```javascript
// ERROR - System failures, exceptions (always visible in production)
log.error('Database connection failed', {
  error: err.message,
  host: 'localhost',
});
log.error('Payment processing failed', {
  orderId: '123',
  error: 'Gateway timeout',
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

### 2. Context and Metadata Best Practices

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
  req.log = log.child({
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

### 3. Security and Privacy Guidelines

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

### 4. Performance and Timing

**Log performance metrics for monitoring:**

```javascript
async function processOrder(orderId) {
  const start = Date.now();
  const orderLog = log.child({ orderId });

  orderLog.info('Order processing started');

  try {
    const order = await db.getOrder(orderId);
    const duration = Date.now() - start;

    if (duration > 1000) {
      orderLog.warn('Slow order lookup', { duration: `${duration}ms` });
    }

    orderLog.info('Order processed successfully', {
      duration: `${duration}ms`,
      items: order.items.length,
    });

    return order;
  } catch (error) {
    const duration = Date.now() - start;
    orderLog.error('Order processing failed', {
      duration: `${duration}ms`,
      error: error.message,
    });
    throw error;
  }
}
```

### 5. Structured Data Guidelines

**Use consistent field names across your application:**

```javascript
// Standardize field names
const standardFields = {
  userId: user.id, // Always 'userId', not 'user_id' or 'uid'
  requestId: req.id, // Always 'requestId'
  duration: `${ms}ms`, // Always include 'ms' unit
  timestamp: Date.now(), // Always use timestamp for events
  component: 'auth-service', // Always identify the component
};

log.info('User authenticated', standardFields);
```

**Structure error information consistently:**

```javascript
// Standard error logging format
function logError(operation, error, context = {}) {
  log.error(`${operation} failed`, {
    operation,
    error: error.message,
    stack: error.stack,
    code: error.code,
    ...context,
  });
}

// Usage
try {
  await sendEmail(user.email, template);
} catch (error) {
  logError('Email sending', error, {
    userId: user.id,
    template: template.name,
  });
}
```

### 6. Environment-Specific Behavior

**Configure logging based on environment:**

```javascript
// .env.development
NODE_ENV=development
VOILA_LOGGING_LEVEL=debug
VOILA_LOGGING_PRETTY=true
VOILA_SERVICE_NAME=user-api-dev

// .env.production
NODE_ENV=production
VOILA_LOGGING_LEVEL=warn
VOILA_LOGGING_DIR=/var/log/myapp
VOILA_LOGGING_RETENTION_DAYS=30
VOILA_SERVICE_NAME=user-api

// .env.test
NODE_ENV=test
VOILA_LOGGING_LEVEL=error
VOILA_LOGGING_FILE_ENABLED=false  # Disable file logging in tests
```

### 7. Microservices and Distributed Systems

**Use service-specific loggers:**

```javascript
// Each service has its own logger context
const userServiceLog = logger().child({
  service: 'user-service',
  version: '2.1.0',
  instance: process.env.HOSTNAME,
});

const paymentServiceLog = logger().child({
  service: 'payment-service',
  version: '1.8.3',
  instance: process.env.HOSTNAME,
});

// Cross-service request tracking
async function callPaymentService(orderId, correlationId) {
  const reqLog = userServiceLog.child({
    correlationId,
    targetService: 'payment-service',
    operation: 'processPayment',
  });

  reqLog.info('Calling payment service', { orderId });

  try {
    const result = await paymentApi.process(orderId);
    reqLog.info('Payment service call successful', {
      transactionId: result.id,
    });
    return result;
  } catch (error) {
    reqLog.error('Payment service call failed', {
      error: error.message,
      statusCode: error.response?.status,
    });
    throw error;
  }
}
```

### 8. Common Anti-Patterns to Avoid

**Don't do these:**

```javascript
// Bad - String concatenation
log.info('User ' + userId + ' logged in at ' + new Date());

// Good - Structured logging
log.info('User logged in', { userId, timestamp: new Date().toISOString() });

// Bad - Logging in loops without throttling
users.forEach(user => {
  log.debug('Processing user', { userId: user.id }); // Spam!
});

// Good - Summary logging
log.info('Processing users batch', { count: users.length });
users.forEach(user => processUser(user));
log.info('Users batch completed', { processed: users.length });

// Bad - Inconsistent error handling
catch (error) {
  console.log('Error:', error); // Bypasses logging system
}

// Good - Use the logging system
catch (error) {
  log.error('Operation failed', { error: error.message });
}
```

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
