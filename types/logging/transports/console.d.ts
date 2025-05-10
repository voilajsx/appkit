/**
 * Console transport implementation
 * @extends BaseTransport
 */
export class ConsoleTransport extends BaseTransport {
    colorize: boolean;
    prettyPrint: any;
    /**
     * Pretty format for development
     * @param {Object} entry - Log entry
     * @returns {string} Formatted entry
     */
    prettyFormat(entry: any): string;
    /**
     * Apply color to output
     * @param {string} output - Output string
     * @param {string} level - Log level
     * @returns {string} Colored output
     */
    applyColor(output: string, level: string): string;
    /**
     * Get level label with emoji
     * @param {string} level - Log level
     * @returns {string} Level label
     */
    getLevelLabel(level: string): string;
}
import { BaseTransport } from './base.js';
