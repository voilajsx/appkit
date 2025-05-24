# Logging Module API Reference

## Overview

The `@voilajsx/appkit/logging` module provides structured logging capabilities
with file storage and retention for Node.js applications. It includes automatic
log rotation, retention policies, and support for multiple log levels and
transports.

## Installation

```bash
npm install @voilajsx/appkit
```

## Quick Start

```javascript
import { createLogger } from '@voilajsx/appkit/logging';

const logger = createLogger();
logger.info('Application started');
logger.error('Database connection failed', { error: err.message });
```

## API Reference

### Core Functions

#### createLogger(options?)

Creates a new logger instance with optional file storage.

##### Parameters

| Name                        | Type                   | Required | Default                             | Description                                                                   |
| :-------------------------- | :--------------------- | :------- | :---------------------------------- | :---------------------------------------------------------------------------- |
| `options`                   | `Object`               | No       | `{}`                                | Configuration options for the logger                                          |
| `options.level`             | `string`               | No       | `'info'`                            | Minimum log level to output. One of: `'error'`, `'warn'`, `'info'`, `'debug'` |
| `options.defaultMeta`       | `Object`               | No       | `{}`                                | Default metadata to include in all log entries                                |
| `options.transports`        | `Array<BaseTransport>` | No       | `[ConsoleTransport, FileTransport]` | Array of transport instances                                                  |
| `options.enableFileLogging` | `boolean`              | No       | `true`                              | Enable or disable file logging                                                |
| `options.dirname`           | `string`               | No       | `'logs'`                            | Directory for log files                                                       |
| `options.filename`          | `string`               | No       | `'app.log'`                         | Base filename for log files                                                   |
| `options.retentionDays`     | `number`               | No       | `7`                                 | Number of days to retain log files                                            |
| `options.maxSize`           | `number`               | No       | `10485760`                          | Maximum file size in bytes before rotation (10MB)                             |

##### Returns

- `Logger` - Logger instance

##### Example

```javascript
// Basic logger with default settings
const logger = createLogger();

// Custom configuration
const customLogger = createLogger({
  level: 'debug',
  defaultMeta: { service: 'api' },
  dirname: '/var/log/myapp',
  retentionDays: 30,
});

// Console-only logger
const consoleLogger = createLogger({
  enableFileLogging: false,
});
```

---

### Logger Methods

The logger instance returned by `createLogger()` has the following methods:

#### info(message, meta?)

Logs an informational message.

##### Parameters

| Name      | Type     | Required | Default | Description                    |
| :-------- | :------- | :------- | :------ | :----------------------------- |
| `message` | `string` | Yes      | -       | Log message                    |
| `meta`    | `Object` | No       | `{}`    | Additional metadata to include |

##### Returns

- `void`

##### Example

```javascript
logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });
```

---

#### error(message, meta?)

Logs an error message.

##### Parameters

| Name      | Type     | Required | Default | Description                                 |
| :-------- | :------- | :------- | :------ | :------------------------------------------ |
| `message` | `string` | Yes      | -       | Error message                               |
| `meta`    | `Object` | No       | `{}`    | Additional metadata including error details |

##### Returns

- `void`

##### Example

```javascript
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack,
  retryCount: 3,
});
```

---

#### warn(message, meta?)

Logs a warning message.

##### Parameters

| Name      | Type     | Required | Default | Description         |
| :-------- | :------- | :------- | :------ | :------------------ |
| `message` | `string` | Yes      | -       | Warning message     |
| `meta`    | `Object` | No       | `{}`    | Additional metadata |

##### Returns

- `void`

##### Example

```javascript
logger.warn('API rate limit approaching', {
  current: 950,
  limit: 1000,
});
```

---

#### debug(message, meta?)

Logs a debug message.

##### Parameters

| Name      | Type     | Required | Default | Description         |
| :-------- | :------- | :------- | :------ | :------------------ |
| `message` | `string` | Yes      | -       | Debug message       |
| `meta`    | `Object` | No       | `{}`    | Additional metadata |

##### Returns

- `void`

##### Example

```javascript
logger.debug('Cache lookup', {
  key: 'user:123',
  hit: false,
  operation: 'get',
});
```

---

#### child(bindings)

Creates a child logger with additional context.

##### Parameters

| Name       | Type     | Required | Default | Description                                            |
| :--------- | :------- | :------- | :------ | :----------------------------------------------------- |
| `bindings` | `Object` | Yes      | -       | Additional context for all logs from this child logger |

##### Returns

- `Logger` - Child logger instance

##### Example

```javascript
const requestLogger = logger.child({
  requestId: 'abc123',
  userId: '456',
});
requestLogger.info('Processing request');
// Includes requestId and userId in all logs
```

---

#### flush()

Flushes all pending log writes to transports.

##### Parameters

None

##### Returns

- `Promise<void>`

##### Example

```javascript
await logger.flush();
```

---

#### close()

Closes all transports and releases resources.

##### Parameters

None

##### Returns

- `Promise<void>`

##### Example

```javascript
await logger.close();
```

---

### Transport Classes

#### ConsoleTransport

Console transport for outputting logs.

##### Constructor

```javascript
new ConsoleTransport(options?)
```

##### Parameters

| Name                  | Type      | Required | Default  | Description                          |
| :-------------------- | :-------- | :------- | :------- | :----------------------------------- |
| `options`             | `Object`  | No       | `{}`     | Configuration options                |
| `options.level`       | `string`  | No       | `'info'` | Minimum log level for this transport |
| `options.colorize`    | `boolean` | No       | `true`   | Enable colored output                |
| `options.prettyPrint` | `boolean` | No       | `false`  | Enable pretty formatting             |

##### Example

```javascript
const consoleTransport = new ConsoleTransport({
  colorize: true,
  prettyPrint: process.env.NODE_ENV === 'development',
});
```

---

#### FileTransport

File transport for storing logs with rotation and retention.

##### Constructor

```javascript
new FileTransport(options?)
```

##### Parameters

| Name                    | Type     | Required | Default        | Description                          |
| :---------------------- | :------- | :------- | :------------- | :----------------------------------- |
| `options`               | `Object` | No       | `{}`           | Configuration options                |
| `options.level`         | `string` | No       | `'info'`       | Minimum log level for this transport |
| `options.dirname`       | `string` | No       | `'logs'`       | Directory for log files              |
| `options.filename`      | `string` | No       | `'app.log'`    | Base filename for log files          |
| `options.retentionDays` | `number` | No       | `7`            | Days to retain log files             |
| `options.maxSize`       | `number` | No       | `10485760`     | Max file size in bytes (10MB)        |
| `options.datePattern`   | `string` | No       | `'YYYY-MM-DD'` | Date format for filenames            |

##### Example

```javascript
const fileTransport = new FileTransport({
  dirname: '/var/log/myapp',
  filename: 'api.log',
  retentionDays: 30,
  maxSize: 50 * 1024 * 1024, // 50MB
});
```

---

## Error Handling

The logging module is designed to be resilient to errors. Transport errors
(e.g., file write failures) are handled gracefully without affecting application
flow.

### Common Error Scenarios

| Error Type      | Description                   | Handling                                                 |
| :-------------- | :---------------------------- | :------------------------------------------------------- |
| File Permission | Cannot write to log directory | Logs warning to console, continues with other transports |
| Disk Full       | No space for log files        | Automatically stops file logging, continues with console |
| Transport Error | Custom transport fails        | Isolates error to specific transport, others continue    |

### Example Error Handling

```javascript
try {
  // Your application code
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    code: error.code,
  });
}
```

---

## Security Considerations

1.  **Sensitive Data**: Never log passwords, API keys, or personally
    identifiable information
2.  **File Permissions**: Ensure log directories have appropriate permissions
3.  **Log Retention**: Configure retention policies to comply with data
    regulations
4.  **Error Details**: Avoid logging sensitive error details in production
5.  **Metadata Sanitization**: Sanitize user input before including in logs

---

## TypeScript Support

While the module is written in JavaScript, it includes JSDoc comments for better
IDE support:

```typescript
interface LoggerOptions {
  level?: 'error' | 'warn' | 'info' | 'debug';
  defaultMeta?: Record<string, any>;
  transports?: BaseTransport[]; // Updated from 'Transport[]'
  enableFileLogging?: boolean;
  dirname?: string;
  filename?: string;
  retentionDays?: number;
  maxSize?: number;
}

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

---

## Performance Tips

1.  **Log Levels**: Use appropriate log levels to reduce I/O in production
2.  **Async Operations**: The file transport uses async writes to minimize
    blocking
3.  **Batch Logging**: Log aggregated results rather than individual operations
    in loops
4.  **Child Loggers**: Use child loggers instead of repeating metadata
5.  **File Size**: Configure `maxSize` to prevent excessive file sizes
6.  **Retention**: Set appropriate `retentionDays` to manage disk usage

---

## License

MIT

---

<p align="center">
Built with ❤️ in India by the <a href="https://github.com/orgs/voilajsx/people">VoilaJSX Team</a> — powering modern web development.
</p>
