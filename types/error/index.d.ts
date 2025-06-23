export namespace error {
    export { get };
}
/**
 * Get error instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @returns {ErrorClass} Error instance with all methods
 */
declare function get(): ErrorClass;
import { ErrorClass } from './error.js';
export {};
