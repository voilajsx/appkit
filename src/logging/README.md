# @voilajsx/appkit/logging

> **Dead simple logging that actually works** - One function, five transports,
> zero headaches

[![npm version](https://img.shields.io/npm/v/@voilajsx/appkit.svg)](https://www.npmjs.com/package/@voilajsx/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🤔 Why Another Logging Library?

**Because logging shouldn't be rocket science.**

```javascript
// Other libraries: 20+ lines of config hell
const winston = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// This library: 2 lines, production ready
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get();
```

**The result?** Same features, 90% less code, zero configuration.

## ⚡ 30-Second Start (Seriously)

```bash
npm install @voilajsx/appkit
```

```javascript
import { logger } from '@voilajsx/appkit/logging';

const log = logger.get();
log.info('🚀 App started');
log.error('💥 Something broke', { error: 'Database timeout' });

// Component logging (clean separation)
const authLog = logger.get('auth');
authLog.warn('⚠️ Suspicious login', { ip: '192.168.1.1' });
```

**What you get instantly:**

- ✅ Beautiful console output (colors, emojis in dev)
- ✅ JSON file logging with rotation
- ✅ Auto-scales from development to production
- ✅ Database logging (if you have `DATABASE_URL`)
- ✅ External service integration (Datadog, Slack, etc.)

## 🎯 When to Use This

### ✅ Perfect For

- **Web applications** (Express, Fastify, Next.js)
- **APIs and microservices**
- **Background workers and jobs**
- **Scripts that need proper logging**
- **Teams that want consistency without meetings**

### ❌ Don't Use When

- You need browser logging (this is Node.js only)
- You're building a library (don't force logging on users)
- You have very specific custom transport needs
- Your app already has a logging solution you're happy with

### 🤷 The Sweet Spot

**Instead of this complexity:**

```javascript
// Winston: ~30 lines to set up properly
// Pino: ~15 lines + transport configuration
// Bunyan: ~20 lines + stream setup
// Custom: ~50+ lines + maintenance headaches
```

**You get this simplicity:**

```javascript
// 2 lines, production ready
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get();
```

## 🏗️ How It Works (The Magic)

### Auto-Transport Detection

The logger **automatically detects** what you need:

| You Have              | We Enable         | You Get                       |
| --------------------- | ----------------- | ----------------------------- |
| Nothing               | Console + File    | Development logging           |
| `DATABASE_URL`        | + Database        | Centralized logs              |
| `DATADOG_API_KEY` env | + HTTP to Datadog | Professional monitoring       |
| `SLACK_WEBHOOK` env   | + Slack alerts    | Real-time error notifications |

**Translation:** Set environment variables, get enterprise features. No code
changes.

### Smart Environment Behavior

```javascript
// Same code everywhere
log.info('User logged in', { userId: 123 });

// Development: Pretty colors and details
// Production: Clean JSON to files + database
// Test: Minimal output, no files
```

## 📚 Complete API (It's tiny)

### Main Function

```javascript
import { logger } from '@voilajsx/appkit/logging';

// Global logger
const log = logger.get();

// Component logger (recommended)
const dbLog = logger.get('database');
const authLog = logger.get('auth');
```

### Logging Methods

```javascript
log.info('Normal stuff', { key: 'value' }); // Blue in dev, hidden in prod
log.warn('Heads up', { metric: 'high' }); // Yellow, always visible
log.error('Oh no', { error: err.message }); // Red, always visible, alerts
log.debug('Nerdy details', { sql: 'SELECT' }); // Gray in dev, hidden in prod

// Context logging (game changer)
const reqLog = log.child({ requestId: 'req-123' });
reqLog.info('Request started'); // Automatically includes requestId
```

### Testing Helper

```javascript
// Clear state between tests (important!)
afterEach(async () => {
  await logger.clear();
});
```

## 🌍 Environment Setup (Optional)

**Basic (has smart defaults):**

```bash
# That's it! Everything else is automatic
VOILA_LOGGING_LEVEL=debug
```

**Advanced (when you're ready):**

```bash
# File location
VOILA_LOGGING_DIR=./logs

# Database logging (auto-detected)
DATABASE_URL=postgres://localhost/myapp

# External services (auto-enabled when URL provided)
VOILA_LOGGING_HTTP_URL=https://logs.datadog.com/api/v1/logs
VOILA_LOGGING_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

## 💡 Real Examples

### Express API

```javascript
import express from 'express';
import { logger } from '@voilajsx/appkit/logging';

const app = express();
const log = logger.get();

// Request logging (one middleware, all requests logged)
app.use((req, res, next) => {
  req.log = logger.get('api').child({
    requestId: req.headers['x-request-id'] || Math.random().toString(36),
    method: req.method,
    url: req.url,
  });
  req.log.info('Request started');
  next();
});

// Route with automatic context
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    req.log.debug('Fetching user', { userId: id });
    const user = await db.getUser(id);

    req.log.info('User fetched successfully');
    res.json({ user });
  } catch (error) {
    req.log.error('User fetch failed', {
      userId: id,
      error: error.message,
    });
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => {
  log.info('🚀 Server ready', { port: 3000, env: process.env.NODE_ENV });
});
```

### Background Job Worker

```javascript
import { logger } from '@voilajsx/appkit/logging';

const workerLog = logger.get('worker');

async function processEmailJob(job) {
  const jobLog = workerLog.child({
    jobId: job.id,
    userId: job.data.userId,
    emailType: job.data.type,
  });

  jobLog.info('📧 Job started');

  try {
    await sendEmail(job.data);
    jobLog.info('✅ Email sent successfully');
  } catch (error) {
    jobLog.error('💥 Email failed', {
      error: error.message,
      retryCount: job.attemptsMade,
    });
    throw error; // Re-queue for retry
  }
}
```

---

## 📋 Advanced Reference

_This section is for when you need more control or are integrating with external
systems._

## 🔧 File Headers & Standards

When writing code that uses this logger, include proper documentation:

```javascript
/**
 * Your module description here
 * @module your-app-name/your-module-name  // ← Use YOUR app name
 * @file src/services/payment.js           // ← Use YOUR file path
 */

import { logger } from '@voilajsx/appkit/logging';

/**
 * Process a payment transaction
 * @param {string} orderId - Order identifier
 * @param {number} amount - Payment amount
 * @returns {Promise<object>} Payment result
 */
async function processPayment(orderId, amount) {
  // Your code here
}
```

## ✅ Do's and ❌ Don'ts

### ✅ Best Practices

```javascript
// ✅ Use structured logging (not string concatenation)
log.info('User login successful', { userId: 123, method: 'email' });

// ✅ Use component loggers for separation
const authLog = logger.get('auth');
const dbLog = logger.get('database');

// ✅ Use child loggers for context
const reqLog = log.child({ requestId: 'req-123', userId: 456 });

// ✅ Log errors with context
log.error('Payment failed', {
  orderId: '123',
  error: error.message,
  amount: 99.99,
});

// ✅ Use appropriate levels
log.error('System down'); // For ops alerts
log.warn('Rate limit hit'); // For monitoring
log.info('User registered'); // For business events
log.debug('Cache miss'); // For debugging
```

### ❌ Anti-Patterns

```javascript
// ❌ Don't use console.log
console.log('Something happened');

// ❌ Don't log sensitive data
log.info('User login', { password: user.password }); // NEVER!

// ❌ Don't use string concatenation
log.info('User ' + userId + ' did ' + action);

// ❌ Don't skip context
log.error('Failed'); // Failed what? Where? Why?

// ❌ Don't forget test cleanup
// Always: await logger.clear() in test teardown
```

## 🔒 Security Guidelines

```javascript
// ✅ Safe: Log business identifiers
log.info('Payment processed', {
  orderId: payment.orderId,
  amount: payment.amount,
  cardLast4: payment.card.slice(-4), // Only last 4 digits
  userId: payment.userId,
});

// ❌ Unsafe: Never log these
log.info('Payment details', {
  cardNumber: payment.cardNumber, // Full card numbers
  cvv: payment.cvv, // Security codes
  password: user.password, // Passwords
  apiKey: process.env.API_KEY, // API keys
  token: user.authToken, // Auth tokens
});
```

## 🧪 Testing Patterns

```javascript
import { logger } from '@voilajsx/appkit/logging';

describe('Payment Service', () => {
  afterEach(async () => {
    // IMPORTANT: Clear logger state between tests
    await logger.clear();
  });

  test('should process payment successfully', async () => {
    const log = logger.get('test');
    log.info('🧪 Test started');

    const result = await processPayment('order-123', 99.99);

    expect(result.success).toBe(true);
    log.info('✅ Test passed');
  });
});
```

## 🔗 External Integrations

### Datadog

```bash
VOILA_LOGGING_HTTP_URL=https://http-intake.logs.datadoghq.com/v1/input/YOUR_API_KEY
```

### Slack Alerts (Errors Only)

```bash
VOILA_LOGGING_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Elasticsearch

```bash
VOILA_LOGGING_HTTP_URL=https://your-cluster.elastic.co:9200/logs/_bulk
```

## 📊 Output Examples

### Development Console

```
2024-01-15T10:30:45.123Z ℹ️  INFO User login {"userId":123,"component":"auth"}
2024-01-15T10:30:46.456Z ❌ ERROR Payment failed {"orderId":"123","error":"Card declined"}
```

### Production File (JSON)

```json
{"timestamp":"2024-01-15T10:30:45.123Z","level":"info","message":"User login","userId":123,"component":"auth","service":"my-app"}
{"timestamp":"2024-01-15T10:30:46.456Z","level":"error","message":"Payment failed","orderId":"123","error":"Card declined","component":"payment"}
```

### Slack Alert

```
🚨 ERROR Alert
Payment failed
Service: my-app | Component: payment
Order: 123 | Error: Card declined
```

## 🚀 Migration Guide

### From console.log

```javascript
// Before
console.log('User action:', userId, action);
console.error('Error:', error);

// After
const log = logger.get();
log.info('User action', { userId, action });
log.error('Operation failed', { error: error.message });
```

### From Winston/Pino

```javascript
// Before: Complex setup
const winston = require('winston');
const logger = winston.createLogger({
  // 30+ lines of configuration...
});

// After: Zero setup
import { logger } from '@voilajsx/appkit/logging';
const log = logger.get();
```

## 🎯 LLM Code Generation Rules

When generating code with this logging system:

1. **Always use**: `import { logger } from '@voilajsx/appkit/logging';`
2. **Get logger objects**: `const log = logger.get('component-name');`
3. **Use structured logging**: `log.info('message', { key: 'value' });`
4. **Include file headers** with user's module name (not @voilajsx)
5. **Add context with child loggers**: `log.child({ requestId })`
6. **Never log sensitive data**: passwords, tokens, full card numbers
7. **Include test cleanup**: `await logger.clear()` in test teardown

---

**Built with ❤️ by [VoilaJSX Team](https://github.com/voilajsx) — Because
logging should be simple, not a PhD thesis.**
