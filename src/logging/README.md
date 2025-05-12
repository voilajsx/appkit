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
