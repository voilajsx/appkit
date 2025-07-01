/**
 * Core logger class with simplified transport management and built-in functionality
 * @module @voilajsx/appkit/logging
 * @file src/logging/logger.ts
 * 
 * @llm-rule WHEN: Building logger instances - called via logger.get(), not directly
 * @llm-rule AVOID: Creating LoggerClass directly - always use logger.get() for proper setup
 * @llm-rule NOTE: Handles all transports automatically based on environment detection
 */

import { ConsoleTransport } from './transports/console';
import { FileTransport } from './transports/file';
import { DatabaseTransport } from './transports/database';
import { HttpTransport } from './transports/http';
import { WebhookTransport } from './transports/webhook';
import type { LoggingConfig } from './defaults';
import type { LogMeta, Logger } from './index';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  [key: string]: any;
}

export interface Transport {
  write(entry: LogEntry): void | Promise<void>;
  shouldLog?(level: string, configLevel: string): boolean;
  flush?(): Promise<void>;
  close?(): Promise<void>;
}

/**
 * Logger class with automatic transport management (like auth class pattern)
 */
export class LoggerClass implements Logger {
  private level: 'debug' | 'info' | 'warn' | 'error';
  private levelValue: number;
  private defaultMeta: LogMeta;
  private config: LoggingConfig;
  private transports = new Map<string, Transport>();
  private pendingWrites: Promise<any>[] = [];

  /**
   * Creates logger with simplified constructor (like auth module)
   * @llm-rule WHEN: Called by logger.get() - environment config already parsed
   * @llm-rule AVOID: Complex config objects - uses direct environment values
   */
  constructor(config: LoggingConfig) {
    this.config = config;
    this.level = config.level;
    this.levelValue = LOG_LEVELS[this.level];
    this.defaultMeta = {
      service: config.service.name,
      version: config.service.version,
      environment: config.service.environment,
    };

    // Initialize transports based on environment detection
    this.initializeTransports();
  }

  /**
   * Initialize enabled transports automatically
   * @llm-rule WHEN: Logger startup - creates transports based on environment
   * @llm-rule AVOID: Manual transport setup - environment detection handles this
   */
  private initializeTransports(): void {
    const { transports } = this.config;

    // Console transport (always first for fallback)
    if (transports.console) {
      this.transports.set('console', new ConsoleTransport(this.config));
    }

    // File transport
    if (transports.file) {
      try {
        this.transports.set('file', new FileTransport(this.config));
      } catch (error) {
        console.error('File transport initialization failed:', (error as Error).message);
      }
    }

    // Database transport (auto-enabled if DATABASE_URL exists)
    if (transports.database && this.config.database.url) {
      try {
        this.transports.set('database', new DatabaseTransport(this.config));
      } catch (error) {
        console.error('Database transport initialization failed:', (error as Error).message);
      }
    }

    // HTTP transport (auto-enabled if URL provided)
    if (transports.http && this.config.http.url) {
      try {
        this.transports.set('http', new HttpTransport(this.config));
      } catch (error) {
        console.error('HTTP transport initialization failed:', (error as Error).message);
      }
    }

    // Webhook transport (auto-enabled if URL provided)
    if (transports.webhook && this.config.webhook.url) {
      try {
        this.transports.set('webhook', new WebhookTransport(this.config));
      } catch (error) {
        console.error('Webhook transport initialization failed:', (error as Error).message);
      }
    }

    // Fallback to console if no transports initialized
    if (this.transports.size === 0) {
      console.warn('No transports initialized, falling back to console');
      this.transports.set('console', new ConsoleTransport(this.config));
    }
  }

  /**
   * Log informational message
   * @llm-rule WHEN: Normal application events, user actions, business logic flow
   * @llm-rule AVOID: Sensitive data in meta - passwords, tokens, full card numbers
   */
  info(message: string, meta: LogMeta = {}): void {
    this.log('info', message, meta);
  }

  /**
   * Log error message
   * @llm-rule WHEN: Exceptions, failures, critical issues requiring attention
   * @llm-rule AVOID: Using for warnings - errors should indicate actual problems
   */
  error(message: string, meta: LogMeta = {}): void {
    this.log('error', message, meta);
  }

  /**
   * Log warning message
   * @llm-rule WHEN: Potential issues, deprecated usage, performance concerns
   * @llm-rule AVOID: Using for normal recoverable errors - use error() for those
   */
  warn(message: string, meta: LogMeta = {}): void {
    this.log('warn', message, meta);
  }

  /**
   * Log debug message
   * @llm-rule WHEN: Development debugging, detailed flow information
   * @llm-rule AVOID: Production debug spam - automatically filtered in production
   */
  debug(message: string, meta: LogMeta = {}): void {
    this.log('debug', message, meta);
  }

  /**
   * Create child logger with additional context (like auth pattern)
   * @llm-rule WHEN: Adding component context or request-specific data
   * @llm-rule AVOID: Creating many child loggers - reuse component loggers
   */
  child(bindings: LogMeta): LoggerClass {
    const child = Object.create(this) as LoggerClass;
    child.defaultMeta = { ...this.defaultMeta, ...bindings };
    return child;
  }

  /**
   * Core logging method with automatic transport routing
   * @llm-rule WHEN: Called by info/error/warn/debug methods
   * @llm-rule AVOID: Calling directly - use specific level methods instead
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta: LogMeta): void {
    // Skip if level too low
    if (LOG_LEVELS[level] > this.levelValue) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: message || '',
      ...this.defaultMeta,
      ...meta,
    };

    // Send to all transports
    this.writeToTransports(entry);
  }

  /**
   * Write log entry to all active transports
   * @llm-rule WHEN: Distributing log entries across console, file, database, etc
   * @llm-rule AVOID: Manual transport selection - automatic routing is better
   */
  private writeToTransports(entry: LogEntry): void {
    const writePromises: Promise<any>[] = [];

    for (const [name, transport] of this.transports) {
      try {
        // Check transport-specific level filtering
        if (transport.shouldLog && !transport.shouldLog(entry.level, this.level)) {
          continue;
        }

        // Write to transport (may be async)
        const result = transport.write(entry);
        if (result && typeof result.then === 'function') {
          writePromises.push(
            result.catch((error: Error) => {
              console.error(`Transport ${name} write failed:`, error.message);
            })
          );
        }
      } catch (error) {
        console.error(`Transport ${name} write error:`, (error as Error).message);
      }
    }

    // Track promises for flushing
    this.pendingWrites = writePromises;
  }

  /**
   * Flush all pending logs across all transports
   * @llm-rule WHEN: App shutdown, test cleanup, ensuring logs are written
   * @llm-rule AVOID: Calling frequently - only needed for cleanup
   */
  async flush(): Promise<void> {
    // Wait for pending writes
    if (this.pendingWrites.length > 0) {
      try {
        await Promise.all(this.pendingWrites);
      } catch {
        // Errors already handled in writeToTransports
      }
      this.pendingWrites = [];
    }

    // Flush all transports
    const flushPromises: Promise<any>[] = [];
    for (const [name, transport] of this.transports) {
      if (transport.flush) {
        try {
          const result = transport.flush();
          if (result) {
            flushPromises.push(
              result.catch((error: Error) => {
                console.error(`Transport ${name} flush failed:`, error.message);
              })
            );
          }
        } catch (error) {
          console.error(`Transport ${name} flush error:`, (error as Error).message);
        }
      }
    }

    if (flushPromises.length > 0) {
      await Promise.all(flushPromises);
    }
  }

  /**
   * Close all transports and cleanup resources
   * @llm-rule WHEN: App shutdown, test cleanup, logger reset
   * @llm-rule AVOID: Calling without flush() first - may lose pending logs
   */
  async close(): Promise<void> {
    // Flush first
    await this.flush();

    // Close all transports
    const closePromises: Promise<any>[] = [];
    for (const [name, transport] of this.transports) {
      if (transport.close) {
        try {
          const result = transport.close();
          if (result) {
            closePromises.push(
              result.catch((error: Error) => {
                console.error(`Transport ${name} close failed:`, error.message);
              })
            );
          }
        } catch (error) {
          console.error(`Transport ${name} close error:`, (error as Error).message);
        }
      }
    }

    if (closePromises.length > 0) {
      await Promise.all(closePromises);
    }

    // Clear transports
    this.transports.clear();
  }

  /**
   * Get list of active transport names
   * @llm-rule WHEN: Debugging transport setup or checking configuration
   * @llm-rule AVOID: Using for business logic - transport selection is automatic
   */
  getActiveTransports(): string[] {
    return Array.from(this.transports.keys());
  }

  /**
   * Check if specific transport is active
   * @llm-rule WHEN: Conditional logic based on transport availability
   * @llm-rule AVOID: Complex transport detection - just log normally
   */
  hasTransport(name: string): boolean {
    return this.transports.has(name);
  }

  /**
   * Set log level at runtime
   * @llm-rule WHEN: Dynamic log level changes based on debug flags
   * @llm-rule AVOID: Frequent level changes - set once at startup usually
   */
  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.level = level;
    this.levelValue = LOG_LEVELS[level];
  }

  /**
   * Get current log level
   * @llm-rule WHEN: Checking current log level for conditional logging
   * @llm-rule AVOID: Using for level filtering - logger handles this automatically
   */
  getLevel(): string {
    return this.level;
  }

  /**
   * Check if specific level would be logged
   * @llm-rule WHEN: Expensive log message computation - check before building
   * @llm-rule AVOID: Regular usage - just call log methods, they filter automatically
   */
  isLevelEnabled(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    return LOG_LEVELS[level] <= this.levelValue;
  }

  /**
   * Get configuration summary for debugging
   * @llm-rule WHEN: Debugging logger setup or environment detection issues
   * @llm-rule AVOID: Using for runtime decisions - config is set at startup
   */
  getConfig() {
    return {
      level: this.level,
      scope: this.config.scope,
      minimal: this.config.minimal,
      transports: this.getActiveTransports(),
      service: this.config.service,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasHttpUrl: !!process.env.VOILA_LOGGING_HTTP_URL,
        hasWebhookUrl: !!process.env.VOILA_LOGGING_WEBHOOK_URL,
      },
    };
  }
}