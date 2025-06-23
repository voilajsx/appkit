export namespace security {
    export { get };
}
/**
 * Get security instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @param {object} [overrides] - Optional configuration overrides
 * @returns {SecurityClass} Security instance with all methods
 */
declare function get(overrides?: object): SecurityClass;
import { SecurityClass } from './security.js';
export {};
