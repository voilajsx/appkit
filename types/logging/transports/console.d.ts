/**
 * Console transport with scope-based minimal mode and inline formatting
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/console.js
 */
/**
 * Console transport class with built-in formatting and scope-aware minimal mode
 */
export class ConsoleTransport {
    /**
     * Creates a new Console transport
     * @param {object} [config={}] - Console transport configuration
     */
    constructor(config?: object);
    config: any;
    minimalLevelValue: number;
    /**
     * Get numeric value for log level
     * @param {string} level - Log level
     * @returns {number} Numeric level value
     */
    getLevelValue(level: string): number;
    /**
     * Check if log should be shown in minimal mode
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {object} meta - Log metadata
     * @returns {boolean} True if should be shown
     */
    shouldShowInMinimal(level: string, message: string, meta: object): boolean;
    /**
     * Check if message is considered important for minimal mode
     * @param {string} message - Log message
     * @param {object} meta - Log metadata
     * @returns {boolean} True if important
     */
    isImportantMessage(message: string, meta: object): boolean;
    /**
     * Writes log entry to console
     * @param {object} entry - Log entry object
     */
    write(entry: object): void;
    /**
     * Minimal format for clean development console
     * @param {object} entry - Log entry
     * @returns {string} Formatted entry
     */
    minimalFormat(entry: object): string;
    /**
     * Standard format for production logs
     * @param {object} entry - Log entry
     * @returns {string} Formatted entry
     */
    standardFormat(entry: object): string;
    /**
     * Pretty format for development (full scope)
     * @param {object} entry - Log entry
     * @returns {string} Formatted entry
     */
    prettyFormat(entry: object): string;
    /**
     * Get level label with emoji for pretty printing
     * @param {string} level - Log level
     * @returns {string} Level label with emoji
     */
    getLevelLabel(level: string): string;
    /**
     * Apply ANSI color codes to output
     * @param {string} output - Output string
     * @param {string} level - Log level
     * @returns {string} Colored output
     */
    applyColor(output: string, level: string): string;
    /**
     * Output to appropriate console method based on level
     * @param {string} output - Formatted output
     * @param {string} level - Log level
     */
    outputToConsole(output: string, level: string): void;
    /**
     * Check if this transport can handle the given log level
     * @param {string} level - Log level to check
     * @param {string} configLevel - Configured minimum level
     * @returns {boolean} True if level should be logged
     */
    shouldLog(level: string, configLevel: string): boolean;
    /**
     * Close the transport (no-op for console)
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Flush pending logs (no-op for console)
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
}
