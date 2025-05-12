# @voilajs/appkit - Logging Module 📝

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Structured logging with file storage and retention for Node.js applications

The logging module provides a simple yet powerful logging system with automatic
file rotation, retention policies, and support for contextual logging through
child loggers.

## 🚀 Features

- **📊 Multiple Log Levels** - Error, warn, info, and debug levels
- **📁 Automatic File Storage** - Logs saved to files with daily rotation
- **🔄 Retention Management** - Automatic cleanup of old log files
- **🔗 Child Loggers** - Add context to logs for requests or operations
- **🎨 Pretty Console Output** - Colored and formatted console logs
- **📦 Zero Configuration** - Works out of the box with sensible defaults

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import { createLogger } from '@voilajs/appkit/logging';

// Create a logger with default settings
const logger = createLogger();

// Log messages at different levels
logger.info('Application started');
logger.error('Database connection failed', { error: err.message });
logger.warn('API rate limit approaching', { current: 950, limit: 1000 });
logger.debug('Cache miss', { key: 'user:123' });

// Create child logger with context
const requestLogger = logger.child({ requestId: 'abc123' });
requestLogger.info('Processing request');
```

## 📋 Examples

The module includes several examples to help you get started with common use
cases:

| Example                                                                                                     | Description                                     | Key Features                           |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| [01-basic-logging.js](https://github.com/voilajs/appkit/blob/main/src/logging/examples/01-basic-logging.js) | Basic usage of logger with different log levels | Basic log levels, metadata             |
| [02-child-logger.js](https://github.com/voilajs/appkit/blob/main/src/logging/examples/02-child-logger.js)   | Creating child loggers with request context     | Context binding, nested loggers        |
| [03-file-config.js](https://github.com/voilajs/appkit/blob/main/src/logging/examples/03-file-config.js)     | Configuring file logging options                | Custom directories, retention policies |
| [04-express-basic.js](https://github.com/voilajs/appkit/blob/main/src/logging/examples/04-express-basic.js) | Integration with Express.js middleware          | Request logging, HTTP context          |

### Example: Basic Logging

```javascript
// From 01-basic-logging.js
import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger();

logger.info('Application started');
logger.warn('Configuration issue detected', { setting: 'timeout', value: 30 });
logger.error('Operation failed', {
  code: 'DB_ERROR',
  message: 'Connection refused',
});
```

### Example: Express Integration

```javascript
// From 04-express-basic.js
import express from 'express';
import { createLogger } from '@voilajs/appkit/logging';

const app = express();
const logger = createLogger();

// Request logging middleware
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(2, 15);
  req.logger = logger.child({ requestId, path: req.path });
  req.logger.info('Request received');

  res.on('finish', () => {
    req.logger.info('Request completed', {
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime,
    });
  });

  next();
});
```

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common logging scenarios using the `@voilajs/appkit/logging` module. We've
created a specialized
[LOGGING_PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs (not humans) to understand the
module's capabilities and generate consistent, high-quality logging code.

### How to Use LLM Code Generation

Simply copy one of the prompts below (which include a link to the
PROMPT_REFERENCE.md) and share it with ChatGPT, Claude, or another capable LLM.
The LLM will read the reference document and use it to generate optimized,
best-practice logging code tailored to your specific requirements.

### Sample Prompts to Try

#### Basic Logging Setup

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then create a complete logging system for an Express app using @voilajs/appkit/logging with the following features:
- Structured logger initialization with custom retention policies
- Request logging middleware with request IDs
- Error handling middleware with detailed error logging
- Performance monitoring for slow requests
```

#### Microservice Logging

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then implement a logging system for a microservice architecture using @voilajs/appkit/logging that includes:
- Consistent request ID propagation across services
- Correlation IDs for tracing requests
- Service-specific context in all logs
- Centralized log configuration
```

#### Advanced Logging Patterns

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then implement advanced logging patterns using @voilajs/appkit/logging with:
- Hierarchical loggers for different application components
- Redaction of sensitive information
- Performance profiling with timing measurements
- Custom formatting for different environments (dev/staging/prod)
- Log aggregation preparation for ELK stack
```

## 📖 Core Functions

### Logger Functions

| Function         | Description                    | Usage                           |
| ---------------- | ------------------------------ | ------------------------------- |
| `createLogger()` | Creates a new logger instance  | Initialize logging for your app |
| `logger.info()`  | Log informational messages     | General application events      |
| `logger.error()` | Log error messages             | Errors and exceptions           |
| `logger.warn()`  | Log warning messages           | Non-critical issues             |
| `logger.debug()` | Log debug messages             | Development troubleshooting     |
| `logger.child()` | Create contextual child logger | Add request/operation context   |

## 🔧 Configuration Options

```javascript
const logger = createLogger({
  level: 'info', // Minimum log level (error/warn/info/debug)
  dirname: 'logs', // Directory for log files
  filename: 'app.log', // Base filename for logs
  retentionDays: 5, // Days to keep log files
  maxSize: 10485760, // Max file size before rotation (10MB)
  enableFileLogging: true, // Enable/disable file logging
});
```

## 💡 Common Use Cases

### Express Request Logging

```javascript
app.use((req, res, next) => {
  req.logger = logger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
  });
  req.logger.info('Request started');
  next();
});
```

### Operation Tracking

```javascript
async function processOrder(orderId) {
  const opLogger = logger.child({ orderId, operation: 'processOrder' });

  opLogger.info('Starting order processing');
  try {
    // Process order...
    opLogger.info('Order processed successfully');
  } catch (error) {
    opLogger.error('Order processing failed', { error: error.message });
    throw error;
  }
}
```

## 🛡️ Security Best Practices

1. **Never log sensitive data** - Passwords, API keys, or personal information
2. **Sanitize user input** - Clean data before including in logs
3. **Use appropriate levels** - Don't log sensitive details at debug level
4. **Secure log files** - Set proper file permissions on log directories
5. **Implement retention policies** - Delete old logs per compliance
   requirements

## 📊 Performance Tips

- Use appropriate log levels to reduce I/O in production
- Configure reasonable file sizes and retention periods
- Use child loggers instead of repeating metadata
- Avoid logging in tight loops
- Batch operations when logging high-frequency events

## 🔍 Error Handling

```javascript
try {
  // Your code here
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: { userId: '123' },
  });
}
```

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajs/appkit/blob/main/src/logging/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/logging/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Integration Guide](https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md) -
  AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
