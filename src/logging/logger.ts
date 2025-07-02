/**
 * Core logger class with visual error display and simplified transport management
 * @module @voilajsx/appkit/logging
 * @file src/logging/logger.ts
 * 
 * @llm-rule WHEN: Building logger instances - called via logger.get(), not directly
 * @llm-rule AVOID: Creating LoggerClass directly - always use logger.get() for proper setup
 * @llm-rule NOTE: Enhanced error() method provides automatic visual formatting for better DX
 */

import { ConsoleTransport } from './transports/console';
import { FileTransport } from './transports/file';
import { DatabaseTransport } from './transports/database';
import { HttpTransport } from './transports/http';
import { WebhookTransport } from './transports/webhook';
import type { LoggingConfig } from './defaults';
import type { LogMeta, Logger } from './index';
import { existsSync } from 'fs';
import { join } from 'path';

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

export interface ErrorDiagnostic {
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  fix?: string;
}

/**
 * Logger class with automatic transport management and enhanced error() method
 */
export class LoggerClass implements Logger {
  private level: 'debug' | 'info' | 'warn' | 'error';
  private levelValue: number;
  private defaultMeta: LogMeta;
  private config: LoggingConfig;
  private transports = new Map<string, Transport>();
  private pendingWrites: Promise<any>[] = [];

  constructor(config: LoggingConfig) {
    this.config = config;
    this.level = config.level;
    this.levelValue = LOG_LEVELS[this.level];
    this.defaultMeta = {
      service: config.service.name,
      version: config.service.version,
      environment: config.service.environment,
    };

    this.initializeTransports();
  }

  private initializeTransports(): void {
    const { transports } = this.config;

    if (transports.console) {
      this.transports.set('console', new ConsoleTransport(this.config));
    }

    if (transports.file) {
      try {
        this.transports.set('file', new FileTransport(this.config));
      } catch (error) {
        console.error('File transport initialization failed:', (error as Error).message);
      }
    }

    if (transports.database && this.config.database.url) {
      try {
        this.transports.set('database', new DatabaseTransport(this.config));
      } catch (error) {
        console.error('Database transport initialization failed:', (error as Error).message);
      }
    }

    if (transports.http && this.config.http.url) {
      try {
        this.transports.set('http', new HttpTransport(this.config));
      } catch (error) {
        console.error('HTTP transport initialization failed:', (error as Error).message);
      }
    }

    if (transports.webhook && this.config.webhook.url) {
      try {
        this.transports.set('webhook', new WebhookTransport(this.config));
      } catch (error) {
        console.error('Webhook transport initialization failed:', (error as Error).message);
      }
    }

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
   * Enhanced error logging with automatic visual formatting
   * @llm-rule WHEN: Exceptions, failures, critical issues requiring attention
   * @llm-rule AVOID: Using for warnings - errors should indicate actual problems
   * @llm-rule NOTE: Automatically provides visual formatting in development with smart diagnostics
   */
  error(message: string, meta: LogMeta = {}): void {
    const enhancedMeta = {
      ...meta,
      _location: this.getCaller()
    };

    // Detect error type and provide visual formatting if appropriate
    if (this.shouldShowVisual()) {
      this.renderVisualError(message, enhancedMeta);
    }

    // Always log structured data for production/debugging
    this.log('error', message, enhancedMeta);
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
   * Create child logger with additional context
   * @llm-rule WHEN: Adding component context or request-specific data
   * @llm-rule AVOID: Creating many child loggers - reuse component loggers
   */
  child(bindings: LogMeta): LoggerClass {
    const child = Object.create(this) as LoggerClass;
    child.defaultMeta = { ...this.defaultMeta, ...bindings };
    return child;
  }

  // ============================================================================
  // VISUAL ERROR FORMATTING METHODS
  // ============================================================================

  private shouldShowVisual(): boolean {
    // Show visual output in development or when explicitly enabled
    return this.config.service.environment === 'development' || 
           this.config.minimal === false ||
           process.env.VOILA_VISUAL_ERRORS === 'true';
  }

  private renderVisualError(message: string, meta: LogMeta): void {
    const errorType = this.detectErrorType(message, meta);
    const title = this.getErrorTitle(errorType);
    const diagnostics = this.generateDiagnostics(message, meta, errorType);

    const colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m'
    };

    console.log();
    console.log(`${colors.red}╭─ ${title}${colors.reset}`);
    
    if (meta.feature) {
      console.log(`${colors.red}│${colors.reset} Feature: ${colors.cyan}${meta.feature}${colors.reset}`);
    }
    
    if (meta.file) {
      console.log(`${colors.red}│${colors.reset} File:    ${colors.yellow}${meta.file}${colors.reset}`);
    }
    
    console.log(`${colors.red}│${colors.reset}`);

    // ✅ ALWAYS show the actual error message first
    console.log(`${colors.red}│${colors.reset} ${colors.red}❌ ERROR:${colors.reset} ${message}`);

    // Show location/position if available
    if (meta._location) {
      console.log(`${colors.red}│${colors.reset} ${colors.cyan}📍 FROM:${colors.reset}  ${meta._location}`);
    }

    // Extract and show line/position for syntax errors
    const lineMatch = message.match(/at line (\d+):(\d+)/i) || message.match(/line (\d+)/i);
    if (lineMatch) {
      console.log(`${colors.red}│${colors.reset} ${colors.cyan}📍 LINE:${colors.reset}  ${lineMatch[1]}${lineMatch[2] ? `:${lineMatch[2]}` : ''}`);
    }

    // Show code context for syntax errors if available
    if (message.includes('Unexpected token') || message.includes('SyntaxError')) {
      const tokenMatch = message.match(/'([^']+)'/);
      if (tokenMatch) {
        console.log(`${colors.red}│${colors.reset} ${colors.cyan}📍 NEAR:${colors.reset}  ...${tokenMatch[1]}...`);
        console.log(`${colors.red}│${colors.reset}                    ${colors.red}^${colors.reset}`);
      }
    }

    console.log(`${colors.red}│${colors.reset}`);

    // Show smart diagnostics
    diagnostics.forEach(diagnostic => {
      const icon = diagnostic.type === 'error' ? '✗' : 
                   diagnostic.type === 'warning' ? '⚠' : 
                   diagnostic.type === 'success' ? '✓' : 'ℹ';
      
      const color = diagnostic.type === 'error' ? colors.red : 
                    diagnostic.type === 'warning' ? colors.yellow : 
                    diagnostic.type === 'success' ? colors.green : colors.cyan;

      console.log(`${colors.red}│${colors.reset} ${color}${icon}${colors.reset} ${diagnostic.message}`);
      
      if (diagnostic.fix) {
        console.log(`${colors.red}│${colors.reset} ${colors.green}✓${colors.reset} ${diagnostic.fix}`);
      }
    });

    const solutions = this.getSolutions(errorType, message);
    if (solutions.length > 0) {
      console.log(`${colors.red}│${colors.reset}`);
      solutions.forEach(solution => {
        console.log(`${colors.red}│${colors.reset} ${colors.green}✓${colors.reset} ${solution}`);
      });
    }

    // Enhanced fix message based on error type
    const fixMessage = this.getFixMessage(errorType, message);
    console.log(`${colors.red}╰─ FIX: ${colors.green}${fixMessage}${colors.reset}`);
    console.log();
  }

  private detectErrorType(message: string, meta: LogMeta): string {
    // Check meta for explicit category first
    if (meta.category) {
      return meta.category as string;
    }

    // Handle only the MAJOR ones we have smart diagnostics for
    
    // Enhanced detection for import vs syntax errors
    if (message.includes('Cannot find module')) {
      return this.detectImportVsSyntax(message, meta);
    }

    // Direct syntax error detection
    if (message.includes('SyntaxError') || 
        message.includes('Unexpected token') ||
        message.includes('Unexpected end of input')) {
      return 'syntax';
    }

    // Startup/infrastructure errors
    if (message.includes('EADDRINUSE') || 
        message.includes('CONTRACT') || 
        message.includes('port') || 
        message.includes('startup')) {
      return 'startup';
    }

    // Route registration errors
    if (message.includes('ROUTE') || message.includes('registration')) {
      return 'route';
    }

    // For everything else - just show the raw error with general handling
    return 'general';
  }

  private detectImportVsSyntax(message: string, meta: LogMeta): string {
    const modulePath = message.match(/Cannot find module '([^']+)'/)?.[1];
    
    if (modulePath && meta.feature) {
      // Try to resolve the actual file path
      const basePath = process.cwd();
      const featurePath = join(basePath, 'src', 'features', meta.feature);
      
      // Build possible file paths
      const possiblePaths = [
        join(featurePath, modulePath + '.ts'),
        join(featurePath, modulePath + '.js'),
        join(featurePath, modulePath, 'index.ts'),
        join(featurePath, modulePath, 'index.js'),
        // Also try relative to the file that's importing
        modulePath + '.ts',
        modulePath + '.js'
      ];
      
      // Check if any of these files exist
      for (const filePath of possiblePaths) {
        try {
          if (existsSync(filePath)) {
            // File exists but import failed - likely syntax error preventing import
            return 'syntax';
          }
        } catch {
          // Ignore file system errors, continue checking
        }
      }
    }
    
    // File doesn't exist - true import error
    return 'import';
  }

  private getErrorTitle(errorType: string): string {
    const titles: Record<string, string> = {
      import: 'IMPORT ERROR',
      syntax: 'SYNTAX ERROR',
      startup: 'STARTUP ERROR',
      contract: 'CONTRACT ERROR',
      route: 'ROUTE ERROR',
      filesystem: 'FILE SYSTEM ERROR',
      general: 'ERROR'
    };

    return titles[errorType] || 'ERROR';
  }

  private generateDiagnostics(message: string, meta: LogMeta, errorType: string): ErrorDiagnostic[] {
    const diagnostics: ErrorDiagnostic[] = [];

    // Only provide smart diagnostics for errors we understand well
    switch (errorType) {
      case 'syntax':
        if (message.includes('Unexpected token')) {
          const tokenMatch = message.match(/Unexpected token '([^']+)'/);
          if (tokenMatch) {
            diagnostics.push({
              type: 'error',
              message: `Unexpected token: ${tokenMatch[1]}`,
            });
          }
        }

        if (message.includes('Unexpected end of input')) {
          diagnostics.push({
            type: 'error',
            message: 'Missing closing bracket, brace, or parenthesis',
            fix: 'Check for unclosed {}, [], or () brackets'
          });
        }

        // Line number extraction
        const lineMatch = message.match(/line (\d+)/i);
        if (lineMatch) {
          diagnostics.push({
            type: 'info',
            message: `Error location: line ${lineMatch[1]}`
          });
        }
        break;

      case 'import':
        const missingModule = message.match(/Cannot find module '([^']+)'/)?.[1];
        if (missingModule) {
          diagnostics.push({
            type: 'error',
            message: `Missing import: ${missingModule}`,
          });

          // Check for common typos
          if (missingModule.includes('Service') && missingModule.endsWith('Servic')) {
            diagnostics.push({
              type: 'warning',
              message: 'Looks like a typo: missing \'e\' at end?',
              fix: `Try: ${missingModule}e`
            });
          }

          if (missingModule.includes('/services/')) {
            diagnostics.push({
              type: 'info',
              message: 'Check service file exists and name matches'
            });
          }
        }
        break;

      case 'startup':
        if (message.includes('EADDRINUSE')) {
          diagnostics.push({
            type: 'error',
            message: 'Port already in use',
            fix: 'Change PORT environment variable or stop conflicting process'
          });
        }

        if (message.includes('CONTRACT')) {
          diagnostics.push({
            type: 'error',
            message: 'Contract validation failed',
            fix: 'Run: npm run flux:check to see detailed contract issues'
          });
        }
        break;

      case 'route':
        if (message.includes('export')) {
          diagnostics.push({
            type: 'error',
            message: 'Route file must export a function as default',
            fix: 'Add: export default router(...)'
          });
        }
        break;

      case 'general':
        // For general errors, don't add diagnostics - just show the raw error
        // This covers ReferenceError, TypeError, and all other JS errors
        break;
    }

    return diagnostics;
  }

  private getSolutions(errorType: string, message: string): string[] {
    const solutionMap: Record<string, string[]> = {
      import: [
        'Check import paths and file names',
        'Verify the file exists',
        'Check for typos in import statements'
      ],
      syntax: [
        'Check for missing brackets, braces, or parentheses',
        'Verify all strings are properly closed',
        'Look for missing commas or semicolons',
        'Check function and object syntax'
      ],
      startup: [
        'Check environment variables',
        'Verify port is available',
        'Review contract validation errors'
      ],
      route: [
        'Check route file syntax',
        'Ensure proper export default',
        'Verify router() usage'
      ],
      general: [
        // For general errors, provide minimal generic solutions
        'Review the error message above',
        'Check recent code changes'
      ]
    };

    return solutionMap[errorType] || solutionMap.general;
  }

  private getFixMessage(errorType: string, message: string): string {
    switch (errorType) {
      case 'import':
        return 'Check import paths and file names';
      
      case 'syntax':
        const lineMatch = message.match(/line (\d+)/i);
        return lineMatch ? `Check syntax around line ${lineMatch[1]}` : 'Fix syntax errors';
      
      case 'startup':
        if (message.includes('CONTRACT')) {
          return 'Fix contract validation errors';
        }
        if (message.includes('EADDRINUSE')) {
          return 'Change port or stop conflicting process';
        }
        return 'Fix startup configuration';
      
      case 'route':
        return 'Fix route export or registration';
      
      case 'general':
        return 'Review the error message above';
      
      default:
        return 'Resolve the issues above and restart';
    }
  }

  // ============================================================================
  // EXISTING HELPER METHODS
  // ============================================================================

  private getCaller(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    const lines = stack.split('\n');
    const callerLine = lines[4] || '';
    
    const match = callerLine.match(/\((.+):(\d+):(\d+)\)/) || 
                  callerLine.match(/at\s+(.+):(\d+):(\d+)/);
    
    if (match) {
      const [, filePath, lineNumber] = match;
      const cleanPath = filePath.replace(process.cwd() + '/', '');
      return `${cleanPath}:${lineNumber}`;
    }

    return 'unknown';
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta: LogMeta): void {
    if (LOG_LEVELS[level] > this.levelValue) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: message || '',
      ...this.defaultMeta,
      ...meta,
    };

    this.writeToTransports(entry);
  }

  private writeToTransports(entry: LogEntry): void {
    const writePromises: Promise<any>[] = [];

    for (const [name, transport] of this.transports) {
      try {
        if (transport.shouldLog && !transport.shouldLog(entry.level, this.level)) {
          continue;
        }

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

    this.pendingWrites = writePromises;
  }

  // ============================================================================
  // EXISTING METHODS (Unchanged)
  // ============================================================================

  async flush(): Promise<void> {
    if (this.pendingWrites.length > 0) {
      try {
        await Promise.all(this.pendingWrites);
      } catch {
        // Errors already handled in writeToTransports
      }
      this.pendingWrites = [];
    }

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

  async close(): Promise<void> {
    await this.flush();

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

    this.transports.clear();
  }

  getActiveTransports(): string[] {
    return Array.from(this.transports.keys());
  }

  hasTransport(name: string): boolean {
    return this.transports.has(name);
  }

  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.level = level;
    this.levelValue = LOG_LEVELS[level];
  }

  getLevel(): string {
    return this.level;
  }

  isLevelEnabled(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    return LOG_LEVELS[level] <= this.levelValue;
  }

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