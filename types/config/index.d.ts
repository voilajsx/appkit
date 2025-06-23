export namespace configure {
    export { get };
    export { clearCache };
}
/**
 * Gets the singleton configuration instance.
 * Environment variables are parsed only once on the first call.
 *
 * @returns {ConfigClass} The application's configuration instance.
 */
declare function get(): ConfigClass;
/**
 * Clears the cached configuration instance.
 * Primarily used for testing purposes to allow for a fresh configuration load.
 */
declare function clearCache(): void;
import { ConfigClass } from './config.js';
export {};
