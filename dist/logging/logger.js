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
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
/**
 * Logger class with automatic transport management and enhanced error() method
 */
export class LoggerClass {
    constructor(config) {
        this.transports = new Map();
        this.pendingWrites = [];
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
    initializeTransports() {
        const { transports } = this.config;
        if (transports.console) {
            this.transports.set('console', new ConsoleTransport(this.config));
        }
        if (transports.file) {
            try {
                this.transports.set('file', new FileTransport(this.config));
            }
            catch (error) {
                console.error('File transport initialization failed:', error.message);
            }
        }
        if (transports.database && this.config.database.url) {
            try {
                this.transports.set('database', new DatabaseTransport(this.config));
            }
            catch (error) {
                console.error('Database transport initialization failed:', error.message);
            }
        }
        if (transports.http && this.config.http.url) {
            try {
                this.transports.set('http', new HttpTransport(this.config));
            }
            catch (error) {
                console.error('HTTP transport initialization failed:', error.message);
            }
        }
        if (transports.webhook && this.config.webhook.url) {
            try {
                this.transports.set('webhook', new WebhookTransport(this.config));
            }
            catch (error) {
                console.error('Webhook transport initialization failed:', error.message);
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
    info(message, meta = {}) {
        this.log('info', message, meta);
    }
    /**
     * Enhanced error logging with automatic visual formatting
     * @llm-rule WHEN: Exceptions, failures, critical issues requiring attention
     * @llm-rule AVOID: Using for warnings - errors should indicate actual problems
     * @llm-rule NOTE: Automatically provides visual formatting in development with smart diagnostics
     */
    error(message, meta = {}) {
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
    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }
    /**
     * Log debug message
     * @llm-rule WHEN: Development debugging, detailed flow information
     * @llm-rule AVOID: Production debug spam - automatically filtered in production
     */
    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }
    /**
     * Create child logger with additional context
     * @llm-rule WHEN: Adding component context or request-specific data
     * @llm-rule AVOID: Creating many child loggers - reuse component loggers
     */
    child(bindings) {
        const child = Object.create(this);
        child.defaultMeta = { ...this.defaultMeta, ...bindings };
        return child;
    }
    // ============================================================================
    // VISUAL ERROR FORMATTING METHODS
    // ============================================================================
    shouldShowVisual() {
        // Show visual output in development or when explicitly enabled
        return this.config.service.environment === 'development' ||
            this.config.minimal === false ||
            process.env.VOILA_VISUAL_ERRORS === 'true';
    }
    renderVisualError(message, meta) {
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
        // Show diagnostics
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
        console.log(`${colors.red}╰─ FIX: ${colors.green}Resolve the issues above and restart${colors.reset}`);
        console.log();
    }
    detectErrorType(message, meta) {
        // Check meta for explicit category
        if (meta.category) {
            return meta.category;
        }
        // Auto-detect from message patterns
        if (message.includes('Cannot find module') || message.includes('import')) {
            return 'import';
        }
        if (message.includes('EADDRINUSE') || message.includes('port') || message.includes('startup')) {
            return 'startup';
        }
        if (message.includes('CONTRACT') || message.includes('contract')) {
            return 'contract';
        }
        if (message.includes('ROUTE') || message.includes('registration')) {
            return 'route';
        }
        return 'general';
    }
    getErrorTitle(errorType) {
        const titles = {
            import: 'IMPORT ERROR',
            startup: 'STARTUP ERROR',
            contract: 'CONTRACT ERROR',
            route: 'ROUTE ERROR',
            filesystem: 'FILE SYSTEM ERROR',
            general: 'ERROR'
        };
        return titles[errorType] || 'ERROR';
    }
    generateDiagnostics(message, meta, errorType) {
        const diagnostics = [];
        // Import error diagnostics
        if (errorType === 'import') {
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
                // Only suggest .js if file actually exists and project might need it
                if (!missingModule.endsWith('.js')) {
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        // Try to find the actual file
                        const basePath = missingModule.replace(/^.*\//, ''); // Get filename
                        const possiblePaths = [
                            missingModule + '.ts',
                            missingModule + '.js',
                            missingModule + '/index.ts',
                            missingModule + '/index.js'
                        ];
                        const existingFile = possiblePaths.find(p => {
                            try {
                                return fs.existsSync(p);
                            }
                            catch {
                                return false;
                            }
                        });
                        if (existingFile && existingFile.endsWith('.ts')) {
                            diagnostics.push({
                                type: 'info',
                                message: 'File exists - try adding .js extension if using ES modules',
                                fix: `Try: ${missingModule}.js`
                            });
                        }
                    }
                    catch {
                        // Fallback to general suggestion if file system check fails
                        diagnostics.push({
                            type: 'info',
                            message: 'Consider .js extension if using ES modules'
                        });
                    }
                }
            }
        }
        // Startup error diagnostics
        if (errorType === 'startup') {
            if (message.includes('EADDRINUSE')) {
                diagnostics.push({
                    type: 'error',
                    message: 'Port already in use',
                    fix: 'Change PORT environment variable or stop conflicting process'
                });
            }
        }
        // Contract error diagnostics
        if (errorType === 'contract') {
            diagnostics.push({
                type: 'error',
                message: 'Contract validation failed',
                fix: 'Run: npm run flux:check to see detailed contract issues'
            });
        }
        // Route error diagnostics
        if (errorType === 'route') {
            if (message.includes('export')) {
                diagnostics.push({
                    type: 'error',
                    message: 'Route file must export a function as default',
                    fix: 'Add: export default router(...)'
                });
            }
            if (message.includes('registration')) {
                diagnostics.push({
                    type: 'error',
                    message: 'Route registration failed',
                    fix: 'Check route syntax and router() usage'
                });
            }
        }
        // File system error diagnostics
        if (message.includes('ENOENT') || message.includes('not found')) {
            diagnostics.push({
                type: 'error',
                message: 'File or directory not found',
                fix: 'Check file path exists and spelling is correct'
            });
        }
        return diagnostics;
    }
    getSolutions(errorType, message) {
        const solutionMap = {
            import: [
                'Check import paths and file names',
                'Verify the file exists',
                'Use .js extensions in TypeScript imports'
            ],
            startup: [
                'Check environment variables',
                'Verify port is available',
                'Review server configuration'
            ],
            contract: [
                'Add missing contracts: createBackendContract().build()',
                'Declare all routes and services',
                'Run: npm run flux:check for details'
            ],
            route: [
                'Check route file syntax',
                'Ensure proper export default',
                'Verify router() usage'
            ],
            general: [
                'Check the error details above',
                'Review recent code changes',
                'Consult documentation'
            ]
        };
        return solutionMap[errorType] || solutionMap.general;
    }
    // ============================================================================
    // EXISTING HELPER METHODS
    // ============================================================================
    getCaller() {
        const stack = new Error().stack;
        if (!stack)
            return 'unknown';
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
    log(level, message, meta) {
        if (LOG_LEVELS[level] > this.levelValue) {
            return;
        }
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message: message || '',
            ...this.defaultMeta,
            ...meta,
        };
        this.writeToTransports(entry);
    }
    writeToTransports(entry) {
        const writePromises = [];
        for (const [name, transport] of this.transports) {
            try {
                if (transport.shouldLog && !transport.shouldLog(entry.level, this.level)) {
                    continue;
                }
                const result = transport.write(entry);
                if (result && typeof result.then === 'function') {
                    writePromises.push(result.catch((error) => {
                        console.error(`Transport ${name} write failed:`, error.message);
                    }));
                }
            }
            catch (error) {
                console.error(`Transport ${name} write error:`, error.message);
            }
        }
        this.pendingWrites = writePromises;
    }
    // ============================================================================
    // EXISTING METHODS (Unchanged)
    // ============================================================================
    async flush() {
        if (this.pendingWrites.length > 0) {
            try {
                await Promise.all(this.pendingWrites);
            }
            catch {
                // Errors already handled in writeToTransports
            }
            this.pendingWrites = [];
        }
        const flushPromises = [];
        for (const [name, transport] of this.transports) {
            if (transport.flush) {
                try {
                    const result = transport.flush();
                    if (result) {
                        flushPromises.push(result.catch((error) => {
                            console.error(`Transport ${name} flush failed:`, error.message);
                        }));
                    }
                }
                catch (error) {
                    console.error(`Transport ${name} flush error:`, error.message);
                }
            }
        }
        if (flushPromises.length > 0) {
            await Promise.all(flushPromises);
        }
    }
    async close() {
        await this.flush();
        const closePromises = [];
        for (const [name, transport] of this.transports) {
            if (transport.close) {
                try {
                    const result = transport.close();
                    if (result) {
                        closePromises.push(result.catch((error) => {
                            console.error(`Transport ${name} close failed:`, error.message);
                        }));
                    }
                }
                catch (error) {
                    console.error(`Transport ${name} close error:`, error.message);
                }
            }
        }
        if (closePromises.length > 0) {
            await Promise.all(closePromises);
        }
        this.transports.clear();
    }
    getActiveTransports() {
        return Array.from(this.transports.keys());
    }
    hasTransport(name) {
        return this.transports.has(name);
    }
    setLevel(level) {
        this.level = level;
        this.levelValue = LOG_LEVELS[level];
    }
    getLevel() {
        return this.level;
    }
    isLevelEnabled(level) {
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
