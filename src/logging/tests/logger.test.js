/**
 * Logger tests for @voilajs/appkit logging module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../index.js';
import {
  mockConsole,
  cleanupTestLogs,
  createTestLoggerOptions,
  waitForAsync,
} from './setup.js';

describe('Logger', () => {
  beforeEach(async () => {
    await cleanupTestLogs();
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
    mockConsole.warn.mockClear();
    mockConsole.info.mockClear();
    mockConsole.debug.mockClear();
  });

  afterEach(async () => {
    await cleanupTestLogs();
  });

  describe('createLogger', () => {
    it('should create logger with default options', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();
      expect(logger.info).toBeInstanceOf(Function);
      expect(logger.error).toBeInstanceOf(Function);
      expect(logger.warn).toBeInstanceOf(Function);
      expect(logger.debug).toBeInstanceOf(Function);
    });

    it('should create logger with custom options', () => {
      const logger = createLogger({
        level: 'debug',
        defaultMeta: { service: 'test' },
      });
      expect(logger).toBeDefined();
    });

    it('should create console-only logger', () => {
      const logger = createLogger({
        enableFileLogging: false,
      });

      logger.info('Console only message');
      expect(mockConsole.log).toHaveBeenCalled();
    });
  });

  describe('log levels', () => {
    it('should log info level', () => {
      const logger = createLogger({ enableFileLogging: false });
      logger.info('Info message');

      expect(mockConsole.log).toHaveBeenCalled();
      const call = mockConsole.log.mock.calls[0][0];
      expect(call).toContain('INFO');
      expect(call).toContain('Info message');
    });

    it('should log error level', () => {
      const logger = createLogger({ enableFileLogging: false });
      logger.error('Error message');

      expect(mockConsole.error).toHaveBeenCalled();
      const call = mockConsole.error.mock.calls[0][0];
      expect(call).toContain('ERROR');
      expect(call).toContain('Error message');
    });

    it('should log warn level', () => {
      const logger = createLogger({ enableFileLogging: false });
      logger.warn('Warning message');

      expect(mockConsole.warn).toHaveBeenCalled();
      const call = mockConsole.warn.mock.calls[0][0];
      expect(call).toContain('WARN');
      expect(call).toContain('Warning message');
    });

    it('should log debug level when enabled', () => {
      const logger = createLogger({
        level: 'debug',
        enableFileLogging: false,
      });
      logger.debug('Debug message');

      expect(mockConsole.debug).toHaveBeenCalled();
      const call = mockConsole.debug.mock.calls[0][0];
      expect(call).toContain('DEBUG');
      expect(call).toContain('Debug message');
    });

    it('should not log debug when level is info', () => {
      const logger = createLogger({
        level: 'info',
        enableFileLogging: false,
      });
      logger.debug('Debug message');

      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });

  describe('metadata', () => {
    it('should include default metadata', () => {
      const logger = createLogger({
        defaultMeta: { service: 'test-service' },
        enableFileLogging: false,
      });

      logger.info('Test message');

      const call = mockConsole.log.mock.calls[0][0];
      expect(call).toContain('test-service');
    });

    it('should include additional metadata', () => {
      const logger = createLogger({ enableFileLogging: false });

      logger.info('User action', {
        userId: '123',
        action: 'login',
      });

      const call = mockConsole.log.mock.calls[0][0];
      expect(call).toContain('123');
      expect(call).toContain('login');
    });

    it('should merge default and additional metadata', () => {
      const logger = createLogger({
        defaultMeta: { service: 'api' },
        enableFileLogging: false,
      });

      logger.info('Test', { userId: '123' });

      const call = mockConsole.log.mock.calls[0][0];
      expect(call).toContain('api');
      expect(call).toContain('123');
    });
  });

  describe('child loggers', () => {
    it('should create child logger with additional context', () => {
      const logger = createLogger({ enableFileLogging: false });
      const child = logger.child({ requestId: 'req-123' });

      child.info('Child message');

      const call = mockConsole.log.mock.calls[0][0];
      expect(call).toContain('req-123');
      expect(call).toContain('Child message');
    });

    it('should inherit parent metadata', () => {
      const logger = createLogger({
        defaultMeta: { service: 'api' },
        enableFileLogging: false,
      });

      const child = logger.child({ requestId: 'req-123' });
      child.info('Test');

      const call = mockConsole.log.mock.calls[0][0];
      expect(call).toContain('api');
      expect(call).toContain('req-123');
    });

    it('should support nested child loggers', () => {
      const logger = createLogger({ enableFileLogging: false });
      const child1 = logger.child({ layer: 'service' });
      const child2 = child1.child({ operation: 'update' });

      child2.info('Nested');

      const call = mockConsole.log.mock.calls[0][0];
      expect(call).toContain('service');
      expect(call).toContain('update');
    });
  });

  describe('async operations', () => {
    it('should handle flush', async () => {
      const logger = createLogger({
        ...createTestLoggerOptions(),
        enableFileLogging: false,
      });

      logger.info('Test message');
      await logger.flush();

      expect(logger).toBeDefined();
    });

    it('should handle close', async () => {
      const logger = createLogger(createTestLoggerOptions());

      logger.info('Test message');
      await logger.close();

      expect(logger).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should log error objects', () => {
      const logger = createLogger({ enableFileLogging: false });
      const error = new Error('Test error');

      logger.error('Error occurred', {
        error: error.message,
        stack: error.stack,
      });

      const call = mockConsole.error.mock.calls[0][0];
      expect(call).toContain('Test error');
    });

    it('should handle missing message', () => {
      const logger = createLogger({ enableFileLogging: false });

      logger.info();

      expect(mockConsole.log).toHaveBeenCalled();
    });

    it('should handle null metadata', () => {
      const logger = createLogger({ enableFileLogging: false });

      logger.info('Test', null);

      expect(mockConsole.log).toHaveBeenCalled();
    });
  });
});
