/**
 * Integration tests for @voilajs/appkit logging module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLogger } from '../index.js';
import { cleanupTestLogs, waitForAsync } from './setup.js';
import { ConsoleTransport } from '../transports/console.js';

describe('Logger Integration', () => {
  let logger;
  let mockConsoleLog;

  beforeEach(async () => {
    await cleanupTestLogs();
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    if (logger) {
      await logger.close();
      logger = null;
    }
    mockConsoleLog.mockRestore();
    await cleanupTestLogs();
  });

  it('should work with custom transports', async () => {
    // Custom in-memory transport for testing
    const memoryLogs = [];
    const memoryTransport = {
      log(entry) {
        memoryLogs.push(entry);
      },
      async flush() {
        // No-op
      },
      async close() {
        // No-op
      },
    };

    logger = createLogger({
      transports: [new ConsoleTransport({ colorize: false }), memoryTransport],
      // Disable file logging to avoid timeouts
      enableFileLogging: false,
    });

    logger.info('Custom transport test');
    logger.error('Error test', { code: 'E001' });

    await logger.flush();

    expect(memoryLogs.length).toBe(2);
    expect(memoryLogs[0].message).toBe('Custom transport test');
    expect(memoryLogs[1].message).toBe('Error test');
    expect(memoryLogs[1].code).toBe('E001');
  });

  it('should handle errors in transports gracefully', async () => {
    // Transport that throws errors
    const errorTransport = {
      log() {
        throw new Error('Transport error');
      },
      async flush() {},
      async close() {},
    };

    // Mock console.error to check error handling
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    logger = createLogger({
      transports: [errorTransport],
      enableFileLogging: false,
    });

    // Should not throw
    expect(() => {
      logger.info('Test message');
    }).not.toThrow();

    // Should have logged the transport error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Transport error:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should respect log levels', async () => {
    // Custom in-memory transport for testing
    const memoryLogs = [];
    const memoryTransport = {
      log(entry) {
        memoryLogs.push(entry);
      },
      async flush() {},
      async close() {},
    };

    logger = createLogger({
      level: 'warn',
      transports: [memoryTransport],
      enableFileLogging: false,
    });

    logger.debug('Debug message'); // Should not be logged
    logger.info('Info message'); // Should not be logged
    logger.warn('Warning message'); // Should be logged
    logger.error('Error message'); // Should be logged

    await logger.flush();

    expect(memoryLogs.length).toBe(2);
    expect(memoryLogs[0].message).toBe('Warning message');
    expect(memoryLogs[1].message).toBe('Error message');
  });

  it('should handle child loggers correctly', async () => {
    // Custom in-memory transport for testing
    const memoryLogs = [];
    const memoryTransport = {
      log(entry) {
        memoryLogs.push(entry);
      },
      async flush() {},
      async close() {},
    };

    logger = createLogger({
      transports: [memoryTransport],
      enableFileLogging: false,
    });

    const requestLogger = logger.child({
      requestId: 'req-123',
      method: 'GET',
    });

    requestLogger.info('Request started');
    requestLogger.error('Request failed', {
      error: 'Not found',
      statusCode: 404,
    });

    await logger.flush();

    expect(memoryLogs.length).toBe(2);
    expect(memoryLogs[0].requestId).toBe('req-123');
    expect(memoryLogs[0].method).toBe('GET');
    expect(memoryLogs[0].message).toBe('Request started');
    expect(memoryLogs[1].error).toBe('Not found');
    expect(memoryLogs[1].statusCode).toBe(404);
  });

  it('should handle metadata with special characters', async () => {
    // Custom in-memory transport for testing
    const memoryLogs = [];
    const memoryTransport = {
      log(entry) {
        memoryLogs.push(entry);
      },
      async flush() {},
      async close() {},
    };

    logger = createLogger({
      transports: [memoryTransport],
      enableFileLogging: false,
    });

    const specialData = {
      message: 'Special chars: "quotes", \'single\', \n newline, \t tab',
      unicode: 'Unicode: 🚀 📝 ✨',
      nested: {
        array: [1, 2, { deep: true }],
        null: null,
        undefined: undefined,
      },
    };

    logger.info('Special metadata test', specialData);

    await logger.flush();

    expect(memoryLogs.length).toBe(1);
    expect(memoryLogs[0].unicode).toBe('Unicode: 🚀 📝 ✨');
    expect(memoryLogs[0].nested.array[2].deep).toBe(true);
  });
});
