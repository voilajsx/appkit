export namespace authenticator {
    export { get };
}
/**
 * Get authentication instance - the only function you need to learn
 * Environment variables parsed once for performance
 * @param {object} [overrides] - Optional configuration overrides
 * @returns {AuthenticationClass} Authentication instance with all methods
 */
declare function get(overrides?: object): AuthenticationClass;
import { AuthenticationClass } from './authentication.js';
export {};
