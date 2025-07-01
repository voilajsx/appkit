/**
 * Console transport with smart formatting and minimal mode support
 * @module @voilajsx/appkit/logging
 * @file src/logging/transports/console.ts
 *
 * @llm-rule WHEN: Need console output for development or production monitoring
 * @llm-rule AVOID: Using console.log directly - this handles levels, colors, and formatting
 * @llm-rule NOTE: Auto-detects production/development mode and adjusts formatting accordingly
 */
import type { LogEntry, Transport } from '../logger';
import type { LoggingConfig } from '../defaults';
/**
 * Console transport with automatic formatting and scope optimization
 */
export declare class ConsoleTransport implements Transport {
    private colorize;
    private timestamps;
    private prettyPrint;
    private minimal;
    private minimalLevelValue;
    /**
     * Creates console transport with direct environment access (like auth pattern)
     * @llm-rule WHEN: Logger initialization - gets config from environment defaults
     * @llm-rule AVOID: Manual configuration - environment detection handles this
     */
    constructor(config: LoggingConfig);
    /**
     * Write log entry to console with smart formatting
     * @llm-rule WHEN: Outputting logs to console for development or production
     * @llm-rule AVOID: Calling directly - logger routes entries automatically
     */
    write(entry: LogEntry): void;
    /**
     * Check if log should be shown in minimal mode
     * @llm-rule WHEN: Filtering logs for clean development console
     * @llm-rule AVOID: Complex filtering logic - simple level + keyword detection
     */
    private shouldShowInMinimal;
    /**
     * Check if message is important for minimal mode
     * @llm-rule WHEN: Determining if info/debug messages should show in minimal mode
     * @llm-rule AVOID: Adding too many keywords - keep minimal mode actually minimal
     */
    private isImportantMessage;
    /**
     * Format for minimal mode - clean and simple
     * @llm-rule WHEN: Development mode with minimal scope for clean console
     * @llm-rule AVOID: Adding too much detail - defeats purpose of minimal mode
     */
    private formatMinimal;
    /**
     * Format for pretty development mode - full detail with structure
     * @llm-rule WHEN: Development mode with full scope for debugging
     * @llm-rule AVOID: In production - too verbose for production logs
     */
    private formatPretty;
    /**
     * Format for standard/production mode - structured but compact
     * @llm-rule WHEN: Production or when structured logs needed
     * @llm-rule AVOID: For development debugging - pretty mode is better
     */
    private formatStandard;
    /**
     * Get level label with emoji for pretty output
     * @llm-rule WHEN: Pretty or minimal formatting needs visual level indicators
     * @llm-rule AVOID: In production structured logs - use level text instead
     */
    private getLevelLabel;
    /**
     * Apply ANSI color codes for terminal output
     * @llm-rule WHEN: Development mode or when terminal supports colors
     * @llm-rule AVOID: In CI/CD or when colors not supported
     */
    private applyColor;
    /**
     * Output to appropriate console method based on level
     * @llm-rule WHEN: Final console output step
     * @llm-rule AVOID: Always using console.log - different levels use different methods
     */
    private outputToConsole;
    /**
     * Get numeric value for log level comparison
     * @llm-rule WHEN: Comparing log levels for filtering
     * @llm-rule AVOID: String comparison - numeric is more reliable
     */
    private getLevelValue;
    /**
     * Check if this transport should log the given level
     * @llm-rule WHEN: Logger asks if transport handles this level
     * @llm-rule AVOID: Complex level logic - simple comparison is sufficient
     */
    shouldLog(level: string, configLevel: string): boolean;
    /**
     * Flush pending logs (no-op for console - immediate output)
     * @llm-rule WHEN: Logger cleanup or app shutdown
     * @llm-rule AVOID: Expecting async behavior - console writes immediately
     */
    flush(): Promise<void>;
    /**
     * Close transport (no-op for console - no resources to cleanup)
     * @llm-rule WHEN: Logger shutdown or transport cleanup
     * @llm-rule AVOID: Expecting cleanup behavior - console has no resources
     */
    close(): Promise<void>;
}
