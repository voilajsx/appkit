/**
 * File transport implementation with rotation and retention
 * @extends BaseTransport
 */
export class FileTransport extends BaseTransport {
    dirname: any;
    filename: any;
    maxSize: any;
    retentionDays: any;
    datePattern: any;
    currentSize: number;
    currentDate: string;
    stream: any;
    /**
     * Ensures log directory exists
     * @private
     */
    private ensureDirectoryExists;
    /**
     * Gets current date string for filename
     * @private
     * @returns {string} Formatted date
     */
    private getCurrentDate;
    /**
     * Gets current log filename
     * @private
     * @returns {string} Current log filename
     */
    private getCurrentFilename;
    /**
     * Creates write stream for current log file
     * @private
     */
    private createStream;
    /**
     * Rotates log file if needed
     * @private
     */
    private checkRotation;
    /**
     * Performs date-based rotation
     * @private
     */
    private rotate;
    /**
     * Performs size-based rotation
     * @private
     */
    private rotateSizeBased;
    /**
     * Sets up retention cleanup
     * @private
     */
    private setupRetentionCleanup;
    cleanupInterval: number;
    /**
     * Cleans old log files based on retention policy
     * @private
     */
    private cleanOldLogs;
    /**
     * Flushes any pending writes
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
    /**
     * Closes the transport
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
import { BaseTransport } from './base.js';
