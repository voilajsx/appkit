/**
 * Console transport with smart formatting and minimal mode support
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/console.ts
 *
 * @llm-rule WHEN: Need console output for development or production monitoring
 * @llm-rule AVOID: Using console.log directly - this handles levels, colors, and formatting
 * @llm-rule NOTE: Auto-detects production/development mode and adjusts formatting accordingly
 */
/**
 * Console transport with automatic formatting and scope optimization
 */
export class ConsoleTransport {
    /**
     * Creates console transport with direct environment access (like auth pattern)
     * @llm-rule WHEN: Logger initialization - gets config from environment defaults
     * @llm-rule AVOID: Manual configuration - environment detection handles this
     */
    constructor(config) {
        // Direct access to config (like auth module pattern)
        this.colorize = config.console.colorize;
        this.timestamps = config.console.timestamps;
        this.prettyPrint = config.console.prettyPrint;
        this.minimal = config.minimal;
        this.minimalLevelValue = this.getLevelValue('warn'); // Show warnings+ in minimal
    }
    /**
     * Write log entry to console with smart formatting
     * @llm-rule WHEN: Outputting logs to console for development or production
     * @llm-rule AVOID: Calling directly - logger routes entries automatically
     */
    write(entry) {
        try {
            // Filter in minimal mode
            if (this.minimal && !this.shouldShowInMinimal(entry)) {
                return;
            }
            // Format based on mode
            let output;
            if (this.minimal) {
                output = this.formatMinimal(entry);
            }
            else if (this.prettyPrint) {
                output = this.formatPretty(entry);
            }
            else {
                output = this.formatStandard(entry);
            }
            // Apply colors if enabled
            if (this.colorize) {
                output = this.applyColor(output, entry.level);
            }
            // Output to appropriate console method
            this.outputToConsole(output, entry.level);
        }
        catch (error) {
            // Never let logging break the application
            console.error('Console transport error:', error.message);
        }
    }
    /**
     * Check if log should be shown in minimal mode
     * @llm-rule WHEN: Filtering logs for clean development console
     * @llm-rule AVOID: Complex filtering logic - simple level + keyword detection
     */
    shouldShowInMinimal(entry) {
        const levelValue = this.getLevelValue(entry.level);
        // Always show errors and warnings in minimal mode
        if (levelValue <= this.minimalLevelValue) {
            return true;
        }
        // Show important application events
        if (this.isImportantMessage(entry.message, entry)) {
            return true;
        }
        return false;
    }
    /**
     * Check if message is important for minimal mode
     * @llm-rule WHEN: Determining if info/debug messages should show in minimal mode
     * @llm-rule AVOID: Adding too many keywords - keep minimal mode actually minimal
     */
    isImportantMessage(message, entry) {
        const msg = (message || '').toLowerCase();
        // Application lifecycle events
        const lifecycleKeywords = [
            'starting', 'started', 'ready', 'listening', 'shutdown', 'stopped',
            'initializing', 'initialized', 'complete', 'connected', 'disconnected'
        ];
        // VoilaJSX specific startup messages
        const voilaKeywords = [
            '✨', '🚀', '👋', 'voilajs', 'server:', 'api routes:', 'apps directory:'
        ];
        // Critical events that should always show
        const criticalKeywords = [
            'failed', 'error', 'warning', 'authentication', 'security', 'database'
        ];
        // Check message content
        const importantKeywords = [...lifecycleKeywords, ...voilaKeywords, ...criticalKeywords];
        if (importantKeywords.some(keyword => msg.includes(keyword))) {
            return true;
        }
        // Check component for important ones
        const component = entry.component || '';
        const importantComponents = [
            'app-init', 'server-start', 'shutdown', 'auth', 'database', 'bootstrap'
        ];
        if (importantComponents.includes(component)) {
            return true;
        }
        return false;
    }
    /**
     * Format for minimal mode - clean and simple
     * @llm-rule WHEN: Development mode with minimal scope for clean console
     * @llm-rule AVOID: Adding too much detail - defeats purpose of minimal mode
     */
    formatMinimal(entry) {
        const { level, message, component, error } = entry;
        // Special handling for VoilaJSX startup messages
        if (message && (message.includes('✨') || message.includes('🚀') || message.includes('👋'))) {
            return message;
        }
        // Errors and warnings get more detail
        if (level === 'error' || level === 'warn') {
            let formatted = `${this.getLevelLabel(level)} ${message}`;
            if (component) {
                formatted += ` [${component}]`;
            }
            if (error) {
                const errorMsg = typeof error === 'object' ? error.message || error : error;
                formatted += `\n  ${errorMsg}`;
            }
            return formatted;
        }
        // Other messages stay simple
        let formatted = message;
        if (component && !message.includes(component)) {
            formatted += ` [${component}]`;
        }
        return formatted;
    }
    /**
     * Format for pretty development mode - full detail with structure
     * @llm-rule WHEN: Development mode with full scope for debugging
     * @llm-rule AVOID: In production - too verbose for production logs
     */
    formatPretty(entry) {
        const { timestamp, level, message, ...meta } = entry;
        let formatted = '';
        if (this.timestamps) {
            formatted += `${timestamp} `;
        }
        formatted += `${this.getLevelLabel(level)} ${message}`;
        // Add pretty-printed metadata if present
        const metaKeys = Object.keys(meta);
        if (metaKeys.length > 0) {
            formatted += '\n' + JSON.stringify(meta, null, 2);
        }
        return formatted;
    }
    /**
     * Format for standard/production mode - structured but compact
     * @llm-rule WHEN: Production or when structured logs needed
     * @llm-rule AVOID: For development debugging - pretty mode is better
     */
    formatStandard(entry) {
        const { timestamp, level, message, ...meta } = entry;
        let formatted = '';
        if (this.timestamps) {
            formatted += `${timestamp} `;
        }
        formatted += `[${level.toUpperCase()}] ${message}`;
        // Add compact metadata if present
        const metaKeys = Object.keys(meta);
        if (metaKeys.length > 0) {
            formatted += ` ${JSON.stringify(meta)}`;
        }
        return formatted;
    }
    /**
     * Get level label with emoji for pretty output
     * @llm-rule WHEN: Pretty or minimal formatting needs visual level indicators
     * @llm-rule AVOID: In production structured logs - use level text instead
     */
    getLevelLabel(level) {
        const labels = {
            error: '❌ ERROR',
            warn: '⚠️  WARN',
            info: 'ℹ️  INFO',
            debug: '🐛 DEBUG',
        };
        return labels[level] || level.toUpperCase();
    }
    /**
     * Apply ANSI color codes for terminal output
     * @llm-rule WHEN: Development mode or when terminal supports colors
     * @llm-rule AVOID: In CI/CD or when colors not supported
     */
    applyColor(output, level) {
        const colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m', // Yellow
            info: '\x1b[36m', // Cyan
            debug: '\x1b[90m', // Gray
        };
        const reset = '\x1b[0m';
        const color = colors[level] || '';
        return `${color}${output}${reset}`;
    }
    /**
     * Output to appropriate console method based on level
     * @llm-rule WHEN: Final console output step
     * @llm-rule AVOID: Always using console.log - different levels use different methods
     */
    outputToConsole(output, level) {
        switch (level) {
            case 'error':
                console.error(output);
                break;
            case 'warn':
                console.warn(output);
                break;
            case 'debug':
                if (typeof console.debug === 'function') {
                    console.debug(output);
                }
                else {
                    console.log(output);
                }
                break;
            default:
                console.log(output);
        }
    }
    /**
     * Get numeric value for log level comparison
     * @llm-rule WHEN: Comparing log levels for filtering
     * @llm-rule AVOID: String comparison - numeric is more reliable
     */
    getLevelValue(level) {
        const levels = {
            error: 0, warn: 1, info: 2, debug: 3
        };
        return levels[level] || 3;
    }
    /**
     * Check if this transport should log the given level
     * @llm-rule WHEN: Logger asks if transport handles this level
     * @llm-rule AVOID: Complex level logic - simple comparison is sufficient
     */
    shouldLog(level, configLevel) {
        const levels = {
            error: 0, warn: 1, info: 2, debug: 3
        };
        return levels[level] <= levels[configLevel];
    }
    /**
     * Flush pending logs (no-op for console - immediate output)
     * @llm-rule WHEN: Logger cleanup or app shutdown
     * @llm-rule AVOID: Expecting async behavior - console writes immediately
     */
    async flush() {
        // Console transport writes immediately, no buffering
        return Promise.resolve();
    }
    /**
     * Close transport (no-op for console - no resources to cleanup)
     * @llm-rule WHEN: Logger shutdown or transport cleanup
     * @llm-rule AVOID: Expecting cleanup behavior - console has no resources
     */
    async close() {
        // Console transport has no resources to clean up
        return Promise.resolve();
    }
}
