# @voilajsx/appkit/logging LLM API Reference

> **Note**: Implementation is in JavaScript. TypeScript signatures are for
> clarity only.

## LLM Code Generation Guidelines

1. **Adhere to Code Style**:

   - ESM imports, single quotes, 2-space indentation, semicolons
   - Always include JSDoc comments for functions

2. **JSDoc Format** (Required for all functions):

   ```javascript
   /**
    * Function description
    * @param {Type} paramName - Parameter description
    * @returns {ReturnType} Return value description
    * @throws {Error} Error conditions
    */
   ```

3. **Error Handling**:

   - Use try/catch blocks for async functions
   - Check parameters before using them
   - Return standardized error objects

4. **Framework Agnostic**:
   - Implementation should work with any framework
   - Middleware patterns should be adaptable

## Function Signatures

### createLogger

```typescript
function createLogger(options?: {
  level?: 'error' | 'warn' | 'info' | 'debug';
  defaultMeta?: Record<string, any>;
  transports?: Transport[];
  enableFileLogging?: boolean;
  dirname?: string;
  filename?: string;
  retentionDays?: number;
  maxSize?: number;
}): Logger;
```

- Default `level`: `'info'`
- Default `enableFileLogging`: `true`
- Default `dirname`: `'logs'`
- Default `filename`: `'app.log'`
- Default `retentionDays`: `5`
- Default `maxSize`: `10485760` (10MB)

### Logger Methods

```typescript
interface Logger {
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
  child(bindings: Record<string, any>): Logger;
  flush(): Promise<void>;
  close(): Promise<void>;
}
```

### Transport Classes

```typescript
class ConsoleTransport {
  constructor(options?: {
    level?: 'error' | 'warn' | 'info' | 'debug';
    colorize?: boolean;
    prettyPrint?: boolean;
  });
}

class FileTransport {
  constructor(options?: {
    level?: 'error' | 'warn' | 'info' | 'debug';
    dirname?: string;
    filename?: string;
    retentionDays?: number;
    maxSize?: number;
    datePattern?: string;
  });
}
```

- ConsoleTransport defaults: `colorize: true`, `prettyPrint: false`
- FileTransport defaults: Same as createLogger defaults

## Example Implementations

### Basic Logger Setup

```javascript
/**
 * Creates a logger with default configuration
 * @returns {Object} Logger instance
 */
function setupLogger() {
  const logger = createLogger({
    level: 'info',
    defaultMeta: {
      service: 'api',
      environment: process.env.NODE_ENV,
    },
    dirname: 'logs',
    retentionDays: 7,
  });

  return logger;
}

/**
 * Logs a message with metadata
 * @param {Object} logger - Logger instance
 * @param {string} message - Log message
 * @param {Object} metadata - Additional context
 */
function logMessage(logger, message, metadata = {}) {
  logger.info(message, {
    ...metadata,
    timestamp: new Date().toISOString(),
  });
}
```

### Request Logging Middleware

```javascript
/**
 * Creates Express middleware for request logging
 * @param {Object} logger - Logger instance
 * @returns {Function} Express middleware
 */
function createRequestLogger(logger) {
  return (req, res, next) => {
    const startTime = Date.now();

    // Create request-specific logger
    req.logger = logger.child({
      requestId: req.id || generateId(),
      method: req.method,
      path: req.path,
      ip: req.ip,
    });

    // Log request start
    req.logger.info('Request started');

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      req.logger.info('Request completed', {
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length'),
      });
    });

    next();
  };
}
```

### Error Logging

```javascript
/**
 * Logs an error with context
 * @param {Object} logger - Logger instance
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function logError(logger, error, context = {}) {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    code: error.code,
    ...context,
  });
}

/**
 * Express error handling middleware
 * @param {Object} logger - Logger instance
 * @returns {Function} Express error middleware
 */
function createErrorLogger(logger) {
  return (err, req, res, next) => {
    req.logger = req.logger || logger;

    req.logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      code: err.code,
      method: req.method,
      path: req.path,
    });

    next(err);
  };
}
```

### Child Loggers for Context

```javascript
/**
 * Creates a logger for a specific operation
 * @param {Object} baseLogger - Base logger instance
 * @param {string} operation - Operation name
 * @param {Object} context - Operation context
 * @returns {Object} Child logger
 */
function createOperationLogger(baseLogger, operation, context = {}) {
  return baseLogger.child({
    operation,
    operationId: generateId(),
    ...context,
  });
}

/**
 * Example using child logger
 * @param {Object} logger - Logger instance
 * @param {string} userId - User ID
 * @param {Object} data - User data to update
 * @returns {Promise<Object>} Updated user
 */
async function updateUser(logger, userId, data) {
  const opLogger = createOperationLogger(logger, 'updateUser', {
    userId,
  });

  opLogger.info('Starting user update');

  try {
    const user = await db.users.update(userId, data);

    opLogger.info('User updated successfully', {
      changes: Object.keys(data),
    });

    return user;
  } catch (error) {
    opLogger.error('User update failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
```

### Production Logger Configuration

```javascript
/**
 * Creates production-ready logger configuration
 * @param {Object} options - Configuration options
 * @returns {Object} Logger instance
 */
function createProductionLogger(options = {}) {
  const {
    service = 'api',
    logDir = '/var/log/app',
    errorLogDir = '/var/log/app/errors',
  } = options;

  const transports = [
    // Console transport (for container logs)
    new ConsoleTransport({
      colorize: false,
      prettyPrint: false,
    }),

    // General application logs
    new FileTransport({
      dirname: logDir,
      filename: 'app.log',
      retentionDays: 30,
      maxSize: 50 * 1024 * 1024, // 50MB
    }),

    // Error logs with longer retention
    new FileTransport({
      dirname: errorLogDir,
      filename: 'error.log',
      retentionDays: 90,
      level: 'error',
    }),
  ];

  return createLogger({
    level: 'info',
    defaultMeta: {
      service,
      environment: 'production',
      version: process.env.APP_VERSION,
    },
    transports,
  });
}
```

### Log Rotation and Retention

```javascript
/**
 * Creates logger with custom rotation settings
 * @param {Object} options - Logger options
 * @returns {Object} Logger instance
 */
function createRotatingLogger(options = {}) {
  const {
    level = 'info',
    dirname = 'logs',
    retentionDays = 14,
    maxSize = 10 * 1024 * 1024, // 10MB
  } = options;

  return createLogger({
    level,
    dirname,
    filename: 'app.log',
    retentionDays,
    maxSize,
    enableFileLogging: true,
  });
}

/**
 * Monitor log directory size
 * @param {Object} logger - Logger instance
 * @param {string} dirname - Log directory
 * @returns {Promise<Object>} Directory statistics
 */
async function monitorLogDirectory(logger, dirname = 'logs') {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const files = await fs.readdir(dirname);
    let totalSize = 0;

    for (const file of files) {
      const stats = await fs.stat(path.join(dirname, file));
      totalSize += stats.size;
    }

    const stats = {
      directory: dirname,
      fileCount: files.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    };

    logger.info('Log directory statistics', stats);

    // Alert if logs are getting too large
    if (totalSize > 1024 * 1024 * 1024) {
      // 1GB
      logger.warn('Log directory size exceeds 1GB', stats);
    }

    return stats;
  } catch (error) {
    logger.error('Failed to monitor log directory', {
      error: error.message,
      directory: dirname,
    });
    throw error;
  }
}
```

### Graceful Shutdown

```javascript
/**
 * Ensures logs are flushed before process exit
 * @param {Object} logger - Logger instance
 */
function setupGracefulShutdown(logger) {
  const handleShutdown = async (signal) => {
    logger.info('Shutdown signal received', { signal });

    try {
      // Flush all pending logs
      await logger.flush();

      // Close all transports
      await logger.close();

      logger.info('Logger shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during logger shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack,
    });

    await logger.flush();
    await logger.close();
    process.exit(1);
  });
}
```

### Audit Logging

```javascript
/**
 * Creates audit logger for compliance
 * @param {Object} baseLogger - Base logger instance
 * @returns {Object} Audit logger interface
 */
function createAuditLogger(baseLogger) {
  const auditLogger = baseLogger.child({
    audit: true,
  });

  return {
    /**
     * Logs user action for audit trail
     * @param {string} action - Action performed
     * @param {string} userId - User ID
     * @param {Object} details - Action details
     */
    logUserAction(action, userId, details = {}) {
      auditLogger.info('User action', {
        action,
        userId,
        details,
        timestamp: new Date().toISOString(),
        ip: details.ip,
        userAgent: details.userAgent,
      });
    },

    /**
     * Logs data access for compliance
     * @param {string} resource - Resource accessed
     * @param {string} userId - User ID
     * @param {Object} context - Access context
     */
    logDataAccess(resource, userId, context = {}) {
      auditLogger.info('Data access', {
        resource,
        userId,
        operation: context.operation || 'read',
        timestamp: new Date().toISOString(),
        ...context,
      });
    },
  };
}
```

## Code Generation Rules

1. Always use `createLogger()` with an options object when configuration is
   needed
2. Use child loggers for request/operation-specific context
3. Include timestamp in metadata for audit trails
4. Implement proper error handling with try/catch blocks
5. Close logger instances during graceful shutdown
6. Use appropriate log levels based on severity
7. Sanitize sensitive data before logging
8. Configure file retention based on compliance requirements
